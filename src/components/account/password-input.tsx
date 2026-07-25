"use client";

import { useState } from "react";

type PasswordInputProps = {
  autoComplete: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  id?: string;
  name: string;
  required?: boolean;
};

export function PasswordInput({ ariaDescribedBy, ariaInvalid, autoComplete, id, name, required }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="mt-2 flex h-12 w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background transition-[border-color,box-shadow,background-color] focus-within:border-cta focus-within:bg-surface focus-within:ring-2 focus-within:ring-cta/20">
      <input
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        autoComplete={autoComplete}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-base text-text outline-none sm:text-sm"
        id={id}
        name={name}
        required={required}
        type={isVisible ? "text" : "password"}
      />
      <button
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="h-full w-[72px] min-w-[72px] flex-none cursor-pointer whitespace-nowrap border-l border-border bg-surface text-base font-bold text-primary transition-colors hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta sm:text-sm"
        onClick={() => setIsVisible((value) => !value)}
        type="button"
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
