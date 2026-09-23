export type ToroCommsChannel =
  | "general"
  | "operacion"
  | "rrhh"
  | "dm"
  | "other";

export type ToroCommsMessage = {
  id: string;
  channel: ToroCommsChannel;
  body: string;
  createdAt: string;
  senderUserId: string;
  senderEmployeeId: string | null;
  isMine: boolean;
  recipientEmployeeId: string | null;
  recipientName: string | null;
  attachmentName: string | null;
  hasAttachment: boolean;
};

export type ToroCommsInboxData = {
  messages: ToroCommsMessage[];
  lastReadAt: string | null;
  notificationsEnabled: boolean;
  unreadCount: number;
  source: "team_messages";
  loadedAt: string;
};

export type ToroCommsInboxState =
  | {
      status: "ready";
      data: ToroCommsInboxData;
    }
  | {
      status: "not_available";
      reason:
        | "organization_context_required"
        | "organization_access_required";
    }
  | {
      status: "error";
      reason: "data_unavailable";
      failedSources: string[];
    };
