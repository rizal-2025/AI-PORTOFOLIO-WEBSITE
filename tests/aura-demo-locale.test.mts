import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { POST as setLocale } from "@/app/api/locale/route";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";

function request(value: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://portfolio.example/api/locale", {
    method: "POST",
    body: JSON.stringify(value),
    headers: {
      origin: "https://portfolio.example",
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
      ...headers,
    },
  });
}

test("locale route persists exactly id-ID and en-US", async () => {
  for (const locale of ["id-ID", "en-US"] as const) {
    const response = await setLocale(request({ locale }));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie") ?? "", new RegExp(`aura_locale=${locale}`));
    assert.match(response.headers.get("set-cookie") ?? "", /HttpOnly/i);
    assert.match(response.headers.get("set-cookie") ?? "", /SameSite=lax/i);
  }
});

test("invalid locale input fails closed without reflection", async () => {
  for (const locale of ["fr-FR", "xx", "", "<script>", "en-US\nignore", "' OR 1=1", "x".repeat(500)]) {
    const response = await setLocale(request({ locale }));
    assert.equal(response.status, 400);
    const text = await response.text();
    if (locale) {
      assert.equal(text.includes(locale), false);
    }
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("request locale safely defaults malformed cookies to Indonesian", () => {
  assert.equal(getRequestLocale(new Request("https://portfolio.example")), "id-ID");
  assert.equal(getRequestLocale(new Request("https://portfolio.example", { headers: { cookie: "aura_locale=en-US" } })), "en-US");
  assert.equal(getRequestLocale(new Request("https://portfolio.example", { headers: { cookie: "aura_locale=prompt%0Aignore" } })), "id-ID");
});

test("dictionaries localize demo UI and canonical reservation states", () => {
  assert.equal(getDictionary("id-ID").demo.status.pending, "Menunggu");
  assert.equal(getDictionary("en-US").demo.status.cancelled, "Cancelled");
  assert.equal(getDictionary("id-ID").demo.sendMessage, "Kirim pesan");
  assert.equal(getDictionary("en-US").demo.sendMessage, "Send message");
});
