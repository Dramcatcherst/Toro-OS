import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Room360LoadResult } from "@/lib/server/room-360";
import { Room360View } from "./room-360-view";

const ready: Room360LoadResult = {
  state: "ready",
  configured: true,
  failedSources: [],
  view: {
    summary: {
      key: "DC-ROOM-25",
      number: "25",
      name: "#25 Suite premium cinema con cocina",
      status: "active",
      property: "Dreamcatcher Hotel",
      capacity: 5,
      beds: "1 King, 1 Queen, 1 individual",
      kitchen: "Private",
      projector: true,
      floor: "",
      amenityCount: 22,
    },
    sale: [
      { key: "DC-ROOM-25", name: "#25 Suite premium cinema con cocina", type: "room", status: "active" },
      { key: "DC-VILLA-VT", name: "Villa Toro", type: "villa", status: "active" },
    ],
    kross: {
      authority: "Kross",
      referenceKey: "kross:DC-ROOM-25",
      directBookingUrl: "https://dreamcatcherhotel.kross.travel/es/rooms/25",
      syncStatus: "authority_external",
    },
    media: {
      hero: [{ key: "MEDIA-25", name: "#25 Bedroom", publicUrl: "https://example.com/25.jpg", approved: true, identityScope: "exact", sharedWith: [] }],
      web: [{ key: "MEDIA-25-26", name: "#25-26 Shared", publicUrl: "https://example.com/shared.jpg", approved: true, identityScope: "shared", sharedWith: ["DC-ROOM-26"] }],
      kross: [],
      pending: [],
    },
    operation: {
      tasks: [{ key: "TASK-25", title: "Revisar proyector", status: "in_progress", priority: "P1" }],
      validations: [{ key: "VAL-25", title: "media", status: "open", severity: "high" }],
    },
    knowledge: [],
  },
};

describe("Room360View", () => {
  it("renders the governed room summary and makes Kross authority explicit", () => {
    render(<Room360View result={ready} />);

    expect(screen.getByRole("heading", { name: /#25 suite premium/i })).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText(/precio, disponibilidad, reserva y pago permanecen en kross/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir kross/i })).toHaveAttribute(
      "href",
      "https://dreamcatcherhotel.kross.travel/es/rooms/25",
    );
    expect(screen.getByText(/compartida con #26/i)).toBeInTheDocument();
  });

  it("keeps partial room data visible and identifies failed sources", () => {
    render(<Room360View result={{ ...ready, state: "partial", failedSources: ["tasks", "media"] }} />);

    expect(screen.getByRole("heading", { name: /#25 suite premium/i })).toBeInTheDocument();
    expect(screen.getByText(/información parcial/i)).toBeInTheDocument();
    expect(screen.getByText(/tasks, media/i)).toBeInTheDocument();
  });

  it("does not confuse missing Airtable configuration with a missing room", () => {
    render(
      <Room360View
        result={{
          state: "unconfigured",
          configured: false,
          failedSources: ["rooms"],
          view: { ...ready.view, summary: { ...ready.view.summary, key: "", name: "" } },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: /fuente airtable no configurada/i })).toBeInTheDocument();
    expect(screen.queryByText(/habitación no encontrada/i)).not.toBeInTheDocument();
  });

  it("renders an honest not-found state for unknown governed room keys", () => {
    render(
      <Room360View
        result={{
          state: "not_found",
          configured: true,
          failedSources: [],
          view: { ...ready.view, summary: { ...ready.view.summary, key: "", name: "" } },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: /habitación no encontrada/i })).toBeInTheDocument();
  });
});
