import assert from "node:assert/strict";
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
const messageBudget = { maxFieldBytes: 1024, maxMessageBytes: 4096 };
const deliveryContext = { messageBudget, orgId: "org-hotel", nowMs: Date.parse("2026-10-13T20:01:00Z"), maxHealthAgeMs: 120_000 };
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
    const message = formatAlertDelivery(managementSignal(), messageBudget);
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


describe("C50-01 protected alert byte budget", () => {
  it("rejects giant tokens before a delivery can become ready", () => {
    const signal = { ...managementSignal(), title: "x".repeat(20_000) };
    expect(() => formatAlertDelivery(signal, messageBudget)).toThrow();
    expect(prepare(signal)).toMatchObject({ status: "blocked", destinationBindingId: null, message: "" });
    expect(prepare({ ...managementSignal(), sourceRef: "reference:" + "x".repeat(20_000) })).toMatchObject({
      status: "blocked", destinationBindingId: null, message: "",
    });
  });

  it("counts UTF-8 bytes and keeps complete provenance without word clipping", () => {
    const sourceRef = "fixture reference with more than eight words and an exact immutable identity";
    const signal = { ...managementSignal(), title: "🐂".repeat(257), sourceRef };
    expect(() => formatAlertDelivery(signal, messageBudget)).toThrow();
    const message = formatAlertDelivery({ ...signal, title: "🐂".repeat(256) }, messageBudget);
    expect(message).toContain(`Referencia: ${sourceRef}`);
    expect(Buffer.byteLength(message, "utf8")).toBeLessThanOrEqual(messageBudget.maxMessageBytes);
  });

  it("enforces the caller total budget even when individual fields fit", () => {
    const signal = managementSignal();
    const exact = Buffer.byteLength(formatAlertDelivery(signal, messageBudget), "utf8");
    expect(formatAlertDelivery(signal, { maxFieldBytes: 100, maxMessageBytes: exact })).toBeTruthy();
    expect(() => formatAlertDelivery(signal, { maxFieldBytes: 100, maxMessageBytes: exact - 1 })).toThrow();
    expect(prepareAlertDelivery(signal, [verifiedManagementGroup], {
      ...deliveryContext, messageBudget: { maxFieldBytes: 100, maxMessageBytes: exact - 1 },
    })).toMatchObject({ status: "blocked", destinationBindingId: null, message: "" });
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1.5])("rejects an invalid protected budget: %s", (maxMessageBytes) => {
    expect(prepareAlertDelivery(managementSignal(), [verifiedManagementGroup], {
      ...deliveryContext, messageBudget: { maxFieldBytes: 10, maxMessageBytes },
    }).status).toBe("blocked");
  });
});


