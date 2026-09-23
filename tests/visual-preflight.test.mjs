import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateVisualPreflight } from '../src/lib/visual-preflight.ts';

// SYNTHETIC fixtures. No production identity, grant, rights or source assertion.
const now = Date.parse('2026-09-22T18:00:00Z');
function sample() {
  return {
    request: {assetKey: 'test-asset', scopeId: 'test-scope', channel: 'website', transforms: ['resize', 'compress']},
    evidence: {
      scopeId: 'test-scope', assetKey: 'test-asset', actorId: 'test-actor',
      basePolicy: {allowed: true, approval: 'Human review', reason: 'Synthetic preparation only'},
      grant: {action: 'prepare_visual', scopeId: 'test-scope', assetKey: 'test-asset', actorId: 'test-actor', checkedAt: '2026-09-22T17:00:00Z', expiresAt: '2026-09-22T19:00:00Z'},
      source: {kind: 'original', resolved: true, revision: 'test-rev', expectedSha256: 'a'.repeat(64), observedSha256: 'a'.repeat(64)},
      identityVerified: true, currentAppearance: 'verified',
      rights: {status: 'cleared', evidenceRef: 'test-rights'},
      privacy: {status: 'cleared', evidenceRef: 'test-privacy'},
      channelPolicy: {channel: 'website', reference: 'test-policy', reviewedAt: '2026-09-22T17:00:00Z', expiresAt: '2026-09-22T19:00:00Z', allowedTransforms: ['resize', 'compress', 'exposure', 'crop']},
      budget: {remainingCents: 50, estimatedCents: 10, remainingSteps: 2}
    }
  };
}
function run(change = () => {}) { const s = sample(); change(s); return evaluateVisualPreflight(s.request, s.evidence, now); }
function blocked(change, reason) {
  const result = run(change);
  assert.equal(result.allowed, false);
  assert.equal(result.status, 'blocked');
  assert.ok(result.reasons.includes(reason), JSON.stringify(result));
  assert.equal(result.publishAllowed, false);
  assert.equal(result.executionAllowed, false);
  assert.equal(result.externalWrite, false);
}

