import "server-only";

import { cookies } from "next/headers";
import { createClient, type User } from "@supabase/supabase-js";

export const RECOVERY_ACCESS_COOKIE = "a1_recovery_access";
export const RECOVERY_REFRESH_COOKIE = "a1_recovery_refresh";
export const RECOVERY_PKCE_COOKIE = "a1_recovery_pkce";
const RECOVERY_COOKIE_MAX_AGE_SECONDS = 30 * 60;
const RECOVERY_PKCE_STORAGE_KEY = "a1-recovery";
const RECOVERY_PKCE_VERIFIER_KEY = `${RECOVERY_PKCE_STORAGE_KEY}-code-verifier`;

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

function getSupabaseServerVerificationKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    getSupabaseServiceRoleKey()
  );
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

/** An isolated server-only client that never persists a verification session. */
export function createSupabaseIdentityVerificationClient() {
  return createClient(getSupabaseUrl(), getSupabaseServerVerificationKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

/**
 * Uses a short-lived, HTTP-only cookie solely for Supabase's PKCE verifier.
 * The recovery request and callback can therefore complete on the server
 * without exposing the verifier or persisting a Supabase customer session.
 */
export async function createSupabaseRecoveryPkceClient() {
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    maxAge: RECOVERY_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "pkce",
      persistSession: true,
      storageKey: RECOVERY_PKCE_STORAGE_KEY,
      storage: {
        getItem(key) {
          return key === RECOVERY_PKCE_VERIFIER_KEY
            ? (cookieStore.get(RECOVERY_PKCE_COOKIE)?.value ?? null)
            : null;
        },
        removeItem(key) {
          if (key === RECOVERY_PKCE_VERIFIER_KEY) {
            cookieStore.set(RECOVERY_PKCE_COOKIE, "", {
              ...cookieOptions,
              maxAge: 0,
            });
          }
        },
        setItem(key, value) {
          if (key === RECOVERY_PKCE_VERIFIER_KEY) {
            cookieStore.set(RECOVERY_PKCE_COOKIE, value, cookieOptions);
          }
        },
      },
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

export async function findSupabaseAuthUserByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail,
    );

    if (match) {
      return match;
    }

    if (data.users.length < 100) {
      break;
    }
  }

  return null;
}

export function supabaseUserProviders(user: User) {
  const appProviders = Array.isArray(user.app_metadata.providers)
    ? user.app_metadata.providers.filter(
        (provider): provider is string => typeof provider === "string",
      )
    : [];
  const identityProviders = (user.identities ?? [])
    .map((identity) => identity.provider)
    .filter((provider): provider is string => Boolean(provider));

  return [...new Set([...appProviders, ...identityProviders])];
}

export async function getSupabaseAuthIdentity(input: {
  email: string;
  supabaseAuthUserId?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  let authUser: User | null = null;

  if (input.supabaseAuthUserId) {
    const { data, error } = await admin.auth.admin.getUserById(
      input.supabaseAuthUserId,
    );

    if (!error) {
      authUser = data.user;
    }
  }

  authUser ??= await findSupabaseAuthUserByEmail(input.email);

  if (!authUser) {
    return null;
  }

  const providers = supabaseUserProviders(authUser);
  return {
    hasPassword: providers.includes("email"),
    id: authUser.id,
    providers,
  };
}

export async function ensureSupabaseAuthUser(input: {
  email: string;
  name?: string | null;
  password: string;
  phone?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name: input.name ?? undefined,
      phone: input.phone ?? undefined,
    },
  });

  if (!error) {
    return data.user;
  }

  const message = error.message.toLowerCase();
  const isExistingUser = error.status === 422 || message.includes("already") || message.includes("exists") || message.includes("registered");

  if (!isExistingUser) {
    throw error;
  }

  const existingUser = await findSupabaseAuthUserByEmail(input.email);

  if (!existingUser) {
    throw error;
  }

  return existingUser;
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
  cookieStore.set(RECOVERY_PKCE_COOKIE, "", { maxAge: 0, path: "/" });
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