describe("runtime JSON alert validation", () => {
const signal: Parameters<typeof prepareAlertDelivery>[0] = {
  orgId: "fixture-hotel", sourceKind: "module_alert", sourceKey: "fixture-water-1", version: "1",
  room: "operations", privacy: "internal", priority: "high", title: "Revisar suministro de agua",
  summary: "Caso sintético sin datos de huéspedes.", impact: "Preparación de una unidad de prueba.",
  requiredAction: "Comprobar y registrar resultado.", owner: "Responsable propuesto",
  dueAt: "Plazo propuesto por confirmar", sourceSystem: "Prueba TORO", sourceCutoff: "7 nov 2026 · 02:00 CR",
  sourceRef: "fixture:water:001",
};
const binding = {
  id: "fixture-group-operations", orgId: "fixture-hotel", scope: "organization", privacy: "internal",
  channel: "whatsapp", provider: "openclaw", endpointKind: "group", businessRole: roomBindingRole("operations"),
  authStatus: "connected", ingestionStatus: "healthy", verificationStatus: "verified",
  sendEnabled: true, active: true, lastEventAt: null, healthCheckedAt: "2026-11-07T08:00:00Z",
};
const context = {
  orgId: "fixture-hotel", nowMs: Date.parse("2026-11-07T08:01:00Z"), maxHealthAgeMs: 120000,
  messageBudget: {maxFieldBytes: 1024, maxMessageBytes: 4096},
};
const clone = <T,>(x: T): T => structuredClone(x);
const prepareRuntime = (s: unknown, b: unknown, c: unknown) => prepareAlertDelivery(s as Parameters<typeof prepareAlertDelivery>[0], b as Parameters<typeof prepareAlertDelivery>[1], c as Parameters<typeof prepareAlertDelivery>[2]);
const negativeCases: Array<[string, () => [unknown, unknown]]> = [
  ["AD20-01 null signal", () => [null, [binding]]],
  ["AD20-02 array signal", () => [[], [binding]]],
  ["AD20-03 unsupported origin", () => [{...signal, sourceKind:"external_freeform"}, [binding]]],
  ["AD20-04 unsupported room", () => [{...signal, room:"guests"}, [{...binding, businessRole:"room:guests"}]]],
  ["AD20-05 unsupported privacy", () => [{...signal, privacy:"public"}, [binding]]],
  ["AD20-06 unsupported priority", () => [{...signal, priority:"urgent"}, [binding]]],
  ["AD20-07 missing case identity", () => [{...signal, sourceKey:"  "}, [binding]]],
  ["AD20-08 missing version", () => [{...signal, version:"\t"}, [binding]]],
  ["AD20-09 missing subject", () => [{...signal, title:" "}, [binding]]],
  ["AD20-10 missing summary", () => [{...signal, summary:" "}, [binding]]],
  ["AD20-11 missing impact", () => [{...signal, impact:" "}, [binding]]],
  ["AD20-12 missing next action", () => [{...signal, requiredAction:" "}, [binding]]],
  ["AD20-13 missing responsible role", () => [{...signal, owner:" "}, [binding]]],
  ["AD20-14 missing due statement", () => [{...signal, dueAt:" "}, [binding]]],
  ["AD20-15 missing source system", () => [{...signal, sourceSystem:" "}, [binding]]],
  ["AD20-16 missing source cutoff", () => [{...signal, sourceCutoff:" "}, [binding]]],
  ["AD20-17 missing source reference", () => [{...signal, sourceRef:" "}, [binding]]],
  ["AD20-18 blank destination identity", () => [signal, [{...binding, id:" "}]]],
  ["AD20-19 string active flag", () => [signal, [{...binding, active:"false"}]]],
  ["AD20-20 string send flag", () => [signal, [{...binding, sendEnabled:"false"}]]],
];
for (const [name, scenario] of negativeCases) {
  it(name, () => {
    const [s,b] = scenario();
    const result = prepareRuntime(clone(s), clone(b), clone(context));
    assert.equal(result.status, "blocked");
    assert.equal(result.destinationBindingId, null);
  });
}
it("compatibility: valid alert remains ready, localized dates and opaque refs preserved", () => {
  const r = prepareRuntime(clone(signal), [clone(binding)], clone(context));
  assert.equal(r.status, "ready");
  assert.equal(r.destinationBindingId, binding.id);
  assert.ok(r.message.includes(signal.dueAt));
  assert.ok(r.message.includes(signal.sourceCutoff));
  assert.ok(r.message.includes(signal.sourceRef));
  assert.match(r.dedupeKey,/^alert-delivery-v2:[a-f0-9]{64}$/);
  assert.equal(r.dedupeKey,prepareRuntime(clone(signal),[clone(binding)],clone(context)).dedupeKey);
  assert.notEqual(r.dedupeKey,prepareRuntime({...signal,version:"2"},[clone(binding)],clone(context)).dedupeKey);
});
it("isolation: other organization, private scope and phone cannot become the group", () => {
  for (const change of [{orgId:"fixture-other"},{scope:"private"},{endpointKind:"phone"},{privacy:"invalid"}]) {
    assert.equal(prepareRuntime(signal,[{...binding,...change}],context).status,"blocked");
  }
});
it("health: stale, future, impossible and traffic-only checks fail closed", () => {
  for (const healthCheckedAt of [null,"2026-11-07T07:00:00Z","2026-11-07T08:02:00Z","2026-02-31T00:00:00Z","not-a-date"]) {
    assert.equal(prepareRuntime(signal,[{...binding,healthCheckedAt}],context).status,"blocked");
  }
});
it("ambiguity: two eligible groups never select one arbitrarily", () => {
  const r=prepareRuntime(signal,[binding,{...binding,id:"fixture-second"}],context);
  assert.equal(r.status,"blocked"); assert.equal(r.destinationBindingId,null);
});
it("budgets: UTF-8 field and total limits retained", () => {
  assert.throws(()=>formatAlertDelivery({...signal,title:"🐂".repeat(257)},context.messageBudget));
  const message=formatAlertDelivery(signal,context.messageBudget);
  const bytes=Buffer.byteLength(message,"utf8");
  assert.throws(()=>formatAlertDelivery(signal,{maxFieldBytes:100,maxMessageBytes:bytes-1}));
});
it("malformed collection and members block without an unexpected exception", () => {
  for(const bindings of [null,{},[null],[false],[[]]]) {
    const r=prepareRuntime(signal,bindings,context);
    assert.equal(r.status,"blocked");assert.equal(r.destinationBindingId,null);
  }
});
it("invalid context cannot select a destination", () => {
  for(const c of [null,{}, {...context,nowMs:NaN},{...context,maxHealthAgeMs:0},{...context,orgId:"fixture-other"}]) {
    const r=prepareRuntime(signal,[binding],c);
    assert.equal(r.status,"blocked");assert.equal(r.destinationBindingId,null);
  }
});
it("required fields cannot be removed or replaced by JSON nonstrings", () => {
  for(const field of Object.keys(signal)) {
    for(const bad of [undefined,null,0,false,{},[]]) {
      const r=prepareRuntime({...signal,[field]:bad},[binding],context);
      assert.equal(r.status,"blocked",field);assert.equal(r.destinationBindingId,null);
    }
  }
});
it("rejected signal never leaves a renderable message", () => {
  for(const change of [{owner:" "},{priority:"invalid"},{room:"invalid"}]) {
    const r=prepareRuntime({...signal,...change},[binding],context);
    assert.equal(r.message,"");
  }
});

it("keeps Owner Attention restricted to management", () => {
 const r = prepareRuntime({...signal,sourceKind:"owner_attention"},[binding],context);
 assert.equal(r.status,"blocked"); assert.equal(r.destinationBindingId,null); assert.equal(r.message,"");
});
it("excludes invalid non-JSON identities from dedupe serialization", () => {
  const cycle: Record<string, unknown> = {}; cycle.self = cycle;
  for (const value of [BigInt(1), cycle]) {
    for (const field of ["sourceKind", "sourceKey", "version"]) {
      const r = prepareRuntime({...signal, [field]: value}, [binding], context);
      assert.equal(r.status, "blocked"); assert.equal(r.destinationBindingId, null);
    }
    assert.equal(prepareRuntime(signal, [binding], {...context, orgId: value}).status, "blocked");
  }
});

});

