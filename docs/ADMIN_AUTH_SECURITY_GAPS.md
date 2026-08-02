# Administrator authentication security gaps

Last reviewed: 31 July 2026

## Current controls

- Server-side password verification with salted scrypt hashes.
- Constant-cost password work for missing accounts to reduce timing-based account discovery.
- Server-side `ACTIVE` status and `ADMIN` role validation.
- Protected admin layouts, admin server actions, and admin API guards.
- Opaque server-stored sessions with `HttpOnly`, `SameSite=Lax`, and production `Secure` cookies.
- Session rotation on successful authentication and server-side invalidation on logout.
- Account and network rate-limit signals with temporary incremental cooldowns.
- Generic credential, rate-limit, and service-failure messages.
- Admin-only validated return paths.
- Privacy-minimised structured authentication event logging.
- Supabase RLS policies for app-owned data; service-role credentials remain server-only.

## Known gaps

### Multi-factor authentication

MFA is not currently implemented for administrator accounts. The authentication shell is deliberately structured so a dedicated verification card can follow password verification, but no placeholder or fake MFA challenge is shown.

Recommended next work:

1. Choose a server-verified TOTP, passkey, or approved Supabase Auth assurance-level flow.
2. Store factor state outside user-editable metadata.
3. Require MFA for every active administrator.
4. Add rate-limited verification, recovery codes, factor revocation, and security-event logging.
5. Require recent re-authentication for sensitive administrator actions.

### Administrator password recovery

There is no administrator self-service password-recovery route. The login page therefore does not show a dead “Forgot password?” link. Recovery must remain a restricted operational process until a dedicated flow provides short-lived tokens, generic account-enumeration-safe responses, event logging, and session revocation.

### Distributed abuse protection

The current limiter is process-local. It provides useful protection for a single instance but does not coordinate counters across multiple regions or replicas.

Before multi-instance production deployment, move admin rate-limit state to a shared low-latency store, add trusted proxy/header configuration, and define alert thresholds. A challenge such as CAPTCHA should be introduced only after suspicious or repeated activity, not on every normal sign-in.

### Durable audit retention

Authentication events are structured and privacy-minimised, but durability depends on the deployment log drain. Configure restricted central storage, retention limits, access review, alerting, and clock synchronisation. A dedicated append-only database or security event service may be appropriate if compliance requirements increase.

### Session policy

The current administrator session has a 12-hour absolute lifetime and there is no trusted-device option or separate idle timeout. Review whether a shorter idle timeout is required for the production threat model. If a trusted-device feature is added later, it must remain unchecked by default, be revocable, and never use `localStorage` for session tokens.

### Independent verification

The implementation has automated functional and responsive checks, but it has not received an independent penetration test or formal accessibility audit. Test password-manager overlays and real mobile keyboards on the supported production browser/device matrix before launch.
