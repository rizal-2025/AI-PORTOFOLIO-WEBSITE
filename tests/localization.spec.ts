import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

const now = "2026-08-25T12:00:00Z";
const session = {
  status: "active",
  expiresAt: "2026-08-25T13:00:00Z",
  idleExpiresAt: "2026-08-25T12:30:00Z",
  absoluteExpiresAt: "2026-08-25T13:00:00Z",
  messageCount: 0,
} as const;

async function chooseDesktopLanguage(page: Page, language: "Bahasa Indonesia" | "English") {
  const selector = page.getByRole("button", { name: /Pilih bahasa|Select language/ }).filter({ visible: true });
  await selector.click();
  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/locale") && response.request().method() === "POST",
  );
  await page.getByRole("menuitemradio", { name: language }).filter({ visible: true }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
}

test("locale persists through reload and navigation and selector is keyboard accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Saya membangun");

  const selector = page.getByRole("button", { name: "Pilih bahasa" }).filter({ visible: true });
  await selector.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu", { name: "Pilihan bahasa" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu", { name: "Pilihan bahasa" })).toBeHidden();

  await chooseDesktopLanguage(page, "English");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I build AI systems");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AI Systems & Intelligent Agents");
  await page.goto("/demo/aura");
  await expect(page.getByRole("heading", { name: "AURA Conversation" })).toBeVisible();

  await chooseDesktopLanguage(page, "Bahasa Indonesia");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(page.getByRole("heading", { name: "Percakapan AURA" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
});

test("language changes mid-session without duplicate session or rewritten history", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("hydrated but")) {
      hydrationErrors.push(message.text());
    }
  });
  let active = false;
  let sessionCreates = 0;
  const messages: Array<{ role: "user" | "assistant"; content: string; createdAt: string }> = [];

  await page.route("**/api/demo/session", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      active = true;
      sessionCreates += 1;
      await route.fulfill({ json: { session } });
      return;
    }
    if (!active) {
      await route.fulfill({
        status: 401,
        json: { error: { code: "SESSION_REQUIRED", message: "safe" } },
      });
      return;
    }
    await route.fulfill({
      json: { session: { ...session, messageCount: messages.length }, messages, handoff: null },
    });
  });
  await page.route("**/api/demo/reservations", (route) =>
    route.fulfill({ json: { reservations: [], count: 0 } }),
  );
  await page.route("**/api/demo/chat", async (route) => {
    const body = route.request().postDataJSON() as { message: string };
    const isEnglish = (await page.context().cookies()).some(
      (cookie) => cookie.name === "aura_locale" && cookie.value === "en-US",
    );
    const reply = isEnglish
      ? "Which detail would you like to change?\nChoose: name, number of people, date, or time."
      : "Bagian mana yang ingin diubah?\nPilih: nama, jumlah orang, tanggal, atau waktu.";
    messages.push({ role: "user", content: body.message, createdAt: now });
    messages.push({ role: "assistant", content: reply, createdAt: now });
    await route.fulfill({
      json: {
        reply: { role: "assistant", content: reply, createdAt: now },
        reservationMutation: null,
        handoff: null,
      },
    });
  });

  await page.goto("/demo/aura");
  await page.getByRole("button", { name: "Mulai sesi" }).first().click();
  await expect(page.getByText("Sesi aktif", { exact: true })).toBeVisible();

  await page.getByLabel("Pesan untuk AURA").fill("Saya ingin mengubah reservasi");
  await page.getByRole("button", { name: "Kirim pesan" }).click();
  await expect(page.getByText("Bagian mana yang ingin diubah?", { exact: false })).toBeVisible();

  await chooseDesktopLanguage(page, "English");
  await expect(page.getByText("Active session", { exact: true })).toBeVisible();
  await expect(page.getByText("Saya ingin mengubah reservasi", { exact: true })).toBeVisible();
  await page.getByLabel("Message for AURA").fill("Continue the same update");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Which detail would you like to change?", { exact: false })).toBeVisible();

  await chooseDesktopLanguage(page, "Bahasa Indonesia");
  await page.getByLabel("Pesan untuk AURA").fill("lanjutkan pembaruan yang sama");
  await page.getByRole("button", { name: "Kirim pesan" }).click();
  await expect(page.getByText("Pilih: nama, jumlah orang, tanggal, atau waktu.", { exact: false })).toHaveCount(2);
  expect(sessionCreates).toBe(1);
  expect(hydrationErrors).toEqual([]);
});

test("mobile navigation exposes a usable language selector", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Buka menu navigasi" }).click();
  await chooseDesktopLanguage(page, "English");
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("static pages keep identical semantic sections and CTA destinations in both locales", async ({ page, context }) => {
  const routes = ["/projects", "/architecture", "/about", "/contact"];

  for (const route of routes) {
    await context.addCookies([{ name: "aura_locale", value: "id-ID", domain: "127.0.0.1", path: "/" }]);
    await page.goto(route);
    const idSections = await page.locator("[data-section-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section-id")));
    const idDestinations = await page.locator("main a[href]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")).filter(Boolean).sort());

    await context.addCookies([{ name: "aura_locale", value: "en-US", domain: "127.0.0.1", path: "/" }]);
    await page.reload();
    const enSections = await page.locator("[data-section-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section-id")));
    const enDestinations = await page.locator("main a[href]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")).filter(Boolean).sort());

    expect(enSections, `${route} section parity`).toEqual(idSections);
    expect(enDestinations, `${route} destination parity`).toEqual(idDestinations);
    expect(idSections.length, `${route} must expose its complete semantic structure`).toBeGreaterThanOrEqual(3);
  }
});

test("Indonesian static pages do not leak known English presentation labels", async ({ page, context }) => {
  await context.addCookies([{ name: "aura_locale", value: "id-ID", domain: "127.0.0.1", path: "/" }]);
  const forbiddenLabels = [
    "Featured project", "Business value", "Core capabilities", "Technology stack",
    "Contact channel", "Channel status", "Architecture overview", "Current status",
    "Professional profile", "Working approach", "Next step",
  ];

  for (const route of ["/projects", "/architecture", "/about", "/contact"]) {
    await page.goto(route);
    const visibleText = await page.locator("main").innerText();
    for (const label of forbiddenLabels) expect(visibleText, `${route} leaked ${label}`).not.toContain(label);
  }
});
