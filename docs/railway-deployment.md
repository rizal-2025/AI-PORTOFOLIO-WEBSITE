# Railway deployment contract for the portfolio BFF

This is a secret-free setup inventory. It does not authorize project creation,
secret provisioning, deployment, DNS changes, or public traffic.

## Service boundary

Use the custom Railway config path
`/deploy/railway/portfolio-web.toml`. The service builds the reviewed standalone
Next.js Dockerfile, binds its injected `PORT` on IPv4/IPv6, runs one replica,
drains for 30 seconds, and checks `/api/health`. It is the only service with a
public domain. `aura-api` remains private in the same Railway project and
environment.

The server-only upstream URL is exactly
`http://aura-api.railway.internal:8000`. Production accepts plaintext HTTP only
for that exact Railway private hostname and explicit port. Railway carries this
traffic over its encrypted environment-isolated private mesh. Other HTTP
origins, credentials, paths, query strings, fragments, and missing ports fail
closed.

## Exact website variables

| Name | Classification | Rule |
| --- | --- | --- |
| `NODE_ENV` | non-secret | Exact value `production` (also fixed by the runtime image). |
| `PORT` | environment-specific non-secret | Exact value `3000`. |
| `AURA_INTERNAL_BASE_URL` | Railway reference, server-only | `http://${{aura-api.RAILWAY_PRIVATE_DOMAIN}}:${{aura-api.PORT}}`; it must resolve to the exact URL above. |
| `AURA_DEMO_SERVICE_TOKEN` | generated secret | Same value as AURA `DEMO_BFF_SERVICE_TOKEN`; service-local and sealed. |
| `AURA_CLIENT_SUBJECT_HMAC_KEY` | generated secret | Website-only independent 32--512 character value; service-local and sealed. |
| `AURA_DEMO_SESSION_COOKIE` | non-secret | Exact value `__Host-aura_demo_session`. |
| `AURA_BFF_TIMEOUT_MS` | non-secret | Exact value `30000`. |
| `AURA_TRUSTED_INGRESS_MODE` | non-secret | Exact value `railway`. |
| `AURA_RAILWAY_IP_HEADER_VERIFIED` | environment-specific safety gate | Leave absent initially. Set exact value `true` only after the environment's anti-spoof test proves Railway overwrites the public request's `X-Real-IP`. |

`RAILWAY_ENVIRONMENT_ID`, `RAILWAY_SERVICE_ID`, and
`RAILWAY_SERVICE_NAME=portfolio-web` are Railway-provided runtime variables.
The BFF requires them in Railway mode. No listed value uses a `NEXT_PUBLIC_`
prefix. Staging and production must use distinct service tokens, HMAC keys,
cookies, databases, and AI credentials.

## Trusted ingress and opaque client subject

In Railway mode the BFF accepts only a single syntactically valid `X-Real-IP`
after the explicit verification gate and Railway runtime identity checks pass.
It never reads `X-Forwarded-For` for identity. IPv4 and IPv6 are canonicalized,
then HMAC-SHA256 derives a lowercase 64-hex subject with a versioned domain
separator. Raw IP is not forwarded, stored, logged, or returned. A browser
cannot supply `X-Demo-Client-Subject` to the public BFF routes.

Development mode is allowed only outside `NODE_ENV=production`; it ignores all
forwarding headers and derives one explicit development subject. Missing,
chained, wrapped, zoned, or malformed Railway addresses fail closed with the
generic public unavailable envelope.

The staging anti-spoof matrix must send a request both without and with
attacker-selected `X-Real-IP` and `X-Forwarded-For`, then observe only aggregate
rate-limit behavior—never log either address or digest. The derived subject
must remain tied to the actual edge client. Repeat the proof in production
before enabling its verification flag. Do not use `X-Railway-Request-Id` as
identity.

## Remaining runtime gates

The local Docker daemon and in-app browser were unavailable while this contract
was prepared. Railway remote builds, image vulnerability/history inspection,
private reachability, HTTPS, headers, cookies, timeout/error behavior, keyboard
and responsive browser QA, and the complete create/update/cancel/reset smoke
matrix remain staging blockers. Do not attach a public domain to AURA.

Railway references:

- <https://docs.railway.com/networking/public-networking/specs-and-limits>
- <https://docs.railway.com/private-networking>
- <https://docs.railway.com/config-as-code>
- <https://docs.railway.com/variables>
- <https://docs.railway.com/variables/reference>
