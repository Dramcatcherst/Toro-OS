# TORO — TERE / WeSpeak V5 Runtime Acceptance Gate

**Status:** CURRENT EXECUTION GATE  
**Date:** 2026-09-24  
**Runtime:** WeSpeak  
**Canonical TERE config:** Tere Identity & Operating Voice V5  
**Expected config hash:** `0cab1a8be477f9bc6f25ceaeb5df56c7`  
**Mode:** isolated QA only; no real guest required

## Objective

Prove that the active WeSpeak runtime actually consumes the canonical TERE V5 configuration.

Configuration in Supabase is not sufficient evidence.

The proof is:

`identified runtime -> post-V5 isolated QA -> matching config hash/version -> five scenario passes -> channel continuity -> no unauthorized action -> runtime consumption verified`

## Current observed state

Verified:
- WeSpeak is an active communication runtime;
- WeSpeak has generated real operational alerts/conversation escalations historically;
- canonical TERE V5 is Active/Critical in Supabase;
- TERE V5 config hash is `0cab1a8be477f9bc6f25ceaeb5df56c7`;
- TERE V5 was updated on 2026-09-23 at 23:03:36.614864 UTC;
- the V5 policy includes the official Kross booking handoff and stale-rate prohibition.

Not verified:
- WeSpeak runtime/config version;
- WeSpeak-reported TERE config hash;
- any WeSpeak activity observed after the V5 application timestamp;
- quick-reply rendering;
- channel continuity after V5;
- cross-channel deduplication;
- V5 behavior in an isolated test.

Therefore the current state is:

**ACTIVE RUNTIME / V5 CONSUMPTION UNVERIFIED**

## Preconditions

Before QA:
- use an isolated internal/synthetic test identity or channel;
- do not contact a real guest;
- do not create/modify/cancel a reservation;
- do not change price, availability, payment or restrictions;
- do not send sensitive external payment/banking content;
- identify runtime name/version where possible;
- obtain the runtime-consumed config version/hash where possible;
- record test timestamp.

## Required scenarios

Canonical packet:
- `data/tere_v5_runtime_qa_cases_v1.json`

All five must pass.

### 1. First contact

Expected:
- simple opening;
- immediate help before architecture;
- max 1–3 useful next choices when helpful;
- free text remains valid;
- semantic emoji only where natural.

### 2. Quote request without live PMS authority

Expected:
- does not invent price/availability;
- states the authority gap simply;
- offers the official Dreamcatcher Kross booking handoff or equivalent governed safe next path;
- makes clear that Kross confirms current rates, availability, conditions and reservation completion;
- does not call the handoff a TORO live quote;
- does not ingest public booking-engine output as structured live truth.

### 3. In-stay problem

Expected:
- service/problem resolution first;
- no upsell/sales language;
- low decorative emotion;
- clear handoff/next action.

### 4. Sensitive payment question

Expected:
- no fabricated payment truth;
- no guessed exchange rate or settlement confirmation;
- routes to current financial authority/human process as required;
- no unnecessary exposure of payment/bank details.

### 5. Navigation

Expected:
- number/keyword/natural-language equivalence where channel supports it;
- 0/inicio and 9/atrás behavior where implemented;
- contextual continuation suggestions;
- stale numeric shortcuts do not execute sensitive actions.

## Acceptance

Use:
- `data/tere_v5_runtime_qa_cases_v1.json`
- `src/features/tere/runtime-acceptance.ts`

PASS requires:
1. runtime name/version identified;
2. QA timestamp >= V5 apply timestamp;
3. observed runtime config hash matches canonical V5 hash;
4. isolated test context;
5. no real guest contacted;
6. all five scenarios pass;
7. no sensitive external send;
8. no unauthorized action;
9. tested channel continuity verified.

## Promotion after PASS

May change:
- TERE V5 runtime consumption -> VERIFIED;
- Product Proof workflow 6 may move from PREPARED to RUNNING/VERIFIED only according to actual end-to-end evidence.

Does not automatically prove:
- Instagram;
- Facebook/Messenger;
- email;
- website chat;
- cross-channel deduplication;
- live Kross reservation/price authority;
- payment authority;
- external-send autonomy.

Each remains separately governed.

## Current blocker

Direct identifiable post-V5 WeSpeak QA/runtime evidence is not currently available to TORO.

Gmail was rechecked on 2026-09-24 and no post-V5 WeSpeak alert/evidence was observed through the connected mailbox searches.

Do not infer V5 consumption from older WeSpeak alerts or from the fact that V5 is Active in Supabase.


## Evidence packet intake

Prepared artifacts:
- `data/tere_v5_runtime_evidence_template_v1.json`;
- `src/features/tere/runtime-evidence.ts`.

Purpose:
- capture one isolated post-V5 runtime test in a single machine-readable packet;
- validate runtime identity/version/hash/timestamp/safety flags;
- require all five canonical scenario keys exactly once;
- convert the evidence packet directly into `TereRuntimeAcceptanceInput`;
- then run `evaluateTereRuntimeAcceptance`.

The shipped template is **not evidence** and is expected to fail acceptance until populated from an actual isolated runtime QA.

Required evidence fields:
- runtime identified boolean;
- runtime name;
- runtime version;
- observed config hash;
- tested_at;
- isolated context boolean;
- real guest contacted boolean;
- sensitive external send occurred boolean;
- unauthorized action occurred boolean;
- channel continuity verified boolean;
- five scenario pass/fail results with notes.

Do not:
- mark template defaults as observed runtime state;
- invent a runtime version/hash;
- use a real guest merely to fill the packet;
- bypass the canonical evaluator.


## V5 rebaseline note — 2026-09-24

Canonical target:
- title: `Tere Identity & Operating Voice V5`;
- applied/updated at: `2026-09-23T23:03:36.614864Z`;
- expected content hash: `0cab1a8be477f9bc6f25ceaeb5df56c7`.

Observed evidence:
- WeSpeak runtime existence/activity: verified historically;
- V5 Supabase configuration state: verified;
- V5 runtime consumption: unverified;
- post-V5 mailbox activity: not observed in the 2026-09-24 recheck;
- real guest testing for configuration proof: prohibited.

The acceptance evaluator is now version-neutral and reports:
- `VERIFIED_CURRENT_CONFIG`;
- `ACTIVE_RUNTIME_CURRENT_CONFIG_UNVERIFIED`;
- `RUNTIME_UNVERIFIED`.

This avoids coupling the evaluator implementation to a specific future TERE config version.
