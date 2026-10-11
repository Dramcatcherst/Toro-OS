import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
const mocks = vi.hoisted(() => ({ revalidate: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContextWithSupabase: mocks.revalidate }));
import { readPortalAttentionRpc, readPortalBrainRpc, portalReadRpcSelected } from "./portal-read-rpc";
import { loadCanonicalBrainReadSliceWithClient } from "@/features/brain/canonical-read";
import { loadOwnerAttentionProjectionWithClient } from "@/features/attention/owner-attention-server";
import sqlPayloads from "../../../tests/fixtures/portal-narrow-read-payloads.json";
const otherId = "22222222-2222-4222-8222-222222222222", cut = "2026-10-12T01:30:00.000Z";
type Payload = {contract:string;actorId:string;orgId:string|null;generatedAt:string;sources:Record<string,{rows:Record<string,unknown>[];limit:number}>};
function payload(finance = false): Payload {
  const context = authorizedContext();
  return { contract: "portal-read-rpc-v1", actorId: context.userId, orgId: context.orgId, generatedAt: cut,
    sources: finance ? { followups: { rows: [], limit: 100 }, obligations: { rows: [], limit: 150 }, invoices: { rows: [], limit: 200 } } : {
      organization: { rows: [{ id: context.orgId, name: "Synthetic organization", status: "active" }], limit: 1 },
      projects: { rows: [], limit: 25 }, sourceAuthority: { rows: [], limit: 25 }, domainGovernance: { rows: [], limit: 25 }, krossHealth: { rows: [], limit: 25 } } };
}
function client(data: unknown = payload()) { return { rpc: vi.fn().mockResolvedValue({ data, error: null }), from: vi.fn(), schema: vi.fn() }; }
const asClient = (db: ReturnType<typeof client>) => db as unknown as SupabaseClient;
const project = () => ({ org_id: authorizedContext().orgId, id: otherId, project_name: "Synthetic project",
  priority: "P0", status: "NOW", business_area: null, canonical_module_key: null, completion_pct: null,
  needs_revalidation: true, source_system: "Synthetic SQL fixture", updated_at: cut });
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal"); vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
  vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", "true"); vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "rpc_v1");
  mocks.revalidate.mockResolvedValue(authorizedContext());
});
afterEach(() => vi.unstubAllEnvs());
it.each([undefined, "direct"])("keeps %s on the existing transport", mode => { vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", mode); expect(portalReadRpcSelected()).toBe(false); });
it.each(["RPC_V1", "true", "", "rpc_v1 "])("rejects unsupported %s without I/O", async mode => {
  vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", mode); const db = client();
  await expect(loadCanonicalBrainReadSliceWithClient(authorizedContext(), asClient(db))).rejects.toThrow("transport");
  expect(db.rpc).not.toHaveBeenCalled(); expect(db.schema).not.toHaveBeenCalled();
});
it.each(["public", "brain_gate", "finance_gate"])("rejects %s before RPC", async reason => {
  if (reason === "public") vi.stubEnv("TORO_DEPLOYMENT_MODE", "public_demo");
  if (reason === "brain_gate") vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "false");
  if (reason === "finance_gate") vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", "false");
  const db = client(payload(true)); await expect(readPortalAttentionRpc(authorizedContext(), asClient(db))).rejects.toThrow("disabled"); expect(db.rpc).not.toHaveBeenCalled();
});
it.each(["personal", "suspended", "choice", "membership", "scope", "finance_role"])("rejects %s context before reading", async reason => {
  const context = authorizedContext();
  if (reason === "personal") context.mode = "personal";
  if (reason === "suspended") context.membership!.status = "suspended";
  if (reason === "choice") context.requiresContextChoice = true;
  if (reason === "membership") context.membership!.orgId = otherId;
  if (reason === "scope") context.allowedDataScopes = [];
  if (reason === "finance_role") context.membership!.roles = ["CONTABILIDAD"];
  const db = client(payload(true)); await expect(readPortalAttentionRpc(context, asClient(db))).rejects.toThrow("authorized"); expect(db.rpc).not.toHaveBeenCalled();
});
it("binds actor and organization and revalidates the session without direct-schema fallback", async () => {
  const context = authorizedContext(), db = client(); await readPortalBrainRpc(context, asClient(db));
  expect(db.rpc).toHaveBeenCalledExactlyOnceWith("toro_portal_brain_read_v1", { p_org_id: context.orgId, p_actor_id: context.userId });
  expect(mocks.revalidate).toHaveBeenCalledExactlyOnceWith(db, { mode: "organization", orgId: context.orgId });
  expect(db.schema).not.toHaveBeenCalled(); expect(db.from).not.toHaveBeenCalled();
});
it.each(["actor", "organization", "row"])("rejects mismatched %s", async reason => {
  const data = payload();
  if (reason === "actor") data.actorId = otherId;
  if (reason === "organization") data.orgId = otherId;
  if (reason === "row") data.sources.projects.rows = [{ ...project(), org_id: otherId }];
  await expect(readPortalBrainRpc(authorizedContext(), asClient(client(data)))).rejects.toThrow("scope"); expect(mocks.revalidate).not.toHaveBeenCalled();
});
it.each(["missing_source", "private_field", "limit", "oversized"])("rejects %s instead of producing empty or complete data", async reason => {
  const data = payload();
  if (reason === "missing_source") delete data.sources.krossHealth;
  if (reason === "private_field") data.sources.projects.rows = [{ ...project(), notes: "private_sentinel" }];
  if (reason === "limit") data.sources.projects.limit = 26;
  if (reason === "oversized") data.sources.projects.rows = Array.from({ length: 26 }, project);
  await expect(readPortalBrainRpc(authorizedContext(), asClient(client(data)))).rejects.toThrow("could not be verified");
});
it.each(["revoked", "actor_change", "membership_change", "local_mutation", "role_change"])("rejects %s after await", async reason => {
  const context = authorizedContext(), current = authorizedContext(), db = client();
  if (reason === "revoked") mocks.revalidate.mockResolvedValue(null);
  if (reason === "actor_change") current.userId = otherId;
  if (reason === "membership_change") current.membership!.status = "offboarded";
  if (reason === "role_change") current.membership!.roles = ["EMPLEADO"];
  if (reason !== "revoked") mocks.revalidate.mockResolvedValue(current);
  if (reason === "local_mutation") db.rpc.mockImplementation(async () => { context.userId = otherId; return { data: payload(), error: null }; });
  await expect(readPortalBrainRpc(context, asClient(db))).rejects.toThrow();
});
it("does not echo errors or fall back to direct schemas", async () => {
  const db = client(); db.rpc.mockResolvedValue({ data: null, error: { message: "private_sentinel" } });
  await expect(readPortalBrainRpc(authorizedContext(), asClient(db))).rejects.toThrow("Portal read source unavailable."); expect(db.schema).not.toHaveBeenCalled();
});
it.each(["rpc", "revalidation"])("sanitizes a thrown %s error", async phase => {
  const db = client();
  if (phase === "rpc") db.rpc.mockRejectedValue(new Error("private_sentinel"));
  else mocks.revalidate.mockRejectedValue(new Error("private_sentinel"));
  await expect(readPortalBrainRpc(authorizedContext(), asClient(db))).rejects.toThrow(phase === "rpc" ? "Portal read source unavailable." : "Portal read session could not be verified.");
});
it.each(["brain", "attention"])("accepts the %s payload produced by the actual local SQL and retains the existing projection", async kind => {
  const p = sqlPayloads[kind === "brain" ? "toro_portal_brain_read_v1" : "toro_portal_owner_attention_read_v1"];
  const context = authorizedContext(); context.orgId = p.orgId; context.userId = p.actorId; context.membership!.orgId = p.orgId;
  context.availableOrgIds = [p.orgId]; context.membership!.roles = ["ADMIN"];
  mocks.revalidate.mockResolvedValue(context);
  if (kind === "brain") {
    const result = await loadCanonicalBrainReadSliceWithClient(context, asClient(client(p)));
    expect(result.projects[0].label).toBe("Synthetic A"); expect(result.krossHealth[0].safeForCurrentState).toBe(false);
  } else {
    const result = await loadOwnerAttentionProjectionWithClient(context, asClient(client(p)));
    expect(result.coverage?.sources.map(s => s.rowsRead)).toEqual([1,1,1]);
    expect(result.coverage?.partial).toBe(true); expect(result.coverage?.totalInOrganization).toBeNull();
  }
});
it("preserves the Brain projection with hashed references", async () => {
  const data = payload(); data.sources.projects.rows = [project()];
  const result = await loadCanonicalBrainReadSliceWithClient(authorizedContext(), asClient(client(data)));
  expect(result.generatedAt).toBe(cut); expect(result.projects[0].needsRevalidation).toBe(true);
  expect(JSON.stringify(result)).not.toContain(authorizedContext().userId); expect(JSON.stringify(result)).not.toContain(authorizedContext().orgId);
});
it("keeps one trusted cut and conservative financial coverage", async () => {
  const result = await loadOwnerAttentionProjectionWithClient(authorizedContext(), asClient(client(payload(true))));
  expect(result.generatedAt).toBe(cut); expect(result.reportContext?.reportingDate).toBe("2026-10-11");
  expect(result.reportContext?.timeZone).toBe("America/Costa_Rica"); expect(result.coverage?.partial).toBe(true);
  expect(result.coverage?.totalInOrganization).toBeNull(); expect(result.coverage?.sources.map(s => s.limit)).toEqual([100,150,200]);
});
it("rejects an impossible financial date without interpreting it as no attention", async () => {
  const p = payload(true);
  p.sources.invoices.rows = [{ org_id: p.orgId, invoice_key: "synthetic", issuer_name: "Synthetic issuer",
    document_number: null, due_date: "2026-02-30", currency: "CRC", total: 10, payment_status: "pending",
    obligation_key: null, mailbox: null, source_url: null }];
  await expect(readPortalAttentionRpc(authorizedContext(), asClient(client(p)))).rejects.toThrow("could not be verified");
});
