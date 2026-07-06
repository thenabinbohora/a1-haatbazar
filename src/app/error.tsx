"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log only the digest reference so no sensitive details reach the console.
    if (error.digest) {
      console.error(`Storefront error digest: ${error.digest}`);
    }
  }, [error]);

  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-fresh">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-text sm:text-4xl">
          We hit a snag loading this page.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-muted">
          Please try again in a moment. If the problem continues, the rest of the store is still open.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="a1-primary-button px-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <Link
            className="a1-secondary-button px-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
