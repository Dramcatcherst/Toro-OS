import { describe, expect, it } from "vitest";

import {
  buildMaintenanceExecutiveSignals,
  parseMaintenanceRoundPayload,
  type MaintenanceRoundPayload,
} from "./maintenance-round";

const basePayload: MaintenanceRoundPayload = {
  round: {
    roundKey: "MNT-DAILY-P0-P1-20260919",
    roundName: "Ronda diaria mantenimiento · P0/P1 · 19/09/2026",
    roundStatus: "ready",
    totalChecks: 20,
    requiredChecks: 20,
    passChecks: 0,
    failChecks: 0,
    notReviewedChecks: 0,
    pendingChecks: 20,
    closureReadyPasses: 0,
    lastCheckUpdatedAt: "2026-09-19T06:29:28.801324+00:00",
  },
  checks: [
    {
      checkId: "check-1",
      checkOrder: 10,
      blockLabel: "P0 · Agua/Humedad",
      areaLabel: "#22",
      resultStatus: "pending",
      requiresSupervisorReview: true,
      supervisorConfirmed: false,
      capturedAt: null,
    },
    {
      checkId: "check-2",
      checkOrder: 20,
      blockLabel: "P0 · Agua/Humedad",
      areaLabel: "#21",
      resultStatus: "pending",
      requiresSupervisorReview: true,
      supervisorConfirmed: false,
      capturedAt: null,
    },
    {
      checkId: "check-3",
      checkOrder: 30,
      blockLabel: "P0 · Agua/Humedad",
      areaLabel: "#24/#28",
      resultStatus: "pending",
      requiresSupervisorReview: true,
      supervisorConfirmed: false,
      capturedAt: null,
    },
  ],
};

describe("maintenance executive signals", () => {
  it("surfaces pending P0 work and one delegated round summary", () => {
    const signals = buildMaintenanceExecutiveSignals(basePayload);

    expect(signals.exceptions).toEqual([
      expect.objectContaining({
        title: "3 P0 de mantenimiento pendientes de verificación",
      }),
    ]);
    expect(signals.delegatedActions).toEqual([
      expect.objectContaining({
        title: "Ronda P0/P1 de mantenimiento",
        nextStep: "0/20 revisados · 0 FAIL · 20 pendientes",
      }),
    ]);
  });

  it("surfaces FAIL and P0 supervisor confirmation separately", () => {
    const payload: MaintenanceRoundPayload = {
      round: {
        ...basePayload.round!,
        passChecks: 1,
        failChecks: 1,
        pendingChecks: 0,
        requiredChecks: 2,
        totalChecks: 2,
      },
      checks: [
        {
          ...basePayload.checks[0],
          resultStatus: "fail",
          requiresSupervisorReview: false,
        },
        {
          ...basePayload.checks[1],
          resultStatus: "pass",
          supervisorConfirmed: false,
        },
      ],
    };

    const signals = buildMaintenanceExecutiveSignals(payload);

    expect(signals.exceptions.map((item) => item.title)).toEqual([
      "1 chequeo(s) FAIL en mantenimiento",
      "1 P0 PASS esperando confirmación de Gerencia",
    ]);
    expect(signals.delegatedActions[0]?.nextStep).toBe(
      "2/2 revisados · 1 FAIL · 0 pendientes",
    );
  });

  it("fails closed on malformed RPC payloads", () => {
    expect(() =>
      parseMaintenanceRoundPayload({
        round: { round_key: "MNT-DAILY-P0-P1-20260919" },
        checks: [],
      }),
    ).toThrow("Invalid maintenance round payload.");
  });

  it("surfaces a missing daily round instead of pretending the system is current", () => {
    const signals = buildMaintenanceExecutiveSignals({ round: null, checks: [] });

    expect(signals.exceptions[0]?.title).toBe(
      "No hay ronda diaria de mantenimiento preparada",
    );
    expect(signals.delegatedActions).toHaveLength(0);
  });
});
