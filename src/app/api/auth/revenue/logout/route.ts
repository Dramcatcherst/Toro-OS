import { NextResponse } from "next/server";
import {
  REVENUE_ACCESS_COOKIE,
  REVENUE_REFRESH_COOKIE,
} from "@/lib/server/supabase-revenue";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(REVENUE_ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(REVENUE_REFRESH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
