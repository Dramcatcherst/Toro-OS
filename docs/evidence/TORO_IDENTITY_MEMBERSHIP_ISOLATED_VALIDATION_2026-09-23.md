# TORO Identity Membership — isolated validation evidence

**Date:** 2026-09-23  
**Status:** ISOLATED VALIDATION PASS / PRODUCTION NOT APPLIED  
**Canonical target:** `identity.organization_memberships`  
**Canonical Supabase:** `abtyrbqlqbsastmridzp`

## Architecture decision

The canonical membership table belongs in the dedicated `identity` schema:

`identity.organization_memberships`

The historical Phase 1 draft that used `public.organization_memberships` is not canonical.

Current production read-only verification:
- `identity` schema exists: false;
- `identity.organization_memberships` exists: false;
- `public.organization_memberships` exists: false.

No production DDL was applied in this validation.

## Versioned draft

PR #67 merged as:

`4b6da23b6fa2545db6ab3c6218c52f84f227704a`

Files:
- `supabase/drafts/20260923_identity_organization_memberships.sql`
- `supabase/drafts/20260923_identity_organization_memberships_backfill.sql`
- `supabase/drafts/20260923_identity_organization_memberships_rollback.sql`
- `tests/sql/identity_memberships_fixture.sql`
- `tests/sql/identity_memberships_assertions.sql`
- `tests/sql/identity_memberships_rollback_assertions.sql`
- `.github/workflows/identity-membership-sql.yml`

These files are drafts/tests, not production migrations.

## Isolated PostgreSQL validation

Workflow:
- **Identity Membership SQL**
- run: `35858881529`
- disposable PostgreSQL: 16
- result: **PASS**

Passed stages:
1. container initialization;
2. Supabase-compatible fixture;
3. schema draft apply;
4. backfill draft apply;
5. RLS/constraints/classification assertions;
6. backfill rerun;
7. rollback;
8. rollback assertions.

Verified behavior:
- multiple roles in one org create one membership;
- exact employee links become employee memberships;
- non-employee relationship remains `other`, not inferred owner/contractor/advisor;
- normal employee sees self only;
- active privileged membership can read organization memberships;
- cross-organization reads are denied;
- a privileged role without membership does not unlock organization membership data;
- suspended membership loses privileged organization visibility;
- mismatched employee/org/user link is rejected;
- anonymous access is denied;
- authenticated direct membership writes are denied;
- service role retains bounded server-side DML capability;
- backfill is idempotent;
- first-wave rollback removes the draft objects.

## Application regression validation

Standard TORO CI:
- run: `35858881721`
- install: PASS;
- tests: PASS;
- lint: PASS;
- build: PASS.

Vercel status for PR #67: **success**.

## Production preflight — read only

All required production columns/types for the draft were found:
- `public.organizations.id`;
- `public.roles.id/code`;
- `public.user_roles.org_id/user_id/role_id/status/revoked_at/created_at`;
- `public.employees.id/org_id/user_id/deleted_at`.

Runtime prerequisites:
- `auth` schema: present;
- `auth.users`: present;
- `private` schema: present;
- `pgcrypto`: 1.3;
- `private.has_org_role(target_org uuid, allowed_roles text[]) -> boolean`: exact signature present;
- `anon`: no BYPASSRLS;
- `authenticated`: no BYPASSRLS;
- `service_role`: BYPASSRLS.

## Production boundary

This evidence does **not** authorize or claim:
- creation of the `identity` schema in production;
- production membership backfill;
- employee identity linking;
- employee onboarding;
- removal of `user_roles`;
- activation of User Vault data ingestion.

The current resolver continues to use active/non-revoked `user_roles` as transitional relationship evidence.

## Next gate

Before production DDL:
1. owner/high-risk change approval;
2. final migration review against this validated draft;
3. current-schema preflight immediately before apply;
4. explicit rollback/forward-fix readiness;
5. post-migration authorization checks + security advisor.

Employee onboarding remains HOLD.
