import { describe, expect, it } from "vitest";

import type { OwnerAttentionItem } from "@/features/attention/owner-attention";
import {
  formatAlertDelivery,
  moduleAlertRoute,
  moduleAlertSignal,
  ownerAttentionSignal,
  prepareAlertDelivery,
  roomBindingRole,
  type WhatsAppGroupBinding,
} from "./alert-delivery";

const ownerItem: OwnerAttentionItem = {
  key: "invoice-1", dedupeRef: "obligation-1", kind: "invoice",
  title: "Proveedor — factura pendiente", priority: "high", state: "unpaid",
  dueDate: "2026-10-14", amount: 100, currency: "USD", ownerAgent: "FIONA",
  humanOwner: "Gerencia", sourceSystem: "TORO Finance", sourceUrl: null, mailbox: null,
};

const verifiedManagementGroup: WhatsAppGroupBinding = {
  orgId: "org-hotel", scope: "organization", privacy: "restricted",
  id: "binding-management", channel: "whatsapp", provider: "openclaw", endpointKind: "group",
  businessRole: roomBindingRole("management"), authStatus: "connected", ingestionStatus: "healthy",
  verificationStatus: "verified", sendEnabled: true, active: true, lastEventAt: "2026-10-13T20:00:00Z",
  healthCheckedAt: "2026-10-13T20:00:00Z",
};

// A caller must supply its protected scope and health policy; an event is not a probe.
const deliveryContext = { orgId: "org-hotel", nowMs: Date.parse("2026-10-13T20:01:00Z"), maxHealthAgeMs: 120_000 };
const prepare = (signal = managementSignal(), bindings = [verifiedManagementGroup]) =>
  prepareAlertDelivery(signal, bindings, deliveryContext);

function managementSignal() {
  return ownerAttentionSignal(ownerItem, {
    orgId: "org-hotel",
    version: "7", summary: "La factura sigue pendiente de validación.",
    impact: "El servicio podría suspenderse.", requiredAction: "Validar evidencia y decidir el pago.",
    owner: "Gerencia", dueAt: "14 oct 2026 · 10:00 CR", sourceCutoff: "13 oct 2026 · 22:00 CR",
  });
}

