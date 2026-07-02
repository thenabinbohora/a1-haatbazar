"use client";

import { useState } from "react";

type PasswordInputProps = {
  autoComplete: string;
  id?: string;
  name: string;
  required?: boolean;
};

export function PasswordInput({ autoComplete, id, name, required }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="mt-2 flex overflow-hidden rounded-md border border-border bg-surface transition-colors focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/20">
      <input
        autoComplete={autoComplete}
        className="min-h-12 min-w-0 flex-1 border-0 bg-surface px-4 text-text outline-none"
        id={id}
        name={name}
        required={required}
        type={isVisible ? "text" : "password"}
      />
      <button
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="min-h-12 cursor-pointer border-l border-border px-4 text-sm font-bold text-primary transition-colors hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        onClick={() => setIsVisible((value) => !value)}
        type="button"
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
