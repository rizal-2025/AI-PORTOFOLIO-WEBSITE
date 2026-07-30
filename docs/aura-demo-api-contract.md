# Kontrak API Demo AURA

## 1. Purpose and scope

Dokumen ini menjadi sumber kontrak untuk integrasi AURA Demo dengan website
portofolio melalui Next.js BFF.

Status saat ini:

- kontrak internal AURA telah diverifikasi terhadap `master` pada commit merge
  PR #10;
- internal session, chat, reservation read, reset, rate limiting, safe error
  handling, idempotency, simulated handoff, dan cleanup sudah tersedia di AURA;
- implementasi session BFF website telah committed pada `782dfa7 Implement AURA
  demo session BFF`;
- `POST` dan `GET /api/demo/session`, cookie HttpOnly, konfigurasi server-only,
  AURA client internal, dan security controls session telah diimplementasikan pada
  branch website saat ini;
- chat, reservations, reset, integrasi frontend, IP/client-subject limiter, dan
  deployment tetap planned;
- tahap aktif adalah **Documentation Status Alignment — BFF Session**.

Dokumen ini tidak memberi izin kepada browser atau Next.js untuk mengakses
PostgreSQL, data production, Telegram production, maupun rahasia AURA.

## 2. Architecture boundary

Arsitektur target:

```text
Browser
  -> Next.js public Route Handlers (/api/demo/*)
  -> AURA internal demo API (/internal/demo/*)
  -> dedicated demo persistence
```

Boundary wajib:

- browser hanya berkomunikasi dengan origin website;
- Next.js BFF menjadi satu-satunya public API;
- hanya AURA yang mengakses persistence;
- BFF tidak menerima atau menentukan Customer ID, owner ID, atau DemoSession ID;
- AURA memperoleh ownership dari session token yang telah divalidasi;
- request demo tidak boleh menulis ke data atau integrasi production;
- simulated handoff tidak menghubungi Telegram atau admin production.

## 3. Current AURA implementation status

### Implemented in AURA

- `POST /internal/demo/sessions`;
- `GET /internal/demo/sessions/current`;
- `POST /internal/demo/chat`;
- `GET /internal/demo/reservations`;
- `POST /internal/demo/reset`;
- service-to-service authentication;
- opaque demo session token dengan SHA-256 digest di persistence;
- idle expiry 2 jam dan absolute expiry 24 jam;
- current-session history maksimum 50 pesan dan latest safe handoff;
- session-scoped ownership dan isolation;
- chat idempotency berdasarkan UUID `requestId`;
- simulated handoff;
- server-selected atomic rate limiting;
- safe error envelopes dan rate-limit headers;
- single-run cleanup CLI untuk session expired/revoked dan expired buckets.

### Implemented in Next.js BFF (current website branch)

- `POST /api/demo/session` dan `GET /api/demo/session` melalui dynamic Node.js
  Route Handler;
- lazy server-only configuration dan server-to-server AURA client;
- `X-BFF-Service-Token` hanya pada request internal dan raw AURA session token
  hanya pada cookie HttpOnly atau internal `X-Demo-Session-Token` header;
- cookie HttpOnly, `Secure` pada production, `SameSite=Lax`, `Path=/`, dan expiry
  berdasarkan absolute expiry AURA;
- active-session reuse, replacement pada exact invalid session untuk POST, serta
  deletion cookie pada exact invalid session untuk GET;
- strict internal DTO parsing, exact `DEMO_SESSION_REQUIRED` envelope parsing,
  dan public internal-field redaction;
- overall upstream timeout, limit response 256 KiB, dan bounded response-stream
  cancellation;
- body probe POST satu detik, rejection query/body/browser-token header, serta
  Origin dan Sec-Fetch-Site protection;
- fixed public error mapping, safe 429 header forwarding, dan
  `Cache-Control: no-store`.

### Still planned in Next.js BFF

- `POST /api/demo/chat`, `GET /api/demo/reservations`, dan `POST /api/demo/reset`;
- frontend integration, browser chat UI, reservation display, dan reset UI;
- IP/client-subject limiter dan browser integration tests;
- scheduler deployment untuk cleanup;
- typed reservation mutation yang diisi oleh chat service;
- provider-wide/overall timeout;
- administrative recovery untuk incomplete idempotency marker;
- final confirmation flow untuk update reservation.

