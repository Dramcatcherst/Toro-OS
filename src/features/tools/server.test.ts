import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ context: vi.fn(), client: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: mocks.context }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.client }));
import { loadHotelDirectory } from "./server";
import { DIRECTORY_SCOPE } from "./directory";
beforeEach(() => vi.resetAllMocks());
it("never queries the registry without authorized context", async () => {
  mocks.context.mockResolvedValue(null);
  expect(await loadHotelDirectory()).toEqual({state:"denied",links:[]});
  expect(mocks.client).not.toHaveBeenCalled();
});
it("filters the RLS client by org, property, key and visibility and fails closed on query error", async () => {
  mocks.context.mockResolvedValue({mode:"organization",orgId:DIRECTORY_SCOPE.orgId,canUseOrganizationData:true,
    membership:{orgId:DIRECTORY_SCOPE.orgId,status:"active",roles:["ADMIN"]}});
  const q={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),maybeSingle:vi.fn().mockResolvedValue({error:{message:"denied"},data:null})};
  const from=vi.fn().mockReturnValue(q); const schema=vi.fn().mockReturnValue({from});mocks.client.mockResolvedValue({schema});
  expect(await loadHotelDirectory()).toEqual({state:"unavailable",links:[]});
  expect(schema).toHaveBeenCalledWith("operations");expect(from).toHaveBeenCalledWith("knowledge_items");
  expect(q.eq.mock.calls).toEqual([["org_id",DIRECTORY_SCOPE.orgId],["property_id",DIRECTORY_SCOPE.propertyId],["knowledge_key",DIRECTORY_SCOPE.key],["visibility","internal"]]);
});
it("does not return internal exception details", async () => {
  mocks.context.mockRejectedValue(new Error("private connection details"));
  expect(await loadHotelDirectory()).toEqual({state:"unavailable",links:[]});
});
