-- TORO / Los 50s invitation identity pilot: REVIEW-ONLY draft, NOT applied.
-- Requires TORO Identity approval, backup and reviewed change window.
-- No public/anon/authenticated grants; service-role/server-only.
-- Do not use row existence to claim a person is verified.
-- Audited receipt and verified human are mandatory before membership creation.

create table if not exists public.los50s_invitation_tokens (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  event_key text not null check (length(event_key) between 3 and 128),
  participant_ref text not null check (length(participant_ref) between 3 and 160),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'issued'
    check (status in ('issued','claimed_pending_verification','verified','revoked','expired')),
  claimed_by_auth_user_id uuid null references auth.users(id),
  verified_toro_person_ref text null,
  verification_receipt_id text null,
  issued_by_toro_person_ref text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  claimed_at timestamptz null,
  verified_at timestamptz null,
  revoked_at timestamptz null,
  updated_at timestamptz not null default now(),
  constraint los50s_invite_time_check check (expires_at > issued_at),
  constraint los50s_invite_verified_check check (
    status <> 'verified' or
    (claimed_by_auth_user_id is not null and
     verified_toro_person_ref is not null and
     verification_receipt_id is not null and verified_at is not null)
  )
);

create index if not exists los50s_invitation_person_lookup
  on public.los50s_invitation_tokens (org_id,event_key,participant_ref ,issued_at)
  ;

-- Enforce one active/issued link per existing participant within one event.
create unique index if not exists los50s_invitation_one_active_per_person
  on public.los50s_invitation_tokens (org_id,event_key,participant_ref)
  where status in ('issued','claimed_pending_verification','verified');

alter table public.los50s_invitation_tokens enable row level security;
revoke all on table public.los50s_invitation_tokens from public, anon, authenticated;

-- No RLS public policies deliberately. Server-only functions must check
-- TORO role + verified identity + event scope, AND use atomic state transitions.
-- No invitations emitted, no client token persisted and no WhatsApp delivery
-- should occur solely because this schema exists.
