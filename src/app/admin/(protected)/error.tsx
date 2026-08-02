"use client";

import { AdminErrorState } from "@/components/admin/admin-states";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ reset }: AdminErrorProps) {
  return (
    <section className="mx-auto max-w-3xl py-10">
      <AdminErrorState
        description="The admin area hit an unexpected error. No changes were made."
        onRetry={reset}
      />
    </section>
  );
}
