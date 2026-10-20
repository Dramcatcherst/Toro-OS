import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ context: vi.fn(), client: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: mocks.context }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.client }));
import { loadHotelDirectory } from "./server";
import { REVIEWED_HOTEL_LINKS } from "./directory";
import { authorizedContext, completeCatalogueRows } from "./fixtures.test-utils";

beforeEach(() => vi.resetAllMocks());
const manager = {...authorizedContext(),email:"admin@example.test"};
const auditor = {...manager,membership:{...manager.membership!,roles:["AUDITOR"] as const}};
const reviewedRows = REVIEWED_HOTEL_LINKS.map(([id, , url]) => ({id,url}));

it("never queries the registry without authorized context", async () => {
  mocks.context.mockResolvedValue(null);
  expect(await loadHotelDirectory()).toEqual({state:"denied",links:[],catalogueItems:[],catalogueMode:"reviewed"});
  expect(mocks.client).not.toHaveBeenCalled();
});

it("uses the complete strict RPC only for GERENCIA and keeps its rows out of operational links", async () => {
  mocks.context.mockResolvedValue(manager);
  const rows=completeCatalogueRows();
  const rpc=vi.fn(async (name:string) => name === "dreamcatcher_tool_catalog_v1"
    ? {error:null,data:rows} : {error:new Error("unexpected"),data:null});
  mocks.client.mockResolvedValue({rpc});
  const view=await loadHotelDirectory({includeApprovedNavigation:true,includeCompleteCatalogue:true});
  expect(view.state).toBe("ready");
  expect(view.catalogueMode).toBe("complete");
  expect(view.catalogueItems).toHaveLength(244);
  expect(view.links).toHaveLength(REVIEWED_HOTEL_LINKS.length + 6);
  expect(view.links.every(link => !link.id.match(/^LINK-(?:1\d\d|2[0-3]\d)$/) || REVIEWED_HOTEL_LINKS.some(([id]) => id === link.id))).toBe(true);
  expect(rpc).toHaveBeenCalledExactlyOnceWith("dreamcatcher_tool_catalog_v1");
});

it("falls back to v1 without leaking a malformed complete response", async () => {
  mocks.context.mockResolvedValue(manager);
  const unsafe=completeCatalogueRows(); unsafe[0]={...unsafe[0],evidence:"private"} as typeof unsafe[number];
  const rpc=vi.fn(async (name:string) => name === "dreamcatcher_tool_catalog_v1"
    ? {error:null,data:unsafe} : {error:null,data:reviewedRows});
  mocks.client.mockResolvedValue({rpc});
  const view=await loadHotelDirectory({includeCompleteCatalogue:true});
  expect(view).toMatchObject({state:"ready",catalogueMode:"fallback"});
  expect(view.catalogueItems).toHaveLength(REVIEWED_HOTEL_LINKS.length);
  expect(JSON.stringify(view)).not.toContain("private");
  expect(rpc.mock.calls.map(call => call[0])).toEqual(["dreamcatcher_tool_catalog_v1","dreamcatcher_tool_links_v1"]);
});

it("keeps a valid complete catalogue independent from missing operational shortcuts", async () => {
  mocks.context.mockResolvedValue(manager);
  const rows=completeCatalogueRows();
  rows.find(row => row.id === "LINK-048")!.url="https://catalogue.example.test/review-required";
  const rpc=vi.fn().mockResolvedValue({error:null,data:rows});
  mocks.client.mockResolvedValue({rpc});
  const view=await loadHotelDirectory({includeCompleteCatalogue:true});
  expect(view).toMatchObject({state:"ready",catalogueMode:"complete"});
  expect(view.catalogueItems).toHaveLength(244);
  expect(view.links.some(link => link.id === "LINK-048")).toBe(false);
  expect(rpc).toHaveBeenCalledExactlyOnceWith("dreamcatcher_tool_catalog_v1");
});

it("keeps JEFE and AUDITOR on the reviewed v1 boundary", async () => {
  for (const role of ["JEFE_DEPARTAMENTO","AUDITOR"] as const) {
    mocks.context.mockResolvedValue({...auditor,membership:{...auditor.membership!,roles:[role]}});
    const rpc=vi.fn().mockResolvedValue({error:null,data:reviewedRows});
    mocks.client.mockResolvedValue({rpc});
    const view=await loadHotelDirectory({includeCompleteCatalogue:true});
    expect(view.catalogueMode).toBe("reviewed");
    expect(view.catalogueItems).toHaveLength(REVIEWED_HOTEL_LINKS.length);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("dreamcatcher_tool_links_v1");
  }
});

