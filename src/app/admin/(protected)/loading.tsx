import { AdminLoadingState } from "@/components/admin/admin-states";

export default function AdminLoading() {
  return (
    <section className="min-h-[calc(100vh-73px)] border-t border-border bg-surface-muted px-4 py-6 sm:px-6 lg:px-8">
      <AdminLoadingState />
    </section>
  );
}

