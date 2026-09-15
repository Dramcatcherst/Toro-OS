import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildRevenueRpcBody } from "@/lib/revenue-admin-core.mjs";
import {
  REVENUE_ACCESS_COOKIE,
  checkRevenueAccess,
  fetchRevenueRates,
} from "@/lib/server/supabase-revenue";

type RevenueRow = {
  agency_key: string;
  agency_name: string;
  room_number: number;
  room_name: string;
  season_code: string;
  starts_on: string;
  ends_on: string;
  currency: string;
  base_rack_rate: number | string | null;
  rack_rate: number | string | null;
  base_commission_rate: number | string | null;
  commission_rate: number | string | null;
  agency_earn_amount: number | string | null;
  hotel_net_rate: number | string | null;
  commercial_conditions: string | null;
  override_reason: string | null;
  override_active: boolean;
};

function uniqueOptions(rows: RevenueRow[]) {
  const agencies = new Map<string, { key: string; name: string }>();
  const rooms = new Map<number, { number: number; name: string }>();
  const seasons = new Set<string>();

  for (const row of rows) {
    agencies.set(row.agency_key, { key: row.agency_key, name: row.agency_name });
    rooms.set(row.room_number, { number: row.room_number, name: row.room_name });
    seasons.add(row.season_code);
  }

  return {
    agencies: [...agencies.values()].sort((a, b) => a.name.localeCompare(b.name)),
    rooms: [...rooms.values()].sort((a, b) => a.number - b.number),
    seasons: [...seasons].sort(),
  };
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(REVENUE_ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const hasAccess = await checkRevenueAccess(accessToken);
  if (!hasAccess) {
    return NextResponse.json({ error: "Revenue access is restricted to ADMIN, GERENCIA and REVENUE." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const optionsOnly = searchParams.get("options") === "1";
  const occupancyRaw = String(searchParams.get("occupancy") || "").trim();
  let occupancy: number | null = null;
  if (occupancyRaw) {
    occupancy = Number(occupancyRaw);
    if (!Number.isInteger(occupancy) || occupancy < 1 || occupancy > 70) {
      return NextResponse.json({ error: "Occupancy must be an integer between 1 and 70." }, { status: 400 });
    }
  }

  let rpcBody;
  try {
    rpcBody = buildRevenueRpcBody({
      agencyKey: searchParams.get("agency") || "",
      roomNumber: searchParams.get("room") || "",
      stayDate: searchParams.get("date") || "",
      seasonCode: searchParams.get("season") || "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid revenue filters.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!optionsOnly && !Object.values(rpcBody).some((value) => value !== null)) {
    return NextResponse.json({ error: "Choose at least one filter before requesting private rates." }, { status: 400 });
  }

  let rows: RevenueRow[];
  try {
    rows = (await fetchRevenueRates(accessToken, rpcBody)) as RevenueRow[];
  } catch {
    return NextResponse.json({ error: "Revenue lookup is unavailable." }, { status: 502 });
  }

  if (optionsOnly) {
    return NextResponse.json({
      ...uniqueOptions(rows),
      source: "Supabase canonical Revenue",
      villaPricingAvailable: false,
      note: "Verified source currently contains room-by-season agency pricing only. Villa rates are not invented.",
    });
  }

  return NextResponse.json({
    rows,
    meta: {
      source: "Supabase canonical Revenue",
      occupancy,
      occupancyPricingRule: "informational_only",
      villaPricingAvailable: false,
      note: "Current verified rates are room/season based. Occupancy is displayed for context and does not alter price.",
    },
  });
}
