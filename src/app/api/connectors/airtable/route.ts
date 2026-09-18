import { NextResponse } from "next/server";

import { airtableBase, airtableTables } from "@/lib/toro-data";
import { authorizeToroApi } from "@/lib/server/api-auth";
import { readAirtableRecords } from "@/lib/server/read-only-connectors";

const airtableRoles = ["FOUNDER", "SYSTEMS"] as const;

function boundedPageSize(value: string | null) {
  const parsed = Number(value ?? 10);
  if (!Number.isFinite(parsed)) return 10;
  return Math.min(25, Math.max(1, Math.floor(parsed)));
}

export async function GET(request: Request) {
  const auth = await authorizeToroApi(airtableRoles);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("tableId");
  const selectedTable = tableId
    ? airtableTables.find((table) => table.id === tableId) ?? null
    : null;

  if (tableId && !selectedTable) {
    return NextResponse.json(
      {
        connector: "airtable",
        mode: "read_only",
        externalWrite: false,
        error: "table_not_allowlisted",
      },
      { status: 400 },
    );
  }

  const configuredBaseId = process.env.AIRTABLE_BASE_ID;

  const liveRead = selectedTable && configuredBaseId
    ? await readAirtableRecords({
        baseId: configuredBaseId,
        tableId: selectedTable.id,
        pageSize: boundedPageSize(searchParams.get("pageSize")),
        fields: selectedTable.fields.map((field) => field.id),
      })
    : null;

  return NextResponse.json({
    connector: "airtable",
    mode: "read_only",
    externalWrite: false,
    configured: Boolean(process.env.AIRTABLE_TOKEN && configuredBaseId),
    base: {
      id: airtableBase.id,
      name: airtableBase.name,
    },
    tableCount: airtableTables.length,
    tables: airtableTables.map((table) => ({
      id: table.id,
      name: table.name,
      module: table.module,
      authorityRole: table.authorityRole,
      fields: table.fields,
    })),
    selectedTable: selectedTable
      ? {
          id: selectedTable.id,
          name: selectedTable.name,
          module: selectedTable.module,
          authorityRole: selectedTable.authorityRole,
        }
      : null,
    liveRead,
  });
}
