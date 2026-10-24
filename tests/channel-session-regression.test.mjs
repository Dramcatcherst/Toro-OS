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


// Experience continuation is an internal read/resume preflight, not a booking endpoint.
const extension = await import(moduleUrl);
const validateContinuation = (value) => {
  assert.equal(typeof extension.validateExperienceContinuationState, 'function', 'continuation validator must exist');
  return extension.validateExperienceContinuationState(value);
};
const prepareResume = (value) => {
  assert.equal(typeof extension.prepareExperienceContinuationResume, 'function', 'resume preflight must exist');
  return extension.prepareExperienceContinuationResume(value);
};
const requestId = '88888888-8888-4888-8888-888888888888';
const quoteId = '99999999-9999-4999-8999-999999999999';
const continuation = () => ({schemaVersion:1, workflow:'experience_request',requestId,requestVersion:'c'.repeat(64),quoteId,quoteVersion:'d'.repeat(64)});
const resumeInput = () => ({
  session:session(), actor:{...actor}, nowIso:now,
  trustedAccess:{channelKind:'direct',identityVerified:true,membershipActive:true,canReadRequest:true,bindingId,conversationHash:'a'.repeat(64)},
  sourceHealthy:true, sourceFresh:true,
  request:{id:requestId,orgId:actor.orgId,version:'c'.repeat(64),status:'open',quote:{id:quoteId,version:'d'.repeat(64),expiresAt:'2026-10-20T13:00:00.000Z'}},
  continuation:continuation(),
});

