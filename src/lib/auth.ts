import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { CustomerAuthMethod, UserRole } from "@prisma/client";
import { cache } from "react";
import { recordAdminAuthEvent } from "@/lib/admin-auth-audit";
import { prisma } from "@/lib/prisma";
import { safeInternalReturnPath } from "@/lib/safe-return-path";

export const SESSION_COOKIE_NAME = "gsp_session";
const SESSION_DURATION_DAYS = 7;
const ADMIN_SESSION_DURATION_HOURS = 12;

export type AuthUser = {
  authMethod: CustomerAuthMethod | null;
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  supabaseAuthUserId: string | null;
};

export type CurrentAuthState = {
  sessionId: string | null;
  status: "anonymous" | "authenticated" | "expired" | "invalid";
  user: AuthUser | null;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getSessionExpiry(durationHours = SESSION_DURATION_DAYS * 24) {
  const expires = new Date();
  expires.setHours(expires.getHours() + durationHours);
  return expires;
}

export async function createSession(
  userId: string,
  options: { administrator?: boolean } = {},
) {
  const rawToken = randomBytes(32).toString("base64url");
  const sessionToken = hashSessionToken(rawToken);
  const expires = getSessionExpiry(
    options.administrator
      ? ADMIN_SESSION_DURATION_HOURS
      : SESSION_DURATION_DAYS * 24,
  );
  const cookieStore = await cookies();
  const previousRawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  await prisma.$transaction(async (tx) => {
    if (previousRawToken) {
      await tx.session.deleteMany({
        where: {
          sessionToken: hashSessionToken(previousRawToken),
        },
      });
    }

    await tx.session.create({
      data: {
        sessionToken,
        userId,
        expires,
      },
    });
  });

  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    await prisma.session.deleteMany({
      where: {
        sessionToken: hashSessionToken(rawToken),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

const getCurrentAuthState = cache(async (): Promise<CurrentAuthState> => {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return {
      sessionId: null,
      status: "anonymous",
      user: null,
    };
  }

  const session = await prisma.session.findUnique({
    where: {
      sessionToken: hashSessionToken(rawToken),
    },
    include: {
      user: {
        select: {
          id: true,
          authMethod: true,
          email: true,
          name: true,
          role: true,
          status: true,
          supabaseAuthUserId: true,
        },
      },
    },
  });

  const isExpired = Boolean(session && session.expires <= new Date());

  if (!session || isExpired || session.user.status !== "ACTIVE") {
    if (session?.user.role === "ADMIN") {
      recordAdminAuthEvent({
        event: "session_revoked",
        userId: session.user.id,
      });
    }

    if (session) {
      await prisma.session.deleteMany({
        where: {
          id: session.id,
        },
      });
    }

    return {
      sessionId: null,
      status: isExpired ? "expired" : "invalid",
      user: null,
    };
  }

  return {
    sessionId: session.id,
    status: "authenticated",
    user: {
      authMethod: session.user.authMethod,
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      supabaseAuthUserId: session.user.supabaseAuthUserId,
    },
  };
});

export async function getCurrentAuthContext(): Promise<CurrentAuthState> {
  return getCurrentAuthState();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return (await getCurrentAuthState()).user;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function destroyOtherSessions(userId: string, currentSessionId: string) {
  return prisma.session.deleteMany({
    where: {
      id: { not: currentSessionId },
      userId,
    },
  });
}

export async function requireAdmin() {
  const authState = await getCurrentAuthState();
  const user = authState.user;

  if (!user) {
    redirect(
      authState.status === "expired"
        ? "/admin/session-expired"
        : "/admin/login",
    );
  }

  if (user.role !== "ADMIN") {
    recordAdminAuthEvent({
      event: "access_denied",
      reason: "role",
      userId: user.id,
    });
    redirect("/admin/access-denied");
  }

  return user;
}

export async function requireCustomer(returnTo = "/account") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeInternalReturnPath(returnTo))}`);
  }

  if (user.role !== "CUSTOMER") {
    redirect("/admin");
  }

  return user;
}

export async function isAdminRequest() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}
