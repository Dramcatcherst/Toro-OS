import { describe, expect, it } from "vitest";

import { evaluateKrossTransportIntake, type KrossTransportIntake } from "./transport-intake";

const base = {
  providerName: "Kross Booking",
  ticketReference: "KB-305650/26",
  transportKind: "api" as const,
  readOnlyConfirmed: true,
  authorizedByProvider: true,
  billableActivationRequired: false,
  setupFee: null,
  recurringFee: null,
  otherFees: null,
  documentationReference: "provider-doc-1",
  credentialScopeSummary: "reservations:read",
  reservationsSupported: true,
  currentStaysSupported: true,
  arrivalsDeparturesSupported: true,
  liveRatesSupported: false,
  liveAvailabilitySupported: false,
  webhookEvents: [],
  exportFrequencyMinutes: null,
  sourceTimestampAvailable: true,
  externalReservationIdentityAvailable: true,
  fieldMapReady: true,
  approvedForFirstRead: true,
};

describe("evaluateKrossTransportIntake", () => {
  it.each(["readOnlyConfirmed", "authorizedByProvider", "sourceTimestampAvailable", "externalReservationIdentityAvailable", "fieldMapReady", "approvedForFirstRead"])("requires literal true for %s", key => {
    const input = { ...base, [key]: "false" } as unknown as KrossTransportIntake;
    const result = evaluateKrossTransportIntake(input);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(typeof result.validForReservationReadPreparation).toBe("boolean");
    expect(typeof result.readyForFirstAuthorizedRead).toBe("boolean");
  });

  it("does not claim support from malformed capability flags", () => {
    const input = { ...base, reservationsSupported: "true", currentStaysSupported: false, arrivalsDeparturesSupported: false, liveRatesSupported: "true", liveAvailabilitySupported: false } as unknown as KrossTransportIntake;
    const result = evaluateKrossTransportIntake(input);
    expect(result.validForReservationReadPreparation).toBe(false);
    expect(result.validForRateAvailabilityPreparation).toBe(false);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
  });

  it.each([undefined, "unknown", 0])("blocks unknown runtime billing %j", billing => {
    const result = evaluateKrossTransportIntake({ ...base, billableActivationRequired: billing } as unknown as KrossTransportIntake);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map(issue => issue.key)).toContain("billing_unknown");
  });

  it.each(["ftp", undefined])("blocks unknown transport kind %s", kind => {
    const result = evaluateKrossTransportIntake({ ...base, transportKind: kind } as unknown as KrossTransportIntake);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map(issue => issue.key)).toContain("transport_kind");
  });

  it.each([Infinity, NaN, 0, -1, "60"])("rejects malformed scheduled-export cadence %s", frequency => {
    const result = evaluateKrossTransportIntake({ ...base, transportKind: "scheduled_export", exportFrequencyMinutes: frequency } as unknown as KrossTransportIntake);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map(issue => issue.key)).toContain("export_frequency");
  });

  it.each([60, 0.5])("accepts a finite positive scheduled-export cadence %s", frequency => {
    expect(evaluateKrossTransportIntake({ ...base, transportKind: "scheduled_export", exportFrequencyMinutes: frequency }).readyForFirstAuthorizedRead).toBe(true);
  });

  it("accepts a fully documented read-only reservation transport for first-read preparation", () => {
    const result = evaluateKrossTransportIntake(base);

    expect(result.validForReservationReadPreparation).toBe(true);
    expect(result.readyForFirstAuthorizedRead).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("fails closed when provider authorization or read-only evidence is missing", () => {
    const result = evaluateKrossTransportIntake({
      ...base,
      authorizedByProvider: false,
      readOnlyConfirmed: false,
    });

    expect(result.validForReservationReadPreparation).toBe(false);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map((issue) => issue.key)).toEqual(
      expect.arrayContaining(["provider_authorization", "read_only"]),
    );
  });

  it("does not allow first read while billing status is unknown", () => {
    const result = evaluateKrossTransportIntake({
      ...base,
      billableActivationRequired: null,
    });

    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map((issue) => issue.key)).toContain("billing_unknown");
  });

  it("requires an official field map before reservation ingestion", () => {
    const result = evaluateKrossTransportIntake({
      ...base,
      fieldMapReady: false,
    });

    expect(result.validForReservationReadPreparation).toBe(true);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map((issue) => issue.key)).toContain("field_map");
  });

  it("tracks rate/availability preparation separately from reservation truth", () => {
    const result = evaluateKrossTransportIntake({
      ...base,
      reservationsSupported: false,
      currentStaysSupported: false,
      arrivalsDeparturesSupported: false,
      externalReservationIdentityAvailable: false,
      fieldMapReady: false,
      liveRatesSupported: true,
      liveAvailabilitySupported: true,
      approvedForFirstRead: false,
    });

    expect(result.validForReservationReadPreparation).toBe(false);
    expect(result.validForRateAvailabilityPreparation).toBe(true);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
  });
});
