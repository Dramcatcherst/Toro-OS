# TERE Runtime Configuration Consolidation V2 — 2026-09-23

**Scope:** Supabase `private.tere_configuration`  
**Canonical personality/format:** `docs/product/TORO_AGENT_AND_SKILL_SYSTEM_V1.md`  
**Rollback snapshot:** `docs/evidence/TERE_RUNTIME_CONFIG_PRECONSOLIDATION_2026-09-23.json`

## Finding

Active TERE runtime configuration still contained multiple overlapping April/September personality/tone packs.

Material conflicts with current canonical profile included:
- old `80% reality / 20% surprise` guidance;
- directives to elevate normal hotel messages by default;
- repeated “dream / magic / special” framing;
- a 20-response pack with repeated ✨ and dream-heavy formulas;
- duplicated identity/tone instructions competing with the newer compact profile.

This created prompt/context drift even though the Airtable agent profile and Supabase compact-context contract had already been modernized.

## Applied change

### Active V2 identity
Updated existing key:

`tere-identity-short-core`

Now:
- title: `Tere Identity & Operating Voice V2`;
- priority: Critical;
- last reviewed: 2026-09-23;
- source: TORO Brain / Agent & Skill System;
- voice principle: **80% useful reality / 15% Dreamcatcher identity / 5% surprise**;
- default format: direct answer -> one useful detail -> one easy next step;
- recommendation max: 1–3 verified options;
- serious complaint/safety mode disables sales, humor, dream language and decorative emoji;
- language/formality mirror;
- dynamic truth always resolved from current authority;
- explicit privacy/session isolation;
- configuration existence does not prove runtime consumption.

### Active V2 dream-language rule
Updated existing key:

`tere-dream-language-guideline`

Now:
- dream language is an emotional accent, not the default format;
- appropriate mainly for welcome, confirmation, arrival, special moments and goodbye;
- avoid for rates, availability, payments, policies, schedules, Wi-Fi, parking, technical answers, problems, complaints and safety;
- no mechanical ✨ repetition;
- no artificial “elevation” of every normal message;
- 80/15/5 principle;
- dream language = 0 for conflict/complaint/safety.

### Superseded, not deleted
Changed from Active to `Superseded`:

1. `tere-brand-core-dream-state`
2. `tere-tone-dream-experience`
3. `tere-real-responses-20-pack`
4. `tere-20-suggestions-dream-state`
5. `tere_directrices_presentacion_valor_2026_04_16`
6. `tere-real-responses-concept-next-step`

All historical content remains preserved for provenance and rollback.

## Verification

Readback after transaction confirmed:
- `tere-identity-short-core` = Active / Critical / V2;
- `tere-dream-language-guideline` = Active / Critical / V2;
- six legacy personality/tone packs = Superseded.

Residual active-pattern scan searched for:
- old 80/20 language;
- “elevate every message” language;
- “everything must be dream/magic” style;
- repeated emoji-heavy formulas.

The only matches were non-conflicting:
- the demo/test disclosure contains its intentionally bounded first-turn ✨ examples;
- V2 dream guideline contains the explicit prohibition “No elevar artificialmente cada mensaje normal.”

No active old 80/20 personality directive remained in the scanned TERE configuration.

## Status

**CONFIG_APPLIED / RUNTIME_CONSUMPTION_UNVERIFIED**

This proves Supabase configuration reconciliation only.

It does **not** prove:
- WeSpeak loaded the new rows;
- OpenClaw loaded the new rows;
- old cached prompt/context is absent;
- a runtime version/hash matches this configuration;
- real guest outputs follow the new format.

Those claims require the runtime inventory contract + isolated QA/evaluation.

## Rollback

Restore the eight rows from:
`docs/evidence/TERE_RUNTIME_CONFIG_PRECONSOLIDATION_2026-09-23.json`

No rows were deleted.
