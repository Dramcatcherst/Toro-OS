import { NextResponse } from "next/server";
import {
  REVENUE_ACCESS_COOKIE,
  REVENUE_REFRESH_COOKIE,
  supabaseRequest,
} from "@/lib/server/supabase-revenue";

type LoginPayload = {
  email?: string;
  password?: string;
};

type SupabaseTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: { email?: string | null };
};

export async function POST(request: Request) {
  let payload: LoginPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  let authResponse: Response;
  try {
    authResponse = await supabaseRequest(
      "/auth/v1/token?grant_type=password",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
  } catch {
    return NextResponse.json({ error: "Revenue authentication is not configured." }, { status: 503 });
  }

  if (!authResponse.ok) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = (await authResponse.json()) as SupabaseTokenResponse;
  if (!token.access_token || !token.refresh_token) {
    return NextResponse.json({ error: "Authentication did not return a valid session." }, { status: 502 });
  }

  const response = NextResponse.json({ authenticated: true, email: token.user?.email || email });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(REVENUE_ACCESS_COOKIE, token.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(60, Number(token.expires_in || 3600)),
  });
  response.cookies.set(REVENUE_REFRESH_COOKIE, token.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
