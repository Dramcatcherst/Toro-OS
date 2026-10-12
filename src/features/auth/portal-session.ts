import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Same existing revocation, idle and absolute limits as DreamTeam. */
export async function portalSessionAllowed(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase.rpc("enforce_user_session", {
      p_user_agent_hash: null, p_network_hash: null,
    });
    return !error && data?.allowed === true;
  } catch { return false; }
}
