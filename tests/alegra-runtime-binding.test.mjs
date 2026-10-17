import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

// Isolated tests of the real gate. RPCs and the already-tested approval contract
// are dependency doubles: this suite has no provider/database/network access.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const path = new URL('../src/features/finance/alegra-writer-control-plane.ts', import.meta.url);
const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
const contract = {
  captureAlegraWriteAuthorization: (intent, approval) => deepFreeze(structuredClone({ intent, approval })),
  validateAlegraWriteApproval: (intent, approval, at) => ({
    ok: !!approval && approval.state === 'approved' && approval.payloadHash === intent.payloadHash &&
      Number.isFinite(Date.parse(at)) && Date.parse(at) >= Date.parse(approval.approvedAt) &&
      Date.parse(at) < Date.parse(approval.expiresAt),
  }),
};
const boundaries = {
  admitApprovedAlegraExecutionRun: (client, input) => client.admit(input),
  finalizeAlegraExecutionRun: (client, input) => client.finalize(input),
};
const exports = {};
vm.runInNewContext(compiled, {
  exports, structuredClone,
  require(name) {
    if (name === 'server-only') return {};
    if (name === './alegra-writer-contract') return contract;
    if (name === '../control-plane/worker-runtime') return boundaries;
    throw new Error(`Unexpected dependency: ${name}`);
  },
}, { filename: path.pathname });
const { createAlegraControlPlaneGate } = exports;
function fixture() {
  const calls = [];
  const client = label => ({
    async admit(input) {
      calls.push({ label, action: 'admit', input });
      return { runId: input.runId, fencingToken: 1, preparedReceiptId: 'synthetic-prepared', leaseExpiresAt: '2026-10-17T10:02:00Z' };
    },
    async finalize(input) {
      calls.push({ label, action: 'finalize', input });
      return { finalReceiptId: 'synthetic-final' };
    },
  });
  const intent = { action: 'alegra_create_purchase_bill', scope: { orgId: 'synthetic-org' }, idempotencyKey: 'synthetic-key', payloadHash: 'a'.repeat(64), evidence: { sourceRefs: ['synthetic:original'] } };
  const approval = { state: 'approved', approvalId: 'synthetic-approval', approvalReceiptId: 'synthetic-approval-receipt', actorId: 'synthetic-owner', decisionId: 'synthetic-decision', decisionRevision: '2026-10-17T10:00:00Z', approvedAt: '2026-10-17T10:00:00Z', expiresAt: '2026-10-17T10:15:00Z', payloadHash: intent.payloadHash };
  const options = { supabase: client('original'), workerId: 'original-worker', now: () => '2026-10-17T10:00:00Z', authorize: async () => true, run: { id: 'synthetic-run', orgId: 'synthetic-org', idempotencyKey: intent.idempotencyKey, decisionId: approval.decisionId, actorRef: approval.actorId, targetSystem: 'alegra', actionKey: intent.action, executionAuthorityLevel: 'L3', status: 'queued', attemptCount: 0, maxAttempts: 1, fencingToken: 0 } };
  const request = { intent, approval };
  const receipt = { idempotencyKey: intent.idempotencyKey, payloadHash: intent.payloadHash, approvalId: approval.approvalId, actorId: approval.actorId, nativeId: 'synthetic-bill', verified: true };
  return { options, request, receipt, calls, client };
}
test('original worker/client performs admission and finalization with the same fence', async () => {
  const f = fixture(), gate = createAlegraControlPlaneGate(f.options);
  assert.equal(await gate.beforeDispatch(f.request), true);
  assert.equal(await gate.persistReceipt(f.receipt), 'synthetic-final');
  assert.deepEqual(f.calls.map(c => c.label), ['original', 'original']);
  assert.equal(f.calls[1].input.fencingToken, 1);
  assert.equal(f.calls[1].input.preparedReceiptId, 'synthetic-prepared');
});
test('worker identity cannot be replaced while authorization awaits', async () => {
  const f = fixture();
  f.options.authorize = async () => { await Promise.resolve(); f.options.workerId = 'replacement-worker'; return true; };
  const gate = createAlegraControlPlaneGate(f.options);
  assert.equal(await gate.beforeDispatch(f.request), true);
  await gate.persistReceipt(f.receipt);
  assert.deepEqual(f.calls.map(c => c.input.workerId), ['original-worker', 'original-worker']);
});
test('admission keeps the original Supabase client across authorization', async () => {
  const f = fixture();
  f.options.authorize = async () => { await Promise.resolve(); f.options.supabase = f.client('replacement'); return true; };
  const gate = createAlegraControlPlaneGate(f.options);
  assert.equal(await gate.beforeDispatch(f.request), true);
  assert.equal(f.calls[0].label, 'original');
});
test('finalization cannot be redirected after admission', async () => {
  const f = fixture(), gate = createAlegraControlPlaneGate(f.options);
  assert.equal(await gate.beforeDispatch(f.request), true);
  f.options.supabase = f.client('replacement');
  assert.equal(await gate.persistReceipt(f.receipt), 'synthetic-final');
  assert.deepEqual(f.calls.map(c => c.label), ['original', 'original']);
});
test('an authorization denial cannot be replaced after gate construction', async () => {
  const f = fixture();
  f.options.authorize = async () => false;
  const gate = createAlegraControlPlaneGate(f.options);
  f.options.authorize = async () => true;
  assert.equal(await gate.beforeDispatch(f.request), false);
  assert.equal(f.calls.length, 0);
});
test('the host clock callback cannot be replaced with a stale approved time', async () => {
  const f = fixture();
  f.options.now = () => '2026-10-17T10:16:00Z';
  const gate = createAlegraControlPlaneGate(f.options);
  f.options.now = () => '2026-10-17T10:00:00Z';
  assert.equal(await gate.beforeDispatch(f.request), false);
  assert.equal(f.calls.length, 0);
});
test('approval expiring during authorization stops before the admission RPC', async () => {
  const f = fixture(); let time = '2026-10-17T10:00:00Z';
  f.options.now = () => time;
  f.options.authorize = async () => { await Promise.resolve(); time = '2026-10-17T10:15:00Z'; return true; };
  const gate = createAlegraControlPlaneGate(f.options);
  assert.equal(await gate.beforeDispatch(f.request), false);
  assert.equal(f.calls.length, 0);
});
test('changing the supplied run does not change the captured organization', async () => {
  const f = fixture(), gate = createAlegraControlPlaneGate(f.options);
  f.options.run.orgId = 'replacement-org';
  assert.equal(await gate.beforeDispatch(f.request), true);
  assert.equal(f.calls[0].input.orgId, 'synthetic-org');
});
test('a gate admits at most once even with concurrent attempts', async () => {
  const f = fixture(), gate = createAlegraControlPlaneGate(f.options);
  const results = await Promise.all([gate.beforeDispatch(f.request), gate.beforeDispatch(f.request)]);
  assert.deepEqual(results, [true, false]);
  assert.equal(f.calls.length, 1);
});
