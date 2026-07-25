"use client";

import { useCart } from "@/store/cart-store";
import { useCartDrawer } from "@/store/cart-drawer-store";

export function CartNavLink() {
  const { itemCount, isReady } = useCart();
  const { open } = useCartDrawer();
  const count = isReady ? itemCount : 0;
  const displayCount = count > 9 ? "9+" : count;

  return (
    <button
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="group relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary text-white shadow-[0_8px_18px_rgba(6,61,22,0.16)] ring-1 ring-inset ring-white/10 transition-[background-color,box-shadow] hover:bg-primary-muted hover:shadow-[0_10px_22px_rgba(6,61,22,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      onClick={open}
      type="button"
    >
      <svg className="size-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.75 5.25h2.4l1.55 9.15a2 2 0 0 0 1.98 1.66h7.62a2 2 0 0 0 1.94-1.52l1.12-4.54H7.02" />
        <path d="M9.6 20.05h.01" />
        <path d="M17.35 20.05h.01" />
        <path d="M10.1 12.1h6.95" />
      </svg>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute right-[3px] top-[3px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-primary/15 bg-cta-soft px-1 text-[10px] font-black leading-none text-primary shadow-[0_2px_6px_rgba(6,61,22,0.16)]"
        >
          {displayCount}
        </span>
      ) : null}
    </button>
  );
}
