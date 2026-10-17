// Pure preflight for the existing Kross mirror. No transport, writes or secrets.
// Evidence declarations must be independently checked by the governed importer.
export const CONTROL_KEYS = ["scope_org","scope_property","dataset_mapping","authority","source_reference","source_checksum","source_time","observed_time","time_order","period","row_count","batches","duplicates","identity","room_mapping","stay_dates","field_mapping","currency","amounts","details","payment_lines","currency_totals","cancellations","modifications","watermark","ordering","email","privacy","access","recovery"];

const text = (v) => typeof v === 'string' && v.trim().length > 0;
const count = (v) => Number.isSafeInteger(v) && v >= 0;
const time = (v) => typeof v === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(v) && Number.isFinite(Date.parse(v));
export function evaluateDurableImport(input = {}, context = {}) {
  const i = input ?? {};
  const now = Date.parse(context.now);
  const source = Date.parse(i.sourceAsOf);
  const observed = Date.parse(i.observedAt);
  const evidence = (key) => text(i.evidence?.[key]);
  const checks = [
    text(context.orgId) && i.orgId === context.orgId,
    text(context.propertyId) && i.propertyId === context.propertyId,
    text(i.dataset) && Array.isArray(context.allowedDatasets) && context.allowedDatasets.includes(i.dataset),
    i.authority === 'Kross' && i.pmsWriteCount === 0,
    text(i.sourceReference),
    typeof i.sourceChecksum === 'string' && /^[a-f0-9]{64}$/.test(i.sourceChecksum),
    time(i.sourceAsOf) && Number.isFinite(now) && source <= now,
    time(i.observedAt) && Number.isFinite(now) && observed <= now,
    source <= observed,
    time(i.periodStart) && time(i.periodEnd) && Date.parse(i.periodStart) <= Date.parse(i.periodEnd),
    count(i.expectedRows) && count(i.receivedRows) && i.expectedRows === i.receivedRows,
    Number.isSafeInteger(i.expectedBatches) && i.expectedBatches > 0 && i.receivedBatches === i.expectedBatches,
    i.duplicateIdentities === 0,
    i.missingIdentities === 0,
    i.unresolvedMappings === 0,
    i.invalidStayDates === 0,
    text(i.mappingVersion) && i.unmappedRequiredFields === 0,
    i.missingCurrencies === 0,
    i.invalidDecimalAmounts === 0,
    i.missingRequiredDomainFields === 0 && evidence('coverage'),
    i.unreconciledPaymentLines === 0 && evidence('payments'),
    i.currencyTotalMismatches === 0 && evidence('currencyTotals'),
    evidence('cancellations'),
    evidence('historicalModifications'),
    i.watermarkAfterCommitOnly === true,
    i.rejectOlderVersions === true,
    i.emailPromotesAuthority === false,
    i.prohibitedFieldCount === 0 && evidence('privacy'),
    evidence('scopedAccessNegativeTest'),
    evidence('restoreTest') && evidence('rollback'),
  ].map((passed, index) => ({ key: CONTROL_KEYS[index], passed: passed === true }));
  return {
    status: checks.every(c => c.passed) ? 'DECLARATIONS_COMPLETE_REVIEW_REQUIRED' : 'BLOCKED',
    checks,
    blockers: checks.filter(c => !c.passed).map(c => c.key),
    // This evaluator cannot confer authorization or verify external evidence.
    mayWrite: false,
    mayClaimLive: false,
    runtimeVerified: false,
  };
}

// Offline history is readable under existing authorization even when stale.
// It never establishes current availability, final balance or write authority.
export function describeMirrorRead({ authorized, sourceAsOf, now, coverageComplete } = {}) {
  if (authorized !== true) return { state: 'DENIED', mayRead: false, mayAct: false };
  if (!time(sourceAsOf) || !time(now) || Date.parse(sourceAsOf) > Date.parse(now)) {
    return { state: 'UNKNOWN_SOURCE_TIME', mayRead: true, mayAct: false, coverageComplete: false };
  }
  return { state: 'SNAPSHOT_ONLY', mayRead: true, mayAct: false,
    sourceAsOf, ageSeconds: (Date.parse(now) - Date.parse(sourceAsOf)) / 1000,
    coverageComplete: coverageComplete === true };
}
