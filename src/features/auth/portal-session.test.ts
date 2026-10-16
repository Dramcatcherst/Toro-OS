import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { portalSessionAllowed } from "./portal-session";

describe("existing DreamTeam session policy", () => {
  it("checks the authenticated session RPC with nullable metadata rather than spoofing an upstream fingerprint", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { allowed: true, sessionId: "synthetic-session" }, error: null });
    expect(await portalSessionAllowed({ rpc } as unknown as SupabaseClient)).toBe(true);
    expect(rpc).toHaveBeenCalledWith("enforce_user_session", { p_user_agent_hash: null, p_network_hash: null });
  });
  it.each(["revoked", "absolute_timeout", "inactivity_timeout", "missing_session"])("rejects %s", async reason => {
    const rpc = vi.fn().mockResolvedValue({ data: { allowed: false, reason }, error: null });
    expect(await portalSessionAllowed({ rpc } as unknown as SupabaseClient)).toBe(false);
  });
  it.each([null, {}, { allowed: "true" }, { allowed: 1 }])("does not upgrade an ambiguous response %j", async data => {
    expect(await portalSessionAllowed({ rpc: async () => ({ data, error: null }) } as unknown as SupabaseClient)).toBe(false);
  });
  it("fails closed on an RPC error even when supplied allowed=true", async () => {
    expect(await portalSessionAllowed({ rpc: async () => ({ data: { allowed: true }, error: { message: "private diagnostic" } }) } as unknown as SupabaseClient)).toBe(false);
  });
  it("fails closed on transport exceptions", async () => {
    expect(await portalSessionAllowed({ rpc: async () => { throw new Error("private transport"); } } as unknown as SupabaseClient)).toBe(false);
  });
});
