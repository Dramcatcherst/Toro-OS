import { NextResponse } from "next/server";
import { airtableBase, airtableTables } from "@/lib/toro-data";

export async function GET() {
  return NextResponse.json({
    connector: "airtable",
    mode: "read_only",
    externalWrite: false,
    configured: Boolean(process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID),
    base: airtableBase,
    tableCount: airtableTables.length,
    tables: airtableTables,
    nextAction: "Add read-only Airtable credentials, then replace mock table reads with scoped server reads.",
  });
}
