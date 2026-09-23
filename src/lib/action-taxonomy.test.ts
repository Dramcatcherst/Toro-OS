import { describe, expect, it } from "vitest";

import {
  TORO_ACTION_TAXONOMY,
  classifyToroActionIntentText,
  getToroActionIntent,
  type ToroActionIntentId,
} from "./action-taxonomy";

const EXPECTED_IDS: ToroActionIntentId[] = [
  "guest_inquiry",
  "availability_quote",
  "reservation_change",
  "guest_payment",
  "guest_invoice",
  "supplier_invoice",
  "refund_or_chargeback",
  "social_publication",
  "website_change",
  "seo_content",
  "paid_campaign",
  "maintenance_incident",
  "purchase_request",
  "employee_onboarding",
  "attendance_or_payroll_exception",
  "legal_or_insurance",
  "access_or_secret_change",
  "new_app_or_connector",
];

describe("TORO_ACTION_TAXONOMY", () => {
  it("preserves one unique semantic definition per approved action intent", () => {
    const ids = TORO_ACTION_TAXONOMY.map((item) => item.id);

    expect(ids).toEqual(EXPECTED_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("provides bilingual examples without defining execution authority", () => {
    for (const item of TORO_ACTION_TAXONOMY) {
      expect(item.examples.es.length).toBeGreaterThan(0);
      expect(item.examples.en.length).toBeGreaterThan(0);
      expect(item.domains.length).toBeGreaterThan(0);
    }

    const serialized = JSON.stringify(TORO_ACTION_TAXONOMY);
    for (const forbidden of [
      "execution_system",
      "source_of_truth",
      "owner_agent",
      "service_account",
      "api_key",
      "token",
      "password",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("marks money, legal and access mutations high or critical by default", () => {
    for (const id of [
      "guest_payment",
      "refund_or_chargeback",
      "guest_invoice",
      "supplier_invoice",
      "purchase_request",
      "attendance_or_payroll_exception",
      "legal_or_insurance",
      "access_or_secret_change",
    ] as const) {
      expect(["High", "Critical"]).toContain(getToroActionIntent(id).defaultRisk);
    }
  });

  it("keeps read-oriented guest inquiry and availability semantic risk low", () => {
    expect(getToroActionIntent("guest_inquiry").defaultRisk).toBe("Low");
    expect(getToroActionIntent("availability_quote").defaultRisk).toBe("Low");
  });
});


describe("classifyToroActionIntentText", () => {
  it("matches a governed semantic intent without choosing an execution system", () => {
    const result = classifyToroActionIntentText(
      "Necesito cotizar disponibilidad para dos personas",
    );

    expect(result).toMatchObject({
      status: "matched",
      id: "availability_quote",
    });
    expect(JSON.stringify(result)).not.toContain("executionSystem");
    expect(JSON.stringify(result)).not.toContain("sourceOfTruth");
  });

  it("is accent and punctuation insensitive", () => {
    const result = classifyToroActionIntentText(
      "¡PUBLICAR EN REDES SOCIALES!",
    );

    expect(result).toMatchObject({
      status: "matched",
      id: "social_publication",
    });
  });

  it("fails closed as unclassified for vague language", () => {
    expect(classifyToroActionIntentText("Haz eso que hablamos antes")).toEqual({
      status: "unclassified",
    });
  });

  it("fails closed as ambiguous when two strong intents compete", () => {
    const result = classifyToroActionIntentText(
      "guest invoice supplier invoice",
    );

    expect(result.status).toBe("ambiguous");
    if (result.status === "ambiguous") {
      expect(result.candidates).toEqual([
        "guest_invoice",
        "supplier_invoice",
      ]);
    }
  });

  it("never echoes arbitrary request text or embedded secret-shaped data", () => {
    const result = classifyToroActionIntentText(
      "check availability secret-value-should-not-return",
    );

    expect(JSON.stringify(result)).not.toContain(
      "secret-value-should-not-return",
    );
  });
});
