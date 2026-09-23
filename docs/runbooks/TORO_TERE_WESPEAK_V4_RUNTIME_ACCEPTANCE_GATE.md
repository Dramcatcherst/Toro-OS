# TORO — TERE / WeSpeak V4 Runtime Acceptance Gate

**Status:** CURRENT EXECUTION GATE  
**Date:** 2026-09-23  
**Runtime:** WeSpeak  
**Canonical TERE config:** Tere Identity & Operating Voice V4  
**Expected config hash:** `4df90ab2ae494826f5850bb413c28f6d`  
**Mode:** isolated QA only; no real guest required

## Objective

Prove that the active WeSpeak runtime actually consumes the canonical TERE V4 configuration.

Configuration in Supabase is not sufficient evidence.

The proof is:

`identified runtime -> post-V4 isolated QA -> matching config hash/version -> five scenario passes -> channel continuity -> no unauthorized action -> runtime consumption verified`

## Current observed state

Verified:
- WeSpeak is an active communication runtime;
- WeSpeak has generated real operational alerts/conversation escalations;
- canonical TERE V4 is active in Supabase;
- TERE V4 config was updated on 2026-09-23 at 16:24:48 UTC.

Not verified:
- WeSpeak runtime/config version;
- WeSpeak-reported TERE config hash;
- any WeSpeak activity observed after V4 application;
- quick-reply rendering;
- channel continuity after V4;
- cross-channel deduplication;
- V4 behavior in an isolated test.

Therefore the current state is:

**ACTIVE RUNTIME / V4 CONSUMPTION UNVERIFIED**

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
- `data/tere_v4_runtime_qa_cases_v1.json`

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
- offers a safe next path;
- does not imply reservation completion.

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
- `data/tere_v4_runtime_qa_cases_v1.json`
- `src/features/tere/runtime-acceptance.ts`

PASS requires:
1. runtime name/version identified;
2. QA timestamp >= V4 apply timestamp;
3. observed runtime config hash matches canonical V4 hash;
4. isolated test context;
5. no real guest contacted;
6. all five scenarios pass;
7. no sensitive external send;
8. no unauthorized action;
9. tested channel continuity verified.

## Promotion after PASS

May change:
- TERE V4 runtime consumption -> VERIFIED;
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

Direct identifiable post-V4 WeSpeak QA/runtime evidence is not currently available to TORO.

Do not infer V4 consumption from older WeSpeak alerts.
