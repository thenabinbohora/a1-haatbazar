"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  changeCustomerPasswordAction,
  deleteCustomerAccountAction,
  requestAccountDeletionOtpAction,
  signOutEverywhereAction,
} from "@/app/account/security/actions";
import { customerLogoutAction } from "@/app/login/actions";
import { AccountIcon } from "@/components/account/account-icons";
import { PasswordInput } from "@/components/account/password-input";
import { useDismissibleLayer } from "@/components/ui/overlay-provider";
import {
  ACCOUNT_PASSWORD_POLICY,
  passwordStrengthChecks,
  validatePasswordChangeFields,
  type ChangePasswordResult,
  type DeleteAccountResult,
  type SecurityFieldErrors,
} from "@/lib/account-security";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useModalIsolation } from "@/hooks/use-modal-isolation";
import { BUSINESS_CONFIG } from "@/config/business";
import { useCart } from "@/store/cart-store";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");
const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

type DialogName = "change-password" | "delete-account" | "sign-out-everywhere";

type AccountSecurityPanelProps = {
  hasPassword: boolean;
  providerNames: string[];
};

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="mt-2 text-sm font-semibold leading-5 text-danger" id={id}>
      {message}
    </p>
  ) : null;
}

function SecurityDialog({
  children,
  description,
  initialFocusRef,
  isBusy,
  onClose,
  open,
  title,
  triggerRef,
}: {
  children: ReactNode;
  description: string;
  initialFocusRef: RefObject<HTMLElement | null>;
  isBusy: boolean;
  onClose: (restoreFocus: boolean) => void;
  open: boolean;
  title: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const isMounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useMemo(
    () => `security-dialog-title-${title.toLowerCase().replaceAll(" ", "-")}`,
    [title],
  );
  const descriptionId = `${titleId}-description`;
  const restoreScroll = useCallback(() => true, []);
  const dismiss = useDismissibleLayer({
    contentRef: panelRef,
    dismissOnEscape: !isBusy,
    dismissOnOutsidePointer: !isBusy,
    kind: "dialog",
    onDismiss: () => onClose(true),
    open,
    restoreFocusOnDismiss: false,
    triggerRef,
  });

  useBodyScrollLock(open, restoreScroll);
  useModalIsolation(open, panelRef);

  useEffect(() => {
    if (!open || !isMounted) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      initialFocusRef.current?.focus();
    });

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          element.getAttribute("aria-hidden") !== "true",
      );

      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", trapFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapFocus);
    };
  }, [initialFocusRef, isMounted, open]);

  if (!open || !isMounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-layer-dialog)] flex h-[100dvh] items-end justify-center sm:items-center sm:p-5">
      <button
        aria-label={`Close ${title}`}
        className="a1-dialog-backdrop absolute inset-0 h-full w-full cursor-pointer bg-primary-muted/55 backdrop-blur-[2px] disabled:cursor-wait"
        disabled={isBusy}
        onClick={() => dismiss("outside-pointer")}
        type="button"
      />
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="a1-dialog-panel relative flex max-h-[100dvh] min-h-0 w-full max-w-[35rem] flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-[0_-18px_60px_rgba(15,46,26,0.24)] outline-none sm:max-h-[min(90dvh,48rem)] sm:rounded-3xl sm:shadow-[0_28px_80px_rgba(15,46,26,0.28)]"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-xl font-black tracking-tight text-text sm:text-2xl" id={titleId}>
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted" id={descriptionId}>
              {description}
            </p>
          </div>
          <button
            aria-label={`Close ${title}`}
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-border text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-50 motion-reduce:transition-none"
            disabled={isBusy}
            onClick={() => dismiss("action")}
            type="button"
          >
            <CloseIcon />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function PasswordRequirements({ checks }: { checks: ReturnType<typeof passwordStrengthChecks> }) {
  const requirements = [
    {
      met: checks.length,
      text: `${ACCOUNT_PASSWORD_POLICY.recommendedLength}+ characters recommended`,
    },
    { met: checks.uppercase, text: "Uppercase letter" },
    { met: checks.lowercase, text: "Lowercase letter" },
    { met: checks.number, text: "Number" },
    { met: checks.symbol, text: "Symbol" },
  ];
  const metCount = requirements.filter((item) => item.met).length;

  return (
    <div
      aria-live="polite"
      className="mt-3 rounded-xl border border-border bg-surface-muted p-3"
      id="new-password-requirements"
    >
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-text-muted">
        <span>Password checks</span>
        <span>{metCount} of {requirements.length} met</span>
      </div>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {requirements.map((item) => (
          <p
            className={`flex items-center gap-2 text-xs font-semibold ${
              item.met ? "text-fresh" : "text-text-muted"
            }`}
            key={item.text}
          >
            <span
              aria-hidden="true"
              className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[0.625rem] ${
                item.met
                  ? "border-fresh bg-fresh text-white"
                  : "border-border bg-surface"
              }`}
            >
              {item.met ? <AccountIcon className="h-3 w-3" name="check" /> : null}
            </span>
            {item.text}
          </p>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-text-muted">
        Supabase also applies the project&apos;s authoritative password and leaked-password policy.
      </p>
    </div>
  );
}

export function AccountSecurityPanel({
  hasPassword,
  providerNames,
}: AccountSecurityPanelProps) {
  const { clearCart } = useCart();
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeErrors, setChangeErrors] = useState<SecurityFieldErrors>({});
  const [sessionErrors, setSessionErrors] = useState<SecurityFieldErrors>({});
  const [deleteErrors, setDeleteErrors] = useState<SecurityFieldErrors>({});
  const [pageMessage, setPageMessage] = useState<ChangePasswordResult | null>(null);
  const [passwordChecks, setPasswordChecks] = useState(() => passwordStrengthChecks(""));
  const [confirmationText, setConfirmationText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [hasVerificationValue, setHasVerificationValue] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const submissionLockRef = useRef(false);
  const otpLockRef = useRef(false);
  const changeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sessionTriggerRef = useRef<HTMLButtonElement | null>(null);
  const changeFormRef = useRef<HTMLFormElement | null>(null);
  const sessionFormRef = useRef<HTMLFormElement | null>(null);
  const deleteFormRef = useRef<HTMLFormElement | null>(null);
  const currentPasswordRef = useRef<HTMLInputElement | null>(null);
  const newPasswordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  const deletePasswordRef = useRef<HTMLInputElement | null>(null);
  const sessionPasswordRef = useRef<HTMLInputElement | null>(null);
  const verificationCodeRef = useRef<HTMLInputElement | null>(null);
  const confirmationTextRef = useRef<HTMLInputElement | null>(null);
  const deleteContinueRef = useRef<HTMLButtonElement | null>(null);

  const clearDialogValues = useCallback(() => {
    changeFormRef.current?.reset();
    deleteFormRef.current?.reset();
    sessionFormRef.current?.reset();
    setPasswordChecks(passwordStrengthChecks(""));
    setConfirmationText("");
    setAcknowledged(false);
    setHasVerificationValue(false);
    setChangeErrors({});
    setDeleteErrors({});
    setSessionErrors({});
    setOtpMessage(null);
  }, []);

  const closeDialog = useCallback(
    (restoreFocus: boolean) => {
      const activeDialog = dialog;
      clearDialogValues();
      setDeleteStep(1);
      setDialog(null);

      if (restoreFocus) {
        window.requestAnimationFrame(() => {
          const trigger =
            activeDialog === "change-password"
              ? changeTriggerRef.current
              : activeDialog === "sign-out-everywhere"
                ? sessionTriggerRef.current
                : deleteTriggerRef.current;
          trigger?.focus();
        });
      }
    },
    [clearDialogValues, dialog],
  );

  async function submitPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || submissionLockRef.current) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawInput = {
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
      currentPassword: String(formData.get("currentPassword") ?? ""),
      newPassword: String(formData.get("newPassword") ?? ""),
    };
    const clientErrors = validatePasswordChangeFields(rawInput);

    if (Object.keys(clientErrors).length > 0) {
      setChangeErrors(clientErrors);
      form.reset();
      setPasswordChecks(passwordStrengthChecks(""));
      const firstRef = clientErrors.currentPassword
        ? currentPasswordRef
        : clientErrors.newPassword
          ? newPasswordRef
          : confirmPasswordRef;
      window.requestAnimationFrame(() => firstRef.current?.focus());
      return;
    }

    setChangeErrors({});
    submissionLockRef.current = true;
    setIsSubmitting(true);
    const result: ChangePasswordResult = await changeCustomerPasswordAction(formData).catch(
      () =>
        ({
          message: "Password changes are temporarily unavailable. Try again shortly.",
          status: "error",
        }) satisfies ChangePasswordResult,
    );
    form.reset();
    setPasswordChecks(passwordStrengthChecks(""));
    submissionLockRef.current = false;
    setIsSubmitting(false);

    if (result.status === "success" || result.status === "warning") {
      setPageMessage(result);
      closeDialog(true);
      return;
    }

    if (result.status === "unauthenticated") {
      window.location.assign("/login?next=%2Faccount%2Fsecurity");
      return;
    }

    setChangeErrors(result.fieldErrors ?? {});
    setPageMessage(null);
    window.requestAnimationFrame(() => {
      if (result.fieldErrors?.newPassword) {
        newPasswordRef.current?.focus();
      } else {
        currentPasswordRef.current?.focus();
      }
    });
  }

  async function sendDeletionOtp() {
    if (isSendingOtp || isSubmitting || otpLockRef.current) {
      return;
    }

    otpLockRef.current = true;
    setIsSendingOtp(true);
    const result = await requestAccountDeletionOtpAction().catch(() => ({
      message: "A verification code could not be sent. Try again shortly.",
      status: "error" as const,
    }));
    otpLockRef.current = false;
    setIsSendingOtp(false);
    setOtpMessage(result.message);

    if (result.status === "unauthenticated") {
      window.location.assign("/login?next=%2Faccount%2Fsecurity");
    } else if (result.status === "sent") {
      window.requestAnimationFrame(() => verificationCodeRef.current?.focus());
    }
  }

  async function submitSignOutEverywhere(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || submissionLockRef.current) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");

    if (!currentPassword) {
      setSessionErrors({ currentPassword: "Enter your current password." });
      window.requestAnimationFrame(() => sessionPasswordRef.current?.focus());
      return;
    }

    setSessionErrors({});
    submissionLockRef.current = true;
    setIsSubmitting(true);
    const result: ChangePasswordResult = await signOutEverywhereAction(formData).catch(
      () => ({
        message: "Sessions could not be revoked right now. Try again shortly.",
        status: "error",
      }),
    );
    form.reset();
    submissionLockRef.current = false;
    setIsSubmitting(false);

    if (result.status === "success" || result.status === "unauthenticated") {
      window.location.replace("/login?success=logout");
      return;
    }

    setSessionErrors(result.fieldErrors ?? {});
    window.requestAnimationFrame(() => sessionPasswordRef.current?.focus());
  }

  async function submitDeletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      isSubmitting ||
      submissionLockRef.current ||
      confirmationText !== "DELETE" ||
      !acknowledged ||
      !hasVerificationValue
    ) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setDeleteErrors({});
    submissionLockRef.current = true;
    setIsSubmitting(true);
    const result: DeleteAccountResult = await deleteCustomerAccountAction(formData).catch(() => ({
      message:
        "Your account could not be deleted right now. No changes were made. Try again shortly.",
      status: "error" as const,
    }));
    submissionLockRef.current = false;
    setIsSubmitting(false);

    if (result.status === "deleted" || result.status === "pending") {
      form.reset();
      clearCart();
      window.localStorage.removeItem("grocery-store-pro.cart.v1");
      for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
        const key = window.localStorage.key(index);

        if (key && /^sb-.+-auth-token$/.test(key)) {
          window.localStorage.removeItem(key);
        }
      }
      window.location.replace(
        result.status === "pending"
          ? "/account-deleted?status=pending"
          : "/account-deleted",
      );
      return;
    }

    if (result.status === "unauthenticated") {
      window.location.assign("/login?next=%2Faccount%2Fsecurity");
      return;
    }

    setDeleteErrors(result.fieldErrors ?? {});
    if (hasPassword) {
      if (deletePasswordRef.current) {
        deletePasswordRef.current.value = "";
      }
      setHasVerificationValue(false);
      window.requestAnimationFrame(() => deletePasswordRef.current?.focus());
    } else {
      if (verificationCodeRef.current) {
        verificationCodeRef.current.value = "";
      }
      setHasVerificationValue(false);
      window.requestAnimationFrame(() => verificationCodeRef.current?.focus());
    }
  }

  const passwordInitialFocus = currentPasswordRef as RefObject<HTMLElement | null>;
  const deletionInitialFocus = (
    deleteStep === 1
      ? deleteContinueRef
      : hasPassword
        ? deletePasswordRef
        : verificationCodeRef
  ) as RefObject<HTMLElement | null>;
  const activeTrigger = (
    dialog === "change-password"
      ? changeTriggerRef
      : dialog === "sign-out-everywhere"
        ? sessionTriggerRef
        : deleteTriggerRef
  ) as RefObject<HTMLButtonElement | null>;
  const activeInitialFocus =
    dialog === "change-password"
      ? passwordInitialFocus
      : dialog === "sign-out-everywhere"
        ? (sessionPasswordRef as RefObject<HTMLElement | null>)
        : deletionInitialFocus;
  const providerDescription = providerNames.length
    ? providerNames.join(", ")
    : "your verified email";

  return (
    <>
      <div className="grid gap-5">
        {pageMessage ? (
          <div
            aria-live="polite"
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold leading-6 ${
              pageMessage.status === "warning"
                ? "border-warning/40 bg-cta-soft text-warning"
                : "border-fresh/30 bg-fresh-soft text-primary"
            }`}
            role="status"
          >
            <p>{pageMessage.message}</p>
            {pageMessage.status === "warning" ? (
              <button
                className="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-lg px-1 font-extrabold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning"
                onClick={() => setDialog("sign-out-everywhere")}
                ref={sessionTriggerRef}
                type="button"
              >
                Sign out everywhere
              </button>
            ) : null}
          </div>
        ) : null}

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fresh-soft text-primary">
                <AccountIcon className="h-5 w-5" name="lock" />
              </span>
              <div>
                <h2 className="text-xl font-black text-text">Password</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
                  {hasPassword
                    ? "Change your password using your current password. Choose a strong, unique password that you do not use elsewhere."
                    : `This account uses ${providerDescription}. Use verified email recovery to create or reset a password.`}
                </p>
                <Link
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/login?mode=forgot&next=/account/security"
                  prefetch={false}
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            {hasPassword ? (
              <button
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
                onClick={() => {
                  setPageMessage(null);
                  setDialog("change-password");
                }}
                ref={changeTriggerRef}
                type="button"
              >
                Change password
              </button>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fresh-soft text-primary">
                <AccountIcon className="h-5 w-5" name="security" />
              </span>
              <div>
                <h2 className="text-xl font-black text-text">Current session</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
                  Sign out when using a shared device. This clears the server-managed customer session for this browser.
                </p>
              </div>
            </div>
            <form action={customerLogoutAction}>
              <button
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-extrabold text-text transition-colors hover:border-primary/25 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:w-auto motion-reduce:transition-none"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-2xl border border-danger/25 bg-surface p-4 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-danger">
            Danger zone
          </p>
          <h2 className="mt-1 text-xl font-black text-text">Delete account</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
            Permanently remove your customer account and personal account data. Some order, tax or accounting records may be retained or anonymised where the store is legally required to keep them.
          </p>
          <p className="mt-2 text-sm font-extrabold text-text">
            This action cannot be undone.
          </p>
          <button
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-danger/45 bg-surface px-4 text-sm font-extrabold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger motion-reduce:transition-none"
            onClick={() => {
              setDeleteStep(1);
              setDialog("delete-account");
            }}
            ref={deleteTriggerRef}
            type="button"
          >
            <AccountIcon className="h-4.5 w-4.5" name="profile" />
            Delete my account
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-fresh-soft/70 p-4 sm:p-5">
          <h2 className="text-base font-black text-text">Privacy and account help</h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            <Link
              className="inline-flex min-h-11 items-center text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/privacy"
            >
              Privacy policy
            </Link>
            <a
              className="inline-flex min-h-11 items-center text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={`mailto:${BUSINESS_CONFIG.publicEmail}`}
            >
              Contact store
            </a>
          </div>
        </section>
      </div>

      <SecurityDialog
        description={
          dialog === "change-password"
            ? "Enter your current password and choose a new password for your account."
            : dialog === "sign-out-everywhere"
              ? "Verify your current password to revoke every customer session, including this one."
            : deleteStep === 1
              ? "Review what will be removed before continuing."
              : "Verify your identity and confirm that you understand this action is permanent."
        }
        initialFocusRef={activeInitialFocus}
        isBusy={isSubmitting}
        onClose={closeDialog}
        open={dialog !== null}
        title={
          dialog === "change-password"
            ? "Change password"
            : dialog === "sign-out-everywhere"
              ? "Sign out everywhere"
            : deleteStep === 1
              ? "Delete your account?"
              : "Confirm account deletion"
        }
        triggerRef={activeTrigger}
      >
        {dialog === "change-password" ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={submitPasswordChange}
            ref={changeFormRef}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              {Object.keys(changeErrors).length > 0 ? (
                <div
                  aria-live="assertive"
                  className="mb-4 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm font-semibold text-danger"
                  role="alert"
                >
                  Check the highlighted fields. Password values have been cleared.
                </div>
              ) : null}
              <div>
                <label className="text-sm font-bold text-text" htmlFor="change-current-password">
                  Current password
                </label>
                <PasswordInput
                  ariaDescribedBy={changeErrors.currentPassword ? "change-current-password-error" : undefined}
                  ariaInvalid={Boolean(changeErrors.currentPassword)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  id="change-current-password"
                  inputRef={currentPasswordRef}
                  maxLength={ACCOUNT_PASSWORD_POLICY.maxLength}
                  name="currentPassword"
                  required
                  showControlLabel="current password"
                />
                <FieldError id="change-current-password-error" message={changeErrors.currentPassword} />
              </div>
              <div className="mt-5">
                <label className="text-sm font-bold text-text" htmlFor="change-new-password">
                  New password
                </label>
                <PasswordInput
                  ariaDescribedBy={`new-password-requirements${changeErrors.newPassword ? " change-new-password-error" : ""}`}
                  ariaInvalid={Boolean(changeErrors.newPassword)}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  id="change-new-password"
                  inputRef={newPasswordRef}
                  maxLength={ACCOUNT_PASSWORD_POLICY.maxLength}
                  name="newPassword"
                  onValueChange={(value) => setPasswordChecks(passwordStrengthChecks(value))}
                  required
                  showControlLabel="new password"
                />
                <FieldError id="change-new-password-error" message={changeErrors.newPassword} />
                <PasswordRequirements checks={passwordChecks} />
              </div>
              <div className="mt-5">
                <label className="text-sm font-bold text-text" htmlFor="change-confirm-password">
                  Confirm new password
                </label>
                <PasswordInput
                  ariaDescribedBy={changeErrors.confirmPassword ? "change-confirm-password-error" : undefined}
                  ariaInvalid={Boolean(changeErrors.confirmPassword)}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  id="change-confirm-password"
                  inputRef={confirmPasswordRef}
                  maxLength={ACCOUNT_PASSWORD_POLICY.maxLength}
                  name="confirmPassword"
                  required
                  showControlLabel="new-password confirmation"
                />
                <FieldError id="change-confirm-password-error" message={changeErrors.confirmPassword} />
              </div>
              <label className="mt-5 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted p-3 text-sm font-semibold leading-6 text-text">
                <input
                  className="mt-1 h-5 w-5 shrink-0 accent-primary"
                  defaultChecked
                  disabled={isSubmitting}
                  name="revokeOtherSessions"
                  type="checkbox"
                />
                <span>Sign out of my other devices</span>
              </label>
            </div>
            <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-extrabold text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-50"
                disabled={isSubmitting}
                onClick={() => closeDialog(true)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-white hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-65"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? <Spinner /> : null}
                {isSubmitting ? "Updating password…" : "Update password"}
              </button>
            </footer>
          </form>
        ) : dialog === "sign-out-everywhere" ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={submitSignOutEverywhere}
            ref={sessionFormRef}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {sessionErrors.currentPassword ? (
                <div
                  aria-live="assertive"
                  className="mb-4 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm font-semibold text-danger"
                  role="alert"
                >
                  Verification failed. The password field has been cleared.
                </div>
              ) : null}
              <label className="text-sm font-bold text-text" htmlFor="sessions-current-password">
                Current password
              </label>
              <PasswordInput
                ariaDescribedBy={sessionErrors.currentPassword ? "sessions-current-password-error" : "sessions-current-password-hint"}
                ariaInvalid={Boolean(sessionErrors.currentPassword)}
                autoComplete="current-password"
                disabled={isSubmitting}
                id="sessions-current-password"
                inputRef={sessionPasswordRef}
                maxLength={ACCOUNT_PASSWORD_POLICY.maxLength}
                name="currentPassword"
                required
                showControlLabel="current password"
              />
              <p className="mt-2 text-sm leading-6 text-text-muted" id="sessions-current-password-hint">
                This signs out all browsers and devices. You will need to sign in again here.
              </p>
              <FieldError id="sessions-current-password-error" message={sessionErrors.currentPassword} />
            </div>
            <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-extrabold text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:opacity-50"
                disabled={isSubmitting}
                onClick={() => closeDialog(true)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-white hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-65"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? <Spinner /> : null}
                {isSubmitting ? "Signing out…" : "Sign out everywhere"}
              </button>
            </footer>
          </form>
        ) : dialog === "delete-account" && deleteStep === 1 ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <p className="text-sm font-bold text-text">This will permanently remove:</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-muted">
                {[
                  "Your customer profile",
                  "Saved delivery addresses",
                  "Wishlist items",
                  "Saved cart data",
                  "Account preferences",
                  "Access to your customer account",
                ].map((item) => (
                  <li className="flex gap-2" key={item}>
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl border border-warning/35 bg-cta-soft p-4 text-sm leading-6 text-text">
                Orders and legally required transaction records may be retained in an anonymised or restricted form.
              </div>
              <p className="mt-4 text-sm font-extrabold leading-6 text-danger">
                You will be signed out immediately and cannot undo this action.
              </p>
            </div>
            <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-extrabold text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                onClick={() => closeDialog(true)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-danger px-5 text-sm font-extrabold text-white hover:bg-danger/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                onClick={() => setDeleteStep(2)}
                ref={deleteContinueRef}
                type="button"
              >
                Continue
              </button>
            </footer>
          </div>
        ) : dialog === "delete-account" ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={submitDeletion}
            ref={deleteFormRef}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              {Object.keys(deleteErrors).length > 0 ? (
                <div
                  aria-live="assertive"
                  className="mb-4 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm font-semibold text-danger"
                  role="alert"
                >
                  {hasPassword
                    ? "Verification failed. The password field has been cleared."
                    : "Verification failed. The code field has been cleared."}
                </div>
              ) : null}
              {hasPassword ? (
                <div>
                  <label className="text-sm font-bold text-text" htmlFor="delete-current-password">
                    Current password
                  </label>
                  <PasswordInput
                    ariaDescribedBy={deleteErrors.currentPassword ? "delete-current-password-error" : undefined}
                    ariaInvalid={Boolean(deleteErrors.currentPassword)}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    id="delete-current-password"
                    inputRef={deletePasswordRef}
                    maxLength={ACCOUNT_PASSWORD_POLICY.maxLength}
                    name="currentPassword"
                    onValueChange={(value) => setHasVerificationValue(value.length > 0)}
                    required
                    showControlLabel="current password"
                  />
                  <FieldError id="delete-current-password-error" message={deleteErrors.currentPassword} />
                </div>
              ) : (
                <div>
                  <p className="text-sm leading-6 text-text-muted">
                    This {providerDescription} account requires a fresh code sent to its verified email address.
                  </p>
                  <button
                    className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-primary/30 bg-surface px-4 text-sm font-extrabold text-primary hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-60"
                    disabled={isSendingOtp || isSubmitting}
                    onClick={sendDeletionOtp}
                    type="button"
                  >
                    {isSendingOtp ? "Sending code…" : "Send verification code"}
                  </button>
                  {otpMessage ? (
                    <p aria-live="polite" className="mt-2 text-sm font-semibold text-text-muted" role="status">
                      {otpMessage}
                    </p>
                  ) : null}
                  <label className="mt-4 block text-sm font-bold text-text" htmlFor="delete-verification-code">
                    Verification code
                  </label>
                  <input
                    aria-describedby={deleteErrors.verificationCode ? "delete-verification-code-error" : undefined}
                    aria-invalid={Boolean(deleteErrors.verificationCode)}
                    autoComplete="one-time-code"
                    className={`mt-2 h-[3.125rem] w-full rounded-xl border bg-surface px-4 text-base text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-cta/20 ${
                      deleteErrors.verificationCode ? "border-danger" : "border-border"
                    }`}
                    disabled={isSubmitting}
                    id="delete-verification-code"
                    inputMode="numeric"
                    maxLength={12}
                    name="verificationCode"
                    onChange={(event) => setHasVerificationValue(event.currentTarget.value.length > 0)}
                    ref={verificationCodeRef}
                    required
                  />
                  <FieldError id="delete-verification-code-error" message={deleteErrors.verificationCode} />
                </div>
              )}
              <div className="mt-5">
                <label className="text-sm font-bold text-text" htmlFor="delete-confirmation-text">
                  Type DELETE to confirm
                </label>
                <input
                  aria-describedby={deleteErrors.confirmationText ? "delete-confirmation-text-error" : "delete-confirmation-hint"}
                  aria-invalid={Boolean(deleteErrors.confirmationText)}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className={`mt-2 h-[3.125rem] w-full rounded-xl border bg-surface px-4 text-base font-bold tracking-[0.08em] text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-cta/20 ${
                    deleteErrors.confirmationText ? "border-danger" : "border-border"
                  }`}
                  disabled={isSubmitting}
                  id="delete-confirmation-text"
                  maxLength={16}
                  name="confirmationText"
                  onChange={(event) => setConfirmationText(event.currentTarget.value)}
                  ref={confirmationTextRef}
                  spellCheck={false}
                />
                <p className="mt-2 text-xs leading-5 text-text-muted" id="delete-confirmation-hint">
                  The confirmation is case-sensitive.
                </p>
                <FieldError id="delete-confirmation-text-error" message={deleteErrors.confirmationText} />
              </div>
              <label className={`mt-5 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm font-semibold leading-6 text-text ${
                deleteErrors.acknowledgement ? "border-danger bg-danger-soft" : "border-border bg-surface-muted"
              }`}>
                <input
                  aria-describedby={deleteErrors.acknowledgement ? "delete-acknowledgement-error" : undefined}
                  aria-invalid={Boolean(deleteErrors.acknowledgement)}
                  className="mt-1 h-5 w-5 shrink-0 accent-danger"
                  disabled={isSubmitting}
                  name="acknowledgement"
                  onChange={(event) => setAcknowledged(event.currentTarget.checked)}
                  type="checkbox"
                />
                <span>I understand that this action cannot be undone.</span>
              </label>
              <FieldError id="delete-acknowledgement-error" message={deleteErrors.acknowledgement} />
            </div>
            <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-extrabold text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-50"
                disabled={isSubmitting}
                onClick={() => closeDialog(true)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-danger px-5 text-sm font-extrabold text-white hover:bg-danger/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:bg-danger/35 disabled:text-white/90"
                disabled={
                  isSubmitting ||
                  confirmationText !== "DELETE" ||
                  !acknowledged ||
                  !hasVerificationValue
                }
                type="submit"
              >
                {isSubmitting ? <Spinner /> : null}
                {isSubmitting ? "Deleting account…" : "Permanently delete account"}
              </button>
            </footer>
          </form>
        ) : null}
      </SecurityDialog>
    </>
  );
}
