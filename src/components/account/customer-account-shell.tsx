"use client";

import Link from "next/link";
import { useId, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { customerLogoutAction } from "@/app/login/actions";
import { AccountIcon } from "@/components/account/account-icons";
import {
  AccountSidebar,
  MobileAccountQuickActions,
} from "@/components/account/account-nav";
import {
  useDismissibleLayer,
} from "@/components/ui/overlay-provider";
import type { AuthUser } from "@/lib/auth";

type CustomerAccountShellProps = {
  children: ReactNode;
  description: string;
  isOverview?: boolean;
  title: string;
  user: AuthUser;
};

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending}
      className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm font-bold text-text-muted hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-65"
      disabled={pending}
      type="submit"
    >
      <AccountIcon className="h-4.5 w-4.5" name="lock" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = `${useId()}-account-menu`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLAnchorElement | null>(null);
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
    <div className="relative shrink-0">
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Account menu"
        className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-extrabold text-text transition-colors hover:border-primary/25 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
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
        <AccountIcon className="h-5 w-5 text-primary" name="menu" />
        <span className="hidden sm:inline">Account menu</span>
        <span className="sr-only sm:hidden">Account menu</span>
      </button>
      {isOpen ? (
        <div
          aria-label="Account menu"
          className="a1-menu-enter fixed inset-x-4 bottom-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] z-[var(--z-layer-popover)] max-h-[min(70dvh,22rem)] overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-[0_18px_45px_rgba(18,60,46,0.16)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+0.625rem)] sm:w-56"
          id={menuId}
          ref={menuRef}
          role="dialog"
        >
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-text-muted hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
            href="/account/profile"
            onClick={() => dismiss("navigation")}
            ref={firstItemRef}
          >
            <AccountIcon className="h-4.5 w-4.5" name="profile" />
            Edit profile
          </Link>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-text-muted hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
            href="/account/security"
            onClick={() => dismiss("navigation")}
          >
            <AccountIcon className="h-4.5 w-4.5" name="security" />
            Security
          </Link>
          <div className="my-1 border-t border-border" role="separator" />
          <form action={customerLogoutAction} onSubmit={() => dismiss("action")}>
            <SignOutButton />
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function CustomerAccountShell({
  children,
  description,
  isOverview = false,
  title,
  user,
}: CustomerAccountShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <section className="mx-auto w-full max-w-[87.5rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <header className="mb-5 rounded-2xl border border-border bg-surface px-4 py-5 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:px-6 sm:py-6 lg:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">
                Your account
              </p>
              <h1 className="mt-1.5 break-words text-[1.75rem] font-black leading-tight tracking-[-0.025em] text-text [overflow-wrap:anywhere] sm:text-[2rem]">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted sm:text-[0.9375rem]">
                {description}
              </p>
              <p
                className="mt-1.5 max-w-full truncate text-xs font-semibold text-text-muted sm:hidden"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                className="hidden min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:inline-flex"
                href="/products"
              >
                <AccountIcon className="h-4.5 w-4.5" name="bag" />
                Continue shopping
              </Link>
              <AccountMenu />
            </div>
          </div>
          <Link
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:hidden"
            href="/products"
          >
            <AccountIcon className="h-4.5 w-4.5" name="bag" />
            Continue shopping
          </Link>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[15.75rem_minmax(0,1fr)] xl:gap-8">
          <AccountSidebar email={user.email} name={user.name} />
          <div className="min-w-0">
            {isOverview ? (
              <MobileAccountQuickActions />
            ) : (
              <Link
                className="mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta lg:hidden"
                href="/account"
              >
                <AccountIcon className="h-5 w-5" name="arrow-left" />
                Back to account
              </Link>
            )}
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
