import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value || value.includes("example.supabase.co")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for Supabase Auth.");
  }

  return value.replace(/\/$/, "");
}

function getServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value || value.includes("replace-with")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for Supabase Auth maintenance.");
  }

  return value;
}

export function createScriptSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function findScriptAuthUserByEmail(email: string) {
  const admin = createScriptSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });

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

export async function ensureScriptAuthUser(input: {
  email: string;
  name?: string | null;
  password: string;
  phone?: string | null;
}) {
  const admin = createScriptSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
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
  const isExistingUser =
    error.status === 422 ||
    message.includes("already") ||
    message.includes("exists") ||
    message.includes("registered");

  if (!isExistingUser) {
    throw error;
  }

  const existingUser = await findScriptAuthUserByEmail(input.email);

  if (!existingUser) {
    throw error;
  }

  return existingUser;
}
