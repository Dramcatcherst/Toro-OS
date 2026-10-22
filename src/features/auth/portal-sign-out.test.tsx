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

it("publishes a content-free invalidation nonce while retaining native form submission", () => {
  const setItem=vi.fn();
  vi.stubGlobal("window",{localStorage:{setItem}});
  try {
    const form=PortalSignOut({});
    form.props.onSubmit?.();
    expect(setItem).toHaveBeenCalledWith("toro_private_view_invalidation_v1",expect.any(String));
    const nonce=setItem.mock.calls[0]?.[1];
    expect(nonce).toBeTruthy();expect(nonce).not.toMatch(/user|token|organization|email/i);
    expect(form.props.method).toBe("post");expect(form.props.action).toBe("/api/auth/logout");
  } finally {vi.unstubAllGlobals();}
});
it("keeps a native logout submission usable when browser storage rejects", () => {
  vi.stubGlobal("window",{localStorage:{setItem:()=>{throw Error("denied");}}});
  try {expect(()=>PortalSignOut({}).props.onSubmit?.()).not.toThrow();}
  finally {vi.unstubAllGlobals();}
});
