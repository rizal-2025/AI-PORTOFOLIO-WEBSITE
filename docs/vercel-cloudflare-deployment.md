# Vercel BFF to Cloudflare Access deployment contract

## Environment separation

| Vercel scope | AURA origin | Local target |
| --- | --- | --- |
| Preview | `https://aura-staging.<YOUR_CLOUDFLARE_DOMAIN>` | `http://127.0.0.1:8001` |
| Production | `https://aura-api.<YOUR_CLOUDFLARE_DOMAIN>` | `http://127.0.0.1:8000` |

For each scope configure `AURA_SERVER_BASE_URL`,
`AURA_CF_ACCESS_CLIENT_ID`, `AURA_CF_ACCESS_CLIENT_SECRET`,
`AURA_DEMO_SERVICE_TOKEN`, `AURA_CLIENT_SUBJECT_HMAC_KEY`,
`AURA_DEMO_SESSION_COOKIE`, `AURA_BFF_TIMEOUT_MS`, and
`AURA_TRUSTED_INGRESS_MODE`. The timeout is 1000–30000 milliseconds and the
trusted-ingress value is exactly `vercel`. Credentials are 32–512 characters,
non-placeholder, non-repeated, trimmed, and free of control characters.

Only the same environment's AURA service-token pair is equal: Vercel
`AURA_DEMO_SERVICE_TOKEN` equals local `DEMO_BFF_SERVICE_TOKEN`. Preview and
Production values otherwise differ. Access credentials are server-only and are
sent on every request as `CF-Access-Client-Id` and
`CF-Access-Client-Secret`. AURA's `X-BFF-Service-Token` remains independent.

## Cloudflare application

Create one self-hosted Access application for each hostname. Each application
has one `Service Auth` policy whose Include selector is only the matching
service token. Do not add public Allow, Bypass, Everyone, or email-login
fallback policies. Cache is disabled for the API hostnames. The tunnel route is
limited to `/internal/demo/*`; all other paths return 404.

Rotate without sharing: create a replacement environment-specific service
token, update the matching Vercel environment, deploy and test, then revoke the
old token. Cloudflare displays a client secret only once, so store it directly
in the matching Vercel sensitive variable and approved password manager. Never
put it in source, chat, screenshots, shell history, or reports.

## Staging and failure tests

Before promotion verify unauthenticated direct requests are denied, each BFF
request contains both Access headers and the AURA token, the wrong environment
token is denied, HTML/login responses do not cross the JSON boundary, and
network/timeout failures produce only the fixed public 503/504 envelopes.
Confirm browser attempts to inject Access, service, session, or client-subject
headers are rejected at the BFF.

The public demo depends on the Windows laptop, PostgreSQL, AURA, home internet,
and `cloudflared`. When any of those are unavailable, Vercel remains online but
the demo returns a safe temporary-unavailable response. There is no 24/7
availability guarantee.

Rollback selects the prior audited immutable Vercel deployment together with
its matching environment credentials. Never pair a Preview deployment with
Production credentials or route it to the production database.

Official references:

- <https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/>
- <https://developers.cloudflare.com/cloudflare-one/access-controls/policies/>
- <https://vercel.com/docs/headers/request-headers>
- <https://vercel.com/docs/environment-variables>
