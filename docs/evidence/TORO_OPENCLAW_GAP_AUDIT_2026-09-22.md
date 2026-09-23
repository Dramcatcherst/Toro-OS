# TORO OpenClaw — Current Gap Audit

**Date:** 2026-09-22
**Status:** CONFIGURED / UNVERIFIED
**Owner:** TORO Systems + TORO Comms
**Runtime access:** BLOCKED — direct Gateway/host access not yet connected

## Executive result

TORO can verify the intended architecture and current OpenClaw best-practice baseline, but cannot yet verify the live host configuration.

Therefore:
- do not call the current runtime "healthy";
- do not call it "misconfigured" without evidence;
- keep canonical status `needs_audit` / `configured_unverified`.

## Current public OpenClaw baseline

As of 2026-09-22:
- latest published OpenClaw release: `2026.9.5`;
- extended-stable/LTS-equivalent line available: `2026.7.35`.

TORO should record an explicit update policy:
- latest stable, or
- extended-stable.

Do not auto-upgrade production merely because a newer version exists.

## Current canonical evidence

Known:
- OpenClaw is registered in TORO/Supabase as a runtime dependency;
- its status is `needs_audit`;
- it is intended as a WhatsApp/channel runtime, not business truth;
- WeSpeak remains separately confirmed active;
- direct OpenClaw config/session/log/health access is not currently exposed to TORO.

Historical evidence from older repositories does not prove current health.

## Configuration gap matrix

| Check | TORO expected state | Current live state |
| --- | --- | --- |
| OpenClaw version | approved update channel, supported/current | UNKNOWN |
| Runtime | Node preferred unless reviewed exception | UNKNOWN |
| Gateway running as service | healthy/persistent as required | UNKNOWN |
| gateway.bind | loopback preferred | UNKNOWN |
| Tailscale | private Serve preferred for remote laptop access | UNKNOWN |
| gateway.auth | enabled/appropriate | UNKNOWN |
| DM isolation | per-channel-peer or per-account-channel-peer | UNKNOWN |
| Group isolation | per-group | UNKNOWN |
| WhatsApp dmPolicy | pairing/allowlist by default | UNKNOWN |
| WhatsApp allowFrom | explicit | UNKNOWN |
| groupPolicy | allowlist | UNKNOWN |
| approved group map | explicit/reviewed | UNKNOWN |
| group requireMention | true default for team groups | UNKNOWN |
| groupAllowFrom | explicit where required | UNKNOWN |
| ACP/bindings | mapped to TORO identities/rooms | UNKNOWN |
| multi-agent ownership | explicit if fleet is used | UNKNOWN |
| tool profile | least privilege | UNKNOWN |
| exec | denied for shared ingress | UNKNOWN |
| elevated | disabled for shared ingress | UNKNOWN |
| session visibility | constrained | UNKNOWN |
| agent-to-agent | disabled unless justified | UNKNOWN |
| identityLinks | TORO-verified only | UNKNOWN |
| security audit | recent plain + deep | UNKNOWN |
| doctor | clean/accepted findings | UNKNOWN |
| health/deep status | healthy | UNKNOWN |
| backups | recent verified | UNKNOWN |
| restore drill | evidence available | UNKNOWN |
| replay/idempotency | no duplicate TORO objects | UNKNOWN |
| redacted logs | no secrets/private overlogging | UNKNOWN |
| human escalation | tested | UNKNOWN |

## TORO recommended topology

### Personal / principal runtime

Use `openclaw_personal_owner`.

Characteristics:
- one trusted principal;
- private Tailnet access;
- stronger tools may be allowed by explicit policy;
- personal User Vault available.

### Dreamcatcher/team runtime

Use `openclaw_company_shared`.

Characteristics:
- different human identities;
- isolated DMs;
- group allowlists;
- restricted tools;
- organization context only;
- no personal User Vault;
- no founder host privileges inherited.

### Guest runtime

Use `openclaw_guest_channel`.

Characteristics:
- external/untrusted ingress;
- guest-safe knowledge;
- TORO TERE;
- Kross authority;
- no internal systems/HR/finance access.

## Trust-boundary decision

OpenClaw's security model treats one Gateway as one trust boundary.

TORO recommendation:
- do not use one unrestricted Gateway simultaneously as Mauricio's powerful personal agent and a shared employee/guest ingress;
- if personal and company scopes need materially different tool/security boundaries, run separate Gateway profiles/instances or equivalent isolation;
- they may still belong to one TORO Brain through governed connectors/context.

## Remote access recommendation

For a laptop/always-on private Gateway:
- keep `gateway.bind = loopback`;
- prefer Tailscale Serve for remote private HTTPS access;
- keep Gateway auth;
- avoid public Funnel unless a real requirement justifies it.

## Required first live commands

When host access is available:

```bash
openclaw --version
openclaw doctor
openclaw health
openclaw status --deep
openclaw channels list --all --json
openclaw channels status --probe --json
openclaw channels capabilities --channel whatsapp --json
openclaw security audit --json
openclaw security audit --deep --json
openclaw backup list --json
```

Then inspect sanitized effective configuration and bindings.

Do not run `security audit --fix` or change config in the first audit pass.

## Pass condition

Current state remains `configured_unverified` until live evidence proves:
- isolation;
- access policy;
- tools;
- health;
- security;
- backup/recovery;
- idempotency;
- TORO identity/authority integration.

