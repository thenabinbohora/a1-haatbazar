"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getCardScrollDistance(scroller: HTMLElement) {
  const card = scroller.querySelector<HTMLElement>("[data-weekly-offer-card]");
  const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0;

  return card ? card.offsetWidth + gap : 300;
}

export function WeeklyOffersScroller({
  children,
  className,
  describedById,
  targetId,
}: {
  children: ReactNode;
  className: string;
  describedById: string;
  targetId: string;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    const scroller = event.currentTarget;
    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

    if (maxScrollLeft <= 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const distance = getCardScrollDistance(scroller);
    const left =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? maxScrollLeft
          : scroller.scrollLeft + (event.key === "ArrowLeft" ? -distance : distance);

    scroller.scrollTo({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      left,
    });
  }

  return (
    <div
      aria-describedby={describedById}
      aria-label="Weekly offers"
      aria-roledescription="carousel"
      className={className}
      id={targetId}
      onKeyDown={handleKeyDown}
      role="region"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

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

    const distance = getCardScrollDistance(scroller);

    scroller.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  return (
    <div className="hidden shrink-0 justify-end gap-2 md:flex lg:hidden">
      <button
        aria-controls={targetId}
        aria-label="Scroll weekly offers left"
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-cta/25 bg-surface text-primary shadow-sm transition-[border-color,box-shadow,color,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-cta/55 hover:text-cta-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-cta/25 disabled:hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
        disabled={!scrollState.canScrollLeft}
        onClick={() => scrollByCard("left")}
        type="button"
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        aria-controls={targetId}
        aria-label="Scroll weekly offers right"
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-cta/25 bg-surface text-primary shadow-sm transition-[border-color,box-shadow,color,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-cta/55 hover:text-cta-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-cta/25 disabled:hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
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
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-cta-soft/80 via-cta-soft/30 to-transparent transition-opacity duration-200 motion-reduce:transition-none sm:w-8 lg:hidden",
          scrollState.canScrollLeft ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-cta-soft/80 via-cta-soft/30 to-transparent transition-opacity duration-200 motion-reduce:transition-none sm:w-8 lg:hidden",
          scrollState.canScrollRight ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </>
  );
}
