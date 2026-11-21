-- Los 50s de Caro — event operations pilot
-- APPLIED LIVE on 2026-10-02 to Supabase project abtyrbqlqbsastmridzp.
-- Purpose: reusable internal operations model for hotel groups/events.
-- Public clients MUST NOT receive direct grants on these objects.

alter table public.los50s_registrations
  add column if not exists leader_name text,
  add column if not exists leader_person_ref text,
  add column if not exists leader_whatsapp text,
  add column if not exists member_count integer,
  add column if not exists group_estimate numeric;

create table if not exists public.los50s_participant_ops (
  id uuid primary key default gen_random_uuid(),
  event_key text not null default 'los50s-caro-2026',
  participant_ref text not null,
  registration_id uuid references public.los50s_registrations(id) on delete set null,
  display_name text not null,
  group_key text,
  group_role text,
  is_group_leader boolean not null default false,
  phone text,
  age_band text check (age_band in ('adult','teen','kid','toddler','baby')),
  dob date,
  lives_in_costa_rica boolean not null default false,
  route_choice text check (route_choice in ('direct','manuel-antonio','undecided')),
  seat_required boolean not null default true,
  uses_bed boolean not null default true,
  bed_preference text,
  accommodation_preference text,
  food_preference text,
  food_dislikes text,
  allergies text,
  guardian_participant_ref text,
  luggage_count integer not null default 0 check (luggage_count >= 0),
  special_luggage text,
  room_notes text,
  participant_status text not null default 'active'
    check (participant_status in ('active','provisional','cancelled')),
  updated_at timestamptz not null default now(),
  updated_by text not null default 'toro',
  unique(event_key, participant_ref)
);

create index if not exists los50s_participant_ops_route_idx
  on public.los50s_participant_ops(event_key, route_choice, participant_status);
create index if not exists los50s_participant_ops_leader_idx
  on public.los50s_participant_ops(event_key, is_group_leader);

create table if not exists public.los50s_payment_ledger (
  id uuid primary key default gen_random_uuid(),
  event_key text not null default 'los50s-caro-2026',
  registration_id uuid references public.los50s_registrations(id) on delete set null,
  participant_ref text,
  kind text not null check (kind in (
    'charge','payment','refund','solidarity_in','solidarity_applied',
    'group_fund_in','group_fund_spend','adjustment'
  )),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD' check (currency in ('USD','CRC')),
  status text not null default 'confirmed' check (status in ('pending','confirmed','void')),
  method text,
  external_ref text,
  note text,
  evidence_url text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by text not null default 'toro'
);

create index if not exists los50s_payment_ledger_participant_idx
  on public.los50s_payment_ledger(event_key, participant_ref);
create index if not exists los50s_payment_ledger_kind_idx
  on public.los50s_payment_ledger(event_key, kind, status);

create table if not exists public.los50s_room_assignments (
  id uuid primary key default gen_random_uuid(),
  event_key text not null default 'los50s-caro-2026',
  participant_ref text not null,
  room_code text,
  bed_label text,
  assignment_status text not null default 'unassigned'
    check (assignment_status in ('unassigned','proposed','confirmed','changed')),
  check_in date,
  check_out date,
  accommodation_notes text,
  preferred_bed text,
  preferred_accommodation text,
  guardian_participant_ref text,
  version bigint not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'toro',
  unique(event_key, participant_ref)
);

create index if not exists los50s_room_assignments_room_idx
  on public.los50s_room_assignments(event_key, room_code);

