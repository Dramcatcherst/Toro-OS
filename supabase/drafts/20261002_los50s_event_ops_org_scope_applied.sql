-- Los 50s event ops — Dreamcatcher org scoping
-- APPLIED LIVE 2026-10-02 after the base event-ops pilot.
-- Dreamcatcher org: 595801ce-2895-4d91-81ae-e8d1d5cc8593

begin;

drop view if exists public.los50s_ops_dashboard;
drop view if exists public.los50s_fund_summary;
drop view if exists public.los50s_participant_balances;

alter table public.los50s_registrations add column if not exists org_id uuid;
alter table public.los50s_participant_ops add column if not exists org_id uuid;
alter table public.los50s_payment_ledger add column if not exists org_id uuid;
alter table public.los50s_room_assignments add column if not exists org_id uuid;
alter table public.los50s_transport_manifest add column if not exists org_id uuid;

update public.los50s_registrations set org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593' where org_id is null;
update public.los50s_participant_ops set org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593' where org_id is null;
update public.los50s_payment_ledger set org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593' where org_id is null;
update public.los50s_room_assignments set org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593' where org_id is null;
update public.los50s_transport_manifest set org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593' where org_id is null;

alter table public.los50s_registrations alter column org_id set not null;
alter table public.los50s_participant_ops alter column org_id set not null;
alter table public.los50s_payment_ledger alter column org_id set not null;
alter table public.los50s_room_assignments alter column org_id set not null;
alter table public.los50s_transport_manifest alter column org_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname='los50s_registrations_org_id_fkey') then
    alter table public.los50s_registrations add constraint los50s_registrations_org_id_fkey foreign key (org_id) references public.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname='los50s_participant_ops_org_id_fkey') then
    alter table public.los50s_participant_ops add constraint los50s_participant_ops_org_id_fkey foreign key (org_id) references public.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname='los50s_payment_ledger_org_id_fkey') then
    alter table public.los50s_payment_ledger add constraint los50s_payment_ledger_org_id_fkey foreign key (org_id) references public.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname='los50s_room_assignments_org_id_fkey') then
    alter table public.los50s_room_assignments add constraint los50s_room_assignments_org_id_fkey foreign key (org_id) references public.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname='los50s_transport_manifest_org_id_fkey') then
    alter table public.los50s_transport_manifest add constraint los50s_transport_manifest_org_id_fkey foreign key (org_id) references public.organizations(id);
  end if;
end $$;

alter table public.los50s_participant_ops drop constraint if exists los50s_participant_ops_event_key_participant_ref_key;
alter table public.los50s_participant_ops drop constraint if exists los50s_participant_ops_org_event_participant_key;
alter table public.los50s_participant_ops add constraint los50s_participant_ops_org_event_participant_key unique(org_id,event_key,participant_ref);

alter table public.los50s_room_assignments drop constraint if exists los50s_room_assignments_event_key_participant_ref_key;
alter table public.los50s_room_assignments drop constraint if exists los50s_room_assignments_org_event_participant_key;
alter table public.los50s_room_assignments add constraint los50s_room_assignments_org_event_participant_key unique(org_id,event_key,participant_ref);

alter table public.los50s_transport_manifest drop constraint if exists los50s_transport_manifest_event_key_participant_ref_leg_key;
alter table public.los50s_transport_manifest drop constraint if exists los50s_transport_manifest_org_event_participant_leg_key;
alter table public.los50s_transport_manifest add constraint los50s_transport_manifest_org_event_participant_leg_key unique(org_id,event_key,participant_ref,leg);

drop index if exists public.los50s_participant_ops_route_idx;
drop index if exists public.los50s_participant_ops_leader_idx;
drop index if exists public.los50s_payment_ledger_participant_idx;
drop index if exists public.los50s_payment_ledger_kind_idx;
drop index if exists public.los50s_room_assignments_room_idx;
drop index if exists public.los50s_transport_manifest_leg_idx;

create index los50s_participant_ops_route_idx on public.los50s_participant_ops(org_id,event_key,route_choice,participant_status);
create index los50s_participant_ops_leader_idx on public.los50s_participant_ops(org_id,event_key,is_group_leader);
create index los50s_payment_ledger_participant_idx on public.los50s_payment_ledger(org_id,event_key,participant_ref);
create index los50s_payment_ledger_kind_idx on public.los50s_payment_ledger(org_id,event_key,kind,status);
create index los50s_room_assignments_room_idx on public.los50s_room_assignments(org_id,event_key,room_code);
create index los50s_transport_manifest_leg_idx on public.los50s_transport_manifest(org_id,event_key,leg,status);

create view public.los50s_participant_balances
with (security_invoker = true)
as
select
  org_id,event_key,participant_ref,
  coalesce(sum(case when status='confirmed' and kind='charge' then amount else 0 end),0)::numeric(12,2) as charges_usd,
  coalesce(sum(case when status='confirmed' and kind in ('payment','solidarity_applied','refund') then amount else 0 end),0)::numeric(12,2) as credits_usd,
  (
    coalesce(sum(case when status='confirmed' and kind='charge' then amount else 0 end),0)
    -
    coalesce(sum(case when status='confirmed' and kind in ('payment','solidarity_applied','refund') then amount else 0 end),0)
  )::numeric(12,2) as balance_usd
