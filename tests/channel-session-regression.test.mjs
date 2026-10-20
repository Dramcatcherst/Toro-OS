import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = process.env.TORO_SESSION_SOURCE || '../src/features/comms/channel-session.ts';
const compiled = ts.transpileModule(readFileSync(new URL(source, import.meta.url), 'utf8'), {
  fileName: 'channel-session.ts',
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.filter((entry) => entry.category === ts.DiagnosticCategory.Error).length ?? 0, 0);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`;
const { validateChannelSessionDraft, canResumeChannelSession, deriveChannelLocatorHash, buildChannelReceiptDraft } = await import(moduleUrl);

// All identifiers and input data below are synthetic; no provider or database is contacted.
const actor = Object.freeze({ orgId: '11111111-1111-4111-8111-111111111111', userId: '22222222-2222-4222-8222-222222222222', employeeId: '33333333-3333-4333-8333-333333333333', identityId: '44444444-4444-4444-8444-444444444444' });
const bindingId = '55555555-5555-4555-8555-555555555555';
const sessionId = '66666666-6666-4666-8666-666666666666';
const otherId = '77777777-7777-4777-8777-777777777777';
const now = '2026-10-20T12:00:00.000Z';
const draft = () => ({ ...actor, bindingId, conversationHash: 'a'.repeat(64), activeScope: 'work_org', humanLayerVersion: '2026.10.20', humanLayerHash: 'b'.repeat(64), expiresAt: '2026-10-21T12:00:00.000Z' });
const session = () => ({ ...draft(), id: sessionId, status: 'active', revokedAt: null });
const receiptInput = () => ({ sessionId, bindingId, orgId: actor.orgId, direction: 'inbound', eventKind: 'message', externalMessageId: 'synthetic-provider-event-1', secret: 'synthetic-only-not-a-real-secret-00000000', canonicalObjectType: 'operations.task', canonicalObjectKey: 'synthetic-task-1' });

test('valid session retains the exact declared contract fields', () => {
  const input = draft();
  const r = validateChannelSessionDraft(input);
  assert.equal(r.ok, true); assert.deepEqual(r.value, input);
});
test('validated session does not carry extra payload or nested data', () => {
  const clean = draft();
  const r = validateChannelSessionDraft({ ...clean, providerPayload: { note: 'synthetic-private-text', nested: { sample: 1 } }, chatId: 'synthetic-chat', token: 'synthetic-placeholder' });
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.value).sort(), Object.keys(clean).sort());
  assert.deepEqual(r.value, clean);
});
test('validation output cannot be changed by later mutation of input', () => {
  const input = draft(); const r = validateChannelSessionDraft(input);
  assert.equal(r.ok, true);
  input.orgId = otherId; input.providerPayload = { note: 'added-later' };
  assert.equal(r.value.orgId, actor.orgId);
  assert.equal('providerPayload' in r.value, false);
});
test('null employee identity remains supported when the contract permits it', () => {
  const r = validateChannelSessionDraft({ ...draft(), employeeId: null });
  assert.equal(r.ok, true); assert.equal(r.value.employeeId, null);
});
test('unknown direction is rejected at runtime', () => {
  assert.throws(() => buildChannelReceiptDraft({ ...receiptInput(), direction: 'sideways' }), /direction|event/i);
});
test('missing direction is rejected at runtime', () => {
  const input = receiptInput(); delete input.direction;
  assert.throws(() => buildChannelReceiptDraft(input), /direction|event/i);
});
test('null direction is rejected at runtime', () => {
  assert.throws(() => buildChannelReceiptDraft({ ...receiptInput(), direction: null }), /direction|event/i);
});
test('unknown event kind is rejected at runtime', () => {
  assert.throws(() => buildChannelReceiptDraft({ ...receiptInput(), eventKind: 'payment_approved' }), /direction|event/i);
});
test('missing event kind is rejected at runtime', () => {
  const input = receiptInput(); delete input.eventKind;
  assert.throws(() => buildChannelReceiptDraft(input), /direction|event/i);
});
test('null event kind is rejected at runtime', () => {
  assert.throws(() => buildChannelReceiptDraft({ ...receiptInput(), eventKind: null }), /direction|event/i);
});
test('all twelve allowed direction/event combinations remain accepted', () => {
  for (const direction of ['inbound', 'outbound']) for (const eventKind of ['message', 'ack', 'action', 'result', 'error', 'reminder']) {
    const r = buildChannelReceiptDraft({ ...receiptInput(), direction, eventKind });
    assert.equal(r.direction, direction); assert.equal(r.eventKind, eventKind);
  }
});
test('locator hashes remain deterministic and namespace-bound', () => {
  const input = { channel: 'whatsapp', connectionKey: 'synthetic-channel', locator: 'synthetic-chat', secret: receiptInput().secret };
  const h = deriveChannelLocatorHash(input);
  assert.match(h, /^[a-f0-9]{64}$/); assert.equal(h, deriveChannelLocatorHash(input));
  assert.notEqual(h, deriveChannelLocatorHash({ ...input, connectionKey: 'synthetic-other' }));
  assert.notEqual(h, deriveChannelLocatorHash({ ...input, channel: 'other' }));
});
test('repeat message yields the same receipt idempotency hash', () => {
  assert.equal(buildChannelReceiptDraft(receiptInput()).idempotencyHash, buildChannelReceiptDraft(receiptInput()).idempotencyHash);
});
test('different message yields a different receipt idempotency hash', () => {
  assert.notEqual(buildChannelReceiptDraft(receiptInput()).idempotencyHash, buildChannelReceiptDraft({ ...receiptInput(), externalMessageId: 'synthetic-provider-event-2' }).idempotencyHash);
});
test('receipt output excludes original event identifier and secret', () => {
  const input = receiptInput(); const text = JSON.stringify(buildChannelReceiptDraft(input));
  assert.equal(text.includes(input.secret), false); assert.equal(text.includes(input.externalMessageId), false);
});
test('incomplete canonical object reference is rejected', () => {
  assert.throws(() => buildChannelReceiptDraft({ ...receiptInput(), canonicalObjectKey: null }), /supplied together/);
});
test('same actor resumes an active unexpired session', () => {
  assert.equal(canResumeChannelSession(session(), actor, now), true);
});
for (const field of ['orgId', 'userId', 'employeeId', 'identityId']) {
  test(`different ${field} cannot resume the session`, () => {
    assert.equal(canResumeChannelSession(session(), { ...actor, [field]: otherId }, now), false);
  });
}
test('expired session is denied at the exact expiry boundary', () => {
  assert.equal(canResumeChannelSession({ ...session(), expiresAt: now }, actor, now), false);
});
test('revoked session is denied', () => {
  assert.equal(canResumeChannelSession({ ...session(), revokedAt: now }, actor, now), false);
});
test('closed session is denied', () => {
  assert.equal(canResumeChannelSession({ ...session(), status: 'closed' }, actor, now), false);
});
test('personal scope is not converted to organization scope', () => {
  assert.equal(canResumeChannelSession({ ...session(), activeScope: 'personal' }, actor, now), false);
});
test('invalid date is denied', () => {
  assert.equal(canResumeChannelSession({ ...session(), expiresAt: 'invalid' }, actor, now), false);
});
test('unknown actor identifiers are denied', () => {
  assert.equal(canResumeChannelSession(session(), { ...actor, userId: 'unknown' }, now), false);
});
test('short hashing secret is rejected', () => {
  assert.throws(() => deriveChannelLocatorHash({ channel: 'whatsapp', connectionKey: 'synthetic-channel', locator: 'synthetic-chat', secret: 'short' }), /Invalid channel/);
});
test('invalid session draft and raw conversation locator are rejected', () => {
  assert.equal(validateChannelSessionDraft(null).ok, false);
  assert.equal(validateChannelSessionDraft({ ...draft(), conversationHash: 'synthetic-raw-chat' }).ok, false);
});
