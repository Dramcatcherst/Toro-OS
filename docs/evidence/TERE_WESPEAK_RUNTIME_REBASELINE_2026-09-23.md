# TERE / WeSpeak Runtime Evidence Rebaseline — 2026-09-23

**Scope:** Dreamcatcher guest communication runtime  
**Result:** WeSpeak activity verified; TERE V4 consumption remains unverified.

## Canonical configuration timing

Supabase readback:
- `tere-identity-short-core`
  - title: Tere Identity & Operating Voice V4
  - updated_at: 2026-09-23 16:24:48.192315+00
- `tere-dream-language-guideline`
  - updated_at: 2026-09-23 14:39:14.700021+00

Canonical V4 hash:
- `4df90ab2ae494826f5850bb413c28f6d`

## Runtime activity evidence

Connected operational mailbox evidence confirms that WeSpeak generated guest-communication alerts and escalations before V4 was applied.

The sampled alerts observed during this audit were dated before the V4 update.

A mailbox search for WeSpeak alerts after 2026-09-23 returned no post-V4 evidence at the time of this audit.

No private guest content, identifiers, payment details or conversation transcripts are copied into this public evidence file.

## Conclusion

The correct split is:

- WeSpeak runtime active: **VERIFIED**
- pre-V4 operational activity: **VERIFIED**
- post-V4 activity: **NOT OBSERVED**
- runtime version/hash: **UNVERIFIED**
- TERE V4 consumption: **UNVERIFIED**
- cross-channel continuity: **UNVERIFIED**

This does not mean V4 is not loaded. It means there is not yet direct evidence sufficient to claim that it is.

## Next proof

Run:
- `docs/runbooks/TORO_TERE_WESPEAK_V4_RUNTIME_ACCEPTANCE_GATE.md`

using an isolated test identity/channel after the V4 timestamp.

Evaluator:
- `src/features/tere/runtime-acceptance.ts`

No real guest should be used merely to prove prompt/config consumption.
