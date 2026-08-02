-- Security-sensitive attempt limits must be shared by every application
-- instance. Keys are HMAC pseudonyms; no email address, IP address, password,
-- token, or raw customer identifier is stored.
CREATE TABLE "SecurityRateLimit" (
  "keyHash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityRateLimit_pkey" PRIMARY KEY ("keyHash")
);

CREATE INDEX "SecurityRateLimit_updatedAt_idx"
  ON "SecurityRateLimit"("updatedAt");

ALTER TABLE "SecurityRateLimit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "SecurityRateLimit" FROM anon, authenticated;
