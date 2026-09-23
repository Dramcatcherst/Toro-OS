# TERE V5 — Official Kross Booking Handoff Applied

**Date:** 2026-09-23  
**Scope:** Dreamcatcher Hotel / TERE canonical configuration  
**Source:** `private.tere_configuration`  
**Key:** `tere-identity-short-core`  
**State:** CONFIG APPLIED / RUNTIME CONSUMPTION UNVERIFIED

## Applied change

Canonical TERE configuration now includes **OFFICIAL BOOKING HANDOFF V5**.

When live structured price/availability authority is unavailable inside TORO:
- TERE must not invent or reuse stale rates as current;
- TERE may collect the minimum useful trip context;
- TERE may recommend 1–3 verified stay options by fit;
- final live price/availability confirmation is handed off to:
  - `https://dreamcatcherhotel.kross.travel/`;
- TERE must not claim it produced a live quote when the user only continued to Kross;
- the public booking result must not be promoted into TORO as structured live truth without an authorized transport;
- if the guest returns with a Kross result, TERE may continue helping with comparison/context while Kross remains transactional authority.

## Verification

Observed after update:
- title: `Tere Identity & Operating Voice V5`;
- status: `Active`;
- priority: `Critical`;
- MD5: `0cab1a8be477f9bc6f25ceaeb5df56c7`;
- official booking handoff rule present: true;
- stale-rate prohibition present: true;
- official Kross URL present: true.

## Boundary

This evidence proves configuration state only.

It does **not** prove:
- WeSpeak consumes V5;
- OpenClaw consumes V5;
- channel continuity;
- live quote capability inside TORO;
- public booking-engine scraping;
- Kross API activation.

Runtime consumption remains independently gated.
