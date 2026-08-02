"use client";

import { useState } from "react";
import type { ChangeEvent, RefObject } from "react";

type PasswordInputProps = {
  autoComplete: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
  id?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  maxLength?: number;
  name: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  showControlLabel?: string;
};

function EyeIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {isVisible ? null : <path d="m4 4 16 16" />}
    </svg>
  );
}

export function PasswordInput({
  ariaDescribedBy,
  ariaInvalid,
  autoComplete,
  disabled,
  id,
  inputRef,
  maxLength,
  name,
  onValueChange,
  required,
  showControlLabel = "password",
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={[
        "mt-2 flex h-[3.125rem] w-full max-w-full min-w-0 overflow-hidden rounded-xl border bg-surface transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-cta/20 motion-reduce:transition-none",
        ariaInvalid ? "border-danger" : "border-border hover:border-primary/55",
      ].join(" ")}
    >
      <input
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        autoComplete={autoComplete}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-base text-text outline-none"
        id={id}
        disabled={disabled}
        maxLength={maxLength}
        name={name}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onValueChange?.(event.currentTarget.value)
        }
        ref={inputRef}
        required={required}
        type={isVisible ? "text" : "password"}
      />
      <button
        aria-label={`${isVisible ? "Hide" : "Show"} ${showControlLabel}`}
        aria-pressed={isVisible}
        className="flex h-full w-[5.5rem] min-w-[5.5rem] flex-none cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border-l border-border bg-surface text-sm font-bold text-primary transition-colors duration-200 hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
        onClick={() => setIsVisible((value) => !value)}
        disabled={disabled}
        type="button"
      >
        <EyeIcon isVisible={isVisible} />
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
