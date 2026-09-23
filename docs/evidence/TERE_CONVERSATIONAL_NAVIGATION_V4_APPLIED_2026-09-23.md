# TERE Conversational Navigation V4 — Applied Configuration Evidence

**Date:** 2026-09-23  
**Scope:** Supabase `private.tere_configuration`  
**Key:** `tere-identity-short-core`  
**Status:** CONFIG_APPLIED / RUNTIME_CONSUMPTION_UNVERIFIED

## Applied

The active TERE core profile was updated to:

- title: **Tere Identity & Operating Voice V4**;
- status: Active;
- priority: Critical;
- last reviewed: 2026-09-23;
- content MD5 after update: `4df90ab2ae494826f5850bb413c28f6d`.

V4 adds:
- conversation-first interaction;
- number, keyword and natural-language equivalence;
- 0/menu/home, 9/back and +/more navigation conventions where supported;
- 1–3 contextual next-step suggestions after normal responses;
- lifecycle-aware menus for prospect, booked guest and in-stay issue;
- guest-safe personalization only from verified identity/session/current context;
- semantic emoji for scanning;
- suppression of decorative emotion/sales during complaints, safety and sensitive money disputes;
- stale numeric shortcuts must not be used to execute sensitive actions after material context changes.

## Verification

Readback confirmed:
- V4 title active;
- V4 menu section present;
- shortcut rule present;
- conversation-first rule present.

## Important limitation

This configuration evidence does **not** prove:
- WeSpeak consumed V4;
- OpenClaw consumed V4;
- quick-reply buttons are implemented on any specific channel;
- Instagram/Facebook/email/web bindings are live;
- channel continuity/deduplication is runtime-verified.

Those claims require identifiable runtime version/hash plus isolated QA.

## Rollback

Rollback is additive/reversible:
- restore the previous V3 content/title from Supabase history/evidence;
- or remove the exact `CONVERSATIONAL NAVIGATION V4` appended section and restore title `Tere Identity & Operating Voice V3`.

No row was deleted and no permission/autonomy level was changed.
