import { randomBytes } from "node:crypto";
import { loadLocalEnv } from "./load-local-env";

loadLocalEnv();

async function main() {
  const [{ prisma }, { ensureSupabaseAuthUser }] = await Promise.all([
    import("@/lib/prisma"),
    import("@/lib/supabase-auth-server"),
  ]);

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    select: {
      email: true,
      name: true,
      phone: true,
    },
  });

  let synced = 0;

  for (const customer of customers) {
    await ensureSupabaseAuthUser({
      email: customer.email,
      name: customer.name,
      password: randomBytes(32).toString("base64url"),
      phone: customer.phone,
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
