import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const RECOVERY_ACCESS_COOKIE = "a1_recovery_access";
export const RECOVERY_REFRESH_COOKIE = "a1_recovery_refresh";
const RECOVERY_COOKIE_MAX_AGE_SECONDS = 30 * 60;

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl || supabaseUrl.includes("example.supabase.co")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for Supabase Auth.");
  }

  return supabaseUrl.replace(/\/$/, "");
}

function getSupabasePublishableKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key || key.includes("replace-with")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for Supabase Auth.");
  }

  return key;
}

function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key || key.includes("replace-with")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side Supabase Auth operations.");
  }

  return key;
}

export function createSupabaseAuthClient() {
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function ensureSupabaseAuthUser(input: { email: string; name?: string | null; password: string; phone?: string | null }) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name: input.name ?? undefined,
      phone: input.phone ?? undefined,
    },
  });

  if (!error) {
    return;
  }

  const message = error.message.toLowerCase();
  const isExistingUser = error.status === 422 || message.includes("already") || message.includes("exists") || message.includes("registered");

  if (!isExistingUser) {
    throw error;
  }
}

export async function setSupabaseRecoveryCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    maxAge: RECOVERY_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  cookieStore.set(RECOVERY_ACCESS_COOKIE, accessToken, cookieOptions);
  cookieStore.set(RECOVERY_REFRESH_COOKIE, refreshToken, cookieOptions);
}

export async function clearSupabaseRecoveryCookies() {
  const cookieStore = await cookies();

  cookieStore.set(RECOVERY_ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
  cookieStore.set(RECOVERY_REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function getSupabaseRecoveryTokens() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(RECOVERY_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(RECOVERY_REFRESH_COOKIE)?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function getSupabaseRecoveryUser() {
  const tokens = await getSupabaseRecoveryTokens();

  if (!tokens) {
    return null;
  }

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(tokens.accessToken);

  if (error || !data.user?.email) {
    return null;
  }

  return data.user;
}
