-- Disposable PostgreSQL 17 fixture for the Alegra L3 writer draft.
-- It recreates only the live contracts pinned by the draft and never contacts
-- Supabase, Alegra, Dropbox, or any other external system.

\ir identity_memberships_fixture.sql

alter table auth.users
  add column if not exists raw_app_meta_data jsonb not null default '{}'::jsonb;

create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.role', true), '');
$$;

grant execute on function auth.jwt() to authenticated, service_role;
grant execute on function auth.role() to authenticated, service_role;

\ir ../../supabase/drafts/20260923_identity_organization_memberships.sql
\ir ../../supabase/drafts/20260923_identity_organization_memberships_backfill.sql

update auth.users
set raw_app_meta_data = jsonb_build_object('toro_role', 'FOUNDER')
where id = '20000000-0000-4000-8000-000000000001';

create schema operations;
revoke all on schema operations from public, anon, authenticated, service_role;

create table operations.tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  status text null,
  source_system text null,
  source_record_id text null,
  updated_at timestamptz not null default now(),
  unique (org_id, id)
);

create table operations.executive_decisions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  decision_key text not null,
  decision_value text null,
  instruction text null,
  delegated_to text null,
  status text not null default 'pending',
  program_key text null,
  source_ref text null,
  processed_at timestamptz null,
  response_text text null,
  superseded_by uuid null,
  source_system text null,
  source_record_id text null,
  updated_at timestamptz not null default now(),
  unique (org_id, id)
);

revoke all on operations.executive_decisions
  from public, anon, authenticated, service_role;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  table_name text not null,
  record_id uuid null,
  operation text not null,
  actor_user_id uuid null,
  changed_keys text[] not null default '{}'::text[],
  reason text null,
  occurred_at timestamptz not null default now(),
  status text not null default 'recorded',
  created_by uuid null,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

-- Exact live definition read from the canonical project on 2026-10-16. The
-- forward draft deliberately pins pg_get_functiondef() by MD5.
create or replace function public.resolve_toro_decision(
  p_decision_id uuid,
  p_action text,
  p_note text default null,
  p_delegate_to text default null
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$ declare v_decision operations.executive_decisions%rowtype; v_actor uuid:=auth.uid(); v_toro_role text:=coalesce(auth.jwt()->'app_metadata'->>'toro_role',''); v_note text:=nullif(btrim(coalesce(p_note,'')),''); v_delegate_to text:=nullif(btrim(coalesce(p_delegate_to,'')),''); v_status text; v_now timestamptz:=now(); begin if v_actor is null then raise exception 'Authentication required'; end if; if p_action not in ('approve','modify','delegate','postpone','reject') then raise exception 'Unsupported decision action'; end if; select * into v_decision from operations.executive_decisions where id=p_decision_id for update; if not found then raise exception 'Decision not found'; end if; if v_decision.superseded_by is not null or coalesce(v_decision.status,'') in ('Respondida','Archivada','Archive','Historical') then raise exception 'Decision is no longer actionable'; end if; if v_toro_role<>'FOUNDER' then raise exception 'Founder approval required'; end if; if not private.has_org_role(v_decision.org_id,array['ADMIN','GERENCIA']::text[]) then raise exception 'Organization membership required'; end if; if p_action='delegate' and v_delegate_to is null then raise exception 'Delegate target required'; end if; if p_action='reject' and v_note is null then raise exception 'A note is required to reject this decision'; end if; if p_action='approve' then update operations.executive_decisions set status='Respondida',decision_value='approved',response_text=coalesce(v_note,'Aprobada'),processed_at=v_now,updated_at=v_now where id=p_decision_id; v_status:='approved'; elsif p_action='reject' then update operations.executive_decisions set status='Respondida',decision_value='rejected',response_text=v_note,processed_at=v_now,updated_at=v_now where id=p_decision_id; v_status:='rejected'; elsif p_action='delegate' then update operations.executive_decisions set delegated_to=v_delegate_to,response_text=v_note,updated_at=v_now where id=p_decision_id; v_status:='delegated'; elsif p_action='postpone' then update operations.executive_decisions set response_text=v_note,updated_at=v_now where id=p_decision_id; v_status:='postponed'; else update operations.executive_decisions set response_text=v_note,updated_at=v_now where id=p_decision_id; v_status:='modified'; end if; insert into public.audit_logs(org_id,table_name,record_id,operation,actor_user_id,changed_keys,reason,occurred_at,status,created_by,updated_by) values(v_decision.org_id,'operations.executive_decisions',p_decision_id,'toro_decision_'||p_action,v_actor,case p_action when 'delegate' then array['delegated_to','response_text','updated_at']::text[] when 'approve' then array['status','decision_value','response_text','processed_at','updated_at']::text[] when 'reject' then array['status','decision_value','response_text','processed_at','updated_at']::text[] else array['response_text','updated_at']::text[] end,v_note,v_now,'recorded',v_actor,v_actor); return jsonb_build_object('decision_id',p_decision_id,'action',p_action,'status',v_status,'audited_at',v_now); end; $function$;

revoke all on function public.resolve_toro_decision(uuid,text,text,text)
  from public, anon, authenticated, service_role;
grant execute on function public.resolve_toro_decision(uuid,text,text,text)
  to authenticated, service_role;

\ir ../../supabase/drafts/20260930_toro_control_plane_runtime_v1.sql
\ir ../../supabase/drafts/20261001_toro_targeted_worker_claim_v1.sql

do $$
begin
  if md5(pg_get_functiondef(
       'public.resolve_toro_decision(uuid,text,text,text)'::regprocedure
     )) <> '8d06580e9ae843c42b2620908fdbea1a' then
    raise exception 'fixture_resolver_hash_drifted';
  end if;

  if md5(pg_get_functiondef(
       'public.toro_transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text)'::regprocedure
     )) <> 'd4a3fa3f97e521af83bf64161f2db473' then
    raise exception 'fixture_transition_hash_drifted';
  end if;

  if md5(pg_get_functiondef(
       'public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)'::regprocedure
     )) <> '7ae24e38863cc14f7efecfe6ebef65cf' then
    raise exception 'fixture_complete_hash_drifted';
  end if;
end;
$$;
