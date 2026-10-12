import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PortalModuleCard } from "./module-card";
import type { PortalModule } from "./model";

const cardFixture: PortalModule = { ordinal: 2, label: "Dinero", description: "Finanzas", status: "Prioridades financieras",
  note: "Cobertura parcial", href: "/my-toro#owner-attention-heading", action: "Revisar prioridades" };

it("makes the full available card one named native link with its coverage description", () => {
  const html = renderToStaticMarkup(<PortalModuleCard module={cardFixture} />);
  expect(html).toMatch(/^<a\b/);
  expect(html.match(/<a\b/g)).toHaveLength(1);
  expect(html).toContain('aria-labelledby="portal-module-2"');
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
