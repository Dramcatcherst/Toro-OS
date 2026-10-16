# TORO sandbox role RLS repair candidate

**Status:** reviewed draft + isolated PostgreSQL test; remote sandbox not applied  
**Scope:** `dreamteam-recovery-sandbox` only; never production

## Observed risk

The prior read-only audit found RLS disabled on `public.roles` and `public.user_roles` in the recovery sandbox. The current turn could not refresh that evidence because both Supabase connectors were rejected before reading. The SQL therefore refuses to run if the tables, columns, grants, RLS state or policy baseline differ from the recorded state.

## Minimal repair

- preserve existing grants;
- enable RLS on the two transitional tables;
- let an authenticated identity read only its active, non-revoked `user_roles` rows;
- expose only the role codes referenced by those visible rows;
- grant no writes and no anonymous access;
- keep `service_role` server access unchanged;
- provide an exact rollback to the prior disabled-RLS state.

This is intentionally self-only. Administrative multi-user reads should continue through separately reviewed, role-guarded RPCs rather than broad direct table policies.

## Required remote gate

Before applying to the sandbox:

1. rerun the read-only preflight against the exact sandbox project;
2. capture current RLS, policies, grants and table shape;
3. apply only if the draft preconditions match;
4. test self, cross-user, cross-org, revoked, anonymous and service-role cases;
5. run Supabase Security Advisor;
6. retain the rollback and post-apply catalog receipt.

Production is explicitly out of scope.
