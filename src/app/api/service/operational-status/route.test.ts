import { beforeEach, describe, expect, it, vi } from "vitest";

const { authorizeOpenClawStatus, getOperationalStatus, loadHumanLayerRuntimeConfig } =
  vi.hoisted(() => ({
    authorizeOpenClawStatus: vi.fn(),
    getOperationalStatus: vi.fn(),
    loadHumanLayerRuntimeConfig: vi.fn(),
  }));

vi.mock("@/lib/server/machine-auth", () => ({ authorizeOpenClawStatus }));
vi.mock("@/lib/server/operational-status", () => ({ getOperationalStatus }));
vi.mock("@/lib/server/human-layer-config", () => ({
  loadHumanLayerRuntimeConfig,
}));

import { GET } from "./route";

const status = {
  version: "v1",
  generatedAt: "2026-09-17T22:50:00.000Z",
  currentHotelClaimsAllowed: false,
  hotel: {
    state: "unavailable",
    canClaimCurrent: false,
    sourceAsOf: null,
    ageMinutes: null,
    label: "Sin snapshot operativo verificable",
    metrics: null,
  },
  sources: {
    summary: { live: 2, configured: 5, blocked: 1, degraded: 0 },
    records: [
      {
        id: "vercel",
        name: "Vercel",
        health: "reachable",
        checkedAt: "2026-09-17T22:49:00.000Z",
        live: true,
        detail: "internal deployment detail that machine route does not need",
      },
    ],
  },
  warnings: ["Kross operativo no verificado."],
  chatSummary: "Estado del hotel — operación autenticada no verificada.",
};

const humanLayer = {
  state: "verified",
  knowledgeKey: "toro_human_layer_runtime_config_current",
  snapshotKey: "toro_human_layer_runtime_config_v1_2_20260922",
  configVersion: "TORO-HUMAN-LAYER-v1.2",
  configHash:
    "sha256:5bfe3b0d56db9f66f6737dde086d365a56b0d580dfb4c38c05105fc77a475c77",
  onboardingStepCount: 10,
  statePersistence: "not_implemented",
  sourceUpdatedAt: "2026-09-22T20:45:00.000Z",
  reason: null,
};

describe("GET /api/service/operational-status", () => {
  beforeEach(() => {
    authorizeOpenClawStatus.mockReset();
    getOperationalStatus.mockReset();
    loadHumanLayerRuntimeConfig.mockReset();
    authorizeOpenClawStatus.mockReturnValue({
      ok: true,
      principal: "openclaw-status-reader",
    });
    getOperationalStatus.mockResolvedValue(status);
    loadHumanLayerRuntimeConfig.mockResolvedValue(humanLayer);
  });

  it("fails before loading business/config status when machine auth fails", async () => {
    authorizeOpenClawStatus.mockReturnValue({
      ok: false,
      response: new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
      }),
    });

    const response = await GET(
      new Request("http://localhost/api/service/operational-status"),
    );
    expect(response.status).toBe(401);
    expect(getOperationalStatus).not.toHaveBeenCalled();
    expect(loadHumanLayerRuntimeConfig).not.toHaveBeenCalled();
  });

  it("returns scoped Human Layer identity and MATCH ack for an exact runtime report", async () => {
    const response = await GET(
      new Request("http://localhost/api/service/operational-status", {
        headers: {
          "x-toro-human-layer-version": "TORO-HUMAN-LAYER-v1.2",
          "x-toro-human-layer-hash":
            "sha256:5bfe3b0d56db9f66f6737dde086d365a56b0d580dfb4c38c05105fc77a475c77",
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toMatch(/no-store/i);

    const body = await response.json();
    expect(body).toEqual({
      version: "v1",
      generatedAt: status.generatedAt,
      currentHotelClaimsAllowed: false,
      hotel: status.hotel,
      sourceSummary: status.sources.summary,
      warnings: status.warnings,
      chatSummary: status.chatSummary,
      humanLayer,
      humanLayerAck: {
        state: "match",
        versionMatches: true,
        hashMatches: true,
      },
    });
    expect(JSON.stringify(body)).not.toContain("internal deployment detail");
    expect(JSON.stringify(body)).not.toMatch(
      /guest|email|phone|token|password|canonical_payload|private_fact/i,
    );
  });


  it("reports NOT_REPORTED when OpenClaw sends no config identity", async () => {
    const response = await GET(
      new Request("http://localhost/api/service/operational-status"),
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.humanLayerAck).toEqual({
      state: "not_reported",
      versionMatches: null,
      hashMatches: null,
    });
  });

  it("reports MISMATCH without echoing untrusted header values", async () => {
    const response = await GET(
      new Request("http://localhost/api/service/operational-status", {
        headers: {
          "x-toro-human-layer-version": "TORO-HUMAN-LAYER-v1.1",
          "x-toro-human-layer-hash":
            "sha256:913eb1581bdc59ae9311875cfbc5b07c4030de2f46436d6172d5599a67e83e4e",
        },
      }),
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.humanLayerAck).toEqual({
      state: "mismatch",
      versionMatches: false,
      hashMatches: false,
    });
    expect(JSON.stringify(body.humanLayerAck)).not.toContain("v1.1");
    expect(JSON.stringify(body.humanLayerAck)).not.toContain("913eb158");
  });

  it("reports INVALID_REPORT when only one or a malformed identity header is supplied", async () => {
    const response = await GET(
      new Request("http://localhost/api/service/operational-status", {
        headers: {
          "x-toro-human-layer-version": "not-a-version",
        },
      }),
    );

    const body = await response.json();
    expect(body.humanLayerAck).toEqual({
      state: "invalid_report",
      versionMatches: null,
      hashMatches: null,
    });
  });

  it("preserves fail-closed Human Layer state without affecting hotel status", async () => {
    loadHumanLayerRuntimeConfig.mockResolvedValue({
      state: "unverified",
      knowledgeKey: "toro_human_layer_runtime_config_current",
      snapshotKey: null,
      configVersion: null,
      configHash: null,
      onboardingStepCount: null,
      statePersistence: "unverified",
      sourceUpdatedAt: null,
      reason: "pointer_unavailable",
    });

    const response = await GET(
      new Request("http://localhost/api/service/operational-status"),
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.currentHotelClaimsAllowed).toBe(false);
    expect(body.humanLayer).toEqual({
      state: "unverified",
      knowledgeKey: "toro_human_layer_runtime_config_current",
      snapshotKey: null,
      configVersion: null,
      configHash: null,
      onboardingStepCount: null,
      statePersistence: "unverified",
      sourceUpdatedAt: null,
      reason: "pointer_unavailable",
    });
    expect(body.humanLayerAck).toEqual({
      state: "source_unverified",
      versionMatches: null,
      hashMatches: null,
    });
  });
});
