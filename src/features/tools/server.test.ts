import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ context: vi.fn(), client: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: mocks.context }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.client }));
import { loadHotelDirectory } from "./server";
import { DIRECTORY_SCOPE } from "./directory";
beforeEach(() => vi.resetAllMocks());
const context = {mode:"organization",orgId:DIRECTORY_SCOPE.orgId,canUseOrganizationData:true,email:"admin@example.test",
  membership:{orgId:DIRECTORY_SCOPE.orgId,status:"active",roles:["ADMIN"]}};
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
    {id:"other",url:"https://private.example/"},
  ]});
  mocks.client.mockResolvedValue({rpc});
  expect(await loadHotelDirectory()).toEqual({state:"ready",account:"admin@example.test",
    links:[{id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/",label:"💬 Cotizar estancia"}]});
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
