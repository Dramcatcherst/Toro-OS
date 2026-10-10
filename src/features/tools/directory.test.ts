import { describe, expect, it } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";
import { canReadHotelDirectory, projectHotelLinks } from "./directory";
import { authorizedContext, quoteEntry as entry, readKross, sourceRow as row } from "./fixtures.test-utils";

const context = authorizedContext();

describe("hotel directory boundary", () => {
  it("reads only the approved navigation without creating connector grants", () => {
    const candidate = { ...context, allowedTools: [] };
    expect(canReadHotelDirectory(candidate)).toBe(true);
    expect(projectHotelLinks(candidate, row)).toEqual([{id:"LINK-002",label:"💬 Cotizar estancia",url:entry.url}]);
    expect(candidate.allowedTools).toEqual([]);
  });
  it("does not let connector grants authorize the directory in another org", () => {
    const candidate = {...context,orgId:"other",allowedTools:[readKross]};
    expect(canReadHotelDirectory(candidate)).toBe(false);
    expect(projectHotelLinks(candidate,row)).toEqual([]);
  });
  it("exposes only link fields, not accounts or evidence", () => {
    expect(projectHotelLinks(context,row)).toEqual([{id:"LINK-002",label:"💬 Cotizar estancia",url:entry.url}]);
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
