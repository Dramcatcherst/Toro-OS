import "server-only";
import {
  captureAlegraWriteAuthorization, prepareAlegraWriteIntent,
  type AlegraWriteIntent, type AlegraWriteScope, type AlegraReadback,
} from "./alegra-writer-contract";
import type { AlegraWriteTransport, AlegraProviderLookupResult } from "./alegra-writer-executor";

export type AlegraNativeHttp = {
  // Implemented by the authenticated server host. No credentials, URLs or
  // automatic retries are accepted from an intent or exposed to a client.
  request(input: { method: "GET" | "POST"; path: string; query?: Record<string, string>; body?: unknown }): Promise<{ status: number; data: unknown }>;
};
export type AlegraNativeBinding = { scope: AlegraWriteScope; receiverTaxId: string; mainCurrency: string; applicationVersion: string };
export type NativePurchaseBody = {
  date: string; dueDate: string; provider: number; numberTemplate: { number: string };
  purchases: { categories: Array<{ id: number; price: number; quantity: number; tax: Array<{ id: number }> }> };
  costCenter: number; observations: string;
};
type NativeTransportInput = {
  http: AlegraNativeHttp; binding: AlegraNativeBinding; now: () => string; mutationEnabled?: boolean;
  // Must resolve current canonical actor/approval, open period and correction
  // policy in the server context. Returning true in a fixture proves no authority.
  authorizeNativeCreate?: (captured: { intent: AlegraWriteIntent; body: NativePurchaseBody; company: Record<string, unknown> }) => Promise<boolean>;
};
type NativeObject = Record<string, unknown>;
function object(value: unknown): NativeObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("NATIVE_RESPONSE_INVALID");
  return value as NativeObject;
}
function text(value: unknown) { return typeof value === "string" || typeof value === "number" ? String(value).trim() : ""; }
function taxIdentity(value: unknown) { return text(value).replace(/[\s-]/g, "").toLowerCase(); }
function id(value: unknown): number {
  const raw = text(value);
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) throw new Error("NATIVE_ID_INVALID");
  return Number(raw);
}
function units(value: unknown): bigint {
  const raw = text(value);
  if (!/^\d{1,18}(?:\.\d{1,2})?$/.test(raw)) throw new Error("NATIVE_AMOUNT_UNSUPPORTED");
  const [whole, fraction = ""] = raw.split(".");
  const result = BigInt(whole + fraction.padEnd(2, "0"));
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("NATIVE_AMOUNT_UNSUPPORTED");
  return result;
}
function numeric(value: unknown): number {
  const result = Number(text(value));
  if (units(result) !== units(value)) throw new Error("NATIVE_AMOUNT_UNSUPPORTED");
  return result;
}
function formatted(value: bigint) { return `${value / BigInt(100)}.${String(value % BigInt(100)).padStart(2, "0")}`; }
function validDate(value: unknown): string {
  const raw = text(value);
  const date = new Date(raw + "T00:00:00.000Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || !Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== raw) throw new Error("NATIVE_DATE_INVALID");
  return raw;
}
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function assertIntent(intent: AlegraWriteIntent, binding: AlegraNativeBinding) {
  if (intent.targetType !== "purchase_bill" || intent.payload.targetType !== "purchase_bill" ||
      intent.action !== "alegra_create_purchase_bill") throw new Error("NATIVE_RESOURCE_UNSUPPORTED");
  const current = prepareAlegraWriteIntent({ scope: intent.scope, evidence: intent.evidence, payload: intent.payload });
  if (current.targetType !== "purchase_bill" || !current.validation.ready || current.payloadHash !== intent.payloadHash || current.idempotencyKey !== intent.idempotencyKey ||
      current.action !== intent.action || intent.version !== current.version) throw new Error("NATIVE_INTENT_INVALID");
  const keys = ["tenantId", "orgId", "legalEntityKey", "propertyId", "projectId"] as const;
  if (binding.scope.scopeConflict || keys.some(k => text(binding.scope[k]) !== text(intent.scope[k])) ||
      !taxIdentity(binding.receiverTaxId) || taxIdentity(binding.receiverTaxId) !== taxIdentity(intent.payload.receiverTaxId)) throw new Error("NATIVE_SCOPE_MISMATCH");
  if (!/^[A-Z]{3}$/.test(binding.mainCurrency) || intent.payload.currency !== binding.mainCurrency) throw new Error("FOREIGN_CURRENCY_UNSUPPORTED");
}
export function prepareNativeAlegraPurchaseBody(intent: AlegraWriteIntent, binding: AlegraNativeBinding): NativePurchaseBody {
  assertIntent(intent, binding);
  const p = intent.payload;
  const date = validDate(p.issueDate), dueDate = validDate(p.dueDate);
  if (dueDate < date) throw new Error("NATIVE_DATE_INVALID");
  const subtotal = units(p.subtotal), tax = units(p.tax), total = units(p.total);
  if (subtotal <= BigInt(0) || subtotal + tax !== total) throw new Error("NATIVE_TAX_TOTAL_MISMATCH");
  if (tax > BigInt(0) && !p.purchaseTax) throw new Error("NATIVE_TAX_MAPPING_REQUIRED");
  const taxes: Array<{ id: number }> = [];
  if (p.purchaseTax) {
    const rate = units(p.purchaseTax.percentage);
    if (rate > BigInt(10000) || subtotal * rate % BigInt(10000) !== BigInt(0) || subtotal * rate / BigInt(10000) !== tax) throw new Error("NATIVE_TAX_TOTAL_MISMATCH");
    taxes.push({ id: id(p.purchaseTax.nativeId) });
  }
  return { date, dueDate, provider: id(p.supplierNativeId), numberTemplate: { number: p.documentNumber! },
    purchases: { categories: [{ id: id(p.accountNativeId), price: numeric(p.subtotal), quantity: 1, tax: taxes }] },
    costCenter: id(p.costCenterNativeId), observations: intent.idempotencyKey };
}

export function createNativeAlegraPurchaseTransport(input: NativeTransportInput): AlegraWriteTransport {
  const binding = freeze(structuredClone(input.binding));
  // Capture capability callbacks at construction, not from a caller-mutable config.
  const http = { request: input.http.request.bind(input.http) };
  const authorize = input.authorizeNativeCreate;
  const enabled = input.mutationEnabled === true;
  const now = input.now;
  async function get(path: string, query?: Record<string, string>) {
    const response = await http.request({ method: "GET", path, query });
    if (response.status < 200 || response.status >= 300) throw new Error("NATIVE_READ_UNAVAILABLE");
    return response.data;
  }
  async function company(intent: AlegraWriteIntent) {
    assertIntent(intent, binding);
    const observed = object(await get("/company"));
    const currency = object(observed.currency);
    if (taxIdentity(observed.identification) !== taxIdentity(binding.receiverTaxId) ||
        text(currency.code) !== binding.mainCurrency || text(observed.applicationVersion) !== binding.applicationVersion ||
        text(observed.decimalPrecision) !== "2") throw new Error("NATIVE_COMPANY_MISMATCH");
    return freeze(structuredClone(observed));
  }
  async function resources(intent: AlegraWriteIntent) {
    const p = intent.payload;
    const [providerData, categoryData, costData, taxData] = await Promise.all([
      get("/contacts/" + id(p.supplierNativeId)), get("/categories/" + id(p.accountNativeId)),
      get("/cost-centers/" + id(p.costCenterNativeId)), p.purchaseTax ? get("/taxes/" + id(p.purchaseTax.nativeId)) : Promise.resolve(null),
    ]);
    const provider = object(providerData), category = object(categoryData), cost = object(costData);
    const identification = provider.identification && typeof provider.identification === "object" ? object(provider.identification).number : provider.identification;
    if (id(provider.id) !== id(p.supplierNativeId) || provider.status !== "active" || !Array.isArray(provider.type) ||
        !provider.type.includes("provider") || !taxIdentity(p.issuerTaxId) || taxIdentity(identification) !== taxIdentity(p.issuerTaxId)) throw new Error("NATIVE_SUPPLIER_MISMATCH");
    if (id(category.id) !== id(p.accountNativeId) || (category.type !== "expense" && category.type !== "asset") ||
        (category.status !== "active" && category.status !== true)) throw new Error("NATIVE_CATEGORY_MISMATCH");
    if (id(cost.id) !== id(p.costCenterNativeId) || (cost.status !== true && cost.status !== "active")) throw new Error("NATIVE_COST_CENTER_MISMATCH");
    if (p.purchaseTax) {
      const tax = object(taxData);
      if (id(tax.id) !== id(p.purchaseTax.nativeId) || tax.status !== "active" || units(tax.percentage) !== units(p.purchaseTax.percentage)) throw new Error("NATIVE_TAX_MISMATCH");
    }
  }
  function sameDocument(bill: NativeObject, intent: AlegraWriteIntent) {
    id(bill.id);
    const number = object(bill.numberTemplate).number;
    const providerId = id(object(bill.provider).id);
    if (typeof number !== "string" || !number.trim()) throw new Error("NATIVE_DOCUMENT_IDENTITY_INVALID");
    return number.trim().toLowerCase() === text(intent.payload.documentNumber).toLowerCase() &&
      providerId === id(intent.payload.supplierNativeId);
  }
  async function lookup(intent: AlegraWriteIntent, key: string): Promise<AlegraProviderLookupResult> {
    try {
      prepareNativeAlegraPurchaseBody(intent, binding);
      if (key !== intent.idempotencyKey) throw new Error("NATIVE_KEY_MISMATCH");
      await company(intent);
      let expectedTotal: number | null = null;
      const matches: NativeObject[] = [];
      const seenIds = new Set<number>();
      for (let page = 0; page < 10; page++) {
        const start = page * 30;
        const response = object(await get("/bills", { metadata: "true", start: String(start), limit: "30",
          billNumber: intent.payload.documentNumber!, client_id: String(id(intent.payload.supplierNativeId)) }));
        const total = object(response.metadata).total;
        if (typeof total !== "number" || !Number.isSafeInteger(total) || total < 0 || !Array.isArray(response.data) ||
            response.data.length > 30 || total < start + response.data.length || (expectedTotal !== null && total !== expectedTotal) ||
            (response.data.length === 0 && total > start)) throw new Error("NATIVE_LOOKUP_COVERAGE_INSUFFICIENT");
        expectedTotal = total;
        for (const entry of response.data) {
          const bill = object(entry);
          const nativeId = id(bill.id);
          if (seenIds.has(nativeId)) throw new Error("NATIVE_LOOKUP_COVERAGE_INSUFFICIENT");
          seenIds.add(nativeId);
          if (sameDocument(bill, intent)) matches.push(bill);
        }
        if (matches.length > 1) throw new Error("NATIVE_LOOKUP_AMBIGUOUS");
        if (start + response.data.length >= total) {
          if (seenIds.size !== total) throw new Error("NATIVE_LOOKUP_COVERAGE_INSUFFICIENT");
          if (!matches.length) return { state: "not_found" };
          const candidateId = String(id(matches[0].id));
          const detailed = object(await get("/bills/" + candidateId));
          if (String(id(detailed.id)) !== candidateId || !sameDocument(detailed, intent) || text(detailed.observations) !== key ||
              text(matches[0].observations) && text(matches[0].observations) !== key) throw new Error("NATIVE_DUPLICATE_REQUIRES_RECONCILIATION");
          return { state: "found", nativeId: candidateId };
        }
        if (response.data.length !== 30) throw new Error("NATIVE_LOOKUP_COVERAGE_INSUFFICIENT");
      }
      throw new Error("NATIVE_LOOKUP_COVERAGE_INSUFFICIENT");
    } catch { return { state: "unavailable", detail: "NATIVE_LOOKUP_RECONCILIATION_REQUIRED" }; }
  }
  return {
    async create(request) {
      if (!enabled || !authorize) return { state: "blocked", code: "NATIVE_WRITER_DISABLED" };
      const intent = captureAlegraWriteAuthorization(request.intent, null).intent;
      let body: NativePurchaseBody;
      try {
        body = freeze(prepareNativeAlegraPurchaseBody(intent, binding));
        if (request.idempotencyKey !== intent.idempotencyKey || !Number.isFinite(Date.parse(now()))) throw new Error("NATIVE_KEY_OR_TIME_INVALID");
        const observedCompany = await company(intent);
        await resources(intent);
        const duplicate = await lookup(intent, request.idempotencyKey);
        if (duplicate.state !== "not_found") throw new Error("NATIVE_DUPLICATE_OR_COVERAGE_BLOCKED");
        if (!await authorize({ intent, body, company: observedCompany })) throw new Error("NATIVE_AUTHORIZATION_DENIED");
        // Atomic admission/early heartbeat alone cannot cover the asynchronous
        // company, resource, and duplicate lookups above. Require a SECOND
        // successful fenced heartbeat at the actual native dispatch boundary.
        // Direct transport.create calls without a gate fail closed.
        let leaseFresh = false;
        try {
          leaseFresh = typeof request.beforeNativePost === "function" &&
            await request.beforeNativePost() === true;
        } catch {
          leaseFresh = false;
        }
        if (!leaseFresh) throw new Error("NATIVE_LEASE_UNAVAILABLE");
      } catch (error) {
        return { state: "blocked", code: error instanceof Error && /^NATIVE_|^FOREIGN_/.test(error.message) ? error.message : "NATIVE_PREFLIGHT_UNAVAILABLE" };
      }
      try {
        // One POST only. HTTP errors/timeouts never trigger retries in this layer.
        const response = await http.request({ method: "POST", path: "/bills", body });
        if (response.status >= 500 || response.status === 408 || response.status === 409) return { state: "ambiguous" };
        if (response.status < 200 || response.status >= 300) return { state: "failed", code: "NATIVE_HTTP_" + response.status, retryable: false };
        try { return { state: "created", nativeId: String(id(object(response.data).id)) }; }
        catch { return { state: "ambiguous" }; }
      } catch { return { state: "ambiguous" }; }
    },
    async findByIdempotencyKey(request) {
      return lookup(captureAlegraWriteAuthorization(request.intent, null).intent, request.idempotencyKey);
    },
    async readback(request): Promise<AlegraReadback> {
      const intent = captureAlegraWriteAuthorization(request.intent, null).intent;
      prepareNativeAlegraPurchaseBody(intent, binding);
      await company(intent);
      const nativeId = String(id(request.nativeId));
      const bill = object(await get("/bills/" + nativeId));
      try {
        const purchases = object(bill.purchases);
        const categories = purchases.categories;
        if (!Array.isArray(categories) || categories.length !== 1 || purchases.items && (!Array.isArray(purchases.items) || purchases.items.length)) throw new Error();
        const category = object(categories[0]), p = intent.payload;
        const taxes = category.tax;
        if (!Array.isArray(taxes) || taxes.length !== (p.purchaseTax ? 1 : 0)) throw new Error();
        if (p.purchaseTax && (id(object(taxes[0]).id) !== id(p.purchaseTax.nativeId) || units(object(taxes[0]).percentage) !== units(p.purchaseTax.percentage))) throw new Error();
        // Never certify the currency of a document from the company's default.
        // Unknown/missing native currency remains an unverified readback.
        const currency = text(object(bill.currency).code);
        if (String(id(bill.id)) !== nativeId || !sameDocument(bill, intent) || text(bill.date) !== p.issueDate ||
            text(bill.dueDate) !== p.dueDate || bill.status !== "open" || units(bill.totalPaid) !== BigInt(0) ||
            units(bill.balance) !== units(bill.total) || currency !== p.currency || id(category.id) !== id(p.accountNativeId) ||
            Number(category.quantity) !== 1 || (category.discount !== undefined && units(category.discount) !== BigInt(0)) ||
            units(category.price) !== units(p.subtotal) || units(bill.total) !== units(p.total) ||
            (bill.payments && (!Array.isArray(bill.payments) || bill.payments.length)) ||
            (bill.retentions && (!Array.isArray(bill.retentions) || bill.retentions.length)) ||
            id(object(bill.costCenter).id) !== id(p.costCenterNativeId)) throw new Error();
        return { nativeId, targetType: "purchase_bill", documentNumber: text(object(bill.numberTemplate).number),
          supplierNativeId: String(id(object(bill.provider).id)), currency, total: formatted(units(bill.total)),
          accountNativeId: String(id(category.id)), costCenterNativeId: String(id(object(bill.costCenter).id)) };
      } catch { throw new Error("NATIVE_READBACK_MISMATCH"); }
    },
  };
}
