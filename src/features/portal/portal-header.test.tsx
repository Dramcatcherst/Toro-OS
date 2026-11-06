import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { publicSurfaceDecision } from "@/proxy";
import { PortalHeader } from "./portal-header";

afterEach(() => vi.unstubAllEnvs());

it("renders the canonical logo through an image URL admitted by the Portal perimeter", () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  const html = renderToStaticMarkup(<PortalHeader current="overview" />);
  const src = html.match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1];
  expect(src).toBeDefined();
  const response = publicSurfaceDecision(new NextRequest(new URL(src!.replaceAll("&amp;", "&"), "https://toro.invalid")));
  expect(response.headers.get("x-middleware-next")).toBe("1");
  expect(src).toBe("/brand/toro/toro-logo-master-v1.jpg");
  expect(html).not.toContain("/_next/image");
});
