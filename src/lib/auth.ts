import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "gsp_session";
const SESSION_DURATION_DAYS = 7;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getSessionExpiry() {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);
  return expires;
}

export async function createSession(userId: string) {
  const rawToken = randomBytes(32).toString("base64url");
  const sessionToken = hashSessionToken(rawToken);
  const expires = getSessionExpiry();

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  const cookieStore = await cookies();
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

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      sessionToken: hashSessionToken(rawToken),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!session || session.expires <= new Date() || session.user.status !== "ACTIVE") {
    await destroySession();
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/admin/access-denied");
  }

  return user;
}

function safeCustomerReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/admin")) {
    return "/account";
  }

  return value;
}

export async function requireCustomer(returnTo = "/account") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeCustomerReturnPath(returnTo))}`);
  }

  if (user.role !== "CUSTOMER" && user.role !== "ADMIN") {
    redirect("/login?error=forbidden");
  }

  return user;
}

export async function isAdminRequest() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}
