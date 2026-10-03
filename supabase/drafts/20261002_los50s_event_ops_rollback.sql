-- Los 50s event ops pilot rollback.
-- DESTRUCTIVE: drops derived operational data. Does NOT drop los50s_registrations.
-- Use only with explicit approval and after exporting operational rows.

drop view if exists public.los50s_ops_dashboard;
drop view if exists public.los50s_fund_summary;
drop view if exists public.los50s_participant_balances;
drop function if exists public.los50s_materialize_registration(uuid);

drop table if exists public.los50s_transport_manifest;
drop table if exists public.los50s_room_assignments;
drop table if exists public.los50s_payment_ledger;
drop table if exists public.los50s_participant_ops;

alter table public.los50s_registrations
  drop column if exists leader_name,
  drop column if exists leader_person_ref,
  drop column if exists leader_whatsapp,
  drop column if exists member_count,
  drop column if exists group_estimate,
  drop column if exists org_id;
