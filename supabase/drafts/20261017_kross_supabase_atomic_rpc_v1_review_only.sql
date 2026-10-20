-- REVIEW ONLY / NOT APPLIED / DO NOT DB PUSH.
-- KROSS-SUPABASE-RPC-MIGRATION-DRAFT-01.
-- STATUS: BLOCKED BY ADVERSARIAL REVIEW (0 P0 / 7 P1). DO NOT EXECUTE.
--
-- This draft adds a private, server-only atomic persistence boundary for the
-- EXISTING operations.reservations mirror. It deliberately rejects
-- source_is_live=true and never changes integrations.kross_snapshot_registry
-- or integrations.kross_snapshot_health: health/promotion is not part of the
-- current TypeScript request hash, expected state or readback proof.
--
-- Activation remains blocked until all of the following are separately
-- reviewed against live metadata: exact operations.reservations definition,
-- RLS/grants, the Kross scoped unique index, executor role membership, a
-- versioned health/promotion boundary and an isolated database test run.
-- OpenClaw and WhatsApp must never receive this database role or credentials.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $review_only_execution_block$
begin
  raise exception 'REVIEW_ONLY_BLOCKED: resolve the seven recorded P1 findings and pass isolated PostgreSQL validation before execution';
end;
$review_only_execution_block$;

do $preflight$
declare
  v_required_columns text[] := array[
    'org_id','property_id','external_reservation_id','reservation_key',
    'room_id','room_code_raw','check_in','check_out','status','guests_count',
    'adults','children','channel','breakfast_included',
    'transactional_authority','read_only_mirror','source_is_live',
    'source_system','source_table','source_record_id','snapshot_as_of',
    'last_synced_at','source_hash','data_quality_status','updated_at'
  ];
  v_missing_columns text[];
  v_index_definition text;
  v_name text;
begin
  if to_regnamespace('private') is null
     or to_regnamespace('integrations') is null
     or to_regnamespace('operations') is null then
    raise exception 'required private/integrations/operations schema is missing';
  end if;

  if to_regclass('operations.reservations') is null then
    raise exception 'operations.reservations is missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class c
    where c.oid = 'operations.reservations'::regclass
      and c.relkind in ('r','p')
      and c.relrowsecurity
  ) then
    raise exception 'operations.reservations must be an RLS-enabled table';
  end if;

  select array_agg(required_column order by required_column)
  into v_missing_columns
  from unnest(v_required_columns) required_column
  where not exists (
    select 1
    from pg_catalog.pg_attribute a
    where a.attrelid = 'operations.reservations'::regclass
      and a.attname = required_column
      and a.attnum > 0
      and not a.attisdropped
  );

  if coalesce(array_length(v_missing_columns, 1), 0) > 0 then
    raise exception 'operations.reservations columns missing: %', v_missing_columns;
  end if;

  select pg_catalog.pg_get_indexdef(c.oid)
  into v_index_definition
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  join pg_catalog.pg_index i on i.indexrelid = c.oid
  where n.nspname = 'operations'
    and c.relname = 'reservations_kross_scope_external_uq'
    and i.indisunique
    and i.indisvalid
    and i.indisready;

  if v_index_definition is null
     or v_index_definition !~* '\(org_id, property_id, source_system, external_reservation_id\)' then
    raise exception 'Kross scoped reservation unique index is absent or drifted';
  end if;

  foreach v_name in array array['anon','authenticated','service_role'] loop
    if has_table_privilege(v_name, 'operations.reservations', 'INSERT')
       or has_table_privilege(v_name, 'operations.reservations', 'UPDATE')
       or has_table_privilege(v_name, 'operations.reservations', 'DELETE')
       or has_table_privilege(v_name, 'operations.reservations', 'TRUNCATE') then
      raise exception 'direct reservations mutation path remains for role %', v_name;
    end if;
  end loop;

  if to_regprocedure('extensions.digest(bytea,text)') is null then
    raise exception 'extensions.digest(bytea,text) is required for SHA-256 proofs';
  end if;

  if exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'toro_kross_ingest_executor_v1'
  ) then
    raise exception 'toro_kross_ingest_executor_v1 already exists; review drift';
  end if;

  foreach v_name in array array[
    'integrations.kross_feed_state_v1',
    'integrations.kross_feed_lease_grants_v1',
    'integrations.kross_import_runs_v1',
    'integrations.kross_row_checkpoints_v1',
    'integrations.kross_attempt_receipts_v1',
    'integrations.kross_quarantine_v1',
    'integrations.kross_commit_journal_v1'
  ] loop
    if to_regclass(v_name) is not null then
      raise exception '% already exists; review drift', v_name;
    end if;
  end loop;

  foreach v_name in array array[
    'private.kross_canonical_json_v1(jsonb)',
    'private.kross_sha256_json_v1(jsonb)',
    'private.kross_jsonb_has_exact_keys_v1(jsonb,text[])',
    'private.kross_has_forbidden_key_v1(jsonb)',
    'private.kross_feed_key_v1(uuid,uuid,text)',
    'private.kross_current_reservation_json_v1(uuid,uuid,text)',
    'private.kross_validate_atomic_request_v1(jsonb,text)',
    'private.kross_prevent_mutation_v1()',
    'private.kross_prevent_delete_v1()',
    'private.kross_guard_reservation_mutation_v1()',
    'private.kross_acquire_feed_lease_v1(jsonb,text,text,bigint,integer)',
    'private.kross_commit_feed_v1(jsonb)',
    'private.kross_append_attempt_evidence_v1(jsonb)',
    'private.kross_atomic_readback_v1(jsonb)'
  ] loop
    if to_regprocedure(v_name) is not null then
      raise exception '% already exists; review drift', v_name;
    end if;
  end loop;
end;
$preflight$;

create role toro_kross_ingest_executor_v1
  nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;

create table integrations.kross_feed_state_v1 (
  feed_key text primary key,
  org_id uuid not null,
  property_id uuid not null,
  feed text not null,
  source_system text not null check (source_system = 'Kross'),
  snapshot_kind text not null check (snapshot_kind = 'reservation_mirror'),
  fencing_token bigint not null default 0 check (fencing_token >= 0),
  writer_id text null,
  lease_id text null,
  lease_acquired_at timestamptz null,
  lease_expires_at timestamptz null,
  feed_checkpoint jsonb null,
  feed_checkpoint_hash text null check (
    feed_checkpoint_hash is null or feed_checkpoint_hash ~ '^[a-f0-9]{64}$'
  ),
  last_request_hash text null check (
    last_request_hash is null or last_request_hash ~ '^[a-f0-9]{64}$'
  ),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  unique (org_id, property_id, source_system, snapshot_kind, feed),
  check (feed ~ '^[A-Za-z0-9._~-]{1,128}$'),
  check (
    (writer_id is null and lease_id is null and lease_acquired_at is null and lease_expires_at is null)
    or
    (writer_id is not null and lease_id is not null and lease_acquired_at is not null and lease_expires_at > lease_acquired_at)
  )
);

