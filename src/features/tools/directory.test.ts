import { describe, expect, it } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";
import { canReadHotelDirectory, DIRECTORY_SCOPE, projectHotelLinks } from "./directory";

const context = { mode: "organization", orgId: DIRECTORY_SCOPE.orgId,
  requiresContextChoice: false, canUseOrganizationData: true,
  membership: { orgId: DIRECTORY_SCOPE.orgId, status: "active", roles: ["GERENCIA"] },
} as ToroResolvedContext;
const entry = { id: "LINK-002", url: "https://dreamcatcherhotel.kross.travel/", email: "private@example.test" };
const row = { org_id: DIRECTORY_SCOPE.orgId, property_id: DIRECTORY_SCOPE.propertyId,
  knowledge_key: DIRECTORY_SCOPE.key, visibility: "internal",
  structured_content: { link_directory: { entries: [entry], accounts: [{ email: "private@example.test" }] } } };

describe("hotel directory boundary", () => {
  it("exposes only reviewed link fields, not accounts or evidence", () => {
    expect(projectHotelLinks(context, row)).toEqual([{id: "LINK-002", label: "💬 Cotizar estancia", url: entry.url}]);
  });
  it.each([null, {...context, mode: "personal"}, {...context, requiresContextChoice: true},
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
