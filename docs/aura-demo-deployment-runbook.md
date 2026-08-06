# AURA website deployment runbook

Vercel hosts the public Next.js website and BFF. The BFF reaches the Windows
AURA origin through a named Cloudflare Tunnel protected by Access Service Auth.
Browser code calls only same-origin `/api/demo/*` routes and receives none of
the origin or credential values.

Preview requires a pathless HTTPS hostname beginning `aura-staging.`;
Production requires one beginning `aura-api.`. Localhost, IP literals,
Quick-Tunnel hostnames, Cloudflare tunnel endpoints, Vercel hostnames, ports,
paths, credentials, queries, and fragments fail closed. Direct Vercel runtime
is verified using `VERCEL=1` and `VERCEL_ENV=preview|production`.

Configure these server-only variables separately in Vercel Preview and
Production. None may use `NEXT_PUBLIC_`:

- `AURA_SERVER_BASE_URL`;
- `AURA_CF_ACCESS_CLIENT_ID`;
- `AURA_CF_ACCESS_CLIENT_SECRET`;
- `AURA_DEMO_SERVICE_TOKEN`;
- `AURA_CLIENT_SUBJECT_HMAC_KEY`;
- `AURA_DEMO_SESSION_COOKIE`;
- `AURA_BFF_TIMEOUT_MS`;
- `AURA_TRUSTED_INGRESS_MODE`.

Every upstream request sends the matching Cloudflare credential pair, the
matching AURA service token, and only the route-scoped session/client-subject
headers. Fetch uses `no-store`, redirect rejection, one overall deadline,
bounded response bytes, strict JSON content type, fatal UTF-8, and strict DTOs.
No mutation is automatically retried. Access denial HTML, redirect, laptop
offline, tunnel offline, DNS failure, or connection failure maps to the fixed
public `503 SERVICE_UNAVAILABLE` envelope without upstream content or names.

The BFF derives client identity before calling Cloudflare. It accepts only
Vercel's `x-vercel-forwarded-for`, rejects chains and malformed addresses,
canonicalizes IPv4/IPv6, and forwards only a lowercase HMAC-SHA-256 digest. It
ignores browser `x-forwarded-for`, `x-real-ip`, and Cloudflare headers.

Deploy Preview only after the Cloudflare, local secret, local database, and
Windows installation gates. Production must use distinct hostname, Access
token, AURA token, HMAC key, JWT secret, cookie name, database, and provider
credential. Public domain activation remains blocked until explicit go-live
approval.

See `vercel-cloudflare-deployment.md` for setup, rotation, tests, offline
behavior, and rollback.
