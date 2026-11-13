#!/usr/bin/env node
// Inactive, operator-only transport adapter. The authenticated TORO caller must
// enforce its canonical task, claim/lease and policy before execute=true.
// This file neither creates an MCP endpoint nor grants AWS/TORO permissions.
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DOCUMENT_NAME = 'TORO-OpenClaw-ServiceRead-v1';
const DOCUMENT = JSON.parse(readFileSync(new URL('../data/openclaw_ssm_service_document_v1.json', import.meta.url), 'utf8'));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KEYS = ['region', 'accountId', 'nodeId', 'roleName', 'documentVersion', 'documentHash', 'executionRunId'];
const ENUMS = {
  load: ['loaded', 'error', 'not-found', 'bad-setting', 'masked', 'stub', 'merged'],
  active: ['active', 'reloading', 'inactive', 'failed', 'activating', 'deactivating', 'maintenance', 'refreshing'],
  sub: ['running', 'dead', 'exited', 'failed', 'auto-restart', 'start', 'start-pre', 'start-post', 'stop', 'stop-sigterm', 'stop-sigkill', 'stop-post', 'final-sigterm', 'final-sigkill', 'reload'],
  enabled: ['enabled', 'enabled-runtime', 'disabled', 'static', 'indirect', 'masked', 'masked-runtime', 'generated', 'transient', 'linked', 'linked-runtime', 'alias', 'bad'],
  restart: ['no', 'always', 'on-success', 'on-failure', 'on-abnormal', 'on-watchdog', 'on-abort'],
};
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;

function validConfig(c) {
  return c && typeof c === 'object' && !Array.isArray(c) &&
    Object.keys(c).length === KEYS.length && KEYS.every(k => typeof c[k] === 'string') &&
    /^(us|eu|ap|sa|ca|me|af|il|mx)-[a-z]+(?:-[a-z]+)?-\d$/.test(c.region) &&
    /^\d{12}$/.test(c.accountId) && /^(?:i-(?:[a-f0-9]{8}|[a-f0-9]{17})|mi-[a-f0-9]{17})$/.test(c.nodeId) &&
    /^[A-Za-z0-9_+=,.@-]{2,64}$/.test(c.roleName) && /^[1-9]\d{0,5}$/.test(c.documentVersion) &&
    /^[a-f0-9]{64}$/.test(c.documentHash) && UUID.test(c.executionRunId);
}

function requireCheck(ok, code) {
  if (!ok) { const error = new Error(code); error.code = code; throw error; }
}

function safePacket(p, now) {
  requireCheck(p && p.schemaVersion === 1 && p.source === 'systemd' && p.whatsapp === 'not_checked', 'packet_invalid');
  const stamp = typeof p.observedAt === 'string' ? Date.parse(p.observedAt) : NaN;
  requireCheck(Number.isFinite(now) && Number.isFinite(stamp) && now - stamp <= 60_000 && stamp - now <= 5_000, 'packet_stale');
  requireCheck(p.state === 'observed' && Number.isInteger(p.matchedCount) && p.matchedCount >= 0 && p.matchedCount <= 100 &&
    Number.isInteger(p.inspectedCount) && p.inspectedCount >= 0 && p.inspectedCount <= 5 &&
    p.inspectedCount <= p.matchedCount && Array.isArray(p.services) && p.services.length === p.inspectedCount &&
    p.truncated === false && p.inspectedCount === p.matchedCount, 'packet_incomplete');
  requireCheck(p.inspectedCount > 0, 'no_matching_services');
  const services = p.services.map(service => Object.fromEntries(Object.entries(ENUMS).map(([key, values]) => {
    requireCheck(service && (values.includes(service[key]) || service[key] === 'unknown'), 'packet_invalid');
    return [key, service[key]];
  })));
  return { observedAt: new Date(stamp).toISOString(), matchedCount: p.matchedCount, inspectedCount: p.inspectedCount, services };
}

