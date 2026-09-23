import { describe, expect, it } from "vitest";

import { countUnreadMessages, mapTeamMessages } from "./mappers";

describe("TORO Comms inbox mappers", () => {
  it("does not expose attachment storage paths or arbitrary attachment payload", () => {
    expect(
      mapTeamMessages(
        [
          {
            id: "m1",
            channel: "dm",
            body: "Hola",
            created_at: "2026-09-23T05:00:00Z",
            sender_user_id: "user-2",
            sender_employee_id: "employee-2",
            attachment_data: {
              name: "documento.pdf",
              path: "private/secret/path",
              storage_path: "another/private/path",
              direct_to_employee_id: "employee-1",
              direct_to_name: "Persona",
              salary: 999999,
              token: "SECRET",
            },
          },
        ],
        "user-1",
      ),
    ).toEqual([
      {
        id: "m1",
        channel: "dm",
        body: "Hola",
        createdAt: "2026-09-23T05:00:00Z",
        senderUserId: "user-2",
        senderEmployeeId: "employee-2",
        isMine: false,
        recipientEmployeeId: "employee-1",
        recipientName: "Persona",
        attachmentName: "documento.pdf",
        hasAttachment: true,
      },
    ]);
  });

  it("normalizes unknown channels without treating them as general", () => {
    expect(
      mapTeamMessages(
        [{
          id: "m2",
          channel: "future-channel",
          body: "x",
          created_at: "2026-09-23T06:00:00Z",
          sender_user_id: "user-1",
          attachment_data: {},
        }],
        "user-1",
      )[0]?.channel,
    ).toBe("other");
  });

  it("counts only messages after last read that are not mine", () => {
    const messages = mapTeamMessages(
      [
        {
          id: "mine",
          channel: "general",
          body: "mine",
          created_at: "2026-09-23T06:00:00Z",
          sender_user_id: "user-1",
          attachment_data: {},
        },
        {
          id: "new",
          channel: "general",
          body: "new",
          created_at: "2026-09-23T05:30:00Z",
          sender_user_id: "user-2",
          attachment_data: {},
        },
        {
          id: "old",
          channel: "general",
          body: "old",
          created_at: "2026-09-23T04:00:00Z",
          sender_user_id: "user-3",
          attachment_data: {},
        },
      ],
      "user-1",
    );

    expect(
      countUnreadMessages(messages, "2026-09-23T05:00:00Z"),
    ).toBe(1);
  });
});
