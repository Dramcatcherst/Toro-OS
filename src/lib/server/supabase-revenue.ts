import "server-only";

const DEFAULT_SUPABASE_URL = "https://abtyrbqlqbsastmridzp.supabase.co";

export const REVENUE_ACCESS_COOKIE = "toro_revenue_access";
export const REVENUE_REFRESH_COOKIE = "toro_revenue_refresh";

export function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
}

export function getSupabasePublishableKey() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.");
  }
  return key;
}

export async function supabaseRequest(
  path: string,
  init: RequestInit = {},
  accessToken?: string | null,
) {
  const headers = new Headers(init.headers);
  headers.set("apikey", getSupabasePublishableKey());
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return fetch(`${getSupabaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function checkRevenueAccess(accessToken: string) {
  const response = await supabaseRequest(
    "/rest/v1/rpc/get_current_revenue_access",
    { method: "POST", body: "{}" },
    accessToken,
  );

  if (!response.ok) return false;
  return (await response.json()) === true;
}

export async function fetchRevenueRates(accessToken: string, rpcBody: Record<string, unknown>) {
  const response = await supabaseRequest(
    "/rest/v1/rpc/get_agency_rate_lookup",
    { method: "POST", body: JSON.stringify(rpcBody) },
    accessToken,
  );

  if (!response.ok) {
    throw new Error(`Revenue lookup failed with ${response.status}.`);
  }

  return response.json();
}