create table integrations.kross_feed_lease_grants_v1 (
  feed_key text not null references integrations.kross_feed_state_v1(feed_key) on delete restrict,
  lease_id text not null,
  writer_id text not null,
  expected_token bigint not null check (expected_token >= 0),
  fencing_token bigint not null check (fencing_token > 0),
  ttl_seconds integer not null check (ttl_seconds between 30 and 900),
  acquired_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default statement_timestamp(),
  primary key (feed_key, lease_id),
  check (expires_at > acquired_at)
);

create table integrations.kross_import_runs_v1 (
  run_key text primary key,
  feed_key text not null references integrations.kross_feed_state_v1(feed_key) on delete restrict,
  org_id uuid not null,
  property_id uuid not null,
  identity_key text not null,
  artifact_hash text not null check (artifact_hash ~ '^[a-f0-9]{64}$'),
  record_hash text not null check (record_hash ~ '^[a-f0-9]{64}$'),
  attempt_id text not null,
  source_as_of timestamptz not null,
  observed_at timestamptz not null,
  evidence jsonb not null,
  created_at timestamptz not null default statement_timestamp(),
  check (source_as_of <= observed_at)
);

create table integrations.kross_row_checkpoints_v1 (
  feed_key text not null references integrations.kross_feed_state_v1(feed_key) on delete restrict,
  identity_key text not null,
  run_key text not null references integrations.kross_import_runs_v1(run_key) on delete restrict,
  source_as_of timestamptz not null,
  record_hash text not null check (record_hash ~ '^[a-f0-9]{64}$'),
  evidence jsonb not null,
  updated_at timestamptz not null default statement_timestamp(),
  primary key (feed_key, identity_key)
);

create table integrations.kross_attempt_receipts_v1 (
  receipt_key text primary key,
  feed_key text not null references integrations.kross_feed_state_v1(feed_key) on delete restrict,
  attempt_id text not null,
  request_fingerprint text not null,
  artifact_hash text not null check (artifact_hash ~ '^[a-f0-9]{64}$'),
  receipt_hash text not null check (receipt_hash ~ '^[a-f0-9]{64}$'),
  source_as_of timestamptz not null,
  observed_at timestamptz not null,
  recorded_at timestamptz not null,
  evidence jsonb not null,
  created_at timestamptz not null default statement_timestamp(),
  unique (feed_key, attempt_id),
  check (source_as_of <= observed_at and observed_at <= recorded_at)
);

create table integrations.kross_quarantine_v1 (
  quarantine_key text primary key,
  receipt_key text not null references integrations.kross_attempt_receipts_v1(receipt_key) on delete restrict,
  feed_key text not null references integrations.kross_feed_state_v1(feed_key) on delete restrict,
  attempt_id text not null,
  quarantine_hash text not null check (quarantine_hash ~ '^[a-f0-9]{64}$'),
  reason text not null,
  evidence jsonb not null,
  created_at timestamptz not null default statement_timestamp(),
  unique (feed_key, attempt_id)
);

create table integrations.kross_commit_journal_v1 (
  request_hash text primary key check (request_hash ~ '^[a-f0-9]{64}$'),
  request_id text not null unique,
  operation text not null check (operation in ('commit_feed','append_attempt_evidence')),
  feed_key text not null references integrations.kross_feed_state_v1(feed_key) on delete restrict,
  attempt_id text not null,
  lease_id text not null,
  fencing_token bigint not null check (fencing_token > 0),
  commit_id text not null unique,
  commit_digest text not null check (commit_digest ~ '^[a-f0-9]{64}$'),
  scope jsonb not null,
  correlation jsonb not null,
  proof jsonb not null,
  readback jsonb not null,
  committed_at timestamptz not null default statement_timestamp()
);

create index kross_import_runs_feed_attempt_v1_idx
  on integrations.kross_import_runs_v1 (feed_key, attempt_id);
create index kross_row_checkpoints_run_v1_idx
  on integrations.kross_row_checkpoints_v1 (run_key);
create index kross_attempt_receipts_feed_created_v1_idx
  on integrations.kross_attempt_receipts_v1 (feed_key, created_at desc);
create index kross_commit_journal_feed_created_v1_idx
  on integrations.kross_commit_journal_v1 (feed_key, committed_at desc);

alter table integrations.kross_feed_state_v1 enable row level security;
alter table integrations.kross_feed_lease_grants_v1 enable row level security;
alter table integrations.kross_import_runs_v1 enable row level security;
alter table integrations.kross_row_checkpoints_v1 enable row level security;
alter table integrations.kross_attempt_receipts_v1 enable row level security;
alter table integrations.kross_quarantine_v1 enable row level security;
alter table integrations.kross_commit_journal_v1 enable row level security;

revoke all on integrations.kross_feed_state_v1 from public, anon, authenticated, service_role, toro_kross_ingest_executor_v1;
revoke all on integrations.kross_feed_lease_grants_v1 from public, anon, authenticated, service_role, toro_kross_ingest_executor_v1;
revoke all on integrations.kross_import_runs_v1 from public, anon, authenticated, service_role, toro_kross_ingest_executor_v1;
revoke all on integrations.kross_row_checkpoints_v1 from public, anon, authenticated, service_role, toro_kross_ingest_executor_v1;
revoke all on integrations.kross_attempt_receipts_v1 from public, anon, authenticated, service_role, toro_kross_ingest_executor_v1;
revoke all on integrations.kross_quarantine_v1 from public, anon, authenticated, service_role, toro_kross_ingest_executor_v1;
revoke all on integrations.kross_commit_journal_v1 from public, anon, authenticated, service_role, toro_kross_ingest_executor_v1;

create function private.kross_jsonb_has_exact_keys_v1(p_value jsonb, p_keys text[])
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $function$
  select jsonb_typeof(p_value) = 'object'
     and coalesce(
       (select array_agg(k order by k) from jsonb_object_keys(p_value) k),
       array[]::text[]
     ) = coalesce(
       (select array_agg(k order by k) from unnest(p_keys) k),
       array[]::text[]
     );
$function$;

create function private.kross_canonical_json_v1(p_value jsonb)
returns text
language plpgsql
immutable
security invoker
set search_path = ''
as $function$
declare
  v_type text := jsonb_typeof(p_value);
  v_result text;
begin
  if v_type = 'object' then
    select '{' || coalesce(string_agg(to_json(k)::text || ':' || private.kross_canonical_json_v1(v), ',' order by k), '') || '}'
      into v_result
    from jsonb_each(p_value) e(k,v);
    return v_result;
  elsif v_type = 'array' then
    select '[' || coalesce(string_agg(private.kross_canonical_json_v1(v), ',' order by ordinality), '') || ']'
      into v_result
    from jsonb_array_elements(p_value) with ordinality e(v, ordinality);
    return v_result;
  elsif v_type in ('string','number','boolean','null') then
    return p_value::text;
  end if;
  raise exception 'unsupported JSON value';
end;
$function$;

create function private.kross_sha256_json_v1(p_value jsonb)
returns text
language sql
immutable
security invoker
set search_path = ''
as $function$
  select encode(
    extensions.digest(
      convert_to(private.kross_canonical_json_v1(p_value), 'UTF8'),
      'sha256'
    ),
    'hex'
  );
$function$;

create function private.kross_has_forbidden_key_v1(p_value jsonb)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $function$
declare
  v_key text;
  v_child jsonb;