export function invokeAws(service, operation, input, region) {
  // Arguments, endpoint, output bounds and retries are not configurable by a
  // model request. AWS credentials use only the operator's normal secure flow.
  return new Promise((resolvePromise, reject) => {
    const args = [service, operation, '--cli-input-json', JSON.stringify(input), '--region', region,
      '--endpoint-url', `https://${service}.${region}.amazonaws.com`, '--output', 'json',
      '--no-cli-pager', '--no-cli-auto-prompt', '--no-paginate', '--cli-connect-timeout', '3', '--cli-read-timeout', '8'];
    execFile('aws', args, { timeout: 12_000, maxBuffer: 65_536, killSignal: 'SIGKILL', shell: false,
      env: { ...process.env, AWS_PAGER: '', AWS_CLI_AUTO_PROMPT: 'off', AWS_MAX_ATTEMPTS: '1', AWS_RETRY_MODE: 'standard' } }, (error, stdout, stderr) => {
      if (error) {
        const safe = new Error('aws_unavailable');
        safe.code = /InvocationDoesNotExist/.test(stderr ?? '') ? 'invocation_pending' : 'aws_unavailable';
        reject(safe); return;
      }
      try { resolvePromise(JSON.parse(stdout)); } catch { reject(new Error('aws_unavailable')); }
    });
  });
}

