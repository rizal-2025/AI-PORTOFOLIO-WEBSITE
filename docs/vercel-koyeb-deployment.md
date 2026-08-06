# Vercel BFF to Koyeb AURA deployment contract

This is a value-free configuration and promotion runbook. It does not authorize
provider account creation, secret entry, deployment, migration, domain changes,
or public traffic.

## Runtime boundary

- Import `rizal-2025/AI-PORTOFOLIO-WEBSITE` into a Vercel Hobby personal project.
- Use native Next.js deployment; the repository Dockerfile is not used by
  Vercel.
- Track `main` for Production. Use the retained provider feature branch for the
  first Preview validation.
- Run Node.js BFF functions in Frankfurt (`fra1`). The four demo routes export a
  60-second platform ceiling while `AURA_BFF_TIMEOUT_MS` supplies the smaller
  application-wide deadline. No mutating request is retried.
- Browser code calls only same-origin `/api/demo/*`. Koyeb and all credentials
  remain server-only.
- AURA is public-routable on Koyeb, so every request uses HTTPS, the exact
  configured `.koyeb.app` origin, the service token, and the opaque client
  subject. CORS is not authentication.

## Exact Vercel variables

Configure Preview and Production independently. Do not use `NEXT_PUBLIC_` for
any item in this table.

| Name | Class | Rule |
| --- | --- | --- |
| `AURA_SERVER_BASE_URL` | provider URL, server-only | Exact pathless Koyeb HTTPS origin for the matching environment. |
| `AURA_DEMO_SERVICE_TOKEN` | generated secret | Same value as Koyeb `DEMO_BFF_SERVICE_TOKEN`; 32–512 characters. |
| `AURA_CLIENT_SUBJECT_HMAC_KEY` | generated secret | Website-only key; 32–512 characters; never provision on Koyeb. |
| `AURA_DEMO_SESSION_COOKIE` | non-secret | A dedicated `__Host-` cookie name; Preview and Production names differ. |
| `AURA_BFF_TIMEOUT_MS` | non-secret | Recommended `30000`; validated range 1000–30000 milliseconds. |
| `AURA_TRUSTED_INGRESS_MODE` | non-secret | Exact value `vercel`. |

`VERCEL=1` and `VERCEL_ENV=preview|production` are provider runtime signals.
The BFF fails closed when they are missing or inconsistent. Enable Vercel system
environment variables if the project settings do not expose `VERCEL_ENV`.

`AURA_INTERNAL_BASE_URL` is accepted temporarily only as an audited migration
alias. Never set both URL names. New provider environments must use
`AURA_SERVER_BASE_URL`; remove the legacy variable after the first verified
promotion.

Preview and Production must use distinct service tokens, HMAC keys, cookie
names, Koyeb/Neon targets, and AI credentials.

## Trusted client address

For a direct Vercel deployment, the BFF reads only
`x-vercel-forwarded-for`, which Vercel documents as the dedicated client address
header. It ignores `x-forwarded-for`, `x-real-ip`, body, query, and cookies as
identity sources. One IPv4 or IPv6 address is canonicalized; IPv4-mapped IPv6 is
folded into its IPv4 equivalent. Missing, chained, wrapped, zoned, or malformed
values fail closed.

The BFF derives `HMAC-SHA-256(normalized-address)` with the website-only key and
forwards only lowercase 64-hex `X-Demo-Client-Subject`. Neither the address nor
digest is logged or returned.

This contract is valid only when clients reach Vercel directly. Adding a proxy,
custom CDN, or another ingress in front of Vercel closes the production gate
until the new forwarding contract is audited.

## Staging and promotion

1. At `HUMAN_GATE_PROVIDER_ACCOUNT_SETUP`, connect the GitHub repository and
   create/select the Vercel project without connecting a custom domain.
2. At `HUMAN_GATE_SECRET_PROVISIONING`, enter Preview variables that pair only
   with the Koyeb staging-promotion service in staging mode.
3. Deploy the exact audited feature commit as Preview and complete the HTTP,
   cold-start, browser, spoofing, cookie, timeout, and bundle scans.
4. After database and public-go-live gates, rotate to distinct Production
   values and deploy the exact audited `main` commit.
5. Connect the public domain only after `PUBLIC_GO_LIVE_APPROVED=1`.

Rollback selects the previous verified immutable Vercel deployment and the
matching Koyeb configuration set. Never mix Preview and Production credentials.

Official references:

- <https://vercel.com/docs/plans/hobby>
- <https://vercel.com/docs/git>
- <https://vercel.com/docs/environment-variables>
- <https://vercel.com/docs/headers/request-headers>
- <https://vercel.com/docs/functions/configuring-functions/region>
