import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { runSsmDiagnostics, DOCUMENT_NAME } from '../scripts/openclaw-ssm-diagnostics.mjs';

const document = JSON.parse(readFileSync(new URL('../data/openclaw_ssm_service_document_v1.json', import.meta.url)));
const time = Date.parse('2026-11-11T08:30:00Z');
const runId = '0d2abcde-1234-4567-89ab-0123456789ab';
const commandId = '012abcde-1234-4567-89ab-0123456789ab';
const config = { region: 'us-east-1', accountId: '123456789012', nodeId: 'mi-0123456789abcdef0', roleName: 'TORODiagnosticReader', documentVersion: '1', documentHash: 'a'.repeat(64), executionRunId: runId };
const packet = { schemaVersion: 1, source: 'systemd', observedAt: new Date(time).toISOString(), state: 'observed', matchedCount: 1, inspectedCount: 1, truncated: false, services: [{ load: 'loaded', active: 'active', sub: 'running', enabled: 'enabled', restart: 'on-failure' }], whatsapp: 'not_checked' };

function fixture(overrides = {}) {
  const calls = [];
  const responses = {
    'get-caller-identity': { Account: config.accountId, Arn: `arn:aws:sts::${config.accountId}:assumed-role/${config.roleName}/worker` },
    'describe-instance-information': { InstanceInformationList: [{ InstanceId: config.nodeId, PingStatus: 'Online', PlatformType: 'Linux' }] },
    'describe-document': { Document: { Name: DOCUMENT_NAME, DocumentVersion: '1', DocumentType: 'Command', Status: 'Active', HashType: 'Sha256', Hash: config.documentHash } },
    'get-document': { Name: DOCUMENT_NAME, DocumentVersion: '1', DocumentType: 'Command', Status: 'Active', Content: JSON.stringify(document) },
    'send-command': { Command: { CommandId: commandId, Comment: `TORO:${runId}`, DocumentName: DOCUMENT_NAME, DocumentVersion: '1', InstanceIds: [config.nodeId] } },
    'get-command-invocation': { CommandId: commandId, Comment: `TORO:${runId}`, InstanceId: config.nodeId, DocumentName: DOCUMENT_NAME, DocumentVersion: '1', Status: 'Success', ResponseCode: 0, StandardOutputContent: JSON.stringify(packet), StandardErrorContent: '' },
    ...overrides,
  };
  const aws = async (service, operation, input, region) => {
    calls.push({ service, operation, input, region });
    const value = responses[operation];
    if (value instanceof Error) throw value;
    return structuredClone(value);
  };
  return { calls, aws, now: () => time };
}

test('default is preparation only, with no AWS access', async () => {
  const f = fixture();
  const result = await runSsmDiagnostics(config, f);
  assert.equal(result.state, 'prepared');
  assert.equal(f.calls.length, 0);
});

test('one fixed read-only document is sent to exactly one pinned node', async () => {
  const f = fixture();
  const result = await runSsmDiagnostics(config, { ...f, execute: true });
  assert.equal(result.state, 'service_observed');
  assert.equal(result.whatsapp, 'not_checked');
  const send = f.calls.filter(c => c.operation === 'send-command');
  assert.equal(send.length, 1);
  assert.deepEqual(send[0].input.InstanceIds, [config.nodeId]);
  assert.equal(send[0].input.DocumentVersion, '1');
  assert.equal(send[0].input.DocumentHash, config.documentHash);
  assert.equal(send[0].input.DocumentHashType, 'Sha256');
  assert.equal(send[0].input.Comment, `TORO:${runId}`);
  assert.equal(send[0].input.Parameters, undefined);
  assert.equal(send[0].input.Targets, undefined);
  assert.equal(send[0].input.CloudWatchOutputConfig.CloudWatchOutputEnabled, false);
});

for (const [label, patch] of [
  ['wildcard node', { nodeId: '*' }], ['latest document', { documentVersion: '$LATEST' }],
  ['shell fragment', { region: 'us-east-1;cat /etc/passwd' }], ['unpinned hash', { documentHash: '' }],
  ['unknown action', { command: 'restart' }], ['missing canonical run', { executionRunId: '' }],
]) test(`rejects ${label} before any AWS request`, async () => {
  const f = fixture();
  assert.equal((await runSsmDiagnostics({ ...config, ...patch }, { ...f, execute: true })).reason, 'configuration_invalid');
  assert.equal(f.calls.length, 0);
});

