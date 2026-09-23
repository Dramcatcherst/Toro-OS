# TORO Phase 1 -> main Context Extraction Audit — 2026-09-23

**Status:** CURRENT EXECUTION EVIDENCE  
**Master:** TORO Brain General Plan  
**Related proof:** Dreamcatcher Cognitive Proof VS3 — People / Identity / Access  
**Phase 1 PR:** #15  
**Context integration PR:** #42  
**Reviewed Phase 1 head:** `d3035efe65463043313a61b733fab51ff57b2f7c`

## Decision

> **DO NOT EXTRACT `resolveToroContext()` ALONE.**

The context resolver is not a standalone utility in the current codebase.

Current `main` contains the context type contract, but it does not contain the server-side Supabase/Auth foundation that the resolver imports and relies on.

A safe integration must be a coherent auth/context slice, not one copied file and not a wholesale merge of the diverged Phase 1 branch.

## Current main observations

Present:
- `src/features/context/types.ts`

Not present:
- `src/lib/supabase/server.ts`
- `src/lib/supabase/env.ts`
- `src/features/auth/roles.ts`
- `src/features/context/resolver.ts`
- `src/features/context/policy.ts`
- `src/features/context/legacy-session-adapter.ts`

Main `package.json` does not currently declare:
- `@supabase/ssr`
- `@supabase/supabase-js`
- `vitest`

## Phase 1 dependencies

The reviewed Phase 1 head contains:

### Supabase foundation
- `src/lib/supabase/browser.ts`
- `src/lib/supabase/env.ts`
- `src/lib/supabase/env.test.ts`
- `src/lib/supabase/server.ts`

### Auth / role foundation
- `src/features/auth/roles.ts`
- `src/features/auth/roles.test.ts`
- `src/features/auth/session.ts`
- `src/features/auth/session.test.ts`
- plus login/sign-out/navigation surfaces used by the larger Phase 1 shell

### Context unit
- `src/features/context/types.ts`
- `src/features/context/policy.ts`
- `src/features/context/resolver.ts`
- `src/features/context/resolver.test.ts`
- `src/features/context/legacy-session-adapter.ts`
- `src/features/context/legacy-session-adapter.test.ts`

### Membership target
- `supabase/drafts/20260923_organization_memberships.sql`
- remains DRAFT / AUTO-ROLLBACK / NOT production

## Targeted fixture evidence already present in Phase 1

Observed targeted tests:
- resolver: 9
- legacy-session adapter: 8
- total: 17

Coverage includes:
- personal context without organization role;
- single organization resolution;
- explicit multi-org choice;
- requested authorized organization;
- unauthorized organization denial;
- ADMIN not unlocking personal vault;
- personal isolation during role-store failure;
- organization fail-closed on role read failure;
- employee relationship read failure;
- Founder requiring ADMIN/GERENCIA in active organization;
- personal context not receiving legacy organization role;
- mismatched-organization membership denial.

This evidence is useful, but it is not equivalent to hosted authenticated E2E on the current `main` architecture.

## Package / lock audit

Current main:
- Next: 16.3.6
- eslint-config-next: 16.3.6
- Playwright root: 1.60.x contract
- package-lock package entries: 445

Reviewed Phase 1:
- Next: 16.3.5
- eslint-config-next: 16.3.5
- additional Supabase/test dependencies
- package-lock package entries: 604

Lock comparison:
- Phase 1-only package entries: **159**
- package entries differing between the locks: **24**
- differences include Next/SWC, eslint-config-next, browserslist ecosystem and Playwright resolution.

Therefore:

> copying the Phase 1 `package-lock.json` wholesale into current `main` is prohibited.

It could silently downgrade or drift the current runtime dependency set.

## Coherent extraction contract

The next integration slice must:

1. start from current `main`;
2. preserve current main dependency versions unless an explicit upgrade decision is made;
3. add only the Supabase/Auth/test dependencies required by the extracted slice;
4. regenerate/reconcile the package lock against current main rather than copying the Phase 1 lock wholesale;
5. integrate the Supabase env/server client contract;
6. integrate canonical role mapping needed by the context boundary;
7. integrate context policy + resolver;
8. preserve or recreate the legacy-session parity boundary only where required for current behavior;
9. bring the targeted synthetic tests with the implementation;
10. keep `organization_memberships` as draft/non-production until isolated DB/RLS validation passes;
11. pass type/build/test/preview validation;
12. then run hosted synthetic identity isolation QA;
13. do not contact or provision employees as part of this integration.

## Non-goals

This extraction is not permission to:
- merge all 68 changed files of PR #15;
- downgrade current main packages;
- apply membership DDL to production;
- provision employees;
- retire current auth/role behavior without parity;
- create a second authentication or context system.

## Exit criteria

The Phase 1 context foundation is considered reconciled with main only when:

- current main builds with the new auth/context foundation;
- targeted fixture tests pass on the extracted code;
- current Founder/role behavior has parity evidence;
- personal vs organization isolation passes;
- denied-org and synthetic multi-org cases pass;
- no personal vault access leaks into organization context;
- preview is healthy;
- production membership schema remains unchanged unless separately approved/tested.

Until then VS3 remains:

`PREPARED_BLOCKED_BY_PHASE1_MAIN_INTEGRATION`
