-- REVIEW DRAFT ONLY. This does not activate a Portal writer or transport.
-- Apply only through a reviewed database release after the exact bytes pass
-- the synthetic PostgreSQL contract test and runtime identity review.
begin;
set local lock_timeout = '2s';
set local statement_timeout = '15s';

do $preflight$
begin
  if current_user <> 'postgres' then
    raise exception 'channel draft contract requires the existing postgres migration owner';
  end if;
  if pg_catalog.to_regclass('integrations.communication_channel_bindings') is null then
    raise exception 'existing communication channel bindings are required';
  end if;
  if pg_catalog.to_regclass('public.user_roles') is null then
    raise exception 'existing user role memberships are required';
  end if;
  if pg_catalog.to_regclass('integrations.communication_channel_drafts') is not null then
    raise exception 'channel draft object already exists; inspect instead of replacing it';
  end if;
end;
$preflight$;

create table integrations.communication_channel_drafts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  actor_user_id uuid not null,
  account_id text not null check (length(account_id) between 4 and 300 and account_id ~ '^[A-Za-z0-9/_:.-]+$'),
  purpose_key text not null check (length(purpose_key) between 4 and 300 and purpose_key ~ '^[A-Za-z0-9/_:.-]+$'),
  chat_ref text not null check (length(chat_ref) between 4 and 300 and chat_ref ~ '^[A-Za-z0-9/_:.-]+$'),
  case_ref text not null check (length(case_ref) between 4 and 300 and case_ref ~ '^[A-Za-z0-9/_:.-]+$'),
  shift_ref text not null check (length(shift_ref) between 4 and 300 and shift_ref ~ '^[A-Za-z0-9/_:.-]+$'),
  destination_binding_id uuid not null,
  operation_key text not null check (length(operation_key) between 4 and 300 and operation_key ~ '^[A-Za-z0-9/_:.-]+$'),
  version bigint not null check (version > 0),
  draft_body text not null check (length(btrim(draft_body)) between 1 and 10000),
  source_kind text not null check (source_kind = 'live_transport'),
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (destination_binding_id) references integrations.communication_channel_bindings(id) on delete restrict,
  unique (org_id,actor_user_id,account_id,purpose_key,chat_ref,case_ref,shift_ref,destination_binding_id,version),
  unique (org_id,actor_user_id,account_id,purpose_key,chat_ref,case_ref,shift_ref,destination_binding_id,operation_key),
  check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 20)
);

create index communication_channel_drafts_scope_latest_idx
  on integrations.communication_channel_drafts
  (org_id,actor_user_id,account_id,purpose_key,chat_ref,case_ref,shift_ref,destination_binding_id,version desc);

alter table integrations.communication_channel_drafts enable row level security;
revoke all on table integrations.communication_channel_drafts from public,anon,authenticated,service_role;
grant select,insert on table integrations.communication_channel_drafts to service_role;

create function public.toro_channel_draft_find_v1(
  p_org_id uuid,p_actor_user_id uuid,p_account_id text,p_purpose_key text,
  p_chat_ref text,p_case_ref text,p_shift_ref text,p_destination_binding_id uuid,
  p_operation_key text
) returns jsonb language sql stable security invoker set search_path = '' as $function$
  select jsonb_build_object(
    'orgId',d.org_id::text,'userId',d.actor_user_id::text,'accountId',d.account_id,
    'purposeKey',d.purpose_key,'chatRef',d.chat_ref,'caseRef',d.case_ref,
    'shiftRef',d.shift_ref,'destinationBindingId',d.destination_binding_id::text,
    'operationKey',d.operation_key,'version',d.version,'draftBody',d.draft_body,
    'sourceKind',d.source_kind,'attachments',d.attachments
  )
  from integrations.communication_channel_drafts d
  join integrations.communication_channel_bindings b
    on b.id=d.destination_binding_id and b.org_id=d.org_id
    and b.active and b.draft_enabled
    and b.auth_status='connected' and b.verification_status='verified'
    and b.provider_account_ref=d.account_id
  where d.org_id=p_org_id and d.actor_user_id=p_actor_user_id and d.account_id=p_account_id
    and d.purpose_key=p_purpose_key and d.chat_ref=p_chat_ref and d.case_ref=p_case_ref
    and d.shift_ref=p_shift_ref and d.destination_binding_id=p_destination_binding_id
    and d.operation_key=p_operation_key
    and exists (
      select 1 from public.user_roles ur
      where ur.org_id=d.org_id and ur.user_id=d.actor_user_id
        and ur.status='active' and ur.revoked_at is null
    );
