"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { ensureSupabaseAuthUser } from "@/lib/supabase-auth-server";
import { customerLoginSchema, customerRegisterSchema } from "@/lib/validation/customer";

function safeNext(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/admin")) {
    return "/account";
  }

  return value;
}

function failedAuthPath(error: string, next: string, mode?: "register") {
  const params = new URLSearchParams({ error, next: safeNext(next) });

  if (mode) {
    params.set("mode", mode);
  }

  return `/login?${params.toString()}`;
}

export async function customerLoginAction(formData: FormData) {
  const next = String(formData.get("next") ?? "");
  const parsed = customerLoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next,
  });

  if (!parsed.success) {
    redirect(failedAuthPath("invalid", next));
  }

  const clientIp = await getClientIp();

  if (isRateLimited("customer-login", `${clientIp}:${parsed.data.email}`)) {
    redirect(failedAuthPath("rate-limited", parsed.data.next ?? ""));
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true, status: true, passwordHash: true },
  });
  const isValidPassword = await verifyPassword(parsed.data.password, user?.passwordHash);

  if (!user || !isValidPassword || user.status !== "ACTIVE" || user.role !== "CUSTOMER") {
    redirect(failedAuthPath("invalid", parsed.data.next ?? ""));
  }

  await createSession(user.id);
  redirect(safeNext(parsed.data.next));
}

export async function customerRegisterAction(formData: FormData) {
  const next = String(formData.get("next") ?? "");
  const parsed = customerRegisterSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
    next,
  });

  if (!parsed.success) {
    redirect(failedAuthPath("validation", next, "register"));
  }

  if (isRateLimited("customer-register", await getClientIp())) {
    redirect(failedAuthPath("rate-limited", parsed.data.next ?? "", "register"));
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    redirect(failedAuthPath("exists", parsed.data.next ?? "", "register"));
  }

  try {
    await ensureSupabaseAuthUser({
      email: parsed.data.email,
      name: parsed.data.name,
      password: parsed.data.password,
      phone: parsed.data.phone,
    });

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        passwordHash: await hashPassword(parsed.data.password),
        role: "CUSTOMER",
        status: "ACTIVE",
      },
      select: { id: true },
    });

    await createSession(user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(failedAuthPath("exists", parsed.data.next ?? "", "register"));
    }

    redirect(failedAuthPath("failed", parsed.data.next ?? "", "register"));
  }

  redirect(safeNext(parsed.data.next));
}

export async function customerLogoutAction() {
  await destroySession();
  redirect("/login?success=logout");
}
