"use client";

import { AdminErrorState } from "@/components/admin/admin-states";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  console.error(error);

  return (
    <section className="min-h-[calc(100vh-73px)] border-t border-border bg-surface-muted px-4 py-6 sm:px-6 lg:px-8">
      <AdminErrorState
        description="The admin area hit an unexpected error. No changes were made."
        onRetry={reset}
      />
    </section>
  );
}
