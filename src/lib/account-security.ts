import { z } from "zod";

export const ACCOUNT_PASSWORD_POLICY = {
  maxLength: 128,
  minLength: 6,
  recommendedLength: 12,
  requiredCharacters: {
    lowercase: false,
    number: false,
    symbol: false,
    uppercase: false,
  },
} as const;

export type AccountPasswordPolicy = typeof ACCOUNT_PASSWORD_POLICY;

export type SecurityFieldErrors = Partial<
  Record<
    | "acknowledgement"
    | "confirmationText"
    | "confirmPassword"
    | "currentPassword"
    | "newPassword"
    | "verificationCode",
    string
  >
>;

export type ChangePasswordResult = {
  fieldErrors?: SecurityFieldErrors;
  message: string;
  status: "error" | "success" | "unauthenticated" | "warning";
};

export type DeleteAccountResult = {
  fieldErrors?: SecurityFieldErrors;
  message: string;
  status: "deleted" | "error" | "pending" | "unauthenticated";
};

export type DeletionOtpResult = {
  message: string;
  status: "error" | "sent" | "unauthenticated";
};

export const changePasswordInputSchema = z.object({
  confirmPassword: z.string().min(1).max(ACCOUNT_PASSWORD_POLICY.maxLength),
  currentPassword: z.string().min(1).max(ACCOUNT_PASSWORD_POLICY.maxLength),
  newPassword: z.string().min(1).max(ACCOUNT_PASSWORD_POLICY.maxLength),
  revokeOtherSessions: z.boolean(),
});

export const deleteAccountInputSchema = z.object({
  acknowledgement: z.boolean(),
  confirmationText: z.string().max(16),
  currentPassword: z.string().max(ACCOUNT_PASSWORD_POLICY.maxLength),
  verificationCode: z.string().max(12),
});

export function hasAccidentalOuterWhitespace(value: string) {
  return value.length > 0 && value !== value.trim();
}

export function validatePasswordChangeFields(input: {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
}) {
  const fieldErrors: SecurityFieldErrors = {};

  if (!input.currentPassword) {
    fieldErrors.currentPassword = "Enter your current password.";
  } else if (hasAccidentalOuterWhitespace(input.currentPassword)) {
    fieldErrors.currentPassword =
      "Remove accidental spaces from the beginning or end.";
  }

  if (!input.newPassword) {
    fieldErrors.newPassword = "Enter a new password.";
  } else if (hasAccidentalOuterWhitespace(input.newPassword)) {
    fieldErrors.newPassword =
      "Remove accidental spaces from the beginning or end.";
  } else if (input.newPassword.length < ACCOUNT_PASSWORD_POLICY.minLength) {
    fieldErrors.newPassword = `Use at least ${ACCOUNT_PASSWORD_POLICY.minLength} characters.`;
  }

  if (!input.confirmPassword) {
    fieldErrors.confirmPassword = "Confirm your new password.";
  } else if (hasAccidentalOuterWhitespace(input.confirmPassword)) {
    fieldErrors.confirmPassword =
      "Remove accidental spaces from the beginning or end.";
  } else if (input.newPassword !== input.confirmPassword) {
    fieldErrors.confirmPassword = "The new passwords do not match.";
  }

  if (
    input.currentPassword &&
    input.newPassword &&
    input.currentPassword === input.newPassword
  ) {
    fieldErrors.newPassword =
      "Choose a password that is different from your current password.";
  }

  return fieldErrors;
}

export function passwordStrengthChecks(password: string) {
  return {
    length: password.length >= ACCOUNT_PASSWORD_POLICY.recommendedLength,
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };
}