## 4. Public BFF endpoints

Endpoint session berikut telah diimplementasikan pada branch website saat ini;
endpoint lain tetap merupakan rencana kontrak browser-ke-Next.js:

| Method | Public endpoint | Purpose |
|---|---|---|
| POST | `/api/demo/session` | Implemented: membuat session AURA dan menyimpan token pada cookie HttpOnly. |
| GET | `/api/demo/session` | Implemented: mengambil status session, history, dan handoff terbaru. |
| POST | `/api/demo/chat` | Planned: mengirim pesan dengan UUID `requestId`. |
| GET | `/api/demo/reservations` | Planned: mengambil reservation milik session aktif. |
| POST | `/api/demo/reset` | Planned: mereset data bisnis demo pada session yang sama. |

Browser tidak boleh menerima atau mengetahui:

- AURA internal base URL;
- service token AURA;
- raw AURA session token;
- session-token digest;
- database credential;
- Customer ID;
- DemoSession ID;
- LLM key;
- system prompt.

## 5. Internal AURA endpoints

Seluruh router internal:

- hanya diregistrasikan ketika `APP_ENV=demo`;
- menggunakan prefix `/internal/demo`;
- disembunyikan dari OpenAPI;
- mewajibkan `X-BFF-Service-Token`;
- mengembalikan `Cache-Control: no-store` pada response sukses;
- tidak menerima Customer ID, owner ID, atau DemoSession ID dari caller.

| Method dan endpoint | Session header | Request | Success |
|---|---|---|---|
| `POST /internal/demo/sessions` | Tidak | Body harus kosong | `201` |
| `GET /internal/demo/sessions/current` | Wajib | Tidak ada request DTO | `200` |
| `POST /internal/demo/chat` | Wajib | `message`, `requestId` | `200` |
| `GET /internal/demo/reservations` | Wajib | Body kosong, tanpa query | `200` |
| `POST /internal/demo/reset` | Wajib | Body kosong, tanpa query | `200` |

Internal create-session response mengandung `sessionToken` untuk dikonsumsi
server BFF. Nilai tersebut tidak boleh diteruskan ke response browser.

## 6. Authentication boundary

Header aktual AURA:

- `X-BFF-Service-Token` untuk seluruh endpoint internal;
- `X-Demo-Session-Token` untuk endpoint session-scoped.

Aturan BFF yang telah diimplementasikan untuk session endpoint:

- browser tidak boleh dapat mengatur kedua header tersebut;
- BFF menghapus atau menimpa header internal dari request publik;
- service token hanya dibaca dari konfigurasi server-side;
- raw AURA session token hanya dibaca dari cookie HttpOnly atau server-side
  handle yang telah disetujui;
- request ID bukan credential dan tidak memberikan ownership;
- service token dan session token tidak dicatat dalam log.

## 7. HttpOnly cookie contract

Cookie session telah diimplementasikan pada Next.js BFF branch saat ini melalui
commit `782dfa7 Implement AURA demo session BFF`.

Cookie harus:

- `HttpOnly`;
- `Secure` pada production;
- `SameSite=Lax`;
- `Path=/`;
- tidak memakai atribut `Domain`;
- tidak dapat dibaca JavaScript;
- tidak berisi profil pengguna atau JSON identity;
- value hanya berisi opaque raw AURA session token;
- tidak ditampilkan dalam response body atau log;
- memakai expiry yang tidak melewati `absoluteExpiresAt`.

Cookie hanya diset setelah create-session internal berhasil dan seluruh response
internal lolos validasi ketat. Cookie tidak ditulis ulang atau dirotasi ketika
session aktif digunakan kembali.

Cookie hanya dihapus ketika:

- AURA mengembalikan exact code `DEMO_SESSION_REQUIRED`; atau
- nilai cookie lokal secara sintaks tidak valid dan tidak aman dikirim ke AURA.

Cookie tidak dihapus ketika terjadi timeout, HTTP 429, HTTP 5xx, network failure,
konfigurasi/service authentication failure, atau malformed upstream response.
Pada kegagalan transient tersebut cookie lama dipertahankan dan BFF tidak
membuat session pengganti.

Reset mempertahankan session yang sama. Reset tidak merotasi cookie atau token.

## 8. Session lifecycle and expiry

Implementasi AURA:

