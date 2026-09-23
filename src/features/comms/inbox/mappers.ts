import type {
  ToroCommsChannel,
  ToroCommsMessage,
} from "./types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function normalizeChannel(value: unknown): ToroCommsChannel {
  const channel = text(value);
  return ["general", "operacion", "rrhh", "dm"].includes(channel)
    ? (channel as ToroCommsChannel)
    : "other";
}

export function mapTeamMessages(
  value: unknown,
  currentUserId: string,
): ToroCommsMessage[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    const createdAt = text(row.created_at);
    const senderUserId = text(row.sender_user_id);

    if (!id || !createdAt || !senderUserId) return [];

    const attachment = record(row.attachment_data);
    const attachmentName = nullableText(attachment.name);
    const hasAttachment = Boolean(
      attachmentName ||
        nullableText(attachment.path) ||
        nullableText(attachment.storage_path),
    );

    return [{
      id,
      channel: normalizeChannel(row.channel),
      body: text(row.body),
      createdAt,
      senderUserId,
      senderEmployeeId: nullableText(row.sender_employee_id),
      isMine: senderUserId === currentUserId,
      recipientEmployeeId: nullableText(attachment.direct_to_employee_id),
      recipientName: nullableText(attachment.direct_to_name),
      attachmentName,
      hasAttachment,
    }];
  });
}

export function countUnreadMessages(
  messages: ToroCommsMessage[],
  lastReadAt: string | null,
): number {
  const cutoff = lastReadAt ? Date.parse(lastReadAt) : Number.NEGATIVE_INFINITY;

  return messages.filter((message) => {
    if (message.isMine) return false;
    const created = Date.parse(message.createdAt);
    return Number.isFinite(created) && created > cutoff;
  }).length;
}


/**
 * The database RLS intentionally lets privileged roles inspect some DMs for
 * governed HR/management workflows. A personal inbox must be narrower:
 * only DMs sent by the current user or addressed to their linked employee.
 * Privileged cross-user DM review belongs in a separate audited surface.
 */
export function filterPersonalInboxMessages(
  messages: ToroCommsMessage[],
  currentEmployeeId: string | null,
): ToroCommsMessage[] {
  return messages.filter((message) => {
    if (message.channel !== "dm") return true;
    if (message.isMine) return true;
    return Boolean(
      currentEmployeeId &&
        message.recipientEmployeeId === currentEmployeeId,
    );
  });
}
