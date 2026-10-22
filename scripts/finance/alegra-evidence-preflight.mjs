import { createHash } from 'node:crypto';

/** Pure preflight: creates private source observations, never accounting entries or network calls. */
const SCHEMA_VERSION = 'alegra-sales-observation-v1';
const PROJECTION_KEYS = [
  'schema_version','source_account_key','resource_type','native_id','document_number','issue_date','currency',
  'subtotal','tax','total','total_paid','balance','source_status','cost_center_id','client_native_id',
  'client_is_generic','electronic_numbering','payment_method','payment_native_ids','item_native_ids',
];
const text = (value) => typeof value === 'string' ? value.trim() : typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : '';
function fail(code) { throw new Error(code); }
function money(value) {
  if ((typeof value !== 'string' && typeof value !== 'number') || (typeof value === 'number' && !Number.isFinite(value))) fail('INVALID_MONEY');
  // At |value| >= 2^46, adjacent IEEE-754 doubles are at least 1/64
  // (0.015625) apart, so a numeric source may already have lost a cent.
  // This technical bound does not round money; larger exact values need strings.
  if (typeof value === 'number' && Math.abs(value) >= 2 ** 46) fail('INVALID_MONEY');
  const raw = String(value).trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) fail('INVALID_MONEY');
  const negative = raw.startsWith('-');
  const [whole, fraction = ''] = raw.replace(/^-/, '').split('.');
  const cents = (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))) * (negative ? -1n : 1n);
  // Numeric source values must still have an exact, safe integer cent identity.
  // Decimal strings retain their original precision independently of JS Number.
  if (typeof value === 'number' && (cents > BigInt(Number.MAX_SAFE_INTEGER) || cents < -BigInt(Number.MAX_SAFE_INTEGER))) fail('INVALID_MONEY');
  const absolute = cents < 0n ? -cents : cents;
  return { cents, decimal: `${cents < 0n ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2,'0')}` };
}
function isoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('INVALID_DATE');
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== value) fail('INVALID_DATE');
  return value;
}
function validObservationTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  try { isoDate(value.slice(0,10)); return true; } catch { return false; }
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
function projectionHash(projection) { return createHash('sha256').update(JSON.stringify(stable(projection))).digest('hex'); }
function sourceKey(account, nativeId) { return `account:${encodeURIComponent(account)}:sales_invoice:${encodeURIComponent(nativeId)}`; }
function canonicalText(value) { return typeof value === 'string' && value !== '' && value === value.trim(); }
function optionalText(value) { return value === null || canonicalText(value); }
function canonicalMoney(value) {
  if (typeof value !== 'string') return false;
  try { return money(value).decimal === value; } catch { return false; }
}
function canonicalIds(value) {
  if (!Array.isArray(value) || [...value].some(item => !canonicalText(item)) || new Set(value).size !== value.length) return false;
  const sorted = [...value].sort();
  return value.every((item,index) => item === sorted[index]);
}

