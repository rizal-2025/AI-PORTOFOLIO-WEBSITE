# Kontrak API Demo AURA

## 1. Purpose and scope

Dokumen ini menjadi sumber kontrak untuk integrasi AURA Demo dengan website
portofolio melalui Next.js BFF.

Status saat ini:

- kontrak internal AURA telah diverifikasi terhadap `master` pada commit merge
  PR #10;
- internal session, chat, reservation read, reset, rate limiting, safe error
  handling, idempotency, simulated handoff, dan cleanup sudah tersedia di AURA;
- public Route Handlers, cookie browser, koneksi BFF, dan integrasi frontend
  belum dibuat;
- tahap aktif adalah **Contract Reconciliation**, bukan implementasi BFF.

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
- session-scoped ownership dan isolation;
- chat idempotency berdasarkan UUID `requestId`;
- simulated handoff;
- server-selected atomic rate limiting;
- safe error envelopes dan rate-limit headers;
- single-run cleanup CLI untuk session expired/revoked dan expired buckets.

### Planned in Next.js BFF

- public `/api/demo/*` Route Handlers;
- HttpOnly session cookie;
- server-only service-token forwarding;
- server-only AURA session-token forwarding;
- public request validation dan response allowlisting;
- internal-to-public error mapping;
- IP/client-subject limiter;
- request timeout;
- same-origin dan CSRF controls.

### Not implemented yet

- BFF Route Handlers;
- browser cookie;
- frontend integration;
- scheduler deployment untuk cleanup;
- typed reservation mutation yang diisi oleh chat service;
- provider-wide/overall timeout;
- administrative recovery untuk incomplete idempotency marker;
- final confirmation flow untuk update reservation.

## 4. Planned public BFF endpoints

Endpoint berikut adalah rencana kontrak browser-ke-Next.js, bukan endpoint yang
sudah tersedia:

| Method | Public endpoint | Purpose |
|---|---|---|
| POST | `/api/demo/session` | Membuat session AURA dan menyimpan token pada cookie HttpOnly. |
| GET | `/api/demo/session` | Mengambil status session, history, dan handoff terbaru. |
| POST | `/api/demo/chat` | Mengirim pesan dengan UUID `requestId`. |
| GET | `/api/demo/reservations` | Mengambil reservation milik session aktif. |
| POST | `/api/demo/reset` | Mereset data bisnis demo pada session yang sama. |

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

Aturan BFF yang direncanakan:

- browser tidak boleh dapat mengatur kedua header tersebut;
- BFF menghapus atau menimpa header internal dari request publik;
- service token hanya dibaca dari konfigurasi server-side;
- raw AURA session token hanya dibaca dari cookie HttpOnly atau server-side
  handle yang telah disetujui;
- request ID bukan credential dan tidak memberikan ownership;
- service token dan session token tidak dicatat dalam log.

## 7. HttpOnly cookie contract

Cookie adalah behavior **planned** di Next.js BFF dan belum diimplementasikan.

Cookie harus:

- `HttpOnly`;
- `Secure` pada production;
- `SameSite=Lax` sebagai keputusan awal;
- `Path=/`;
- tidak memakai atribut `Domain`;
- tidak dapat dibaca JavaScript;
- tidak berisi profil pengguna atau JSON identity;
- hanya berisi opaque AURA session token atau opaque BFF handle sesuai desain
  final;
- tidak ditampilkan dalam response body atau log;
- dihapus ketika AURA menyatakan session tidak valid.

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

Planned public BFF mapping:

- simpan `sessionToken` pada cookie HttpOnly;
- jangan sertakan token dalam JSON;
- teruskan hanya object `session` yang telah di-allowlist.

### Current session

Internal response berisi:

- `session`;
- maksimal 50 `messages`;
- `handoff` terbaru atau `null`.

Internal message memiliki `id`, `role`, `content`, dan `createdAt`. BFF tidak
boleh meneruskan internal database ID secara otomatis; public response harus
memakai allowlist yang disepakati sebelum implementasi.

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

