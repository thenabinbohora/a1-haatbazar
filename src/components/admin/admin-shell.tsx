import Link from "next/link";
import { logoutAction } from "@/app/admin/login/actions";
import type { AuthUser } from "@/lib/auth";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import { adminNavigationItems } from "@/components/admin/admin-navigation";

type AdminShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
  return (
    <section className="a1-admin-shell min-h-screen border-t border-border">
      <div className="mx-auto grid max-w-[1440px] gap-0 px-0 lg:grid-cols-[264px_1fr]">
        <aside className="hidden border-r border-border/80 bg-white/74 backdrop-blur lg:block">
          <div className="sticky top-0 flex min-h-screen flex-col p-4">
            <div className="relative overflow-hidden rounded-lg bg-[linear-gradient(135deg,#1F5A2E,#0F2E1A)] p-4 text-white shadow-[0_16px_34px_rgba(15,46,26,0.22)]">
              <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full border-[16px] border-white/10" />
              <div className="relative flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-primary shadow-sm">
                  <span>
                    A<span className="text-cta">1</span>
                  </span>
                </span>
                <div>
                  <p className="text-sm font-extrabold">A1 Haat Bazar</p>
                  <p className="mt-0.5 text-xs leading-5 text-emerald-50/80">Operations console</p>
                </div>
              </div>
            </div>

            <nav className="mt-5 space-y-1" aria-label="Admin navigation">
              {adminNavigationItems.map((item) => (
                <AdminNavLink key={item.href} {...item} />
              ))}
            </nav>

            <div className="mt-auto rounded-lg border border-border bg-white/82 p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
                Signed in
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-text">{user.email}</p>
              <p className="mt-2 w-fit rounded-full border border-fresh/30 bg-fresh-soft px-2 py-0.5 text-xs font-bold text-fresh">
                {user.role}
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-border bg-white/88 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 xl:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-fresh">Admin console</p>
                  <p className="text-sm text-text-muted">
                    Manage catalog, orders, stock, promotions, and storefront content.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="a1-secondary-button min-h-10 px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    href="/"
                  >
                    Storefront
                  </Link>
                  <form action={logoutAction}>
                    <button
                      className="a1-primary-button min-h-10 cursor-pointer px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                      type="submit"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>

              <nav
                className="polished-scrollbar flex gap-2 overflow-x-auto pb-1 lg:hidden"
                aria-label="Admin mobile navigation"
              >
                {adminNavigationItems.map((item) => (
                  <div className="min-w-fit" key={item.href}>
                    <AdminNavLink {...item} />
                  </div>
                ))}
              </nav>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </section>
  );
}
