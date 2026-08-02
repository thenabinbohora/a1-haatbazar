"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { logoutAction } from "@/app/admin/login/actions";
import { AdminIcon } from "@/components/admin/admin-icons";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import {
  adminNavigationGroups,
  adminNavigationItems,
  adminQuickCreateItems,
} from "@/components/admin/admin-navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  useDismissibleLayer,
  type OverlayDismissReason,
} from "@/components/ui/overlay-provider";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useModalIsolation } from "@/hooks/use-modal-isolation";
import type { AdminShellSummary } from "@/lib/admin/dashboard-data";
import type { AuthUser } from "@/lib/auth";

type AdminShellProps = {
  user: AuthUser;
  summary: AdminShellSummary;
  children: React.ReactNode;
};

type SearchResult = {
  detail: string;
  href: string;
  id: string;
  label: string;
  type: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useDialogFocus(
  open: boolean,
  panelRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLElement | null>,
  shouldRestoreFocus: () => boolean,
) {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const frame = window.requestAnimationFrame(() => {
      (initialFocusRef.current ?? panelRef.current)?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !panelRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      if (shouldRestoreFocus()) {
        returnFocusRef.current?.focus();
      }
    };
  }, [initialFocusRef, open, panelRef, shouldRestoreFocus]);
}

function displayName(user: AuthUser) {
  return user.name?.trim() || user.email.split("@")[0] || "Administrator";
}

function initials(user: AuthUser) {
  const name = displayName(user);
  const parts = name.split(/\s+/).filter(Boolean);

  return (parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "");
}

function routeTitle(pathname: string) {
  const item = adminNavigationItems.find(
    (navigationItem) =>
      pathname === navigationItem.href ||
      pathname.startsWith(`${navigationItem.href}/`),
  );

  if (pathname === "/admin/products/new") {
    return "Add product";
  }

  if (pathname.includes("/products/") && pathname.endsWith("/edit")) {
    return "Edit product";
  }

  if (pathname.match(/^\/admin\/orders\/[^/]+$/)) {
    return "Order details";
  }

  return item?.label ?? "Admin console";
}

function breadcrumbs(pathname: string) {
  if (pathname === "/admin/dashboard") {
    return [];
  }

  const parent = adminNavigationItems.find((item) =>
    pathname.startsWith(item.href),
  );

  return [
    { href: "/admin/dashboard", label: "Dashboard" },
    ...(parent
      ? [
          {
            href: parent.href,
            label: parent.label,
          },
        ]
      : []),
    ...(parent && pathname !== parent.href
      ? [{ href: pathname, label: routeTitle(pathname) }]
      : []),
  ];
}

