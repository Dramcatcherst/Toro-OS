import { createHash } from 'node:crypto';

/** Pure preflight: creates private source observations, never accounting entries or network calls. */
const SCHEMA_VERSION = 'alegra-sales-observation-v1';
const text = (value) => typeof value === 'string' ? value.trim() : typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : '';
function fail(code) { throw new Error(code); }
function money(value) {
  if ((typeof value !== 'string' && typeof value !== 'number') || (typeof value === 'number' && !Number.isFinite(value))) fail('INVALID_MONEY');
  const raw = String(value).trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) fail('INVALID_MONEY');
  const negative = raw.startsWith('-');
  const [whole, fraction = ''] = raw.replace(/^-/, '').split('.');
  const cents = (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))) * (negative ? -1n : 1n);
  const absolute = cents < 0n ? -cents : cents;
  return { cents, decimal: `${cents < 0n ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2,'0')}` };
}
function isoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('INVALID_DATE');
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== value) fail('INVALID_DATE');
  return value;
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
export function normalizeAlegraInvoiceEvidence(invoice, context) {
  if (!context || !text(context.orgId) || !text(context.sourceAccountKey) || !text(context.expectedCostCenterId)) fail('INVALID_SCOPE');
  if (context.accountBindingVerified !== true) fail('ACCOUNT_BINDING_REQUIRED');
  if (typeof context.observedAt !== 'string' || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(context.observedAt) || !Number.isFinite(Date.parse(context.observedAt))) fail('INVALID_TIMESTAMP');
  if (!invoice || typeof invoice !== 'object' || !text(invoice.id)) fail('INVALID_SOURCE_ID');
  const sourceId = text(invoice.id);
  if (text(invoice.costCenter?.id) !== text(context.expectedCostCenterId)) fail('COST_CENTER_MISMATCH');
  const issueDate = isoDate(invoice.date);
  const subtotal = money(invoice.subtotal), tax = money(invoice.tax), total = money(invoice.total);
  const paid = invoice.totalPaid == null ? null : money(invoice.totalPaid);
  const balance = invoice.balance == null ? null : money(invoice.balance);
  const currency = invoice.currency == null ? null : text(invoice.currency.code);
  if (currency !== null && !/^[A-Z]{3}$/.test(currency)) fail('INVALID_CURRENCY');
  const issues = ['RESERVATION_LINK_UNVERIFIED','BANK_MATCH_UNVERIFIED','FISCAL_ACCEPTANCE_UNVERIFIED'];
  if (!currency) issues.push('CURRENCY_UNRESOLVED');
  const headerValid = subtotal.cents + tax.cents === total.cents;
  if (!headerValid) issues.push('HEADER_TOTAL_MISMATCH');
  if (paid && balance && paid.cents + balance.cents !== total.cents) issues.push('PAYMENT_BALANCE_MISMATCH');
  const clientName = text(invoice.client?.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const genericClient = ['huesped','guest','consumidor final'].includes(clientName);
  if (genericClient) issues.push('GENERIC_CLIENT');
  // Only whitelisted observations; names, emails, addresses, notes and credentials never pass through.
  const projection = {
    schema_version: SCHEMA_VERSION,
    source_account_key: text(context.sourceAccountKey),
    resource_type: 'sales_invoice',
    native_id: sourceId,
    document_number: text(invoice.numberTemplate?.fullNumber) || sourceId,
    issue_date: issueDate,
    currency,
    subtotal: subtotal.decimal, tax: tax.decimal, total: total.decimal,
    total_paid: paid?.decimal ?? null, balance: balance?.decimal ?? null,
    source_status: text(invoice.status) || null,
    cost_center_id: text(invoice.costCenter.id),
    client_native_id: text(invoice.client?.id) || null,
    client_is_generic: genericClient,
    electronic_numbering: typeof invoice.numberTemplate?.isElectronic === 'boolean' ? invoice.numberTemplate.isElectronic : null,
    payment_method: text(invoice.paymentMethod) || null,
    payment_native_ids: [...new Set((Array.isArray(invoice.payments) ? invoice.payments : []).map(p => text(p?.id)).filter(Boolean))].sort(),
    item_native_ids: [...new Set((Array.isArray(invoice.items) ? invoice.items : []).map(p => text(p?.id)).filter(Boolean))].sort(),
  };
  const projectionHash = createHash('sha256').update(JSON.stringify(stable(projection))).digest('hex');
  return {
    org_id: text(context.orgId), source_system: 'alegra',
    source_key: `account:${encodeURIComponent(text(context.sourceAccountKey))}:sales_invoice:${encodeURIComponent(sourceId)}`,
    document_number: projection.document_number, document_type: 'alegra_invoice_source_observation',
    issue_date: issueDate, currency, amount: total.decimal, invoice_direction:'sale',
    verification_status: currency ? 'source_observed_unreconciled' : 'source_observed_currency_unresolved',
    dropbox_backup_status:'pending', status:'staging',
    metadata: {
      ...projection, projection_sha256: projectionHash, hash_scope:'whitelisted_projection_not_original_document',
      observed_at:context.observedAt, header_arithmetic_valid:headerValid, issues,
      bank_match_status:'unmatched', reservation_match_status:'unmatched', fiscal_acceptance:'unverified',
      write_to_alegra:false, eligible_for_ledger_posting:false, full_source_document_captured:false,
    },
  };
}

/** Immutable plan: known keys are skipped or quarantined, never silently overwritten/deleted. */
export function planEvidenceImport(incoming, existing) {
  if (!Array.isArray(incoming) || !Array.isArray(existing)) fail('INVALID_BATCH');
  const keyOf = r => JSON.stringify([r.org_id,r.source_system,r.source_key]);
  const hashOf = r => r.metadata?.projection_sha256;
  const groups = new Map();
  for (const row of incoming) {
    if (!row?.org_id || !row?.source_system || !row?.source_key || !/^[a-f0-9]{64}$/.test(hashOf(row) ?? '')) fail('INVALID_OBSERVATION');
    const key = keyOf(row); groups.set(key, [...(groups.get(key) ?? []),row]);
  }
  const result = {insert:[],unchanged:[],conflicts:[]};
  for (const [key, rows] of groups) {
    const current = existing.filter(r => keyOf(r) === key);
    const revisions = new Set([...rows,...current].map(hashOf));
    if (revisions.size !== 1 || current.length > 1 || revisions.has(undefined)) {
      result.conflicts.push({key,reason:'SOURCE_REVISION_CONFLICT'});
    } else if (current.length) result.unchanged.push(rows[0]);
    else result.insert.push(rows[0]);
  }
  return result;
}

/** A mapping is a routing candidate, not approval to emit an invoice or move money. */
export function resolveServiceMapping(source, mappings) {
  if (!source || !Array.isArray(mappings)) fail('SERVICE_MAPPING_NOT_APPROVED');
  const matches = mappings.filter(m => m.sourceSystem === source.sourceSystem && m.sourceAccount === source.sourceAccount && m.sourceId === source.sourceId && m.status === 'approved');
  if (matches.length !== 1 || !matches[0].targetSystem || !matches[0].targetAccount || !matches[0].targetId || !Number.isInteger(matches[0].version) || matches[0].version < 1) fail('SERVICE_MAPPING_NOT_APPROVED');
  return {...matches[0]};
}
