# TORO OpenClaw Runtime Audit Runbook

**Status:** REQUIRED BEFORE OPENCLAW = CONFIRMED_ACTIVE
**Date:** 2026-09-25
**Owner subsystem:** TORO Comms + TORO Systems + TORO Tools
**Current canonical status:** configured/unverified

## Purpose

Verify the actual OpenClaw Gateway/channel/runtime without exposing credentials and without treating historical documentation as live proof.

Official references:
- https://docs.openclaw.ai/cli/channels
- https://docs.openclaw.ai/gateway/security/running-the-audit
- https://docs.openclaw.ai/session
- https://docs.openclaw.ai/channels/group-messages
- https://docs.openclaw.ai/concepts/agent-bindings
- https://docs.openclaw.ai/concepts/multi-agent

## Safety rules

- Never paste tokens, QR secrets, auth files, API keys or raw credentials into TORO evidence.
- Do not run `security audit --fix` automatically.
- Do not change live routing during an audit.
- Redact phone numbers/group IDs from public artifacts.
- Treat channel logs as potentially private.
- Store only minimal evidence/result summaries.

## Gate 0 — Workstation capacity

If the Gateway runs on an authorized Windows workstation, run the canonical TORO Systems advisory probe before resource-intensive local audit/build work:

```powershell
pwsh -NoProfile -File scripts/pc-health.ps1 -Json
```

Interpretation:
- `HEALTHY` -> proceed with one controlled heavy task at a time;
- `CAUTION` -> reduce concurrency and prefer cloud/connector execution where practical;
- `STOP_HEAVY_WORK` -> do not start additional heavy local work;
- `DIAGNOSTIC_ERROR` -> local capacity is unknown.

This gate measures workstation capacity only. It does **not** prove OpenClaw version, gateway binding, Tailscale, auth, session isolation, WhatsApp policies, tool permissions, security audit or backup correctness.

Canonical runbook: `docs/runbooks/TORO_WORKSTATION_HEALTH.md`.

## Gate 1 — Gateway/channel inventory

Run on the authorized OpenClaw host:

```bash
openclaw channels list --all --json
openclaw channels status --probe --json
openclaw status --deep
```

Verify:
- expected WhatsApp account(s) are configured/enabled;
- Gateway is reachable;
- live probe succeeds;
- no stale config-only result is misreported as live health;
- lifecycle is not blocked/degraded without explanation.

Evidence to retain:
- timestamp;
- OpenClaw version;
- account aliases only;
- probe result;
- no credentials.

## Gate 2 — WhatsApp capabilities

```bash
openclaw channels capabilities --channel whatsapp --json
```

Verify the actual runtime/provider capabilities rather than assuming support from documentation.

Record:
- supported messaging/media capability summary;
- provider/account warnings;
- unsupported actions.

## Gate 3 — Session isolation

Inspect sanitized config.

Required for TORO multi-user ingress:

```json5
{
  session: {
    dmScope: "per-channel-peer"
  }
}
```

If multiple WhatsApp accounts share one Gateway, prefer:

```json5
{
  session: {
    dmScope: "per-account-channel-peer"
  }
}
```

Required:
- no multi-user inbox with default `dmScope: "main"`;
- default/selected `groupScope: "per-group"` unless a specific trusted room intentionally overrides it;
- cross-channel `identityLinks` only after TORO Identity proves the identities refer to the same human;
- no identity linking by display name alone.

## Gate 4 — Group access

Review WhatsApp/group configuration and bindings.

Required baseline:
- allowlist/pairing rather than open ingress;
- approved groups only;
- mention activation by default;
- explicit owners/purpose for each group;
- group context isolated from unrelated DMs/groups;
- group sender authorization distinct from context visibility.

TORO logical group mapping must be recorded in TORO Comms rather than only inside OpenClaw config.

## Gate 5 — Binding/routing

Review `bindings`.

For every binding record:
- channel;
- account alias;
- peer type;
- logical TORO room/user;
- target agent/runtime;
- session override if any;
- tool policy;
- business purpose.

Rules:
- bindings route; they do not grant TORO permissions;
- TORO Identity/Governance remains authorization authority;
- specialist agent selection must not expose a separate business identity universe.

## Gate 6 — Tool permissions

Review agent/tool policy.

Shared/internal multi-user ingress should start with messaging-safe tools and deny broad runtime/filesystem/browser capabilities unless explicitly needed.

Check:
- filesystem;
- exec/process;
- browser/computer control;
- cron/automation;
- gateway administration;
- cross-agent session tools;
- elevated execution.

No employee/group channel should inherit founder/host-admin tool privileges.

## Gate 7 — Security audit

Run:

```bash
openclaw security audit --json
openclaw security audit --deep --json
```

Review:
- inbound access;
- DM/group policies;
- allowlists;
- session isolation;
- cross-agent visibility;
- tool/runtime exposure;
- dangerous flags;
- file/config permission findings;
- live plugin/runtime findings from the deep audit.

Do not hide findings through suppression merely to make the gate green.

## Gate 8 — Logs and privacy

Use a bounded log sample:

```bash
openclaw channels logs --channel whatsapp --lines 200 --json
```

