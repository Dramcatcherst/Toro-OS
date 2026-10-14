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
  id: "binding-management", channel: "whatsapp", provider: "openclaw", endpointKind: "group",
  businessRole: roomBindingRole("management"), authStatus: "connected", ingestionStatus: "healthy",
  verificationStatus: "verified", sendEnabled: true, active: true, lastEventAt: "2026-10-13T20:00:00Z",
};

function managementSignal() {
  return ownerAttentionSignal(ownerItem, {
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
      moduleKey: "unknown", alertKey: "a1", version: "1", priority: "high", title: "Alerta",
      summary: "Resumen", impact: "Impacto", requiredAction: "Acción", owner: "Responsable",
      dueAt: "Hoy", sourceSystem: "TORO", sourceCutoff: "Ahora", sourceRef: "ref-1",
    })).toThrow("no approved TORO room policy");
  });

  it("does not treat the verified phone binding as a group destination", () => {
    const candidate = prepareAlertDelivery(managementSignal(), [{
      ...verifiedManagementGroup, id: "toro-interno", endpointKind: "phone",
    }]);
    expect(candidate.status).toBe("blocked");
    expect(candidate.destinationBindingId).toBeNull();
    expect(candidate.blockers).toEqual(["verified_group_binding_missing"]);
  });

  it("requires one observed, verified and healthy group binding", () => {
    const ready = prepareAlertDelivery(managementSignal(), [verifiedManagementGroup]);
    expect(ready.status).toBe("ready");
    expect(ready.destinationBindingId).toBe("binding-management");
    const unobserved = prepareAlertDelivery(managementSignal(), [{ ...verifiedManagementGroup, lastEventAt: null }]);
    expect(unobserved.status).toBe("blocked");
  });

  it("fails closed when more than one destination claims the same room", () => {
    const candidate = prepareAlertDelivery(managementSignal(), [
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
    const first = prepareAlertDelivery(managementSignal(), [verifiedManagementGroup]);
    const next = prepareAlertDelivery({ ...managementSignal(), version: "8" }, [verifiedManagementGroup]);
    expect(first.dedupeKey).not.toBe(next.dedupeKey);
    expect(first.dedupeKey).toContain("binding-management");
    expect(first.dedupeKey).toContain("invoice-1");
  });
});