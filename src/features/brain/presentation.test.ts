import { describe, expect, it } from "vitest";
import { visualBrainDemo, visualBrainDemoLayout } from "@/lib/brain-fixtures";
import type { BrainProjectionView } from "@/lib/server/brain-projection";
import { attentionNodes, sourceObservation, toBrainClientView } from "./presentation";

function fixture(): BrainProjectionView {
  return structuredClone({
    projection: { ...visualBrainDemo, degradedReason: "internal-degraded-sentinel" },
    layout: visualBrainDemoLayout,
    runtime: { mode: "synthetic_only", realData: false, externalWrite: false,
      stage: "B", reason: "internal-reason-sentinel" },
  });
}

describe("brain presentation", () => {
  it("labels_coherent_demo_without_internal_diagnostics", () => {
    const view = toBrainClientView(fixture());
    expect(view.mode).toBe("demo");
    expect(view.projection.nodes.length).toBeGreaterThan(0);
    expect(JSON.stringify(view)).not.toContain("internal-reason-sentinel");
    expect(JSON.stringify(view)).not.toContain("internal-degraded-sentinel");
  });

  it("labels_canonical_read_only_without_promoting_coverage", () => {
    const input = fixture();
    input.runtime = { ...input.runtime, mode: "canonical_read_only", realData: true, stage: "C" };
    input.projection.synthetic = false;
    input.projection.mode = "workspace";
    input.projection.partial = true;
    const view = toBrainClientView(input);
    expect(view.mode).toBe("read-only");
    expect(view.projection.partial).toBe(true);
    expect(view.externalWrite).toBe(false);
  });

  it("rejects_inconsistent_runtime", () => {
    for (const reverse of [false, true]) {
      const input = fixture();
      if (reverse) input.projection.synthetic = false;
      else input.runtime = { ...input.runtime, mode: "canonical_read_only", realData: true, stage: "C" };
      const view = toBrainClientView(input);
      expect(view.mode).toBe("unavailable");
      expect(view.projection.nodes).toEqual([]);
      expect(view.projection.edges).toEqual([]);
      expect(view.projection.sources).toEqual([]);
      expect(view.projection.recentEvents).toEqual([]);
      expect(view.layout).toEqual({});
      expect(view.projection.partial).toBe(true);
      expect(JSON.stringify(view)).not.toContain("demo:dreamcatcher");
    }
  });

  it("rejects_wrong_stage_and_external_write", () => {
    const input = fixture();
    input.runtime.stage = "C";
    expect(toBrainClientView(input).mode).toBe("unavailable");
    Object.assign(input.runtime, { stage: "B", externalWrite: true });
    expect(toBrainClientView(input).mode).toBe("unavailable");
  });

  it("keeps_observation_unknown", () => {
    const source = { ...fixture().projection.sources[0], observedAt: undefined };
    expect(sourceObservation(source)).toBeNull();
    for (const observedAt of ["invalid", "123", "2026-02-30T12:00:00Z"])
      expect(sourceObservation({ ...source, observedAt })).toBeNull();
    expect(sourceObservation({ ...source, observedAt: "2026-09-30T03:00:00-06:00" }))
      .toBe("2026-09-30T09:00:00.000Z");
  });

  it("keeps_empty_data_empty_and_original_coverage", () => {
    const input = fixture();
    input.projection.nodes = [];
    input.projection.edges = [];
    input.projection.sources = [];
    input.projection.recentEvents = [];
    input.layout = {};
    input.projection.partial = false;
    const view = toBrainClientView(input);
    expect(view.projection.nodes).toEqual([]);
    expect(view.projection.sources).toEqual([]);
    expect(view.projection.partial).toBe(false);
    expect(attentionNodes(view.projection)).toEqual([]);
  });

  it("does_not_serialize_undeclared_fields_or_mutate_input", () => {
    const input = fixture();
    Object.assign(input.projection, { secret: "private-extra-sentinel" });
    Object.assign(input.projection.nodes[0], { secret: "private-extra-sentinel" });
    const before = JSON.stringify(input);
    expect(JSON.stringify(toBrainClientView(input))).not.toContain("private-extra-sentinel");
    expect(JSON.stringify(input)).toBe(before);
  });

  it("orders_attention_by_risk_then_id_and_caps_four", () => {
    const projection = fixture().projection;
    const base = projection.nodes[0];
    projection.nodes = [
      { ...base, id: "z", risk: "Low", status: "Active", verification: "verified" },
      { ...base, id: "d", risk: "Medium", status: "Review" },
      { ...base, id: "c", risk: "High" },
      { ...base, id: "b", risk: "Critical" },
      { ...base, id: "a", risk: "Critical" },
      { ...base, id: "e", risk: "Low", verification: "unverified" },
    ];
    expect(attentionNodes(projection).map(n => n.id)).toEqual(["a", "b", "c", "d"]);
    projection.nodes.reverse();
    expect(attentionNodes(projection).map(n => n.id)).toEqual(["a", "b", "c", "d"]);
    projection.nodes = [{ ...base, id: "x", risk: "Low", verification: "conflicted" }];
    expect(attentionNodes(projection).map(n => n.id)).toEqual(["x"]);
    projection.nodes = [{ ...base, id: "y", risk: "Low", status: "Blocked" }];
    expect(attentionNodes(projection).map(n => n.id)).toEqual(["y"]);
  });
});