it("distinguishes a missing reviewed connection from login for a restricted reader", async () => {
  mocks.context.mockResolvedValue(auditor);
  const rpc=vi.fn().mockResolvedValue({error:{code:"PGRST202",message:"private details"},data:null});
  mocks.client.mockResolvedValue({rpc});
  expect(await loadHotelDirectory()).toEqual({state:"unavailable",links:[],catalogueItems:[],catalogueMode:"fallback",
    account:"admin@example.test",reason:"connection_pending"});
  expect(rpc).toHaveBeenCalledExactlyOnceWith("dreamcatcher_tool_links_v1");
});

it("projects reviewed destinations and discards other fields and unknown links for an auditor", async () => {
  mocks.context.mockResolvedValue(auditor);
  const rpc=vi.fn().mockResolvedValue({error:null,data:[
    {id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/",private:"hidden"},
    {id:"LINK-244",url:"https://www.google.co.cr/travel/hotels/entity/CgsIpKWViNeV4ufCARAB",account_refs:["private"]},
    {id:"other",url:"https://private.example/"},
  ]});
  mocks.client.mockResolvedValue({rpc});
  const view=await loadHotelDirectory();
  expect(view.state).toBe("ready");
  expect(view.links.map(link => link.id)).toEqual(["LINK-002","LINK-244"]);
  expect(view.catalogueItems.map(item => item.id)).toEqual(["LINK-002","LINK-244"]);
  expect(JSON.stringify(view)).not.toContain("hidden");
  expect(JSON.stringify(view)).not.toContain("account_refs");
});

it.each([null,[],[{id:"LINK-002",url:"javascript:alert(1)"}]])("fails closed on invalid reviewed RPC data: %j", async data => {
  mocks.context.mockResolvedValue(auditor);
  mocks.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({error:null,data})});
  expect((await loadHotelDirectory()).state).toBe("unavailable");
});

it("does not return internal exception details", async () => {
  mocks.context.mockRejectedValue(new Error("private connection details"));
  expect(await loadHotelDirectory()).toEqual({state:"unavailable",links:[],catalogueItems:[],catalogueMode:"fallback"});
});

it("does not reuse links after the session changes", async () => {
  mocks.context.mockResolvedValueOnce(auditor).mockResolvedValueOnce(null);
  mocks.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({error:null,data:[{id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/"}]})});
  expect((await loadHotelDirectory()).state).toBe("ready");
  expect(await loadHotelDirectory()).toEqual({state:"denied",links:[],catalogueItems:[],catalogueMode:"reviewed"});
  expect(mocks.client).toHaveBeenCalledTimes(1);
});

it("includes approved navigation in restricted catalogue only when requested", async () => {
  mocks.context.mockResolvedValue(auditor);
  const rpc=vi.fn().mockResolvedValue({error:null,data:[{id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/"}]});
  mocks.client.mockResolvedValue({rpc});
  const view=await loadHotelDirectory({includeApprovedNavigation:true});
  expect(view.state).toBe("ready");
  expect(view.links.map(link => link.id)).toEqual([
    "LINK-002","PORTAL-POS","PORTAL-WHATSAPP","PORTAL-ALEGRA","PORTAL-GMAIL","PORTAL-DRIVE","PORTAL-HOME",
  ]);
  expect(view.catalogueItems.map(item => item.id)).toEqual(view.links.map(link => link.id));
  expect(view.navigationAuthorized).toBe(true);
});

it("retains only reviewed public access during an outage", async () => {
  mocks.context.mockResolvedValue(auditor);
  mocks.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({error:{code:"PGRST202"},data:null})});
  const view=await loadHotelDirectory({includeApprovedNavigation:true});
  expect(view).toMatchObject({state:"unavailable",reason:"connection_pending",catalogueMode:"fallback",navigationAuthorized:true});
  expect(view.links.map(link => link.id)).toEqual([
    "PORTAL-POS","PORTAL-WHATSAPP","PORTAL-ALEGRA","PORTAL-GMAIL","PORTAL-DRIVE","PORTAL-HOME",
  ]);
  expect(view.catalogueItems.map(item => item.id)).toEqual(view.links.map(link => link.id));
});

it.each([
  {...manager,membership:{...manager.membership!,roles:["EMPLEADO"]}},
  {...manager,orgId:"foreign"},
  {...manager,requiresContextChoice:true},
])("does not let catalogue options bypass identity or scope", async candidate => {
  mocks.context.mockResolvedValue(candidate);
  expect(await loadHotelDirectory({includeApprovedNavigation:true})).toEqual({state:"denied",links:[],catalogueItems:[],catalogueMode:"reviewed"});
  expect(mocks.client).not.toHaveBeenCalled();
});

it("keeps navigation authorization separate from optional email", async () => {
  mocks.context.mockResolvedValue({...auditor,email:null});
  mocks.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({error:{code:"PGRST202"},data:null})});
  const view=await loadHotelDirectory({includeApprovedNavigation:true});
  expect(view.navigationAuthorized).toBe(true);
  expect(view.account).toBeUndefined();
  expect(view.links).toHaveLength(6);
  expect(view.catalogueItems).toHaveLength(6);
});