- token dibuat dari 32 random bytes dan berbentuk opaque URL-safe token;
- token mentah hanya dikembalikan sekali pada internal create-session response;
- AURA menyimpan SHA-256 digest, bukan raw token;
- idle expiry: 2 jam;
- absolute expiry: 24 jam;
- activity yang valid dapat memperbarui idle expiry sampai batas absolute expiry;
- current-session history dibatasi 50 pesan terbaru;
- reset dapat menyentuh aktivitas session, tetapi tidak memperpanjang absolute
  expiry;
- reset tidak mengganti DemoSession, Customer, token, atau token digest.

BFF harus menyimpan raw token server-to-browser hanya melalui cookie HttpOnly.
Browser JavaScript tidak pernah memperoleh nilai raw token.

## 9. Request and response mappings

### Create session

Internal request:

```text
POST /internal/demo/sessions
X-BFF-Service-Token: <server-only>
empty body
```

Internal success shape:

```json
{
  "sessionToken": "<opaque-internal-token>",
  "session": {
    "status": "active",
    "expiresAt": "<utc-timestamp>",
    "idleExpiresAt": "<utc-timestamp>",
    "absoluteExpiresAt": "<utc-timestamp>",
    "messageCount": 0
  }
}
```

Kontrak public `POST /api/demo/session`:

- tidak menerima query parameter;
- body harus benar-benar kosong; object JSON kosong pun ditolak;
- wajib melewati same-origin/CSRF validation;
- token, session, owner, dan internal URL tidak pernah diterima dari browser;
- seluruh response memakai `Cache-Control: no-store`.

Behavior tanpa cookie:

1. validasi request;
2. panggil internal create-session;
3. validasi response secara ketat;
4. set cookie HttpOnly dari `sessionToken`;
5. kembalikan `201 Created`.

Behavior ketika cookie menunjuk session aktif:

1. panggil internal current-session dengan token dari cookie;
2. validasi response secara ketat;
3. gunakan kembali session aktif;
4. jangan membuat Customer atau DemoSession baru;
5. jangan mengganti atau merotasi cookie;
6. kembalikan `200 OK`.

Behavior ketika AURA mengembalikan exact code `DEMO_SESSION_REQUIRED` untuk
cookie existing:

1. hapus cookie lama;
2. buat session baru;
3. validasi response create-session secara ketat;
4. set cookie baru;
5. kembalikan `201 Created`.

Nilai cookie yang secara lokal tidak valid secara sintaks dihapus dan
diperlakukan seperti request tanpa cookie. BFF membuat session baru dan hanya
menyetel cookie baru setelah response internal valid.

Jika pemeriksaan cookie existing gagal karena timeout, HTTP 429, HTTP 5xx,
network failure, malformed upstream response, atau service/config authentication
failure, BFF:

- tidak membuat session baru;
- tidak mengganti atau menghapus cookie;
- mengembalikan public-safe error.

Aturan fail-closed ini mencegah Customer atau DemoSession duplikat ketika status
session existing tidak dapat dipastikan.

Exact public response untuk session baru maupun session aktif yang digunakan
kembali:

```json
{
  "session": {
    "status": "active",
    "expiresAt": "2026-07-30T10:00:00Z",
    "idleExpiresAt": "2026-07-30T10:00:00Z",
    "absoluteExpiresAt": "2026-07-31T08:00:00Z",
    "messageCount": 0
  }
}
```

Response session baru berstatus `201`; response reuse session aktif berstatus
`200`. Raw token, messages, handoff, Customer ID, dan DemoSession ID tidak masuk
response public POST.

### Current session

Internal response berisi:

- `session`;
- maksimal 50 `messages`;
- `handoff` terbaru atau `null`.

Kontrak public `GET /api/demo/session`:

- tidak menerima query parameter atau body;
- token hanya berasal dari cookie HttpOnly;
- header browser `X-Demo-Session-Token` harus diabaikan atau ditolak;
- seluruh response memakai `Cache-Control: no-store`.

Jika cookie tidak ada, BFF tidak memanggil AURA dan mengembalikan
`401 SESSION_REQUIRED`. Jika cookie secara lokal tidak valid secara sintaks, BFF
menghapus cookie tanpa memanggil AURA dan mengembalikan
`401 SESSION_REQUIRED`.

Dengan cookie valid, BFF memanggil `GET /internal/demo/sessions/current`,
memvalidasi response secara ketat, memetakan hanya field yang di-allowlist, lalu
mengembalikan `200 OK`.