from public.los50s_payment_ledger
where currency='USD'
group by org_id,event_key,participant_ref;

create view public.los50s_fund_summary
with (security_invoker = true)
as
select
  org_id,event_key,
  coalesce(sum(case when status='confirmed' and kind='group_fund_in' then amount else 0 end),0)::numeric(12,2) as group_fund_in,
  coalesce(sum(case when status='confirmed' and kind='group_fund_spend' then amount else 0 end),0)::numeric(12,2) as group_fund_spent,
  (
    coalesce(sum(case when status='confirmed' and kind='group_fund_in' then amount else 0 end),0)
    -
    coalesce(sum(case when status='confirmed' and kind='group_fund_spend' then amount else 0 end),0)
  )::numeric(12,2) as group_fund_balance,
  coalesce(sum(case when status='confirmed' and kind='solidarity_in' then amount else 0 end),0)::numeric(12,2) as solidarity_in,
  coalesce(sum(case when status='confirmed' and kind='solidarity_applied' then amount else 0 end),0)::numeric(12,2) as solidarity_applied
from public.los50s_payment_ledger
where currency='USD'
group by org_id,event_key;

create view public.los50s_ops_dashboard
with (security_invoker = true)
as
with events as (
  select distinct org_id,event_key from public.los50s_registrations
)
select
  e.org_id,e.event_key,
  (select count(*) from public.los50s_registrations r where r.org_id=e.org_id and r.event_key=e.event_key)::int as registrations,
  (select count(*) from public.los50s_participant_ops p where p.org_id=e.org_id and p.event_key=e.event_key and p.participant_status='active')::int as active_participants,
  (select count(*) from public.los50s_participant_ops p where p.org_id=e.org_id and p.event_key=e.event_key and p.participant_status='provisional')::int as provisional_participants,
  (select count(*) from public.los50s_participant_ops p where p.org_id=e.org_id and p.event_key=e.event_key and p.is_group_leader)::int as leaders,
  (select count(*) from public.los50s_participant_ops p where p.org_id=e.org_id and p.event_key=e.event_key and p.route_choice='direct' and p.participant_status<>'cancelled')::int as direct_count,
  (select count(*) from public.los50s_participant_ops p where p.org_id=e.org_id and p.event_key=e.event_key and p.route_choice='manuel-antonio' and p.participant_status<>'cancelled')::int as manuel_antonio_count,
  (select count(*) from public.los50s_participant_ops p where p.org_id=e.org_id and p.event_key=e.event_key and p.route_choice='undecided' and p.participant_status<>'cancelled')::int as undecided_count,
  (select count(*) from public.los50s_room_assignments a where a.org_id=e.org_id and a.event_key=e.event_key and a.assignment_status='confirmed')::int as rooms_confirmed,
  (select count(*) from public.los50s_room_assignments a where a.org_id=e.org_id and a.event_key=e.event_key and a.assignment_status in ('unassigned','proposed'))::int as room_assignments_pending,
  (select count(*) from public.los50s_transport_manifest t where t.org_id=e.org_id and t.event_key=e.event_key and t.status='planned')::int as transport_legs_planned,
  (select count(*) from public.los50s_transport_manifest t where t.org_id=e.org_id and t.event_key=e.event_key and t.status='confirmed')::int as transport_legs_confirmed,
  (select coalesce(sum(case when l.currency='USD' and l.status='confirmed' and l.kind='charge' then l.amount else 0 end),0) from public.los50s_payment_ledger l where l.org_id=e.org_id and l.event_key=e.event_key)::numeric(12,2) as charges_usd,
  (select coalesce(sum(case when l.currency='USD' and l.status='confirmed' and l.kind in ('payment','solidarity_applied') then l.amount else 0 end),0) from public.los50s_payment_ledger l where l.org_id=e.org_id and l.event_key=e.event_key)::numeric(12,2) as credits_usd,
  (select coalesce(sum(case when l.currency='USD' and l.status='confirmed' and l.kind='group_fund_in' then l.amount else 0 end),0) from public.los50s_payment_ledger l where l.org_id=e.org_id and l.event_key=e.event_key)::numeric(12,2) as group_fund_in_usd,
  (select coalesce(sum(case when l.currency='USD' and l.status='confirmed' and l.kind='group_fund_spend' then l.amount else 0 end),0) from public.los50s_payment_ledger l where l.org_id=e.org_id and l.event_key=e.event_key)::numeric(12,2) as group_fund_spent_usd
from events e;

revoke all on public.los50s_participant_balances from public,anon,authenticated;
revoke all on public.los50s_fund_summary from public,anon,authenticated;
revoke all on public.los50s_ops_dashboard from public,anon,authenticated;
grant select on public.los50s_participant_balances to service_role;
grant select on public.los50s_fund_summary to service_role;
grant select on public.los50s_ops_dashboard to service_role;

commit;
