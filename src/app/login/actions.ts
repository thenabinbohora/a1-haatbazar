"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import type { CustomerAuthActionState } from "@/lib/customer-auth-state";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { safeInternalReturnPath } from "@/lib/safe-return-path";
import { absoluteUrl } from "@/lib/site";
import {
  createSupabaseRecoveryPkceClient,
  ensureSupabaseAuthUser,
} from "@/lib/supabase-auth-server";
import { customerLoginSchema, customerRegisterSchema } from "@/lib/validation/customer";

function errorState(
  message: string,
  options: Omit<CustomerAuthActionState, "message" | "status"> = {},
): CustomerAuthActionState {
  return {
    ...options,
    message,
    status: "error",
  };
}

export async function customerLoginAction(
  _previousState: CustomerAuthActionState,
  formData: FormData,
): Promise<CustomerAuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeInternalReturnPath(formData.get("next"));
  const parsed = customerLoginSchema.safeParse({
    email,
    password,
    next,
  });

  if (!parsed.success) {
    const fieldErrors: CustomerAuthActionState["fieldErrors"] = {};

    if (!email || parsed.error.issues.some((issue) => issue.path[0] === "email")) {
      fieldErrors.email = email
        ? "Enter a valid email address."
        : "Enter your email address.";
    }

    if (!password) {
      fieldErrors.password = "Enter your password.";
    }

    return errorState("Check the highlighted fields and try again.", {
      fieldErrors,
      values: { email },
    });
  }

  const clientIp = await getClientIp();

  if (isRateLimited("customer-login", `${clientIp}:${parsed.data.email}`)) {
    return errorState("Too many attempts. Please wait a minute and try again.", {
      values: { email: parsed.data.email },
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true, status: true, passwordHash: true },
  });
  const isValidPassword = await verifyPassword(parsed.data.password, user?.passwordHash);

  if (!user || !isValidPassword || user.status !== "ACTIVE" || user.role !== "CUSTOMER") {
    return errorState("The email or password was not recognised.", {
      values: { email: parsed.data.email },
    });
  }

  await createSession(user.id);
  redirect(safeInternalReturnPath(parsed.data.next));
}

export async function customerRegisterAction(
  _previousState: CustomerAuthActionState,
  formData: FormData,
): Promise<CustomerAuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeInternalReturnPath(formData.get("next"));
  const parsed = customerRegisterSchema.safeParse({
    name,
    email,
    phone: "",
    password,
    next,
  });

  if (!parsed.success) {
    const fieldErrors: CustomerAuthActionState["fieldErrors"] = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (
        (field === "name" || field === "email" || field === "password")
        && !fieldErrors[field]
      ) {
        fieldErrors[field] =
          field === "email" && !email
            ? "Enter your email address."
            : issue.message;
      }
    }

    return errorState("Check the highlighted fields and try again.", {
      fieldErrors,
      values: { email, name },
    });
  }

  if (isRateLimited("customer-register", await getClientIp())) {
    return errorState("Too many attempts. Please wait a minute and try again.", {
      values: { email: parsed.data.email, name: parsed.data.name },
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return errorState("We could not create your account right now. Try again shortly or contact the store team.", {
      values: { email: parsed.data.email, name: parsed.data.name },
    });
  }

  try {
    const supabaseUser = await ensureSupabaseAuthUser({
      email: parsed.data.email,
      name: parsed.data.name,
      password: parsed.data.password,
    });

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        authMethod: "PASSWORD",
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        passwordHash: await hashPassword(parsed.data.password),
        role: "CUSTOMER",
        status: "ACTIVE",
        supabaseAuthUserId: supabaseUser.id,
      },
      select: { id: true },
    });

    await createSession(user.id);
  } catch (error) {
    const isDuplicate =
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === "P2002";

    return errorState(
      isDuplicate
        ? "We could not create your account right now. Try signing in or resetting your password."
        : "We could not create your account right now. Please try again shortly.",
      {
        values: { email: parsed.data.email, name: parsed.data.name },
      },
    );
  }

  redirect(safeInternalReturnPath(parsed.data.next));
}

export async function requestCustomerPasswordResetAction(
  _previousState: CustomerAuthActionState,
  formData: FormData,
): Promise<CustomerAuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = customerLoginSchema.shape.email.safeParse(email);

  if (!parsed.success) {
    return errorState(
      email ? "Enter a valid email address." : "Enter your email address.",
      {
        fieldErrors: {
          email: email
            ? "Enter a valid email address."
            : "Enter your email address.",
        },
        values: { email },
      },
    );
  }

  const clientIp = await getClientIp();

  if (isRateLimited("customer-password-reset", `${clientIp}:${parsed.data}`)) {
    return errorState("Too many reset requests. Please wait a minute and try again.", {
      values: { email: parsed.data },
    });
  }

  try {
    const supabase = await createSupabaseRecoveryPkceClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: absoluteUrl("/auth/callback?next=/reset-password"),
    });

    if (error) {
      return errorState("We could not send reset instructions right now. Please try again shortly.", {
        values: { email: parsed.data },
      });
    }
  } catch {
    return errorState("We could not send reset instructions right now. Please try again shortly.", {
      values: { email: parsed.data },
    });
  }

  return {
    message: "If an account is eligible, password-reset instructions have been sent.",
    status: "success",
    values: { email: parsed.data },
  };
}

export async function customerLogoutAction() {
  await destroySession();
  redirect("/login?success=logout");
}
