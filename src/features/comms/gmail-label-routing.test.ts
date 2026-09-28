import { describe, expect, it } from "vitest";

import { routeDreamcatcherGmailLabels } from "./gmail-label-routing";

describe("routeDreamcatcherGmailLabels", () => {
  it("routes finance labels to FIONA", () => {
    expect(
      routeDreamcatcherGmailLabels([
        "20 · FINANZAS",
        "20.1 · BANCOS / SINPE",
      ]),
    ).toMatchObject({
      domain: "finance",
      agents: ["FIONA"],
      attention: "normal",
      needsSecondaryClassification: false,
    });
  });

  it("keeps urgent attention while preserving the specific business domain", () => {
    const result = routeDreamcatcherGmailLabels([
      "00 · URGENTE",
      "10 · HUÉSPEDES & RESERVAS",
    ]);

    expect(result.domain).toBe("guest_revenue");
    expect(result.attention).toBe("critical");
    expect(result.agents).toEqual(expect.arrayContaining(["TORO", "TERE"]));
    expect(result.needsSecondaryClassification).toBe(false);
  });

  it("does not pretend the combined providers/HR label is sufficiently classified", () => {
    expect(
      routeDreamcatcherGmailLabels(["50 · PROVEEDORES / RRHH"]),
    ).toMatchObject({
      domain: "providers_hr",
      agents: ["FIONA"],
      needsSecondaryClassification: true,
    });
  });

  it("lets a specific domain outrank informational-only labels", () => {
    expect(
      routeDreamcatcherGmailLabels([
        "90 · AUTOMÁTICO / LECTURA",
        "40.2 · VERCEL / DEPLOYS",
      ]),
    ).toMatchObject({
      domain: "systems",
      agents: expect.arrayContaining(["SOBRESITO"]),
      attention: "informational",
      needsSecondaryClassification: false,
    });
  });

  it("fails safely to unclassified TORO routing for unknown labels", () => {
    expect(routeDreamcatcherGmailLabels(["SOME FUTURE LABEL"])).toEqual({
      domain: "unclassified",
      agents: ["TORO"],
      attention: "normal",
      needsSecondaryClassification: true,
      matchedLabels: [],
    });
  });
});
