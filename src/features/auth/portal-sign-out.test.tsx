import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/browser", () => ({ createBrowserSupabaseClient: () => { throw new Error("Auth config unavailable"); } }));
import { PortalSignOut } from "./portal-sign-out";

it("provides a native same-origin logout form without needing browser Auth configuration", () => {
  const html = renderToStaticMarkup(<PortalSignOut className="logout-style" />);
  expect(html).toContain('action="/api/auth/logout"');
  expect(html).toContain('method="post"');
  expect(html).toContain('type="submit"');
  expect(html).toContain("Cerrar sesión");
});