$function$;

create function public.toro_channel_draft_read_v1(
  p_org_id uuid,p_actor_user_id uuid,p_account_id text,p_purpose_key text,
  p_chat_ref text,p_case_ref text,p_shift_ref text,p_destination_binding_id uuid
) returns jsonb language sql stable security invoker set search_path = '' as $function$
  select jsonb_build_object(
    'orgId',d.org_id::text,'userId',d.actor_user_id::text,'accountId',d.account_id,
    'purposeKey',d.purpose_key,'chatRef',d.chat_ref,'caseRef',d.case_ref,
    'shiftRef',d.shift_ref,'destinationBindingId',d.destination_binding_id::text,
    'operationKey',d.operation_key,'version',d.version,'draftBody',d.draft_body,
    'sourceKind',d.source_kind,'attachments',d.attachments
  )
  from integrations.communication_channel_drafts d
  join integrations.communication_channel_bindings b
    on b.id=d.destination_binding_id and b.org_id=d.org_id
    and b.active and b.draft_enabled
    and b.auth_status='connected' and b.verification_status='verified'
    and b.provider_account_ref=d.account_id
  where d.org_id=p_org_id and d.actor_user_id=p_actor_user_id and d.account_id=p_account_id
    and d.purpose_key=p_purpose_key and d.chat_ref=p_chat_ref and d.case_ref=p_case_ref
    and d.shift_ref=p_shift_ref and d.destination_binding_id=p_destination_binding_id
    and exists (
      select 1 from public.user_roles ur
      where ur.org_id=d.org_id and ur.user_id=d.actor_user_id
        and ur.status='active' and ur.revoked_at is null
    )
  order by d.version desc limit 1;
$function$;

create function public.toro_channel_draft_cas_v1(
  p_org_id uuid,p_actor_user_id uuid,p_account_id text,p_purpose_key text,
  p_chat_ref text,p_case_ref text,p_shift_ref text,p_destination_binding_id uuid,
  p_operation_key text,p_expected_version bigint,p_draft_body text,p_source_kind text,
  p_attachments jsonb
) returns boolean language plpgsql volatile security invoker set search_path = '' as $function$
declare
  current_version bigint;
  attachment jsonb;
  seen_refs text[] := array[]::text[];
