# TORO Context / Visual Brain main verification — 2026-09-23

**Status:** VERIFIED CURRENT EVIDENCE  
**Main head:** `280f8e17e8427718bd82a02a55fe0f96a79df049`  
**Scope:** TORO Brain Identity/Context + first permission-scoped Visual Brain read

## Current main capability

Main now contains a coherent context/auth foundation rather than only type contracts:

- Supabase SSR browser/server/env foundation;
- `resolveToroContext()`;
- personal vs organization policy;
- login verification surface;
- `GET /api/brain/context` non-PII diagnostic;
- canonical Visual Brain read adapter `stage-c-read-v1`;
- Vitest test harness integrated into normal CI.

The previous statement “main has context types but not resolver implementation” is obsolete.

## CI / build evidence

GitHub Actions run:
- `35856973260`
- conclusion: **success**

Validated steps:
- npm ci;
- targeted tests;
- lint;
- build.

Vercel status for main head: **success**.

The prior auth/context main commit `672e015f0688bccfa592d6166cb4926729bc88c9` also completed GitHub Actions run `35841234513` successfully.

## Runtime deployment evidence

Verified Vercel deployment for auth/context main commit:
- deployment: `dpl_8dQG9Xh8QEbVrJLmA8rcc5JBwvGt`;
- git SHA: `672e015f0688bccfa592d6166cb4926729bc88c9`;
- state: READY;
- target: production;
- project: `toro-pr11-preview`.

A live anonymous fetch of:

`/api/brain/context`

was attempted without credentials.

Result:
- Vercel Deployment Protection returned `login_required`;
- the request did not reach the application route.

Interpretation:
- hosted app behavior is **not yet externally verified**;
- this is a platform access gate, not evidence of an application failure;
- do not weaken Deployment Protection merely to turn QA green.

## Context privacy contract

Current resolver behavior includes:
- authenticated identity required;
- organization data requires active, non-revoked role/membership evidence;
- personal context does not require organization membership;
- ADMIN/organization roles never unlock personal User Vault scope;
- explicit context choice required when multiple organizations are available;
- unauthorized requested organization fails closed;
- employee lookup failure fails closed.

Production still uses active `user_roles` as transitional membership evidence.

## Production membership state

Canonical Supabase current check:
- `public.organization_memberships` exists: **false**;
- active users with organization roles: **5**;
- active employees: **12**;
- active employees linked to user identity: **4**.

Therefore:
- persistent membership lifecycle remains a separate gate;
- current production data does not prove multi-organization behavior;
- no employee onboarding should begin from this evidence.

## Canonical Visual Brain read adapter

Current main now includes:
- `src/features/brain/canonical-read.ts`;
- contract `stage-c-read-v1`.

First read slice is intentionally bounded to:
- projects;
- source authority;
- domain governance;
- Kross source health.

The adapter:
- requires an active organization context;
- filters all reads by `org_id`;
- returns hashed/stable projection refs instead of canonical UUIDs;
- excludes free-text/private fields such as owner names, notes, next actions and raw source IDs;
- excludes finance, guests, payments and employees from the first slice.

Tests explicitly assert:
- raw org/project/authority/governance/Kross UUIDs do not appear;
- excluded private/free-text keys do not appear;
- finance/guest/payment/employee objects do not exist in the slice.

This is a valid Stage C read foundation, not proof that the full Visual Brain is production-ready.

## Current VS3 state

`CODE_IN_MAIN_CI_VERIFIED_HOSTED_QA_BLOCKED_BY_DEPLOYMENT_PROTECTION`

Remaining gates:
1. approved hosted synthetic/user-scoped access or an authorized automation bypass;
2. Founder/restricted allowed + denied access E2E;
3. revocation/logout/session/cookie behavior;
4. mobile + desktop hosted QA;
5. persistent `organization_memberships` design/RLS isolated validation;
6. synthetic multi-org proof;
7. explicit later launch decision before employee onboarding.

## Rules

Do not:
- disable deployment protection only for QA convenience;
- use employee credentials as fixtures;
- link employees by name;
- apply organization membership DDL to production without isolated validation;
- describe unit tests as hosted E2E;
- expose canonical raw IDs or private fields through Visual Brain;
- create another context resolver or Brain read path.
