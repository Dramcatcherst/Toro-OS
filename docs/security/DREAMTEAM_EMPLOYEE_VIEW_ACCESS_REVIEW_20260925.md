# TORO / DreamTeam: review of two employee views

Status: DRAFT — no production change. Date: 2026-09-25 (Costa Rica).
Canonical project: TORO; existing HR implementation: DreamTeam.
Finding owner: TORO Systems / Sobresito; people-data reviewer: Fiona; decision owner: Mauricio.

## Evidence checked

- Supabase security advisor reports ERROR for `public.employee_reward_balances` and `public.employee_experience_kpis` because they are owner-privilege views.
- PostgreSQL `reloptions` is null for both: neither has `security_invoker=true`.
- `anon` and `authenticated` have explicit SELECT grants on both; `anon` has USAGE on `public`.
- A read-only transaction with `SET LOCAL ROLE anon` and `SELECT count(*) FROM public.employee_reward_balances` returned **13**, without retrieving identifiers. The KPI view returned 0 rows under its current source data.
- The employee reward events, redemptions, experience runs and onboarding progress tables had zero rows at this cut. Zero source events do not make employee identity columns safe.
- Database view dependency inspection found no other views depending on these two. GitHub code search of `Dramcatcherst/Toro-OS` and `Dramcatcherst/dream-team` found no indexed matches; that is not proof of zero API/UI consumers.
- The HTTP Data API exposure setting, analytics logs, clients and environment dependencies were **not** verified. No breach or external access is asserted.

## Proposed remediation

Use the separate [draft SQL](../../supabase/drafts/20260925_dreamteam_view_access_hardening.sql): check expected views and server-role access, set both to `security_invoker=true`, remove all grants from `PUBLIC`, `anon` and `authenticated`, verify catalog state in one transaction. Keep `service_role` access for reviewed server-side consumers. The draft is intentionally outside migrations.

Before approval: trace any references in DreamTeam/Vercel/server code and database or API traffic, confirm the exposed Data API schemas, and test the draft in a disposable Supabase branch. If an authenticated employee feature needs these aggregates, design a tenant- and employee-scoped replacement with RLS and a separate review; do not restore broad SELECT.

## Acceptance checks

1. Run the draft in a disposable branch. Check `has_table_privilege('anon', ..., 'SELECT') = false`, likewise `authenticated`, and service-role SELECT remains true.
2. Run the Supabase security advisor: these two `security_definer_view` errors should disappear. If another finding remains, investigate it separately.
3. Verify an anonymous Data API request cannot read either view; do not include credentials or returned employee data in the evidence.
4. Exercise the legitimate DreamTeam People/HR flows with synthetic identities. Record any broken consumer and fix its authorization path before production.
5. Secure approval for the exact production permission change. After applying, repeat checks 1–4 and monitor failures.

## Recovery

A blind rollback that re-grants anonymous SELECT would reintroduce the confirmed database exposure. If a legitimate flow breaks, keep public access closed and route only that approved server-side flow through an authorized endpoint. Any broader access change requires its own review and explicit decision.

## Broader contract gap

The live Supabase migration history contains employee reward and experience changes from September 23, while `dream-team` on its default branch ends its migration tree at September 4. Reconcile migration ownership and code deployment before promoting this draft into the governed migration chain. Avoid a second HR schema authority.
