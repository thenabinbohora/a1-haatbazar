import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { safeAdminReturnPath } from "@/lib/admin-return-path";
import { getCurrentUser } from "@/lib/auth";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    status?: string;
  }>;
};

export const metadata: Metadata = {
  description: "Authorised administrator access for A1 Haat Bazar.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Admin sign in",
};

function getStatusNotice(status?: string) {
  if (status === "session-expired") {
    return "Your admin session has expired. Sign in again to continue securely.";
  }

  return undefined;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const next = safeAdminReturnPath(params?.next);
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") {
    redirect(next);
  }

  return (
    <AdminAuthShell>
      <AdminLoginForm
        next={next}
        notice={getStatusNotice(params?.status)}
      />
    </AdminAuthShell>
  );
}
