import "server-only";
import { assertInternalRuntime, isPublicDemo } from "@/lib/server/public-demo";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "./env";

export type VerifiedBearerSupabase = {
  client: SupabaseClient;
  user: User;
};

export function createBearerSupabaseClient(accessToken: string): SupabaseClient {
  assertInternalRuntime();
  const token = accessToken.trim();
  if (!token) {
    throw new Error("A bearer access token is required.");
  }

  const { url, publishableKey } = getSupabasePublicConfig();

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function verifySupabaseBearerToken(
  accessToken: string,
): Promise<VerifiedBearerSupabase | null> {
  if (isPublicDemo()) return null;
  const token = accessToken.trim();
  if (!token) return null;

  const client = createBearerSupabaseClient(token);
  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error || !user) return null;

  return { client, user };
}
