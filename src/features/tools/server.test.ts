import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ context: vi.fn(), client: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: mocks.context }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.client }));
import { loadHotelDirectory } from "./server";
import { authorizedContext } from "./fixtures.test-utils";
beforeEach(() => vi.resetAllMocks());
const context = {...authorizedContext(),email:"admin@example.test"};
it("never queries the registry without authorized context", async () => {
  mocks.context.mockResolvedValue(null);
  expect(await loadHotelDirectory()).toEqual({state:"denied",links:[]});
  expect(mocks.client).not.toHaveBeenCalled();
});
it("uses only the scoped RPC with the session client, and distinguishes a missing connection from login", async () => {
  mocks.context.mockResolvedValue(context);
  const rpc=vi.fn().mockResolvedValue({error:{code:"PGRST202",message:"private details"},data:null});
  mocks.client.mockResolvedValue({rpc});
  expect(await loadHotelDirectory()).toEqual({state:"unavailable",links:[],account:"admin@example.test",reason:"connection_pending"});
  expect(rpc).toHaveBeenCalledExactlyOnceWith("dreamcatcher_tool_links_v1");
});
it("projects reviewed destinations and discards other fields and unknown links", async () => {
  mocks.context.mockResolvedValue(context);
  const rpc=vi.fn().mockResolvedValue({error:null,data:[
    {id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/",private:"hidden"},
    {id:"LINK-244",url:"https://www.google.co.cr/travel/hotels/entity/CgsIpKWViNeV4ufCARAB",account_refs:["private"]},
    {id:"other",url:"https://private.example/"},
  ]});
  mocks.client.mockResolvedValue({rpc});
  expect(await loadHotelDirectory()).toEqual({state:"ready",account:"admin@example.test",
    links:[
      {id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/",label:"💬 Cotizar estancia"},
      {id:"LINK-244",url:"https://www.google.co.cr/travel/hotels/entity/CgsIpKWViNeV4ufCARAB",label:"🏨 Ver Google Hotels"},
    ]});
});
it.each([null,[],[{id:"LINK-002",url:"javascript:alert(1)"}]])("fails closed on invalid RPC data", async data => {
  mocks.context.mockResolvedValue(context);
  mocks.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({error:null,data})});
  expect((await loadHotelDirectory()).state).toBe("unavailable");
});
it("does not return internal exception details", async () => {
  mocks.context.mockRejectedValue(new Error("private connection details"));
  expect(await loadHotelDirectory()).toEqual({state:"unavailable",links:[]});
});
it("does not reuse links after the session changes", async () => {
  mocks.context.mockResolvedValueOnce(context).mockResolvedValueOnce(null);
  mocks.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({error:null,data:[{id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/"}]})});
  expect((await loadHotelDirectory()).state).toBe("ready");
  expect(await loadHotelDirectory()).toEqual({state:"denied",links:[]});
  expect(mocks.client).toHaveBeenCalledTimes(1);
});

it("includes approved public navigation only when requested by an authorized catalogue", async () => {
  mocks.context.mockResolvedValue(context);
  const rpc=vi.fn().mockResolvedValue({error:null,data:[
    {id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/",account_refs:["private"]},
    {id:"foreign",url:"https://private.example/"},
  ]});
  mocks.client.mockResolvedValue({rpc});
  const view = await loadHotelDirectory({includeApprovedNavigation:true});
  expect(view.state).toBe("ready");
  expect(view.links.map(link => link.id)).toEqual([
    "LINK-002","PORTAL-POS","PORTAL-WHATSAPP","PORTAL-ALEGRA","PORTAL-GMAIL","PORTAL-DRIVE","PORTAL-HOME",
  ]);
  expect(JSON.stringify(view.links)).not.toContain("private");
  expect(rpc).toHaveBeenCalledExactlyOnceWith("dreamcatcher_tool_links_v1");
});

it("retains reviewed public access during a directory outage without claiming the source is ready", async () => {
  mocks.context.mockResolvedValue(context);
  mocks.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({error:{code:"PGRST202"},data:null})});
  const view=await loadHotelDirectory({includeApprovedNavigation:true});
  expect(view.state).toBe("unavailable");
  expect(view.reason).toBe("connection_pending");
  expect(view.links.map(link => link.id)).toEqual([
    "PORTAL-POS","PORTAL-WHATSAPP","PORTAL-ALEGRA","PORTAL-GMAIL","PORTAL-DRIVE","PORTAL-HOME",
  ]);
  expect(view.links.some(link => link.id.startsWith("LINK-"))).toBe(false);
});

it.each([
  {...context,membership:{...context.membership!,roles:["EMPLEADO"]}},
  {...context,orgId:"foreign"},
  {...context,requiresContextChoice:true},
])("does not let the catalogue option bypass identity or scope", async candidate => {
  mocks.context.mockResolvedValue(candidate);
  expect(await loadHotelDirectory({includeApprovedNavigation:true})).toEqual({state:"denied",links:[]});
  expect(mocks.client).not.toHaveBeenCalled();
});

it("keeps navigation authorization separate from the optional account email", async () => {
  mocks.context.mockResolvedValue({...context,email:null});
  mocks.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({error:{code:"PGRST202"},data:null})});
  const view=await loadHotelDirectory({includeApprovedNavigation:true});
  expect(view.navigationAuthorized).toBe(true);
  expect(view.account).toBeUndefined();
  expect(view.state).toBe("unavailable");
  expect(view.links).toHaveLength(6);
});
