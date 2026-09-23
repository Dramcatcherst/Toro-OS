# TORO Runtime Inventory Contract — Initial Evidence — 2026-09-23

**Contract:** `docs/product/TORO_RUNTIME_INVENTORY_CONTRACT_V1.md`  
**Machine contract:** `data/toro_runtime_inventory_contract_v1.json`  
**Validator:** `scripts/runtime-inventory-validator.mjs`  
**Tests:** `tests/runtime-inventory-validator.test.mjs`

## Reason for change

Agent/personality/skill configuration is now aligned across GitHub, Airtable and relevant Supabase knowledge/config rows, but direct runtime identity remains unverified.

Without a runtime manifest there is no reliable way to prove:
- which skill version is loaded;
- which profile/config version is loaded;
- which playbooks are present;
- what workflow A-level is active;
- what tools/actions are actually enabled;
- which source authorities are current;
- whether a passing evaluation belongs to the intended runtime.

## Contract behavior

The validator fails closed on:
- wrong canonical skill for the agent;
- cross-agent or unknown loaded playbooks;
- L0–L5 autonomy labels in runtime workflow authority;
- secret-like fields;
- VERIFIED claims with unknown runtime/config identity;
- invalid/missing config SHA-256;
- incomplete 10-case evaluation;
- any critical failure;
- missing workflow/source authority;
- missing fallback/rollback;
- missing evidence refs.

OBSERVED manifests may contain UNKNOWN version fields, but cannot become VERIFIED.

## Current target state

No actual target is promoted by this contract.

| Target | Expected owner/skill | State |
|---|---|---|
| Codex/Builder runtime | SOBRESITO / `sobresito-systems` | UNVERIFIED |
| OpenClaw owner/staff TORO | TORO / `toro-brain` | UNVERIFIED |
| OpenClaw TERE | TERE / `tere-revenue` | UNVERIFIED |
| WeSpeak TERE | TERE / `tere-revenue` | UNVERIFIED |
| TORO Portal | TORO / `toro-brain` | UNVERIFIED |

These entries are observation targets, not existence/version claims.

## Related current evidence

- 60-case contract support: 60/60.
- Runtime-tested cases: 0/60.
- Runtime-verified cases: 0/60.
- Static Agent Steward: VERIFIED / `OBSERVE_STATIC_CI`.
- TERE Supabase voice/config V2: APPLIED; WeSpeak/OpenClaw consumption UNVERIFIED.
- Canonical autonomy: A0–A6 per workflow; no global A5/A6.

## Next

1. Obtain one read-only manifest from an actual accessible runtime.
2. Validate it without changing runtime state.
3. Preserve it as evidence.
4. If OBSERVED, identify exact missing identity/hash fields.
5. Execute that agent's 10 canonical cases in isolated QA.
6. Promote to VERIFIED only after both inventory and behavior gates pass.

No new runtime database, secret store or agent registry is justified by this contract.