begin
  if p_expected_version < 0 or p_source_kind <> 'live_transport'
    or pg_catalog.jsonb_typeof(p_attachments) is distinct from 'array'
    or pg_catalog.jsonb_array_length(p_attachments) > 20 then
    raise check_violation using message='invalid channel draft CAS payload';
  end if;
  for attachment in select value from pg_catalog.jsonb_array_elements(p_attachments) loop
    if pg_catalog.jsonb_typeof(attachment) is distinct from 'object'
      or (select array_agg(key order by key) from pg_catalog.jsonb_object_keys(attachment) key)
         is distinct from array['evidenceRef','state']::text[]
      or length(coalesce(attachment->>'evidenceRef','')) not between 4 and 300
      or coalesce(attachment->>'evidenceRef','') !~ '^[A-Za-z0-9/_:.-]+$'
      or attachment->>'state' not in ('ready','pending','failed')
      or attachment->>'evidenceRef' = any(seen_refs) then
      raise check_violation using message='invalid channel draft attachment';
    end if;
    seen_refs := pg_catalog.array_append(seen_refs,attachment->>'evidenceRef');
  end loop;

  -- The existing binding row is the lock, canonical account identity and the
  -- live capability gate. This prevents a verified destination from being
  -- persisted under a caller-supplied shadow account scope.
  perform 1 from integrations.communication_channel_bindings b
    where b.id=p_destination_binding_id and b.org_id=p_org_id and b.active
      and b.provider_account_ref=p_account_id
      and b.draft_enabled and b.auth_status='connected' and b.verification_status='verified'
    for update;
  if not found then return false; end if;

  -- The service boundary resolves capabilities, while the database independently
  -- requires a live organization membership for the attributed human actor.
  -- Lock the qualifying membership through commit so a concurrent revocation
  -- cannot cross between this authorization decision and the durable insert.
  perform 1 from public.user_roles ur
    where ur.org_id=p_org_id and ur.user_id=p_actor_user_id
      and ur.status='active' and ur.revoked_at is null
    for key share;
  if not found then return false; end if;

  select d.version into current_version
  from integrations.communication_channel_drafts d
  where d.org_id=p_org_id and d.actor_user_id=p_actor_user_id and d.account_id=p_account_id
    and d.purpose_key=p_purpose_key and d.chat_ref=p_chat_ref and d.case_ref=p_case_ref
    and d.shift_ref=p_shift_ref and d.destination_binding_id=p_destination_binding_id
  order by d.version desc limit 1;
  current_version := coalesce(current_version,0);
  if current_version <> p_expected_version then return false; end if;

  insert into integrations.communication_channel_drafts(
    org_id,actor_user_id,account_id,purpose_key,chat_ref,case_ref,shift_ref,
    destination_binding_id,operation_key,version,draft_body,source_kind,attachments
  ) values (
    p_org_id,p_actor_user_id,p_account_id,p_purpose_key,p_chat_ref,p_case_ref,p_shift_ref,
    p_destination_binding_id,p_operation_key,p_expected_version+1,p_draft_body,p_source_kind,p_attachments
  );
  return true;
exception
  when unique_violation then return false;
end;
$function$;

revoke all on function public.toro_channel_draft_find_v1(uuid,uuid,text,text,text,text,text,uuid,text) from public,anon,authenticated,service_role;
revoke all on function public.toro_channel_draft_read_v1(uuid,uuid,text,text,text,text,text,uuid) from public,anon,authenticated,service_role;
revoke all on function public.toro_channel_draft_cas_v1(uuid,uuid,text,text,text,text,text,uuid,text,bigint,text,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.toro_channel_draft_find_v1(uuid,uuid,text,text,text,text,text,uuid,text) to service_role;
grant execute on function public.toro_channel_draft_read_v1(uuid,uuid,text,text,text,text,text,uuid) to service_role;
grant execute on function public.toro_channel_draft_cas_v1(uuid,uuid,text,text,text,text,text,uuid,text,bigint,text,text,jsonb) to service_role;

-- Store a self-checking definition marker so rollback refuses to remove a
-- function changed by a later release, even if its name stayed the same.
do $definition_markers$
declare signature text;
declare procedure_id regprocedure;
begin
  foreach signature in array array[
    'public.toro_channel_draft_find_v1(uuid,uuid,text,text,text,text,text,uuid,text)',
    'public.toro_channel_draft_read_v1(uuid,uuid,text,text,text,text,text,uuid)',
    'public.toro_channel_draft_cas_v1(uuid,uuid,text,text,text,text,text,uuid,text,bigint,text,text,jsonb)'
  ] loop
    procedure_id := pg_catalog.to_regprocedure(signature);
    execute pg_catalog.format('comment on function %s is %L',procedure_id,
      'toro-channel-draft-v1:def-md5='||pg_catalog.md5(pg_catalog.pg_get_functiondef(procedure_id)));
  end loop;
end;
$definition_markers$;
commit;
