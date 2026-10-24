import { describe, expect, it } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";
import { canReadCompleteHotelDirectory, canReadHotelDirectory, projectCompleteCatalogueRows, projectHotelLinks } from "./directory";
import { authorizedContext, completeCatalogueRows, quoteEntry as entry, readKross, sourceRow as row } from "./fixtures.test-utils";

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
  it("projects the exact reviewed Google Hotels profile without connector authority", () => {
    const hotelProfile = {id:"LINK-244",url:"https://www.google.co.cr/travel/hotels/entity/CgsIpKWViNeV4ufCARAB",account_refs:["private"]};
    expect(projectHotelLinks(context,{...row,structured_content:{link_directory:{entries:[hotelProfile]}}})).toEqual([
      {id:"LINK-244",label:"🏨 Ver Google Hotels",url:hotelProfile.url},
    ]);
    expect(context.allowedTools).toEqual([]);
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

describe("complete catalogue boundary", () => {
  it("limits the complete projection to ADMIN or GERENCIA in the exact hotel context", () => {
    expect(canReadCompleteHotelDirectory(context)).toBe(true);
    expect(canReadCompleteHotelDirectory({...context,membership:{...context.membership!,roles:["ADMIN"]}})).toBe(true);
    expect(canReadCompleteHotelDirectory({...context,membership:{...context.membership!,roles:["JEFE_DEPARTAMENTO"]}})).toBe(false);
    expect(canReadCompleteHotelDirectory({...context,membership:{...context.membership!,roles:["AUDITOR"]}})).toBe(false);
  });

  it("projects exactly 244 strict safe rows and represents a blank destination as pending", () => {
    const rows = completeCatalogueRows(); rows[200] = {...rows[200],url:""};
    const projected = projectCompleteCatalogueRows(context, rows);
    expect(projected).toHaveLength(244);
    expect(projected[200]).toMatchObject({kind:"directory",id:"LINK-201",url:null,label:"Herramienta 201"});
    expect(new Set(projected.map(item => item.id)).size).toBe(244);
    expect(JSON.stringify(projected)).not.toContain("evidence");
    expect(JSON.stringify(projected)).not.toContain("account_refs");
  });

  it.each([
    ["extra fields", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],evidence:"private"} as typeof rows[number]; }],
    ["unsafe protocol", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],url:"javascript:alert(1)"}; }],
    ["embedded credentials", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],url:"https://user:pass@example.test/"}; }],
    ["sensitive query", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],url:"https://example.test/?token=private"}; }],
    ["API key query", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],url:"https://example.test/?api_key=private"}; }],
    ["refresh token query", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],url:"https://example.test/?refresh_token=private"}; }],
    ["signed cloud query", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],url:"https://example.test/?X-Amz-Signature=private"}; }],
    ["sensitive fragment", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],url:"https://example.test/#/open?token=private"}; }],
    ["sensitive mail query", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[0] = {...rows[0],url:"mailto:hotel@example.test?token=private"}; }],
    ["duplicate IDs", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[1] = {...rows[1],id:rows[0].id}; }],
    ["noncanonical ID set", (rows: ReturnType<typeof completeCatalogueRows>) => { rows[243] = {...rows[243],id:"LINK-999"}; }],
    ["wrong count", (rows: ReturnType<typeof completeCatalogueRows>) => { rows.pop(); }],
  ])("fails the whole complete catalogue on %s", (_label, mutate) => {
    const rows = completeCatalogueRows(); mutate(rows);
    expect(projectCompleteCatalogueRows(context, rows)).toEqual([]);
  });
});

// I50-03/04: prevent secret-fragment and decoded mail-header data escaping the projection.
it.each([
  "https://example.test/#/open?token=private?view=x",
  "https://example.test/#token=private?view=x",
  "https://example.test/#/open?%74oken=private?view=x",
  "mailto:hotel%0d%0aX-Test:foo@example.test",
  "mailto:hotel@example.test?subject=Hi%0d%0aBcc%3Aother%40example.test",
  "mailto:hotel@example.test?subject=%00Hi",
  "mailto:hotel%ZZ@example.test",
])("rejects a destination carrying hidden unsafe data: %s", url => {
  const rows = completeCatalogueRows(); rows[0].url = url;
  expect(projectCompleteCatalogueRows(context, rows)).toEqual([]);
});
it.each(["https://example.test/#/open?view=x", "mailto:hotel@example.test?subject=Hello%20there&body=Good%20morning", "tel:+50626401234"])("retains safe contact and hash-route destinations: %s", url => {
  const rows = completeCatalogueRows(); rows[0].url = url;
  expect(projectCompleteCatalogueRows(context, rows)).toHaveLength(244);
});
