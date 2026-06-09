import { NextResponse } from "next/server";
import { airtableBase, airtableTables } from "@/lib/toro-data";
import { readAirtableRecords } from "@/lib/server/read-only-connectors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("tableId");
  const liveRead = tableId
    ? await readAirtableRecords({
        baseId: process.env.AIRTABLE_BASE_ID ?? airtableBase.id,
        tableId,
        pageSize: Number(searchParams.get("pageSize") ?? 10),
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
    nextAction: "Add read-only Airtable credentials, then replace mock table reads with scoped server reads.",
  });
}