test('wrong account, root or different role never dispatches', async () => {
  for (const identity of [{ Account: '000000000000', Arn: '' }, { Account: config.accountId, Arn: `arn:aws:iam::${config.accountId}:root` }, { Account: config.accountId, Arn: `arn:aws:sts::${config.accountId}:assumed-role/Other/worker` }]) {
    const f = fixture({ 'get-caller-identity': identity });
    assert.equal((await runSsmDiagnostics(config, { ...f, execute: true })).reason, 'identity_mismatch');
    assert.equal(f.calls.length, 1);
  }
});

test('offline, wrong, duplicate and Windows nodes never dispatch', async () => {
  for (const nodes of [[], [{ InstanceId: 'mi-fffffffffffffffff', PingStatus: 'Online', PlatformType: 'Linux' }], Array(2).fill({ InstanceId: config.nodeId, PingStatus: 'Online', PlatformType: 'Linux' }), [{ InstanceId: config.nodeId, PingStatus: 'ConnectionLost', PlatformType: 'Linux' }], [{ InstanceId: config.nodeId, PingStatus: 'Online', PlatformType: 'Windows' }]]) {
    const f = fixture({ 'describe-instance-information': { InstanceInformationList: nodes } });
    assert.equal((await runSsmDiagnostics(config, { ...f, execute: true })).reason, 'node_unverified');
    assert.equal(f.calls.some(c => c.operation === 'send-command'), false);
  }
});

test('document mismatch or changed executable content never dispatches', async () => {
  for (const overrides of [
    { 'describe-document': { Document: { Name: DOCUMENT_NAME, DocumentVersion: '1', DocumentType: 'Command', Status: 'Active', HashType: 'Sha256', Hash: 'b'.repeat(64) } } },
    { 'get-document': { Name: DOCUMENT_NAME, DocumentVersion: '1', DocumentType: 'Command', Status: 'Active', Content: JSON.stringify({ ...document, parameters: { commands: { type: 'String' } } }) } },
  ]) {
    const f = fixture(overrides);
    assert.equal((await runSsmDiagnostics(config, { ...f, execute: true })).reason, 'document_unverified');
    assert.equal(f.calls.some(c => c.operation === 'send-command'), false);
  }
});

test('uncertain dispatch is never retried and raw errors never escape', async () => {
  const f = fixture({ 'send-command': new Error('timeout SECRET_TOKEN=should-not-escape') });
  const r = await runSsmDiagnostics(config, { ...f, execute: true });
  assert.equal(r.state, 'dispatch_unknown');
  assert.equal(r.executionRunId, runId);
  assert.equal(f.calls.filter(c => c.operation === 'send-command').length, 1);
  assert.equal(JSON.stringify(r).includes('SECRET'), false);
});

test('eventual consistency returns pending and resume never dispatches again', async () => {
  const missing = new Error('InvocationDoesNotExist'); missing.code = 'invocation_pending';
  const f = fixture({ 'get-command-invocation': missing });
  const r = await runSsmDiagnostics(config, { ...f, execute: true });
  assert.equal(r.state, 'pending');
  assert.equal(r.commandId, commandId);
  const resume = fixture();
  assert.equal((await runSsmDiagnostics(config, { ...resume, execute: true, commandId })).state, 'service_observed');
  assert.equal(resume.calls.some(c => c.operation === 'send-command'), false);
});

test('wrong invocation identity and stale or malformed packets cannot pass', async () => {
  for (const response of [
    { InstanceId: 'mi-fffffffffffffffff' }, { DocumentVersion: '2' }, { Comment: 'TORO:other-run' }, { ResponseCode: 1 },
    { StandardOutputContent: 'not json SECRET' },
    { StandardOutputContent: JSON.stringify({ ...packet, observedAt: new Date(time - 61000).toISOString() }) },
    { StandardOutputContent: JSON.stringify({ ...packet, observedAt: new Date(time + 6000).toISOString() }) },
    { StandardOutputContent: JSON.stringify({ ...packet, matchedCount: 0, inspectedCount: 0, services: [] }) },
    { StandardOutputContent: JSON.stringify({ ...packet, truncated: true }) },
  ]) {
    const base = fixture();
    const source = await base.aws('ssm', 'get-command-invocation', {}, config.region);
    const f = fixture({ 'get-command-invocation': { ...source, ...response } });
    const r = await runSsmDiagnostics(config, { ...f, execute: true });
    assert.notEqual(r.state, 'service_observed');
    assert.equal(JSON.stringify(r).includes('SECRET'), false);
  }
});

