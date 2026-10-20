-- TORO / Los 50s event membership: REVIEW-ONLY, NOT APPLIED.
-- Reuses auth.users/public.app_users as the human identity.
-- This table binds that identity to an existing event participant_ref;
-- it does NOT create a second identity universe.
-- Requires reviewed invitation-token migration, backup and change window.

create table if not exists public.los50s_event_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  event_key text not null check (length(event_key) between 3 and 128),
  participant_ref text not null check (length(participant_ref) between 3 and 160),
  user_id uuid not null references public.app_users(id),
  member_role text not null default 'participant'
    check (member_role in ('participant','family_leader','minor','event_coordinator')),
  status text not null default 'active'
    check (status in ('active','revoked')),
  guardian_user_id uuid null references public.app_users(id),
  verified_toro_person_ref text not null,
  verification_receipt_id text not null,
  source_invitation_id uuid not null references public.los50s_invitation_tokens(id),
  verified_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (org_id,event_key,participant_ref),
  unique (org_id,event_key,user_id,participant_ref),

  check (
    (member_role = 'minor' and guardian_user_id is not null)
    or member_role <> 'minor'
  ),
  check (
    status <> 'revoked' or revoked_at is not null
  )
);

comment on table public.los50s_event_members is
  'Verified event membership projection linked to canonical TORO app_users. No name/phone-only linking.';

alter table public.los50s_event_members enable row level security;
revoke all on table public.los50s_event_members from public, anon, authenticated;

-- Deliberately server-only in this first slice.
-- A separately reviewed server route must resolve auth user + invitation +
-- verified TORO person + receipt and atomically create the membership.
-- Community read/write projections may later expose only the minimum allowed
-- fields and MUST constrain org_id + event_key + user_id/role.
grant select, insert, update on table public.los50s_event_members to service_role;

create index if not exists los50s_event_members_user_idx
  on public.los50s_event_members (user_id,org_id,event_key)
  where status = 'active';

create index if not exists los50s_event_members_guardian_idx
  on public.los50s_event_members (guardian_user_id,org_id,event_key)
  where guardian_user_id is not null and status = 'active';

-- TODO before apply:
-- 1. make the invitation-token migration canonical and applied first;
-- 2. implement one SECURITY INVOKER/service-only transactional claim function;
-- 3. prove a participant cannot claim a second adult's participant_ref;
-- 4. prove minor guardian scoping;
-- 5. add rollback that refuses destructive drop when real memberships exist.
