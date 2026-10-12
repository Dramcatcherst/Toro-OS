import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Same existing revocation, idle and absolute limits as DreamTeam. */
export async function portalSessionAllowed(supabase: SupabaseClient, diagnose?: (code: "session_transport" | "session_policy") => void) {
  try {
    const { data, error } = await supabase.rpc("enforce_user_session", {
      p_user_agent_hash: null, p_network_hash: null,
    });
    if (error) { diagnose?.("session_transport"); return false; }
    if (data?.allowed !== true) { diagnose?.("session_policy"); return false; }
    return true;
  } catch { diagnose?.("session_transport"); return false; }
}