test('provider stdout extras and private fields are not emitted', async () => {
  const base = fixture();
  const source = await base.aws('ssm', 'get-command-invocation', {}, config.region);
  const f = fixture({ 'get-command-invocation': { ...source, StandardErrorContent: 'PRIVATE_TOKEN', StandardOutputContent: JSON.stringify({ ...packet, token: 'PRIVATE_TOKEN', node: config.nodeId, services: [{ ...packet.services[0], name: 'PRIVATE_UNIT', secret: 'PRIVATE_TOKEN' }] }) } });
  const r = await runSsmDiagnostics(config, { ...f, execute: true });
  assert.equal(r.state, 'service_observed');
  assert.equal(JSON.stringify(r).includes('PRIVATE'), false);
  assert.equal(JSON.stringify(r).includes(config.nodeId), false);
});

test('fixed SSM document has no input parameters or modifying operations', () => {
  assert.equal(document.schemaVersion, '2.2');
  assert.equal(document.parameters, undefined);
  assert.equal(document.mainSteps.length, 1);
  assert.equal(document.mainSteps[0].inputs.timeoutSeconds, '20');
  assert.deepEqual(document.mainSteps[0].precondition, { StringEquals: ['platformType', 'Linux'] });
  const script = document.mainSteps[0].inputs.runCommand.join('\n');
  assert.equal(/\{\{|restart\s|sudo\s|apt\s|curl\s|wget\s|open\(/.test(script), false);
  assert.ok(script.includes('list-units'));
  assert.ok(script.includes('show'));
});

test('collector executes with mocked systemctl, filters private fields, and rejects oversized output', () => {
  const command = document.mainSteps[0].inputs.runCommand[0];
  const python = command.slice(command.indexOf('\n') + 1, command.lastIndexOf('TORO_FIXED_SERVICE_SNAPSHOT'));
  const cases = [
    { list: 'openclaw-private.service loaded active running PRIVATE_DESCRIPTION\n', show: 'LoadState=loaded\nActiveState=active\nSubState=running\nUnitFileState=enabled\nRestart=on-failure\nEnvironment=PRIVATE_TOKEN\n', count: 1, state: 'observed' },
    { list: 'PRIVATE_DESCRIPTION'.repeat(2000), show: '', count: 0, state: 'unverified' },
    { list: 'not-a-unit PRIVATE_TOKEN\n', show: '', count: 0, state: 'unverified' },
    { list: 'openclaw.service loaded active running PUBLIC\nopenclaw-tenant\\x20one.service loaded failed failed PRIVATE\n', show: 'LoadState=loaded\nActiveState=active\nSubState=running\nUnitFileState=enabled\nRestart=no\n', count: 1, state: 'unverified' },
  ];
  for (const fixture of cases) {
    const source = `import json,subprocess\nfrom unittest.mock import patch\nfixture=json.loads(${JSON.stringify(JSON.stringify(fixture))})\n` +
      `def fake(args, **kwargs):\n assert args[0]=='/usr/bin/systemctl'\n assert args[1] in ['list-units','show']\n return subprocess.CompletedProcess(args,0,fixture['list'] if args[1]=='list-units' else fixture['show'],'')\n` +
      `with patch('subprocess.run',side_effect=fake):\n exec(${JSON.stringify(python)})\n`;
    const result = spawnSync('python3', ['-I', '-c', source], { encoding: 'utf8', timeout: 5000 });
    assert.equal(result.status, 0, result.stderr);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.inspectedCount, fixture.count);
    assert.equal(parsed.state, fixture.state);
    assert.equal(result.stdout.includes('PRIVATE'), false);
    assert.equal(parsed.whatsapp, 'not_checked');
  }
});

test('a failed service is observable but never reported as healthy or connected', async () => {
  const base = fixture();
  const source = await base.aws('ssm', 'get-command-invocation', {}, config.region);
  const f = fixture({ 'get-command-invocation': { ...source, StandardOutputContent: JSON.stringify({ ...packet, services: [{ ...packet.services[0], active: 'failed', sub: 'failed' }] }) } });
  const r = await runSsmDiagnostics(config, { ...f, execute: true });
  assert.equal(r.state, 'service_observed');
  assert.equal(r.probe.services[0].active, 'failed');
  assert.equal(r.whatsapp, 'not_checked');
  assert.equal(r.connected, undefined);
  assert.equal(r.healthy, undefined);
});

test('malformed send receipt preserves a usable command reference without redispatch', async () => {
  const f = fixture({ 'send-command': { Command: { CommandId: commandId, Comment: 'wrong-run', DocumentName: DOCUMENT_NAME, DocumentVersion: '1', InstanceIds: [config.nodeId] } } });
  const r = await runSsmDiagnostics(config, { ...f, execute: true });
  assert.equal(r.state, 'dispatch_unknown');
  assert.equal(r.commandId, commandId);
  assert.equal(f.calls.filter(c => c.operation === 'send-command').length, 1);
  assert.equal(f.calls.some(c => c.operation === 'get-command-invocation'), false);
});
