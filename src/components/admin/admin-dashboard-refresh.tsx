"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AdminIcon } from "@/components/admin/admin-icons";

export function AdminDashboardRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      aria-label="Refresh dashboard data"
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-white px-3.5 text-sm font-bold text-text hover:border-primary/25 hover:bg-fresh-soft disabled:cursor-wait disabled:opacity-65"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      type="button"
    >
      <AdminIcon
        className={["h-4 w-4", isPending ? "animate-spin" : ""].join(" ")}
        name="refresh"
      />
      <span>{isPending ? "Refreshing…" : "Refresh"}</span>
    </button>
  );
}
