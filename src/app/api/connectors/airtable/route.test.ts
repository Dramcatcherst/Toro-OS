import { beforeEach, describe, expect, it, vi } from "vitest";

const { authorizeToroApi, readAirtableRecords } = vi.hoisted(() => ({
  authorizeToroApi: vi.fn(),
  readAirtableRecords: vi.fn(),
}));

vi.mock("@/lib/server/api-auth", () => ({ authorizeToroApi }));
vi.mock("@/lib/server/read-only-connectors", () => ({ readAirtableRecords }));
vi.mock("@/lib/toro-data", () => ({
  airtableBase: { id: "app-safe", name: "TORO", blueprintTableId: "tbl-safe-1" },
  airtableTables: [
    {
      id: "tbl-safe-1",
      name: "Safe One",
      module: "Data Brain",
      authorityRole: "Safe projection",
      fields: [
        { id: "fld-safe-a", name: "Name", type: "singleLineText" },
        { id: "fld-safe-b", name: "Status", type: "singleSelect" },
      ],
    },
    {
      id: "tbl-safe-2",
      name: "Safe Two",
      module: "Business Brain",
      authorityRole: "Safe projection",
      fields: [{ id: "fld-safe-c", name: "Title", type: "singleLineText" }],
    },
  ],
}));

import { GET } from "./route";

describe("GET /api/connectors/airtable", () => {
  beforeEach(() => {
    authorizeToroApi.mockReset();
    readAirtableRecords.mockReset();
    authorizeToroApi.mockResolvedValue({
      ok: true,
      session: { userId: "u1", email: null, displayName: "Founder", role: "FOUNDER" },
    });
    readAirtableRecords.mockResolvedValue({
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: { records: [{ fields: { "fld-safe-a": "x" } }] },
      error: null,
    });
  });

  it("rejects unauthenticated access before touching Airtable", async () => {
    authorizeToroApi.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 }),
    });
    const response = await GET(new Request("http://localhost/api/connectors/airtable?tableId=tbl-safe-1"));
    expect(response.status).toBe(401);
    expect(readAirtableRecords).not.toHaveBeenCalled();
  });

  it("rejects arbitrary table ids before they reach the server token", async () => {
    const response = await GET(new Request("http://localhost/api/connectors/airtable?tableId=tbl-secret"));
    expect(response.status).toBe(400);
    expect(readAirtableRecords).not.toHaveBeenCalled();
  });

  it("reads only declared safe fields from an allowlisted table and bounds page size", async () => {
    const response = await GET(new Request("http://localhost/api/connectors/airtable?tableId=tbl-safe-1&pageSize=999"));
    expect(response.status).toBe(200);
    expect(readAirtableRecords).toHaveBeenCalledWith({
      baseId: "app-safe",
      tableId: "tbl-safe-1",
      pageSize: 25,
      fields: ["fld-safe-a", "fld-safe-b"],
    });
    const body = await response.json();
    expect(body.selectedTable).toMatchObject({ id: "tbl-safe-1", name: "Safe One" });
  });

  it("returns connector metadata without making a live read when tableId is omitted", async () => {
    const response = await GET(new Request("http://localhost/api/connectors/airtable"));
    expect(response.status).toBe(200);
    expect(readAirtableRecords).not.toHaveBeenCalled();
  });
});
