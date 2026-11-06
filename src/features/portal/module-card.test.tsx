import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PortalModuleCard } from "./module-card";
import type { PortalModule } from "./model";
import interactions from "./module-card-interaction.module.css";

const cardFixture: PortalModule = { ordinal: 2, label: "Dinero", description: "Finanzas", status: "Prioridades financieras",
  note: "Cobertura parcial", href: "/my-toro#owner-attention-heading", action: "Revisar prioridades" };

it("makes the full available card one named native link with its coverage description", () => {
  const html = renderToStaticMarkup(<PortalModuleCard module={cardFixture} />);
  expect(html).toMatch(/^<a\b/);
  expect(html.match(/<a\b/g)).toHaveLength(1);
  const headingId = html.match(/<h3 id="([^"]+)"/)?.[1];
  expect(headingId).toBeTruthy();
  expect(html).toContain(`aria-labelledby="${headingId}"`);
  expect(html).toContain('href="/my-toro#owner-attention-heading"');
  expect(html).toContain("Cobertura parcial");
  expect(html).not.toContain("<button");
});

it("keeps a pending card descriptive and out of the interactive tab order", () => {
  const html = renderToStaticMarkup(<PortalModuleCard module={{ ...cardFixture, href: null, action: null, status: "En preparación" }} />);
  expect(html).toMatch(/^<article\b/);
  expect(html).not.toMatch(/<(a|button)\b|tabindex|role="button"/);
  expect(html).toContain("En preparación");
});

it("applies the interaction guard only to an available module link", () => {
  const available = renderToStaticMarkup(<PortalModuleCard module={cardFixture} />);
  const pending = renderToStaticMarkup(<PortalModuleCard module={{ ...cardFixture, href: null, action: null }} />);
  const classes = (html: string) => (html.match(/class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
  expect(classes(available)).toContain(interactions.interactive);
  expect(classes(pending)).not.toContain(interactions.interactive);
  expect(available).toContain('data-module="2"');
});

const interactionCss = readFileSync(new URL("./module-card-interaction.module.css", import.meta.url), "utf8");

it("keeps hover contrast independent of legacy stylesheet ordering", () => {
  expect(interactionCss).toMatch(/\.interactive\[data-module\]:hover\s*\{\s*background:linear-gradient\(145deg,#183c5b,#162744\);/);
});

it("overrides hover motion for reduced-motion preferences", () => {
  expect(interactionCss).toMatch(/@media\s*\(prefers-reduced-motion:reduce\)\s*\{\s*\.interactive\[data-module\],\s*\.interactive\[data-module\]:hover\s*\{\s*transition:none;\s*transform:none;/);
});

it("preserves system colors for the interactive hover state", () => {
  expect(interactionCss).toMatch(/@media\s*\(forced-colors:active\)\s*\{\s*\.interactive\[data-module\]:hover\s*\{\s*background:Canvas;\s*border-color:LinkText;\s*box-shadow:none;/);
});
