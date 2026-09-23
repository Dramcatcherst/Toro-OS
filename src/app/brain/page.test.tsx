import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { BrainProjection } from "@/lib/brain-contracts";
import { visualBrainDemo } from "@/lib/brain-fixtures";

import { BrainView } from "./page";

const realProjection: BrainProjection = {
  contractVersion: "1.0.0",
  generatedAt: "2026-09-23T07:00:00Z",
  mode: "workspace",
  synthetic: false,
  context: {
    mode: "organization",
    scopeRef: "org:dreamcatcher",
    organizationRef: "dreamcatcher",
    isolationMode: "private",
  },
  nodes: [
    {
      id: "knowledge:housekeeping",
      kind: "knowledge",
      label: "Housekeeping + Laundry",
      scopeRef: "org:dreamcatcher",
      status: "Review",
      risk: "High",
      verification: "partially_verified",
      freshness: "aging",
      sourceSystem: "operations.knowledge_items",
      authoritySystem: "TORO Knowledge",
      capabilities: {
        canOpen: true,
        canInspectEvidence: true,
        canPrepareAction: false,
        canExecute: false,
        canApprove: false,
        actionCeiling: "observe",
        approvalRequirement: "Human review",
      },
      summary: "Governed knowledge: historical reference; human review required.",
    },
  ],
  edges: [],
  sources: [
    {
      sourceSystem: "operations.knowledge_items",
      authoritySystem: "TORO Knowledge",
      freshness: "aging",
      verification: "partially_verified",
    },
  ],
  partial: true,
  degradedReason: "Some relationships are still awaiting verification.",
};

describe("BrainView", () => {
  it("labels authorized real state distinctly from the synthetic demo", () => {
    render(<BrainView projection={realProjection} />);

    expect(screen.getByText(/real · read only/i)).toBeInTheDocument();
    expect(screen.queryByText(/^synthetic$/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("Housekeeping + Laundry").length).toBeGreaterThan(0);
    expect(screen.queryByText("Kross PMS")).not.toBeInTheDocument();
  });

  it("keeps the Stage B fixture explicitly synthetic", () => {
    render(<BrainView projection={visualBrainDemo} />);

    expect(screen.getByText(/^synthetic$/i)).toBeInTheDocument();
    expect(screen.getAllByText("Kross PMS").length).toBeGreaterThan(0);
  });

  it("does not substitute synthetic nodes into an empty real projection", () => {
    render(
      <BrainView
        projection={{
          ...realProjection,
          nodes: [],
          sources: [],
          degradedReason: "Source unavailable.",
        }}
      />,
    );

    expect(screen.getByText(/real · read only/i)).toBeInTheDocument();
    expect(screen.queryByText("Kross PMS")).not.toBeInTheDocument();
    expect(screen.getByText(/source unavailable/i)).toBeInTheDocument();
  });
});
