import { NextResponse } from "next/server";
import { airtableBase, airtableTables } from "@/lib/toro-data";
import { readAirtableRecords } from "@/lib/server/read-only-connectors";

const allowedAirtableTableIds = new Set([
  airtableBase.blueprintTableId,
  ...airtableTables.map((table) => table.id),
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedTableId = searchParams.get("tableId");

  if (requestedTableId && !allowedAirtableTableIds.has(requestedTableId)) {
    return NextResponse.json(
      {
        connector: "airtable",
        mode: "read_only",
        externalWrite: false,
        liveRead: null,
        error: "Requested Airtable table is not allowlisted.",
      },
      { status: 400 },
    );
  }

  const requestedPageSize = Number(searchParams.get("pageSize") ?? 10);
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(Math.max(Math.trunc(requestedPageSize), 1), 50)
    : 10;

  const liveRead = requestedTableId
    ? await readAirtableRecords({
        baseId: process.env.AIRTABLE_BASE_ID ?? airtableBase.id,
        tableId: requestedTableId,
        pageSize,
      })
    : null;

  return NextResponse.json({
    connector: "airtable",
    mode: "read_only",
    externalWrite: false,
    configured: Boolean(process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID),
    base: airtableBase,
    tableCount: airtableTables.length,
    tables: airtableTables,
    liveRead,
    nextAction: "Use only allowlisted Airtable tables and keep reads scoped server-side.",
  });
}
