"use client";

import { useEffect, useState } from "react";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function getScroller(targetId: string) {
  return document.getElementById(targetId);
}

function getScrollState(targetId: string) {
  const scroller = getScroller(targetId);

  if (!scroller) {
    return { canScrollLeft: false, canScrollRight: false };
  }

  const maxScroll = scroller.scrollWidth - scroller.clientWidth;

  return {
    canScrollLeft: scroller.scrollLeft > 4,
    canScrollRight: scroller.scrollLeft < maxScroll - 4,
  };
}

export function WeeklyOffersScrollControls({ targetId }: { targetId: string }) {
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  useEffect(() => {
    const scroller = getScroller(targetId);

    if (!scroller) {
      return;
    }

    const update = () => setScrollState(getScrollState(targetId));
    const resizeObserver = new ResizeObserver(update);

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", update);
      resizeObserver.disconnect();
    };
  }, [targetId]);

  function scrollByCard(direction: "left" | "right") {
    const scroller = getScroller(targetId);

    if (!scroller) {
      return;
    }

    const card = scroller.querySelector<HTMLElement>("[data-weekly-offer-card]");
    const distance = card ? card.offsetWidth + 16 : 300;

    scroller.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <div className="hidden shrink-0 justify-end gap-2 md:flex">
      <button
        aria-label="Scroll weekly offers left"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-primary shadow-sm transition-[border-color,box-shadow,color,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-cta/60 hover:text-primary-muted hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        disabled={!scrollState.canScrollLeft}
        onClick={() => scrollByCard("left")}
        type="button"
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        aria-label="Scroll weekly offers right"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-primary shadow-sm transition-[border-color,box-shadow,color,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-cta/60 hover:text-primary-muted hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        disabled={!scrollState.canScrollRight}
        onClick={() => scrollByCard("right")}
        type="button"
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  );
}

export function WeeklyOffersEdgeFades({ targetId }: { targetId: string }) {
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  useEffect(() => {
    const scroller = getScroller(targetId);

    if (!scroller) {
      return;
    }

    const update = () => setScrollState(getScrollState(targetId));
    const resizeObserver = new ResizeObserver(update);

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", update);
      resizeObserver.disconnect();
    };
  }, [targetId]);

  return (
    <>
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#FAF8F1] to-transparent transition-opacity duration-200",
          scrollState.canScrollLeft ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#F4F1E8] to-transparent transition-opacity duration-200",
          scrollState.canScrollRight ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </>
  );
}
