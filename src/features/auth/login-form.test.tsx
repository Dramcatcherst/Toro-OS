import type { FormEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn(), refresh: vi.fn() },
  documentReplace: vi.fn(),
  search: vi.fn(),
  fetch: vi.fn(),
  browser: vi.fn(),
  signIn: vi.fn(),
  states: [] as unknown[],
  setters: [] as ReturnType<typeof vi.fn>[],
  stateIndex: 0,
}));

// Node has no React renderer or browser navigation. Keep the real form handler
// and safe-next policy, replacing only hooks and external side-effect boundaries.
vi.mock("react", async () => ({
  ...await vi.importActual<typeof import("react")>("react"),
  useState: (initialValue: unknown) => {
    const index = mocks.stateIndex++;
    if (index >= mocks.states.length) mocks.states[index] = initialValue;
    const setter = vi.fn((value: unknown) => {
      mocks.states[index] = typeof value === "function"
        ? (value as (previous: unknown) => unknown)(mocks.states[index])
        : value;
    });
    mocks.setters[index] = setter;
    return [mocks.states[index], setter];
  },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
  useSearchParams: () => ({ get: mocks.search }),
}));
vi.mock("@/lib/supabase/browser", () => ({
  createBrowserSupabaseClient: mocks.browser,
}));

import { LoginForm } from "./login-form";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.stateIndex = 0;
  mocks.states = [" qa.operator ", "synthetic-password", null, false, false];
  mocks.setters = [];
  mocks.search.mockReturnValue("/portal");
  mocks.browser.mockReturnValue({ auth: { signInWithPassword: mocks.signIn } });
  mocks.signIn.mockResolvedValue({ error: null });
  vi.stubGlobal("fetch", mocks.fetch);
  vi.stubGlobal("window", { location: { replace: mocks.documentReplace } });
});

afterEach(() => { vi.unstubAllGlobals(); });

async function submit(dreamTeamAccess = true) {
  const form = LoginForm({ dreamTeamAccess });
  const preventDefault = vi.fn();
  await form.props.onSubmit({ preventDefault } as unknown as FormEvent<HTMLFormElement>);
  expect(preventDefault).toHaveBeenCalledOnce();
}

function noNavigation() {
  expect(mocks.documentReplace).not.toHaveBeenCalled();
  expect(mocks.router.replace).not.toHaveBeenCalled();
  expect(mocks.router.refresh).not.toHaveBeenCalled();
}

describe("DreamTeam login navigation", () => {
  it("loads a fresh document after successful sign-in instead of reusing anonymous router state", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ ok: true, nextPath: "/portal" }));

    await submit();

    expect(mocks.fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "qa.operator", password: "synthetic-password", nextPath: "/portal" }),
    });
    expect(mocks.documentReplace).toHaveBeenCalledExactlyOnceWith("/portal");
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(mocks.router.refresh).not.toHaveBeenCalled();
    expect(mocks.browser).not.toHaveBeenCalled();
    expect(mocks.setters[1]).toHaveBeenCalledWith("");
    expect(mocks.setters[1].mock.invocationCallOrder[0])
      .toBeLessThan(mocks.documentReplace.mock.invocationCallOrder[0]);
    expect(mocks.states[3]).toBe(false);
  });

  it("retains a safe local query and fragment when replacing the document", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ ok: true, nextPath: "/portal?focus=people#team" }));

    await submit();

    expect(mocks.documentReplace).toHaveBeenCalledExactlyOnceWith("/portal?focus=people#team");
  });

  it.each(["https://outside.example/private", "//outside.example/private"])(
    "contains an external next destination (%s) at both request and navigation boundaries",
    async destination => {
      mocks.search.mockReturnValue(destination);
      mocks.fetch.mockResolvedValue(Response.json({ ok: true, nextPath: destination }));

      await submit();

      const request = mocks.fetch.mock.calls[0][1] as RequestInit;
      expect(JSON.parse(request.body as string).nextPath).toBe("/my-toro");
      expect(mocks.documentReplace).toHaveBeenCalledExactlyOnceWith("/my-toro");
      expect(mocks.router.replace).not.toHaveBeenCalled();
      expect(mocks.router.refresh).not.toHaveBeenCalled();
    },
  );

  it("does not navigate when the provider rejects the login", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ error: "Acceso no verificado." }, { status: 403 }));

    await submit();

    noNavigation();
    expect(mocks.states[2]).toBe("Acceso no verificado.");
    expect(mocks.states[3]).toBe(false);
  });

  it("does not navigate on a successful HTTP response without verified sign-in", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ ok: false, nextPath: "/portal" }));

    await submit();

    noNavigation();
    expect(mocks.states[2]).toEqual(expect.any(String));
  });

  it("does not navigate when the login request fails", async () => {
    mocks.fetch.mockRejectedValue(new Error("synthetic transport failure"));

    await submit();

    noNavigation();
    expect(mocks.states[2]).toEqual(expect.any(String));
    expect(mocks.states[3]).toBe(false);
  });

  it("does not navigate when the login response is malformed", async () => {
    mocks.fetch.mockResolvedValue(new Response("synthetic invalid JSON", { status: 200 }));

    await submit();

    noNavigation();
    expect(mocks.states[2]).toEqual(expect.any(String));
    expect(mocks.states[3]).toBe(false);
  });
});

describe("legacy login navigation", () => {
  it("preserves the existing Supabase sign-in and router navigation", async () => {
    await submit(false);

    expect(mocks.signIn).toHaveBeenCalledExactlyOnceWith({ email: "qa.operator", password: "synthetic-password" });
    expect(mocks.router.replace).toHaveBeenCalledExactlyOnceWith("/portal");
    expect(mocks.router.refresh).toHaveBeenCalledOnce();
    expect(mocks.documentReplace).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("keeps failed legacy sign-in on the current document", async () => {
    mocks.signIn.mockResolvedValue({ error: new Error("synthetic invalid credentials") });

    await submit(false);

    noNavigation();
    expect(mocks.states[2]).toEqual(expect.any(String));
  });
});
