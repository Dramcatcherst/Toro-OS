import { describe, expect, it } from "vitest";
import { BRAIN_CONTRACT_VERSION, type BrainEvent, type BrainProjection } from "@/lib/brain-contracts";
import { selectCurrentBrainActivity } from "./activity-overlay";

const now = "2026-09-28T09:00:00.000Z";
const ttl = 60_000;

function projection(): BrainProjection {
  return {
    contractVersion: BRAIN_CONTRACT_VERSION,
    generatedAt: now,
    mode: "workspace",
    synthetic: false,
    context: { mode: "organization", scopeRef: "scope:hotel", organizationRef: "org:hotel", isolationMode: "client_isolated" },
    nodes: [{
      id: "project:one", kind: "project", label: "Project", scopeRef: "scope:hotel", status: "Active", risk: "Low",
      verification: "verified", freshness: "current", sourceSystem: "Supabase", authoritySystem: "TORO Projects",
      capabilities: { canOpen: true, canInspectEvidence: false, canPrepareAction: false, canExecute: false, canApprove: false, actionCeiling: "observe", approvalRequirement: "None" },
    }],
    edges: [], sources: [], partial: false,
  };
}

function receipt(overrides: Partial<BrainEvent> = {}): BrainEvent {
  return {
    eventId: "event:1", occurredAt: "2026-09-28T08:59:40.000Z", scopeRef: "scope:hotel",
    actorKind: "agent", actorRef: "agent:sobresito", eventType: "action.started", entityKind: "project",
    entityRef: "project:one", summary: "Working", sourceSystem: "TORO", authoritySystem: "TORO Projects",
    risk: "Low", approvalState: "not_required", executionState: "executing", verificationState: "unverified",
    evidenceRefs: ["receipt:1"], redactionClass: "work_org", correlationId: "run:1", ...overrides,
  };
}

describe("selectCurrentBrainActivity", () => {
  it("pulses only for a current evidenced receipt on an authorized projected node", () => {
    const view = projection();
    view.recentEvents = [receipt()];
    expect(selectCurrentBrainActivity(view, now, ttl)).toEqual([{
      nodeId: "project:one", eventId: "event:1", state: "executing", occurredAt: "2026-09-28T08:59:40.000Z",
    }]);
  });

  it("does not pulse for synthetic, stale, future, cross-scope, hidden or unevidenced receipts", () => {
    for (const altered of [
      receipt({ occurredAt: "2026-09-28T08:58:00.000Z" }),
      receipt({ occurredAt: "2026-09-28T09:00:01.000Z" }),
      receipt({ scopeRef: "scope:other" }),
      receipt({ entityRef: "project:hidden" }),
      receipt({ evidenceRefs: [] }),
      receipt({ redactionClass: "work_private" }),
    ]) {
      const view = projection();
      view.recentEvents = [altered];
      expect(selectCurrentBrainActivity(view, now, ttl)).toEqual([]);
    }
    const demo = projection();
    demo.synthetic = true;
    demo.recentEvents = [receipt()];
    expect(selectCurrentBrainActivity(demo, now, ttl)).toEqual([]);
  });

  it("stops a run when its latest receipt is terminal, even if a start receipt is still fresh", () => {
    const view = projection();
    view.recentEvents = [receipt(), receipt({ eventId: "event:2", occurredAt: "2026-09-28T08:59:50.000Z", eventType: "action.completed", executionState: "completed", evidenceRefs: [] })];
    expect(selectCurrentBrainActivity(view, now, ttl)).toEqual([]);
  });

  it("rejects missing time bounds instead of leaving an indefinite pulse", () => {
    const view = projection();
    view.recentEvents = [receipt()];
    expect(selectCurrentBrainActivity(view, "not-a-time", ttl)).toEqual([]);
    expect(selectCurrentBrainActivity(view, now, 0)).toEqual([]);
  });
});
