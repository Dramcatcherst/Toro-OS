import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHotelHomeSummary } from "../src/features/portal/hotel-home-summary.ts";

const readAt = "2026-11-09T05:30:00.000Z"; // 8 Nov 23:30 Costa Rica
const task = (n, change = {}) => ({ canonicalRef: "00000000-0000-4000-8000-" + String(n).padStart(12, "0"),
 title: "Work " + n, status: "planned", priority: "normal", area: "Operations", owner: "Owner",
 dueDate: "2026-11-10", sourceSystem: "TORO", updatedAt: "2026-11-07T12:00:00.000Z", needsRevalidation: false, ...change });
const source = (items, change = {}) => ({ state: "ready", items, rowsRead: items.length, limitReached: false, total: null, ...change });

test("dates belong to the Costa Rica day, even after UTC midnight", () => {
 const s = buildHotelHomeSummary(source([task(1, {dueDate:"2026-11-08"}), task(2,{dueDate:"2026-11-09"})]), readAt);
 assert.equal(s.day, "2026-11-08"); assert.equal(s.dueToday,1); assert.equal(s.pastDue,0);
});
test("crossing Costa Rica midnight reclassifies the recorded due date", () => {
 const s = buildHotelHomeSummary(source([task(1,{dueDate:"2026-11-08"})]),"2026-11-09T06:00:00.000Z");
 assert.equal(s.day,"2026-11-09"); assert.equal(s.pastDue,1); assert.equal(s.dueToday,0);
});
test("overdue excludes today, future and missing dates", () => {
 const s=buildHotelHomeSummary(source([task(1,{dueDate:"2026-11-07"}),task(2,{dueDate:"2026-11-08"}),task(3),task(4,{dueDate:null})]),readAt);
 assert.equal(s.pastDue,1); assert.equal(s.withoutDate,1);
});
test("critical means recorded critical or P0, not high or an unrecognized priority", () => {
 const s=buildHotelHomeSummary(source([task(1,{priority:"critical"}),task(2,{priority:"P0"}),task(3,{priority:"high"}),task(4,{priority:"unknown"})]),readAt);
 assert.equal(s.critical,2);
});
test("null and whitespace owners need assignment without guessing a person", () => {
 const s=buildHotelHomeSummary(source([task(1,{owner:null}),task(2,{owner:"  "}),task(3)]),readAt);
 assert.equal(s.unassigned,2);
});
test("revalidation remains distinct from criticality and a task with an old due date", () => {
 const s=buildHotelHomeSummary(source([task(1,{needsRevalidation:true}),task(2,{priority:"critical"}),task(3,{dueDate:"2026-11-07"})]),readAt);
 assert.equal(s.revalidation,1); assert.equal(s.critical,1); assert.equal(s.pastDue,1);
});
test("failed source never appears as a zero workload", () => {
 const s=buildHotelHomeSummary(source([], {state:"unavailable", rowsRead:null}),readAt);
 assert.equal(s.state,"unavailable"); assert.equal(s.count,null); assert.equal(s.pastDue,null);
 assert.equal(s.critical,null); assert.equal(s.unassigned,null); assert.deepEqual(s.next,[]);
});
test("a successful empty bounded batch remains different from unavailable", () => {
 const s=buildHotelHomeSummary(source([]),readAt);
 assert.equal(s.state,"ready"); assert.equal(s.count,0); assert.equal(s.pastDue,0);
});
test("invalid read clock does not invent today or zero date exceptions", () => {
 const s=buildHotelHomeSummary(source([task(1,{dueDate:"2026-11-07",owner:null})]),"not-a-time");
 assert.equal(s.day,null); assert.equal(s.pastDue,null); assert.equal(s.dueToday,null); assert.equal(s.unassigned,1);
});
test("offset-free read clock cannot depend on the executor's local timezone", () => {
 const s=buildHotelHomeSummary(source([task(1)]),"2026-11-09T05:30:00");
 assert.equal(s.day,null); assert.equal(s.dueToday,null);
});
test("triage puts recorded criticality before past due, today and later work", () => {
 const items=[task(1),task(2,{dueDate:"2026-11-08"}),task(3,{dueDate:"2026-11-07"}),task(4,{priority:"critical"})];
 const before=JSON.stringify(items);const s=buildHotelHomeSummary(source(items),readAt);
 assert.deepEqual(s.next.map(x=>x.title),["Work 4","Work 3","Work 2"]);assert.equal(JSON.stringify(items),before);
});
test("triage keeps source ordering for ties", () => {
 const s=buildHotelHomeSummary(source([task(3,{priority:"critical"}),task(1,{priority:"critical"}),task(2,{priority:"critical"}),task(4)]),readAt);
 assert.deepEqual(s.next.map(x=>x.title),["Work 3","Work 1","Work 2"]);
});
test("counts and read boundary retain separate coverage", () => {
 const s=buildHotelHomeSummary(source([task(1),task(2)],{rowsRead:200,limitReached:true}),readAt);
 assert.equal(s.count,2);assert.equal(s.rowsRead,200);assert.equal(s.limitReached,true);
});
test("latest source modification is not the time of this query", () => {
 const s=buildHotelHomeSummary(source([task(1),task(2,{updatedAt:"2026-11-08T12:00:00.000Z"})]),readAt);
 assert.equal(s.latestUpdatedAt,"2026-11-08T12:00:00.000Z");
});
test("future modification does not make historical work look freshly updated", () => {
 const s=buildHotelHomeSummary(source([task(1),task(2,{updatedAt:"2026-11-10T12:00:00.000Z"})]),readAt);
 assert.equal(s.latestUpdatedAt,"2026-11-07T12:00:00.000Z");assert.equal(s.futureUpdates,1);
});

test("unknown query clock cannot verify a far-future modification", () => {
 const s=buildHotelHomeSummary(source([task(1,{updatedAt:"2099-11-10T12:00:00Z"})]),null);
 assert.equal(s.latestUpdatedAt,null);
});
test("failed read retains a valid attempt time while workload stays unknown", () => {
 const s=buildHotelHomeSummary(source([],{state:"unavailable",rowsRead:null}),readAt);
 assert.equal(s.queryAt,readAt);assert.equal(s.count,null);
});
test("failed read never adopts an offset-free attempt time", () => {
 const s=buildHotelHomeSummary(source([],{state:"unavailable",rowsRead:null}),"2026-11-09T05:30:00");
 assert.equal(s.queryAt,null);
});