function SidebarNavigation({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      aria-label="Admin navigation"
      className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
    >
      {adminNavigationGroups.map((group, index) => (
        <div
          className={index === 0 ? "" : "mt-4 border-t border-[#e5e7df] pt-4"}
          key={group.label}
        >
          {collapsed ? (
            <span className="sr-only">{group.label}</span>
          ) : (
            <p className="mb-1.5 px-3 text-[0.66rem] font-extrabold uppercase tracking-[0.15em] text-[#7a847d]">
              {group.label}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => (
              <AdminNavLink
                collapsed={collapsed}
                key={item.href}
                onNavigate={onNavigate}
                {...item}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

type AdminPopoverProps = {
  ariaLabel: string;
  children: (
    dismiss: (reason?: OverlayDismissReason) => void,
    firstItemRef: RefObject<HTMLElement | null>,
  ) => ReactNode;
  containerClassName?: string;
  panelClassName: string;
  trigger: (isOpen: boolean) => ReactNode;
  triggerClassName: string;
};

function AdminPopover({
  ariaLabel,
  children,
  containerClassName = "relative",
  panelClassName,
  trigger,
  triggerClassName,
}: AdminPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = `${useId()}-menu`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLElement | null>(null);
  const dismiss = useDismissibleLayer({
    contentRef: menuRef,
    dismissOnResize: true,
    dismissOnScroll: true,
    initialFocusRef: firstItemRef,
    onDismiss: () => setIsOpen(false),
    open: isOpen,
    triggerRef,
  });

  return (
    <div className={containerClassName}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        className={triggerClassName}
        onClick={() => {
          if (isOpen) {
            dismiss("trigger");
          } else {
            setIsOpen(true);
          }
        }}
        ref={triggerRef}
        type="button"
      >
        {trigger(isOpen)}
      </button>
      {isOpen ? (
        <div
          aria-label={ariaLabel}
          className={panelClassName}
          id={menuId}
          ref={menuRef}
          role="dialog"
        >
          {children(dismiss, firstItemRef)}
        </div>
      ) : null}
    </div>
  );
}

function AccountControl({
  collapsed = false,
  user,
}: {
  collapsed?: boolean;
  user: AuthUser;
}) {
  return (
    <AdminPopover
      ariaLabel="Open administrator account menu"
      panelClassName={[
        "absolute bottom-[calc(100%+0.5rem)] z-[var(--z-layer-popover)] w-60 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-[0_18px_48px_rgba(18,60,46,0.16)]",
        collapsed ? "left-0" : "inset-x-0",
      ].join(" ")}
      triggerClassName={[
          "flex min-h-12 cursor-pointer list-none items-center rounded-xl border border-transparent p-2 text-left transition-colors hover:border-[#d9ddd5] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d39b32] [&::-webkit-details-marker]:hidden",
          collapsed ? "justify-center" : "gap-3",
        ].join(" ")}
      trigger={(isOpen) => (
        <>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-black uppercase text-white">
            {initials(user)}
          </span>
          {collapsed ? null : (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-text">
                  {displayName(user)}
                </span>
                <span className="block truncate text-xs text-text-muted">
                  Administrator
                </span>
              </span>
              <AdminIcon
                className={`h-4 w-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                name="chevron-down"
              />
            </>
          )}
        </>
      )}
    >
      {(dismiss, firstItemRef) => (
        <>
          <div className="border-b border-border px-3 py-2.5" role="presentation">
            <p className="truncate text-sm font-bold text-text">{user.email}</p>
            <p className="mt-0.5 text-xs text-text-muted">ADMIN role</p>
          </div>
          <Link
            className="mt-1 flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold text-text-muted hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
            href="/"
            onClick={() => dismiss("navigation")}
            ref={(element) => {
              firstItemRef.current = element;
            }}
          >
            <AdminIcon className="h-4 w-4" name="store" />
            Return to storefront
          </Link>
          <form action={logoutAction} onSubmit={() => dismiss("action")}>
            <button
              className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold text-danger hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
              type="submit"
            >
              <AdminIcon className="h-4 w-4" name="sign-out" />
              Sign out
            </button>
          </form>
        </>
      )}
    </AdminPopover>
  );
}

function CommandPalette({
  close,
  open,
}: {
  close: () => void;
  open: boolean;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef(true);
  const restoreScrollRef = useRef(true);
  const shouldRestoreFocus = useCallback(() => restoreFocusRef.current, []);
  const shouldRestoreScroll = useCallback(() => restoreScrollRef.current, []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const dismiss = useDismissibleLayer({
    contentRef: panelRef,
    kind: "dialog",
    onDismiss: (reason) => {
      restoreScrollRef.current = ![
        "navigation",
        "session-change",
      ].includes(reason);
      restoreFocusRef.current = ![
        "another-layer",
        "navigation",
        "session-change",
      ].includes(reason);
      close();
    },
    open,
    restoreFocusOnDismiss: false,
    triggerRef,
  });

  useDialogFocus(open, panelRef, inputRef, shouldRestoreFocus);
  useBodyScrollLock(open, shouldRestoreScroll);
  useModalIsolation(open, panelRef);

  useEffect(() => {
    const normalized = query.trim();

    if (normalized.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus("loading");
      fetch(`/api/admin/search?q=${encodeURIComponent(normalized)}`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Search failed");
          }

          return (await response.json()) as { results: SearchResult[] };
        })
        .then((payload) => {
          setResults(payload.results);
          setStatus("ready");
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          setResults([]);
          setStatus("error");
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-label="Admin search"
      aria-modal="true"
      className="fixed inset-0 z-[var(--z-layer-dialog)] flex items-start justify-center bg-[#0d241b]/45 px-3 pt-[8vh] backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          dismiss("outside-pointer");
        }
      }}
      role="dialog"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_28px_90px_rgba(9,35,25,0.28)]"
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <AdminIcon className="h-5 w-5 text-text-muted" name="search" />
          <label className="sr-only" htmlFor="admin-command-search">
            Search products, orders, categories, or coupons
          </label>
          <input
            autoComplete="off"
            className="min-h-14 min-w-0 flex-1 border-0 bg-transparent text-base text-text shadow-none outline-none placeholder:text-text-muted"
            id="admin-command-search"
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);

              if (nextQuery.trim().length < 2) {
                setResults([]);
                setStatus("idle");
              }
            }}
            placeholder="Search products, orders, categories, or coupons…"
            ref={inputRef}
            type="search"
            value={query}
          />
          <button
            aria-label="Close admin search"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text"
            onClick={() => dismiss("action")}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="close" />
          </button>
        </div>
        <div
          aria-live="polite"
          className="max-h-[min(60vh,32rem)] overflow-y-auto p-2"
        >
          {query.trim().length < 2 ? (
            <div className="p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-text-muted">
                Quick actions
              </p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                {adminQuickCreateItems.map((item) => (
                  <Link
                    className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-text hover:bg-fresh-soft hover:text-primary"
                    href={item.href}
                    key={item.href}
                    onClick={() => dismiss("navigation")}
                  >
                    <AdminIcon className="h-5 w-5" name={item.icon} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {status === "loading" ? (
            <div className="space-y-2 p-3" aria-label="Searching">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="skeleton-shimmer h-14 rounded-xl"
                  key={index}
                />
              ))}
            </div>
          ) : null}
          {status === "ready" && results.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-bold text-text">No matching admin records</p>
              <p className="mt-1 text-sm text-text-muted">
                Check the spelling or try a broader search.
              </p>
            </div>
          ) : null}
          {status === "error" ? (
            <div className="px-5 py-8 text-center">
              <p className="font-bold text-danger">
                Search is temporarily unavailable
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Your other admin tools are still available.
              </p>
            </div>
          ) : null}
          {status === "ready" && results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    className="flex min-h-14 items-center justify-between gap-4 rounded-xl px-3 py-2.5 hover:bg-fresh-soft focus-visible:bg-fresh-soft"
                    href={result.href}
                    onClick={() => dismiss("navigation")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-text">
                        {result.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-text-muted">
                        {result.detail}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-md bg-surface-muted px-2 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-text-muted">
                      {result.type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-[#fafaf7] px-4 py-2 text-xs text-text-muted">
          <span>Results are loaded from the protected admin API.</span>
          <span aria-hidden="true">Esc to close</span>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children, summary, user }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const drawerCloseRef = useRef<HTMLButtonElement | null>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRestoreFocusRef = useRef(true);
  const drawerRestoreScrollRef = useRef(true);
  const shouldRestoreDrawerFocus = useCallback(
    () => drawerRestoreFocusRef.current,
    [],
  );
  const shouldRestoreDrawerScroll = useCallback(
    () => drawerRestoreScrollRef.current,
    [],
  );
  const title = routeTitle(pathname);
  const breadcrumbItems = useMemo(() => breadcrumbs(pathname), [pathname]);
  const totalNotifications =
    (summary.pendingOrders ?? 0) +
    (summary.lowStock ?? 0) +
    (summary.outOfStock ?? 0);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeCommand = useCallback(() => setCommandOpen(false), []);
  const dismissMobile = useDismissibleLayer({
    contentRef: drawerRef,
    kind: "drawer",
    onDismiss: (reason) => {
      drawerRestoreScrollRef.current = ![
        "navigation",
        "session-change",
      ].includes(reason);
      drawerRestoreFocusRef.current = ![
        "another-layer",
        "navigation",
        "session-change",
      ].includes(reason);
      closeMobile();
    },
    open: mobileOpen,
    restoreFocusOnDismiss: false,
    triggerRef: drawerTriggerRef,
  });
  const openCommand = useCallback(() => {
    if (mobileOpen) {
      dismissMobile("another-layer");
    }

    setCommandOpen(true);
  }, [dismissMobile, mobileOpen]);

  useBodyScrollLock(mobileOpen, shouldRestoreDrawerScroll);
  useModalIsolation(mobileOpen, drawerRef);
  useDialogFocus(
    mobileOpen,
    drawerRef,
    drawerCloseRef,
    shouldRestoreDrawerFocus,
  );

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        dismissMobile("resize");
      }
    };

    closeAtDesktop(desktopQuery);
    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, [dismissMobile, mobileOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(
        "a1-admin-sidebar-collapsed",
      );
      setCollapsed(stored === "true");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommand();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openCommand]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(
        "a1-admin-sidebar-collapsed",
        String(next),
      );
      return next;
    });
  }

  return (
    <section className="a1-admin-shell flex min-h-screen min-h-dvh w-full overflow-x-clip">
      <aside
        className={[
          "sticky top-0 z-30 hidden h-screen h-dvh shrink-0 border-r border-[#dfe2da] bg-[#f8f8f4] transition-[width] duration-200 lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-[268px]",
        ].join(" ")}
      >
        <div className="flex min-h-[76px] items-center gap-3 bg-primary px-4 text-white">
          <BrandLogo compact href="/admin/dashboard" variant="dark" />
          {collapsed ? null : (
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">A1 Haat Bazar</p>
              <p className="truncate text-xs text-white/68">Admin console</p>
            </div>
          )}
        </div>
        <SidebarNavigation collapsed={collapsed} />
        <div className="border-t border-[#dfe2da] p-3">
          <AccountControl collapsed={collapsed} user={user} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-[#dfe2da] bg-white/94 backdrop-blur">
          <div className="flex min-h-[68px] items-center gap-2 px-3 sm:px-5 xl:px-7">
            <button
              aria-label="Open admin navigation"
              className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-text-muted hover:bg-surface-muted hover:text-primary lg:hidden"
              onClick={() => {
                drawerRestoreScrollRef.current = true;
                setMobileOpen(true);
              }}
              ref={drawerTriggerRef}
              type="button"
            >
              <AdminIcon className="h-5 w-5" name="menu" />
            </button>
            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-text-muted hover:bg-surface-muted hover:text-primary lg:grid"
              onClick={toggleCollapsed}
              type="button"
            >
              <AdminIcon
                className="h-5 w-5"
                name={collapsed ? "chevron-right" : "chevron-left"}
              />
            </button>

            <div className="min-w-0 flex-1 lg:flex-none">
              {breadcrumbItems.length > 0 ? (
                <nav
                  aria-label="Breadcrumb"
                  className="hidden items-center gap-1 text-xs text-text-muted sm:flex"
                >
                  {breadcrumbItems.map((item, index) => (
                    <span className="flex min-w-0 items-center gap-1" key={`${item.href}-${index}`}>
                      {index > 0 ? (
                        <AdminIcon
                          className="h-3.5 w-3.5 shrink-0"
                          name="chevron-right"
                        />
                      ) : null}
                      {index === breadcrumbItems.length - 1 ? (
                        <span
                          aria-current="page"
                          className="max-w-36 truncate font-semibold text-text"
                        >
                          {item.label}
                        </span>
                      ) : (
                        <Link className="hover:text-primary" href={item.href}>
                          {item.label}
                        </Link>
                      )}
                    </span>
                  ))}
                </nav>
              ) : null}
              <p className="truncate text-base font-extrabold text-text sm:text-lg">
                {title}
              </p>
            </div>

            <button
              className="mx-auto hidden min-h-11 min-w-0 max-w-xl flex-1 items-center gap-3 rounded-xl border border-[#d9ddd5] bg-[#f8f9f5] px-3 text-left text-sm text-text-muted hover:border-primary/25 hover:bg-white md:flex"
              onClick={openCommand}
              type="button"
            >
              <AdminIcon className="h-4.5 w-4.5 shrink-0" name="search" />
              <span className="min-w-0 flex-1 truncate">
                Search products, orders or commands…
              </span>
              <kbd className="rounded-md border border-border bg-white px-1.5 py-0.5 text-[0.68rem] font-bold text-text-muted">
                Ctrl K
              </kbd>
            </button>

            <AdminPopover
              ariaLabel="Create menu"
              containerClassName="relative hidden sm:block"
              panelClassName="absolute right-0 top-[calc(100%+0.5rem)] z-[var(--z-layer-popover)] w-56 rounded-xl border border-border bg-white p-1.5 shadow-[0_18px_48px_rgba(18,60,46,0.16)]"
              triggerClassName="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-bold text-white hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              trigger={(isOpen) => (
                <>
                  <AdminIcon className="h-4 w-4" name="plus" />
                  <span className="hidden xl:inline">Create</span>
                  <AdminIcon
                    className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    name="chevron-down"
                  />
                </>
              )}
            >
              {(dismiss, firstItemRef) =>
                adminQuickCreateItems.map((item, index) => (
                  <Link
                    className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold text-text-muted hover:bg-fresh-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
                    href={item.href}
                    key={item.href}
                    onClick={() => dismiss("navigation")}
                    ref={(element) => {
                      if (index === 0) {
                        firstItemRef.current = element;
                      }
                    }}
                  >
                    <AdminIcon className="h-4 w-4" name={item.icon} />
                    {item.label}
                  </Link>
                ))
              }
            </AdminPopover>

            <AdminPopover
              ariaLabel={`${totalNotifications} operational notifications`}
              panelClassName="absolute right-0 top-[calc(100%+0.5rem)] z-[var(--z-layer-popover)] w-[min(21rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-white p-2 shadow-[0_18px_48px_rgba(18,60,46,0.16)]"
              triggerClassName="relative grid h-11 w-11 cursor-pointer place-items-center rounded-xl text-text-muted hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              trigger={() => (
                <>
                  <AdminIcon className="h-5 w-5" name="bell" />
                  {totalNotifications > 0 ? (
                    <span className="absolute right-1 top-1 min-w-4 rounded-full bg-danger px-1 text-center text-[0.62rem] font-black leading-4 text-white">
                      {Math.min(totalNotifications, 99)}
                    </span>
                  ) : null}
                </>
              )}
            >
              {(dismiss, firstItemRef) => (
                <>
                  <div className="px-2 py-2" role="presentation">
                    <p className="text-sm font-extrabold text-text">
                      Operational attention
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Current counts, not selected-period totals.
                    </p>
                  </div>
                  {summary.hasError ? (
                    <p className="rounded-lg bg-danger-soft px-3 py-3 text-sm font-semibold text-danger" role="presentation">
                      Notifications could not be refreshed.
                    </p>
                  ) : (
                    <div className="space-y-1" role="presentation">
                      <Link
                        className="flex min-h-12 items-center justify-between rounded-lg px-3 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
                        href="/admin/orders"
                        onClick={() => dismiss("navigation")}
                        ref={(element) => {
                          firstItemRef.current = element;
                        }}
                      >
                        <span className="text-sm font-semibold text-text">
                          Open fulfilment
                        </span>
                        <span className="font-black tabular-nums text-warning">
                          {summary.pendingOrders}
                        </span>
                      </Link>
                      <Link
                        className="flex min-h-12 items-center justify-between rounded-lg px-3 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
                        href="/admin/inventory?stock=low"
                        onClick={() => dismiss("navigation")}
                      >
                        <span className="text-sm font-semibold text-text">
                          Low-stock variants
                        </span>
                        <span className="font-black tabular-nums text-warning">
                          {summary.lowStock}
                        </span>
                      </Link>
                      <Link
                        className="flex min-h-12 items-center justify-between rounded-lg px-3 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
                        href="/admin/inventory?stock=out"
                        onClick={() => dismiss("navigation")}
                      >
                        <span className="text-sm font-semibold text-text">
                          Out-of-stock variants
                        </span>
                        <span className="font-black tabular-nums text-danger">
                          {summary.outOfStock}
                        </span>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </AdminPopover>

            <Link
              aria-label="Open storefront"
              className="hidden h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-text-muted hover:bg-surface-muted hover:text-primary xl:flex"
              href="/"
            >
              <AdminIcon className="h-4.5 w-4.5" name="store" />
              Storefront
            </Link>

            <AdminPopover
              ariaLabel="Open administrator account menu"
              panelClassName="absolute right-0 top-[calc(100%+0.5rem)] z-[var(--z-layer-popover)] w-60 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-[0_18px_48px_rgba(18,60,46,0.16)]"
              triggerClassName="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-primary text-xs font-black uppercase text-white ring-2 ring-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              trigger={() => initials(user)}
            >
              {(dismiss, firstItemRef) => (
                <>
                  <div className="border-b border-border px-3 py-2.5" role="presentation">
                    <p className="font-bold text-text">{displayName(user)}</p>
                    <p className="truncate text-xs text-text-muted">{user.email}</p>
                  </div>
                  <Link
                    className="mt-1 flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold text-text-muted hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
                    href="/"
                    onClick={() => dismiss("navigation")}
                    ref={(element) => {
                      firstItemRef.current = element;
                    }}
                  >
                    <AdminIcon className="h-4 w-4" name="store" />
                    Return to storefront
                  </Link>
                  <form action={logoutAction} onSubmit={() => dismiss("action")}>
                    <button
                      className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold text-danger hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
                      type="submit"
                    >
                      <AdminIcon className="h-4 w-4" name="sign-out" />
                      Sign out
                    </button>
                  </form>
                </>
              )}
            </AdminPopover>
          </div>
        </header>

        <main
          className="mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-5 sm:py-6 xl:px-7"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {mobileOpen ? (
        <div
          aria-label="Admin navigation"
          aria-modal="true"
          className="fixed inset-0 z-[var(--z-layer-drawer)] bg-[#0d241b]/45 backdrop-blur-[2px] lg:hidden"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              dismissMobile("outside-pointer");
            }
          }}
          role="dialog"
        >
          <div
            className="a1-admin-drawer flex h-full h-dvh w-[min(88vw,320px)] flex-col border-r border-white/20 bg-[#f8f8f4] shadow-2xl"
            ref={drawerRef}
            tabIndex={-1}
          >
            <div className="flex min-h-[76px] items-center gap-3 bg-primary px-4 text-white">
              <BrandLogo compact href="/admin/dashboard" variant="dark" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">A1 Haat Bazar</p>
                <p className="truncate text-xs text-white/68">Admin console</p>
              </div>
              <button
                aria-label="Close admin navigation"
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl text-white/85 hover:bg-white/10 hover:text-white"
                onClick={() => dismissMobile("action")}
                ref={drawerCloseRef}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="close" />
              </button>
            </div>
            <button
              className="mx-3 mt-3 flex min-h-11 items-center gap-3 rounded-xl border border-[#d9ddd5] bg-white px-3 text-left text-sm text-text-muted"
              onClick={() => {
                openCommand();
              }}
              type="button"
            >
              <AdminIcon className="h-4.5 w-4.5" name="search" />
              Search admin
            </button>
            <SidebarNavigation
              collapsed={false}
              onNavigate={() => dismissMobile("navigation")}
            />
            <div className="border-t border-[#dfe2da] p-3">
              <AccountControl user={user} />
            </div>
          </div>
        </div>
      ) : null}

      {commandOpen ? (
        <CommandPalette close={closeCommand} open />
      ) : null}
    </section>
  );
}
