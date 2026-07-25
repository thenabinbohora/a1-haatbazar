"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type AddressSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function AddressSubmitButton({ idleLabel, pendingLabel }: AddressSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending}
      className="min-h-12 w-full cursor-pointer rounded-xl bg-primary px-5 text-base font-bold text-white shadow-sm transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-75 sm:text-sm"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending}
      className="min-h-12 flex-1 cursor-pointer rounded-xl bg-danger px-4 text-base font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-wait disabled:opacity-75 sm:text-sm"
      disabled={pending}
      type="submit"
    >
      {pending ? "Deleting..." : "Yes, delete"}
    </button>
  );
}

type DeleteAddressFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  addressId: string;
  addressLabel: string;
};

export function DeleteAddressForm({ action, addressId, addressLabel }: DeleteAddressFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <form action={action} className="mt-4 border-t border-border pt-4">
      <input name="id" type="hidden" value={addressId} />
      {isConfirming ? (
        <div className="rounded-xl border border-danger/30 bg-danger-soft p-3" role="group" aria-label={`Confirm deletion of ${addressLabel}`}>
          <p className="text-sm font-bold leading-6 text-danger">Delete this address? This cannot be undone.</p>
          <div className="mt-3 flex gap-2">
            <ConfirmDeleteButton />
            <button
              className="min-h-12 flex-1 cursor-pointer rounded-xl border border-border bg-surface px-4 text-base font-bold text-text transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:text-sm"
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              Keep address
            </button>
          </div>
        </div>
      ) : (
        <button
          className="min-h-12 w-full cursor-pointer rounded-xl border border-danger/50 bg-surface px-4 text-base font-bold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger sm:w-auto sm:text-sm"
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          Delete address
        </button>
      )}
    </form>
  );
}
