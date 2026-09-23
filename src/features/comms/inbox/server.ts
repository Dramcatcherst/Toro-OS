import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { resolveToroCommsScope } from "./context";
import {
  countUnreadMessages,
  filterPersonalInboxMessages,
  mapTeamMessages,
} from "./mappers";
import type { ToroCommsInboxState } from "./types";

export async function loadToroCommsInbox(
  context: ToroResolvedContext,
): Promise<ToroCommsInboxState> {
  const scope = resolveToroCommsScope(context);
  if (!scope.allowed) {
    return { status: "not_available", reason: scope.reason };
  }

  const supabase = await createServerSupabaseClient();

  const [messagesResult, readStateResult] = await Promise.all([
    supabase
      .from("team_messages")
      .select(
        "id,channel,body,attachment_data,created_at,sender_user_id,sender_employee_id",
      )
      .eq("org_id", scope.orgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("team_message_read_states")
      .select("last_read_at,notifications_enabled")
      .eq("org_id", scope.orgId)
      .eq("user_id", scope.userId)
      .maybeSingle(),
  ]);

  const failedSources = [
    messagesResult.error ? "messages" : null,
    readStateResult.error ? "read_state" : null,
  ].filter((value): value is string => Boolean(value));

  if (failedSources.length) {
    return {
      status: "error",
      reason: "data_unavailable",
      failedSources,
    };
  }

  const messages = filterPersonalInboxMessages(
    mapTeamMessages(messagesResult.data, scope.userId),
    scope.employeeId,
  );
  const lastReadAt =
    typeof readStateResult.data?.last_read_at === "string"
      ? readStateResult.data.last_read_at
      : null;
  const notificationsEnabled =
    typeof readStateResult.data?.notifications_enabled === "boolean"
      ? readStateResult.data.notifications_enabled
      : true;

  return {
    status: "ready",
    data: {
      messages,
      lastReadAt,
      notificationsEnabled,
      unreadCount: countUnreadMessages(messages, lastReadAt),
      source: "team_messages",
      loadedAt: new Date().toISOString(),
    },
  };
}