Jika AURA mengembalikan exact code `DEMO_SESSION_REQUIRED`, BFF menghapus cookie
dan mengembalikan `401 SESSION_REQUIRED`. Pada timeout, HTTP 429, HTTP 5xx,
network failure, malformed upstream response, atau service/config authentication
failure, BFF mempertahankan cookie dan memetakan kegagalan ke public-safe
`429`, `502`, `503`, atau `504`.

Exact public success response:

```json
{
  "session": {
    "status": "active",
    "expiresAt": "2026-07-30T10:00:00Z",
    "idleExpiresAt": "2026-07-30T10:00:00Z",
    "absoluteExpiresAt": "2026-07-31T08:00:00Z",
    "messageCount": 2
  },
  "messages": [
    {
      "role": "user",
      "content": "Saya ingin membuat reservasi.",
      "createdAt": "2026-07-30T08:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Reservasi untuk berapa orang?",
      "createdAt": "2026-07-30T08:00:01Z"
    }
  ],
  "handoff": null
}
```

Public message allowlist tepat `role`, `content`, dan `createdAt`. `role` hanya
boleh bernilai `user` atau `assistant`.

Public handoff berbentuk `null` atau:

```json
{
  "status": "simulated",
  "summary": "Permintaan bantuan admin telah disimulasikan.",
  "createdAt": "2026-07-30T08:05:00Z"
}
```

Public handoff allowlist tepat `status`, `summary`, dan `createdAt`. Nilai
`status` wajib literal `simulated`. Mapping dari safe internal DTO adalah:

| Internal field | Public field | Mapping |
|---|---|---|
| `status` | `status` | Harus tervalidasi sebagai literal `simulated`. |
| `safeSummary` | `summary` | Diteruskan setelah validasi sebagai safe allowlisted summary. |
| `createdAt` | `createdAt` | Diteruskan setelah validasi timestamp. |

Response internal yang tidak dapat dipetakan sesuai aturan tersebut dianggap
malformed upstream response; BFF tidak mengarang nilai pengganti.

Response public tidak boleh mengekspos internal message ID, database ID, request
ID, marker status, owner ID, session ID, token digest, internal reference,
internal handoff ID, Customer ID, raw provider reason, SupportTicket ID, atau
data Telegram.

### Reset

Internal response:

```json
{
  "status": "reset",
  "session": {
    "status": "active",
    "expiresAt": "<utc-timestamp>",
    "idleExpiresAt": "<utc-timestamp>",
    "absoluteExpiresAt": "<utc-timestamp>",
    "messageCount": 0
  },
  "reservationCount": 0,
  "handoff": null
}
```

BFF meneruskan response aman tanpa mengganti cookie.

## 10. Chat idempotency

Internal chat request:

```json
{
  "message": "Pesan demo berbahasa Indonesia.",
  "requestId": "<uuid-v4>"
}
```

Aturan aktual:

- `message` wajib strict string dan dinormalisasi;
- maksimum 1.000 Unicode code point;
- `requestId` wajib UUID;
- extra field ditolak;
- scope idempotency adalah kombinasi session dan `requestId`;
- completed replay dengan pesan yang sama mengembalikan stored response;
- UUID yang sama dengan pesan berbeda menghasilkan `409 REQUEST_CONFLICT`;
- concurrency diserialisasi dengan process lock dan PostgreSQL advisory lock;
- user marker yang sudah committed mencegah mutation ganda;
- marker tanpa assistant response tetap fail-closed sebagai conflict.

Administrative recovery/TTL untuk incomplete marker belum dibuat. BFF tidak
boleh mengganti `requestId` secara otomatis untuk menyiasati conflict.

## 11. Reservation contract

Internal reservation read:

```text
GET /internal/demo/reservations
X-BFF-Service-Token: <server-only>
X-Demo-Session-Token: <server-only>
empty body
no query parameters
```

Response aktual:

```json
{
  "reservations": [
    {
      "status": "pending",
      "reservationDate": "2026-08-02",
      "reservationTime": "19:00:00",
      "partySize": 4
    }
  ],
  "count": 1
}
```

Kontrak aktual:

