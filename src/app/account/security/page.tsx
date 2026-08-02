import type { Metadata } from "next";
import { AccountSecurityPanel } from "@/components/account/account-security-panel";
import { CustomerAccountShell } from "@/components/account/customer-account-shell";
import { requireCustomer } from "@/lib/auth";
import { getSupabaseAuthIdentity } from "@/lib/supabase-auth-server";

export const metadata: Metadata = {
  title: "Account security",
  description: "Manage customer account password and privacy controls.",
  robots: { index: false },
};

export default async function AccountSecurityPage() {
  const user = await requireCustomer("/account/security");
  const identity = await getSupabaseAuthIdentity({
    email: user.email,
    supabaseAuthUserId: user.supabaseAuthUserId,
  }).catch(() => null);
  const providerNames = (identity?.providers ?? ["email"]).map((provider) =>
    provider === "email"
      ? "email"
      : provider.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  );

  return (
    <CustomerAccountShell
      description="Manage your password, current session and privacy controls."
      title="Security & privacy"
      user={user}
    >
      <AccountSecurityPanel
        hasPassword={user.authMethod === "PASSWORD"}
        providerNames={providerNames}
      />
    </CustomerAccountShell>
  );
}
