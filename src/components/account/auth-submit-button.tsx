"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleLabel: string;
  onSettled?: () => void;
  pendingLabel: string;
};

export function AuthSubmitButton({
  idleLabel,
  onSettled,
  pendingLabel,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  const didSubmitRef = useRef(false);
  const onSettledRef = useRef(onSettled);

  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    if (pending) {
      didSubmitRef.current = true;
      return;
    }

    if (didSubmitRef.current) {
      didSubmitRef.current = false;
      onSettledRef.current?.();
    }
  }, [pending]);

  return (
    <button
      aria-disabled={pending}
      aria-live="polite"
      className="flex min-h-[3.125rem] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-extrabold text-white shadow-sm transition-[background-color,box-shadow] duration-200 hover:bg-primary-muted hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-80 motion-reduce:transition-none"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <svg
          aria-hidden="true"
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-30"
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
      ) : null}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
