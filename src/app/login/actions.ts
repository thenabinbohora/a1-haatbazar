"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { ensureSupabaseAuthUser } from "@/lib/supabase-auth-server";
import { customerLoginSchema, customerRegisterSchema } from "@/lib/validation/customer";

function safeNext(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/admin")) {
    return "/account";
  }

  return value;
}

export async function customerLoginAction(formData: FormData) {
  const parsed = customerLoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? ""),
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true, status: true, passwordHash: true },
  });
  const isValidPassword = await verifyPassword(parsed.data.password, user?.passwordHash);

  if (!user || !isValidPassword || user.status !== "ACTIVE" || user.role !== "CUSTOMER") {
    redirect("/login?error=invalid");
  }

  await createSession(user.id);
  redirect(safeNext(parsed.data.next));
}

export async function customerRegisterAction(formData: FormData) {
  const parsed = customerRegisterSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? ""),
  });

  if (!parsed.success) {
    redirect("/login?mode=register&error=validation");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    redirect("/login?mode=register&error=exists");
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
      redirect("/login?mode=register&error=exists");
    }

    redirect("/login?mode=register&error=failed");
  }

  redirect(safeNext(parsed.data.next));
}

export async function customerLogoutAction() {
  await destroySession();
  redirect("/login?success=logout");
}