describe("TORO alert delivery routing", () => {
  it("keeps Owner Attention in the restricted management room", () => {
    const signal = managementSignal();
    expect(signal.room).toBe("management");
    expect(signal.privacy).toBe("restricted");
  });

  it("routes HR and utility module alerts through explicit policy", () => {
    expect(moduleAlertRoute("people_hr")).toEqual({ room: "people", privacy: "restricted" });
    expect(moduleAlertRoute("utilities_sustainability")).toEqual({ room: "operations", privacy: "internal" });
    expect(moduleAlertRoute("unknown")).toBeNull();
  });

  it("refuses a module without an approved room instead of guessing", () => {
    expect(() => moduleAlertSignal({
      orgId: "org-hotel",
      moduleKey: "unknown", alertKey: "a1", version: "1", priority: "high", title: "Alerta",
      summary: "Resumen", impact: "Impacto", requiredAction: "Acción", owner: "Responsable",
      dueAt: "Hoy", sourceSystem: "TORO", sourceCutoff: "Ahora", sourceRef: "ref-1",
    })).toThrow("no approved TORO room policy");
  });

  it("does not treat the verified phone binding as a group destination", () => {
    const candidate = prepare(managementSignal(), [{
      ...verifiedManagementGroup, id: "toro-interno", endpointKind: "phone",
    }]);
    expect(candidate.status).toBe("blocked");
    expect(candidate.destinationBindingId).toBeNull();
    expect(candidate.blockers).toEqual(["verified_group_binding_missing"]);
  });

  it("requires one observed, verified and healthy group binding", () => {
    const ready = prepare();
    expect(ready.status).toBe("ready");
    expect(ready.destinationBindingId).toBe("binding-management");
    const unobserved = prepare(managementSignal(), [{ ...verifiedManagementGroup, healthCheckedAt: null }]);
    expect(unobserved.status).toBe("blocked");
  });

  it("fails closed when more than one destination claims the same room", () => {
    const candidate = prepare(managementSignal(), [
      verifiedManagementGroup, { ...verifiedManagementGroup, id: "binding-management-2" },
    ]);
    expect(candidate.status).toBe("blocked");
    expect(candidate.blockers).toEqual(["ambiguous_group_binding"]);
  });

  it("formats an actionable message under 120 words", () => {
    const message = formatAlertDelivery(managementSignal());
    for (const label of ["Qué pasó:", "Impacto:", "Acción:", "Responsable:", "Plazo:", "Fuente/corte:", "Referencia:"]) {
      expect(message).toContain(label);
    }
    expect(message.split(/\s+/).length).toBeLessThanOrEqual(120);
  });

  it("keys idempotency by destination, source alert and version", () => {
    const first = prepare();
    const next = prepare({ ...managementSignal(), version: "8" });
    expect(first.dedupeKey).not.toBe(next.dedupeKey);
    expect(first.dedupeKey).toMatch(/^alert-delivery-v2:[a-f0-9]{64}$/);
    expect(first.dedupeKey).toBe(prepare().dedupeKey);
  });

  it.each([
    { orgId: "org-other" }, { orgId: "" }, { scope: "private" as const },
    { scope: "shared" as const }, { privacy: "internal" as const },
  ])("blocks a destination outside the exact protected alert scope: %j", (change) => {
    const candidate = prepare(managementSignal(), [{ ...verifiedManagementGroup, ...change }]);
    expect(candidate.status).toBe("blocked");
    expect(candidate.destinationBindingId).toBeNull();
  });

  it("requires signal and protected context organizations to match", () => {
    for (const orgId of ["", "org-other"]) {
      const candidate = prepare({ ...managementSignal(), orgId });
      expect(candidate.status).toBe("blocked");
      expect(candidate.destinationBindingId).toBeNull();
    }
  });

  it.each([null, "not-a-date", "2000-01-01T00:00:00Z", "2026-10-13T20:01:01Z"])(
    "blocks missing, invalid, stale or future successful health checks: %s", (healthCheckedAt) => {
      expect(prepare(managementSignal(), [{ ...verifiedManagementGroup, healthCheckedAt }]).status).toBe("blocked");
    },
  );

  it("uses the trusted health window without treating message inactivity as failure", () => {
    expect(prepare(managementSignal(), [{ ...verifiedManagementGroup, lastEventAt: null }]).status).toBe("ready");
    expect(prepareAlertDelivery(managementSignal(), [verifiedManagementGroup], {
      ...deliveryContext, maxHealthAgeMs: 30_000,
    }).status).toBe("blocked");
    for (const maxHealthAgeMs of [0, -1, Number.NaN]) {
      expect(prepareAlertDelivery(managementSignal(), [verifiedManagementGroup], {
        ...deliveryContext, maxHealthAgeMs,
      }).status).toBe("blocked");
    }
  });

  it("rejects an impossible calendar date even when Date.parse normalizes it into the health window", () => {
    expect(prepareAlertDelivery(managementSignal(), [{
      ...verifiedManagementGroup, healthCheckedAt: "2026-02-31T20:00:00Z",
    }], { ...deliveryContext, nowMs: Date.parse("2026-03-03T20:01:00Z") }).status).toBe("blocked");
  });

  it("does not collide when delimiters move between source identity fields", () => {
    const first = prepare({ ...managementSignal(), sourceKey: "x:y", version: "z" });
    const second = prepare({ ...managementSignal(), sourceKey: "x", version: "y:z" });
    expect(first.dedupeKey).not.toBe(second.dedupeKey);
    expect(first.dedupeKey).not.toBe(prepare(
      { ...managementSignal(), sourceKey: "x:y", version: "z" },
      [{ ...verifiedManagementGroup, id: "other-binding" }],
    ).dedupeKey);
  });
});
