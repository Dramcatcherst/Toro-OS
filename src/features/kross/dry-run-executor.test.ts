import { describe, expect, it } from "vitest";

import {
  createInMemoryKrossDryRunStore,
  executeKrossDryRun,
  executeKrossSanitizedExtractDryRun,
} from "./dry-run-executor";

const adapterConfig = {
  orgId: "11111111-1111-1111-1111-111111111111",
  propertyId: "22222222-2222-2222-2222-222222222222",
  fieldMap: {
    externalReservationId: "reservation.id",
    checkIn: "stay.check_in",
    checkOut: "stay.check_out",
    status: "reservation.status",
    roomCodeRaw: "stay.room",
  },
};

const baseEvidence = {
  authorizedTransport: true,
  directFromKross: true,
  readOnly: true,
  sourceAsOf: "2026-09-23T15:00:00.000Z",
  observedAt: "2026-09-23T15:05:00.000Z",
  sourceReference: "synthetic://kross/official-payload/K-100",
  sourceHash: "hash-k-100-v1",
};

const baseRequest = {
  adapterConfig,
  evidence: baseEvidence,
  nowIso: "2026-09-23T16:00:00.000Z",
};

function payload(status = "confirmed", id = "K-100") {
  return {
    reservation: { id, status },
    stay: {
      room: "26",
      check_in: "2026-09-25",
      check_out: "2026-09-27",
    },
  };
}

