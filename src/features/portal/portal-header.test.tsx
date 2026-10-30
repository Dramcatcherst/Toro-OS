import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { publicSurfaceDecision } from "@/proxy";
import { PortalHeader } from "./portal-header";

const masterPath = "/brand/toro/toro-logo-master-v1.jpg";

afterEach(() => vi.unstubAllEnvs());

it("ships the exact current master bytes, without replacing them with legacy artwork", () => {
  const bytes = readFileSync(new URL("../../../public/brand/toro/toro-logo-master-v1.jpg", import.meta.url));
  expect(createHash("sha256").update(bytes).digest("hex"))
    .toBe("15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747");
  expect([...bytes.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
});

it.each([true, false])("renders the master at its exact read-only URL with tools %s", includeTools => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  const html = renderToStaticMarkup(<PortalHeader current="overview" includeTools={includeTools} scopeLabel="Contexto sintético" />);
  const src = html.match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1];
  expect(src).toBe(masterPath);
  expect(html).not.toContain("/_next/image");
  expect(html).toContain('aria-label="TORO · Portal empresarial"');
  expect(html).toContain("OPERATION SYSTEM");
  expect(html).toContain('aria-label="Mi contexto: Contexto sintético"');
  expect(html).toContain('href="/portal"');
  expect(html).toContain('href="/my-toro"');
  expect(html.includes('href="/my-toro/herramientas"')).toBe(includeTools);
  for (const method of ["GET", "HEAD"]) {
    const response = publicSurfaceDecision(new NextRequest(new URL(src!, "https://toro.invalid"), { method }));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  }
});
