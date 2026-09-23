# TORO Runtime Inventory Contract V1

**Date:** 2026-09-23  
**Status:** canonical subordinate specification  
**Machine contract:** `data/toro_runtime_inventory_contract_v1.json`  
**Validator:** `scripts/runtime-inventory-validator.mjs`

## 1. Why this exists

TORO currently has a clean architecture/configuration layer, but runtime identity is still the largest unverified gap.

A runtime must not be described as “updated”, “live”, “using the new personality”, “running the canonical skill” or “verified” merely because:
- a prompt/config exists;
- Airtable/Supabase is updated;
- code is merged;
- a deployment is Ready;
- the model says it loaded the config;
- one conversation looks correct.

The runtime must prove what it is actually using.

## 2. Manifest rule

Every runtime observation should produce one secret-free manifest.

Required dimensions:

### Runtime identity
- runtime_id;
- runtime_type;
- environment;
- verification_state;
- observed_at;
- runtime_version;
- runtime_build_ref.

### Agent/skill identity
- canonical agent;
- canonical skill;
- skill version;
- config/profile version;
- config SHA-256;
- loaded canonical playbooks.

### Model
Record provider/model/version only when observable. Model identity is evidence, not business authority.

### Tools and actions
For each enabled tool:
- tool key;
- mode;
- scope;
- whether directly verified.

### Workflow autonomy
For each relevant workflow:
- workflow key;
- canonical A0–A6 level;
- policy reference;
- whether verified.

Historical L-levels are invalid here.

### Source authority
For every material domain used by the runtime:
- domain;
- source system;
- freshness state;
- verification state.

### Evaluation
- suite ID;
- last run timestamp;
- cases run/passed;
- critical failures;
- runtime_verified boolean.

### Recovery
- fallback;
- rollback reference.

## 3. Verification states

### UNVERIFIED
Expected/configured/declared, but direct runtime evidence is incomplete.

This is the correct state for current TORO/TERE runtime claims when exact version/hash is unavailable.

### OBSERVED
The runtime inventory was directly inspected read-only.

OBSERVED may still contain UNKNOWN version/config fields.

It cannot automatically become VERIFIED.

### VERIFIED
Requires all of:

1. known runtime version;
2. known runtime build reference;
3. correct canonical agent/skill pairing;
4. known skill version;
5. known config/profile version;
6. valid `sha256:<64 hex>` config hash;
7. only playbooks owned by the declared agent;
8. canonical A0–A6 workflow authority;
9. no secret-like fields;
10. canonical evaluation suite;
11. 10/10 cases for that agent;
12. zero critical failures;
13. runtime evaluation marked verified;
14. evidence references;
15. declared workflow authorities directly verified.

A VERIFIED claim that fails one gate is invalid and the validator fails closed.

## 4. No secrets

Inventory artifacts must never contain:
- passwords;
- API keys;
- access/refresh tokens;
- cookies/session cookies;
- private keys;
- MFA/PIN/recovery codes;
- client secrets;
- any equivalent credential.

The validator rejects secret-like field names.

Evidence should reference a secure location/status, never copy the secret.

## 5. Canonical pairing

| Agent | Skill |
|---|---|
| TORO | `toro-brain` |
| TERE | `tere-revenue` |
| RICO | `rico-operations` |
| FIONA | `fiona-finance` |
| SKY | `sky-growth` |
| SOBRESITO | `sobresito-systems` |

Loaded playbooks must belong to the same declared agent.

## 6. Expected observation targets

These are **targets to inspect**, not claims that the current runtime exists or is current:

- Codex/Builder under SOBRESITO;
- OpenClaw owner/staff TORO runtime, where configured;
- OpenClaw TERE runtime, where configured;
- WeSpeak TERE;
- TORO Portal.

Each remains UNVERIFIED until direct evidence is captured.

## 7. Relationship to Agent Steward

Current Steward state:

`OBSERVE_STATIC_CI`

Next intended state:

`OBSERVE_RUNTIME_READONLY`

The Steward may move to read-only runtime observation only when:
- a supported adapter can retrieve this manifest without mutation;
- no secrets are returned;
- source/runtime identity is authenticatable;
- the observation itself is logged;
- runtime access does not broaden permissions.

Read-only observation does not grant:
- configuration write;
- skill promotion;
- runtime restart;
- external send;
- permission change;
- agent lifecycle action.

## 8. Relationship to the 60-case suite

The inventory contract identifies **what** was tested.

The 60-case suite evaluates **how it behaves**.

Both are required.

Without inventory:
> good output may have come from an unknown or stale config.

Without evaluation:
> correct version/hash does not prove correct behavior.

## 9. Storage

Do not create a new runtime database by default.

Preferred order:
1. runtime emits/exports manifest;
2. validate manifest;
3. preserve it as evidence;
4. reference it from existing TORO knowledge/audit structures;
5. add a dedicated runtime table only if repeated operational needs prove the existing structures insufficient.

## 10. Current status

### HECHO
- contract defined;
- validator implemented in branch;
- tests define failure behavior;
- canonical agent/playbook mapping is machine-readable.

### UNVERIFIED
- current Codex/Builder manifest;
- current OpenClaw TORO manifest;
- current OpenClaw TERE manifest;
- current WeSpeak TERE manifest;
- current TORO Portal manifest;
- actual skill/config versions/hashes;
- runtime 60-case results.

Do not promote these targets based on this specification alone.