- status hanya `pending` atau `cancelled`;
- maksimal 50 reservation dikembalikan;
- `count` adalah total reservation milik owner;
- raw Reservation ID tidak dikembalikan;
- owner ID, Customer ID, DemoSession ID, token digest, dan internal reference
  tidak dikembalikan;
- ownership selalu berasal dari session aktif.

## 12. Reset semantics

Internal reset:

```text
POST /internal/demo/reset
X-BFF-Service-Token: <server-only>
X-Demo-Session-Token: <server-only>
empty body
no query parameters
```

Reset aktual:

- tidak menerima body `confirm`;
- menggunakan process lock dan PostgreSQL advisory lock yang sama dengan chat;
- menghapus messages dan request markers milik session;
- menghapus conversation workflow state pada scope session;
- menghapus simulated handoff milik session;
- menghapus reservation milik owner session;
- mempertahankan DemoSession;
- mempertahankan Customer;
- mempertahankan raw-token validity dan token digest;
- mempertahankan absolute expiry;
- mempertahankan active session, global, dan IP rate-limit buckets;
- transactional dan owner-scoped.

Planned public reset meneruskan operasi pada session yang sama. Tidak ada
session baru, token baru, atau rotasi cookie.

## 13. Rate-limit policies

Policy aktual dipilih server:

| Action | Scope | Limit | Window |
|---|---:|---:|---:|
| `session_create` | global | 30 | 60 detik |
| `session_current` | session | 60 | 60 detik |
| `chat` | session | 20 | 60 detik |
| `chat` | global | 300 | 60 detik |
| `reservations_read` | session | 30 | 60 detik |
| `reset` | session | 5 | 3.600 detik |

Behavior aktual:

- caller tidak dapat memilih action, scope, limit, atau window;
- increment menggunakan atomic database upsert;
- request yang melewati limit tetap dihitung;
- session dan global chat policies dikonsumsi dalam satu transaction;
- kegagalan satu chat policy me-rollback policy lain;
- `X-RateLimit-Reset` menggunakan Unix epoch seconds UTC;
- response 429 juga memiliki `Retry-After`, `X-RateLimit-Limit`,
  `X-RateLimit-Remaining`, dan `Cache-Control: no-store`;
- IP/client-subject limiter belum dibuat dan menunggu BFF.

## 14. Error mapping

Internal AURA memakai envelope aman:

```json
{
  "code": "SERVICE_UNAVAILABLE",
  "detail": "Layanan demo sementara tidak tersedia."
}
```

Validation error dapat menambahkan array `errors` berisi field dan safe code.

Seluruh public error untuk session BFF memakai exact envelope:

```json
{
  "error": {
    "code": "SESSION_REQUIRED",
    "message": "Demo session is required."
  }
}
```

Nilai `code` dan `message` berubah sesuai exact mapping berikut:

| Kondisi | HTTP | Public code | Public message |
|---|---:|---|---|
| Invalid query/body/request | 400 | `INVALID_REQUEST` | `The request is invalid.` |
| Cross-site/CSRF rejected | 403 | `FORBIDDEN` | `The request is not allowed.` |
| Missing cookie | 401 | `SESSION_REQUIRED` | `Demo session is required.` |
| Invalid/expired/revoked session | 401 | `SESSION_REQUIRED` | `Demo session is required.` |
| AURA rate limit | 429 | `RATE_LIMITED` | `Too many requests. Please try again later.` |
| Malformed upstream response | 502 | `UPSTREAM_INVALID_RESPONSE` | `The demo service returned an invalid response.` |
| Missing/invalid BFF config | 503 | `SERVICE_UNAVAILABLE` | `The demo service is unavailable.` |
| AURA/network 5xx | 503 | `SERVICE_UNAVAILABLE` | `The demo service is unavailable.` |
| Timeout | 504 | `UPSTREAM_TIMEOUT` | `The demo service timed out.` |

Hanya exact internal code `DEMO_SESSION_REQUIRED` yang diperlakukan sebagai
session invalid. Jika AURA mengembalikan HTTP 401 dengan code lain, termasuk
service authentication failure, BFF memetakannya ke
`503 SERVICE_UNAVAILABLE`, tidak menghapus cookie, dan tidak membuat session
pengganti.

Pada public `429`, BFF hanya boleh meneruskan header berikut jika nilainya telah
divalidasi sebagai integer:

- `Retry-After`;
- `X-RateLimit-Limit`;
- `X-RateLimit-Remaining`;
- `X-RateLimit-Reset`.

