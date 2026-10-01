import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "./env";
import { resolveSupabaseWorkerSecret } from "./worker-config";

export function createWorkerSupabaseClient() {
  const { url } = getSupabasePublicConfig();
  const resolved = resolveSupabaseWorkerSecret(process.env);

  if (!resolved) {
    throw new Error(
      "Supabase worker secret configuration is incomplete. Configure a backend-only secret key before enabling TORO workers.",
    );
  }

  return createClient(url, resolved.key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "toro-control-plane-worker-v1",
      },
    },
  });
}
