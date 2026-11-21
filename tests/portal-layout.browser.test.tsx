/// <reference types="vite/client" />

import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { PortalHeader } from "@/features/portal/portal-header";
import { PortalWorkspace } from "@/features/portal/portal-workspace";
import { catalogueItemsFromLinks } from "@/features/tools/directory";
import styles from "@/features/portal/portal.module.css";
import portalCSS from "@/features/portal/portal.module.css?inline";

it("fits authenticated Portal content from narrow phones to wide monitors", async () => {
  const require = createRequire(import.meta.url);
  const preflight = await readFile(require.resolve("tailwindcss/preflight.css"), "utf8");
  const links = Array.from({ length: 9 }, (_, index) => ({
    id: `qa-tool-${index + 1}`, label: `Herramienta ${index + 1}`, url: "https://example.invalid/",
  }));
  const html = renderToStaticMarkup(<>
    <PortalHeader current="overview" scopeLabel="Organización de prueba" />
    <main className={styles.page} id="portal-content">
      <div className={styles.content}>
        <PortalWorkspace modules={[]} links={links} catalogueItems={catalogueItemsFromLinks(links)}
          catalogueMode="reviewed" hotelAllowed attention={<div>Pendientes de prueba</div>} />
      </div>
    </main>
  </>);
  const browser = await chromium.launch({ executablePath: process.env.PORTAL_QA_CHROMIUM });
  try {
    const page = await browser.newPage();
    for (const [width, height] of [[320, 720], [390, 844], [768, 900], [1440, 900], [1920, 1080]]) {
      await page.setViewportSize({ width, height });
      await page.setContent(`<!doctype html><html lang="es"><head><style>${preflight}\n${portalCSS}</style></head><body>${html}</body></html>`);
      const layout = await page.evaluate(({ home, favorites, contents }) => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tracks: getComputedStyle(document.querySelector(home)!).gridTemplateColumns.split(" ").length,
        favoriteTracks: getComputedStyle(document.querySelector(favorites)!).gridTemplateColumns.split(" ").length,
        contentWidth: document.querySelector(contents)!.getBoundingClientRect().width,
      }), { home: `.${styles.homeGrid}`, favorites: `.${styles.favoritesGrid}`, contents: `.${styles.content}` });
      expect(layout.overflow, `${width}px overflow`).toBe(0);
      expect(layout.tracks).toBe(width < 620 ? 1 : width < 960 ? 2 : 3);
      expect(layout.favoriteTracks).toBe(width < 1080 ? 2 : 3);
      if (width === 1920) expect(layout.contentWidth).toBeGreaterThan(1600);
      const menu = page.locator("header summary");
      expect((await menu.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      await menu.focus();
      await menu.press("Enter");
      expect(await page.getByRole("navigation", { name: "Portal TORO" }).isVisible()).toBe(true);
      expect(await page.getByRole("heading", { name: "Personas" }).isVisible()).toBe(true);
      const firstFavorite = page.locator(`.${styles.favoriteCard}`).first();
      expect((await firstFavorite.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await browser.close();
  }
}, 30_000);
