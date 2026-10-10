import { describe, expect, it } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";
import { canReadHotelDirectory, projectHotelLinks } from "./directory";
import { authorizedContext, quoteEntry as entry, readKross, sourceRow as row } from "./fixtures.test-utils";

const context = authorizedContext();

describe("hotel directory boundary", () => {
  it("does not turn a reader role into tool permission", () => {
    const withoutGrants = { ...context, allowedTools: [] };
    expect(canReadHotelDirectory(withoutGrants)).toBe(false);
    expect(projectHotelLinks(withoutGrants, row)).toEqual([]);
  });
  it("exposes only reviewed link fields, not accounts or evidence", () => {
    expect(projectHotelLinks(context, row)).toEqual([{id: "LINK-002", label: "💬 Cotizar estancia", url: entry.url}]);
  });
  it.each([
    { ...readKross, provider: "unmapped" }, { ...readKross, provider: "Kross" },
    { ...readKross, owner: "personal" as const }, { ...readKross, orgId: "another-org" },
    { ...readKross, orgId: null }, { ...readKross, actions: ["execute" as const] },
    { ...readKross, actions: ["search" as const] },
  ])("rejects a grant outside the provider, owner, org or read boundary: %j", grant => {
    const candidate = { ...context, allowedTools: [grant] };
    expect(canReadHotelDirectory(candidate)).toBe(false);
    expect(projectHotelLinks(candidate, row)).toEqual([]);
  });
  const otherEntries = [
    { id: "LINK-048", url: "https://dreamcatcherhotel.krossbooking.com/admin/dashboard#/admin/tableau/planner?id=dreamcatcherhotel" },
    { id: "LINK-178", url: "https://app.wespeak.pro/chatv2" },
    { id: "LINK-086", url: "https://dream-team-public.vercel.app/dreamteam/ingresar" },
    { id: "LINK-056", url: "https://calendar.google.com/" },
    { id: "LINK-131", url: "https://www.dropbox.com/home/Dreamcatcher%20Hotel" },
  ];
  it.each([
    ["kross", ["LINK-048", "LINK-002"]], ["wespeak", ["LINK-178"]],
    ["google-calendar", ["LINK-056"]], ["dropbox", ["LINK-131"]],
  ] as const)("projects only destinations mapped to the granted provider %s", (provider, ids) => {
    const candidate = { ...context, allowedTools: [{ ...readKross, provider }] };
    const mixed = { ...row, structured_content: { link_directory: { entries: [entry, ...otherEntries] } } };
    expect(projectHotelLinks(candidate, mixed).map(link => link.id)).toEqual(ids);
  });
  it("keeps DreamTeam unavailable until its provider contract is resolved", () => {
    const candidate = { ...context, allowedTools: [readKross, { ...readKross, provider: "dreamteam" }] };
    const mixed = { ...row, structured_content: { link_directory: { entries: [entry, ...otherEntries] } } };
    expect(projectHotelLinks(candidate, mixed).map(link => link.id)).toEqual(["LINK-048", "LINK-002"]);
  });
  it.each([null, {...context, userId: ""}, {...context, userId: " "}, {...context, allowedDataScopes: ["personal"]},
    {...context, mode: "personal"}, {...context, requiresContextChoice: true},
    {...context, canUseOrganizationData: false}, {...context, orgId: "other"},
    {...context, membership: {...context.membership, orgId: "other"}},
    {...context, membership: {...context.membership, status: "suspended"}},
    {...context, membership: {...context.membership, roles: ["EMPLEADO"]}},
  ])("denies unresolved or out-of-scope identity %j", candidate => {
    expect(canReadHotelDirectory(candidate as ToroResolvedContext | null)).toBe(false);
    expect(projectHotelLinks(candidate as ToroResolvedContext | null, row)).toEqual([]);
  });
  it.each([{...row,org_id:"other"},{...row,property_id:"other"},{...row,visibility:"public"},
    {...row,knowledge_key:"other"},null])("rejects wrong source scope", candidate => {
    expect(projectHotelLinks(context,candidate)).toEqual([]);
  });
  it.each(["javascript:alert(1)","https://evil.test/",entry.url+"?token=secret"])("rejects changed destinations %s", url => {
    expect(projectHotelLinks(context,{...row,structured_content:{link_directory:{entries:[{...entry,url}]}}})).toEqual([]);
  });
  it("rejects duplicate IDs and other project links", () => {
    expect(projectHotelLinks(context,{...row,structured_content:{link_directory:{entries:[entry,entry,{id:"LINK-217",url:"https://admin.booking.com/"}]}}})).toEqual([]);
  });
});
