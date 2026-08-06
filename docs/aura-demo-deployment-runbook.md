# AURA website deployment runbook

Vercel hosts the public Next.js website and BFF. The BFF reaches a manually
enabled public Tailscale Funnel, which forwards to the dedicated loopback-only
AURA gateway. Browser code calls only same-origin `/api/demo/*` and receives no
origin or credential values.

Preview uses the stable `*.ts.net` origin on HTTPS 8443. Production uses the
same hostname on default HTTPS 443. Paths, credentials, queries, fragments,
non-Tailscale hosts, incorrect ports, and localhost in production fail closed.
Direct Vercel runtime is verified with `VERCEL=1` and
`VERCEL_ENV=preview|production`.

Configure these server-only variables separately in Vercel Preview and
Production. None may use `NEXT_PUBLIC_`:

- `AURA_SERVER_BASE_URL`
- `AURA_DEMO_SERVICE_TOKEN`
- `AURA_CLIENT_SUBJECT_HMAC_KEY`
- `AURA_DEMO_SESSION_COOKIE`
- `AURA_BFF_TIMEOUT_MS`
- `AURA_TRUSTED_INGRESS_MODE`
- `AURA_BACKEND_MODE`

Set `AURA_TRUSTED_INGRESS_MODE=vercel` and
`AURA_BACKEND_MODE=tailscale-funnel`. Every upstream request sends only the
matching AURA service token and route-scoped session/client-subject headers.
Fetch rejects redirects, uses `no-store`, one deadline, bounded response bytes,
strict content type and DTOs, and no mutation retry. Non-JSON Funnel/proxy
errors and offline failures map to fixed safe public errors.

Funnel is public. The application does not trust tailnet identity, ACLs, source
IP, or CORS for authorization. Deploy Preview only after the Tailscale account,
local secret, database, and Windows gates. Public Production traffic remains
blocked until explicit go-live approval.

See `vercel-tailscale-funnel-deployment.md` for the port fallback decision,
rotation boundaries, failure behavior, and rollback.
