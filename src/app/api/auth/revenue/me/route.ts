import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  REVENUE_ACCESS_COOKIE,
  checkRevenueAccess,
  supabaseRequest,
} from "@/lib/server/supabase-revenue";

type SupabaseUser = {
  id?: string;
  email?: string | null;
};

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(REVENUE_ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ authenticated: false, hasRevenueAccess: false }, { status: 401 });
  }

  let userResponse: Response;
  try {
    userResponse = await supabaseRequest("/auth/v1/user", { method: "GET" }, accessToken);
  } catch {
    return NextResponse.json({ authenticated: false, hasRevenueAccess: false }, { status: 503 });
  }

  if (!userResponse.ok) {
    return NextResponse.json({ authenticated: false, hasRevenueAccess: false }, { status: 401 });
  }

  const user = (await userResponse.json()) as SupabaseUser;
  const hasRevenueAccess = await checkRevenueAccess(accessToken);
  return NextResponse.json({
    authenticated: true,
    hasRevenueAccess,
    user: { id: user.id || null, email: user.email || null },
  });
}
