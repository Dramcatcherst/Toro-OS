import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTROL_KEYS, evaluateDurableImport, describeMirrorRead } from '../scripts/kross-durable-preflight.mjs';

const context = { orgId: 'org-a', propertyId: 'property-a', now: '2026-10-17T05:00:00Z', allowedDatasets: ['operations.reservations'] };
function valid() { return {
  orgId: 'org-a', propertyId: 'property-a', dataset: 'operations.reservations', authority: 'Kross', pmsWriteCount: 0,
  sourceReference: 'synthetic:test', sourceChecksum: 'a'.repeat(64), sourceAsOf: '2026-10-16T04:00:00Z', observedAt: '2026-10-17T04:00:00Z',
  periodStart: '2020-01-01T00:00:00Z', periodEnd: '2027-12-31T00:00:00Z', expectedRows: 100, receivedRows: 100, expectedBatches: 2, receivedBatches: 2,
  duplicateIdentities: 0, missingIdentities: 0, unresolvedMappings: 0, invalidStayDates: 0, mappingVersion: 'test-v1', unmappedRequiredFields: 0,
  missingCurrencies: 0, invalidDecimalAmounts: 0, missingRequiredDomainFields: 0, unreconciledPaymentLines: 0, currencyTotalMismatches: 0,
  watermarkAfterCommitOnly: true, rejectOlderVersions: true, emailPromotesAuthority: false, prohibitedFieldCount: 0,
  evidence: Object.fromEntries(['coverage','payments','currencyTotals','cancellations','historicalModifications','privacy','scopedAccessNegativeTest','restoreTest','rollback'].map(k => [k, 'synthetic:'+k])),
}; }
const failures = [
  { orgId: 'other' }, { propertyId: 'other' }, { dataset: 'new-shadow-table' }, { pmsWriteCount: 1 },
  { sourceReference: '' }, { sourceChecksum: 'bad' }, { sourceAsOf: '2026-10-18T00:00:00Z' }, { observedAt: 'invalid' },
  { observedAt: '2026-10-15T00:00:00Z' }, { periodEnd: '2010-01-01T00:00:00Z' }, { receivedRows: 99 }, { receivedBatches: 1 },
  { duplicateIdentities: 1 }, { missingIdentities: 1 }, { unresolvedMappings: 1 }, { invalidStayDates: 1 },
  { unmappedRequiredFields: 1 }, { missingCurrencies: 1 }, { invalidDecimalAmounts: 1 }, { missingRequiredDomainFields: 1 },
  { unreconciledPaymentLines: 1 }, { currencyTotalMismatches: 1 }, { removeEvidence: 'cancellations' }, { removeEvidence: 'historicalModifications' },
  { watermarkAfterCommitOnly: false }, { rejectOlderVersions: false }, { emailPromotesAuthority: true }, { prohibitedFieldCount: 1 },
  { removeEvidence: 'scopedAccessNegativeTest' }, { removeEvidence: 'restoreTest' },
];
test('30 unique controls; complete declarations cannot unlock writes/live/runtime', () => {
  assert.equal(new Set(CONTROL_KEYS).size, 30);
  const result = evaluateDurableImport(valid(), context);
  assert.equal(result.status, 'DECLARATIONS_COMPLETE_REVIEW_REQUIRED');
  assert.equal(result.mayWrite, false); assert.equal(result.mayClaimLive, false); assert.equal(result.runtimeVerified, false);
});
failures.forEach((change, index) => test('reject '+CONTROL_KEYS[index], () => {
  const value = valid(); const { removeEvidence, ...patch } = change;
  Object.assign(value, patch); if (removeEvidence) delete value.evidence[removeEvidence];
  assert.ok(evaluateDurableImport(value, context).blockers.includes(CONTROL_KEYS[index]));
}));
test('empty, null, missing context and truthy strings fail closed', () => {
  for (const input of [undefined, null, {}]) assert.equal(evaluateDurableImport(input).status, 'BLOCKED');
  assert.equal(evaluateDurableImport(valid(), {}).status, 'BLOCKED');
  assert.ok(evaluateDurableImport({ ...valid(), watermarkAfterCommitOnly: 'true' }, context).blockers.includes('watermark'));
});
test('zero rows requires source declaration and reconciliation; not zero occupancy', () => {
  const result = evaluateDurableImport({ ...valid(), expectedRows: 0, receivedRows: 0 }, context);
  assert.equal(result.mayClaimLive, false); assert.equal(result.mayWrite, false);
});
test('old snapshot stays readable with timestamp but cannot authorize action', () => {
  const result = describeMirrorRead({ authorized: true, sourceAsOf: '2026-09-21T00:00:00Z', now: context.now });
  assert.equal(result.mayRead, true); assert.equal(result.mayAct, false); assert.equal(result.coverageComplete, false);
  assert.ok(result.ageSeconds > 86400);
});
test('denied/unknown/future/timezone-less context cannot claim current state', () => {
  assert.equal(describeMirrorRead({ authorized: 'true' }).mayRead, false);
  for (const sourceAsOf of [null, 'invalid', '2026-10-18T00:00:00Z', '2026-10-16T04:00:00']) {
    const result = describeMirrorRead({ authorized: true, sourceAsOf, now: context.now });
    assert.equal(result.state, 'UNKNOWN_SOURCE_TIME'); assert.equal(result.mayAct, false);
  }
});