create table if not exists public.los50s_transport_manifest (
  id uuid primary key default gen_random_uuid(),
  event_key text not null default 'los50s-caro-2026',
  participant_ref text not null,
  leg text not null check (leg in (
    'sjo_to_direct',
    'sjo_to_manuel_antonio',
    'manuel_antonio_to_st',
    'st_to_sjo',
    'sjo_hotel_to_airport',
    'custom'
  )),
  route_choice text check (route_choice in ('direct','manuel-antonio','undecided')),
  travel_date date,
  pickup_time time,
  pickup_location text,
  dropoff_location text,
  vehicle_ref text,
  driver_ref text,
  flight_ref text,
  seat_required boolean not null default true,
  luggage_count integer not null default 0 check (luggage_count >= 0),
  special_luggage text,
  status text not null default 'planned'
    check (status in ('planned','confirmed','boarded','completed','no_show','cancelled')),
  notes text,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'toro',
  unique(event_key, participant_ref, leg)
);

create index if not exists los50s_transport_manifest_leg_idx
  on public.los50s_transport_manifest(event_key, leg, status);

alter table public.los50s_participant_ops enable row level security;
alter table public.los50s_payment_ledger enable row level security;
alter table public.los50s_room_assignments enable row level security;
alter table public.los50s_transport_manifest enable row level security;

revoke all on public.los50s_participant_ops from public, anon, authenticated;
revoke all on public.los50s_payment_ledger from public, anon, authenticated;
revoke all on public.los50s_room_assignments from public, anon, authenticated;
revoke all on public.los50s_transport_manifest from public, anon, authenticated;

grant select, insert, update, delete on public.los50s_participant_ops to service_role;
grant select, insert, update, delete on public.los50s_payment_ledger to service_role;
grant select, insert, update, delete on public.los50s_room_assignments to service_role;
grant select, insert, update, delete on public.los50s_transport_manifest to service_role;

create or replace view public.los50s_participant_balances
with (security_invoker = true)
as
select
  event_key,
  participant_ref,
  coalesce(sum(case when status='confirmed' and kind='charge' then amount else 0 end),0)::numeric(12,2) as charges_usd,
  coalesce(sum(case when status='confirmed' and kind in ('payment','solidarity_applied','refund') then amount else 0 end),0)::numeric(12,2) as credits_usd,
  (
    coalesce(sum(case when status='confirmed' and kind='charge' then amount else 0 end),0)
    -
    coalesce(sum(case when status='confirmed' and kind in ('payment','solidarity_applied','refund') then amount else 0 end),0)
  )::numeric(12,2) as balance_usd
from public.los50s_payment_ledger
where currency='USD'
group by event_key, participant_ref;

create or replace view public.los50s_fund_summary
with (security_invoker = true)
as
select
  event_key,
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
group by event_key;

create or replace view public.los50s_ops_dashboard
with (security_invoker = true)
as
select
  'los50s-caro-2026'::text as event_key,
  (select count(*) from public.los50s_registrations where event_key='los50s-caro-2026')::int as registrations,
  (select count(*) from public.los50s_participant_ops where event_key='los50s-caro-2026' and participant_status='active')::int as active_participants,
  (select count(*) from public.los50s_participant_ops where event_key='los50s-caro-2026' and participant_status='provisional')::int as provisional_participants,
  (select count(*) from public.los50s_participant_ops where event_key='los50s-caro-2026' and is_group_leader)::int as leaders,
  (select count(*) from public.los50s_participant_ops where event_key='los50s-caro-2026' and route_choice='direct' and participant_status<>'cancelled')::int as direct_count,
  (select count(*) from public.los50s_participant_ops where event_key='los50s-caro-2026' and route_choice='manuel-antonio' and participant_status<>'cancelled')::int as manuel_antonio_count,
  (select count(*) from public.los50s_participant_ops where event_key='los50s-caro-2026' and route_choice='undecided' and participant_status<>'cancelled')::int as undecided_count,
  (select count(*) from public.los50s_room_assignments where event_key='los50s-caro-2026' and assignment_status='confirmed')::int as rooms_confirmed,
  (select count(*) from public.los50s_room_assignments where event_key='los50s-caro-2026' and assignment_status in ('unassigned','proposed'))::int as room_assignments_pending,
  (select count(*) from public.los50s_transport_manifest where event_key='los50s-caro-2026' and status='planned')::int as transport_legs_planned,
  (select count(*) from public.los50s_transport_manifest where event_key='los50s-caro-2026' and status='confirmed')::int as transport_legs_confirmed,
  (select coalesce(sum(case when currency='USD' and status='confirmed' and kind='charge' then amount else 0 end),0) from public.los50s_payment_ledger where event_key='los50s-caro-2026')::numeric(12,2) as charges_usd,
  (select coalesce(sum(case when currency='USD' and status='confirmed' and kind in ('payment','solidarity_applied') then amount else 0 end),0) from public.los50s_payment_ledger where event_key='los50s-caro-2026')::numeric(12,2) as credits_usd,
  (select coalesce(sum(case when currency='USD' and status='confirmed' and kind='group_fund_in' then amount else 0 end),0) from public.los50s_payment_ledger where event_key='los50s-caro-2026')::numeric(12,2) as group_fund_in_usd,
  (select coalesce(sum(case when currency='USD' and status='confirmed' and kind='group_fund_spend' then amount else 0 end),0) from public.los50s_payment_ledger where event_key='los50s-caro-2026')::numeric(12,2) as group_fund_spent_usd;