export async function runSsmDiagnostics(config, { aws = invokeAws, now = Date.now, execute = false, commandId } = {}) {
  if (!validConfig(config) || (commandId !== undefined && (typeof commandId !== 'string' || !UUID.test(commandId))))
    return { state: 'blocked', reason: 'configuration_invalid', whatsapp: 'not_checked' };
  const base = { executionRunId: config.executionRunId, whatsapp: 'not_checked' };
  if (execute !== true) return { ...base, state: 'prepared', reason: 'explicit_execution_required' };
  const documentArn = `arn:aws:ssm:${config.region}:${config.accountId}:document/${DOCUMENT_NAME}`;
  const call = (service, action, input) => aws(service, action, input, config.region);
  const documentNameMatches = value => value === DOCUMENT_NAME || value === documentArn;
  try {
    const identity = await call('sts', 'get-caller-identity', {});
    const rolePrefix = `arn:aws:sts::${config.accountId}:assumed-role/${config.roleName}/`;
    requireCheck(identity?.Account === config.accountId && typeof identity.Arn === 'string' &&
      identity.Arn.startsWith(rolePrefix) && /^[A-Za-z0-9_+=,.@-]{2,64}$/.test(identity.Arn.slice(rolePrefix.length)), 'identity_mismatch');
    const nodes = await call('ssm', 'describe-instance-information', { Filters: [{ Key: 'InstanceIds', Values: [config.nodeId] }] });
    const list = nodes?.InstanceInformationList;
    requireCheck(Array.isArray(list) && list.length === 1 && list[0].InstanceId === config.nodeId &&
      list[0].PingStatus === 'Online' && list[0].PlatformType === 'Linux', 'node_unverified');
    const args = { Name: documentArn, DocumentVersion: config.documentVersion };
    const metadata = (await call('ssm', 'describe-document', args))?.Document;
    requireCheck(metadata && documentNameMatches(metadata.Name) && metadata.DocumentVersion === config.documentVersion &&
      metadata.DocumentType === 'Command' && metadata.Status === 'Active' && metadata.HashType === 'Sha256' && metadata.Hash === config.documentHash, 'document_unverified');
    const remote = await call('ssm', 'get-document', { ...args, DocumentFormat: 'JSON' });
    requireCheck(remote && documentNameMatches(remote.Name) && remote.DocumentVersion === config.documentVersion &&
      remote.DocumentType === 'Command' && remote.Status === 'Active' && typeof remote.Content === 'string' && remote.Content.length <= 32_768, 'document_unverified');
    let content; try { content = JSON.parse(remote.Content); } catch { requireCheck(false, 'document_unverified'); }
    requireCheck(JSON.stringify(canonical(content)) === JSON.stringify(canonical(DOCUMENT)), 'document_unverified');
  } catch (error) {
    const allowed = ['identity_mismatch', 'node_unverified', 'document_unverified'];
    return { ...base, state: 'blocked', reason: allowed.includes(error.code) ? error.code : 'aws_unavailable' };
  }
  if (!commandId) {
    let observedCommandId;
    try {
      const sent = (await call('ssm', 'send-command', { InstanceIds: [config.nodeId], DocumentName: documentArn,
        DocumentVersion: config.documentVersion, DocumentHash: config.documentHash, DocumentHashType: 'Sha256',
        Comment: `TORO:${config.executionRunId}`, TimeoutSeconds: 30, MaxConcurrency: '1', MaxErrors: '0',
        CloudWatchOutputConfig: { CloudWatchOutputEnabled: false } }))?.Command;
      observedCommandId = sent && typeof sent.CommandId === 'string' && UUID.test(sent.CommandId) ? sent.CommandId : undefined;
      requireCheck(sent && observedCommandId && sent.Comment === `TORO:${config.executionRunId}` && documentNameMatches(sent.DocumentName) &&
        sent.DocumentVersion === config.documentVersion && Array.isArray(sent.InstanceIds) &&
        sent.InstanceIds.length === 1 && sent.InstanceIds[0] === config.nodeId, 'dispatch_unknown');
      commandId = sent.CommandId;
    } catch {
      // SendCommand has no client idempotency token. Reconcile the canonical
      // run/comment in AWS before another dispatch, even for a read-only probe.
      return { ...base, ...(observedCommandId ? { commandId: observedCommandId } : {}), state: 'dispatch_unknown', reason: 'reconcile_before_dispatch' };
    }
  }
  const receipt = { ...base, commandId };
  let invocation;
  try { invocation = await call('ssm', 'get-command-invocation', { CommandId: commandId, InstanceId: config.nodeId, PluginName: 'ServiceSnapshot' }); }
  catch (error) { return { ...receipt, state: 'pending', reason: error.code === 'invocation_pending' ? 'eventual_consistency' : 'read_unavailable' }; }
  try {
    requireCheck(invocation && invocation.CommandId === commandId && invocation.InstanceId === config.nodeId &&
      documentNameMatches(invocation.DocumentName) && invocation.DocumentVersion === config.documentVersion &&
      invocation.Comment === `TORO:${config.executionRunId}`, 'invocation_mismatch');
    if (['Pending', 'InProgress', 'Delayed'].includes(invocation.Status)) return { ...receipt, state: 'pending' };
    requireCheck(invocation.Status === 'Success' && invocation.ResponseCode === 0 &&
      typeof invocation.StandardOutputContent === 'string' && invocation.StandardOutputContent.length <= 8_192, 'probe_failed');
    const parsed = JSON.parse(invocation.StandardOutputContent);
    return { ...receipt, state: 'service_observed', probe: safePacket(parsed, now()) };
  } catch (error) {
    const allowed = ['invocation_mismatch', 'packet_invalid', 'packet_stale', 'packet_incomplete', 'no_matching_services'];
    return { ...receipt, state: 'unverified', reason: allowed.includes(error.code) ? error.code : 'probe_failed' };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const valid = args.length === 0 || (args[0] === '--execute-read-only' &&
    (args.length === 1 || (args.length === 3 && args[1] === '--resume-command-id' && UUID.test(args[2]))));
  const config = Object.fromEntries(KEYS.map((key, i) => [key, process.env[
    ['TORO_SSM_REGION', 'TORO_SSM_ACCOUNT_ID', 'TORO_SSM_NODE_ID', 'TORO_SSM_ROLE_NAME',
      'TORO_SSM_DOCUMENT_VERSION', 'TORO_SSM_DOCUMENT_HASH', 'TORO_EXECUTION_RUN_ID'][i]] ?? '']));
  const result = valid ? await runSsmDiagnostics(config, { execute: args[0] === '--execute-read-only', commandId: args[2] }) :
    { state: 'blocked', reason: 'configuration_invalid', whatsapp: 'not_checked' };
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = ['prepared', 'service_observed', 'pending'].includes(result.state) ? 0 : 1;
}
