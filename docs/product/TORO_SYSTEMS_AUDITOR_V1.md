# TORO Systems Auditor v1

**Status:** CURRENT PRODUCT SPEC
**Date:** 2026-09-22
**Owner:** TORO Systems + TORO Tools + TORO Governance
**Master:** TORO Brain

## 1. Purpose

TORO Systems Auditor makes TORO Brain proactively verify that connected systems are configured, secured, isolated, recoverable and using valuable capabilities appropriately.

It compares:

`expected profile -> observed state -> drift -> risk -> recommendation -> approved change -> verification`

It must never claim a system is healthy from documentation alone.

## 2. Audit object

Every governed system should eventually expose:

- system_key;
- scope_id;
- profile_key;
- owner_human;
- owner_subsystem;
- authority_role;
- connection_state;
- observed_version;
- expected_configuration;
- observed_configuration;
- drift_findings;
- security_findings;
- health_state;
- backup_state;
- last_audited_at;
- next_audit_at;
- evidence_refs;
- recommended_actions;
- approval requirement.

Use existing `integrations.external_dependency_registry` as the first registry. Add normalized audit tables only after the workflow proves they are necessary.

## 3. Audit categories

1. Identity/authentication
2. Network exposure
3. Permission scope
4. User/session isolation
5. Channel/input allowlists
6. Tool/action ceilings
7. Data/source authority
8. Secrets handling
9. Logging/privacy
10. Health/freshness
11. Retry/idempotency
12. Backup/restore
13. Upgrade/version drift
14. Unused high-value capabilities
15. Duplicate/redundant systems
16. Cost/usage
17. Incident/recovery runbook

## 4. Cadence

Suggested defaults:
- critical runtime: daily health + monthly deep audit;
- security/config after any material change;
- connectors: daily/weekly health depending on criticality;
- backup verification: scheduled plus periodic restore drill;
- product capability review: monthly/quarterly.

Cadence is policy-driven and may differ by system.

## 5. OpenClaw reference profile

OpenClaw is the first full system-audit profile because it can receive human instructions and invoke tools.

### Trust boundary

OpenClaw documentation treats one Gateway as one trust boundary.

TORO rule:
- Personal and company/shared multi-user runtimes should not share one unrestricted Gateway trust boundary.
- If two scopes have different trust/permission expectations, use separate Gateway profiles/instances or equivalent OS/host isolation.
- Multiple Gateways on one host require isolated config path, state directory, workspace and port.

### Gateway/network

Preferred remote-access pattern:
- `gateway.bind = loopback`;
- private Tailscale Serve where remote access is required;
- explicit gateway authentication;
- avoid unnecessary LAN/public exposure.

Public Funnel is not the default TORO pattern.

### Session isolation

For one shared account with multiple DM senders:
- `session.dmScope = per-channel-peer`.

For multiple accounts:
- `session.dmScope = per-account-channel-peer`.

Groups:
- `session.groupScope = per-group`.

Identity links:
- only after TORO Identity verifies the same human across channels.

### WhatsApp

Expected baseline:
- enabled only on intended account(s);
- `dmPolicy` pairing/allowlist, not open by default;
- explicit `allowFrom`;
- `groupPolicy = allowlist`;
- explicit approved group map;
- `requireMention = true` by default for team groups;
- `groupAllowFrom` for trusted trigger senders where needed;
- persistent bindings documented and mapped to TORO logical rooms.

### Tools

Recommended shared-messaging baseline:
- messaging-oriented tool profile;
- runtime/fs/automation tools denied unless explicitly needed;
- exec denied by default;
- elevated disabled;
- session visibility constrained;
- agent-to-agent access disabled unless a justified workflow requires it.

Higher-power personal/founder agents belong in a different trusted profile.

### Multi-agent

If using a multi-agent fleet:
- explicit ownership/bindings;
- no accidental fallback into a legacy `main` owner;
- each agent declares tools, data scope and authority;
- agent routing does not replace TORO Identity/Governance.

### Health

Required checks:
- `openclaw doctor`;
- `openclaw health`;
- `openclaw status --deep`;
- `openclaw channels status --probe --json`.

### Security

Required:
- `openclaw security audit --json`;
- `openclaw security audit --deep --json`.

Do not auto-run `--fix` from TORO without reviewing findings and impact.

### Backup

Required:
- configured backup method appropriate to the deployment;
- recent successful backup visible;
- encrypted/restricted backup destination;
- restore runbook;
- periodic restore verification.

OpenClaw backups contain sensitive auth/session/channel state and must be protected like live state.

### Runtime

Node remains the primary recommended Gateway runtime unless there is an explicit reviewed reason otherwise.

## 6. OpenClaw TORO profiles

### `openclaw_personal_owner`

Trust boundary:
- one owner/principal.

May allow more powerful tools with explicit approval.

Must not be used as the shared employee Gateway unless tool/session isolation is equivalent and proven.

### `openclaw_company_shared`

Trust boundary:
- company/team users with distinct identities.

Requirements:
- isolated DMs;
- strict group allowlists;
- limited tool profile;
- organization context resolution through TORO;
- no personal vault access;
- no founder/system-admin privilege inheritance.

### `openclaw_guest_channel`

Trust boundary:
- external guests/leads.

Requirements:
- public/guest-safe knowledge only;
- guest identity/privacy controls;
- no internal HR/finance/system tools;
- Kross live authority handoff;
- TERE/guest-service policies;
- human escalation.

## 7. Proactive improvement behavior

After each audit TORO Brain should produce:

### Critical
Fix/block immediately before further exposure.

### Important
Material security/reliability/cost improvement.

### Useful
Capability currently unused that can reduce work or improve service.

### Future
Worth tracking, not worth implementing yet.

Every recommendation needs:
- expected impact;
- effort;
- risk;
- dependency;
- evidence;
- owner;
- done criteria.

## 8. No automatic configuration drift repair at first

Initial maturity levels:

1. OBSERVE
2. EXPLAIN
3. RECOMMEND
4. PREPARE_CHANGE
5. EXECUTE_WITH_APPROVAL
6. SAFE_AUTOREMEDIATE

OpenClaw starts at 1-3 until the current runtime passes direct audit.

## 9. Definition of done

A system is "TORO audited" only when:
- expected profile exists;
- observed live state was actually collected;
- drift evaluated;
- critical findings resolved/accepted with owner;
- health proven;
- backup/recovery status known;
- permissions/isolation tested;
- evidence retained;
- next audit scheduled.
