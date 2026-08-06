# Vercel BFF to Tailscale Funnel deployment contract

The browser calls only same-origin `/api/demo/*`. Vercel Route Handlers call a
public Tailscale Funnel origin, which proxies to the minimal loopback AURA
gateway. The Funnel hostname and every credential are server-only.

Configure these variables separately for Preview and Production, without any
`NEXT_PUBLIC_` prefix:

- `AURA_SERVER_BASE_URL`
- `AURA_DEMO_SERVICE_TOKEN`
- `AURA_CLIENT_SUBJECT_HMAC_KEY`
- `AURA_DEMO_SESSION_COOKIE`
- `AURA_BFF_TIMEOUT_MS`
- `AURA_TRUSTED_INGRESS_MODE=vercel`
- `AURA_BACKEND_MODE=tailscale-funnel`

`AURA_SERVER_BASE_URL` must be a pathless HTTPS origin with no credentials,
query, or fragment. Its hostname must have the stable Funnel form
`<device>.<tailnet>.ts.net`. Preview requires explicit port 8443. Production
requires the default HTTPS port 443, represented without an explicit port.
Only loopback origins are accepted outside production for local tests.

The BFF sends AURA's service token and route-scoped client-subject/session
headers. It sends no provider-specific access credential. Fetch is `no-store`,
rejects redirects, uses one bounded deadline and response size, requires strict
JSON with fatal UTF-8 decoding, and never retries a mutation automatically.
HTML or other non-JSON proxy errors, DNS failure, an offline node, an inactive
Funnel, and network failure map to the fixed public unavailable envelope.

Funnel is a public internet service, not an authentication layer. Do not rely
on tailnet identity, ACLs, source IP, or CORS. Vercel derives a source-independent
opaque client subject from its trusted ingress metadata, but AURA authorization
still rests on the independent high-entropy service token and session contract.

Preview and Production must use distinct AURA service tokens, HMAC keys, JWT
secrets, cookie names, databases, and provider credentials. They normally share
one stable Funnel hostname using ports 8443 and 443. If Vercel cannot call 8443,
stop and obtain an explicit one-profile-at-a-time port-443 decision; do not add
an unreviewed hostname or relax URL validation.

Do not expose the Funnel hostname in client bundles, response JSON, analytics,
or logs. Do not enable public traffic until local readiness, Preview smoke,
browser checks, and explicit go-live approval have passed.

Tailscale currently labels Funnel beta and documents non-configurable bandwidth
limits. Treat origin availability as best effort, not SLA-backed.

Official references:

- <https://tailscale.com/docs/features/tailscale-funnel>
- <https://tailscale.com/docs/reference/tailscale-cli/funnel>
