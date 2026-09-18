import { describe, expect, it } from "vitest";

import {
  assessKrossImportReadiness,
  buildKrossImportRunDraft,
} from "./kross-ingest-contract";

describe("buildKrossImportRunDraft", () => {
  it("creates a staged read-only Kross import draft with explicit source time and checksum", () => {
    const draft = buildKrossImportRunDraft({
      sourceAsOf: "2026-09-17T23:10:00.000Z",
      rowCount: 14,
      checksum: "a".repeat(64),
      sourceReference: "kross:authenticated-read:2026-09-17T23:10:00.000Z",
      freshnessSlaHours: 2,
    });

    expect(draft).toEqual({
      sourceSystem: "Kross Booking",
      importKind: "operational_read_only_mirror",
      sourceAsOf: "2026-09-17T23:10:00.000Z",
      sourceReference: "kross:authenticated-read:2026-09-17T23:10:00.000Z",
      rowCount: 14,
      checksum: "a".repeat(64),
      freshnessSlaHours: 2,
      status: "staged",
      validationSummary: {
        transactionalAuthority: "Kross",
        readOnlyMirror: true,
        sourceIsLive: true,
      },
      errorCount: 0,
    });
  });

  it("rejects missing source time, weak checksums and invalid counts", () => {
    expect(() =>
      buildKrossImportRunDraft({
        sourceAsOf: "not-a-date",
        rowCount: 1,
        checksum: "a".repeat(64),
        sourceReference: "kross:test",
        freshnessSlaHours: 2,
      }),
    ).toThrow(/source/i);

    expect(() =>
      buildKrossImportRunDraft({
        sourceAsOf: "2026-09-17T23:10:00.000Z",
        rowCount: -1,
        checksum: "a".repeat(64),
        sourceReference: "kross:test",
        freshnessSlaHours: 2,
      }),
    ).toThrow(/row/i);

    expect(() =>
      buildKrossImportRunDraft({
        sourceAsOf: "2026-09-17T23:10:00.000Z",
        rowCount: 1,
        checksum: "short",
        sourceReference: "kross:test",
        freshnessSlaHours: 2,
      }),
    ).toThrow(/checksum/i);
  });
});

describe("assessKrossImportReadiness", () => {
  const base = {
    sourceAsOf: "2026-09-17T23:10:00.000Z",
    sourceIsLive: true,
    sourceRowCount: 14,
    mirrorRowCount: 14,
    sourceChecksum: "b".repeat(64),
    mirrorChecksum: "b".repeat(64),
    importedAt: "2026-09-17T23:15:00.000Z",
    now: "2026-09-17T23:20:00.000Z",
    freshnessSlaHours: 2,
  };

  it("marks a reconciled fresh live mirror ready", () => {
    expect(assessKrossImportReadiness(base)).toEqual({
      ready: true,
      status: "reconciled",
      reasons: [],
      canUpdateCurrentState: true,
    });
  });

  it("blocks current-state use when row count or checksum reconciliation fails", () => {
    expect(
      assessKrossImportReadiness({ ...base, mirrorRowCount: 13 }),
    ).toMatchObject({
      ready: false,
      status: "reconciliation_failed",
      canUpdateCurrentState: false,
    });

    expect(
      assessKrossImportReadiness({
        ...base,
        mirrorChecksum: "c".repeat(64),
      }),
    ).toMatchObject({
      ready: false,
      status: "reconciliation_failed",
      canUpdateCurrentState: false,
    });
  });

  it("accepts a verified zero-row import without interpreting it as zero hotel occupancy", () => {
    const result = assessKrossImportReadiness({
      ...base,
      sourceRowCount: 0,
      mirrorRowCount: 0,
      sourceChecksum: "d".repeat(64),
      mirrorChecksum: "d".repeat(64),
    });

    expect(result.ready).toBe(true);
    expect(result.canUpdateCurrentState).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("blocks stale or non-live sources from current-state use", () => {
    expect(
      assessKrossImportReadiness({ ...base, sourceIsLive: false }),
    ).toMatchObject({
      ready: false,
      status: "not_live",
      canUpdateCurrentState: false,
    });

    expect(
      assessKrossImportReadiness({
        ...base,
        sourceAsOf: "2026-09-17T18:00:00.000Z",
      }),
    ).toMatchObject({
      ready: false,
      status: "stale",
      canUpdateCurrentState: false,
    });
  });

  it("never treats a future source timestamp as trustworthy current data", () => {
    expect(
      assessKrossImportReadiness({
        ...base,
        sourceAsOf: "2026-09-18T01:00:00.000Z",
      }),
    ).toMatchObject({
      ready: false,
      status: "invalid_time",
      canUpdateCurrentState: false,
    });
  });
});