test('valid metadata prepares a human-review draft only', () => {
  const r = run();
  assert.equal(r.allowed, true);
  assert.equal(r.status, 'draft_ready_for_review');
  assert.equal(r.approval, 'Human review');
  assert.deepEqual(r.reasons, []);
  assert.equal(r.publishAllowed, false);
  assert.equal(r.executionAllowed, false);
  assert.equal(r.externalWrite, false);
});
test('missing original is blocked', () => blocked(s => {s.evidence.source.resolved = false;}, 'source_unresolved'));
test('string true does not resolve source', () => blocked(s => {s.evidence.source.resolved = 'true';}, 'source_unresolved'));
test('published derivative cannot substitute for original', () => blocked(s => {s.evidence.source.kind = 'published_derivative';}, 'source_not_original'));
test('hash mismatch is blocked', () => blocked(s => {s.evidence.source.observedSha256 = 'b'.repeat(64);}, 'source_hash_mismatch'));
test('empty/invalid hashes are not proof', () => blocked(s => {s.evidence.source.expectedSha256 = ''; s.evidence.source.observedSha256 = '';}, 'source_hash_mismatch'));
test('matching uppercase hash is normalized', () => assert.equal(run(s => {s.evidence.source.expectedSha256 = 'A'.repeat(64);}).allowed, true));
test('source revision is required', () => blocked(s => {delete s.evidence.source.revision;}, 'source_revision_missing'));
test('wrong scope is blocked', () => blocked(s => {s.request.scopeId = 'other-scope';}, 'scope_mismatch'));
test('wrong asset is blocked', () => blocked(s => {s.request.assetKey = 'other-asset';}, 'asset_mismatch'));
test('no inherited grant is fabricated', () => blocked(s => {delete s.evidence.grant;}, 'authorization_required'));
test('grant for another asset is denied', () => blocked(s => {s.evidence.grant.assetKey = 'other-asset';}, 'authorization_required'));
test('grant for another actor is denied', () => blocked(s => {s.evidence.grant.actorId = 'other-actor';}, 'authorization_required'));
test('expired authorization is blocked', () => blocked(s => {s.evidence.grant.expiresAt = '2026-09-22T17:59:59Z';}, 'authorization_stale'));
test('future authorization is blocked', () => blocked(s => {s.evidence.grant.checkedAt = '2026-09-22T18:00:01Z';}, 'authorization_stale'));
test('identity unknown is blocked', () => blocked(s => {s.evidence.identityVerified = false;}, 'identity_unverified'));
test('pending rights are blocked', () => blocked(s => {s.evidence.rights.status = 'pending';}, 'rights_unverified'));
test('privacy needs evidence, not only a flag', () => blocked(s => {delete s.evidence.privacy.evidenceRef;}, 'privacy_unverified'));
test('unknown appearance is not approved', () => blocked(s => {s.evidence.currentAppearance = 'unknown';}, 'appearance_unverified'));
test('physical issue routes to operations, not digital concealment', () => {
 const r = run(s => {s.evidence.currentAppearance = 'physical_issue';});
 assert.equal(r.allowed, false); assert.ok(r.reasons.includes('physical_issue'));
 assert.equal(r.nextOwner, 'TORO Operations');
});
for (const transform of ['remove_cable', 'hide_defect', 'sky_replacement', 'regenerate_room', 'invent_window', 'unknown']) {
 test(`truth floor blocks ${transform} even when a channel allowlist contains it`, () => blocked(s => {s.request.transforms = [transform]; s.evidence.channelPolicy.allowedTransforms.push(transform);}, 'forbidden_transform'));
}
test('channel approval is not transferable', () => blocked(s => {s.request.channel = 'google_hotel_center';}, 'channel_not_approved'));
test('stale channel policy is blocked', () => blocked(s => {s.evidence.channelPolicy.expiresAt = '2026-09-22T18:00:00Z';}, 'policy_stale'));
test('future channel policy is blocked', () => blocked(s => {s.evidence.channelPolicy.reviewedAt = '2026-09-22T18:01:00Z';}, 'policy_stale'));
test('channel policy reference required', () => blocked(s => {s.evidence.channelPolicy.reference = '';}, 'policy_unverified'));
test('otherwise conservative transform still requires channel approval', () => blocked(s => {s.request.transforms = ['natural_color'];}, 'transform_not_approved'));
test('empty transform recipe is invalid', () => blocked(s => {s.request.transforms = [];}, 'invalid_request'));
test('oversized recipes are rejected', () => blocked(s => {s.request.transforms = Array(21).fill('resize');}, 'invalid_request'));
test('budget excess is blocked', () => blocked(s => {s.evidence.budget.estimatedCents = 51;}, 'budget_unavailable'));
test('negative cost is rejected', () => blocked(s => {s.evidence.budget.estimatedCents = -1;}, 'budget_unavailable'));
test('infinite budget is rejected', () => blocked(s => {s.evidence.budget.remainingCents = Infinity;}, 'budget_unavailable'));
test('exhausted step budget is blocked', () => blocked(s => {s.evidence.budget.remainingSteps = 0;}, 'budget_unavailable'));
test('blocked base policy cannot be overridden', () => blocked(s => {s.evidence.basePolicy.allowed = false;}, 'base_policy_blocked'));
test('Blocked approval cannot be overridden', () => blocked(s => {s.evidence.basePolicy.approval = 'Blocked';}, 'base_policy_blocked'));
test('owner approval never permits execution/publication', () => {
 const r = run(s => {s.evidence.basePolicy.approval = 'Owner approval';});
 assert.equal(r.allowed, true); assert.equal(r.approval, 'Owner approval');
 assert.equal(r.executionAllowed, false); assert.equal(r.publishAllowed, false);
});
test('missing base policy fails closed', () => blocked(s => {delete s.evidence.basePolicy;}, 'base_policy_blocked'));
test('malformed values fail closed without crashing', () => {
 for (const v of [null, undefined, '', 7, [], true, {}]) {
  const r = evaluateVisualPreflight(v, v, now); assert.equal(r.allowed, false); assert.equal(r.publishAllowed, false);
 }
});
test('bad clock fails closed', () => {
 const s = sample(); assert.equal(evaluateVisualPreflight(s.request, s.evidence, NaN).allowed, false);
});
test('no input object is mutated', () => {
 const s = sample(); const before = JSON.stringify(s); evaluateVisualPreflight(s.request, s.evidence, now); assert.equal(JSON.stringify(s), before);
});
