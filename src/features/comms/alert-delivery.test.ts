import { describe, expect, it } from "vitest";

import type { OwnerAttentionItem } from "@/features/attention/owner-attention";
import {
  formatAlertDelivery,
  moduleAlertRoute,
  moduleAlertSignal,
  ownerAttentionSignal,
  prepareAlertDelivery,
  prepareToroMailAlertDelivery,
  roomBindingRole,
  validateToroMailAlertDeliveryReceipt,
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

describe("TORO Mail to OpenClaw alert routing", () => {
  const hash = `sha256:${"a".repeat(64)}`;
  const mailAlert = {
    scope: "organization" as const,
    accountId: "hotel-mail",
    providerMessageIdHash: hash,
    privacyReviewed: true,
    alertClass: "guest_service" as const,
    version: "1",
    priority: "high" as const,
    title: "Seguimiento de huésped",
    summary: "El caso requiere revisión humana.",
    impact: "La respuesta está pendiente.",
    requiredAction: "Verificar el caso y preparar respuesta.",
    owner: "Recepción",
    dueAt: "Hoy",
    sourceSystem: "Gmail hotel",
    sourceCutoff: "16 oct 2026 · 08:00 CR",
  };
  const receptionBinding: WhatsAppGroupBinding = {
    ...verifiedManagementGroup,
    id: "binding-reception",
    businessRole: roomBindingRole("reception"),
  };

  it("routes hotel guest-service mail only to a verified reception group", () => {
    const decision = prepareToroMailAlertDelivery(mailAlert, [receptionBinding]);
    expect(decision).toMatchObject({
      status: "ready",
      target: "reception_group",
      blockers: [],
    });
    expect(decision.candidate?.destinationBindingId).toBe("binding-reception");
  });

  it("routes hotel financial evidence to restricted management", () => {
    const decision = prepareToroMailAlertDelivery({
      ...mailAlert,
      alertClass: "financial_evidence",
      title: "Comprobante por verificar",
      owner: "Gerencia",
    }, [verifiedManagementGroup]);
    expect(decision).toMatchObject({
      status: "ready",
      target: "management_group",
      candidate: { privacy: "restricted", room: "management" },
    });
  });

  it("never leaks personal or third-party mail into hotel groups", () => {
    const decision = prepareToroMailAlertDelivery({
      ...mailAlert,
      scope: "personal",
      alertClass: "security",
    }, [verifiedManagementGroup, receptionBinding]);
    expect(decision).toEqual({
      status: "blocked",
      target: "owner_direct",
      candidate: null,
      blockers: ["verified_owner_direct_binding_missing"],
    });
  });

  it("requires privacy review and a hashed provider reference", () => {
    const decision = prepareToroMailAlertDelivery({
      ...mailAlert,
      privacyReviewed: false,
      providerMessageIdHash: "raw-provider-id",
    }, [receptionBinding]);
    expect(decision).toEqual({
      status: "blocked",
      target: "reception_group",
      candidate: null,
      blockers: ["privacy_review_required", "hashed_source_reference_required"],
    });
  });

  it("treats provider acceptance as distinct from verified delivery", () => {
    const decision = prepareToroMailAlertDelivery(mailAlert, [receptionBinding]);
    const accepted = validateToroMailAlertDeliveryReceipt(decision, {
      receiptId: "receipt-1",
      dedupeKey: decision.candidate!.dedupeKey,
      destinationBindingId: "binding-reception",
      providerStatus: "accepted",
      attemptedAt: "2026-10-16T14:00:00Z",
      deliveredAt: null,
      readbackAt: null,
    });
    expect(accepted).toEqual({ valid: true, deliveryVerified: false, errors: [] });

    const delivered = validateToroMailAlertDeliveryReceipt(decision, {
      receiptId: "receipt-2",
      dedupeKey: decision.candidate!.dedupeKey,
      destinationBindingId: "binding-reception",
      providerStatus: "delivered",
      attemptedAt: "2026-10-16T14:00:00Z",
      deliveredAt: "2026-10-16T14:00:01Z",
      readbackAt: "2026-10-16T14:00:02Z",
    });
    expect(delivered).toEqual({ valid: true, deliveryVerified: true, errors: [] });
  });
});