begin
  if jsonb_typeof(p_value) = 'object' then
    for v_key, v_child in select key, value from jsonb_each(p_value) loop
      if lower(v_key) = any(array[
        'payload','sourcereference','source_reference','guest_id','guest_key_raw',
        'guest_name','phone','telephone','email','service_role','access_token',
        'refresh_token','cookie','secret','total_amount','payment_status',
        'amount_paid','currency'
      ]) then
        return true;
      end if;
      if private.kross_has_forbidden_key_v1(v_child) then return true; end if;
    end loop;
  elsif jsonb_typeof(p_value) = 'array' then
    for v_child in select value from jsonb_array_elements(p_value) loop
      if private.kross_has_forbidden_key_v1(v_child) then return true; end if;
    end loop;
  end if;
  return false;
end;
$function$;

create function private.kross_feed_key_v1(p_org_id uuid, p_property_id uuid, p_feed text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $function$
  select case
    when p_feed ~ '^[A-Za-z0-9._~-]{1,128}$'
      then 'v1::org=' || p_org_id::text ||
           '::property=' || p_property_id::text ||
           '::source=Kross::snapshot=reservation_mirror::feed=' || p_feed
    else null
  end;
$function$;

create function private.kross_current_reservation_json_v1(
  p_org_id uuid,
  p_property_id uuid,
  p_external_reservation_id text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select jsonb_build_object(
    'org_id', r.org_id,
    'property_id', r.property_id,
    'external_reservation_id', r.external_reservation_id,
    'reservation_key', r.reservation_key,
    'room_id', r.room_id,
    'room_code_raw', r.room_code_raw,
    'check_in', r.check_in,
    'check_out', r.check_out,
    'status', r.status,
    'guests_count', r.guests_count,
    'adults', r.adults,
    'children', r.children,
    'channel', r.channel,
    'breakfast_included', r.breakfast_included,
    'transactional_authority', r.transactional_authority,
    'read_only_mirror', r.read_only_mirror,
    'source_is_live', r.source_is_live,
    'source_system', r.source_system,
    'source_table', r.source_table,
    'source_record_id', r.source_record_id,
    'snapshot_as_of', r.snapshot_as_of,
    'last_synced_at', r.last_synced_at,
    'source_hash', r.source_hash,
    'data_quality_status', r.data_quality_status
  )
  from operations.reservations r
  where r.org_id = p_org_id
    and r.property_id = p_property_id
    and r.source_system = 'Kross'
    and r.external_reservation_id = p_external_reservation_id;
$function$;

create function private.kross_validate_atomic_request_v1(p_request jsonb, p_operation text)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $function$
declare
  v_scope jsonb := p_request -> 'scope';
  v_correlation jsonb := p_request -> 'correlation';
  v_proof jsonb := p_request -> 'proof';
  v_counts jsonb := v_proof -> 'counts';
  v_org_id uuid;
  v_property_id uuid;
  v_feed_key text;
begin
  if not private.kross_jsonb_has_exact_keys_v1(
      p_request,
      array['contractVersion','requestId','requestHash','operation','scope','correlation','expected','writeSet','proof']
    )
    or p_request ->> 'contractVersion' <> 'kross.supabase.atomic-write.v1'
    or p_request ->> 'operation' <> p_operation
    or p_operation not in ('commit_feed','append_attempt_evidence')
    or coalesce(p_request ->> 'requestHash','') !~ '^[a-f0-9]{64}$'
    or p_request ->> 'requestId' <> 'sha256:' || (p_request ->> 'requestHash')
    or private.kross_sha256_json_v1(p_request - 'requestId' - 'requestHash') <> p_request ->> 'requestHash'
    or private.kross_has_forbidden_key_v1(p_request)
    or not private.kross_jsonb_has_exact_keys_v1(v_scope, array['orgId','propertyId','feed','feedKey','sourceSystem','snapshotKind'])
    or not private.kross_jsonb_has_exact_keys_v1(v_correlation, array['feedKey','attemptId','writerId','leaseId','fencingToken','receiptKey'])
    or not private.kross_jsonb_has_exact_keys_v1(v_proof, array['feedCheckpointHash','receiptHash','quarantineHash','counts'])
    or not private.kross_jsonb_has_exact_keys_v1(v_counts, array['read','accepted','rejected','unchanged','changed','conflict'])
    or v_scope ->> 'sourceSystem' <> 'Kross'
    or v_scope ->> 'snapshotKind' <> 'reservation_mirror'
    or coalesce(v_scope ->> 'orgId','') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    or coalesce(v_scope ->> 'propertyId','') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    or coalesce(v_scope ->> 'feed','') !~ '^[A-Za-z0-9._~-]{1,128}$'
    or coalesce(v_correlation ->> 'attemptId','') !~ '^[A-Za-z0-9._~-]{1,200}$'
    or coalesce(v_correlation ->> 'writerId','') !~ '^[A-Za-z0-9._~-]{1,200}$'
    or coalesce(v_correlation ->> 'leaseId','') !~ '^[A-Za-z0-9._~-]{1,200}$'
    or coalesce(v_correlation ->> 'fencingToken','') !~ '^[1-9][0-9]*$'
    or coalesce(v_proof ->> 'receiptHash','') !~ '^[a-f0-9]{64}$'
    or (v_proof ->> 'feedCheckpointHash' is not null and v_proof ->> 'feedCheckpointHash' !~ '^[a-f0-9]{64}$')
    or (v_proof ->> 'quarantineHash' is not null and v_proof ->> 'quarantineHash' !~ '^[a-f0-9]{64}$') then
    return false;
  end if;

  begin
    v_org_id := (v_scope ->> 'orgId')::uuid;
    v_property_id := (v_scope ->> 'propertyId')::uuid;
  exception when others then
    return false;
  end;

  v_feed_key := private.kross_feed_key_v1(v_org_id, v_property_id, v_scope ->> 'feed');
  if v_feed_key is null
     or v_scope ->> 'feedKey' <> v_feed_key
     or v_correlation ->> 'feedKey' <> v_feed_key
     or v_correlation ->> 'receiptKey' <> v_feed_key || '::attempt=' || (v_correlation ->> 'attemptId') then
    return false;
  end if;

  if exists (
    select 1
    from jsonb_each(v_counts) c
    where jsonb_typeof(c.value) <> 'number'
       or c.value::text !~ '^[0-9]+$'
  ) then
    return false;
  end if;

  if (v_counts ->> 'read')::bigint <> (v_counts ->> 'accepted')::bigint + (v_counts ->> 'rejected')::bigint
     or (v_counts ->> 'accepted')::bigint <> (v_counts ->> 'unchanged')::bigint + (v_counts ->> 'changed')::bigint
     or (v_counts ->> 'conflict')::bigint > (v_counts ->> 'rejected')::bigint then
    return false;
  end if;

  return true;
end;
$function$;

create function private.kross_prevent_mutation_v1()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  raise exception 'kross_evidence_is_append_only';
end;
$function$;

create function private.kross_prevent_delete_v1()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  raise exception 'kross_state_delete_denied';
end;
$function$;

create function private.kross_guard_reservation_mutation_v1()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_source_system text;
  v_guard text := current_setting('toro.kross_atomic_write_v1', true);
begin
  v_source_system := case
    when tg_op = 'DELETE' then old.source_system
    else new.source_system
  end;
  if v_source_system = 'Kross' and coalesce(v_guard,'') !~ '^[a-f0-9]{64}$' then
    raise exception 'Kross reservation mutation requires the private atomic RPC';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

create trigger kross_feed_lease_grants_append_only_v1
before update or delete on integrations.kross_feed_lease_grants_v1
for each row execute function private.kross_prevent_mutation_v1();
create trigger kross_import_runs_append_only_v1
before update or delete on integrations.kross_import_runs_v1
for each row execute function private.kross_prevent_mutation_v1();
create trigger kross_attempt_receipts_append_only_v1
before update or delete on integrations.kross_attempt_receipts_v1
for each row execute function private.kross_prevent_mutation_v1();
create trigger kross_quarantine_append_only_v1
before update or delete on integrations.kross_quarantine_v1
for each row execute function private.kross_prevent_mutation_v1();
create trigger kross_commit_journal_append_only_v1
before update or delete on integrations.kross_commit_journal_v1
for each row execute function private.kross_prevent_mutation_v1();
create trigger kross_feed_state_no_delete_v1
before delete on integrations.kross_feed_state_v1
for each row execute function private.kross_prevent_delete_v1();
create trigger kross_row_checkpoints_no_delete_v1
before delete on integrations.kross_row_checkpoints_v1
for each row execute function private.kross_prevent_delete_v1();
create trigger kross_reservations_atomic_guard_v1
before insert or update or delete on operations.reservations
for each row execute function private.kross_guard_reservation_mutation_v1();

create function private.kross_acquire_feed_lease_v1(
  p_scope jsonb,
  p_writer_id text,
  p_lease_id text,
  p_expected_token bigint,
  p_ttl_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_org_id uuid;
  v_property_id uuid;
  v_feed text;
  v_feed_key text;
  v_now timestamptz := statement_timestamp();
  v_state integrations.kross_feed_state_v1%rowtype;
  v_grant integrations.kross_feed_lease_grants_v1%rowtype;
begin
  if not private.kross_jsonb_has_exact_keys_v1(p_scope, array['orgId','propertyId','feed','feedKey','sourceSystem','snapshotKind'])
     or p_scope ->> 'sourceSystem' <> 'Kross'
     or p_scope ->> 'snapshotKind' <> 'reservation_mirror'
     or coalesce(p_scope ->> 'orgId','') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or coalesce(p_scope ->> 'propertyId','') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or coalesce(p_scope ->> 'feed','') !~ '^[A-Za-z0-9._~-]{1,128}$'
     or coalesce(p_writer_id,'') !~ '^[A-Za-z0-9._~-]{1,200}$'
     or coalesce(p_lease_id,'') !~ '^[A-Za-z0-9._~-]{1,200}$'
     or p_expected_token < 0
     or p_ttl_seconds not between 30 and 900 then
    return jsonb_build_object('status','invalid','lease',null);
  end if;

  v_org_id := (p_scope ->> 'orgId')::uuid;
  v_property_id := (p_scope ->> 'propertyId')::uuid;
  v_feed := p_scope ->> 'feed';
  v_feed_key := private.kross_feed_key_v1(v_org_id, v_property_id, v_feed);
  if p_scope ->> 'feedKey' <> v_feed_key then
    return jsonb_build_object('status','invalid','lease',null);
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_feed_key, 0));

  select * into v_grant
  from integrations.kross_feed_lease_grants_v1
  where feed_key = v_feed_key and lease_id = p_lease_id;
  if found then
    if v_grant.writer_id = p_writer_id
       and v_grant.expected_token = p_expected_token
       and v_grant.ttl_seconds = p_ttl_seconds then
      return jsonb_build_object(
        'status','replay',
        'lease',jsonb_build_object(
          'feedKey',v_feed_key,'writerId',v_grant.writer_id,'leaseId',v_grant.lease_id,
          'fencingToken',v_grant.fencing_token,'acquiredAt',v_grant.acquired_at,
          'expiresAt',v_grant.expires_at
        )
      );
    end if;
    return jsonb_build_object('status','invalid','lease',null);
  end if;

  insert into integrations.kross_feed_state_v1 (
    feed_key,org_id,property_id,feed,source_system,snapshot_kind
  ) values (
    v_feed_key,v_org_id,v_property_id,v_feed,'Kross','reservation_mirror'
  ) on conflict (feed_key) do nothing;

  select * into strict v_state
  from integrations.kross_feed_state_v1
  where feed_key = v_feed_key
  for update;

  if v_state.org_id <> v_org_id
     or v_state.property_id <> v_property_id
     or v_state.feed <> v_feed
     or v_state.fencing_token <> p_expected_token
     or (v_state.lease_expires_at is not null and v_state.lease_expires_at > v_now) then
    return jsonb_build_object('status','cas_conflict','lease',null);
  end if;

  update integrations.kross_feed_state_v1
  set fencing_token = fencing_token + 1,
      writer_id = p_writer_id,
      lease_id = p_lease_id,
      lease_acquired_at = v_now,
      lease_expires_at = v_now + make_interval(secs => p_ttl_seconds),
      updated_at = v_now
  where feed_key = v_feed_key
    and fencing_token = p_expected_token;

  insert into integrations.kross_feed_lease_grants_v1 (
    feed_key,lease_id,writer_id,expected_token,fencing_token,ttl_seconds,acquired_at,expires_at
  ) values (
    v_feed_key,p_lease_id,p_writer_id,p_expected_token,p_expected_token + 1,
    p_ttl_seconds,v_now,v_now + make_interval(secs => p_ttl_seconds)
  );

  return jsonb_build_object(
    'status','acquired',
    'lease',jsonb_build_object(
      'feedKey',v_feed_key,'writerId',p_writer_id,'leaseId',p_lease_id,
      'fencingToken',p_expected_token + 1,'acquiredAt',v_now,
      'expiresAt',v_now + make_interval(secs => p_ttl_seconds)
    )
  );
end;
$function$;

create function private.kross_commit_feed_v1(p_request jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_scope jsonb := p_request -> 'scope';
  v_correlation jsonb := p_request -> 'correlation';
  v_expected jsonb := p_request -> 'expected';
  v_write_set jsonb := p_request -> 'writeSet';
  v_proof jsonb := p_request -> 'proof';
  v_org_id uuid;
  v_property_id uuid;
  v_feed_key text;
  v_state integrations.kross_feed_state_v1%rowtype;
  v_prior integrations.kross_commit_journal_v1%rowtype;
  v_item jsonb;
  v_identity_key text;
  v_expected_value jsonb;
  v_candidate jsonb;
  v_actual jsonb;
  v_external_id text;
  v_commit_id text;
  v_commit_digest text;
  v_readback jsonb;
  v_now timestamptz := statement_timestamp();
begin
  if not private.kross_validate_atomic_request_v1(p_request,'commit_feed')
     or not private.kross_jsonb_has_exact_keys_v1(v_expected,array['feedCheckpoint','attemptReceipt','mirrors','importRuns','checkpoints'])
     or not private.kross_jsonb_has_exact_keys_v1(v_write_set,array['mirrors','importRuns','checkpoints','feedCheckpoint','attemptReceipt'])
     or jsonb_typeof(v_expected -> 'mirrors') <> 'array'
     or jsonb_typeof(v_expected -> 'importRuns') <> 'array'
     or jsonb_typeof(v_expected -> 'checkpoints') <> 'array'
     or jsonb_typeof(v_write_set -> 'mirrors') <> 'array'
     or jsonb_typeof(v_write_set -> 'importRuns') <> 'array'
     or jsonb_typeof(v_write_set -> 'checkpoints') <> 'array' then
    return jsonb_build_object(
      'status','error','requestId',p_request ->> 'requestId',
      'requestHash',p_request ->> 'requestHash','errorKind','known_unsent'
    );
  end if;

  -- v1 is intentionally historical/read-only. Health promotion requires a
  -- new versioned request that includes health in expected/write/proof.
  if exists (
    select 1
    from jsonb_array_elements(v_write_set -> 'mirrors') m
    where coalesce(m #>> '{reservation,source_is_live}','true') <> 'false'
       or m #>> '{reservation,source_system}' <> 'Kross'
       or m #>> '{reservation,transactional_authority}' <> 'Kross'
       or m #>> '{reservation,read_only_mirror}' <> 'true'
       or m #>> '{reservation,source_table}' <> 'reservations'
       or coalesce(m #>> '{reservation,source_hash}','') !~ '^[a-f0-9]{64}$'
       or coalesce(m #>> '{reservation,org_id}','') <> v_scope ->> 'orgId'
       or coalesce(m #>> '{reservation,property_id}','') <> v_scope ->> 'propertyId'
  ) then
    return jsonb_build_object(
      'status','error','requestId',p_request ->> 'requestId',
      'requestHash',p_request ->> 'requestHash','errorKind','known_unsent'
    );
  end if;

  if private.kross_sha256_json_v1(v_write_set -> 'attemptReceipt') <> v_proof ->> 'receiptHash'
     or private.kross_sha256_json_v1(v_write_set -> 'feedCheckpoint') is distinct from v_proof ->> 'feedCheckpointHash'
     or v_proof -> 'quarantineHash' <> 'null'::jsonb
     or v_write_set #>> '{attemptReceipt,feedKey}' <> v_scope ->> 'feedKey'
     or v_write_set #>> '{attemptReceipt,attemptId}' <> v_correlation ->> 'attemptId'
     or v_write_set #>> '{attemptReceipt,receiptKey}' <> v_correlation ->> 'receiptKey'
     or v_write_set #>> '{attemptReceipt,status}' <> 'accepted'
     or v_write_set #>> '{attemptReceipt,failureReason}' is not null
     or v_write_set #>> '{attemptReceipt,checkpointAdvanced}' <> 'true'
     or v_write_set #>> '{attemptReceipt,payloadStored}' <> 'false'
     or v_write_set #>> '{attemptReceipt,readOnly}' <> 'true'
     or v_write_set #>> '{attemptReceipt,pmsWriteCount}' <> '0'
     or v_write_set #>> '{feedCheckpoint,feedKey}' <> v_scope ->> 'feedKey'
     or v_write_set #>> '{feedCheckpoint,attemptId}' <> v_correlation ->> 'attemptId'
     or v_write_set #> '{attemptReceipt,counts}' <> v_proof -> 'counts'
     or v_write_set #> '{feedCheckpoint,counts}' <> v_proof -> 'counts' then
    return jsonb_build_object(
      'status','error','requestId',p_request ->> 'requestId',
      'requestHash',p_request ->> 'requestHash','errorKind','known_unsent'
    );
  end if;

  v_org_id := (v_scope ->> 'orgId')::uuid;
  v_property_id := (v_scope ->> 'propertyId')::uuid;
  v_feed_key := v_scope ->> 'feedKey';
  perform pg_advisory_xact_lock(hashtextextended(v_feed_key, 0));

  select * into v_prior
  from integrations.kross_commit_journal_v1
  where request_hash = p_request ->> 'requestHash';
  if found then
    return jsonb_build_object(
      'status','committed','requestId',v_prior.request_id,
      'requestHash',v_prior.request_hash,'commitId',v_prior.commit_id,
      'commitDigest',v_prior.commit_digest,'fencingToken',v_prior.fencing_token
    );
  end if;

  if exists (
    select 1 from integrations.kross_commit_journal_v1
    where request_id = p_request ->> 'requestId'
       or (feed_key = v_feed_key and attempt_id = v_correlation ->> 'attemptId')
  ) then
    return jsonb_build_object(
      'status','conflict','requestId',p_request ->> 'requestId',
      'requestHash',p_request ->> 'requestHash','conflictCode','request_or_attempt_conflict'
    );
  end if;

  select * into v_state
  from integrations.kross_feed_state_v1
  where feed_key = v_feed_key
  for update;
  if not found
     or v_state.org_id <> v_org_id
     or v_state.property_id <> v_property_id
     or v_state.writer_id <> v_correlation ->> 'writerId'
     or v_state.lease_id <> v_correlation ->> 'leaseId'
     or v_state.fencing_token <> (v_correlation ->> 'fencingToken')::bigint
     or v_state.lease_expires_at <= v_now then
    return jsonb_build_object(
      'status','fenced','requestId',p_request ->> 'requestId',
      'requestHash',p_request ->> 'requestHash',
      'observedFencingToken',coalesce(v_state.fencing_token,0)
    );
  end if;

  if v_state.feed_checkpoint is distinct from v_expected -> 'feedCheckpoint' then
    return jsonb_build_object(
      'status','conflict','requestId',p_request ->> 'requestId',
      'requestHash',p_request ->> 'requestHash','conflictCode','feed_checkpoint_changed'
    );
  end if;

  select evidence into v_actual
  from integrations.kross_attempt_receipts_v1
  where feed_key = v_feed_key and attempt_id = v_correlation ->> 'attemptId';
  if v_actual is distinct from v_expected -> 'attemptReceipt' then
    return jsonb_build_object(
      'status','conflict','requestId',p_request ->> 'requestId',
      'requestHash',p_request ->> 'requestHash','conflictCode','attempt_receipt_changed'
    );
  end if;

  if jsonb_array_length(v_expected -> 'mirrors') <> jsonb_array_length(v_write_set -> 'mirrors')
     or jsonb_array_length(v_expected -> 'importRuns') <> jsonb_array_length(v_write_set -> 'importRuns')
     or jsonb_array_length(v_expected -> 'checkpoints') <> jsonb_array_length(v_write_set -> 'checkpoints')
     or exists (
       select 1 from (
         select value ->> 'identityKey' k, count(*) n
         from jsonb_array_elements(v_write_set -> 'mirrors') group by 1
       ) d where k is null or n <> 1
     )
     or exists (
       select 1 from (
         select value ->> 'runKey' k, count(*) n
         from jsonb_array_elements(v_write_set -> 'importRuns') group by 1
       ) d where k is null or n <> 1
     ) then
    return jsonb_build_object(
      'status','error','requestId',p_request ->> 'requestId',
      'requestHash',p_request ->> 'requestHash','errorKind','known_unsent'
    );
  end if;

  for v_item in select value from jsonb_array_elements(v_expected -> 'mirrors') loop
    if not private.kross_jsonb_has_exact_keys_v1(v_item,array['identityKey','expected']) then
      return jsonb_build_object('status','error','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','errorKind','known_unsent');
    end if;
    v_identity_key := v_item ->> 'identityKey';
    v_expected_value := v_item -> 'expected';
    select m.value -> 'reservation' into v_candidate
    from jsonb_array_elements(v_write_set -> 'mirrors') m(value)
    where m.value ->> 'identityKey' = v_identity_key;
    v_candidate := coalesce(v_expected_value, v_candidate);
    if v_candidate is null
       or v_identity_key <> (v_candidate ->> 'org_id') || ':' || (v_candidate ->> 'property_id') || ':' || (v_candidate ->> 'external_reservation_id') then
      return jsonb_build_object('status','error','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','errorKind','known_unsent');
    end if;
    v_external_id := v_candidate ->> 'external_reservation_id';
    v_actual := private.kross_current_reservation_json_v1(v_org_id,v_property_id,v_external_id);
    if v_actual is distinct from v_expected_value then
      return jsonb_build_object('status','conflict','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','conflictCode','mirror_changed');
    end if;
  end loop;

  for v_item in select value from jsonb_array_elements(v_expected -> 'importRuns') loop
    if not private.kross_jsonb_has_exact_keys_v1(v_item,array['runKey','expected']) then
      return jsonb_build_object('status','error','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','errorKind','known_unsent');
    end if;
    select evidence into v_actual from integrations.kross_import_runs_v1 where run_key = v_item ->> 'runKey';
    if v_actual is distinct from v_item -> 'expected' then
      return jsonb_build_object('status','conflict','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','conflictCode','import_run_changed');
    end if;
  end loop;

  for v_item in select value from jsonb_array_elements(v_expected -> 'checkpoints') loop
    if not private.kross_jsonb_has_exact_keys_v1(v_item,array['identityKey','expected']) then
      return jsonb_build_object('status','error','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','errorKind','known_unsent');
    end if;
    select evidence into v_actual
    from integrations.kross_row_checkpoints_v1
    where feed_key = v_feed_key and identity_key = v_item ->> 'identityKey';
    if v_actual is distinct from v_item -> 'expected' then
      return jsonb_build_object('status','conflict','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','conflictCode','row_checkpoint_changed');
    end if;
  end loop;

  perform pg_catalog.set_config('toro.kross_atomic_write_v1', p_request ->> 'requestHash', true);

  insert into operations.reservations (
    org_id,property_id,external_reservation_id,reservation_key,room_id,room_code_raw,
    check_in,check_out,status,guests_count,adults,children,channel,breakfast_included,
    transactional_authority,read_only_mirror,source_is_live,source_system,source_table,
    source_record_id,snapshot_as_of,last_synced_at,source_hash,data_quality_status,updated_at
  )
  select
    (m #>> '{reservation,org_id}')::uuid,
    (m #>> '{reservation,property_id}')::uuid,
    m #>> '{reservation,external_reservation_id}',
    m #>> '{reservation,reservation_key}',
    nullif(m #>> '{reservation,room_id}','')::uuid,
    m #>> '{reservation,room_code_raw}',
    (m #>> '{reservation,check_in}')::date,
    (m #>> '{reservation,check_out}')::date,
    m #>> '{reservation,status}',
    nullif(m #>> '{reservation,guests_count}','')::integer,
    nullif(m #>> '{reservation,adults}','')::integer,
    nullif(m #>> '{reservation,children}','')::integer,
    m #>> '{reservation,channel}',
    nullif(m #>> '{reservation,breakfast_included}','')::boolean,
    'Kross',true,false,'Kross','reservations',
    m #>> '{reservation,source_record_id}',
    (m #>> '{reservation,snapshot_as_of}')::timestamptz,
    (m #>> '{reservation,last_synced_at}')::timestamptz,
    m #>> '{reservation,source_hash}',
    m #>> '{reservation,data_quality_status}',
    v_now
  from jsonb_array_elements(v_write_set -> 'mirrors') m
  on conflict (org_id,property_id,source_system,external_reservation_id)
  do update set
    reservation_key = excluded.reservation_key,
    room_id = excluded.room_id,
    room_code_raw = excluded.room_code_raw,
    check_in = excluded.check_in,
    check_out = excluded.check_out,
    status = excluded.status,
    guests_count = excluded.guests_count,
    adults = excluded.adults,
    children = excluded.children,
    channel = excluded.channel,
    breakfast_included = excluded.breakfast_included,
    transactional_authority = excluded.transactional_authority,
    read_only_mirror = excluded.read_only_mirror,
    source_is_live = false,
    source_table = excluded.source_table,
    source_record_id = excluded.source_record_id,
    snapshot_as_of = excluded.snapshot_as_of,
    last_synced_at = excluded.last_synced_at,
    source_hash = excluded.source_hash,
    data_quality_status = excluded.data_quality_status,
    updated_at = excluded.updated_at;

  insert into integrations.kross_import_runs_v1 (
    run_key,feed_key,org_id,property_id,identity_key,artifact_hash,record_hash,
    attempt_id,source_as_of,observed_at,evidence
  )
  select
    r ->> 'runKey',v_feed_key,v_org_id,v_property_id,
    r #>> '{evidence,identityKey}',r #>> '{evidence,artifactHash}',
    r #>> '{evidence,recordHash}',r #>> '{evidence,attemptId}',
    (r #>> '{evidence,sourceAsOf}')::timestamptz,
    (r #>> '{evidence,observedAt}')::timestamptz,
    r -> 'evidence'
  from jsonb_array_elements(v_write_set -> 'importRuns') r;

  insert into integrations.kross_row_checkpoints_v1 (
    feed_key,identity_key,run_key,source_as_of,record_hash,evidence,updated_at
  )
  select
    v_feed_key,c ->> 'identityKey',c #>> '{checkpoint,runKey}',
    (c #>> '{checkpoint,sourceAsOf}')::timestamptz,
    c #>> '{checkpoint,recordHash}',c -> 'checkpoint',v_now
  from jsonb_array_elements(v_write_set -> 'checkpoints') c
  on conflict (feed_key,identity_key) do update set
    run_key = excluded.run_key,
    source_as_of = excluded.source_as_of,
    record_hash = excluded.record_hash,
    evidence = excluded.evidence,
    updated_at = excluded.updated_at;

  insert into integrations.kross_attempt_receipts_v1 (
    receipt_key,feed_key,attempt_id,request_fingerprint,artifact_hash,receipt_hash,
    source_as_of,observed_at,recorded_at,evidence
  ) values (
    v_correlation ->> 'receiptKey',v_feed_key,v_correlation ->> 'attemptId',
    v_write_set #>> '{attemptReceipt,requestFingerprint}',
    v_write_set #>> '{attemptReceipt,artifactHash}',v_proof ->> 'receiptHash',
    (v_write_set #>> '{attemptReceipt,sourceAsOf}')::timestamptz,
    (v_write_set #>> '{attemptReceipt,observedAt}')::timestamptz,
    (v_write_set #>> '{attemptReceipt,recordedAt}')::timestamptz,
    v_write_set -> 'attemptReceipt'
  );

  update integrations.kross_feed_state_v1
  set feed_checkpoint = v_write_set -> 'feedCheckpoint',
      feed_checkpoint_hash = v_proof ->> 'feedCheckpointHash',
      last_request_hash = p_request ->> 'requestHash',
      updated_at = v_now
  where feed_key = v_feed_key
    and writer_id = v_correlation ->> 'writerId'
    and lease_id = v_correlation ->> 'leaseId'
    and fencing_token = (v_correlation ->> 'fencingToken')::bigint
    and lease_expires_at > v_now;

  if not found then
    raise exception 'writer_fenced_before_commit';
  end if;

  v_commit_id := 'commit:' || (p_request ->> 'requestHash');
  v_commit_digest := private.kross_sha256_json_v1(jsonb_build_object(
    'requestHash',p_request ->> 'requestHash','operation','commit_feed',
    'feedKey',v_feed_key,'attemptId',v_correlation ->> 'attemptId',
    'leaseId',v_correlation ->> 'leaseId',
    'fencingToken',(v_correlation ->> 'fencingToken')::bigint,
    'commitId',v_commit_id,'proof',v_proof
  ));
  v_readback := jsonb_build_object(
    'contractVersion','kross.supabase.atomic-readback.v1',
    'requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash',
    'operation','commit_feed','scope',v_scope,'correlation',v_correlation,
    'status','committed','commitId',v_commit_id,'commitDigest',v_commit_digest,
    'proof',v_proof
  );

  insert into integrations.kross_commit_journal_v1 (
    request_hash,request_id,operation,feed_key,attempt_id,lease_id,fencing_token,
    commit_id,commit_digest,scope,correlation,proof,readback
  ) values (
    p_request ->> 'requestHash',p_request ->> 'requestId','commit_feed',v_feed_key,
    v_correlation ->> 'attemptId',v_correlation ->> 'leaseId',
    (v_correlation ->> 'fencingToken')::bigint,v_commit_id,v_commit_digest,
    v_scope,v_correlation,v_proof,v_readback
  );

  return jsonb_build_object(
    'status','committed','requestId',p_request ->> 'requestId',
    'requestHash',p_request ->> 'requestHash','commitId',v_commit_id,
    'commitDigest',v_commit_digest,
    'fencingToken',(v_correlation ->> 'fencingToken')::bigint
  );
end;
$function$;

create function private.kross_append_attempt_evidence_v1(p_request jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_scope jsonb := p_request -> 'scope';
  v_correlation jsonb := p_request -> 'correlation';
  v_expected jsonb := p_request -> 'expected';
  v_write_set jsonb := p_request -> 'writeSet';
  v_proof jsonb := p_request -> 'proof';
  v_feed_key text;
  v_state integrations.kross_feed_state_v1%rowtype;
  v_prior integrations.kross_commit_journal_v1%rowtype;
  v_actual jsonb;
  v_quarantine jsonb;
  v_commit_id text;
  v_commit_digest text;
  v_readback jsonb;
  v_now timestamptz := statement_timestamp();
begin
  if not private.kross_validate_atomic_request_v1(p_request,'append_attempt_evidence')
     or not private.kross_jsonb_has_exact_keys_v1(v_expected,array['receipt'])
     or not private.kross_jsonb_has_exact_keys_v1(v_write_set,array['receipt','quarantine'])
     or private.kross_sha256_json_v1(v_write_set -> 'receipt') <> v_proof ->> 'receiptHash'
     or v_write_set #>> '{receipt,feedKey}' <> v_scope ->> 'feedKey'
     or v_write_set #>> '{receipt,attemptId}' <> v_correlation ->> 'attemptId'
     or v_write_set #>> '{receipt,receiptKey}' <> v_correlation ->> 'receiptKey'
     or v_write_set #>> '{receipt,checkpointAdvanced}' <> 'false'
     or v_write_set #>> '{receipt,payloadStored}' <> 'false'
     or v_write_set #>> '{receipt,readOnly}' <> 'true'
     or v_write_set #>> '{receipt,pmsWriteCount}' <> '0'
     or v_write_set #> '{receipt,counts}' <> v_proof -> 'counts'
     or v_proof -> 'feedCheckpointHash' <> 'null'::jsonb then
    return jsonb_build_object('status','error','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','errorKind','known_unsent');
  end if;

  v_quarantine := v_write_set -> 'quarantine';
  if (v_quarantine = 'null'::jsonb and v_proof -> 'quarantineHash' <> 'null'::jsonb)
     or (v_quarantine <> 'null'::jsonb and private.kross_sha256_json_v1(v_quarantine) <> v_proof ->> 'quarantineHash')
     or not (
       (v_write_set #>> '{receipt,status}' = 'accepted'
        and v_write_set #>> '{receipt,operation}' = 'replay'
        and v_quarantine = 'null'::jsonb)
       or
       (v_write_set #>> '{receipt,status}' = 'rejected'
        and v_write_set #>> '{receipt,failureReason}' is not null
        and v_quarantine <> 'null'::jsonb)
     ) then
    return jsonb_build_object('status','error','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','errorKind','known_unsent');
  end if;

  v_feed_key := v_scope ->> 'feedKey';
  perform pg_advisory_xact_lock(hashtextextended(v_feed_key, 0));

  select * into v_prior from integrations.kross_commit_journal_v1
  where request_hash = p_request ->> 'requestHash';
  if found then
    return jsonb_build_object(
      'status','committed','requestId',v_prior.request_id,'requestHash',v_prior.request_hash,
      'commitId',v_prior.commit_id,'commitDigest',v_prior.commit_digest,
      'fencingToken',v_prior.fencing_token
    );
  end if;

  if exists (
    select 1 from integrations.kross_commit_journal_v1
    where request_id = p_request ->> 'requestId'
       or (feed_key = v_feed_key and attempt_id = v_correlation ->> 'attemptId')
  ) then
    return jsonb_build_object('status','conflict','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','conflictCode','request_or_attempt_conflict');
  end if;

  select * into v_state from integrations.kross_feed_state_v1
  where feed_key = v_feed_key for update;
  if not found
     or v_state.org_id::text <> v_scope ->> 'orgId'
     or v_state.property_id::text <> v_scope ->> 'propertyId'
     or v_state.writer_id <> v_correlation ->> 'writerId'
     or v_state.lease_id <> v_correlation ->> 'leaseId'
     or v_state.fencing_token <> (v_correlation ->> 'fencingToken')::bigint
     or v_state.lease_expires_at <= v_now then
    return jsonb_build_object('status','fenced','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','observedFencingToken',coalesce(v_state.fencing_token,0));
  end if;

  select evidence into v_actual from integrations.kross_attempt_receipts_v1
  where feed_key = v_feed_key and attempt_id = v_correlation ->> 'attemptId';
  if v_actual is distinct from v_expected -> 'receipt' then
    return jsonb_build_object('status','conflict','requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash','conflictCode','attempt_receipt_changed');
  end if;

  insert into integrations.kross_attempt_receipts_v1 (
    receipt_key,feed_key,attempt_id,request_fingerprint,artifact_hash,receipt_hash,
    source_as_of,observed_at,recorded_at,evidence
  ) values (
    v_correlation ->> 'receiptKey',v_feed_key,v_correlation ->> 'attemptId',
    v_write_set #>> '{receipt,requestFingerprint}',v_write_set #>> '{receipt,artifactHash}',
    v_proof ->> 'receiptHash',(v_write_set #>> '{receipt,sourceAsOf}')::timestamptz,
    (v_write_set #>> '{receipt,observedAt}')::timestamptz,
    (v_write_set #>> '{receipt,recordedAt}')::timestamptz,v_write_set -> 'receipt'
  );

  if v_quarantine <> 'null'::jsonb then
    insert into integrations.kross_quarantine_v1 (
      quarantine_key,receipt_key,feed_key,attempt_id,quarantine_hash,reason,evidence
    ) values (
      v_quarantine ->> 'quarantineKey',v_correlation ->> 'receiptKey',v_feed_key,
      v_correlation ->> 'attemptId',v_proof ->> 'quarantineHash',
      v_quarantine ->> 'reason',v_quarantine
    );
  end if;

  v_commit_id := 'commit:' || (p_request ->> 'requestHash');
  v_commit_digest := private.kross_sha256_json_v1(jsonb_build_object(
    'requestHash',p_request ->> 'requestHash','operation','append_attempt_evidence',
    'feedKey',v_feed_key,'attemptId',v_correlation ->> 'attemptId',
    'leaseId',v_correlation ->> 'leaseId',
    'fencingToken',(v_correlation ->> 'fencingToken')::bigint,
    'commitId',v_commit_id,'proof',v_proof
  ));
  v_readback := jsonb_build_object(
    'contractVersion','kross.supabase.atomic-readback.v1',
    'requestId',p_request ->> 'requestId','requestHash',p_request ->> 'requestHash',
    'operation','append_attempt_evidence','scope',v_scope,'correlation',v_correlation,
    'status','committed','commitId',v_commit_id,'commitDigest',v_commit_digest,'proof',v_proof
  );
  insert into integrations.kross_commit_journal_v1 (
    request_hash,request_id,operation,feed_key,attempt_id,lease_id,fencing_token,
    commit_id,commit_digest,scope,correlation,proof,readback
  ) values (
    p_request ->> 'requestHash',p_request ->> 'requestId','append_attempt_evidence',
    v_feed_key,v_correlation ->> 'attemptId',v_correlation ->> 'leaseId',
    (v_correlation ->> 'fencingToken')::bigint,v_commit_id,v_commit_digest,
    v_scope,v_correlation,v_proof,v_readback
  );

  return jsonb_build_object(
    'status','committed','requestId',p_request ->> 'requestId',
    'requestHash',p_request ->> 'requestHash','commitId',v_commit_id,
    'commitDigest',v_commit_digest,
    'fencingToken',(v_correlation ->> 'fencingToken')::bigint
  );
end;
$function$;

create function private.kross_atomic_readback_v1(p_request jsonb)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select j.readback
  from integrations.kross_commit_journal_v1 j
  where private.kross_jsonb_has_exact_keys_v1(
      p_request,
      array['contractVersion','requestId','requestHash','operation','feedKey','attemptId','leaseId','fencingToken']
    )
    and p_request ->> 'contractVersion' = 'kross.supabase.atomic-readback-request.v1'
    and j.request_id = p_request ->> 'requestId'
    and j.request_hash = p_request ->> 'requestHash'
    and j.operation = p_request ->> 'operation'
    and j.feed_key = p_request ->> 'feedKey'
    and j.attempt_id = p_request ->> 'attemptId'
    and j.lease_id = p_request ->> 'leaseId'
    and j.fencing_token = (p_request ->> 'fencingToken')::bigint;
$function$;

revoke all on function private.kross_jsonb_has_exact_keys_v1(jsonb,text[]) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_canonical_json_v1(jsonb) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_sha256_json_v1(jsonb) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_has_forbidden_key_v1(jsonb) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_feed_key_v1(uuid,uuid,text) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_current_reservation_json_v1(uuid,uuid,text) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_validate_atomic_request_v1(jsonb,text) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_prevent_mutation_v1() from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_prevent_delete_v1() from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_guard_reservation_mutation_v1() from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_acquire_feed_lease_v1(jsonb,text,text,bigint,integer) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_commit_feed_v1(jsonb) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_append_attempt_evidence_v1(jsonb) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;
revoke all on function private.kross_atomic_readback_v1(jsonb) from public,anon,authenticated,service_role,toro_kross_ingest_executor_v1;

grant usage on schema private to toro_kross_ingest_executor_v1;
grant execute on function private.kross_acquire_feed_lease_v1(jsonb,text,text,bigint,integer) to toro_kross_ingest_executor_v1;
grant execute on function private.kross_commit_feed_v1(jsonb) to toro_kross_ingest_executor_v1;
grant execute on function private.kross_append_attempt_evidence_v1(jsonb) to toro_kross_ingest_executor_v1;
grant execute on function private.kross_atomic_readback_v1(jsonb) to toro_kross_ingest_executor_v1;

comment on role toro_kross_ingest_executor_v1 is
  'NOLOGIN execution capability only. Do not grant to OpenClaw, WhatsApp, browser clients or service_role. Membership requires a separate reviewed activation.';
comment on function private.kross_commit_feed_v1(jsonb) is
  'Private executor-only atomic write. v1 rejects source_is_live=true and never promotes Kross health.';
comment on function private.kross_append_attempt_evidence_v1(jsonb) is
  'Private executor-only append-only attempt evidence transaction.';

do $readback$
declare
  v_name text;
begin
  foreach v_name in array array[
    'integrations.kross_feed_state_v1',
    'integrations.kross_feed_lease_grants_v1',
    'integrations.kross_import_runs_v1',
    'integrations.kross_row_checkpoints_v1',
    'integrations.kross_attempt_receipts_v1',
    'integrations.kross_quarantine_v1',
    'integrations.kross_commit_journal_v1'
  ] loop
    if not exists (
      select 1 from pg_catalog.pg_class c
      where c.oid = v_name::regclass and c.relrowsecurity
    ) then
      raise exception '% readback failed: RLS is not enabled', v_name;
    end if;
    if has_table_privilege('toro_kross_ingest_executor_v1',v_name,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') then
      raise exception '% readback failed: executor has direct table access', v_name;
    end if;
  end loop;

  if has_function_privilege('anon','private.kross_commit_feed_v1(jsonb)','EXECUTE')
     or has_function_privilege('authenticated','private.kross_commit_feed_v1(jsonb)','EXECUTE')
     or has_function_privilege('service_role','private.kross_commit_feed_v1(jsonb)','EXECUTE')
     or not has_function_privilege('toro_kross_ingest_executor_v1','private.kross_commit_feed_v1(jsonb)','EXECUTE') then
    raise exception 'executor-only RPC privilege readback failed';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'operations.reservations'::regclass
      and tgname = 'kross_reservations_atomic_guard_v1'
      and not tgisinternal
  ) then
    raise exception 'Kross reservation mutation guard readback failed';
  end if;
end;
$readback$;

commit;
