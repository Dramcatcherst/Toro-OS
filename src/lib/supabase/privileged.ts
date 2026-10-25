import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createPrivilegedSupabaseClient() {
  if (process.env.TORO_DEPLOYMENT_MODE !== "internal") {
    throw new Error("OpenClaw privileged transport requires an internal deployment.");
  }
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase privileged server configuration is incomplete.");
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

