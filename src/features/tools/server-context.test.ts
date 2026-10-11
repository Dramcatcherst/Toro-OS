import { beforeEach, expect, it, vi } from "vitest";
const createClient = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: createClient }));
import { resolveToroContext } from "@/features/context/resolver";
import { loadHotelDirectory } from "./server";
import { DIRECTORY_SCOPE } from "./directory";

beforeEach(() => vi.resetAllMocks());

it.each([false, true])("uses real directory context and denies ambiguous org without inventing connector grants (multi-org=%s)", async multiOrg => {
  const roles: Array<{ org_id: string; roles: { code: string } }> = [
    { org_id: DIRECTORY_SCOPE.orgId, roles: { code: "ADMIN" } },
  ];
  if (multiOrg) roles.push({ org_id: "00000000-0000-4000-8000-0000000000bb", roles: { code: "ADMIN" } });
  const roleQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockResolvedValue({ data: roles, error: null }) };
  const employeeQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue({ data: [], error: null }) };
  const schema = vi.fn();
  const rpc = vi.fn().mockResolvedValue({error:null,data:[{id:"LINK-002",url:"https://dreamcatcherhotel.kross.travel/"}]});
  createClient.mockResolvedValue({ schema, rpc,
    auth: { getUser: vi.fn().mockResolvedValue({ error: null, data: { user: {
      id: "00000000-0000-4000-8000-000000000001", email: null, user_metadata: {},
    } } }) },
    from: vi.fn((table: string) => {
      if (table === "user_roles") return roleQuery;
      if (table === "employees") return employeeQuery;
      throw new Error(`Unexpected identity table: ${table}`);
    }),
  });
  const context = await resolveToroContext({ mode: "organization" });
  expect(context).toMatchObject({ allowedTools: [], requiresContextChoice: multiOrg,
    canUseOrganizationData: !multiOrg });
  const view = await loadHotelDirectory();
  expect(view.state).toBe(multiOrg ? "denied" : "ready");
  expect(rpc).toHaveBeenCalledTimes(multiOrg ? 0 : 1);
  expect(context?.allowedTools).toEqual([]);
  expect(schema).not.toHaveBeenCalled();
});
