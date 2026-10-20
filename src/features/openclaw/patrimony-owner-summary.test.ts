import { describe, expect, it } from "vitest";
import {
  PATRIMONY_OWNER_SUMMARY_CAPABILITY,
  PATRIMONY_OWNER_SUMMARY_RPC,
  evaluateOpenClawPatrimonyRequest,
  evaluateOpenClawPatrimonyResponse,
  openClawPatrimonyOwnerSummaryControls,
  type OpenClawPatrimonyRequest,
} from "./patrimony-owner-summary";

const now = Date.parse("2026-10-20T21:00:00Z");

function validRequest(): OpenClawPatrimonyRequest {
  return {
    runtime: {
      expectedHostId: "cloud-gateway-01",
      hostId: "cloud-gateway-01",
      mode: "cloud",
      writerMode: "primary",
    },
    channel: {
      expectedAccountKey: "owner-private",
      accountKey: "owner-private",
      kind: "whatsapp",
      scope: "private",
      conversationKind: "direct",
      bindingStatus: "verified",
      bindingActive: true,
      bindingOrgId: "org-private",
    },
    session: {
      status: "active",
      actorUserId: "user-owner",
      orgId: "org-private",
      expiresAt: "2026-10-20T22:00:00Z",
      revokedAt: null,
    },
    actor: {
      userId: "user-owner",
      membershipStatus: "active",
      roles: ["ADMIN"],
      toroRole: "FOUNDER",
      capabilities: [PATRIMONY_OWNER_SUMMARY_CAPABILITY],
    },
    auth: {
      dbRole: "authenticated",
      tokenKind: "user",
      tokenPresent: true,
    },
    request: {
      rpc: PATRIMONY_OWNER_SUMMARY_RPC,
      orgId: "org-private",
      actorId: "user-owner",
      ageMs: 1_000,
      timeoutMs: 3_000,
      attempt: 1,
      idempotencyKey: "patrimony:request:0001",
      correlationId: "patrimony:correlation:0001",
    },
    observability: {
      mode: "sanitized",
      rawIdentifiersIncluded: false,
      rawPayloadIncluded: false,
    },
  };
}

function validPayload() {
  return {
    contract: "patrimony-owner-summary-v1",
    actorId: "user-owner",
    orgId: "org-private",
    generatedAt: "2026-10-20T21:00:00Z",
    snapshot: {
      matrixVersion: "matrix-v1",
      observedAt: "2026-10-17T22:04:00Z",
      verifiedAt: "2026-10-19T21:50:42Z",
    },
    counts: {
      snapshots: 1,
      subjects: 11,
      legalEntities: 11,
      people: 0,
      assets: 15,
      propertyRights: 14,
      vehicles: 1,
      assetInterests: 14,
      registryEntries: 21,
      propertyRelations: 61,
      conflicts: 13,
    },
    conflicts: { open: 13, critical: 0, high: 0 },
  };
}

describe("OpenClaw patrimony owner summary controls", () => {
  it("implements exactly 30 unique improvements", () => {
    expect(openClawPatrimonyOwnerSummaryControls).toHaveLength(30);
    expect(new Set(openClawPatrimonyOwnerSummaryControls).size).toBe(30);
  });

  it("allows only the complete private owner request", () => {
    const result = evaluateOpenClawPatrimonyRequest(validRequest(), now);
    expect(result.allowed).toBe(true);
    expect(result.checks).toHaveLength(26);
    expect(result.blockers).toEqual([]);
  });

  it("fails closed on cross-organization or non-private channel reuse", () => {
    const request = validRequest();
    request.channel.bindingOrgId = "org-hotel";
    request.channel.scope = "organization";
    const result = evaluateOpenClawPatrimonyRequest(request, now);
    expect(result.allowed).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "private_scope",
      "binding_org_matches_target",
    ]));
  });

  it("rejects service role, revoked sessions and blind retries", () => {
    const request = validRequest();
    request.auth = { dbRole: "service_role", tokenKind: "service_role", tokenPresent: true };
    request.session.revokedAt = "2026-10-20T20:59:00Z";
    request.request.attempt = 2;
    const result = evaluateOpenClawPatrimonyRequest(request, now);
    expect(result.allowed).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "user_jwt_only",
      "session_not_revoked",
      "single_attempt",
    ]));
  });

  it("accepts only the aggregate response contract", () => {
    const result = evaluateOpenClawPatrimonyResponse(validPayload(), {
      orgId: "org-private",
      actorId: "user-owner",
    });
    expect(result.safe).toBe(true);
    expect(result.checks).toHaveLength(4);
  });

  it("blocks sensitive registry fields and scope drift", () => {
    const payload = { ...validPayload(), orgId: "org-hotel", details: { folio: "secret" } };
    const result = evaluateOpenClawPatrimonyResponse(payload, {
      orgId: "org-private",
      actorId: "user-owner",
    });
    expect(result.safe).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "aggregate_top_level_shape",
      "response_contract_and_scope",
      "forbidden_registry_fields_absent",
    ]));
  });
});
