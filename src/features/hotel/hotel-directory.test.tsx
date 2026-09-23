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
  operationalGate: {
    status: "HUMAN_QA_REQUIRED" as const,
    reason: "Fresh housekeeping QA and human reception release are required.",
    p0BlockerCount: 0,
    p1AttentionCount: 0,
    recentUnresolvedEvidenceCount: 0,
    openTaskSummary: null,
    calculatedAtCr: "2026-09-19T12:02:05.000Z",
  },
};

const unavailableOperational = {
  state: "unavailable" as const,
  canClaimCurrent: false,
  sourceAsOf: null,
  ageMinutes: null,
  label: "Sin snapshot operativo verificable",
  metrics: null,
};

describe("HotelDirectory", () => {
  it("renders safe room metadata, stale source evidence, operational Kross state and Room 360 links", () => {
    render(
      <HotelDirectory
        data={{
          rooms: [room],
          source: { status: "stale", latestAt: "2026-09-14T09:59:49.828Z" },
          operational: unavailableOperational,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Hotel" })).toBeInTheDocument();
    expect(screen.getByText("Información desactualizada.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Estado operativo Kross" })).toBeInTheDocument();
    expect(screen.getByText("Sin snapshot operativo verificable")).toBeInTheDocument();
    expect(screen.getByText(/ocupación, llegadas, salidas y huéspedes en casa no se presentan como actuales/i)).toBeInTheDocument();
    expect(screen.getByText("Suite premium cinema")).toBeInTheDocument();
    expect(screen.getByText(/Capacidad: 5/i)).toBeInTheDocument();
    expect(screen.getByText("HUMAN_QA_REQUIRED")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /revisar ficha 360/i })).toHaveAttribute(
      "href",
      "/toro/habitaciones/DC-ROOM-25",
    );
  });

  it("marks rooms needing verification without hiding them", () => {
    render(
      <HotelDirectory
        data={{
          rooms: [{ ...room, roomNumber: 28, room360Key: "DC-ROOM-28", verifiedStatus: "needs_verification" }],
          source: { status: "fresh", latestAt: "2026-09-17T20:00:00.000Z" },
          operational: unavailableOperational,
        }}
      />,
    );

    expect(screen.getByText("needs_verification")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /revisar ficha 360/i })).toBeInTheDocument();
  });

  it("shows an honest empty state", () => {
    render(
      <HotelDirectory
        data={{ rooms: [], source: { status: "empty", latestAt: null }, operational: unavailableOperational }}
      />,
    );
    expect(screen.getByText(/No hay habitaciones activas disponibles/i)).toBeInTheDocument();
  });
});
