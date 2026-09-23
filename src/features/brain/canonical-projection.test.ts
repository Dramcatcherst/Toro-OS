import { describe, expect, it } from "vitest";

import type { CanonicalBrainReadSlice } from "./canonical-read";
import {
  buildCanonicalBrainLayout,
  buildCanonicalBrainProjection,
} from "./canonical-projection";

function makeSlice(): CanonicalBrainReadSlice {
  return {
    contractVersion: "stage-c-read-v1",
    generatedAt: "2026-09-23T12:00:00.000Z",
    scopeRef: "scope:aaaaaaaaaaaaaaaaaaaa",
    organization: {
      ref: "organization:bbbbbbbbbbbbbbbbbbbb",
      label: "Dreamcatcher Hotel",
      status: "active",
    },
    projects: Array.from({ length: 7 }, (_, index) => ({
      ref: `project:p${index}`,
      label: `Project ${index + 1}`,
      status: index === 0 ? "blocked" : "active",
      priority: index === 0 ? "P0" : "P2",
      businessArea: "Operations",
      moduleKey: "TORO_OPERATE",
      completionPct: 20 + index,
      needsRevalidation: index === 1,
      sourceSystem: "Supabase",
      updatedAt: "2026-09-23T10:00:00.000Z",
    })),
    sourceAuthority: Array.from({ length: 5 }, (_, index) => ({
      ref: `authority:a${index}`,
      domain: `domain-${index}`,
      officialSource: index === 0 ? "Kross" : `Source-${index}`,
      authorityLevel: "official",
      approvalRequired: index === 0,
      status: "active",
      lastReviewed: "2026-09-23",
    })),
    domainGovernance: Array.from({ length: 5 }, (_, index) => ({
      ref: `governance:g${index}`,
      domain: `domain-${index}`,
      criticality: index === 0 ? "high" : "medium",
      qualityTarget: 0.95,
      qualityScore: index === 0 ? 0.8 : 0.98,
      lastReviewedAt: "2026-09-23T09:00:00.000Z",
      nextReviewAt: "2026-09-24T09:00:00.000Z",
    })),
    krossHealth: Array.from({ length: 6 }, (_, index) => ({
      ref: `kross-health:k${index}`,
      sourceName: `Kross Source ${index + 1}`,
      snapshotKind: "operational",
      sourceAsOf: "2026-09-23T11:30:00.000Z",
      observedAt: "2026-09-23T11:31:00.000Z",
      liveRequired: true,
      freshness: index === 0 ? "stale" : "fresh",
      safeForCurrentState: index !== 0,
    })),
  };
}

describe("buildCanonicalBrainProjection", () => {
  it("maps the safe read slice into the shared Visual Brain contract", () => {
    const projection = buildCanonicalBrainProjection(makeSlice());

    expect(projection.synthetic).toBe(false);
    expect(projection.mode).toBe("workspace");
    expect(projection.context.organizationRef).toBe(
      "organization:bbbbbbbbbbbbbbbbbbbb",
    );
    expect(projection.nodes[0]).toMatchObject({
      kind: "organization",
      label: "Dreamcatcher Hotel",
    });
  });

  it("keeps the focused projection under the Stage B visual budget", () => {
    const projection = buildCanonicalBrainProjection(makeSlice());

    expect(projection.nodes).toHaveLength(19);
    expect(projection.edges).toHaveLength(18);
    expect(projection.partial).toBe(true);
    expect(projection.nodes.length).toBeLessThanOrEqual(40);
    expect(projection.edges.length).toBeLessThanOrEqual(80);
  });

  it("maps unsafe Kross health to visible degraded/high-risk state", () => {
    const projection = buildCanonicalBrainProjection(makeSlice());
    const kross = projection.nodes.find(
      (node) => node.id === "kross-health:k0",
    );

    expect(kross).toMatchObject({
      kind: "connector",
      status: "Review",
      risk: "High",
      verification: "unverified",
      freshness: "stale",
      health: "degraded",
    });
  });

  it("maps revalidation and governance quality without inventing live truth", () => {
    const projection = buildCanonicalBrainProjection(makeSlice());

    expect(
      projection.nodes.find((node) => node.id === "project:p1"),
    ).toMatchObject({
      verification: "unverified",
      risk: "Medium",
    });

    expect(
      projection.nodes.find((node) => node.id === "governance:g0"),
    ).toMatchObject({
      verification: "partially_verified",
      status: "Review",
      risk: "High",
    });
  });

  it("produces bounded rows for the existing graph renderer", () => {
    const projection = buildCanonicalBrainProjection(makeSlice());
    const layout = buildCanonicalBrainLayout(projection);

    expect(layout["organization:bbbbbbbbbbbbbbbbbbbb"]).toEqual({
      x: 50,
      y: 8,
    });

    expect(
      Object.values(layout).every(
        (point) => point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100,
      ),
    ).toBe(true);
  });
});