`X-RateLimit-Reset` menggunakan Unix epoch seconds UTC. Header upstream lain
tidak diteruskan. Seluruh response sukses maupun error memakai
`Cache-Control: no-store`.

BFF tidak boleh meneruskan raw exception, internal code, stack trace, SQL, raw
provider error, URL internal, token, digest, database identifier, atau ID
internal.

## 15. Timeout and retry behavior

Status aktual:

- AURA memetakan `TimeoutError` dari chat core ke `504 PROVIDER_TIMEOUT`;
- provider-wide/overall timeout belum tersedia;
- BFF session request memakai overall timeout `AURA_BFF_TIMEOUT_MS`, termasuk
  response body, decode, parsing, dan classification;
- placeholder `AURA_BFF_TIMEOUT_MS` tetap server-side dan tidak menetapkan nilai
  pada dokumen ini;
- mutation request tidak boleh di-retry transparan dengan `requestId` baru;
- completed replay dengan `requestId` yang sama aman dan idempotent;
- incomplete marker menghasilkan conflict sampai recovery administratif tersedia.

Kebijakan retry BFF harus dibedakan antara read-only request dan mutation, lalu
divalidasi sebelum implementasi.

## 16. Logging and secret redaction

Larangan log:

- service token;
- raw session token;
- token digest;
- cookie;
- request/response payload mentah;
- database URL atau credential;
- Customer ID dan DemoSession ID;
- LLM key, system prompt, atau raw provider response.

Log harus memakai status, safe code, dan correlation ID non-credential. Public
response tidak boleh memantulkan input sensitif atau exception mentah.

## 17. Cleanup operation

Cleanup bukan public HTTP endpoint dan bukan internal HTTP endpoint.

Command aktual:

```powershell
.\.venv\Scripts\python.exe -m app.jobs.demo_cleanup --once --batch-size 100
```

Behavior aktual:

- single-run untuk dipanggil external scheduler;
- guard `APP_ENV=demo` sebelum query;
- batch size 1 sampai 500;
- memilih session revoked, idle-expired, atau absolute-expired;
- memakai process lock, shared PostgreSQL advisory lock, row lock, dan
  eligibility revalidation;
- transaksi terpisah untuk setiap session;
- menghapus child demo, DemoSession, dan Customer hanya bila tidak ada
  production reference;
- menghapus expired rate-limit buckets secara bounded;
- output hanya aggregate aman;
- deployment scheduler belum dikonfigurasi.

Reset dan cleanup berbeda: reset mempertahankan session/Customer dan active
buckets, sedangkan lifecycle cleanup menghapus session yang sudah tidak aktif
beserta data demo yang aman untuk dihapus.

## 18. CSRF and same-origin considerations

Status: implemented untuk session BFF pada branch website saat ini. Kebijakan
deployment dan evaluasi CSRF tambahan tetap planned.

Minimum controls:

- browser hanya memanggil same-origin `/api/demo/*`;
- validasi `Origin` dan terapkan same-origin/CSRF protection pada
  `POST /api/demo/session`;
- `POST /api/demo/session` tidak menerima query dan body harus benar-benar
  kosong;
- `GET /api/demo/session` tidak menerima query atau body;
- gunakan `SameSite=Lax` pada cookie;
- jangan menerima internal auth headers dari browser;
- abaikan atau tolak browser header `X-Demo-Session-Token`;
- token/session, owner/internal ID, dan internal URL tidak boleh diterima dari
  browser;
- batasi method, content type, body size, dan extra fields;
- evaluasi CSRF token tambahan bila deployment/origin model membutuhkannya;
- CORS bukan pengganti CSRF protection.

## 19. Environment configuration placeholders

Placeholder server-side yang diizinkan:

| Placeholder | Purpose |
|---|---|
| `AURA_INTERNAL_BASE_URL` | Base URL internal AURA yang hanya diketahui BFF. |
| `AURA_DEMO_SERVICE_TOKEN` | Service credential BFF-ke-AURA. |
| `AURA_DEMO_SESSION_COOKIE` | Nama cookie HttpOnly. |
| `AURA_BFF_TIMEOUT_MS` | Batas waktu request BFF-ke-AURA. |

Dokumen ini tidak menetapkan atau menyimpan nilainya. Tidak satu pun boleh
menggunakan prefix publik seperti `NEXT_PUBLIC_`.

