-- Los 50s de Caro — team claim backend draft
-- PREPARED ONLY. DO NOT APPLY WITHOUT EXPLICIT RELEASE.
-- Public schema is used for server-side runtime compatibility, but all client roles are revoked.
-- Intended caller: trusted TORO/server runtime using service-role credentials server-side only.

create table if not exists public.los50s_event_teams (
  id uuid primary key default gen_random_uuid(),
  event_key text not null default 'los50s-caro-2026',
  display_name text not null,
  created_by_participant_ref text not null,
  status text not null default 'active' check (status in ('active','dissolved')),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.los50s_team_memberships (
  id uuid primary key default gen_random_uuid(),
  event_key text not null default 'los50s-caro-2026',
  team_id uuid not null references public.los50s_event_teams(id) on delete cascade,
  participant_ref text not null,
  state text not null default 'active' check (state in ('active','released','moved')),
  claimed_by_participant_ref text not null,
  claimed_at timestamptz not null default now(),
  released_at timestamptz,
  previous_team_id uuid references public.los50s_event_teams(id),
  request_id text not null,
  version bigint not null default 1
);

create unique index if not exists los50s_one_active_team_per_participant
  on public.los50s_team_memberships(event_key, participant_ref)
  where state = 'active';

create unique index if not exists los50s_membership_request_id_unique
  on public.los50s_team_memberships(event_key, request_id);

create table if not exists public.los50s_team_receipts (
  id uuid primary key default gen_random_uuid(),
  event_key text not null default 'los50s-caro-2026',
  request_id text not null,
  action text not null check (action in ('claim','release','move','create_provisional')),
  actor_participant_ref text not null,
  subject_participant_ref text not null,
  previous_team_id uuid references public.los50s_event_teams(id),
  new_team_id uuid references public.los50s_event_teams(id),
  outcome text not null check (outcome in ('succeeded','conflict','denied','noop')),
  detail jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  unique(event_key, request_id, action)
);

create table if not exists public.los50s_provisional_participants (
  id uuid primary key default gen_random_uuid(),
  event_key text not null default 'los50s-caro-2026',
  participant_ref text not null unique,
  display_name text not null,
  created_by_participant_ref text not null,
  review_state text not null default 'provisional'
    check (review_state in ('provisional','approved','merged','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.los50s_event_teams enable row level security;
alter table public.los50s_team_memberships enable row level security;
alter table public.los50s_team_receipts enable row level security;
alter table public.los50s_provisional_participants enable row level security;

revoke all on public.los50s_event_teams from public, anon, authenticated;
revoke all on public.los50s_team_memberships from public, anon, authenticated;
revoke all on public.los50s_team_receipts from public, anon, authenticated;
revoke all on public.los50s_provisional_participants from public, anon, authenticated;

grant select, insert, update, delete on public.los50s_event_teams to service_role;
grant select, insert, update, delete on public.los50s_team_memberships to service_role;
grant select, insert, update, delete on public.los50s_team_receipts to service_role;
grant select, insert, update, delete on public.los50s_provisional_participants to service_role;

create or replace function public.los50s_claim_participant(
  p_event_key text,
  p_team_id uuid,
  p_participant_ref text,
  p_actor_participant_ref text,
  p_request_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.los50s_team_memberships;
  v_row public.los50s_team_memberships;
begin
  if p_event_key is null or p_team_id is null or p_participant_ref is null
     or p_actor_participant_ref is null or p_request_id is null then
    raise exception 'invalid_request';
  end if;

  perform 1 from public.los50s_event_teams
  where id = p_team_id and event_key = p_event_key and status = 'active';
  if not found then
    raise exception 'team_not_active';
  end if;

  select * into v_existing
  from public.los50s_team_memberships
  where event_key = p_event_key
    and participant_ref = p_participant_ref
    and state = 'active'
  for update;

  if found then
    if v_existing.team_id = p_team_id then
      return jsonb_build_object('ok', true, 'state', 'noop', 'team_id', p_team_id);
    end if;

    insert into public.los50s_team_receipts(
      event_key, request_id, action, actor_participant_ref, subject_participant_ref,
      previous_team_id, new_team_id, outcome, detail
    ) values (
      p_event_key, p_request_id, 'claim', p_actor_participant_ref, p_participant_ref,
      v_existing.team_id, p_team_id, 'conflict',
      jsonb_build_object('code','TEAM_MEMBERSHIP_CONFLICT')
    ) on conflict do nothing;

    return jsonb_build_object('ok', false, 'state', 'conflict', 'code', 'TEAM_MEMBERSHIP_CONFLICT');
  end if;

  begin
    insert into public.los50s_team_memberships(
      event_key, team_id, participant_ref, claimed_by_participant_ref, request_id
    ) values (
      p_event_key, p_team_id, p_participant_ref, p_actor_participant_ref, p_request_id
    ) returning * into v_row;
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'state', 'conflict', 'code', 'TEAM_MEMBERSHIP_CONFLICT');
  end;

  insert into public.los50s_team_receipts(
    event_key, request_id, action, actor_participant_ref, subject_participant_ref,
    new_team_id, outcome
  ) values (
    p_event_key, p_request_id, 'claim', p_actor_participant_ref, p_participant_ref,
    p_team_id, 'succeeded'
  ) on conflict do nothing;

  return jsonb_build_object('ok', true, 'state', 'active', 'membership_id', v_row.id, 'team_id', p_team_id);
end;
$$;

create or replace function public.los50s_release_participant(
  p_event_key text,
  p_participant_ref text,
  p_actor_participant_ref text,
  p_request_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.los50s_team_memberships;
begin
  select * into v_existing
  from public.los50s_team_memberships
  where event_key = p_event_key
    and participant_ref = p_participant_ref
    and state = 'active'
  for update;

  if not found then
    return jsonb_build_object('ok', true, 'state', 'noop');
  end if;

  update public.los50s_team_memberships
  set state = 'released',
      released_at = now(),
      version = version + 1
  where id = v_existing.id;

  insert into public.los50s_team_receipts(
    event_key, request_id, action, actor_participant_ref, subject_participant_ref,
    previous_team_id, outcome
  ) values (
    p_event_key, p_request_id, 'release', p_actor_participant_ref, p_participant_ref,
    v_existing.team_id, 'succeeded'
  ) on conflict do nothing;

  return jsonb_build_object('ok', true, 'state', 'released', 'previous_team_id', v_existing.team_id);
end;
$$;

create or replace function public.los50s_move_participant(
  p_event_key text,
  p_participant_ref text,
  p_new_team_id uuid,
  p_actor_participant_ref text,
  p_request_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.los50s_team_memberships;
  v_new public.los50s_team_memberships;
begin
  perform 1 from public.los50s_event_teams
  where id = p_new_team_id and event_key = p_event_key and status = 'active';
  if not found then raise exception 'team_not_active'; end if;

  select * into v_existing
  from public.los50s_team_memberships
  where event_key = p_event_key
    and participant_ref = p_participant_ref
    and state = 'active'
  for update;

  if found and v_existing.team_id = p_new_team_id then
    return jsonb_build_object('ok', true, 'state', 'noop', 'team_id', p_new_team_id);
  end if;

  if found then
    update public.los50s_team_memberships
    set state = 'moved',
        released_at = now(),
        version = version + 1
    where id = v_existing.id;
  end if;

  insert into public.los50s_team_memberships(
    event_key, team_id, participant_ref, claimed_by_participant_ref,
    request_id, previous_team_id
  ) values (
    p_event_key, p_new_team_id, p_participant_ref, p_actor_participant_ref,
    p_request_id, case when found then v_existing.team_id else null end
  ) returning * into v_new;

  insert into public.los50s_team_receipts(
    event_key, request_id, action, actor_participant_ref, subject_participant_ref,
    previous_team_id, new_team_id, outcome
  ) values (
    p_event_key, p_request_id, 'move', p_actor_participant_ref, p_participant_ref,
    case when found then v_existing.team_id else null end, p_new_team_id, 'succeeded'
  ) on conflict do nothing;

  return jsonb_build_object('ok', true, 'state', 'active', 'team_id', p_new_team_id, 'membership_id', v_new.id);
end;
$$;

revoke all on function public.los50s_claim_participant(text,uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.los50s_release_participant(text,text,text,text) from public, anon, authenticated;
revoke all on function public.los50s_move_participant(text,text,uuid,text,text) from public, anon, authenticated;

grant execute on function public.los50s_claim_participant(text,uuid,text,text,text) to service_role;
grant execute on function public.los50s_release_participant(text,text,text,text) to service_role;
grant execute on function public.los50s_move_participant(text,text,uuid,text,text) to service_role;

-- Acceptance expectations (run in sandbox transaction before migration):
-- 1) simultaneous claim of one participant to two teams => exactly one active membership.
-- 2) replay same request => no duplicate membership/receipt.
-- 3) release then claim => one active membership.
-- 4) move => previous row moved + one new active membership atomically.
-- 5) anon/authenticated have zero direct privileges.