function validateObservation(row) {
  const metadata = row?.metadata;
  if (!canonicalText(row?.org_id) || row.source_system !== 'alegra' || row.document_type !== 'alegra_invoice_source_observation' ||
      row.invoice_direction !== 'sale' || !metadata || typeof metadata !== 'object' || Array.isArray(metadata) ||
      PROJECTION_KEYS.some(key => !Object.hasOwn(metadata,key))) fail('INVALID_OBSERVATION');
  const projection = Object.fromEntries(PROJECTION_KEYS.map(key => [key,metadata[key]]));
  if (projection.schema_version !== SCHEMA_VERSION || projection.resource_type !== 'sales_invoice' ||
      !['source_account_key','native_id','document_number','cost_center_id'].every(key => canonicalText(projection[key])) ||
      !['source_status','client_native_id','payment_method'].every(key => optionalText(projection[key])) ||
      (projection.currency !== null && (typeof projection.currency !== 'string' || !/^[A-Z]{3}$/.test(projection.currency))) ||
      !['subtotal','tax','total'].every(key => canonicalMoney(projection[key])) ||
      !['total_paid','balance'].every(key => projection[key] === null || canonicalMoney(projection[key])) ||
      typeof projection.client_is_generic !== 'boolean' ||
      (projection.electronic_numbering !== null && typeof projection.electronic_numbering !== 'boolean') ||
      !canonicalIds(projection.payment_native_ids) || !canonicalIds(projection.item_native_ids) ||
      metadata.projection_sha256 !== projectionHash(projection) ||
      row.source_key !== sourceKey(projection.source_account_key,projection.native_id) ||
      row.document_number !== projection.document_number || row.issue_date !== projection.issue_date ||
      row.currency !== projection.currency || row.amount !== projection.total) fail('INVALID_OBSERVATION');
  try { isoDate(projection.issue_date); } catch { fail('INVALID_OBSERVATION'); }
  const headerValid = money(projection.subtotal).cents + money(projection.tax).cents === money(projection.total).cents;
  const expectedIssues = ['RESERVATION_LINK_UNVERIFIED','BANK_MATCH_UNVERIFIED','FISCAL_ACCEPTANCE_UNVERIFIED'];
  if (!projection.currency) expectedIssues.push('CURRENCY_UNRESOLVED');
  if (!headerValid) expectedIssues.push('HEADER_TOTAL_MISMATCH');
  if (projection.total_paid !== null && projection.balance !== null && money(projection.total_paid).cents + money(projection.balance).cents !== money(projection.total).cents) expectedIssues.push('PAYMENT_BALANCE_MISMATCH');
  if (projection.client_is_generic) expectedIssues.push('GENERIC_CLIENT');
  if (row.status !== 'staging' || row.dropbox_backup_status !== 'pending' ||
      row.verification_status !== (projection.currency ? 'source_observed_unreconciled' : 'source_observed_currency_unresolved') ||
      !validObservationTimestamp(metadata.observed_at) || metadata.header_arithmetic_valid !== headerValid ||
      !Array.isArray(metadata.issues) || metadata.issues.length !== expectedIssues.length ||
      [...metadata.issues].some((issue,index) => issue !== expectedIssues[index]) ||
      metadata.hash_scope !== 'whitelisted_projection_not_original_document' ||
      metadata.bank_match_status !== 'unmatched' || metadata.reservation_match_status !== 'unmatched' ||
      metadata.fiscal_acceptance !== 'unverified' || metadata.write_to_alegra !== false ||
      metadata.eligible_for_ledger_posting !== false || metadata.full_source_document_captured !== false) fail('INVALID_OBSERVATION');
}
export function normalizeAlegraInvoiceEvidence(invoice, context) {
  if (!context || !text(context.orgId) || !text(context.sourceAccountKey) || !text(context.expectedCostCenterId)) fail('INVALID_SCOPE');
  if (context.accountBindingVerified !== true) fail('ACCOUNT_BINDING_REQUIRED');
  if (!validObservationTimestamp(context.observedAt)) fail('INVALID_TIMESTAMP');
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
  const checksum = projectionHash(projection);
  return {
    org_id: text(context.orgId), source_system: 'alegra',
    source_key: sourceKey(text(context.sourceAccountKey),sourceId),
    document_number: projection.document_number, document_type: 'alegra_invoice_source_observation',
    issue_date: issueDate, currency, amount: total.decimal, invoice_direction:'sale',
    verification_status: currency ? 'source_observed_unreconciled' : 'source_observed_currency_unresolved',
    dropbox_backup_status:'pending', status:'staging',
    metadata: {
      ...projection, projection_sha256: checksum, hash_scope:'whitelisted_projection_not_original_document',
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
    validateObservation(row);
    const key = keyOf(row); groups.set(key, [...(groups.get(key) ?? []),row]);
  }
  const result = {insert:[],unchanged:[],conflicts:[]};
  for (const [key, rows] of groups) {
    const current = existing.filter(r => keyOf(r) === key);
    for (const row of current) validateObservation(row);
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
  const required = ['orgId','legalEntityKey','sourceSystem','sourceAccount','sourceId','unit','salesMode','chargeClass'];
  const validDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
  };
  if (required.some(key => !text(source[key])) || !validDate(source.effectiveDate) ||
      !['own','intermediated'].includes(source.salesMode) || !['included','extra'].includes(source.chargeClass)) fail('SERVICE_MAPPING_NOT_APPROVED');
  const matches = mappings.filter(m => m && m.status === 'approved' &&
    required.every(key => text(m[key]) === text(source[key])) &&
    validDate(m.validFrom) && m.validFrom <= source.effectiveDate &&
    (m.validTo === null ? true : validDate(m.validTo) && m.validTo >= source.effectiveDate) &&
    (m.validTo === null || m.validTo >= m.validFrom));
  if (matches.length !== 1) fail('SERVICE_MAPPING_NOT_APPROVED');
  const selected = matches[0];
  const price = text(selected.price);
  if (selected.targetSystem !== 'alegra' || !text(selected.targetAccount) || !text(selected.targetId) ||
      selected.targetLegalEntityKey !== source.legalEntityKey || !text(selected.accountingAccountId) ||
      !text(selected.cabysCode) || selected.cabysVerified !== true ||
      selected.accountingAccountVerified !== true || selected.fiscalApproved !== true || selected.priceApproved !== true ||
      !validDate(selected.priceApprovedAt) || selected.priceApprovedAt > source.effectiveDate ||
      !text(selected.priceEvidenceRef) || !['CRC','USD'].includes(selected.priceCurrency) ||
      !/^\d+(?:\.\d{1,2})?$/.test(price) ||
      (source.chargeClass === 'extra' && !/[1-9]/.test(price)) ||
      (!text(selected.taxNativeId) && !(selected.taxTreatment === 'exempt' && selected.taxExemptionVerified === true)) ||
      (text(selected.taxNativeId) && selected.taxVerified !== true) ||
      !Number.isInteger(selected.version) || selected.version < 1) fail('SERVICE_MAPPING_NOT_APPROVED');
  return {...selected};
}
