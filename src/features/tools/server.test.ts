import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ context: vi.fn(), client: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: mocks.context }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.client }));
import { loadHotelDirectory } from "./server";
import { DIRECTORY_SCOPE } from "./directory";
import { authorizedContext, quoteEntry, readKross, sourceRow } from "./fixtures.test-utils";

beforeEach(() => vi.resetAllMocks());
function registry(data: unknown = sourceRow, error: unknown = null) {
  const q = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }) };
  const from = vi.fn().mockReturnValue(q);
  const schema = vi.fn().mockReturnValue({ from });
  mocks.client.mockResolvedValue({ schema });
  return { q, from, schema };
}

const context = authorizedContext();
it.each([
  null, { ...context, userId: "" }, { ...context, mode: "personal" },
  { ...context, orgId: "other-org" }, { ...context, requiresContextChoice: true },
  { ...context, membership: { ...context.membership, status: "suspended" } },
  { ...context, membership: { ...context.membership, roles: ["EMPLEADO"] } },
  { ...context, allowedDataScopes: ["personal"] }, { ...context, allowedTools: [] },
  { ...context, allowedTools: [{ ...readKross, owner: "personal" }] },
  { ...context, allowedTools: [{ ...readKross, orgId: "other-org" }] },
  { ...context, allowedTools: [{ ...readKross, actions: ["execute"] }] },
])("denies before querying the registry for context %j", async candidate => {
  mocks.context.mockResolvedValue(candidate);
  expect(await loadHotelDirectory()).toEqual({ state: "denied", links: [] });
  expect(mocks.context).toHaveBeenCalledWith({ mode: "organization" });
  expect(mocks.client).not.toHaveBeenCalled();
});

it("returns only the authorized projection through the exact scoped session query", async () => {
  mocks.context.mockResolvedValue(context);
  const mixedRow = { ...sourceRow, structured_content: { ...sourceRow.structured_content,
    link_directory: { ...sourceRow.structured_content.link_directory, entries: [quoteEntry,
      { id: "LINK-131", url: "https://www.dropbox.com/home/Dreamcatcher%20Hotel" },
      { id: "LINK-217", url: "https://unrelated.example.invalid/" }] } } };
  const { schema, from, q } = registry(mixedRow);
  expect(await loadHotelDirectory()).toEqual({ state: "ready", links: [
    { id: "LINK-002", label: "💬 Cotizar estancia", url: quoteEntry.url },
  ] });
  expect(schema).toHaveBeenCalledWith("operations");
  expect(from).toHaveBeenCalledWith("knowledge_items");
  expect(q.select).toHaveBeenCalledWith("org_id,property_id,knowledge_key,visibility,structured_content");
  expect(q.eq.mock.calls).toEqual([["org_id", DIRECTORY_SCOPE.orgId],
    ["property_id", DIRECTORY_SCOPE.propertyId], ["knowledge_key", DIRECTORY_SCOPE.key], ["visibility", "internal"]]);
});

it.each([null, { ...sourceRow, org_id: "other-org" }, { ...sourceRow, property_id: "other-property" },
  { ...sourceRow, knowledge_key: "other-directory" }, { ...sourceRow, visibility: "public" },
  { ...sourceRow, structured_content: null },
])("does not trust an unexpected database row %j", async row => {
  mocks.context.mockResolvedValue(context);
  registry(row);
  expect(await loadHotelDirectory()).toEqual({ state: "unavailable", links: [] });
});

it("does not reuse links after a session or authorization change", async () => {
  mocks.context.mockResolvedValueOnce(context).mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ ...context, userId: "another-user", allowedTools: [] });
  registry();
  expect((await loadHotelDirectory()).state).toBe("ready");
  expect(await loadHotelDirectory()).toEqual({ state: "denied", links: [] });
  expect(await loadHotelDirectory()).toEqual({ state: "denied", links: [] });
  expect(mocks.client).toHaveBeenCalledTimes(1);
});

it("drops even supplied data on query error and does not reuse a previous success", async () => {
  mocks.context.mockResolvedValue(context);
  const { q } = registry();
  expect((await loadHotelDirectory()).state).toBe("ready");
  q.maybeSingle.mockResolvedValue({ data: sourceRow, error: { message: "private connection details" } });
  expect(await loadHotelDirectory()).toEqual({ state: "unavailable", links: [] });
});

it("does not return internal exception details or query after context failure", async () => {
  mocks.context.mockRejectedValue(new Error("private connection details"));
  expect(await loadHotelDirectory()).toEqual({ state: "unavailable", links: [] });
  expect(mocks.client).not.toHaveBeenCalled();
});
