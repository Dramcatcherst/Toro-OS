import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KnowledgeDirectory } from "./knowledge-directory";

const items = [
  {
    id: "00000000-0000-0000-0000-000000000031",
    title: "Regla de autoridad Kross",
    knowledgeClass: "source_of_truth_rule",
    visibility: "internal",
    verifiedStatus: "verified",
    riskLevel: "critical",
    requiresHumanVerification: false,
    lastVerified: "2026-09-15",
    nextReview: "2026-10-15",
    sourceSystem: "Airtable",
    freshness: "2026-09-15T22:09:18.725Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000032",
    title: "SOP recepción",
    knowledgeClass: "reception_sop",
    visibility: "internal",
    verifiedStatus: "needs_verification",
    riskLevel: "medium",
    requiresHumanVerification: true,
    lastVerified: null,
    nextReview: null,
    sourceSystem: "Supabase",
    freshness: "2026-09-15T20:00:00.000Z",
  },
];

describe("KnowledgeDirectory", () => {
  it("renders metadata-only knowledge and highlights a selected Search result", () => {
    render(
      <KnowledgeDirectory
        items={items}
        selectedItemId="00000000-0000-0000-0000-000000000031"
      />,
    );

    expect(screen.getByRole("heading", { name: "Conocimiento" })).toBeInTheDocument();
    expect(screen.getByText("Regla de autoridad Kross").closest("article")).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(screen.getByText("SOP recepción").closest("article")).toHaveAttribute(
      "data-selected",
      "false",
    );
    expect(screen.getByText(/Requiere verificación humana/i)).toBeInTheDocument();
    expect(screen.queryByText(/must-not-leak/i)).not.toBeInTheDocument();
  });

  it("shows an honest empty state", () => {
    render(<KnowledgeDirectory items={[]} selectedItemId={null} />);
    expect(screen.getByText(/No hay conocimiento gobernado disponible/i)).toBeInTheDocument();
  });
});