describe("executeKrossDryRun", () => {
  it.each([
    ["missing adapter config", { ...baseRequest, adapterConfig: null }],
    ["non-text organization scope", { ...baseRequest, adapterConfig: { ...adapterConfig, orgId: 123 } }],
    ["malformed required field map", { ...baseRequest, adapterConfig: { ...adapterConfig, fieldMap: { ...adapterConfig.fieldMap, externalReservationId: 123 } } }],
    ["missing evidence packet", { ...baseRequest, evidence: null }],
    ["non-text source hash", { ...baseRequest, evidence: { ...baseEvidence, sourceHash: {} } }],
    ["non-boolean authority claim", { ...baseRequest, evidence: { ...baseEvidence, authorizedTransport: "true" } }],
    ["non-text evaluation clock", { ...baseRequest, nowIso: 123 }],
  ])("rejects %s without throwing or creating a mirror", (_name, malformed) => {
    const store = createInMemoryKrossDryRunStore();
    const result = executeKrossDryRun(malformed as never, store);

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("reject");
    expect(result.executionIssues).toEqual(["invalid_execution_envelope"]);
    expect(result.reservation).toBeNull();
    expect(result.canEnterSafeView).toBe(false);
    expect(result.pmsWriteCount).toBe(0);
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(1);
    expect(typeof result.importRun.sourceReference).toBe("string");
    expect(typeof result.importRun.sourceHash).toBe("string");
  });

  it("keeps a malformed field-map rejection fenced after the map is corrected", () => {
    const store = createInMemoryKrossDryRunStore();
    const malformed = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload(),
        adapterConfig: {
          ...adapterConfig,
          fieldMap: { ...adapterConfig.fieldMap, checkIn: "" },
        },
      },
      store,
    );
    const corrected = executeKrossDryRun(
      { ...baseRequest, payload: payload() },
      store,
    );

    expect(malformed.status).toBe("rejected");
    expect(corrected.status).toBe("rejected");
    const otherRow = executeKrossDryRun(
      { ...baseRequest, payload: payload("confirmed", "K-101") },
      store,
    );

    expect(corrected.executionIssues).toContain("rejected_source_replay");
    expect(otherRow.status).toBe("accepted");
    expect(otherRow.operation).toBe("insert");
    expect(otherRow.reservation?.external_reservation_id).toBe("K-101");
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(2);
  });

  it.each([
    { sourceAsOf: "2026-09-23T17:00:00Z", observedAt: "2026-09-23T17:05:00Z" },
    { sourceAsOf: "2026-09-23T15:30:00Z", observedAt: "2026-09-23T15:05:00Z" },
  ])("does not let stored incoherent provenance fence a valid correction: %j", invalidTimes => {
    const store = createInMemoryKrossDryRunStore();
    const invalid = executeKrossDryRun({ ...baseRequest, payload: payload(), evidence: { ...baseEvidence, ...invalidTimes, sourceHash: "bad-provenance" } }, store);
    expect(invalid.reservation?.data_quality_status).toBe("review");
    const corrected = executeKrossDryRun({ ...baseRequest, payload: payload("cancelled"), evidence: { ...baseEvidence, sourceHash: "valid-correction" } }, store);
    expect(corrected.status).toBe("accepted");
    expect(corrected.operation).toBe("update");
    expect(corrected.reservation?.status).toBe("cancelled");
  });

  it("preserves a credible mirror when an incoherent future source arrives", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = { ...baseRequest, payload: payload("cancelled") };
    executeKrossDryRun(request, store);
    const invalid = executeKrossDryRun({ ...baseRequest, payload: payload(), evidence: { ...baseEvidence, sourceAsOf: "2026-09-23T17:00:00Z", observedAt: "2026-09-23T17:05:00Z", sourceHash: "future" } }, store);
    expect(invalid.status).toBe("rejected");
    expect(executeKrossDryRun(request, store).reservation?.status).toBe("cancelled");
  });

  it("keeps version ordering for credible provenance despite business-quality review", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = {
      ...baseRequest,
      adapterConfig: { ...adapterConfig, fieldMap: { ...adapterConfig.fieldMap, guestsCount: "guests.total", adults: "guests.adults", children: "guests.children" } },
      payload: { ...payload(), guests: { total: 1, adults: 2, children: 1 } },
    };
    const reviewed = executeKrossDryRun(request, store);
    expect(reviewed.normalizationIssues.map(issue => issue.code)).toContain("inconsistent_guest_count");
    const older = executeKrossDryRun({ ...baseRequest, payload: payload("cancelled"), evidence: { ...baseEvidence, sourceAsOf: "2026-09-23T14:00:00Z", sourceHash: "older" } }, store);
    expect(older.status).toBe("rejected");
    expect(older.executionIssues).toContain("stale_source");
    expect(executeKrossDryRun(request, store).reservation?.status).toBe("confirmed");
  });
  it("isolates runs between scopes and between records in one source artifact", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun({ ...baseRequest, payload: payload() }, store);
    const otherScope = executeKrossDryRun({ ...baseRequest, payload: payload(), adapterConfig: { ...adapterConfig, orgId: "org-b", propertyId: "property-b" } }, store);
    const otherRow = executeKrossDryRun({ ...baseRequest, payload: payload("confirmed", "K-101") }, store);
    expect(otherScope.operation).toBe("insert");
    expect(otherRow.operation).toBe("insert");
    expect(otherScope.importRun.identityKey).not.toBe(otherRow.importRun.identityKey);
    expect(store.mirrorCount()).toBe(3);
    expect(store.importRunCount()).toBe(3);
  });

  it("does not promote a rejected receipt to accepted on a corrected payload with the same source hash", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun({ ...baseRequest, payload: { ...payload(), stay: { ...payload().stay, check_in: "2026-02-30" } } }, store);
    const replay = executeKrossDryRun({ ...baseRequest, payload: payload() }, store);
    expect(replay.status).toBe("rejected");
    expect(replay.importRun.status).toBe("rejected");
    expect(store.mirrorCount()).toBe(0);
  });

  it("keeps known-ID rejections scoped to their row within one source artifact", () => {
    const store = createInMemoryKrossDryRunStore();
    const invalidK100 = executeKrossDryRun(
      {
        ...baseRequest,
        payload: {
          ...payload(),
          stay: { ...payload().stay, check_in: "2026-02-30" },
        },
      },
      store,
    );
    const validK101 = executeKrossDryRun(
      { ...baseRequest, payload: payload("confirmed", "K-101") },
      store,
    );

    expect(invalidK100.status).toBe("rejected");
    expect(validK101.status).toBe("accepted");
    expect(validK101.operation).toBe("insert");
    expect(validK101.reservation?.external_reservation_id).toBe("K-101");
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(2);
  });

  it("keeps incomplete known-ID rows from rejecting other rows in one source artifact", () => {
    const store = createInMemoryKrossDryRunStore();
    const invalidK100 = executeKrossDryRun(
      {
        ...baseRequest,
        payload: {
          reservation: { id: "K-100", status: "confirmed" },
          stay: { room: "26", check_out: "2026-09-27" },
        },
      },
      store,
    );
    const validK101 = executeKrossDryRun(
      { ...baseRequest, payload: payload("confirmed", "K-101") },
      store,
    );

    expect(invalidK100.status).toBe("rejected");
    expect(invalidK100.adapterIssues.map(issue => issue.field)).toContain("checkIn");
    expect(invalidK100.importRun.identityKey).toContain("K-100");
    expect(validK101.status).toBe("accepted");
    expect(validK101.operation).toBe("insert");
    expect(validK101.reservation?.external_reservation_id).toBe("K-101");
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(2);
  });

  it("does not report accepted replay when its stored mirror is missing", () => {
    const backing = createInMemoryKrossDryRunStore();
    const request = { ...baseRequest, payload: payload() };
    executeKrossDryRun(request, backing);
    const replay = executeKrossDryRun(request, { ...backing, getMirror: () => null });
    expect(replay.status).toBe("rejected");
    expect(replay.importRun.status).toBe("rejected");
    expect(replay.reservation).toBeNull();
  });

  it("rejects changed reservation content masquerading as the same source hash", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun({ ...baseRequest, payload: payload() }, store);
    const changed = executeKrossDryRun({ ...baseRequest, payload: payload("cancelled") }, store);
    expect(changed.status).toBe("rejected");
    const replay = executeKrossDryRun({ ...baseRequest, payload: payload() }, store);
    expect(replay.reservation?.status).toBe("confirmed");
    expect(replay.status).toBe("accepted");
  });

  it("does not resurrect a cancellation when an older snapshot arrives later", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun({ ...baseRequest, payload: payload("cancelled") }, store);
    const older = executeKrossDryRun({ ...baseRequest, payload: payload(), evidence: { ...baseEvidence, sourceAsOf: "2026-09-23T14:00:00Z", sourceHash: "older-hash" } }, store);
    expect(older.status).toBe("rejected");
    const current = executeKrossDryRun({ ...baseRequest, payload: payload("cancelled") }, store);
    expect(current.reservation?.status).toBe("cancelled");
  });

  it("quarantines conflicting contents at the same source version", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun({ ...baseRequest, payload: payload() }, store);
    const conflict = executeKrossDryRun({ ...baseRequest, payload: payload("cancelled"), evidence: { ...baseEvidence, sourceHash: "conflicting-hash" } }, store);
    expect(conflict.status).toBe("rejected");
    expect(conflict.importRun.status).toBe("rejected");
  });
  it("runs official payload through adapter and normalizer without live promotion", () => {
    const store = createInMemoryKrossDryRunStore();
    const result = executeKrossDryRun(
      { ...baseRequest, payload: payload() },
      store,
    );

    expect(result.status).toBe("accepted");
    expect(result.operation).toBe("insert");
    expect(result.reservation).toMatchObject({
      external_reservation_id: "K-100",
      status: "confirmed",
      read_only_mirror: true,
      source_is_live: false,
      data_quality_status: "review",
    });
    expect(result.canEnterSafeView).toBe(false);
    expect(result.pmsWriteCount).toBe(0);
    expect(result.importRun.pmsWriteCount).toBe(0);
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(1);
  });

  it("replays the same source idempotently without adding a mirror or import run", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = { ...baseRequest, payload: payload() };

    executeKrossDryRun(request, store);
    const replay = executeKrossDryRun(request, store);

    expect(replay.operation).toBe("replay");
    expect(replay.reservation?.external_reservation_id).toBe("K-100");
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(1);
    expect(replay.pmsWriteCount).toBe(0);
  });

  it("updates the same scoped identity and preserves explicit cancellation status", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun(
      { ...baseRequest, payload: payload(), evidence: baseEvidence },
      store,
    );

    const updated = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("cancelled"),
        evidence: { ...baseEvidence, sourceHash: "hash-k-100-v2", sourceAsOf: "2026-09-23T15:30:00Z", observedAt: "2026-09-23T15:35:00Z" },
      },
      store,
    );

    expect(updated.operation).toBe("update");
    expect(updated.reservation?.external_reservation_id).toBe("K-100");
    expect(updated.reservation?.status).toBe("cancelled");
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(2);
    expect(updated.pmsWriteCount).toBe(0);
  });

  it("rejects a missing external id before mirror creation", () => {
    const store = createInMemoryKrossDryRunStore();
    const result = executeKrossDryRun(
      {
        ...baseRequest,
        payload: {
          reservation: { status: "confirmed" },
          stay: { check_in: "2026-09-25", check_out: "2026-09-27" },
        },
      },
      store,
    );

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("reject");
    expect(result.reservation).toBeNull();
    expect(result.adapterIssues.map((issue) => issue.code)).toContain(
      "mapped_value_missing",
    );
    expect(result.pmsWriteCount).toBe(0);
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(1);

    const correctedReplay = executeKrossDryRun(
      { ...baseRequest, payload: payload() },
      store,
    );
    expect(correctedReplay.status).toBe("rejected");
    expect(correctedReplay.executionIssues).toContain("rejected_source_replay");
    expect(correctedReplay.importRun.runKey).toBe(result.importRun.runKey);
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(1);
  });

  it("executes the bounded synthetic acceptance batch with deterministic receipts and zero PMS writes", () => {
    const store = createInMemoryKrossDryRunStore();
    const initialRequest = { ...baseRequest, payload: payload() };
    const cancellationRequest = {
      ...baseRequest,
      payload: payload("cancelled"),
      evidence: {
        ...baseEvidence,
        sourceAsOf: "2026-09-23T15:30:00Z",
        observedAt: "2026-09-23T15:35:00Z",
        sourceHash: "hash-k-100-v2",
      },
    };
    const staleRequest = {
      ...baseRequest,
      payload: payload(),
      evidence: {
        ...baseEvidence,
        sourceAsOf: "2026-09-23T14:00:00Z",
        observedAt: "2026-09-23T14:05:00Z",
        sourceHash: "hash-k-100-stale",
      },
    };
    const sharedArtifactEvidence = {
      ...baseEvidence,
      sourceReference: "synthetic://kross/batch/2026-10-24",
      sourceHash: "hash-batch-2026-10-24",
    };

    const results = [
      executeKrossDryRun(initialRequest, store),
      executeKrossDryRun(initialRequest, store),
      executeKrossDryRun(cancellationRequest, store),
      executeKrossDryRun(staleRequest, store),
      executeKrossDryRun(
        {
          ...baseRequest,
          evidence: sharedArtifactEvidence,
          payload: {
            ...payload("confirmed", "K-102"),
            stay: {
              ...payload("confirmed", "K-102").stay,
              check_in: "2026-02-30",
            },
          },
        },
        store,
      ),
      executeKrossDryRun(
        {
          ...baseRequest,
          evidence: sharedArtifactEvidence,
          payload: payload("confirmed", "K-103"),
        },
        store,
      ),
    ];

    expect(results.map(result => [result.status, result.operation])).toEqual([
      ["accepted", "insert"],
      ["accepted", "replay"],
      ["accepted", "update"],
      ["rejected", "reject"],
      ["rejected", "reject"],
      ["accepted", "insert"],
    ]);
    expect(results[2].reservation?.status).toBe("cancelled");
    expect(results[3].executionIssues).toContain("stale_source");
    expect(results[4].reservation).toBeNull();
    expect(results[5].reservation?.external_reservation_id).toBe("K-103");
    expect(results.every(result => result.pmsWriteCount === 0)).toBe(true);
    expect(results.every(result => result.importRun.pmsWriteCount === 0)).toBe(true);
    expect(results.every(result => result.canEnterSafeView === false)).toBe(true);
    expect(store.mirrorCount()).toBe(2);
    expect(store.importRunCount()).toBe(5);
  });


  it("runs a sanitized extract through row-scoped dry-run receipts without live promotion", () => {
    const sourceHash = "a".repeat(64);
    const manifest = {
      orgId: adapterConfig.orgId,
      propertyId: adapterConfig.propertyId,
      sourceReference: "synthetic://kross/sanitized-export/2026-10-24",
      sourceHash,
      sourceAsOf: baseEvidence.sourceAsOf,
      observedAt: baseEvidence.observedAt,
      rowCount: 3,
      fieldMap: adapterConfig.fieldMap,
      sanitization: {
        credentialsExcluded: true,
        paymentCardDataExcluded: true,
        guestContactExcluded: true,
      },
      rows: [
        payload("confirmed", "K-100"),
        payload("confirmed", "K-100"),
        {
          ...payload("confirmed", "K-101"),
          stay: {
            ...payload("confirmed", "K-101").stay,
            check_in: "2026-02-30",
          },
        },
      ],
    };

    const result = executeKrossSanitizedExtractDryRun(
      manifest,
      baseRequest.nowIso,
      adapterConfig,
      {
        sourceReference: manifest.sourceReference,
        sourceHash,
      },
    );

    expect(result.status).toBe("completed");
    expect(result.issues).toEqual([]);
    expect(result.rows.map(row => [row.status, row.operation])).toEqual([
      ["accepted", "insert"],
      ["accepted", "replay"],
      ["rejected", "reject"],
    ]);
    expect(result.summary).toEqual({
      declaredRows: 3,
      executedRows: 3,
      acceptedRows: 2,
      rejectedRows: 1,
      mirrorCount: 1,
      importRunCount: 2,
      safeViewCount: 0,
      pmsWriteCount: 0,
    });
    expect(result.rows.every(row => row.pmsWriteCount === 0)).toBe(true);
    expect(result.rows.every(row => row.reservation?.source_is_live !== true)).toBe(true);
  });

  it.each([
    ["row count mismatch", { rowCount: 2 }, "row_count_mismatch"],
    ["wrong organization scope", { orgId: "org-b" }, "scope_mismatch"],
    ["wrong property scope", { propertyId: "property-b" }, "scope_mismatch"],
    ["non-SHA256 source hash", { sourceHash: "not-a-sha256" }, "invalid_source_hash"],
    ["source reference drift", {
      sourceReference: "synthetic://kross/sanitized-export/other",
    }, "source_artifact_mismatch"],
    ["source hash drift", { sourceHash: "c".repeat(64) }, "source_artifact_mismatch"],
    ["unconfirmed sanitization", {
      sanitization: {
        credentialsExcluded: true,
        paymentCardDataExcluded: false,
        guestContactExcluded: true,
      },
    }, "sanitization_unconfirmed"],
    ["future observation", { observedAt: "2026-09-23T17:00:00Z" }, "invalid_source_time"],
    ["empty required mapping", {
      fieldMap: { ...adapterConfig.fieldMap, checkIn: "" },
    }, "invalid_field_map"],
    ["non-empty mapping drift", {
      fieldMap: { ...adapterConfig.fieldMap, checkIn: "stay.arrival" },
    }, "field_map_mismatch"],
    ["unmapped guest contact field", {
      rows: [{
        ...payload(),
        guest: { email: "synthetic@example.invalid" },
      }],
    }, "unmapped_fields_present"],
    ["unexpected top-level credential field", {
      credential: "synthetic-secret",
    }, "unexpected_manifest_fields"],
    ["unexpected field-map entry", {
      fieldMap: {
        ...adapterConfig.fieldMap,
        guestEmail: "guest.email",
      },
    }, "unexpected_manifest_fields"],
    ["unexpected sanitization metadata", {
      sanitization: {
        credentialsExcluded: true,
        paymentCardDataExcluded: true,
        guestContactExcluded: true,
        redactionLog: "synthetic@example.invalid",
      },
    }, "unexpected_manifest_fields"],
  ])("blocks the entire sanitized extract on %s", (_name, override, issue) => {
    const manifest = {
      orgId: adapterConfig.orgId,
      propertyId: adapterConfig.propertyId,
      sourceReference: "synthetic://kross/sanitized-export/2026-10-24",
      sourceHash: "b".repeat(64),
      sourceAsOf: baseEvidence.sourceAsOf,
      observedAt: baseEvidence.observedAt,
      rowCount: 1,
      fieldMap: adapterConfig.fieldMap,
      sanitization: {
        credentialsExcluded: true,
        paymentCardDataExcluded: true,
        guestContactExcluded: true,
      },
      rows: [payload()],
      ...override,
    };

    const result = executeKrossSanitizedExtractDryRun(
      manifest,
      baseRequest.nowIso,
      adapterConfig,
      {
        sourceReference: "synthetic://kross/sanitized-export/2026-10-24",
        sourceHash: "b".repeat(64),
      },
    );

    expect(result.status).toBe("rejected");
    expect(result.issues).toContain(issue);
    expect(result.rows).toEqual([]);
    expect(result.summary.executedRows).toBe(0);
    expect(result.summary.mirrorCount).toBe(0);
    expect(result.summary.importRunCount).toBe(0);
    expect(result.summary.pmsWriteCount).toBe(0);
  });

});