test('experience continuation keeps exactly six primitive references',()=>{
  const value=continuation(), result=validateContinuation(value);
  assert.equal(result.ok,true); assert.deepEqual(result.value,value); assert.notEqual(result.value,value);
  value.requestId=otherId; assert.equal(result.value.requestId,requestId);
});
test('experience continuation accepts a request without a quote',()=>{
  assert.equal(validateContinuation({...continuation(),quoteId:null,quoteVersion:null}).ok,true);
});
for(const field of ['messageBody','phone','token','price','supplierConfirmation','bookingConfirmed','paymentConfirmed']){
  test(`experience continuation refuses private or commercial field ${field}`,()=>{
    const result=validateContinuation({...continuation(),[field]:'synthetic-sensitive-value'});
    assert.equal(result.ok,false); assert.equal(JSON.stringify(result).includes('synthetic-sensitive-value'),false);
  });
}
for(const field of Object.keys(continuation())){
  test(`experience continuation requires explicit ${field}`,()=>{
    const value=continuation();delete value[field];assert.equal(validateContinuation(value).ok,false);
  });
}
for(const [name,value] of [['null',null],['array',[]],['text','message'],['date',new Date()],['unknown-version',{...continuation(),schemaVersion:2}],['raw-reference',{...continuation(),requestId:'person@example.invalid'}],['wrong-hash',{...continuation(),requestVersion:'old'}],['quote-pair',{...continuation(),quoteVersion:null}],['wrong-workflow',{...continuation(),workflow:'paid'}]]){
  test(`experience continuation rejects ${name}`,()=>assert.equal(validateContinuation(value).ok,false));
}
test('experience continuation rejects accessors without executing them',()=>{
  let accessed=false;const value=continuation();Object.defineProperty(value,'requestId',{enumerable:true,get(){accessed=true;return requestId;}});
  assert.equal(validateContinuation(value).ok,false);assert.equal(accessed,false);
});
test('experience continuation rejects inherited properties and symbol fields',()=>{
  assert.equal(validateContinuation(Object.create(continuation())).ok,false);
  assert.equal(validateContinuation({...continuation(),[Symbol('hidden')]:true}).ok,false);
});
test('verified exact session resumes without authorizing a booking or payment',()=>{
  const result=prepareResume(resumeInput());
  assert.equal(result.status,'READY_TO_RESUME');assert.deepEqual(result.continuation,continuation());
  assert.equal(result.bookingAuthorized,false);assert.equal(result.paymentAuthorized,false);assert.equal(result.requiresCommercialRevalidation,true);
});
for(const [name,value] of [['group',{channelKind:'group'}],['unknown-channel',{channelKind:'unknown'}],['unverified',{identityVerified:false}],['inactive',{membershipActive:false}],['permission',{canReadRequest:false}],['truthy-permission',{canReadRequest:'true'}],['binding',{bindingId:otherId}],['conversation',{conversationHash:'f'.repeat(64)}]]){
  test(`experience resume denies ${name} before returning request data`,()=>{
    const input=resumeInput();input.trustedAccess={...input.trustedAccess,...value};
    assert.deepEqual(prepareResume(input),{status:'DENIED'});
  });
}
for(const field of ['orgId','userId','employeeId','identityId']){
  test(`experience resume denies a different actor ${field}`,()=>{
    const input=resumeInput();input.actor[field]=otherId;assert.deepEqual(prepareResume(input),{status:'DENIED'});
  });
}
test('experience resume denies expired and revoked sessions',()=>{
  for(const patch of [{expiresAt:now},{status:'revoked',revokedAt:now},{activeScope:'personal'}]){
    const input=resumeInput();Object.assign(input.session,patch);assert.deepEqual(prepareResume(input),{status:'DENIED'});
  }
});
test('experience resume denies request of another organization or reference',()=>{
  for(const patch of [{orgId:otherId},{id:otherId}]){
    const input=resumeInput();Object.assign(input.request,patch);assert.deepEqual(prepareResume(input),{status:'DENIED'});
  }
});
test('experience resume refuses missing server authorization',()=>{
  const input=resumeInput();delete input.trustedAccess;assert.deepEqual(prepareResume(input),{status:'DENIED'});
});
test('experience resume fails closed without a readable source',()=>{
  const input=resumeInput();input.sourceHealthy=false;assert.deepEqual(prepareResume(input),{status:'UNAVAILABLE'});
  delete input.sourceHealthy;assert.deepEqual(prepareResume(input),{status:'UNAVAILABLE'});
});
test('experience resume refuses stale or unknown freshness',()=>{
  const input=resumeInput();input.sourceFresh=false;assert.deepEqual(prepareResume(input),{status:'STALE'});
  delete input.sourceFresh;assert.deepEqual(prepareResume(input),{status:'STALE'});
});
test('experience resume rejects invalid continuation after authorization',()=>{
  const input=resumeInput();input.continuation.price=100;assert.deepEqual(prepareResume(input),{status:'INVALID_CONTINUATION'});
});
test('experience resume requests refresh when current request changed',()=>{
  const input=resumeInput();input.request.version='e'.repeat(64);assert.deepEqual(prepareResume(input),{status:'REFRESH_REQUIRED'});
});
for(const patch of [{id:otherId},{version:'e'.repeat(64)},{expiresAt:now},{expiresAt:'2026-10-19T12:00:00.000Z'}]){
  test(`experience resume refuses replaced or expired quote ${JSON.stringify(patch)}`,()=>{
    const input=resumeInput();Object.assign(input.request.quote,patch);assert.deepEqual(prepareResume(input),{status:'REQUOTE_REQUIRED'});
  });
}
test('experience resume requires a new quote when removed or newly added',()=>{
  const input=resumeInput();input.request.quote=null;assert.deepEqual(prepareResume(input),{status:'REQUOTE_REQUIRED'});
  const other=resumeInput();other.continuation.quoteId=null;other.continuation.quoteVersion=null;assert.deepEqual(prepareResume(other),{status:'REQUOTE_REQUIRED'});
});
test('experience request without quote can resume but cannot confirm a sale',()=>{
  const input=resumeInput();input.request.quote=null;input.continuation.quoteId=null;input.continuation.quoteVersion=null;
  const result=prepareResume(input);assert.equal(result.status,'READY_TO_RESUME');assert.equal(result.bookingAuthorized,false);assert.equal(result.paymentAuthorized,false);
});
for(const status of ['cancelled','closed'])test(`experience resume preserves ${status}`,()=>{
  const input=resumeInput();input.request.status=status;assert.deepEqual(prepareResume(input),{status:'CLOSED'});
});
for(const expiresAt of ['invalid','2026-10-20T13:00:00','2026-02-30T13:00:00Z',null])test(`experience resume refuses ambiguous or invalid quote time ${expiresAt}`,()=>{
  const input=resumeInput();input.request.quote.expiresAt=expiresAt;assert.deepEqual(prepareResume(input),{status:'UNAVAILABLE'});
});
test('experience resume accepts explicit offset and compares the instant',()=>{
  const input=resumeInput();input.request.quote.expiresAt='2026-10-20T07:00:00-06:00';assert.equal(prepareResume(input).status,'READY_TO_RESUME');
});
test('experience resume denies malformed context clock',()=>{
  const input=resumeInput();input.nowIso='2026-10-20T12:00:00';assert.deepEqual(prepareResume(input),{status:'DENIED'});
});
test('experience resume does not disclose injected source data or mutate its input',()=>{
  const input=resumeInput();input.request.internalNotes='synthetic-internal';input.request.quote.supplierCost=80;
  const snapshot=structuredClone(input),result=prepareResume(input);assert.deepEqual(input,snapshot);
  assert.equal(JSON.stringify(result).includes('synthetic-internal'),false);assert.equal(JSON.stringify(result).includes('supplierCost'),false);
  input.continuation.requestId=otherId;assert.equal(result.continuation.requestId,requestId);
});
test('experience resume returns repeatable read decisions without creating effects',()=>{
  assert.deepEqual(prepareResume(resumeInput()),prepareResume(resumeInput()));
});

test('session draft rejects timezone-free expiry', () => {
  assert.equal(validateChannelSessionDraft({ ...draft(), expiresAt: '2026-10-21T12:00:00' }).ok, false);
});
test('session draft rejects normalized impossible calendar expiry', () => {
  assert.equal(validateChannelSessionDraft({ ...draft(), expiresAt: '2026-02-30T12:00:00Z' }).ok, false);
});
test('session resume rejects timezone-free current clock', () => {
  assert.equal(canResumeChannelSession(session(), actor, '2026-10-20T12:00:00'), false);
});
test('session resume rejects timezone-free expiry even if the database input is malformed', () => {
  assert.equal(canResumeChannelSession({ ...session(), expiresAt: '2026-10-21T12:00:00' }, actor, now), false);
});
test('session resume compares explicit offsets as instants', () => {
  assert.equal(canResumeChannelSession({ ...session(), expiresAt: '2026-10-20T07:00:00-06:00' }, actor, now), true);
});
