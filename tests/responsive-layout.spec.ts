import { expect, test, type Locator, type Page } from "@playwright/test";

type Viewport = { name: string; width: number; height: number; kind: "mobile" | "tablet" | "desktop" };

const viewports: Viewport[] = [
  { name: "mobile-320", width: 320, height: 568, kind: "mobile" },
  { name: "mobile-360", width: 360, height: 800, kind: "mobile" },
  { name: "mobile-375", width: 375, height: 812, kind: "mobile" },
  { name: "mobile-390", width: 390, height: 844, kind: "mobile" },
  { name: "mobile-414", width: 414, height: 896, kind: "mobile" },
  { name: "mobile-430", width: 430, height: 932, kind: "mobile" },
  { name: "tablet-768", width: 768, height: 1024, kind: "tablet" },
  { name: "tablet-820", width: 820, height: 1180, kind: "tablet" },
  { name: "tablet-1024", width: 1024, height: 768, kind: "tablet" },
  { name: "desktop-1280", width: 1280, height: 720, kind: "desktop" },
  { name: "desktop-1366", width: 1366, height: 768, kind: "desktop" },
  { name: "desktop-1440", width: 1440, height: 900, kind: "desktop" },
  { name: "desktop-1512", width: 1512, height: 982, kind: "desktop" },
  { name: "desktop-1536", width: 1536, height: 864, kind: "desktop" },
  { name: "desktop-1920", width: 1920, height: 1080, kind: "desktop" },
];

const screenshotViewports = new Set(["mobile-390", "mobile-414", "desktop-1280", "desktop-1366", "desktop-1440", "desktop-1920"]);

async function expectWithinViewport(locator: Locator, page: Page) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
}

async function expectReadableTextLinesWithinContainer(text: Locator, container: Locator) {
  const [lines, containerBox] = await Promise.all([
    text.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return Array.from(range.getClientRects()).map(({ left, right, width, height }) => ({ left, right, width, height }));
    }),
    container.boundingBox(),
  ]);

  expect(containerBox).not.toBeNull();
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines) {
    expect(line.width).toBeGreaterThan(0);
    expect(line.height).toBeGreaterThan(0);
    expect(line.left).toBeGreaterThanOrEqual(containerBox!.x - 1);
    expect(line.right).toBeLessThanOrEqual(containerBox!.x + containerBox!.width + 1);
  }
}

async function expectNoMeaningfulOverflow(page: Page) {
  const overflow = await page.locator("a, button, h1, h2, h3, p, article, aside, nav").evaluateAll((elements) =>
    elements.flatMap((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (styles.display === "none" || styles.visibility === "hidden" || rect.width === 0 || rect.height === 0) return [];
      return rect.left < -1 || rect.right > window.innerWidth + 1
        ? [{ tag: element.tagName, text: (element.textContent ?? "").trim().slice(0, 80), left: rect.left, right: rect.right }]
        : [];
    }),
  );
  expect(overflow).toEqual([]);
}

for (const viewport of viewports) {
  test(`homepage remains contained at ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/", { waitUntil: "networkidle" });

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    await expectNoMeaningfulOverflow(page);

    const hero = page.locator("main > section").first();
    const heroHeading = hero.getByRole("heading", { level: 1 });
    const heroCopy = hero.locator("p").filter({ hasText: "Saya menggabungkan antarmuka" });
    const primaryCta = hero.getByRole("link", { name: "Coba AURA" });
    const secondaryCta = hero.getByRole("link", { name: "Lihat Proyek" });
    await expect(heroHeading).toBeVisible();
    await expect(heroCopy).toBeVisible();
    const headingBox = await heroHeading.boundingBox();
    const copyBox = await heroCopy.boundingBox();
    expect(headingBox?.width).toBeGreaterThan(0);
    expect(headingBox?.height).toBeGreaterThan(0);
    expect(copyBox?.width).toBeGreaterThan(0);
    expect(copyBox?.height).toBeGreaterThan(0);
    await expectWithinViewport(primaryCta, page);
    await expectWithinViewport(secondaryCta, page);
    await expectReadableTextLinesWithinContainer(heroCopy, hero.locator(".max-w-3xl"));

    const featured = page.locator("article").filter({ hasText: "Demo publiknya mendukung sesi" });
    const featuredCopy = featured.locator("p").first();
    await expect(featured).toBeVisible();
    await expectWithinViewport(featured, page);
    await expectReadableTextLinesWithinContainer(featuredCopy, featured.locator(".max-w-2xl"));

    const desktopNavigation = page.getByRole("navigation", { name: "Navigasi utama" });
    const menuButton = page.getByRole("button", { name: "Buka menu navigasi" });
    if (viewport.width >= 1024) {
      await expect(desktopNavigation).toBeVisible();
      await expect(menuButton).toBeHidden();
    } else {
      await expect(desktopNavigation).toBeHidden();
      await expect(menuButton).toBeVisible();
      await expectWithinViewport(menuButton, page);
      await expectWithinViewport(page.locator('header a[href="/demo/aura"]').first(), page);
      await menuButton.click();
      await expect(page.getByRole("navigation", { name: "Navigasi mobile" })).toBeVisible();
    }

    if (testInfo.project.name === "chromium" && screenshotViewports.has(viewport.name)) {
      await testInfo.attach(`${viewport.name}-homepage`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
    }
  });
}
