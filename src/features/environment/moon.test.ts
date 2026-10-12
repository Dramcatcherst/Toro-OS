import { expect, it } from "vitest";
import { moonRequestDate, projectMoon } from "./moon";
const now = Date.parse("2026-10-12T06:30:00Z");
const date = moonRequestDate(now);
const data = () => ({
  year: 2026, month: 9, day: 7, numphases: 12,
  // Synthetic timestamps; not production lunar data.
  phasedata: Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 8, 8 + i * 7, 3, 30));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
      time: "03:30", phase: ["New Moon","First Quarter","Full Moon","Last Quarter"][i % 4] };
  }),
});
it("preserves UT instants, selects previous and four next primary phases", () => {
  const result = projectMoon(data(), date, now);
  expect(result.state).toBe("ready");
  expect(result.next).toHaveLength(4);
  const first = new Date(result.next[0].at);
  expect(first.getUTCHours()).toBe(3);
  expect(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Costa_Rica", day: "2-digit" }).format(first))
    .not.toBe(String(first.getUTCDate()).padStart(2, "0"));
});
it("rejects stale response headers and explicit API errors", () => {
  expect(projectMoon({ ...data(), day: 8 }, date, now).state).toBe("unavailable");
  expect(projectMoon({ ...data(), error: "bad" }, date, now).state).toBe("unavailable");
});
it("rejects malformed dates, duplicate phases and insufficient future coverage", () => {
  const invalid = data(); invalid.phasedata[0].time = "25:00";
  expect(projectMoon(invalid, date, now).state).toBe("unavailable");
  const duplicate = data(); duplicate.phasedata[1] = duplicate.phasedata[0];
  expect(projectMoon(duplicate, date, now).state).toBe("unavailable");
  expect(projectMoon(data(), date, Date.parse("2027-01-01T00:00:00Z")).state).toBe("unavailable");
});
