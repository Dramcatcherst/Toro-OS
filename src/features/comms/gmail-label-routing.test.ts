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


describe("C50-02 current labels before legacy", () => {
  it("keeps numbered archive authoritative and retains matched provenance", () => {
    const labels = ["99 · ARCHIVO HISTÓRICO", "Dreamcatcher/Accounting"];
    for (const input of [labels, [...labels].reverse()]) {
      expect(routeDreamcatcherGmailLabels(input)).toMatchObject({
        domain: "archive", agents: [], attention: "archive", needsSecondaryClassification: false,
        matchedLabels: expect.arrayContaining(labels),
      });
    }
    expect(routeDreamcatcherGmailLabels(["Dreamcatcher/Accounting"]).domain).toBe("finance");
    expect(routeDreamcatcherGmailLabels(["20 · FINANZAS", "Dreamcatcher/Guest & Info"])).toMatchObject({
      domain: "finance", agents: ["FIONA"],
    });
  });
});

describe("C50-03 conflicting current domain labels", () => {
  it("requires classification independent of provider label order", () => {
    const labels = ["20 · FINANZAS", "40 · SISTEMAS", "00 · URGENTE"];
    const first = routeDreamcatcherGmailLabels(labels);
    const reverse = routeDreamcatcherGmailLabels([...labels].reverse());
    expect(first).toMatchObject({ domain: "unclassified", agents: ["TORO"], attention: "critical", needsSecondaryClassification: true });
    expect(reverse).toEqual(first);
    expect(first.matchedLabels).toEqual(expect.arrayContaining(labels));
  });

  it("lets a numbered child refine its broad parent without fabricating a conflict", () => {
    expect(routeDreamcatcherGmailLabels(["20 · FINANZAS", "20.5 · PUBLICIDAD / ADS"])).toMatchObject({
      domain: "growth", agents: ["SKY"], needsSecondaryClassification: false,
    });
  });

  it("does not confuse same-domain parent and child labels with ambiguity", () => {
    expect(routeDreamcatcherGmailLabels(["20 · FINANZAS", "20.1 · BANCOS / SINPE"])).toMatchObject({
      domain: "finance", needsSecondaryClassification: false,
    });
  });
});

describe("C50-04 own label allowlist", () => {
  it.each(["__proto__", "constructor", "toString"])("treats inherited %s as unknown", (label) => {
    expect(routeDreamcatcherGmailLabels([label])).toMatchObject({ domain: "unclassified", matchedLabels: [] });
    expect(routeDreamcatcherGmailLabels([label, "20 · FINANZAS"])).toMatchObject({ domain: "finance", matchedLabels: ["20 · FINANZAS"] });
  });
});