| HTTP | Internal code utama | Planned BFF behavior |
|---:|---|---|
| 401 | `DEMO_SERVICE_AUTH_REQUIRED` | Jangan bedakan detail auth; kembalikan public service error aman. |
| 401 | `DEMO_SESSION_REQUIRED` | Hapus cookie invalid dan kembalikan session-required public error. |
| 409 | `REQUEST_CONFLICT` | Teruskan conflict aman tanpa internal detail. |
| 422 | `VALIDATION_ERROR` | Map hanya field/code yang di-allowlist. |
| 429 | `RATE_LIMIT_EXCEEDED` | Teruskan header rate-limit aman. |
| 502 | `PROVIDER_ERROR` | Kembalikan provider error tersanitasi. |
| 503 | `SERVICE_UNAVAILABLE` | Kembalikan temporary-unavailable response. |
| 504 | `PROVIDER_TIMEOUT` | Kembalikan timeout response. |

BFF tidak boleh meneruskan stack trace, SQL, raw provider error, URL internal,
token, digest, atau database identifier.

## 15. Timeout and retry behavior

Status aktual:

- AURA memetakan `TimeoutError` dari chat core ke `504 PROVIDER_TIMEOUT`;
- provider-wide/overall timeout belum tersedia;
- BFF request timeout belum dibuat;
- placeholder `AURA_BFF_TIMEOUT_MS` disediakan untuk keputusan implementasi;
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

Status: planned di BFF.

Minimum controls:

- browser hanya memanggil same-origin `/api/demo/*`;
- validate `Origin` pada state-changing request;
- gunakan `SameSite=Lax` pada cookie sebagai baseline;
- jangan menerima internal auth headers dari browser;
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
| Internal session API | Implemented | Belum terhubung | Belum terhubung |
| Internal chat API | Implemented | Belum terhubung | Belum terhubung |
| Reservation read | Implemented | Belum terhubung | Belum terhubung |
| Reset same session | Implemented | Belum terhubung | Belum terhubung |
| Session/global limiter | Implemented | N/A | N/A |
| IP/client-subject limiter | Belum | Planned | N/A |
| Idempotency | Implemented | Harus mempertahankan `requestId` | Belum terhubung |
| Simulated handoff | Implemented | Planned mapping | Belum terhubung |
| Cleanup CLI | Implemented | N/A | N/A |
| Cleanup scheduler | Belum dikonfigurasi | N/A | N/A |
| HttpOnly cookie | N/A | Planned | Belum tersedia |
| Public `/api/demo/*` | N/A | Planned | Belum tersedia |
| Typed reservation mutation output | Schema ada, value masih `null` | Planned mapping | Belum tersedia |
| Overall provider timeout | Belum | Planned timeout boundary | N/A |

## 21. Known limitations

- typed `reservationMutation` pada chat response masih `null`;
- update reservation final confirmation masih roadmap;
- provider-wide/overall timeout belum dibuat;
- incomplete-marker administrative recovery belum dibuat;
- IP/client-subject limiter belum dibuat;
- BFF Route Handlers dan cookie belum dibuat;
- scheduler cleanup belum dikonfigurasi;
- frontend belum terhubung;
- public message identifier policy belum ditetapkan;
- production deployment topology dan CSRF policy final belum ditetapkan.

## 22. Test acceptance criteria

Sebelum BFF dianggap siap:

- browser tidak pernah menerima AURA service/session token;
- create session menyimpan token hanya pada cookie HttpOnly;
- missing/invalid session menghapus cookie dan menghasilkan error aman;
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

1. commit kontrak yang sudah direkonsiliasi;
2. audit struktur Next.js untuk penempatan BFF;
3. tetapkan environment placeholders tanpa nilai pada source;
4. implementasikan shared server-only AURA client;
5. implementasikan create/current session Route Handlers dan cookie;
6. tambahkan timeout, origin checks, error mapping, dan client-subject limiter;
7. implementasikan chat BFF dengan idempotency-preserving `requestId`;
8. implementasikan reservation read dan same-session reset;
9. tambahkan integration/security tests;
10. hubungkan frontend setelah BFF lulus audit;
11. konfigurasi deployment dan external cleanup scheduler secara terpisah.

Setiap langkah memerlukan scope, validasi, dan persetujuan tersendiri. Dokumen
ini tidak mengimplementasikan satu pun langkah BFF.
