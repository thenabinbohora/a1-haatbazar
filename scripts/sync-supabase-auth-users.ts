import { randomBytes } from "node:crypto";
import { loadLocalEnv } from "./load-local-env";

loadLocalEnv();

async function main() {
  const [{ prisma }, { ensureScriptAuthUser }] = await Promise.all([
    import("@/lib/prisma"),
    import("./supabase-admin"),
  ]);

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      authMethod: true,
      email: true,
      name: true,
      passwordHash: true,
      phone: true,
    },
  });

  let synced = 0;

  for (const customer of customers) {
    const authUser = await ensureScriptAuthUser({
      email: customer.email,
      name: customer.name,
      password: randomBytes(32).toString("base64url"),
      phone: customer.phone,
    });
    await prisma.user.update({
      data: {
        authMethod:
          customer.authMethod ??
          (customer.passwordHash ? "PASSWORD" : "EMAIL_OTP"),
        supabaseAuthUserId: authUser.id,
      },
      where: { id: customer.id },
    });
    synced += 1;
  }

  console.log(`Supabase Auth customer sync complete. Processed ${synced} customer account(s).`);
  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Supabase Auth customer sync failed.");
    process.exitCode = 1;
  });
