import { describe, expect, it } from "vitest";

import { classifyHotelMailTrigger } from "./hotel-mail-trigger";

describe("classifyHotelMailTrigger", () => {
  it("routes a reservation request to Reception but requires Kross reconciliation", () => {
    expect(classifyHotelMailTrigger({
      physicalAccountRef: "account-a",
      providerMessageId: "msg-1",
      from: "Alertas WeSpeak <notifications@wespeak.news>",
      subject: "IMPORTANTE - Realizar reserva",
      snippet: "El huésped desea reservar dos habitaciones para hoy",
    })).toMatchObject({
      signal: "reservation_candidate",
      department: "reception",
      visualQueue: true,
      reservationGate: "kross_read_reconciliation_required",
      canMutateReservation: false,
    });
  });

  it("treats Kross pre-arrival mail as a source observation, not a new reservation", () => {
    expect(classifyHotelMailTrigger({
      physicalAccountRef: "account-a",
      providerMessageId: "msg-2",
      from: "noreply@krossbooking.com",
      subject: "Guest Portal - Reservation data added 4251/2026",
      snippet: "Online check-in: 1 data filled",
    })).toMatchObject({
      signal: "guest_prearrival_update",
      department: "reception",
      reservationGate: "kross_source_observation",
      canMutateReservation: false,
    });
  });

  it("keeps Booking account security away from the reservation queue", () => {
    expect(classifyHotelMailTrigger({
      physicalAccountRef: "account-a",
      providerMessageId: "msg-3",
      from: "Booking.com <noreply@booking.com>",
      subject: "Booking.com - New sign-in to your account",
    })).toMatchObject({
      signal: "security_alert",
      department: "management",
      gmailLabels: ["30 · SEGURIDAD"],
    });
  });

  it("routes payment evidence to Finance", () => {
    expect(classifyHotelMailTrigger({
      physicalAccountRef: "account-a",
      providerMessageId: "msg-4",
      from: "notifications@wespeak.news",
      subject: "Comprobante de pago pendiente de verificar",
    })).toMatchObject({
      signal: "payment_review",
      department: "finance",
      attention: "today",
    });
  });

  it("routes CI failures to Systems", () => {
    expect(classifyHotelMailTrigger({
      physicalAccountRef: "account-a",
      providerMessageId: "msg-5",
      from: "Dramcatcherst <notifications@github.com>",
      subject: "PR run failed",
    })).toMatchObject({
      signal: "system_alert",
      department: "systems",
      attention: "today",
      gmailLabels: ["40 · SISTEMAS", "40.1 · GITHUB / CI"],
    });
  });

  it("keeps promotions out of human work queues", () => {
    expect(classifyHotelMailTrigger({
      physicalAccountRef: "account-a",
      providerMessageId: "msg-6",
      from: "offers@example.com",
      subject: "Oferta de la semana",
      labels: ["CATEGORY_PROMOTIONS"],
    })).toMatchObject({
      signal: "informational",
      department: "none",
      visualQueue: false,
      gmailLabels: ["90 · AUTOMÁTICO / LECTURA"],
    });
  });

  it("uses a stable provider-message dedupe key", () => {
    const result = classifyHotelMailTrigger({
      physicalAccountRef: "account-a",
      providerMessageId: "provider-123",
      from: "unknown@example.com",
      subject: "Revisar",
    });
    expect(result.dedupeKey).toMatch(/^mail-message-v1:[a-f0-9]{64}$/);
  });

  it("separates the same native message ID in different mailboxes and preserves identity across reclassification", () => {
    const message = { physicalAccountRef: "account-a", providerMessageId: "provider-123", from: "unknown@example.com", subject: "Revisar" };
    const first = classifyHotelMailTrigger(message);
    expect(classifyHotelMailTrigger({ ...message, physicalAccountRef: "account-b" }).dedupeKey).not.toBe(first.dedupeKey);
    expect(classifyHotelMailTrigger({ ...message, subject: "Security alert" }).dedupeKey).toBe(first.dedupeKey);
  });

  it.each(["noreply@booking.com.evil.invalid", "booking.com@evil.invalid", "notifications@wespeak.news <attacker@evil.invalid>"])("does not classify %s as a reservation provider by substring", (from) => {
    expect(classifyHotelMailTrigger({ physicalAccountRef: "account-a", providerMessageId: "provider-123", from, subject: "New reservation" })).toMatchObject({
      signal: "unclassified", reservationGate: "not_applicable", canMutateReservation: false,
    });
  });

  it("rejects a source without a stable connection identity", () => {
    expect(() => classifyHotelMailTrigger({ physicalAccountRef: "", providerMessageId: "provider-123", from: "guest@example.com", subject: "Revisar" })).toThrow("verified account");
  });
});
