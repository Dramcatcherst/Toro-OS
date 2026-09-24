# TERE / WeSpeak V5 Runtime Rebaseline — 2026-09-24

**Scope:** Dreamcatcher guest communication runtime  
**Target:** Tere Identity & Operating Voice V5  
**Result:** WeSpeak runtime is known active; V5 consumption remains unverified.

## Canonical V5 configuration

Supabase readback on 2026-09-24:
- config key: `tere-identity-short-core`;
- title: `Tere Identity & Operating Voice V5`;
- status: `Active`;
- priority: `Critical`;
- updated_at: `2026-09-23 23:03:36.614864+00`;
- content MD5: `0cab1a8be477f9bc6f25ceaeb5df56c7`.

V5 includes the governed official Kross booking handoff and forbids stale-rate reuse.

## Runtime/mailbox recheck

Connected Gmail searches on 2026-09-24 found:
- no WeSpeak message after the V5 update timestamp;
- no WeSpeak result within the recent two-day search;
- no recent matching advisor/reservation-intent/in-stay alert evidence from the tested search terms.

This is evidence of **absence of observed mailbox proof**, not evidence that WeSpeak is inactive.

## Correct state

- WeSpeak runtime active historically: **VERIFIED**
- canonical V5 config in Supabase: **VERIFIED**
- post-V5 WeSpeak activity: **NOT OBSERVED**
- runtime version: **UNVERIFIED**
- runtime config hash: **UNVERIFIED**
- V5 consumption: **UNVERIFIED**
- tested channel continuity: **UNVERIFIED**
- real guest contact for config QA: **PROHIBITED**

## Prepared V5 QA

Canonical artifacts:
- `data/tere_v5_runtime_qa_cases_v1.json`;
- `data/tere_v5_runtime_evidence_template_v1.json`;
- `src/features/tere/runtime-evidence.ts`;
- `src/features/tere/runtime-acceptance.ts`;
- `docs/runbooks/TORO_TERE_WESPEAK_V5_RUNTIME_ACCEPTANCE_GATE.md`.

The quote-without-live-truth scenario now explicitly requires the official Kross safe handoff and forbids presenting that handoff as a TORO live quote.

## Boundary

No guest was contacted and no external message was sent by this rebaseline.

The blank evidence template is not runtime evidence.

V5 may be marked runtime-consumed only after isolated post-V5 evidence passes the canonical evaluator.
