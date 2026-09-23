# TORO Visual Preparation Preflight Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for this isolated, preparation-only slice.

**Goal:** Convert the approved visual-truth rules in issue #30 into a deterministic, testable preparation check before any image processing or publication.

**Architecture:** Add a pure helper beside the existing policy engine, consuming its PolicyDecision and trusted, ephemeral evidence supplied by future server adapters. Do not create a new registry, API, agent runtime, publisher, approval ledger or authority model. An accepted request is a draft eligible for human review, never permission to execute or publish.

**Tech Stack:** Existing TypeScript; Node built-in test runner; no added dependencies.

**Spec:** Dramcatcherst/Toro-OS#30, with #3 for authenticated preparation, #6 for source resolution and #28 for the website channel. Subordinate to docs/product/TORO_BRAIN_GENERAL_PLAN.md.

## Global Constraints
- Supabase owns TORO runtime; Dropbox originals; GitHub contracts/code; specialist transactional authority unchanged.
- Read-only preparation. externalWrite, executionAllowed and publishAllowed are always false.
- Keep originals unchanged. No object removal, room regeneration or defect concealment through this helper.
- Trusted evidence must come from server-side authorization/source/policy adapters, NEVER request bodies or model output.
- No claim of image truth from a checksum or metadata flags alone. Human comparison and destination validation remain required.
- Neither main nor production is modified. Work on a separate review branch.
- No new dependencies, SQL, credentials, recurring jobs, API calls or automatic image edits.

## Review Focus
1. Unknown/malformed input and string booleans must fail closed without crashing.
2. Expired/future evidence, mismatched identity/scope/channel and unknown transforms must not pass.
3. Matching metadata hashes are not proof of visually faithful content or live authorization.
4. Publication must remain disabled even for owner-approved and fully prepared fixtures.
5. Unknown original, missing rights/privacy, physical issues and unbounded costs need explicit blockers/owners.

## Task 1: Preparation helper and regression suite
Files: src/lib/visual-preflight.ts; tests/visual-preflight.test.mjs.
Interface: evaluateVisualPreflight(request: unknown, evidence: unknown, nowMs: number): VisualPreflightDecision.
- [x] Create tests with explicitly synthetic fixtures and a blocked stub.
- [x] Run `node --experimental-strip-types --test tests/visual-preflight.test.mjs` and record expected assertion failures.
- [x] Implement validated preparation-only logic. Preserve existing PolicyDecision shape; use existing policy decision as a non-overridable prerequisite.
- [x] Repeat tests; run isolated strict TypeScript validation against unchanged dependency snapshots.
- [x] Add the test command to existing CI without modifying permissions or deployment rules.

## Task 2: Read-only evidence and integration handoff
- [x] Exercise the helper on a real inherited asset reference with unknown live source/authorization explicitly unset, not fabricated.
- [ ] Record exact unresolved conditions and the source-resolution connector failure in #6; do not infer missing/deleted assets from a failed search.
- [ ] Link code/review evidence from #30 and #28; record global gallery QA result from workflow 35820134344.
- [ ] Re-read the committed file/PR and report code-tested vs runtime-integrated vs published separately.

## Verification and rollback
Local tests/type checking cover only this pure helper and its inspected dependencies. Full app lint/build belongs to CI and is reported separately. Remove/revert the review branch changes to undo; there are no external writes to compensate. The Dropbox search schema failure and container DNS restriction are environmental blockers, not evidence of lost photos. Upstream identity/runtime reconciliation remains open in #3.

## Execution evidence
- Local Node 22.16.0: RED 41 failed/3 passed with blocked stub; GREEN 44/44 passed with implementation.
- Isolated strict TypeScript check passed against exact unchanged policy-engine.ts and toro-types.ts snapshots, verified by Git blob hashes.
- Real inherited registry-reference dry run: BLOCKED. No source bytes, authenticated grant or privacy evidence were fabricated. This is NOT an edited image or a completed publication workflow.
- Existing gallery PR74 global workflow 35820134344 now reports verify and qa:e2e SUCCESS. That belongs to website PR74, not to this helper's tests.
- Container could not resolve github.com; full checkout/install/build was not performed locally. Files were read through the authorized connector. Full repository CI result must be read separately.
- Independent fresh-context code review remains required before integration. Local self-review does not replace it.

## Remaining integration gates
The helper has no network calls, persistence, credentials, image editor, live grant verification, API registration, agent activation or publisher. #3/#6 must construct trustworthy evidence, including canonical scope and asset identity, current grant, original-byte hash, rights/privacy, appearance review, destination policy and bounded budget. No client can supply its own clearance. An accepted draft still needs actual before/after QA, signed approval for the exact derivative/channel, and publication verification. Existing public photographs are not disabled or reapproved by this work.

Rollback: revert the review commit or close the PR. No original, business record, account permission or production setting is changed.
