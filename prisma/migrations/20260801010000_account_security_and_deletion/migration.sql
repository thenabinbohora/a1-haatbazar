-- Link app customers to their immutable Supabase Auth identity, add an
-- idempotent deletion ledger, and permit retained orders to be detached from
-- a deleted customer. Security/audit tables are server-only and have no Data
-- API grants or customer policies.

ALTER TYPE public."UserStatus" ADD VALUE IF NOT EXISTS 'DELETION_PENDING';

CREATE TYPE public."AccountDeletionStatus" AS ENUM (
  'PENDING',
  'CLEANUP_COMPLETE',
  'COMPLETED',
  'FAILED'
);

CREATE TYPE public."SecurityEventType" AS ENUM (
  'PASSWORD_CHANGE_STARTED',
  'PASSWORD_CHANGE_SUCCEEDED',
  'PASSWORD_CHANGE_FAILED',
  'PASSWORD_SESSIONS_REVOKED',
  'DELETION_VERIFICATION_FAILED',
  'DELETION_REQUESTED',
  'DELETION_CLEANUP_COMPLETED',
  'DELETION_SESSIONS_REVOKED',
  'DELETION_AUTH_USER_DELETED',
  'DELETION_COMPLETED',
  'DELETION_FAILED',
  'SECURITY_NOTIFICATION_SENT',
  'SECURITY_NOTIFICATION_FAILED'
);

CREATE TYPE public."CustomerAuthMethod" AS ENUM (
  'PASSWORD',
  'EMAIL_OTP',
  'OAUTH'
);

ALTER TABLE public."User"
  ADD COLUMN "supabaseAuthUserId" text,
  ADD COLUMN "authMethod" public."CustomerAuthMethod";

UPDATE public."User"
SET "authMethod" = CASE
  WHEN "passwordHash" IS NULL THEN 'EMAIL_OTP'::public."CustomerAuthMethod"
  ELSE 'PASSWORD'::public."CustomerAuthMethod"
END
WHERE "role" = 'CUSTOMER'::public."UserRole";

UPDATE public."User" AS app_user
SET "supabaseAuthUserId" = auth_user.id::text
FROM auth.users AS auth_user
WHERE app_user."role" = 'CUSTOMER'::public."UserRole"
  AND lower(app_user."email") = lower(auth_user.email)
  AND app_user."supabaseAuthUserId" IS NULL;

CREATE UNIQUE INDEX "User_supabaseAuthUserId_key"
  ON public."User"("supabaseAuthUserId");

ALTER TABLE public."Order"
  DROP CONSTRAINT "Order_userId_fkey";

ALTER TABLE public."Order"
  ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE public."Order"
  ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES public."User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE public."AccountDeletionRequest" (
  "id" text NOT NULL,
  "eventId" text NOT NULL,
  "subjectHash" text,
  "appUserId" text,
  "supabaseAuthUserId" text,
  "status" public."AccountDeletionStatus" NOT NULL DEFAULT 'PENDING',
  "failureStage" text,
  "attemptCount" integer NOT NULL DEFAULT 0,
  "cleanupCompletedAt" timestamp(3),
  "completedAt" timestamp(3),
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL,
  CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE public."SecurityAuditEvent" (
  "id" text NOT NULL,
  "eventId" text NOT NULL,
  "requestId" text,
  "subjectHash" text,
  "ipHash" text,
  "event" public."SecurityEventType" NOT NULL,
  "outcome" text NOT NULL,
  "metadata" jsonb,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AccountDeletionRequest_eventId_key"
  ON public."AccountDeletionRequest"("eventId");
CREATE UNIQUE INDEX "AccountDeletionRequest_subjectHash_key"
  ON public."AccountDeletionRequest"("subjectHash");
CREATE INDEX "AccountDeletionRequest_status_updatedAt_idx"
  ON public."AccountDeletionRequest"("status", "updatedAt");
CREATE INDEX "AccountDeletionRequest_appUserId_idx"
  ON public."AccountDeletionRequest"("appUserId");
CREATE INDEX "AccountDeletionRequest_supabaseAuthUserId_idx"
  ON public."AccountDeletionRequest"("supabaseAuthUserId");
CREATE INDEX "SecurityAuditEvent_eventId_createdAt_idx"
  ON public."SecurityAuditEvent"("eventId", "createdAt");
CREATE INDEX "SecurityAuditEvent_requestId_createdAt_idx"
  ON public."SecurityAuditEvent"("requestId", "createdAt");
CREATE INDEX "SecurityAuditEvent_event_createdAt_idx"
  ON public."SecurityAuditEvent"("event", "createdAt");

ALTER TABLE public."AccountDeletionRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SecurityAuditEvent" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."AccountDeletionRequest" FROM anon, authenticated;
REVOKE ALL ON public."SecurityAuditEvent" FROM anon, authenticated;

-- Deleted/disabled accounts must fail ownership lookup even while an already
-- issued access JWT remains cryptographically valid. Immutable Auth UUIDs are
-- used instead of mutable JWT email claims.
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT app_user."id"
  FROM public."User" AS app_user
  WHERE app_user."supabaseAuthUserId" = (SELECT auth.uid())::text
    AND app_user."status" = 'ACTIVE'::public."UserStatus"
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_app_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."User" AS app_user
    WHERE app_user."supabaseAuthUserId" = (SELECT auth.uid())::text
      AND app_user."role" = 'ADMIN'::public."UserRole"
      AND app_user."status" = 'ACTIVE'::public."UserStatus"
  );
$$;

REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_app_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_app_user_is_admin() TO anon, authenticated;
