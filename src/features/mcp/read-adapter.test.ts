import { describe, expect, it } from "vitest";

import {
  businessStatusFromProjection,
  executionReceiptsFromProjection,
  pendingDecisionsFromProjection,
  prioritiesFromOwnerAttention,
  projectionHasRealDecisionSource,
  projectionHasReceiptSource,
  searchToroProjection,
} from "./read-adapter";
import type { OwnerAttentionProjection } from "@/features/attention/owner-attention";
import type { BrainProjection } from "@/lib/brain-contracts";

function projection(): BrainProjection {
  return {
    contractVersion: "1.0.0",
    generatedAt: "2026-09-30T18:00:00.000Z",
    mode: "workspace",
    synthetic: false,
    context: {
      mode: "organization",
      scopeRef: "scope:test",
      organizationRef: "organization:test",
      isolationMode: "private",
    },
    nodes: [
      {
        id: "organization:test",
        kind: "organization",
        label: "Dreamcatcher",
        scopeRef: "scope:test",
        status: "Active",
        risk: "Low",
        verification: "verified",
        freshness: "current",
        sourceSystem: "Supabase",
        authoritySystem: "TORO Identity",
        capabilities: {
          canOpen: true,
          canInspectEvidence: false,
          canPrepareAction: false,
          canExecute: false,
          canApprove: false,
          actionCeiling: "observe",
          approvalRequirement: "None",
        },
      },
      {
        id: "project:website",
        kind: "project",
        label: "Dreamcatcher Website",
        scopeRef: "scope:test",
        status: "Active",
        risk: "Medium",
        verification: "verified",
        freshness: "current",
        sourceSystem: "Supabase",
        authoritySystem: "TORO Projects",
        capabilities: {
          canOpen: true,
          canInspectEvidence: true,
          canPrepareAction: false,
          canExecute: false,
          canApprove: false,
          actionCeiling: "observe",
          approvalRequirement: "None",
        },
        summary: "Growth · P1",
      },
      {
        id: "decision:1",
        kind: "decision",
        label: "Approve release gate",
        scopeRef: "scope:test",
        status: "Review",
        risk: "High",
        verification: "verified",
        freshness: "current",
        sourceSystem: "TORO",
        authoritySystem: "TORO Governance",
        capabilities: {
          canOpen: true,
          canInspectEvidence: true,
          canPrepareAction: false,
          canExecute: false,
          canApprove: true,
          actionCeiling: "observe",
          approvalRequirement: "Owner approval",
        },
      },
    ],
    edges: [],
    recentEvents: [
      {
        eventId: "event:1",
        occurredAt: "2026-09-30T17:00:00.000Z",
        scopeRef: "scope:test",
        actorKind: "workflow",
        actorRef: "builder",
        eventType: "action.completed",
        entityKind: "project",
        entityRef: "project:website",
        summary: "Checks passed",
        sourceSystem: "GitHub",
        authoritySystem: "GitHub",
        risk: "Low",
        approvalState: "not_required",
        executionState: "completed",
        verificationState: "verified",
        evidenceRefs: ["commit:test"],
        redactionClass: "work_org",
        correlationId: "corr:1",
        actionRef: "action:1",
      },
    ],
    sources: [
      {
        sourceSystem: "Supabase",
        authoritySystem: "TORO structured runtime",
        freshness: "current",
        verification: "verified",
      },
    ],
    partial: false,
  };
}

describe("TORO MCP read adapter", () => {
  it("searches only the permission-filtered projection it receives", () => {
    const hits = searchToroProjection(projection(), {
      query: "website",
      limit: 5,
    });
    expect(hits).toHaveLength(1);
    expect(hits[0].objectRef).toBe("project:website");
  });

  it("supports kind filters and bounded result limits", () => {
    expect(
      searchToroProjection(projection(), {
        query: "dreamcatcher",
        kinds: ["project"],
        limit: 1000,
      }),
    ).toHaveLength(1);
  });

  it("summarizes business state without inventing module metrics", () => {
    const status = businessStatusFromProjection(projection());
    expect(status.scopeRef).toBe("scope:test");
    expect(status.organization?.label).toBe("Dreamcatcher");
    expect(status.countsByKind.project).toBe(1);
    expect(status.riskCounts.High).toBe(1);
  });

  it("maps owner attention as partial priority evidence", () => {
    const attention: OwnerAttentionProjection = {
      contractVersion: "owner-attention-v1",
      generatedAt: "2026-09-30T18:00:00.000Z",
      total: 1,
      critical: 1,
      high: 0,
      normal: 0,
      items: [
        {
          key: "invoice:1",
          dedupeRef: "obligation:1",
          kind: "invoice",
          title: "Invoice due",
          priority: "critical",
          state: "open",
          dueDate: "2026-09-30",
          amount: 10,
          currency: "USD",
          ownerAgent: "FIONA",
          humanOwner: null,
          sourceSystem: "TORO Finance",
          sourceUrl: "evidence:invoice:1",
          mailbox: null,
        },
      ],
    };
    const priorities = prioritiesFromOwnerAttention(attention);
    expect(priorities[0]).toMatchObject({
      objectRef: "obligation:1",
      risk: "Critical",
      ownerRef: "FIONA",
    });
  });

  it("reads decisions and receipts only when present in the projection", () => {
    const p = projection();
    expect(projectionHasRealDecisionSource(p)).toBe(true);
    expect(pendingDecisionsFromProjection(p)[0].decisionRef).toBe("decision:1");
    expect(projectionHasReceiptSource(p)).toBe(true);
    expect(
      executionReceiptsFromProjection(p, { correlationId: "corr:1" })[0],
    ).toMatchObject({
      receiptRef: "event:1",
      verificationState: "verified",
    });
  });

  it("does not manufacture missing decisions or receipts", () => {
    const p = projection();
    p.nodes = p.nodes.filter((node) => node.kind !== "decision");
    p.recentEvents = [];
    expect(projectionHasRealDecisionSource(p)).toBe(false);
    expect(pendingDecisionsFromProjection(p)).toEqual([]);
    expect(projectionHasReceiptSource(p)).toBe(false);
    expect(executionReceiptsFromProjection(p)).toEqual([]);
  });
});
