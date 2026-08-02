import { loadLocalEnv } from "./load-local-env";

loadLocalEnv();

async function main() {
  const [
    { prisma },
    { hashPassword, isStrongSeedPassword },
    { createScriptSupabaseAdminClient, ensureScriptAuthUser },
  ] = await Promise.all([
    import("../src/lib/prisma"),
    import("../src/lib/password"),
    import("./supabase-admin"),
  ]);
  const email = process.env.TEST_CUSTOMER_EMAIL?.trim().toLowerCase();
  const password = process.env.TEST_CUSTOMER_PASSWORD ?? "";
  const name = process.env.TEST_CUSTOMER_NAME?.trim() || "Test Customer";

  if (!email || !password) {
    throw new Error("Set TEST_CUSTOMER_EMAIL and TEST_CUSTOMER_PASSWORD before running this command.");
  }

  if (!isStrongSeedPassword(password)) {
    throw new Error(
      "TEST_CUSTOMER_PASSWORD must be at least 12 characters and include uppercase, lowercase, number, and symbol characters.",
    );
  }

  const passwordHash = await hashPassword(password);
  const supabaseUser = await ensureScriptAuthUser({
    email,
    name,
    password,
  });
  const admin = createScriptSupabaseAdminClient();
  const { error: authPasswordError } = await admin.auth.admin.updateUserById(
    supabaseUser.id,
    { password },
  );

  if (authPasswordError) {
    throw new Error("The Supabase test credential could not be synchronised.");
  }

  await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name,
      authMethod: "PASSWORD",
      passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
      supabaseAuthUserId: supabaseUser.id,
    },
    create: {
      email,
      name,
      authMethod: "PASSWORD",
      passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
      supabaseAuthUserId: supabaseUser.id,
    },
  });

  console.log(`Customer test user is ready: ${email}`);
  await prisma.$disconnect();
}

main()
  .then(() => undefined)
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
