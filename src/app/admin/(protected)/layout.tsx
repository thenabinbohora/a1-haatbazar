import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminShellSummary } from "@/lib/admin/dashboard-data";
import { requireAdmin } from "@/lib/auth";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAdmin();
  const summary = await getAdminShellSummary();

  return (
    <AdminShell summary={summary} user={user}>
      {children}
    </AdminShell>
  );
}
