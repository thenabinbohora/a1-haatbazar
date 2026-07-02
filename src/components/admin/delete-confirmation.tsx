"use client";

import { useState } from "react";

type DeleteConfirmationProps = {
  action: (formData: FormData) => void | Promise<void>;
  itemName: string;
  hiddenFields?: Record<string, string>;
  triggerLabel?: string;
};

export function DeleteConfirmation({
  action,
  itemName,
  hiddenFields,
  triggerLabel = "Delete",
}: DeleteConfirmationProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        className="min-h-10 cursor-pointer rounded-md border border-danger px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
        onClick={() => setConfirming(true)}
        type="button"
      >
        {triggerLabel}
      </button>
    );
  }

  return (
    <div className="rounded-md border border-danger bg-danger-soft p-3">
      <p className="text-sm font-semibold text-danger">Delete {itemName}?</p>
      <p className="mt-1 text-xs leading-5 text-text-muted">This action cannot be undone.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={action}>
          {hiddenFields
            ? Object.entries(hiddenFields).map(([name, value]) => (
                <input key={name} name={name} type="hidden" value={value} />
              ))
            : null}
          <button
            className="min-h-10 cursor-pointer rounded-md bg-danger px-4 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            type="submit"
          >
            Yes, delete
          </button>
        </form>
        <button
          className="min-h-10 cursor-pointer rounded-md border border-border bg-surface px-4 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          onClick={() => setConfirming(false)}
          type="button"
        >
          No, keep it
        </button>
      </div>
    </div>
  );
}
