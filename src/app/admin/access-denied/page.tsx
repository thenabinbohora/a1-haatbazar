import Link from "next/link";
import { logoutAction } from "@/app/admin/login/actions";
import { AdminAuthShell } from "@/components/admin/admin-auth-shell";

function ShieldAlertIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 3 5.5 5.7v5.6c0 4.2 2.7 7.7 6.5 9.7 3.8-2 6.5-5.5 6.5-9.7V5.7L12 3Z" />
      <path d="M12 8v5m0 3h.01" />
    </svg>
  );
}

export default function AdminAccessDeniedPage() {
  return (
    <AdminAuthShell variant="compact">
      <section
        aria-labelledby="access-denied-title"
        className="w-full rounded-[1.5rem] border border-[#e0b0ac] bg-white p-6 shadow-[0_20px_55px_rgba(18,60,46,0.1)] sm:p-8"
      >
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#fcedeb] text-[#a3261e]">
          <ShieldAlertIcon />
        </div>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-[#a3261e]">
          Access denied
        </p>
        <h1
          className="mt-3 text-3xl font-black leading-tight tracking-[-0.025em] text-[#172019]"
          id="access-denied-title"
        >
          You do not have permission to access this admin area.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#59645d]">
          Sign in with an authorised administrator account, or return to the public storefront.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <form action={logoutAction}>
            <button
              className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#123c2e] px-5 text-sm font-extrabold text-white transition-colors duration-200 hover:bg-[#0b2b20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c38a25] sm:w-auto"
              type="submit"
            >
              Sign in with another account
            </button>
          </form>
          <Link
            className="flex min-h-12 items-center justify-center rounded-xl border border-[#9ba49e] bg-white px-5 text-sm font-extrabold text-[#123c2e] transition-colors duration-200 hover:bg-[#eef4ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c38a25]"
            href="/"
            prefetch={false}
          >
            Return to storefront
          </Link>
        </div>
      </section>
    </AdminAuthShell>
  );
}