Verify:
- no secrets;
- no uncontrolled personal/guest payload copied into business evidence;
- failures have correlation/session identifiers without exposing unnecessary content;
- reconnect/retry behavior is visible;
- repeated inbound events do not create duplicate TORO tasks/actions.

Do not commit raw logs.

## Gate 9 — Replay/idempotency

Controlled test:
1. send one approved low-risk test message;
2. confirm exactly one TORO ingress event;
3. force/reproduce safe retry where possible;
4. confirm no duplicate canonical task/incident/handoff;
5. confirm response/delivery state is consistent.

TORO canonical object creation must be idempotent using external message/event identity where available.

## Gate 10 — TORO context/authority

For pilot users verify:
- sender maps to TORO Identity or remains unlinked/restricted;
- organization context requires active membership;
- employee role is read from TORO/Supabase, not OpenClaw persona/config;
- personal User Vault is not injected into work context;
- Kross remains live reservation/rate/availability authority;
- OpenClaw cannot bypass TORO approval gates.

## Gate 11 — Human escalation

Test:
- unknown user;
- permission denied;
- ambiguous high-risk request;
- guest complaint;
- emergency keyword/category;
- connector unavailable.

Expected:
- fail closed where necessary;
- concise explanation;
- human handoff/notification;
- minimal audit evidence.

## Gate 12 — Health/recovery

Verify:
- reconnect after transport loss;
- Gateway restart behavior;
- session continuity/isolation after restart;
- channel health monitor behavior if enabled;
- stale/degraded state reaches TORO Systems;
- outage does not silently present channel as healthy.

## Pass criteria

Only change OpenClaw canonical dependency status from `needs_audit` to `confirmed_active` when:

- channel live probe passes;
- DM isolation passes;
- group access/bindings pass;
- tool policy passes;
- deep security audit has no unaccepted critical issue;
- replay/idempotency passes;
- TORO identity/permission boundary passes;
- human escalation passes;
- health/recovery passes;
- evidence timestamp/owner is recorded.

## Result record

Store only:
- audit date;
- runtime version;
- channel aliases;
- pass/fail per gate;
- redacted finding IDs;
- responsible owner;
- next action;
- evidence reference.

Never store tokens, auth directories, QR data, passwords or raw private conversations.


## Machine-readable runtime evidence packet — 2026-09-24

Prepared artifacts:
- `data/openclaw_runtime_evidence_template_v1.json`;
- `src/features/openclaw/runtime-evidence.ts`.

Purpose:
- translate one direct sanitized host audit into a deterministic PASS/FAIL result;
- require explicit evidence per gate;
- prevent duplicate gate records from silently overriding each other;
- preserve the current canonical dependency state as `CONFIGURED_UNVERIFIED` until all required gates pass.

Required gate keys:
- runtime_identity;
- live_channel_probe;
- channel_capabilities;
- session_isolation;
- group_access;
- bindings_routing;
- least_privilege_tools;
- security_audit;
- logs_privacy;
- replay_idempotency;
- toro_identity_authority;
- human_escalation;
- health_recovery;
- backup_restore.

Additional safety checks:
- valid audit timestamp;
- no raw secrets retained;
- no real guest contacted merely for audit proof;
- no production mutation caused by the audit.

Complete packet result:
- `EVIDENCE_PACKET_COMPLETE_UNVERIFIED`.
- Independent authorized host observation must establish live runtime status outside this packet evaluator.

Any failed/missing/unevidenced/duplicated gate:
- `CONFIGURED_UNVERIFIED`.

The template itself is not runtime evidence. Do not populate it from historical docs or owner recollection alone.

## First owner-only WhatsApp test: M01 then M02

Run on the existing authorized Gateway host, with its actual profile. These commands inspect state; do not run login, logout, `doctor --fix`, change config, approve pairing, restart or disclose credentials as part of this first pass.

```bash
openclaw --version
openclaw gateway status
openclaw channels status --channel whatsapp --probe --json
openclaw status --deep
openclaw channels capabilities --channel whatsapp --json
```

For M01 record only: timestamp with timezone, runtime version, Gateway reachability, the sanitized channel/account alias, whether the WhatsApp probe is **live** and successful, and any error category. A config-only fallback or `starting` is not a pass; wait for the Gateway to become ready and repeat the probe. Redact tokens, QR/auth files, phone numbers beyond the last four digits, group IDs, message bodies and private paths before sharing.

Only after M01 passes and the target account and owner allowlist are confirmed, Mauricio can send `/status` as a standalone message from his own phone to the verified TORO test chat. It asks for channel status and does not itself establish TORO identity. For M02, send a harmless read-only owner request and inspect the real inbound sender mapping: exact channel account + sender ID -> canonical Mauricio user + Dreamcatcher organization + active membership; refuse display-name or message-text authorization. Record provider message ID, correlation ID and masked identifiers; no employee, guest or production writes. If identity or personal/work isolation fails, stop before testing tasks.

Status for this first pass remains `CONFIGURED_UNVERIFIED` or `EVIDENCE_PACKET_COMPLETE_UNVERIFIED` until the authorized host and canonical resolver evidence agree. The evaluator cannot promote live runtime merely because references are nonempty. Reuse M01–M12 criteria in `operations.knowledge_items/openclaw_whatsapp_runtime_audit_2026_09_v1` after M01/M02 pass.
