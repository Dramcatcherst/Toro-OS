import "server-only";
import { assertInternalRuntime } from "@/lib/server/public-demo";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "./env";
import { resolveSupabaseWorkerSecret } from "./worker-config";
import { boundedSupabaseReadFetch } from "./read-fetch";

export function createWorkerSupabaseClient(readOptions?: { signal: AbortSignal }) {
  assertInternalRuntime();
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
      // Only protected read probes opt in. Worker mutation semantics stay intact.
      ...(readOptions ? { fetch: boundedSupabaseReadFetch(readOptions.signal) } : {}),
      headers: {
        "X-Client-Info": "toro-control-plane-worker-v1",
      },
    },
  });
}
