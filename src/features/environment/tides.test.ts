import { describe, expect, it } from "vitest";
import { projectTides, type TidePrediction } from "./tides";
const scope = { orgId: "qa-org", propertyId: "qa-property", locationId: "qa-beach" };
const now = Date.parse("2026-10-12T06:30:00Z"); // 00:30 in Costa Rica
const sample = (): TidePrediction => ({
  ...scope, stationName: "Synthetic local reference", localReferenceVerified: true,
  timezone: "America/Costa_Rica", issuedAt: "2026-10-11T00:00:00Z",
  validUntil: "2026-10-14T00:00:00Z", sourceUrl: "https://miocimar.ucr.ac.cr/mareas",
  datum: "Synthetic datum",
  extremes: [
    { at: "2026-10-12T05:40:00Z", kind: "low", heightMeters: 0.2 },
    { at: "2026-10-12T09:00:00Z", kind: "high", heightMeters: 2.4 },
    { at: "2026-10-12T15:00:00Z", kind: "low", heightMeters: 0.3 },
  ],
});
describe("scoped tide projection", () => {
  it("filters by local day rather than UTC and preserves next extreme", () => {
    const view = projectTides(sample(), scope, now);
    expect(view.state).toBe("ready");
    expect(view.extremes).toHaveLength(2);
    expect(view.next?.at).toBe("2026-10-12T09:00:00Z");
  });
  it.each(["orgId", "propertyId", "locationId"] as const)("denies a different %s without leaking station", key => {
    const data = sample(); data[key] = "private-other-scope";
    expect(projectTides(data, scope, now)).toEqual({
      state: "invalid", extremes: [], next: null, station: null, sourceUrl: null,
    });
  });
  it("never substitutes an unverified neighboring reference", () => {
    expect(projectTides({ ...sample(), localReferenceVerified: false }, scope, now).state).toBe("invalid");
  });
  it("hides expired predictions", () => {
    expect(projectTides({ ...sample(), validUntil: "2026-10-12T06:00:00Z",
      extremes: [] }, scope, now).state).toBe("stale");
  });
  it("rejects future issuance, ambiguous offsets and missing datum", () => {
    expect(projectTides({ ...sample(), issuedAt: "2027-01-01T00:00:00Z" }, scope, now).state).toBe("invalid");
    expect(projectTides({ ...sample(), validUntil: "2026-10-14T00:00:00" }, scope, now).state).toBe("invalid");
    expect(projectTides({ ...sample(), datum: "" }, scope, now).state).toBe("invalid");
  });
  it("rejects unreviewed source URLs and conflicting duplicates", () => {
    expect(projectTides({ ...sample(), sourceUrl: "https://example.invalid/" }, scope, now).state).toBe("invalid");
    const data = sample(); data.extremes.push({ ...data.extremes[1], heightMeters: 99 });
    expect(projectTides(data, scope, now).state).toBe("invalid");
  });
  it("accepts no extrema on a local day without manufacturing times", () => {
    expect(projectTides({ ...sample(), extremes: [] }, scope, now).extremes).toEqual([]);
    expect(projectTides(null, scope, now).state).toBe("unavailable");
  });
});
