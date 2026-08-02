"use server";

import { redirect } from "next/navigation";
import { createSupabaseAuthClient, clearSupabaseRecoveryCookies, getSupabaseRecoveryTokens } from "@/lib/supabase-auth-server";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function resetCustomerPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    redirect("/reset-password?error=short");
  }

  if (password !== confirmPassword) {
    redirect("/reset-password?error=mismatch");
  }

  const tokens = await getSupabaseRecoveryTokens();

  if (!tokens) {
    redirect("/reset-password?error=invalid");
  }

  const supabase = createSupabaseAuthClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  if (sessionError) {
    await clearSupabaseRecoveryCookies();
    redirect("/reset-password?error=invalid");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const email = userData.user?.email?.trim().toLowerCase();

  if (userError || !email) {
    await clearSupabaseRecoveryCookies();
    redirect("/reset-password?error=invalid");
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    redirect("/reset-password?error=failed");
  }

  const result = await prisma.user.updateMany({
    where: {
      email,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    data: {
      authMethod: "PASSWORD",
      passwordHash: await hashPassword(password),
      supabaseAuthUserId: userData.user.id,
    },
  });

  await clearSupabaseRecoveryCookies();

  if (result.count === 0) {
    redirect("/reset-password?error=invalid");
  }

  redirect("/login?success=password-updated");
}