## 20. Implemented versus planned matrix

| Capability | AURA | Next.js BFF | Frontend |
|---|---|---|---|
| Create demo session | Implemented | Implemented | Not connected |
| Read current session | Implemented | Implemented | Not connected |
| HttpOnly session cookie | N/A | Implemented | Browser-managed |
| Chat | Implemented internally | Planned | Planned |
| Reservations read | Implemented internally | Planned | Planned |
| Reset | Implemented internally | Planned | Planned |
| Backend rate limiting | Implemented | Consumes safe headers | N/A |
| IP/client-subject limiter | N/A | Planned | N/A |
| Cleanup CLI | Implemented | N/A | N/A |
| Deployment scheduler | Not configured | Not configured | N/A |
| Typed reservation mutation output | Schema ada, value masih `null` | Planned mapping | Not connected |
| Overall provider timeout | Not implemented | Planned | N/A |

Untuk session BFF, Route Handler, validasi konfigurasi server-side, HTTP client
BFF-ke-AURA, cookie HttpOnly, same-origin protection, public response mapper,
dan public error mapper telah diimplementasikan. Frontend belum terhubung dan
chat/reservations/reset BFF tetap planned.

## 21. Known limitations

- typed `reservationMutation` pada chat response masih `null`;
- update reservation final confirmation masih roadmap;
- provider-wide/overall timeout belum dibuat;
- incomplete-marker administrative recovery belum dibuat;
- IP/client-subject limiter belum dibuat;
- automated Route Handler test framework belum dibuat;
- browser integration test belum dibuat;
- trusted proxy/origin behavior belum diuji saat deployment;
- server-only boundary masih didukung convention `.server.ts` dan import graph;
- chat/reservations/reset BFF belum dibuat;
- scheduler cleanup belum dikonfigurasi;
- frontend belum terhubung;
- production deployment topology dan CSRF policy final belum ditetapkan.

## 22. Test acceptance criteria

Session BFF telah lulus validasi statis pada branch website saat ini:

- typecheck, lint, dan production build;
- dynamic route detection tanpa build-time secret requirement atau backend call;
- strict token/cookie boundary, timeout dan body-size protection, serta
  public-safe mapping.

Validasi yang belum dilakukan:

- automated Route Handler tests;
- real browser integration;
- deployed trusted-proxy validation;
- real end-to-end request ke AURA melalui BFF.

Kriteria perilaku session BFF yang dipertahankan:

- browser tidak pernah menerima AURA service/session token;
- create session menyimpan token hanya pada cookie HttpOnly;
- create session menggunakan kembali cookie aktif tanpa membuat Customer atau
  DemoSession baru;
- exact `DEMO_SESSION_REQUIRED` mengganti invalid cookie pada POST dan menghapus
  invalid cookie pada GET;
- missing cookie menghasilkan error aman tanpa memanggil AURA;
- transient failure mempertahankan cookie dan tidak membuat session pengganti;
- dua browser session tidak dapat membaca atau mengubah data satu sama lain;
- public request tidak dapat mengirim owner/internal IDs;
- chat mempertahankan UUID `requestId` dan replay tidak membuat mutation ganda;
- reservation response tidak memuat raw Reservation ID atau ownership fields;
- reset memakai body kosong dan mempertahankan cookie/session yang sama;
- reset tidak menghapus active limiter buckets;
- 429 meneruskan safe retry/rate-limit headers;
- provider error dan timeout tidak membocorkan detail;
- internal auth headers dari browser dihapus;
- same-origin dan CSRF controls diuji;
- tidak ada secret pada client bundle, response, atau log;
- cleanup tidak diregistrasikan sebagai endpoint/startup job;
- production routes dan data tidak berubah.

## 23. Rollout sequence

Completed:

1. AURA internal demo API;
2. rate limiting dan cleanup;
3. public BFF contract;
4. POST/GET session BFF;
5. HttpOnly session cookie dan security controls.

Next:

1. documentation status alignment;
2. branch verification dan push;
3. chat BFF;
4. reservations BFF;
5. reset BFF;
6. frontend integration;
7. browser/runtime testing;
8. deployment hardening.

Setiap langkah memerlukan scope, validasi, dan persetujuan tersendiri. Dokumen
ini tidak mengimplementasikan satu pun langkah BFF.
