import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ToroCommsInboxState } from "./types";
import { ToroCommsInboxView } from "./view";

const ready: ToroCommsInboxState = {
  status: "ready",
  data: {
    messages: [
      {
        id: "general-1",
        channel: "general",
        body: "Buenos días equipo",
        createdAt: "2026-09-23T15:00:00Z",
        senderUserId: "user-2",
        senderEmployeeId: "employee-2",
        isMine: false,
        recipientEmployeeId: null,
        recipientName: null,
        attachmentName: null,
        hasAttachment: false,
      },
      {
        id: "dm-1",
        channel: "dm",
        body: "Te envío el documento",
        createdAt: "2026-09-23T16:00:00Z",
        senderUserId: "user-1",
        senderEmployeeId: "employee-1",
        isMine: true,
        recipientEmployeeId: "employee-2",
        recipientName: "Persona",
        attachmentName: "manual.pdf",
        hasAttachment: true,
      },
      {
        id: "other-1",
        channel: "other",
        body: "Canal futuro",
        createdAt: "2026-09-23T14:00:00Z",
        senderUserId: "user-3",
        senderEmployeeId: null,
        isMine: false,
        recipientEmployeeId: null,
        recipientName: null,
        attachmentName: null,
        hasAttachment: false,
      },
    ],
    lastReadAt: "2026-09-23T14:30:00Z",
    notificationsEnabled: true,
    unreadCount: 1,
    source: "team_messages",
    loadedAt: "2026-09-23T16:05:00Z",
  },
};

describe("ToroCommsInboxView", () => {
  it("renders a safe read-only inbox without internal ids or attachment paths", () => {
    render(<ToroCommsInboxView state={ready} />);

    expect(screen.getByRole("heading", { name: "Mensajes" })).toBeInTheDocument();
    expect(screen.getByText("Buenos días equipo")).toBeInTheDocument();
    expect(screen.getByText("Te envío el documento")).toBeInTheDocument();
    expect(screen.getByText("Adjunto: manual.pdf")).toBeInTheDocument();
    expect(screen.getByText("Para: Persona")).toBeInTheDocument();
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
    expect(screen.getByText("General: 1")).toBeInTheDocument();
    expect(screen.getByText("Directo: 1")).toBeInTheDocument();
    expect(screen.getByText("Otro: 1")).toBeInTheDocument();

    expect(screen.queryByText("user-2")).not.toBeInTheDocument();
    expect(screen.queryByText("employee-2")).not.toBeInTheDocument();
    expect(screen.queryByText(/storage/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /enviar/i })).not.toBeInTheDocument();
  });

  it("renders a safe unavailable state", () => {
    render(
      <ToroCommsInboxView
        state={{
          status: "not_available",
          reason: "organization_context_required",
        }}
      />,
    );

    expect(screen.getByText("Mensajes no disponibles")).toBeInTheDocument();
  });

  it("renders a safe error state without partial messages", () => {
    render(
      <ToroCommsInboxView
        state={{
          status: "error",
          reason: "data_unavailable",
          failedSources: ["messages"],
        }}
      />,
    );

    expect(screen.getByText("No pudimos cargar tus mensajes")).toBeInTheDocument();
    expect(screen.queryByText("Buenos días equipo")).not.toBeInTheDocument();
  });
});
