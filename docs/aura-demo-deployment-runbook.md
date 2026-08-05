# AURA website demo deployment runbook

This provider-independent runbook prepares the portfolio BFF and frontend for a
later staging deployment. It does not authorize secret provisioning, migration,
provider changes, or public traffic.

## Runtime contract

- Build the repository `Dockerfile` from a reviewed commit. The Next.js build
  uses standalone output and the runtime image runs as an unprivileged user.
- Terminate HTTPS at the selected trusted ingress and forward a canonical HTTPS
  request URL to Next.js. Production BFF configuration rejects a non-HTTPS AURA
  base URL.
- Keep AURA private. Browser code may call only the same-origin `/api/demo/*`
  routes and must never receive the internal URL or either credential.
- Use `/api/health` for liveness. It has a fixed, no-store response and does not
  probe AURA or reveal configuration.
- All BFF responses remain no-store. Baseline response headers disable MIME
  sniffing and framing, limit referrer detail, and deny camera, microphone, and
  geolocation permissions.

## Required variable names

Provision values only in the selected platform's secret manager. Never put
values in source, build arguments, `NEXT_PUBLIC_*`, logs, or support chat.

- `AURA_INTERNAL_BASE_URL`
- `AURA_DEMO_SERVICE_TOKEN`
- `AURA_DEMO_SESSION_COOKIE`
- `AURA_BFF_TIMEOUT_MS`
- deployment-specific trusted proxy/client-IP variables after provider review

The service token must match the AURA token and pass the same 32–512 character,
non-placeholder, non-repeated, no-control-character validation. The cookie name
must be dedicated to this demo and stable for the deployment. The BFF timeout
must remain within its validated bound and no mutating request may be retried
automatically.

## Trusted ingress gate

Same-origin checks compare the browser Origin with the canonical request URL
seen by Next.js. Before staging, prove that the provider supplies the external
HTTPS host/scheme correctly and does not permit browser headers to override it.

Client-subject rate limiting is intentionally not derived yet. It requires a
provider guarantee that a documented client-IP header is overwritten by trusted
ingress. Once selected, add a coordinated AURA and website change that
canonicalizes the address, computes a server-only HMAC digest, forwards only the
opaque digest, and never stores or logs the raw address.

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