revoke all on public.los50s_participant_balances from public, anon, authenticated;
revoke all on public.los50s_fund_summary from public, anon, authenticated;
revoke all on public.los50s_ops_dashboard from public, anon, authenticated;
grant select on public.los50s_participant_balances to service_role;
grant select on public.los50s_fund_summary to service_role;
grant select on public.los50s_ops_dashboard to service_role;

-- Materialization function: registration JSON -> normalized ops rows.
-- This function is intentionally idempotent via unique keys + upserts.
create or replace function public.los50s_materialize_registration(p_registration_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event_key text;
  v_payload jsonb;
  v_person jsonb;
  v_ref text;
  v_route text;
  v_member_key text;
  v_leader_key text;
  v_respondent_ref text;
  v_respondent_phone text;
  v_guardian_key text;
  v_guardian_ref text;
  v_phone text;
  v_count integer := 0;
  v_profiles integer := 0;
  v_rooms integer := 0;
  v_transport integer := 0;
begin
  select event_key, payload into v_event_key, v_payload
  from public.los50s_registrations
  where id = p_registration_id
  for update;

  if not found then raise exception 'registration_not_found'; end if;
  if jsonb_typeof(v_payload->'people') <> 'array' then raise exception 'registration_people_missing'; end if;

  v_leader_key := nullif(v_payload->'leader'->>'memberKey','');
  v_respondent_ref := nullif(v_payload->'respondent'->>'personId','');
  v_respondent_phone := nullif(v_payload->'respondent'->>'whatsapp','');

  for v_person in select value from jsonb_array_elements(v_payload->'people')
  loop
    v_member_key := nullif(v_person->>'memberKey','');
    v_ref := nullif(v_person->>'personId','');
    if v_ref is null then
      v_ref := 'provisional:' || coalesce(v_member_key, gen_random_uuid()::text);
    end if;

    v_route := coalesce(nullif(v_person->>'effectiveRoute',''), 'undecided');
    if v_route not in ('direct','manuel-antonio','undecided') then v_route := 'undecided'; end if;

    v_guardian_key := nullif(v_person->>'guardianMemberKey','');
    v_guardian_ref := null;
    if v_guardian_key is not null then
      select coalesce(
        nullif(g.value->>'personId',''),
        case when nullif(g.value->>'memberKey','') is not null then 'provisional:' || (g.value->>'memberKey') end
      ) into v_guardian_ref
      from jsonb_array_elements(v_payload->'people') g
      where g.value->>'memberKey' = v_guardian_key
      limit 1;
    end if;

    v_phone := nullif(v_person->>'personalPhone','');
    if v_phone is null and v_respondent_ref is not null and v_ref = v_respondent_ref then
      v_phone := v_respondent_phone;
    end if;

    v_count := v_count + 1;

    insert into public.los50s_participant_ops(
      event_key, participant_ref, registration_id, display_name, group_key, group_role,
      is_group_leader, phone, age_band, dob, lives_in_costa_rica, route_choice,
      seat_required, uses_bed, bed_preference, accommodation_preference, food_preference,
      food_dislikes, allergies, guardian_participant_ref, luggage_count, special_luggage,
      room_notes, participant_status, updated_by
    ) values (
      v_event_key, v_ref, p_registration_id,
      coalesce(nullif(v_person->>'name',''), 'Participante'),
      p_registration_id::text,
      coalesce(nullif(v_person->>'groupRole',''), 'Participante'),
      (v_leader_key is not null and v_member_key = v_leader_key),
      v_phone,
      case when v_person->>'age' in ('adult','teen','kid','toddler','baby') then v_person->>'age' else 'adult' end,
      case when nullif(v_person->>'dob','') is not null then (v_person->>'dob')::date end,
      coalesce((v_person->>'livesInCostaRica')::boolean, false),
      v_route,
      coalesce((v_person->>'seatRequired')::boolean, true),
      coalesce((v_person->>'usesBed')::boolean, true),
      nullif(v_person->>'bedPreference',''),
      nullif(v_person->>'accommodationPreference',''),
      nullif(v_person->>'foodPreference',''),
      nullif(v_person->>'foodDislikes',''),
      nullif(v_person->>'allergies',''),
      v_guardian_ref,
      coalesce((v_person->>'luggageCount')::integer, 0),
      nullif(v_person->>'specialLuggage',''),
      nullif(v_person->>'roomNotes',''),
      case when v_person->>'personId' is null then 'provisional' else 'active' end,
      'registration:' || p_registration_id::text
    )
    on conflict(event_key, participant_ref) do update set
      registration_id=excluded.registration_id,
      display_name=excluded.display_name,
      group_key=excluded.group_key,
      group_role=excluded.group_role,
      is_group_leader=excluded.is_group_leader,
      phone=coalesce(excluded.phone, public.los50s_participant_ops.phone),
      age_band=excluded.age_band,
      dob=excluded.dob,
      lives_in_costa_rica=excluded.lives_in_costa_rica,
      route_choice=excluded.route_choice,
      seat_required=excluded.seat_required,
      uses_bed=excluded.uses_bed,
      bed_preference=excluded.bed_preference,
      accommodation_preference=excluded.accommodation_preference,
      food_preference=excluded.food_preference,
      food_dislikes=excluded.food_dislikes,
      allergies=excluded.allergies,
      guardian_participant_ref=excluded.guardian_participant_ref,
      luggage_count=excluded.luggage_count,
      special_luggage=excluded.special_luggage,
      room_notes=excluded.room_notes,
      participant_status=excluded.participant_status,
      updated_at=now(),
      updated_by=excluded.updated_by;
    v_profiles := v_profiles + 1;

    insert into public.los50s_room_assignments(
      event_key, participant_ref, assignment_status, accommodation_notes,
      preferred_bed, preferred_accommodation, guardian_participant_ref, updated_by
    ) values (
      v_event_key, v_ref, 'unassigned',
      nullif(v_person->>'roomNotes',''),
      nullif(v_person->>'bedPreference',''),
      nullif(v_person->>'accommodationPreference',''),
      v_guardian_ref,
      'registration:' || p_registration_id::text
    )
    on conflict(event_key, participant_ref) do update set
      accommodation_notes=excluded.accommodation_notes,
      preferred_bed=excluded.preferred_bed,
      preferred_accommodation=excluded.preferred_accommodation,
      guardian_participant_ref=excluded.guardian_participant_ref,
      version=public.los50s_room_assignments.version + 1,
      updated_at=now(),
      updated_by=excluded.updated_by;
    v_rooms := v_rooms + 1;

    if v_route = 'direct' then
      insert into public.los50s_transport_manifest(
        event_key, participant_ref, leg, route_choice, travel_date,
        seat_required, luggage_count, special_luggage, status, updated_by
      ) values (
        v_event_key, v_ref, 'sjo_to_direct', 'direct', date '2026-11-29',
        coalesce((v_person->>'seatRequired')::boolean, true),
        coalesce((v_person->>'luggageCount')::integer, 0),
        nullif(v_person->>'specialLuggage',''), 'planned',
        'registration:' || p_registration_id::text
      )
      on conflict(event_key, participant_ref, leg) do update set
        route_choice=excluded.route_choice, travel_date=excluded.travel_date,
        seat_required=excluded.seat_required, luggage_count=excluded.luggage_count,
        special_luggage=excluded.special_luggage, updated_at=now(), updated_by=excluded.updated_by;
      v_transport := v_transport + 1;

    elsif v_route = 'manuel-antonio' then
      insert into public.los50s_transport_manifest(
        event_key, participant_ref, leg, route_choice, travel_date,
        seat_required, luggage_count, special_luggage, status, updated_by
      ) values
      (v_event_key, v_ref, 'sjo_to_manuel_antonio', 'manuel-antonio', date '2026-11-29',
       coalesce((v_person->>'seatRequired')::boolean, true), coalesce((v_person->>'luggageCount')::integer, 0),
       nullif(v_person->>'specialLuggage',''), 'planned', 'registration:' || p_registration_id::text),
      (v_event_key, v_ref, 'manuel_antonio_to_st', 'manuel-antonio', date '2026-11-30',
       coalesce((v_person->>'seatRequired')::boolean, true), coalesce((v_person->>'luggageCount')::integer, 0),
       nullif(v_person->>'specialLuggage',''), 'planned', 'registration:' || p_registration_id::text)
      on conflict(event_key, participant_ref, leg) do update set
        route_choice=excluded.route_choice, travel_date=excluded.travel_date,
        seat_required=excluded.seat_required, luggage_count=excluded.luggage_count,
        special_luggage=excluded.special_luggage, updated_at=now(), updated_by=excluded.updated_by;
      v_transport := v_transport + 2;
    end if;

    insert into public.los50s_transport_manifest(
      event_key, participant_ref, leg, route_choice, travel_date,
      seat_required, luggage_count, special_luggage, status, updated_by
    ) values
    (v_event_key, v_ref, 'st_to_sjo',
     case when v_route in ('direct','manuel-antonio') then v_route else 'undecided' end,
     date '2026-12-05', coalesce((v_person->>'seatRequired')::boolean, true),
     coalesce((v_person->>'luggageCount')::integer, 0), nullif(v_person->>'specialLuggage',''),
     'planned', 'registration:' || p_registration_id::text),
    (v_event_key, v_ref, 'sjo_hotel_to_airport',
     case when v_route in ('direct','manuel-antonio') then v_route else 'undecided' end,
     date '2026-12-06', coalesce((v_person->>'seatRequired')::boolean, true),
     coalesce((v_person->>'luggageCount')::integer, 0), nullif(v_person->>'specialLuggage',''),
     'planned', 'registration:' || p_registration_id::text)
    on conflict(event_key, participant_ref, leg) do update set
      route_choice=excluded.route_choice, travel_date=excluded.travel_date,
      seat_required=excluded.seat_required, luggage_count=excluded.luggage_count,
      special_luggage=excluded.special_luggage, updated_at=now(), updated_by=excluded.updated_by;
    v_transport := v_transport + 2;
  end loop;

  return jsonb_build_object(
    'ok', true, 'registration_id', p_registration_id, 'people', v_count,
    'profile_rows', v_profiles, 'room_rows', v_rooms, 'transport_rows', v_transport
  );
end;
$$;

revoke all on function public.los50s_materialize_registration(uuid) from public, anon, authenticated;
grant execute on function public.los50s_materialize_registration(uuid) to service_role;
