import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HotelDirectory } from "./hotel-directory";

const room = {
  id: "00000000-0000-0000-0000-000000000025",
  roomNumber: 25,
  title: "Suite premium cinema",
  roomType: "suite",
  maxCapacity: 5,
  kitchenType: "private",
  verifiedStatus: "verified",
  lastReviewed: "2026-09-14",
  freshness: "2026-09-14T09:59:49.828Z",
  room360Key: "DC-ROOM-25",
};

describe("HotelDirectory", () => {
  it("renders safe room metadata, stale source evidence and Room 360 links", () => {
    render(
      <HotelDirectory
        data={{
          rooms: [room],
          source: { status: "stale", latestAt: "2026-09-14T09:59:49.828Z" },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Hotel" })).toBeInTheDocument();
    expect(screen.getByText("Información desactualizada.")).toBeInTheDocument();
    expect(screen.getByText("Suite premium cinema")).toBeInTheDocument();
    expect(screen.getByText(/Capacidad: 5/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir ficha 360 de habitación 25/i })).toHaveAttribute(
      "href",
      "/toro/habitaciones/DC-ROOM-25",
    );
    expect(screen.queryByText(/ocupación/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/precio/i)).not.toBeInTheDocument();
  });

  it("marks rooms needing verification without hiding them", () => {
    render(
      <HotelDirectory
        data={{
          rooms: [{ ...room, roomNumber: 28, room360Key: "DC-ROOM-28", verifiedStatus: "needs_verification" }],
          source: { status: "fresh", latestAt: "2026-09-17T20:00:00.000Z" },
        }}
      />,
    );

    expect(screen.getByText("needs_verification")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir ficha 360 de habitación 28/i })).toBeInTheDocument();
  });

  it("shows an honest empty state", () => {
    render(<HotelDirectory data={{ rooms: [], source: { status: "empty", latestAt: null } }} />);
    expect(screen.getByText(/No hay habitaciones activas disponibles/i)).toBeInTheDocument();
  });
});
