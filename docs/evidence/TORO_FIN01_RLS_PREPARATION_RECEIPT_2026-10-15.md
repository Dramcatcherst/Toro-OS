# FIN-01 RLS preparation receipt — 2026-10-15

## Outcome

`FIN01-P0-SEC-01` is complete as a preparation unit and remains `PREPARED_NOT_APPLIED` operationally. Twelve relations were inventoried from live PostgreSQL metadata without reading business rows or changing the database. A guarded RLS script, exact guarded rollback and isolated contract tests are versioned in the existing TORO repository.

## Verified baseline

- Project: `abtyrbqlqbsastmridzp`.
- Relations: 10 in `finance`, 2 in `integrations`.
- RLS: disabled on 12/12; forced RLS on 0/12; policies on 0/12.
- Effective `anon` and `authenticated` table privileges: zero on 12/12.
- `service_role`: full effective table privileges on the 10 `finance` relations; no privileges on the 2 `integrations` relations.
- `postgres` and `service_role` have `BYPASSRLS`; `anon` and `authenticated` do not.
- Database dependencies: no dependent views, no database functions and no non-internal triggers. Three child relations retain their existing foreign keys.
- Repository/parent-tree search: three design references; no direct runtime or migration consumer using the exact relation names.
- PostgreSQL statistics indicate existing activity/data in several relations, especially both mail-ingest tables; these are cumulative estimates, not row-level evidence.

## Decision

Enable RLS on all 12 relations without creating policies. This preserves current privileged consumers because they bypass RLS and establishes default-deny behavior if a non-bypass role later receives a grant. Do not add tenant policies until a real client consumer, identity contract and scoped columns justify them. The two tables without tenant scope (`payflow_rules`, `payflow_write_receipts`) remain server-only.

The SQL fails before change if any relation is missing, RLS/policies already changed, `anon`/`authenticated` gained a privilege, the expected `service_role` finance privileges changed, the integration tables gained `service_role`, or the BYPASSRLS role contract changed.

## Files and validation

- `data/toro_fin01_rls_inventory_2026_v1.json`
- `supabase/drafts/20261015_fin01_server_only_rls_v1.sql`
- `supabase/drafts/20261015_fin01_server_only_rls_v1_rollback.sql`
- `tests/toro-fin01-rls-draft.test.mjs`

The test suite checks exact 12/12 coverage, unique enable/disable statements, balanced guarded transaction envelopes, absence of policies/grants/data operations/`CASCADE`/`FORCE RLS`, exact current allow/deny roles and action-plan continuity. This is static and isolated validation; it does not claim PostgreSQL engine execution.

## Boundaries and recovery

- No Supabase migration, DDL, grant, policy, data write or branch was executed.
- No Alegra, Kross, bank, Dropbox or Airtable write occurred.
- Writer Alegra remains off; the financial heartbeat remains paused.
- Remote recovery: not applicable because there was no mutation.
- Local recovery: revert only this unit's repository delta.
- If the migration is later approved and applied, use the dedicated rollback only after its drift checks pass. Disabling RLS is a security regression and must be a separate deliberate decision.

## Single next action

Execute `FIN01-P0-CUR-01`: establish the authoritative base/account currency and dated event-level FX rule, preserve original CRC/USD values and produce an accountant-reviewable matrix. Do not alter historical records or post to Alegra.
