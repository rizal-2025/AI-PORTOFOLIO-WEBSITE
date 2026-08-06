# AURA website demo deployment runbook

This provider-independent runbook prepares the portfolio BFF and frontend for a
later staging deployment. It does not authorize secret provisioning, migration,
provider changes, or public traffic.

## Runtime contract

- Deploy the reviewed commit through Vercel's native Next.js Git integration;
  the provider does not use the repository Dockerfile.
- Vercel terminates HTTPS and supplies the canonical public request URL.
  Production BFF configuration accepts only a pathless Koyeb HTTPS origin.
- Browser code may call only same-origin `/api/demo/*` routes and must never
  receive the Koyeb URL or either credential.
- Use `/api/health` for liveness. It has a fixed, no-store response and does not
  probe AURA or reveal configuration.
- All BFF responses remain no-store. Baseline response headers disable MIME
  sniffing and framing, limit referrer detail, and deny camera, microphone, and
  geolocation permissions.

## Required variable names

Provision values only in the selected platform's secret manager. Never put
values in source, build arguments, `NEXT_PUBLIC_*`, logs, or support chat.

- `AURA_SERVER_BASE_URL`
- `AURA_DEMO_SERVICE_TOKEN`
- `AURA_DEMO_SESSION_COOKIE`
- `AURA_BFF_TIMEOUT_MS`
- `AURA_CLIENT_SUBJECT_HMAC_KEY`
- `AURA_TRUSTED_INGRESS_MODE`

The service token must match the AURA token and pass the same 32–512 character,
non-placeholder, non-repeated, no-control-character validation. The cookie name
must be dedicated to this demo and stable for the deployment. The BFF timeout
must remain within its validated bound and no mutating request may be retried
automatically.

## Trusted ingress contract

Same-origin checks compare the browser Origin with the canonical request URL
seen by Next.js. Direct Vercel runtime is verified using `VERCEL=1` and
`VERCEL_ENV`. The BFF reads only `x-vercel-forwarded-for`, canonicalizes one
address, and forwards only a server-keyed HMAC digest. A proxy or CDN in front
of Vercel invalidates this contract until re-audited.

## TLS, CSP, and monitoring

The selected provider must enforce HTTPS and HSTS after the final domain is
known. A CSP should be generated and browser-tested for the chosen runtime;
do not copy an unverified generic policy. Monitoring must cover health status,
safe error-code rates, latency/timeouts, rate limits, cleanup failures, and
readiness without logging bodies, cookies, raw addresses, or reservation
references.

## Rollback

Keep the previously verified image or deployment revision. Roll back by routing
traffic to that immutable revision, then verify `/api/health` and keep the demo
closed if AURA readiness, cookie flags, origin behavior, or bundle scans fail.
Feature branches are retained and no rollback should delete session/database
data.
