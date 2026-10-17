-- DRAFT ONLY — NOT AUTHORIZED FOR PRODUCTION APPLY
-- TORO Alegra L3 signed owner approval + atomic dispatch admission v1
-- Date: 2026-10-16
--
-- Purpose:
--   Keep the generic worker claim paths at L0-L2 while providing one narrowly
--   scoped, fail-closed boundary for an owner-approved Alegra purchase bill.
--
-- Authority split:
--   * signer: the existing public.resolve_toro_decision(...) RPC, authenticated
--     with its live FOUNDER + ADMIN/GERENCIA gates and an active canonical
--     organization membership;
--   * writer: a future dedicated runtime role that can only consume the
--     immutable signed row through the narrow RPCs below. service_role is not
--     that role and receives no EXECUTE grant in this draft.
--
-- operations.executive_decisions alone is NOT a signed approval: its live
-- schema has no approver UUID, payload hash, revision, or expiry. The dedicated
-- immutable row below captures those facts in the signer transaction. Neither
-- writer-supplied run metadata nor an approval receipt is authority by itself.
--
-- This draft does not enable the Writer, grant a capability, create an owner
-- membership, create an owner approval, or call Alegra. No EXECUTE or table
-- privilege is granted to service_role. A separate reviewed activation would
-- be required after real database/concurrency validation. Activation also
-- requires a dedicated runtime role with no direct DML on runs, receipts,
-- decisions, or signed approvals and no EXECUTE on the canonical signer RPC;
-- a row trigger is defense in depth, not a substitute for that ACL boundary.
--
-- LIVE DATABASE ACCEPTANCE REQUIRED BEFORE ACTIVATION:
--   * expired -> renewed on the same queued run must serialize and supersede;
--   * an admission waiting on the run lock must reject if expiry passes while
--     it waits (wait-through-expiry), without mutating the run.
--   * a heartbeat waiting through lease expiry must fail without revival;
--   * expired-lease recovery versus finalization must have exactly one winner,
--     increment fencing on recovery, and replay the same reconciliation receipt.

begin;

do $$
declare
  v_resolver regprocedure := to_regprocedure('public.resolve_toro_decision(uuid,text,text,text)');
  v_function regprocedure;
  v_expected_md5 text;
begin
  if current_user <> 'postgres' then
    raise exception 'alegra_l3_deployer_must_be_postgres';
  end if;

  if v_resolver is null then
    raise exception 'missing_canonical_decision_resolver';
  end if;

  -- Pin the exact live generic worker boundary before replacing it. This was
  -- read back from project abtyrbqlqbsastmridzp on 2026-10-16. Fail before
  -- the first DDL if either body, owner, security mode, search_path, or ACL
  -- has drifted; CREATE OR REPLACE would otherwise preserve an unsafe ACL.
  for v_function, v_expected_md5 in
    select expected.function_oid, expected.definition_md5
    from (values
      (
        to_regprocedure('public.toro_transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text)'),
        'd4a3fa3f97e521af83bf64161f2db473'::text
      ),
      (
        to_regprocedure('public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)'),
        '7ae24e38863cc14f7efecfe6ebef65cf'::text
      )
    ) as expected(function_oid, definition_md5)
  loop
    if v_function is null or not exists (
      select 1
      from pg_catalog.pg_proc p
      where p.oid = v_function
        and not p.prosecdef
        and pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
        and coalesce(p.proconfig, '{}'::text[]) @> array['search_path=""']::text[]
        and md5(pg_catalog.pg_get_functiondef(p.oid)) = v_expected_md5
        and pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('public', p.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
        and (
          select count(*) = 2
            and count(*) filter (
              where privilege.grantee = p.proowner
            ) = 1
            and count(*) filter (
              where privilege.grantee = (
                select role.oid
                from pg_catalog.pg_roles role
                where role.rolname = 'service_role'
              )
            ) = 1
            and pg_catalog.bool_and(
              privilege.privilege_type = 'EXECUTE'
              and privilege.grantor = p.proowner
              and not privilege.is_grantable
            )
          from pg_catalog.aclexplode(
            coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
          ) privilege
        )
    ) then
      raise exception 'generic_worker_rpc_live_preflight_drifted';
    end if;
  end loop;

  if not exists (
    select 1
    from pg_catalog.pg_proc p
    where p.oid = v_resolver
      and p.prosecdef
      and pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
      and coalesce(p.proconfig, '{}'::text[]) @> array['search_path=""']::text[]
      and md5(pg_catalog.pg_get_functiondef(p.oid)) = '8d06580e9ae843c42b2620908fdbea1a'
      and pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
      and position('auth.uid()' in pg_catalog.pg_get_functiondef(p.oid)) > 0
      and position('FOUNDER' in pg_catalog.pg_get_functiondef(p.oid)) > 0
      and position('private.has_org_role' in pg_catalog.pg_get_functiondef(p.oid)) > 0
      and position('ADMIN' in pg_catalog.pg_get_functiondef(p.oid)) > 0
      and position('GERENCIA' in pg_catalog.pg_get_functiondef(p.oid)) > 0
  ) then
    raise exception 'canonical_decision_resolver_drifted';
  end if;

  if to_regclass('public.toro_execution_runs') is null
     or to_regclass('public.toro_execution_receipts') is null
     or to_regclass('operations.executive_decisions') is null
     or to_regclass('identity.organization_memberships') is null
     or to_regclass('public.user_roles') is null
     or to_regclass('public.roles') is null
     or to_regclass('auth.users') is null then
    raise exception 'alegra_l3_dependency_missing';
  end if;

  -- The worker must not gain a direct path to the canonical signer ledger.
  if pg_catalog.has_schema_privilege('service_role', 'operations', 'USAGE') then
    raise exception 'service_role_operations_schema_usage_forbidden';
  end if;

  if pg_catalog.has_table_privilege(
       'authenticated',
       'operations.executive_decisions',
       'INSERT,UPDATE,DELETE'
     ) then
    raise exception 'authenticated_direct_decision_write_forbidden';
  end if;
end;
$$;

-- A rollback deliberately retains the immutable owner-approval ledger. A
-- reapply may reuse it only when its complete security contract is still
-- present; CREATE TABLE IF NOT EXISTS must never normalize an arbitrary table.
do $$
declare
  v_ledger regclass := to_regclass('public.toro_alegra_l3_owner_approvals');
  v_immutability_function regprocedure :=
    to_regprocedure('public.toro_prevent_alegra_l3_owner_approval_mutation_v1()');
  v_constraint_defs text;
  v_immutability_comment text;
  v_immutability_md5 text;
begin
  if v_ledger is null then
    return;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = v_ledger
      and relation.relkind = 'r'
      and relation.relrowsecurity
      and pg_catalog.pg_get_userbyid(relation.relowner) = 'postgres'
      and not exists (
        select 1
        from pg_catalog.aclexplode(
          coalesce(relation.relacl, pg_catalog.acldefault('r', relation.relowner))
        ) privilege
        where privilege.grantee <> relation.relowner
      )
  ) then
    raise exception 'alegra_l3_retained_ledger_security_drifted';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_attribute attribute
    where attribute.attrelid = v_ledger
      and attribute.attnum > 0
      and not attribute.attisdropped
  ) <> 21 or exists (
    select 1
    from (values
      ('id','uuid',true),
      ('org_id','uuid',true),
      ('run_id','uuid',true),
      ('task_id','uuid',true),
      ('decision_id','uuid',true),
      ('supersedes_approval_id','uuid',false),
      ('approval_id','text',true),
      ('actor_id','uuid',true),
      ('actor_membership_id','uuid',true),
      ('actor_membership_type','text',true),
      ('actor_role_assignment_id','uuid',true),
      ('actor_role_id','uuid',true),
      ('actor_role_code','text',true),
      ('actor_toro_role','text',true),
      ('action_key','text',true),
      ('target_system','text',true),
      ('payload_hash','text',true),
      ('approved_at','timestamp with time zone',true),
      ('expires_at','timestamp with time zone',true),
      ('decision_revision','timestamp with time zone',true),
      ('created_at','timestamp with time zone',true)
    ) expected(column_name, data_type, is_not_null)
    left join pg_catalog.pg_attribute attribute
      on attribute.attrelid = v_ledger
     and attribute.attname = expected.column_name
     and attribute.attnum > 0
     and not attribute.attisdropped
    where attribute.attname is null
       or pg_catalog.format_type(attribute.atttypid, attribute.atttypmod)
            <> expected.data_type
       or attribute.attnotnull <> expected.is_not_null
  ) then
    raise exception 'alegra_l3_retained_ledger_column_drifted';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_attrdef default_row
    where default_row.adrelid = v_ledger
  ) <> 2 or not exists (
    select 1
    from pg_catalog.pg_attrdef default_row
    join pg_catalog.pg_attribute attribute
      on attribute.attrelid = default_row.adrelid
     and attribute.attnum = default_row.adnum
    where default_row.adrelid = v_ledger
      and attribute.attname = 'id'
      and pg_catalog.pg_get_expr(default_row.adbin, default_row.adrelid)
            in ('gen_random_uuid()', 'extensions.gen_random_uuid()')
  ) or not exists (
    select 1
    from pg_catalog.pg_attrdef default_row
    join pg_catalog.pg_attribute attribute
      on attribute.attrelid = default_row.adrelid
     and attribute.attnum = default_row.adnum
    where default_row.adrelid = v_ledger
      and attribute.attname = 'created_at'
      and pg_catalog.pg_get_expr(default_row.adbin, default_row.adrelid) = 'clock_timestamp()'
  ) then
    raise exception 'alegra_l3_retained_ledger_default_drifted';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = v_ledger
  ) <> 19 or exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = v_ledger
      and not constraint_row.convalidated
  ) or (
    select count(*) from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = v_ledger and constraint_row.contype = 'p'
  ) <> 1 or (
    select count(*) from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = v_ledger and constraint_row.contype = 'u'
  ) <> 3 or (
    select count(*) from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = v_ledger and constraint_row.contype = 'f'
  ) <> 5 or (
    select count(*) from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = v_ledger and constraint_row.contype = 'c'
  ) <> 10 then
    raise exception 'alegra_l3_retained_ledger_constraint_drifted';
  end if;

  select string_agg(
           lower(regexp_replace(pg_catalog.pg_get_constraintdef(constraint_row.oid, true), '\s+', '', 'g')),
           E'\n'
         )
    into v_constraint_defs
  from pg_catalog.pg_constraint constraint_row
  where constraint_row.conrelid = v_ledger;

  if position('primarykey(id)' in v_constraint_defs) = 0
     or position('unique(org_id,id)' in v_constraint_defs) = 0
     or position('unique(org_id,decision_id)' in v_constraint_defs) = 0
     or position('unique(org_id,run_id,approval_id)' in v_constraint_defs) = 0
     or v_constraint_defs !~ 'foreignkey\(org_id\)references(public\.)?organizations\(id\)'
     or v_constraint_defs !~ 'foreignkey\(org_id,run_id\)references(public\.)?toro_execution_runs\(org_id,id\)'
     or v_constraint_defs !~ 'foreignkey\(org_id,task_id\)references(operations\.)?tasks\(org_id,id\)'
     or v_constraint_defs !~ 'foreignkey\(org_id,decision_id\)references(operations\.)?executive_decisions\(org_id,id\)'
     or v_constraint_defs !~ 'foreignkey\(org_id,supersedes_approval_id\)references(public\.)?toro_alegra_l3_owner_approvals\(org_id,id\)'
     or position('btrim(approval_id)' in v_constraint_defs) = 0
     or position('actor_role_code' in v_constraint_defs) = 0
     or position('actor_toro_role' in v_constraint_defs) = 0
     or position('payload_hash' in v_constraint_defs) = 0
     or position('expires_at=approved_at+' in v_constraint_defs) = 0
     or position('decision_revision=approved_at' in v_constraint_defs) = 0
     or position('approved_at<=created_at' in v_constraint_defs) = 0 then
    raise exception 'alegra_l3_retained_ledger_constraint_definition_drifted';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_indexes index_row
    where index_row.schemaname = 'public'
      and index_row.tablename = 'toro_alegra_l3_owner_approvals'
      and index_row.indexname = 'toro_alegra_l3_owner_approvals_run_idx'
      and lower(regexp_replace(index_row.indexdef, '\s+', ' ', 'g')) like
        '%(org_id, run_id, approved_at desc, id desc)%'
  ) then
    raise exception 'alegra_l3_retained_ledger_index_drifted';
  end if;

  if v_immutability_function is null or not exists (
    select 1
    from pg_catalog.pg_proc function_row
    where function_row.oid = v_immutability_function
      and not function_row.prosecdef
      and pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
      and coalesce(function_row.proconfig, '{}'::text[])
            @> array['search_path=""']::text[]
      and not pg_catalog.has_function_privilege('public', function_row.oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('anon', function_row.oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('authenticated', function_row.oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('service_role', function_row.oid, 'EXECUTE')
      and (
        select count(*) = 1
          and pg_catalog.bool_and(
            privilege.grantee = function_row.proowner
            and privilege.privilege_type = 'EXECUTE'
            and privilege.grantor = function_row.proowner
            and not privilege.is_grantable
          )
        from pg_catalog.aclexplode(
          coalesce(
            function_row.proacl,
            pg_catalog.acldefault('f', function_row.proowner)
          )
        ) privilege
      )
      and position(
        'alegra_l3_owner_approval_is_immutable'
        in pg_catalog.pg_get_functiondef(function_row.oid)
      ) > 0
  ) or not exists (
    select 1
    from pg_catalog.pg_trigger trigger_row
    where trigger_row.tgrelid = v_ledger
      and trigger_row.tgname = 'toro_prevent_alegra_l3_owner_approval_mutation'
      and not trigger_row.tgisinternal
      and trigger_row.tgenabled = 'O'
      and trigger_row.tgfoid = v_immutability_function
      -- pg_get_triggerdef canonicalizes event order (DELETE OR UPDATE).
         -- tgtype = 1 ROW + 2 BEFORE + 8 DELETE + 16 UPDATE; no extra events.
         and trigger_row.tgtype = 27
  ) then
    raise exception 'alegra_l3_retained_ledger_immutability_drifted';
  end if;

  v_immutability_comment := pg_catalog.obj_description(
    v_immutability_function,
    'pg_proc'
  );
  v_immutability_md5 := substring(
    coalesce(v_immutability_comment, '')
    from 'TORO_ALEGRA_L3_IMMUTABILITY_MD5=([0-9a-f]{32})$'
  );
  if v_immutability_md5 is null
     or md5(pg_catalog.pg_get_functiondef(v_immutability_function))
          <> v_immutability_md5 then
    raise exception 'alegra_l3_retained_ledger_immutability_body_drifted';
  end if;
end;
$$;

create table if not exists public.toro_alegra_l3_owner_approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  run_id uuid not null,
  task_id uuid not null,
  decision_id uuid not null,
  supersedes_approval_id uuid null,

  approval_id text not null check (btrim(approval_id) <> ''),
  actor_id uuid not null,
  actor_membership_id uuid not null,
  actor_membership_type text not null check (btrim(actor_membership_type) <> ''),
  actor_role_assignment_id uuid not null,
  actor_role_id uuid not null,
  actor_role_code text not null check (actor_role_code in ('ADMIN','GERENCIA')),
  actor_toro_role text not null check (actor_toro_role = 'FOUNDER'),
  action_key text not null check (action_key = 'alegra_create_purchase_bill'),
  target_system text not null check (target_system = 'alegra'),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),

  approved_at timestamptz not null,
  expires_at timestamptz not null,
  decision_revision timestamptz not null,
  created_at timestamptz not null default clock_timestamp(),

  unique (org_id, id),
  unique (org_id, decision_id),
  unique (org_id, run_id, approval_id),

  foreign key (org_id, run_id)
    references public.toro_execution_runs(org_id, id),
  foreign key (org_id, task_id)
    references operations.tasks(org_id, id),
  foreign key (org_id, decision_id)
    references operations.executive_decisions(org_id, id),
  foreign key (org_id, supersedes_approval_id)
    references public.toro_alegra_l3_owner_approvals(org_id, id),

  check (expires_at = approved_at + interval '15 minutes'),
  check (decision_revision = approved_at),
  check (approved_at <= created_at)
);

create index if not exists toro_alegra_l3_owner_approvals_run_idx
  on public.toro_alegra_l3_owner_approvals
  (org_id, run_id, approved_at desc, id desc);

alter table public.toro_alegra_l3_owner_approvals enable row level security;

revoke all on table public.toro_alegra_l3_owner_approvals from public;
revoke all on table public.toro_alegra_l3_owner_approvals from anon;
revoke all on table public.toro_alegra_l3_owner_approvals from authenticated;
revoke all on table public.toro_alegra_l3_owner_approvals from service_role;

create or replace function public.toro_prevent_alegra_l3_owner_approval_mutation_v1()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'alegra_l3_owner_approval_is_immutable';
end;
$$;

drop trigger if exists toro_prevent_alegra_l3_owner_approval_mutation
  on public.toro_alegra_l3_owner_approvals;

create trigger toro_prevent_alegra_l3_owner_approval_mutation
before update or delete on public.toro_alegra_l3_owner_approvals
for each row execute function public.toro_prevent_alegra_l3_owner_approval_mutation_v1();

revoke all on function public.toro_prevent_alegra_l3_owner_approval_mutation_v1()
  from public;
revoke all on function public.toro_prevent_alegra_l3_owner_approval_mutation_v1()
  from anon;
revoke all on function public.toro_prevent_alegra_l3_owner_approval_mutation_v1()
  from authenticated;
revoke all on function public.toro_prevent_alegra_l3_owner_approval_mutation_v1()
  from service_role;

do $$
declare
  v_immutability_function regprocedure :=
    'public.toro_prevent_alegra_l3_owner_approval_mutation_v1()'::regprocedure;
begin
  execute format(
    'comment on function public.toro_prevent_alegra_l3_owner_approval_mutation_v1() is %L',
    'Immutable evidence guard retained across rollback. TORO_ALEGRA_L3_IMMUTABILITY_MD5=' ||
      md5(pg_catalog.pg_get_functiondef(v_immutability_function))
  );
end;
$$;

do $$
declare
  v_ledger regclass := 'public.toro_alegra_l3_owner_approvals'::regclass;
  v_immutability_function regprocedure :=
    'public.toro_prevent_alegra_l3_owner_approval_mutation_v1()'::regprocedure;
  v_immutability_comment text;
  v_immutability_md5 text;
begin
  v_immutability_comment := pg_catalog.obj_description(
    v_immutability_function,
    'pg_proc'
  );
  v_immutability_md5 := substring(
    coalesce(v_immutability_comment, '')
    from 'TORO_ALEGRA_L3_IMMUTABILITY_MD5=([0-9a-f]{32})$'
  );

  if not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = v_ledger
      and relation.relrowsecurity
      and pg_catalog.pg_get_userbyid(relation.relowner) = 'postgres'
      and not exists (
        select 1
        from pg_catalog.aclexplode(
          coalesce(relation.relacl, pg_catalog.acldefault('r', relation.relowner))
        ) privilege
        where privilege.grantee <> relation.relowner
      )
  ) or not exists (
    select 1
    from pg_catalog.pg_proc function_row
    where function_row.oid = v_immutability_function
      and not function_row.prosecdef
      and pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
      and coalesce(function_row.proconfig, '{}'::text[])
            @> array['search_path=""']::text[]
      and not pg_catalog.has_function_privilege('public', function_row.oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('anon', function_row.oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('authenticated', function_row.oid, 'EXECUTE')
      and not pg_catalog.has_function_privilege('service_role', function_row.oid, 'EXECUTE')
      and (
        select count(*) = 1
          and pg_catalog.bool_and(
            privilege.grantee = function_row.proowner
            and privilege.privilege_type = 'EXECUTE'
            and privilege.grantor = function_row.proowner
            and not privilege.is_grantable
          )
        from pg_catalog.aclexplode(
          coalesce(
            function_row.proacl,
            pg_catalog.acldefault('f', function_row.proowner)
          )
        ) privilege
      )
  ) or not exists (
    select 1
    from pg_catalog.pg_trigger trigger_row
    where trigger_row.tgrelid = v_ledger
      and trigger_row.tgname = 'toro_prevent_alegra_l3_owner_approval_mutation'
      and not trigger_row.tgisinternal
      and trigger_row.tgenabled = 'O'
      and trigger_row.tgfoid = v_immutability_function
  ) or v_immutability_md5 is null
     or md5(pg_catalog.pg_get_functiondef(v_immutability_function))
          <> v_immutability_md5 then
    raise exception 'alegra_l3_owner_approval_ledger_postcreate_security_failed';
  end if;
end;
$$;

create or replace function public.toro_capture_alegra_l3_owner_approval_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_membership identity.organization_memberships%rowtype;
  v_role record;
  v_run public.toro_execution_runs%rowtype;
  v_prior public.toro_alegra_l3_owner_approvals%rowtype;
  v_prior_receipt_id uuid;
  v_signed_id uuid := gen_random_uuid();
  v_receipt_id uuid := gen_random_uuid();
  v_locked_at timestamptz;
begin
  if new.status is distinct from 'Respondida'
     or new.decision_value is distinct from 'approved'
     or new.processed_at is null
     or (
       old.status is not distinct from new.status
       and old.decision_value is not distinct from new.decision_value
       and old.processed_at is not distinct from new.processed_at
     ) then
    return new;
  end if;

  if new.program_key is distinct from 'toro_alegra_writer_v3'
     or new.instruction is distinct from 'alegra_create_purchase_bill'
     or new.source_system is distinct from 'toro_control_plane'
     or new.source_record_id is null
     or new.source_record_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
     or new.source_ref is null
     or new.source_ref !~ '^[0-9a-f]{64}$'
     or new.decision_key is null
     or btrim(new.decision_key) = '' then
    raise exception 'alegra_owner_decision_binding_invalid';
  end if;

  if v_actor_id is null then
    raise exception 'alegra_owner_actor_required';
  end if;

  -- Mirror the real canonical resolver gates in the signer transaction. The
  -- repository has no membership_type='owner' rows, so authority is the
  -- existing FOUNDER claim plus ADMIN/GERENCIA organization role.
  if coalesce(auth.jwt()->'app_metadata'->>'toro_role','') <> 'FOUNDER'
     or not private.has_org_role(new.org_id, array['ADMIN','GERENCIA']::text[]) then
    raise exception 'canonical_founder_org_role_required';
  end if;

  select *
    into v_membership
  from identity.organization_memberships membership
  where membership.org_id = new.org_id
    and membership.user_id = v_actor_id
    and membership.status = 'active'
    and membership.joined_at is not null
    and membership.joined_at <= new.processed_at
    and membership.offboarded_at is null
  order by membership.joined_at desc, membership.id
  limit 1
  for share;

  if not found then
    raise exception 'canonical_active_signer_membership_required';
  end if;

  select role_assignment.id as assignment_id,
         role_definition.id as role_id,
         role_definition.code as role_code
    into v_role
  from public.user_roles role_assignment
  join public.roles role_definition
    on role_definition.id = role_assignment.role_id
  where role_assignment.org_id = new.org_id
    and role_assignment.user_id = v_actor_id
    and role_assignment.status = 'active'
    and role_assignment.revoked_at is null
    and role_definition.code in ('ADMIN','GERENCIA')
  order by case role_definition.code when 'ADMIN' then 0 else 1 end,
           role_assignment.id
  limit 1
  for share;

  if not found then
    raise exception 'canonical_founder_org_role_required';
  end if;

  select *
    into v_run
  from public.toro_execution_runs run
  where run.org_id = new.org_id
    and run.id = new.source_record_id::uuid
  for update;

  if not found then
    raise exception 'alegra_l3_run_not_found';
  end if;

  -- Deliberately sampled after the potentially blocking run lock.
  v_locked_at := clock_timestamp();

  if new.processed_at > v_locked_at
     or new.updated_at is distinct from new.processed_at then
    raise exception 'alegra_owner_decision_time_invalid';
  end if;

  if v_run.status is distinct from 'queued'
     or v_run.attempt_count <> 0
     or v_run.max_attempts <> 1
     or v_run.verification_status is distinct from 'pending'
     or v_run.started_at is not null
     or v_run.verifying_at is not null
     or v_run.finished_at is not null
     or v_run.error_class is not null
     or v_run.error_redacted is not null
     or v_run.lease_owner is not null
     or v_run.lease_expires_at is not null
     or v_run.execution_authority_level is distinct from 'L3'
     or v_run.action_key is distinct from 'alegra_create_purchase_bill'
     or v_run.target_system is distinct from 'alegra'
     or v_run.actor_kind is distinct from 'human'
     or v_run.actor_ref is distinct from v_actor_id::text
     or v_run.safe_metadata->>'payloadHash' is distinct from new.source_ref then
    raise exception 'alegra_l3_run_not_fresh_or_scope_mismatch';
  end if;

  select *
    into v_prior
  from public.toro_alegra_l3_owner_approvals prior
  where prior.org_id = v_run.org_id
    and prior.run_id = v_run.id
  order by prior.approved_at desc, prior.id desc
  limit 1
  for update;

  if found then
    if v_prior.expires_at > v_locked_at
       or new.processed_at <= v_prior.approved_at
       or v_prior.task_id is distinct from v_run.task_id
       or v_prior.action_key is distinct from v_run.action_key
       or v_prior.target_system is distinct from v_run.target_system
       or v_prior.payload_hash is distinct from new.source_ref
       or v_prior.actor_id is distinct from v_actor_id
       or v_prior.decision_id is distinct from v_run.decision_id
       or new.id is not distinct from v_prior.decision_id then
      raise exception 'alegra_active_or_mismatched_approval_cannot_be_renewed';
    end if;

    begin
      v_prior_receipt_id := nullif(v_run.safe_metadata->>'approvalReceiptId','')::uuid;
    exception when invalid_text_representation then
      raise exception 'alegra_prior_approval_receipt_binding_invalid';
    end;

    if v_prior_receipt_id is null then
      raise exception 'alegra_prior_approval_receipt_binding_missing';
    end if;
  elsif v_run.decision_id is distinct from new.id then
    raise exception 'alegra_first_approval_decision_mismatch';
  end if;

  insert into public.toro_alegra_l3_owner_approvals (
    id, org_id, run_id, task_id, decision_id, supersedes_approval_id,
    approval_id, actor_id, actor_membership_id, actor_membership_type,
    actor_role_assignment_id, actor_role_id, actor_role_code, actor_toro_role,
    action_key, target_system, payload_hash, approved_at, expires_at,
    decision_revision, created_at
  ) values (
    v_signed_id, v_run.org_id, v_run.id, v_run.task_id, new.id,
    case when v_prior.id is null then null else v_prior.id end,
    new.decision_key, v_actor_id, v_membership.id, v_membership.membership_type,
    v_role.assignment_id, v_role.role_id, v_role.role_code, 'FOUNDER',
    v_run.action_key,
    v_run.target_system, new.source_ref, new.processed_at,
    new.processed_at + interval '15 minutes', new.processed_at, v_locked_at
  );

  insert into public.toro_execution_receipts (
    id, org_id, run_id, task_id, decision_id, supersedes_receipt_id,
    receipt_type, status, action_key, target_system, actor_kind, actor_ref,
    dot_ref, agent_ref, execution_authority_level, business_risk,
    correlation_id, trace_id, idempotency_key, desired_state,
    executed_state, verification_method, verification_status, evidence_refs,
    source_receipt_system, source_receipt_kind, source_receipt_ref,
    integrity_hash
  ) values (
    v_receipt_id, v_run.org_id, v_run.id, v_run.task_id, new.id,
    v_prior_receipt_id, 'approval', 'verified', v_run.action_key,
    v_run.target_system, 'human', v_actor_id::text, v_run.dot_ref,
    v_run.agent_ref, 'L3', v_run.business_risk, v_run.correlation_id,
    v_run.trace_id,
    v_run.idempotency_key || ':approval:' || new.id::text,
    jsonb_build_object(
      'approvalId', new.decision_key,
      'actorId', v_actor_id::text,
      'payloadHash', new.source_ref,
      'approvedAt', new.processed_at,
      'expiresAt', new.processed_at + interval '15 minutes',
      'decisionRevision', new.processed_at,
      'canonicalApprovalId', v_signed_id::text
    ),
    jsonb_build_object('phase', 'owner_signed', 'providerEffect', false),
    'canonical_owner_decision_trigger', 'passed',
    jsonb_build_array(
      'toro-owner-approval:' || v_signed_id::text,
      'operations.executive_decisions:' || new.id::text
    ),
    'toro_signed_owner_approval', 'owner_approval_v1', v_signed_id::text,
    new.source_ref
  );

  return new;
end;
$$;

drop trigger if exists toro_capture_alegra_l3_owner_approval
  on operations.executive_decisions;

create trigger toro_capture_alegra_l3_owner_approval
after update of status, decision_value, processed_at
on operations.executive_decisions
for each row execute function public.toro_capture_alegra_l3_owner_approval_v1();

revoke all on function public.toro_capture_alegra_l3_owner_approval_v1()
  from public;
revoke all on function public.toro_capture_alegra_l3_owner_approval_v1()
  from anon;
revoke all on function public.toro_capture_alegra_l3_owner_approval_v1()
  from authenticated;
revoke all on function public.toro_capture_alegra_l3_owner_approval_v1()
  from service_role;

create or replace function public.toro_guard_alegra_l3_approval_receipt_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.toro_execution_runs%rowtype;
  v_signed public.toro_alegra_l3_owner_approvals%rowtype;
  v_prior_signed public.toro_alegra_l3_owner_approvals%rowtype;
  v_prior_receipt public.toro_execution_receipts%rowtype;
  v_decision operations.executive_decisions%rowtype;
  v_payload_hash text;
  v_approval_id text;
  v_actor_id text;
  v_approved_at timestamptz;
  v_expires_at timestamptz;
  v_decision_revision timestamptz;
  v_canonical_approval_id text;
  v_locked_at timestamptz;
begin
  if new.receipt_type <> 'approval'
     or new.target_system <> 'alegra'
     or new.action_key <> 'alegra_create_purchase_bill' then
    return new;
  end if;

  -- Every approval/revocation event takes the same run lock as dispatch
  -- admission. This serializes revocation against the provider boundary.
  select *
    into v_run
  from public.toro_execution_runs r
  where r.org_id = new.org_id
    and r.id = new.run_id
  for update;

  if not found then
    raise exception 'alegra_l3_run_not_found';
  end if;

  -- Renewal, revocation, and admission all serialize on this run. Do not use
  -- transaction-start time after a wait: an approval can expire while blocked.
  v_locked_at := clock_timestamp();

  if jsonb_typeof(new.desired_state) is distinct from 'object' then
    raise exception 'alegra_approval_binding_required';
  end if;

  v_payload_hash := nullif(new.desired_state->>'payloadHash','');
  v_approval_id := nullif(new.desired_state->>'approvalId','');
  v_actor_id := nullif(new.desired_state->>'actorId','');
  v_approved_at := nullif(new.desired_state->>'approvedAt','')::timestamptz;
  v_expires_at := nullif(new.desired_state->>'expiresAt','')::timestamptz;
  v_decision_revision := nullif(new.desired_state->>'decisionRevision','')::timestamptz;
  v_canonical_approval_id := nullif(new.desired_state->>'canonicalApprovalId','');

  if v_payload_hash is null
     or v_approval_id is null
     or v_actor_id is null
     or v_approved_at is null
     or v_expires_at is null
     or v_decision_revision is null
     or v_canonical_approval_id is null then
    raise exception 'alegra_approval_binding_incomplete';
  end if;

  select *
    into v_signed
  from public.toro_alegra_l3_owner_approvals signed
  where signed.org_id = new.org_id
    and signed.id::text = new.source_receipt_ref
    and signed.id::text = v_canonical_approval_id
    and signed.run_id = new.run_id
    and signed.task_id = new.task_id
    and signed.decision_id = new.decision_id
    and signed.approval_id = v_approval_id
    and signed.actor_id::text = v_actor_id
    and signed.action_key = new.action_key
    and signed.target_system = new.target_system
    and signed.payload_hash = v_payload_hash
    and signed.approved_at = v_approved_at
    and signed.expires_at = v_expires_at
    and signed.decision_revision = v_decision_revision;

  if not found then
    raise exception 'canonical_signed_owner_approval_required';
  end if;

  if v_run.task_id is distinct from new.task_id
     or v_run.action_key is distinct from v_signed.action_key
     or v_run.target_system is distinct from v_signed.target_system
     or v_run.execution_authority_level is distinct from 'L3'
     or v_run.actor_kind is distinct from 'human'
     or v_run.actor_ref is distinct from v_signed.actor_id::text
     or new.execution_authority_level is distinct from 'L3'
     or new.actor_kind is distinct from 'human'
     or new.actor_ref is distinct from v_signed.actor_id::text
     or new.verification_status is distinct from 'passed'
     or new.integrity_hash is distinct from v_signed.payload_hash
     or new.source_receipt_system is distinct from 'toro_signed_owner_approval'
     or new.source_receipt_kind is distinct from 'owner_approval_v1'
     or jsonb_typeof(new.evidence_refs) is distinct from 'array' then
    raise exception 'alegra_approval_scope_mismatch';
  end if;

  if new.status = 'verified' then
    select *
      into v_decision
    from operations.executive_decisions decision
    where decision.org_id = v_signed.org_id
      and decision.id = v_signed.decision_id
      and decision.status = 'Respondida'
      and decision.decision_value = 'approved'
      and decision.processed_at = v_signed.approved_at
      and decision.updated_at = v_signed.decision_revision
      and decision.decision_key = v_signed.approval_id
      and decision.program_key = 'toro_alegra_writer_v3'
      and decision.instruction = v_signed.action_key
      and decision.source_system = 'toro_control_plane'
      and decision.source_record_id = v_signed.run_id::text
      and decision.source_ref = v_signed.payload_hash
      and decision.superseded_by is null;

    if not found then
      raise exception 'canonical_owner_decision_not_current';
    end if;

    if v_run.status is distinct from 'queued'
       or v_run.attempt_count <> 0
       or v_run.max_attempts <> 1
       or v_run.verification_status is distinct from 'pending'
       or v_run.started_at is not null
       or v_run.verifying_at is not null
       or v_run.finished_at is not null
       or v_run.error_class is not null
       or v_run.error_redacted is not null
       or v_run.lease_owner is not null
       or v_run.lease_expires_at is not null
       or v_signed.approved_at > v_locked_at
       or v_signed.expires_at <= v_locked_at
       or v_signed.expires_at <> v_signed.approved_at + interval '15 minutes'
       or new.idempotency_key <> v_run.idempotency_key || ':approval:' || v_signed.decision_id::text then
      raise exception 'alegra_approval_not_admissible';
    end if;

    if v_signed.supersedes_approval_id is null then
      if v_run.decision_id is distinct from v_signed.decision_id
         or new.supersedes_receipt_id is not null then
        raise exception 'alegra_first_approval_binding_mismatch';
      end if;
    else
      select *
        into v_prior_signed
      from public.toro_alegra_l3_owner_approvals prior
      where prior.org_id = v_signed.org_id
        and prior.id = v_signed.supersedes_approval_id
        and prior.run_id = v_signed.run_id
        and prior.task_id = v_signed.task_id
        and prior.decision_id = v_run.decision_id
        and prior.actor_id = v_signed.actor_id
        and prior.action_key = v_signed.action_key
        and prior.target_system = v_signed.target_system
        and prior.payload_hash = v_signed.payload_hash
        and prior.expires_at <= v_locked_at;

      if not found then
        raise exception 'alegra_expired_approval_renewal_mismatch';
      end if;

      select *
        into v_prior_receipt
      from public.toro_execution_receipts prior_receipt
      where prior_receipt.org_id = v_run.org_id
        and prior_receipt.id = new.supersedes_receipt_id
        and prior_receipt.run_id = v_run.id
        and prior_receipt.decision_id = v_prior_signed.decision_id
        and prior_receipt.receipt_type = 'approval'
        and prior_receipt.status = 'verified'
        and prior_receipt.source_receipt_system = 'toro_signed_owner_approval'
        and prior_receipt.source_receipt_ref = v_prior_signed.id::text;

      if not found then
        raise exception 'alegra_expired_approval_receipt_mismatch';
      end if;
    end if;

    update public.toro_execution_runs r
       set decision_id = v_signed.decision_id,
           safe_metadata = r.safe_metadata || jsonb_build_object(
             'approvalReceiptId', new.id::text,
             'canonicalApprovalId', v_signed.id::text,
             'approvalId', v_signed.approval_id,
             'approvalActorId', v_signed.actor_id::text,
             'approvalApprovedAt', v_signed.approved_at,
             'approvalExpiresAt', v_signed.expires_at,
             'decisionRevision', v_signed.decision_revision,
             'approvalBindingState', 'approved'
           ),
           updated_at = v_locked_at
     where r.id = v_run.id;

    return new;
  end if;

  if new.status <> 'denied'
     or new.supersedes_receipt_id is null
     or new.idempotency_key <>
        v_run.idempotency_key || ':revocation:' ||
        nullif(new.desired_state->>'decisionRevision','') then
    raise exception 'alegra_approval_event_invalid';
  end if;

  select *
    into v_prior_receipt
  from public.toro_execution_receipts prior
  where prior.org_id = v_run.org_id
    and prior.id = new.supersedes_receipt_id
    and prior.run_id = v_run.id
    and prior.receipt_type = 'approval'
    and prior.status = 'verified'
    and prior.target_system = 'alegra'
    and prior.action_key = 'alegra_create_purchase_bill'
  for update;

  if not found
     or v_prior_receipt.integrity_hash is distinct from v_payload_hash
     or v_prior_receipt.desired_state->>'approvalId' is distinct from v_approval_id
     or v_prior_receipt.desired_state->>'actorId' is distinct from v_actor_id
     or (v_prior_receipt.desired_state->>'expiresAt')::timestamptz is distinct from v_expires_at
     or (v_prior_receipt.desired_state->>'decisionRevision')::timestamptz is distinct from v_decision_revision
     or v_prior_receipt.source_receipt_system is distinct from 'toro_signed_owner_approval'
     or v_prior_receipt.source_receipt_ref is distinct from v_canonical_approval_id then
    raise exception 'alegra_revocation_target_mismatch';
  end if;

  if v_run.status is distinct from 'queued' then
    raise exception 'dispatch_already_admitted';
  end if;

  update public.toro_execution_runs r
     set status = 'cancelled',
         fencing_token = r.fencing_token + 1,
         lease_owner = null,
         lease_expires_at = null,
         finished_at = v_locked_at,
         error_class = 'ALEGRA_APPROVAL_REVOKED',
         error_redacted = null,
         safe_metadata = r.safe_metadata || jsonb_build_object(
           'approvalBindingState', 'revoked',
           'revocationReceiptId', new.id::text
         ),
         updated_at = v_locked_at
   where r.id = v_run.id;

  return new;
end;
$$;

drop trigger if exists toro_guard_alegra_l3_approval_receipt
  on public.toro_execution_receipts;

create trigger toro_guard_alegra_l3_approval_receipt
before insert on public.toro_execution_receipts
for each row execute function public.toro_guard_alegra_l3_approval_receipt_v1();

revoke all on function public.toro_guard_alegra_l3_approval_receipt_v1()
  from public;
revoke all on function public.toro_guard_alegra_l3_approval_receipt_v1()
  from anon;
revoke all on function public.toro_guard_alegra_l3_approval_receipt_v1()
  from authenticated;
revoke all on function public.toro_guard_alegra_l3_approval_receipt_v1()
  from service_role;

create or replace function public.toro_guard_alegra_l3_run_admission_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_checked_at timestamptz;
begin
  -- This is intentionally independent of which RPC issued the UPDATE and
  -- rechecks the immutable signer authority. It does not authenticate the SQL
  -- caller: activation still requires a dedicated writer role without direct
  -- table DML, as stated in the draft header.
  v_checked_at := clock_timestamp();

  -- L3 rows may only enter as fresh queued intents. Direct insertion of a
  -- pre-admitted or terminal row would fabricate provider/evidence state.
  if tg_op = 'INSERT'
     and new.execution_authority_level = 'L3'
     and new.action_key = 'alegra_create_purchase_bill'
     and new.target_system = 'alegra' then
    if new.status is distinct from 'queued'
       or new.attempt_count <> 0
       or new.max_attempts <> 1
       or new.verification_status is distinct from 'pending'
       or new.started_at is not null
       or new.verifying_at is not null
       or new.finished_at is not null
       or new.error_class is not null
       or new.error_redacted is not null
       or new.lease_owner is not null
       or new.lease_expires_at is not null
       or new.safe_metadata ?| array[
         'preparedReceiptId','finalReceiptId','recoveryReceiptId','dispatchAdmittedAt'
       ] then
      raise exception 'alegra_l3_fresh_queued_insert_required';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.execution_authority_level = 'L3'
     and new.action_key = 'alegra_create_purchase_bill'
     and new.target_system = 'alegra'
     and (
       old.execution_authority_level is distinct from 'L3'
       or old.action_key is distinct from 'alegra_create_purchase_bill'
       or old.target_system is distinct from 'alegra'
     ) then
    raise exception 'alegra_l3_scope_entry_by_update_forbidden';
  end if;

  -- Protect every existing Alegra L3 row from OLD. service_role currently has
  -- broad table DML in the live baseline, so the trigger must reject relabels,
  -- fabricated terminal states, and arbitrary queued updates even though a
  -- future dedicated Writer role will have no direct DML.
  if tg_op = 'UPDATE'
     and old.execution_authority_level = 'L3'
     and old.action_key = 'alegra_create_purchase_bill'
     and old.target_system = 'alegra' then
    if new.execution_authority_level is distinct from old.execution_authority_level
       or new.action_key is distinct from old.action_key
       or new.target_system is distinct from old.target_system then
      raise exception 'alegra_l3_identity_immutable';
    end if;

    if old.status = 'queued' and new.status = 'queued' then
      -- This is the exact binding update issued from the validated approval
      -- receipt trigger before that receipt INSERT completes.
      if pg_trigger_depth() <= 1
         or new.safe_metadata->>'approvalBindingState' is distinct from 'approved'
         or nullif(new.safe_metadata->>'approvalReceiptId','') is null
         or nullif(new.safe_metadata->>'canonicalApprovalId','') is null
         or nullif(new.safe_metadata->>'approvalId','') is null
         or nullif(new.safe_metadata->>'approvalActorId','') is null
         or nullif(new.safe_metadata->>'approvalApprovedAt','') is null
         or nullif(new.safe_metadata->>'approvalExpiresAt','') is null
         or nullif(new.safe_metadata->>'decisionRevision','') is null
         or (old.safe_metadata - array[
              'approvalBindingState','approvalReceiptId','canonicalApprovalId',
              'approvalId','approvalActorId','approvalApprovedAt',
              'approvalExpiresAt','decisionRevision'
            ]::text[])
            is distinct from
            (new.safe_metadata - array[
              'approvalBindingState','approvalReceiptId','canonicalApprovalId',
              'approvalId','approvalActorId','approvalApprovedAt',
              'approvalExpiresAt','decisionRevision'
            ]::text[])
         or (to_jsonb(new) - 'decision_id' - 'safe_metadata' - 'updated_at')
            is distinct from
            (to_jsonb(old) - 'decision_id' - 'safe_metadata' - 'updated_at') then
        raise exception 'alegra_l3_approval_binding_update_invalid';
      end if;

      return new;
    end if;

    if old.status = 'queued' and new.status = 'cancelled' then
      -- Revocation is likewise only the nested update caused by the guarded
      -- denied approval receipt; a direct UPDATE cannot synthesize it.
      if pg_trigger_depth() <= 1
         or new.fencing_token <> old.fencing_token + 1
         or new.lease_owner is not null
         or new.lease_expires_at is not null
         or new.finished_at is null
         or new.finished_at > v_checked_at
         or new.error_class is distinct from 'ALEGRA_APPROVAL_REVOKED'
         or new.error_redacted is not null
         or new.safe_metadata->>'approvalBindingState' is distinct from 'revoked'
         or nullif(new.safe_metadata->>'revocationReceiptId','') is null
         or (old.safe_metadata - array[
              'approvalBindingState','revocationReceiptId'
            ]::text[])
            is distinct from
            (new.safe_metadata - array[
              'approvalBindingState','revocationReceiptId'
            ]::text[])
         or (to_jsonb(new)
               - 'status' - 'fencing_token' - 'lease_owner' - 'lease_expires_at'
               - 'finished_at' - 'error_class' - 'error_redacted'
               - 'safe_metadata' - 'updated_at')
            is distinct from
            (to_jsonb(old)
               - 'status' - 'fencing_token' - 'lease_owner' - 'lease_expires_at'
               - 'finished_at' - 'error_class' - 'error_redacted'
               - 'safe_metadata' - 'updated_at') then
        raise exception 'alegra_l3_revocation_update_invalid';
      end if;

      return new;
    end if;

    if old.status = 'queued' and new.status is distinct from 'running' then
      raise exception 'alegra_l3_queued_transition_forbidden';
    end if;

    if old.status not in ('queued','running','verifying') then
      raise exception 'alegra_l3_terminal_row_immutable';
    end if;
  end if;

  -- Classify an already-active L3 row from OLD, not NEW. Otherwise a direct
  -- UPDATE could evade the guard by relabelling the authority/action/target or
  -- selecting an arbitrary terminal state.
  if tg_op = 'UPDATE'
     and old.execution_authority_level = 'L3'
     and old.action_key = 'alegra_create_purchase_bill'
     and old.target_system = 'alegra'
     and old.status in ('running','verifying') then
    if new.execution_authority_level is distinct from old.execution_authority_level
       or new.action_key is distinct from old.action_key
       or new.target_system is distinct from old.target_system then
      raise exception 'alegra_l3_active_identity_immutable';
    end if;

    -- The only in-place active-state UPDATE is a same-owner, same-fence lease
    -- extension. Compare the full row except the two heartbeat fields.
    if new.status in ('running','verifying') then
      if new.status is distinct from old.status
         or new.lease_owner is distinct from old.lease_owner
         or new.fencing_token is distinct from old.fencing_token
         or old.lease_owner is null
         or btrim(old.lease_owner) = ''
         or old.lease_expires_at is null
         or old.lease_expires_at <= v_checked_at
         or new.lease_expires_at is null
         or new.lease_expires_at < old.lease_expires_at
         or new.lease_expires_at <= v_checked_at
         or new.safe_metadata->>'approvalBindingState' is distinct from 'admitted'
         or (to_jsonb(new) - 'lease_expires_at' - 'updated_at')
            is distinct from
            (to_jsonb(old) - 'lease_expires_at' - 'updated_at') then
        raise exception 'alegra_l3_heartbeat_invariant_failed';
      end if;

      return new;
    end if;

    -- Terminal transitions are allowed only when they preserve every immutable
    -- run field and point at the durable exact receipt already inserted by the
    -- specialized finalizer or expired-lease recovery transaction.
    if new.status not in ('succeeded','blocked')
       or new.lease_owner is not null
       or new.lease_expires_at is not null
       or new.verifying_at is null
       or new.finished_at is null
       or new.error_redacted is not null
       or nullif(new.safe_metadata->>'finalReceiptId','') is null
       or new.safe_metadata->>'preparedReceiptId' is distinct from old.safe_metadata->>'preparedReceiptId'
       or (to_jsonb(new)
             - 'status' - 'verification_status' - 'verifying_at' - 'finished_at'
             - 'lease_owner' - 'lease_expires_at' - 'fencing_token'
             - 'error_class' - 'error_redacted' - 'safe_metadata' - 'updated_at')
          is distinct from
          (to_jsonb(old)
             - 'status' - 'verification_status' - 'verifying_at' - 'finished_at'
             - 'lease_owner' - 'lease_expires_at' - 'fencing_token'
             - 'error_class' - 'error_redacted' - 'safe_metadata' - 'updated_at') then
      raise exception 'alegra_l3_terminal_transition_invariant_failed';
    end if;

    if new.safe_metadata->>'approvalBindingState' = 'finalized' then
      if old.lease_expires_at is null
         or old.lease_expires_at <= v_checked_at
         or new.fencing_token is distinct from old.fencing_token
         or (old.safe_metadata - array[
              'approvalBindingState','finalReceiptId','finalizationOutcome',
              'finalizedByWorkerId','finalizedAt'
            ]::text[])
            is distinct from
            (new.safe_metadata - array[
              'approvalBindingState','finalReceiptId','finalizationOutcome',
              'finalizedByWorkerId','finalizedAt'
            ]::text[])
         or not (
           (new.status = 'succeeded'
             and new.verification_status = 'passed'
             and new.error_class is null
             and new.safe_metadata->>'finalizationOutcome' = 'verified')
           or (new.status = 'blocked'
             and new.verification_status = 'partial'
             and new.error_class = 'ALEGRA_RECONCILIATION_REQUIRED'
             and new.safe_metadata->>'finalizationOutcome' = 'reconciliation_required')
         )
         or not exists (
           select 1
           from public.toro_execution_receipts receipt
           where receipt.org_id = old.org_id
             and receipt.id::text = new.safe_metadata->>'finalReceiptId'
             and receipt.run_id = old.id
             and receipt.task_id = old.task_id
             and receipt.decision_id = old.decision_id
             and receipt.supersedes_receipt_id::text = old.safe_metadata->>'preparedReceiptId'
             and receipt.execution_authority_level = 'L3'
             and receipt.verification_status = new.verification_status
             and receipt.error_class is not distinct from new.error_class
         ) then
        raise exception 'alegra_l3_finalization_receipt_required';
      end if;
    elsif new.safe_metadata->>'approvalBindingState' = 'recovery_blocked' then
      if old.lease_expires_at is null
         or old.lease_expires_at > v_checked_at
         or new.status is distinct from 'blocked'
         or new.verification_status is distinct from 'partial'
         or new.error_class is distinct from 'ALEGRA_PROVIDER_STATE_UNKNOWN'
         or new.fencing_token <> old.fencing_token + 1
         or new.safe_metadata->>'recoveredFromFencingToken' is distinct from old.fencing_token::text
         or new.safe_metadata->>'recoveryFencingToken' is distinct from new.fencing_token::text
         or new.safe_metadata->>'recoveryReceiptId' is distinct from new.safe_metadata->>'finalReceiptId'
         or (old.safe_metadata - array[
              'approvalBindingState','preparedReceiptId','recoveryReceiptId',
              'finalReceiptId','recoveryState','recoveredByWorkerId',
              'recoveredAt','recoveredFromFencingToken','recoveryFencingToken'
            ]::text[])
            is distinct from
            (new.safe_metadata - array[
              'approvalBindingState','preparedReceiptId','recoveryReceiptId',
              'finalReceiptId','recoveryState','recoveredByWorkerId',
              'recoveredAt','recoveredFromFencingToken','recoveryFencingToken'
            ]::text[])
         or not exists (
           select 1
           from public.toro_execution_receipts receipt
           where receipt.org_id = old.org_id
             and receipt.id::text = new.safe_metadata->>'finalReceiptId'
             and receipt.run_id = old.id
             and receipt.task_id = old.task_id
             and receipt.decision_id = old.decision_id
             and receipt.supersedes_receipt_id::text = old.safe_metadata->>'preparedReceiptId'
             and receipt.receipt_type = 'execution'
             and receipt.status = 'blocked'
             and receipt.execution_authority_level = 'L3'
             and receipt.verification_status = 'partial'
             and receipt.source_receipt_kind = 'alegra_l3_expired_lease_recovery'
             and receipt.error_class = 'ALEGRA_PROVIDER_STATE_UNKNOWN'
         ) then
        raise exception 'alegra_l3_recovery_receipt_required';
      end if;
    else
      raise exception 'alegra_l3_terminal_binding_invalid';
    end if;

    return new;
  end if;

  if new.execution_authority_level is distinct from 'L3'
     or new.action_key is distinct from 'alegra_create_purchase_bill'
     or new.target_system is distinct from 'alegra'
     or new.status is distinct from 'running' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    raise exception 'alegra_l3_running_insert_forbidden';
  end if;

  if old.status is distinct from 'queued'
     or old.attempt_count <> 0
     or old.max_attempts <> 1
     or old.verification_status is distinct from 'pending'
     or old.started_at is not null
     or old.verifying_at is not null
     or old.finished_at is not null
     or old.error_class is not null
     or old.error_redacted is not null
     or old.lease_owner is not null
     or old.lease_expires_at is not null
     or new.attempt_count <> 1
     or new.verification_status is distinct from 'pending'
     or new.started_at is null
     or new.started_at > v_checked_at
     or new.verifying_at is not null
     or new.finished_at is not null
     or new.error_class is not null
     or new.error_redacted is not null
     or new.lease_owner is null
     or btrim(new.lease_owner) = ''
     or new.lease_expires_at is null
     or new.lease_expires_at <= v_checked_at
     or new.safe_metadata->>'approvalBindingState' is distinct from 'admitted'
     or nullif(new.safe_metadata->>'preparedReceiptId','') is null
     or new.safe_metadata->>'dispatchAdmittedAt' is null then
    raise exception 'alegra_l3_fresh_run_invariant_failed';
  end if;

  if not exists (
    select 1
    from public.toro_alegra_l3_owner_approvals signed
    join public.toro_execution_receipts approval
      on approval.org_id = signed.org_id
     and approval.run_id = signed.run_id
     and approval.decision_id = signed.decision_id
     and approval.id::text = new.safe_metadata->>'approvalReceiptId'
     and approval.receipt_type = 'approval'
     and approval.status = 'verified'
     and approval.verification_status = 'passed'
     and approval.source_receipt_system = 'toro_signed_owner_approval'
     and approval.source_receipt_kind = 'owner_approval_v1'
     and approval.source_receipt_ref = signed.id::text
     and approval.integrity_hash = signed.payload_hash
    join operations.executive_decisions decision
      on decision.org_id = signed.org_id
     and decision.id = signed.decision_id
     and decision.status = 'Respondida'
     and decision.decision_value = 'approved'
     and decision.processed_at = signed.approved_at
     and decision.updated_at = signed.decision_revision
     and decision.decision_key = signed.approval_id
     and decision.program_key = 'toro_alegra_writer_v3'
     and decision.instruction = signed.action_key
     and decision.source_system = 'toro_control_plane'
     and decision.source_record_id = signed.run_id::text
     and decision.source_ref = signed.payload_hash
     and decision.superseded_by is null
    join identity.organization_memberships membership
      on membership.id = signed.actor_membership_id
     and membership.org_id = signed.org_id
     and membership.user_id = signed.actor_id
     and membership.membership_type = signed.actor_membership_type
     and membership.status = 'active'
     and membership.joined_at is not null
     and membership.joined_at <= signed.approved_at
     and membership.offboarded_at is null
    join public.user_roles role_assignment
      on role_assignment.id = signed.actor_role_assignment_id
     and role_assignment.org_id = signed.org_id
     and role_assignment.user_id = signed.actor_id
     and role_assignment.role_id = signed.actor_role_id
     and role_assignment.status = 'active'
     and role_assignment.revoked_at is null
    join public.roles role_definition
      on role_definition.id = signed.actor_role_id
     and role_definition.code = signed.actor_role_code
     and role_definition.code in ('ADMIN','GERENCIA')
    join auth.users actor
      on actor.id = signed.actor_id
     and coalesce(actor.raw_app_meta_data->>'toro_role','') = signed.actor_toro_role
     and signed.actor_toro_role = 'FOUNDER'
    where signed.org_id = new.org_id
      and signed.run_id = new.id
      and signed.task_id = new.task_id
      and signed.decision_id = new.decision_id
      and signed.id::text = new.safe_metadata->>'canonicalApprovalId'
      and signed.approval_id = new.safe_metadata->>'approvalId'
      and signed.actor_id::text = new.actor_ref
      and signed.payload_hash = new.safe_metadata->>'payloadHash'
      and signed.approved_at = (new.safe_metadata->>'approvalApprovedAt')::timestamptz
      and signed.expires_at = (new.safe_metadata->>'approvalExpiresAt')::timestamptz
      and signed.decision_revision = (new.safe_metadata->>'decisionRevision')::timestamptz
      and signed.approved_at <= v_checked_at
      and signed.expires_at > v_checked_at
      and signed.expires_at = signed.approved_at + interval '15 minutes'
      and not exists (
        select 1
        from public.toro_alegra_l3_owner_approvals later
        where later.org_id = signed.org_id
          and later.run_id = signed.run_id
          and (later.approved_at, later.id) > (signed.approved_at, signed.id)
      )
      and not exists (
        select 1
        from public.toro_execution_receipts revoked
        where revoked.org_id = approval.org_id
          and revoked.run_id = approval.run_id
          and revoked.receipt_type = 'approval'
          and revoked.status = 'denied'
          and revoked.supersedes_receipt_id = approval.id
      )
  ) then
    raise exception 'canonical_signed_owner_approval_not_current';
  end if;

  return new;
end;
$$;

drop trigger if exists toro_guard_alegra_l3_run_admission
  on public.toro_execution_runs;

create trigger toro_guard_alegra_l3_run_admission
before insert or update on public.toro_execution_runs
for each row execute function public.toro_guard_alegra_l3_run_admission_v1();

revoke all on function public.toro_guard_alegra_l3_run_admission_v1()
  from public;
revoke all on function public.toro_guard_alegra_l3_run_admission_v1()
  from anon;
revoke all on function public.toro_guard_alegra_l3_run_admission_v1()
  from authenticated;
revoke all on function public.toro_guard_alegra_l3_run_admission_v1()
  from service_role;

drop function if exists public.toro_revoke_alegra_execution_authority_v1(
  uuid,uuid,uuid,text
);

create or replace function public.toro_revoke_alegra_execution_authority_v1(
  p_org_id uuid,
  p_run_id uuid,
  p_approval_receipt_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_run public.toro_execution_runs%rowtype;
  v_approval public.toro_execution_receipts%rowtype;
  v_revision text;
begin
  -- Never accept an asserted actor from a client or from the Writer. The
  -- authenticated signer identity must come from the current JWT.
  if auth.role() is distinct from 'authenticated' or v_actor_id is null then
    raise exception 'alegra_revocation_requires_authenticated_owner';
  end if;

  select *
    into v_run
  from public.toro_execution_runs r
  where r.org_id = p_org_id
    and r.id = p_run_id
  for update;

  if not found then
    return null;
  end if;

  -- Lock the exact signer, signed ledger row, canonical membership, and role
  -- assignment until commit. A different founder cannot revoke this approval,
  -- and an offboard/revocation race cannot cross the provider boundary.
  select approval.*
    into v_approval
  from public.toro_execution_receipts approval
  join public.toro_alegra_l3_owner_approvals signed
    on signed.org_id = approval.org_id
   and signed.run_id = approval.run_id
   and signed.task_id = approval.task_id
   and signed.decision_id = approval.decision_id
   and signed.id::text = approval.source_receipt_ref
   and signed.payload_hash = approval.integrity_hash
   and signed.actor_id = v_actor_id
  join auth.users actor
    on actor.id = signed.actor_id
   and coalesce(actor.raw_app_meta_data->>'toro_role','') = 'FOUNDER'
  join identity.organization_memberships membership
    on membership.id = signed.actor_membership_id
   and membership.org_id = signed.org_id
   and membership.user_id = signed.actor_id
   and membership.membership_type = signed.actor_membership_type
   and membership.status = 'active'
   and membership.joined_at is not null
   and membership.offboarded_at is null
  join public.user_roles role_assignment
    on role_assignment.id = signed.actor_role_assignment_id
   and role_assignment.org_id = signed.org_id
   and role_assignment.user_id = signed.actor_id
   and role_assignment.role_id = signed.actor_role_id
   and role_assignment.status = 'active'
   and role_assignment.revoked_at is null
  join public.roles role_definition
    on role_definition.id = signed.actor_role_id
   and role_definition.code = signed.actor_role_code
   and role_definition.code in ('ADMIN','GERENCIA')
  where approval.org_id = v_run.org_id
    and approval.id = p_approval_receipt_id
    and approval.run_id = v_run.id
    and approval.task_id = v_run.task_id
    and approval.decision_id = v_run.decision_id
    and approval.receipt_type = 'approval'
    and approval.status = 'verified'
    and approval.verification_status = 'passed'
    and approval.action_key = 'alegra_create_purchase_bill'
    and approval.target_system = 'alegra'
    and approval.execution_authority_level = 'L3'
    and approval.actor_kind = 'human'
    and approval.actor_ref = v_actor_id::text
    and private.has_org_role(v_run.org_id, array['ADMIN','GERENCIA']::text[])
  for update of approval, signed, actor, membership, role_assignment, role_definition;

  if not found then
    raise exception 'alegra_revocation_actor_not_authorized';
  end if;

  if v_run.status in ('running','verifying','succeeded') then
    return 'dispatch_already_admitted';
  end if;

  if v_run.status = 'cancelled'
     and v_run.safe_metadata->>'approvalBindingState' = 'revoked' then
    return 'already_revoked';
  end if;

  if v_run.status <> 'queued' then
    return null;
  end if;

  if exists (
    select 1
    from public.toro_execution_receipts revoked
    where revoked.org_id = v_run.org_id
      and revoked.run_id = v_run.id
      and revoked.receipt_type = 'approval'
      and revoked.status = 'denied'
      and revoked.supersedes_receipt_id = v_approval.id
  ) then
    return 'already_revoked';
  end if;

  v_revision := nullif(v_approval.desired_state->>'decisionRevision','');
  if v_revision is null then
    return null;
  end if;

  insert into public.toro_execution_receipts (
    org_id, run_id, task_id, decision_id, supersedes_receipt_id,
    receipt_type, status, action_key, target_system, actor_kind, actor_ref,
    dot_ref, agent_ref, execution_authority_level, business_risk,
    correlation_id, trace_id, idempotency_key, desired_state,
    executed_state, verification_method, verification_status, evidence_refs,
    source_receipt_system, source_receipt_kind, source_receipt_ref,
    integrity_hash
  ) values (
    v_run.org_id, v_run.id, v_run.task_id, v_run.decision_id, v_approval.id,
    'approval', 'denied', v_run.action_key, v_run.target_system,
    'human', v_actor_id::text, v_run.dot_ref, v_run.agent_ref,
    'L3', v_run.business_risk, v_run.correlation_id, v_run.trace_id,
    v_run.idempotency_key || ':revocation:' || v_revision,
    v_approval.desired_state,
    jsonb_build_object('phase', 'before_provider_dispatch', 'providerEffect', false),
    'owner_revocation', 'passed',
    jsonb_build_array('toro-execution-receipt:' || v_approval.id::text),
    'toro_signed_owner_approval', 'owner_approval_v1',
    v_approval.source_receipt_ref,
    v_approval.integrity_hash
  );

  return 'revoked';
end;
$$;

revoke all on function public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid)
  from public;
revoke all on function public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid)
  from anon;
revoke all on function public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid)
  from authenticated;
revoke all on function public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid)
  from service_role;

comment on function public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid) is
  'Draft-only owner revocation. Actor identity is derived from auth.uid() and revalidated as the exact active FOUNDER + ADMIN/GERENCIA signer; no runtime role has EXECUTE in this draft.';

drop function if exists public.toro_admit_approved_alegra_execution_v1(
  uuid,uuid,text,bigint,uuid,text,text,timestamptz,text,text,integer
);

create or replace function public.toro_admit_approved_alegra_execution_v1(
  p_org_id uuid,
  p_run_id uuid,
  p_worker_id text,
  p_expected_fencing_token bigint,
  p_approval_receipt_id uuid,
  p_approval_id text,
  p_approval_actor_id text,
  p_approval_approved_at timestamptz,
  p_approval_expires_at timestamptz,
  p_payload_hash text,
  p_decision_revision text,
  p_lease_seconds integer default 120
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.toro_execution_runs%rowtype;
  v_approval public.toro_execution_receipts%rowtype;
  v_signed public.toro_alegra_l3_owner_approvals%rowtype;
  v_fencing_token bigint;
  v_lease_expires_at timestamptz;
  v_prepared_receipt_id uuid;
  v_prepared_evidence_refs jsonb;
  v_locked_at timestamptz;
  v_dispatch_at timestamptz;
begin
  if p_worker_id is null or btrim(p_worker_id) = '' then
    raise exception 'worker_id_required';
  end if;

  if p_expected_fencing_token is null then
    raise exception 'expected_fencing_token_required';
  end if;

  if p_lease_seconds is null
     or p_lease_seconds < 30
     or p_lease_seconds > 300 then
    raise exception 'lease_seconds_out_of_range';
  end if;

  if p_approval_id is null or btrim(p_approval_id) = ''
     or p_approval_actor_id is null or btrim(p_approval_actor_id) = ''
     or p_approval_approved_at is null
     or p_approval_expires_at is null
     or p_payload_hash is null or p_payload_hash !~ '^[0-9a-f]{64}$'
     or p_decision_revision is null or btrim(p_decision_revision) = '' then
    raise exception 'approval_binding_required';
  end if;

  -- Sign, renewal, revocation, and admission serialize on the same run. Sample
  -- time only after this potentially blocking lock.
  select *
    into v_run
  from public.toro_execution_runs run
  where run.org_id = p_org_id
    and run.id = p_run_id
  for update;

  if not found then
    return null;
  end if;

  v_locked_at := clock_timestamp();

  if v_run.status is distinct from 'queued'
     or v_run.attempt_count <> 0
     or v_run.max_attempts <> 1
     or v_run.verification_status is distinct from 'pending'
     or v_run.started_at is not null
     or v_run.verifying_at is not null
     or v_run.finished_at is not null
     or v_run.error_class is not null
     or v_run.error_redacted is not null
     or v_run.lease_owner is not null
     or v_run.lease_expires_at is not null
     or v_run.execution_authority_level is distinct from 'L3'
     or v_run.business_risk not in ('High','Critical')
     or v_run.action_key is distinct from 'alegra_create_purchase_bill'
     or v_run.target_system is distinct from 'alegra'
     or v_run.actor_kind is distinct from 'human'
     or v_run.actor_ref is distinct from p_approval_actor_id
     or v_run.decision_id is null
     or v_run.fencing_token <> p_expected_fencing_token
     or v_run.available_at > v_locked_at
     or v_run.safe_metadata->>'approvalReceiptId' is distinct from p_approval_receipt_id::text
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'approved'
     or v_run.safe_metadata->>'payloadHash' is distinct from p_payload_hash
     or v_run.safe_metadata->>'approvalId' is distinct from p_approval_id
     or v_run.safe_metadata->>'approvalActorId' is distinct from p_approval_actor_id
     or (v_run.safe_metadata->>'approvalApprovedAt')::timestamptz is distinct from p_approval_approved_at
     or (v_run.safe_metadata->>'approvalExpiresAt')::timestamptz is distinct from p_approval_expires_at
     or (v_run.safe_metadata->>'decisionRevision')::timestamptz is distinct from p_decision_revision::timestamptz
     or p_approval_approved_at > v_locked_at
     or p_approval_expires_at <= v_locked_at
     or p_approval_expires_at <> p_approval_approved_at + interval '15 minutes'
     or p_decision_revision::timestamptz is distinct from p_approval_approved_at then
    return null;
  end if;

  select *
    into v_approval
  from public.toro_execution_receipts approval
  where approval.org_id = v_run.org_id
    and approval.id = p_approval_receipt_id
    and approval.run_id = v_run.id
    and approval.task_id = v_run.task_id
    and approval.decision_id = v_run.decision_id
    and approval.receipt_type = 'approval'
    and approval.status = 'verified'
    and approval.verification_status = 'passed'
    and approval.action_key = v_run.action_key
    and approval.target_system = v_run.target_system
    and approval.execution_authority_level = 'L3'
    and approval.actor_kind = 'human'
    and approval.actor_ref = p_approval_actor_id
    and approval.integrity_hash = p_payload_hash
    and approval.desired_state->>'payloadHash' = p_payload_hash
    and approval.desired_state->>'approvalId' = p_approval_id
    and approval.desired_state->>'actorId' = p_approval_actor_id
    and (approval.desired_state->>'approvedAt')::timestamptz = p_approval_approved_at
    and (approval.desired_state->>'expiresAt')::timestamptz = p_approval_expires_at
    and (approval.desired_state->>'decisionRevision')::timestamptz = p_decision_revision::timestamptz
    and approval.source_receipt_system = 'toro_signed_owner_approval'
    and approval.source_receipt_kind = 'owner_approval_v1'
    and approval.source_receipt_ref = approval.desired_state->>'canonicalApprovalId';

  if not found then
    return null;
  end if;

  -- Hold every mutable actor-authority row through commit so an offboard, role
  -- revocation, or FOUNDER removal cannot commit between validation and the run
  -- UPDATE. The decision row is deliberately not locked here: the canonical
  -- signer updates decision first and then locks run, so locking it would invert
  -- the order and introduce a decision/run deadlock.
  select signed.*
    into v_signed
  from public.toro_alegra_l3_owner_approvals signed
  join operations.executive_decisions decision
    on decision.org_id = signed.org_id
   and decision.id = signed.decision_id
   and decision.status = 'Respondida'
   and decision.decision_value = 'approved'
   and decision.processed_at = signed.approved_at
   and decision.updated_at = signed.decision_revision
   and decision.decision_key = signed.approval_id
   and decision.program_key = 'toro_alegra_writer_v3'
   and decision.instruction = signed.action_key
   and decision.source_system = 'toro_control_plane'
   and decision.source_record_id = signed.run_id::text
   and decision.source_ref = signed.payload_hash
   and decision.superseded_by is null
  join identity.organization_memberships membership
    on membership.id = signed.actor_membership_id
   and membership.org_id = signed.org_id
   and membership.user_id = signed.actor_id
   and membership.membership_type = signed.actor_membership_type
   and membership.status = 'active'
   and membership.joined_at is not null
   and membership.joined_at <= signed.approved_at
   and membership.offboarded_at is null
  join public.user_roles role_assignment
    on role_assignment.id = signed.actor_role_assignment_id
   and role_assignment.org_id = signed.org_id
   and role_assignment.user_id = signed.actor_id
   and role_assignment.role_id = signed.actor_role_id
   and role_assignment.status = 'active'
   and role_assignment.revoked_at is null
  join public.roles role_definition
    on role_definition.id = signed.actor_role_id
   and role_definition.code = signed.actor_role_code
   and role_definition.code in ('ADMIN','GERENCIA')
  join auth.users actor
    on actor.id = signed.actor_id
   and coalesce(actor.raw_app_meta_data->>'toro_role','') = signed.actor_toro_role
   and signed.actor_toro_role = 'FOUNDER'
  where signed.org_id = v_run.org_id
    and signed.id::text = v_approval.source_receipt_ref
    and signed.id::text = v_run.safe_metadata->>'canonicalApprovalId'
    and signed.run_id = v_run.id
    and signed.task_id = v_run.task_id
    and signed.decision_id = v_run.decision_id
    and signed.approval_id = p_approval_id
    and signed.actor_id::text = p_approval_actor_id
    and signed.action_key = v_run.action_key
    and signed.target_system = v_run.target_system
    and signed.payload_hash = p_payload_hash
    and signed.approved_at = p_approval_approved_at
    and signed.expires_at = p_approval_expires_at
    and signed.decision_revision = p_decision_revision::timestamptz
    and signed.approved_at <= v_locked_at
    and signed.expires_at > v_locked_at
    and signed.expires_at = signed.approved_at + interval '15 minutes'
  for share of signed, membership, role_assignment, role_definition, actor;

  if not found then
    return null;
  end if;

  if exists (
    select 1
    from public.toro_alegra_l3_owner_approvals later
    where later.org_id = v_signed.org_id
      and later.run_id = v_signed.run_id
      and (later.approved_at, later.id) > (v_signed.approved_at, v_signed.id)
  ) or exists (
    select 1
    from public.toro_execution_receipts revoked
    where revoked.org_id = v_run.org_id
      and revoked.run_id = v_run.id
      and revoked.receipt_type = 'approval'
      and revoked.status = 'denied'
      and revoked.supersedes_receipt_id = v_approval.id
  ) then
    return null;
  end if;

  if jsonb_typeof(v_approval.evidence_refs) is distinct from 'array'
     or jsonb_array_length(v_approval.evidence_refs) = 0
     or exists (
       select 1
       from jsonb_array_elements(v_approval.evidence_refs) evidence(value)
       where jsonb_typeof(evidence.value) <> 'string'
          or btrim(evidence.value #>> '{}') = ''
     ) then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(canonical_ref) order by canonical_ref), '[]'::jsonb)
    into v_prepared_evidence_refs
  from (
    select distinct evidence.value #>> '{}' as canonical_ref
    from jsonb_array_elements(
      v_approval.evidence_refs || jsonb_build_array(
        'toro-execution-receipt:' || p_approval_receipt_id::text,
        'toro-owner-approval:' || v_signed.id::text
      )
    ) evidence(value)
  ) normalized_approval_evidence;

  v_fencing_token := v_run.fencing_token + 1;

  -- Re-sample and revalidate immediately before the irreversible UPDATE.
  v_dispatch_at := clock_timestamp();
  v_lease_expires_at := v_dispatch_at + make_interval(secs => p_lease_seconds);

  if p_approval_approved_at > v_dispatch_at
     or p_approval_expires_at <= v_dispatch_at
     or not exists (
       select 1
       from public.toro_alegra_l3_owner_approvals signed
       join operations.executive_decisions decision
         on decision.org_id = signed.org_id
        and decision.id = signed.decision_id
        and decision.status = 'Respondida'
        and decision.decision_value = 'approved'
        and decision.processed_at = signed.approved_at
        and decision.updated_at = signed.decision_revision
        and decision.decision_key = signed.approval_id
        and decision.program_key = 'toro_alegra_writer_v3'
        and decision.instruction = signed.action_key
        and decision.source_system = 'toro_control_plane'
        and decision.source_record_id = signed.run_id::text
        and decision.source_ref = signed.payload_hash
        and decision.superseded_by is null
       join identity.organization_memberships membership
         on membership.id = signed.actor_membership_id
        and membership.org_id = signed.org_id
        and membership.user_id = signed.actor_id
        and membership.membership_type = signed.actor_membership_type
        and membership.status = 'active'
        and membership.joined_at is not null
        and membership.joined_at <= signed.approved_at
        and membership.offboarded_at is null
       join public.user_roles role_assignment
         on role_assignment.id = signed.actor_role_assignment_id
        and role_assignment.org_id = signed.org_id
        and role_assignment.user_id = signed.actor_id
        and role_assignment.role_id = signed.actor_role_id
        and role_assignment.status = 'active'
        and role_assignment.revoked_at is null
       join public.roles role_definition
         on role_definition.id = signed.actor_role_id
        and role_definition.code = signed.actor_role_code
        and role_definition.code in ('ADMIN','GERENCIA')
       join auth.users actor
         on actor.id = signed.actor_id
        and coalesce(actor.raw_app_meta_data->>'toro_role','') = signed.actor_toro_role
        and signed.actor_toro_role = 'FOUNDER'
       where signed.id = v_signed.id
         and signed.approved_at = p_approval_approved_at
         and signed.expires_at = p_approval_expires_at
         and signed.expires_at > v_dispatch_at
         and not exists (
           select 1
           from public.toro_alegra_l3_owner_approvals later
           where later.org_id = signed.org_id
             and later.run_id = signed.run_id
             and (later.approved_at, later.id) > (signed.approved_at, signed.id)
         )
         and not exists (
           select 1
           from public.toro_execution_receipts revoked
           where revoked.org_id = v_approval.org_id
             and revoked.run_id = v_approval.run_id
             and revoked.receipt_type = 'approval'
             and revoked.status = 'denied'
             and revoked.supersedes_receipt_id = v_approval.id
         )
     ) then
    return null;
  end if;

  -- Allocate the marker id before the single queued -> running transition so
  -- the run and marker are bound from the first visible admitted state. The
  -- later INSERT is in this same RPC transaction; any insert failure rolls the
  -- run transition back.
  v_prepared_receipt_id := gen_random_uuid();

  update public.toro_execution_runs run
     set status = 'running',
         lease_owner = p_worker_id,
         fencing_token = v_fencing_token,
         lease_expires_at = v_lease_expires_at,
         attempt_count = 1,
         started_at = v_dispatch_at,
         safe_metadata = run.safe_metadata || jsonb_build_object(
           'approvalBindingState', 'admitted',
           'dispatchAdmittedAt', v_dispatch_at,
           'dispatchWorkerId', p_worker_id,
           'preparedReceiptId', v_prepared_receipt_id::text
         ),
         updated_at = v_dispatch_at
   where run.org_id = v_run.org_id
     and run.id = v_run.id
     and run.status = 'queued'
     and run.attempt_count = 0
     and run.max_attempts = 1
     and run.verification_status = 'pending'
     and run.started_at is null
     and run.verifying_at is null
     and run.finished_at is null
     and run.error_class is null
     and run.error_redacted is null
     and run.lease_owner is null
     and run.lease_expires_at is null
     and run.fencing_token = p_expected_fencing_token
     and run.available_at <= v_dispatch_at
     and run.decision_id = v_signed.decision_id
     and run.safe_metadata->>'approvalReceiptId' = p_approval_receipt_id::text
     and run.safe_metadata->>'canonicalApprovalId' = v_signed.id::text
     and (run.safe_metadata->>'approvalExpiresAt')::timestamptz > v_dispatch_at;

  if not found then
    return null;
  end if;

  insert into public.toro_execution_receipts (
    id, org_id, run_id, task_id, decision_id, receipt_type, status,
    action_key, target_system, actor_kind, actor_ref, dot_ref, agent_ref,
    execution_authority_level, business_risk, correlation_id, trace_id,
    idempotency_key, desired_state, executed_state, verification_status,
    evidence_refs, source_receipt_system, source_receipt_kind,
    source_receipt_ref, integrity_hash
  ) values (
    v_prepared_receipt_id, v_run.org_id, v_run.id, v_run.task_id, v_signed.decision_id,
    'execution', 'prepared', v_run.action_key, v_run.target_system,
    v_run.actor_kind, v_run.actor_ref, v_run.dot_ref, v_run.agent_ref,
    'L3', v_run.business_risk, v_run.correlation_id, v_run.trace_id,
    v_run.idempotency_key,
    jsonb_build_object(
      'payloadHash', p_payload_hash,
      'approvalId', p_approval_id,
      'actorId', p_approval_actor_id,
      'approvedAt', p_approval_approved_at,
      'expiresAt', p_approval_expires_at,
      'decisionRevision', p_decision_revision::timestamptz,
      'approvalReceiptId', p_approval_receipt_id,
      'canonicalApprovalId', v_signed.id
    ),
    jsonb_build_object(
      'phase', 'before_provider_dispatch',
      'providerEffect', false,
      'fencingToken', v_fencing_token,
      'admittedAt', v_dispatch_at
    ),
    'pending',
    v_prepared_evidence_refs,
    'toro_control_plane', 'alegra_l3_dispatch_admission',
    v_signed.id::text, p_payload_hash
  )
  returning id into v_prepared_receipt_id;

  return jsonb_build_object(
    'runId', v_run.id,
    'fencingToken', v_fencing_token,
    'leaseOwner', p_worker_id,
    'leaseExpiresAt', v_lease_expires_at,
    'preparedReceiptId', v_prepared_receipt_id,
    'approvalReceiptId', p_approval_receipt_id,
    'canonicalApprovalId', v_signed.id,
    'approvalApprovedAt', p_approval_approved_at,
    'approvalExpiresAt', p_approval_expires_at,
    'payloadHash', p_payload_hash,
    'decisionRevision', p_decision_revision,
    'dispatchAdmittedAt', v_dispatch_at
  );
end;
$$;

revoke all on function public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)
  from public;
revoke all on function public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)
  from anon;
revoke all on function public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)
  from authenticated;
revoke all on function public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)
  from service_role;

comment on function public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer) is
  'Draft-only atomic Alegra L3 admission. Requires an immutable signer approval captured through the pinned canonical resolver, its exact decision, FOUNDER claim, ADMIN/GERENCIA role and active membership. No runtime role has EXECUTE in this draft.';

create or replace function public.toro_finalize_alegra_execution_v1(
  p_org_id uuid,
  p_run_id uuid,
  p_worker_id text,
  p_fencing_token bigint,
  p_prepared_receipt_id uuid,
  p_outcome text,
  p_receipt jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.toro_execution_runs%rowtype;
  v_prepared public.toro_execution_receipts%rowtype;
  v_existing public.toro_execution_receipts%rowtype;
  v_observed_input jsonb;
  v_observed_after jsonb;
  v_evidence_refs jsonb;
  v_reasons jsonb;
  v_payload_hash text;
  v_external_reference text;
  v_receipt_id uuid;
  v_receipt_key text;
  v_receipt_type text;
  v_receipt_status text;
  v_verification_method text;
  v_verification_status text;
  v_run_status text;
  v_error_class text;
  v_replayed boolean := false;
  v_locked_at timestamptz;
  v_finalized_at timestamptz;
begin
  if p_worker_id is null or btrim(p_worker_id) = '' then
    raise exception 'worker_id_required';
  end if;

  if p_fencing_token is null then
    raise exception 'fencing_token_required';
  end if;

  if p_prepared_receipt_id is null then
    raise exception 'prepared_receipt_id_required';
  end if;

  if p_outcome is null
     or p_outcome not in ('verified','reconciliation_required') then
    raise exception 'alegra_finalization_outcome_invalid';
  end if;

  if jsonb_typeof(p_receipt) is distinct from 'object'
     or jsonb_typeof(p_receipt->'observed_after') is distinct from 'object'
     or jsonb_typeof(coalesce(p_receipt->'evidence_refs','[]'::jsonb)) is distinct from 'array' then
    raise exception 'alegra_finalization_receipt_invalid';
  end if;

  v_observed_input := p_receipt->'observed_after';
  v_evidence_refs := coalesce(p_receipt->'evidence_refs','[]'::jsonb);
  v_payload_hash := nullif(p_receipt->>'integrity_hash','');
  v_external_reference := nullif(btrim(p_receipt->>'external_reference'),'');

  if exists (
    select 1
    from jsonb_array_elements(v_evidence_refs) evidence(value)
    where jsonb_typeof(evidence.value) <> 'string'
       or btrim(evidence.value #>> '{}') = ''
  ) then
    raise exception 'alegra_finalization_evidence_invalid';
  end if;

  select coalesce(jsonb_agg(to_jsonb(canonical_ref) order by canonical_ref), '[]'::jsonb)
    into v_evidence_refs
  from (
    select distinct evidence.value #>> '{}' as canonical_ref
    from jsonb_array_elements(v_evidence_refs) evidence(value)
  ) normalized_evidence;

  -- The run is the serialization boundary. Organization, id and fence are all
  -- part of the lock predicate so a stale or cross-tenant worker cannot close it.
  select *
    into v_run
  from public.toro_execution_runs r
  where r.org_id = p_org_id
    and r.id = p_run_id
    and r.fencing_token = p_fencing_token
  for update;

  if not found then
    return null;
  end if;

  v_locked_at := clock_timestamp();

  if v_run.execution_authority_level is distinct from 'L3'
     or v_run.action_key is distinct from 'alegra_create_purchase_bill'
     or v_run.target_system is distinct from 'alegra'
     or v_run.actor_kind is distinct from 'human'
     or v_run.business_risk not in ('High','Critical')
     or v_run.decision_id is null
     or v_run.attempt_count <> 1
     or v_run.max_attempts <> 1
     or v_run.safe_metadata->>'dispatchWorkerId' is distinct from p_worker_id
     or v_run.safe_metadata->>'preparedReceiptId' is distinct from p_prepared_receipt_id::text
     or v_run.safe_metadata->>'payloadHash' is distinct from v_payload_hash then
    return null;
  end if;

  if v_run.status in ('running','verifying')
     and (v_run.lease_owner is distinct from p_worker_id
       or v_run.lease_expires_at is null
       or v_run.lease_expires_at <= v_locked_at
       or v_run.safe_metadata->>'approvalBindingState' is distinct from 'admitted') then
    raise exception 'alegra_finalization_lease_invalid';
  end if;

  if v_observed_input->>'version' is distinct from 'TORO-ALEGRA-WRITER-RECEIPT-v1'
     or v_observed_input->>'idempotencyKey' is distinct from v_run.idempotency_key
     or v_observed_input->>'payloadHash' is distinct from v_payload_hash
     or v_observed_input->>'approvalId' is distinct from v_run.safe_metadata->>'approvalId'
     or v_observed_input->>'actorId' is distinct from v_run.actor_ref
     or jsonb_typeof(v_observed_input->'reasons') is distinct from 'array'
     or nullif(btrim(v_observed_input->>'nativeId'),'') is distinct from v_external_reference then
    return null;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_observed_input->'reasons') reason(value)
    where jsonb_typeof(reason.value) <> 'string'
       or btrim(reason.value #>> '{}') = ''
  ) then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(canonical_reason) order by canonical_reason), '[]'::jsonb)
    into v_reasons
  from (
    select distinct reason.value #>> '{}' as canonical_reason
    from jsonb_array_elements(v_observed_input->'reasons') reason(value)
  ) normalized_reasons;

  if p_outcome = 'verified' then
    if v_observed_input->'verified' is distinct from 'true'::jsonb
       or v_observed_input->>'verificationState' is distinct from 'VERIFIED'
       or v_external_reference is null
       or not coalesce(
         v_observed_input->>'executionState' in (
           'provider_created','provider_ambiguous_recovered'
         ),
         false
       )
       or jsonb_array_length(v_reasons) <> 0 then
      return null;
    end if;

    v_receipt_key := v_run.idempotency_key || ':verification';
    v_receipt_type := 'verification';
    v_receipt_status := 'verified';
    v_verification_method := 'alegra_native_readback';
    v_verification_status := 'passed';
    v_run_status := 'succeeded';
    v_error_class := null;
  else
    if v_observed_input->'verified' is distinct from 'false'::jsonb
       or jsonb_array_length(v_reasons) = 0
       or not coalesce(
         (v_observed_input->>'verificationState' = 'READBACK_MISMATCH'
            and v_observed_input->>'executionState' in (
              'provider_created','provider_ambiguous_recovered'
            )
            and v_external_reference is not null)
          or (v_observed_input->>'verificationState' = 'PROVIDER_STATE_UNKNOWN'
            and (
              (v_observed_input->>'executionState' in (
                'provider_created','provider_ambiguous_recovered'
              ) and v_external_reference is not null)
              or (v_observed_input->>'executionState' = 'blocked'
                and v_external_reference is null)
            ))
          or (v_observed_input->>'verificationState' = 'NOT_ATTEMPTED'
            and v_observed_input->>'executionState' in ('blocked','failed')
            and v_external_reference is null),
         false
       ) then
      return null;
    end if;

    v_receipt_key := v_run.idempotency_key || ':reconciliation';
    v_receipt_type := 'execution';
    v_receipt_status := 'blocked';
    v_verification_method := null;
    v_verification_status := 'partial';
    v_run_status := 'blocked';
    v_error_class := 'ALEGRA_RECONCILIATION_REQUIRED';
  end if;

  -- Keep only stable Writer fields in the canonical envelope. The database
  -- owns receipt/finalization timestamps; retries may carry a different
  -- caller-side createdAt without changing the logical outcome.
  v_observed_after := jsonb_build_object(
    'version', v_observed_input->>'version',
    'idempotencyKey', v_observed_input->>'idempotencyKey',
    'payloadHash', v_observed_input->>'payloadHash',
    'approvalId', v_observed_input->>'approvalId',
    'actorId', v_observed_input->>'actorId',
    'nativeId', v_external_reference,
    'executionState', v_observed_input->>'executionState',
    'verificationState', v_observed_input->>'verificationState',
    'verified', v_observed_input->'verified',
    'reasons', v_reasons
  );

  select *
    into v_prepared
  from public.toro_execution_receipts prepared
  where prepared.org_id = v_run.org_id
    and prepared.id = p_prepared_receipt_id
    and prepared.run_id = v_run.id
    and prepared.task_id = v_run.task_id
    and prepared.decision_id = v_run.decision_id
    and prepared.receipt_type = 'execution'
    and prepared.status = 'prepared'
    and prepared.action_key = v_run.action_key
    and prepared.target_system = v_run.target_system
    and prepared.actor_kind = v_run.actor_kind
    and prepared.actor_ref = v_run.actor_ref
    and prepared.execution_authority_level = 'L3'
    and prepared.business_risk = v_run.business_risk
    and prepared.correlation_id = v_run.correlation_id
    and prepared.idempotency_key = v_run.idempotency_key
    and prepared.integrity_hash = v_payload_hash
    and prepared.desired_state->>'payloadHash' = v_payload_hash
    and prepared.desired_state->>'approvalId' = v_run.safe_metadata->>'approvalId'
    and prepared.desired_state->>'actorId' = v_run.actor_ref
    and (prepared.desired_state->>'approvedAt')::timestamptz =
        (v_run.safe_metadata->>'approvalApprovedAt')::timestamptz
    and (prepared.desired_state->>'expiresAt')::timestamptz =
        (v_run.safe_metadata->>'approvalExpiresAt')::timestamptz
    and (prepared.desired_state->>'decisionRevision')::timestamptz =
        (v_run.safe_metadata->>'decisionRevision')::timestamptz
    and prepared.desired_state->>'approvalReceiptId' = v_run.safe_metadata->>'approvalReceiptId'
    and prepared.desired_state->>'canonicalApprovalId' = v_run.safe_metadata->>'canonicalApprovalId'
    and prepared.executed_state->>'phase' = 'before_provider_dispatch'
    and prepared.executed_state->'providerEffect' = 'false'::jsonb
    and prepared.executed_state->'fencingToken' = to_jsonb(p_fencing_token)
    and prepared.source_receipt_system = 'toro_control_plane'
    and prepared.source_receipt_kind = 'alegra_l3_dispatch_admission'
    and prepared.source_receipt_ref = v_run.safe_metadata->>'canonicalApprovalId'
  for share;

  if not found then
    return null;
  end if;

  if jsonb_typeof(v_prepared.evidence_refs) is distinct from 'array'
     or jsonb_array_length(v_prepared.evidence_refs) = 0
     or exists (
       select 1
       from jsonb_array_elements(v_prepared.evidence_refs) evidence(value)
       where jsonb_typeof(evidence.value) <> 'string'
          or btrim(evidence.value #>> '{}') = ''
     ) then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(canonical_ref) order by canonical_ref), '[]'::jsonb)
    into v_evidence_refs
  from (
    select distinct evidence.value #>> '{}' as canonical_ref
    from jsonb_array_elements(
      v_prepared.evidence_refs || v_evidence_refs || jsonb_build_array(
        'toro-execution-receipt:' || p_prepared_receipt_id::text
      )
    ) evidence(value)
  ) normalized_final_evidence;

  select *
    into v_existing
  from public.toro_execution_receipts receipt
  where receipt.org_id = v_run.org_id
    and receipt.idempotency_key = v_receipt_key
  for share;

  if found then
    if v_existing.run_id is distinct from v_run.id
       or v_existing.task_id is distinct from v_run.task_id
       or v_existing.decision_id is distinct from v_run.decision_id
       or v_existing.supersedes_receipt_id is distinct from p_prepared_receipt_id
       or v_existing.receipt_type is distinct from v_receipt_type
       or v_existing.status is distinct from v_receipt_status
       or v_existing.action_key is distinct from v_run.action_key
       or v_existing.target_system is distinct from v_run.target_system
       or v_existing.external_reference is distinct from v_external_reference
       or v_existing.actor_kind is distinct from v_run.actor_kind
       or v_existing.actor_ref is distinct from v_run.actor_ref
       or v_existing.execution_authority_level is distinct from 'L3'
       or v_existing.business_risk is distinct from v_run.business_risk
       or v_existing.correlation_id is distinct from v_run.correlation_id
       or v_existing.desired_state is distinct from v_prepared.desired_state
       or v_existing.executed_state is distinct from v_prepared.executed_state
       or v_existing.observed_after is distinct from v_observed_after
       or v_existing.verification_method is distinct from v_verification_method
       or v_existing.verification_status is distinct from v_verification_status
       or v_existing.evidence_refs is distinct from v_evidence_refs
       or v_existing.source_receipt_system is distinct from 'alegra'
       or v_existing.source_receipt_kind is distinct from 'writer_v3'
       or v_existing.source_receipt_ref is distinct from v_external_reference
       or v_existing.integrity_hash is distinct from v_payload_hash
       or v_existing.error_class is distinct from v_error_class then
      return null;
    end if;

    v_receipt_id := v_existing.id;
    v_replayed := true;
  else
    if v_run.status not in ('running','verifying') then
      return null;
    end if;

    insert into public.toro_execution_receipts (
      org_id, run_id, task_id, decision_id, supersedes_receipt_id,
      receipt_type, status, action_key, target_system, external_reference,
      actor_kind, actor_ref, dot_ref, agent_ref, execution_authority_level,
      business_risk, correlation_id, trace_id, idempotency_key, desired_state,
      executed_state, observed_after, verification_method,
      verification_status, evidence_refs, source_receipt_system,
      source_receipt_kind, source_receipt_ref, integrity_hash, error_class,
      error_redacted
    ) values (
      v_run.org_id, v_run.id, v_run.task_id, v_run.decision_id,
      p_prepared_receipt_id, v_receipt_type, v_receipt_status,
      v_run.action_key, v_run.target_system, v_external_reference,
      v_run.actor_kind, v_run.actor_ref, v_run.dot_ref, v_run.agent_ref,
      'L3', v_run.business_risk, v_run.correlation_id, v_run.trace_id,
      v_receipt_key, v_prepared.desired_state, v_prepared.executed_state,
      v_observed_after, v_verification_method,
      v_verification_status, v_evidence_refs, 'alegra', 'writer_v3',
      v_external_reference, v_payload_hash, v_error_class, null
    )
    returning id into v_receipt_id;
  end if;

  if v_run.status in ('running','verifying') then
    v_finalized_at := clock_timestamp();

    if v_run.lease_owner is distinct from p_worker_id
       or v_run.lease_expires_at is null
       or v_run.lease_expires_at <= v_finalized_at
       or v_run.safe_metadata->>'approvalBindingState' is distinct from 'admitted' then
      raise exception 'alegra_finalization_lease_invalid';
    end if;

    update public.toro_execution_runs r
       set status = v_run_status,
           verification_status = v_verification_status,
           verifying_at = coalesce(r.verifying_at, v_finalized_at),
           finished_at = coalesce(r.finished_at, v_finalized_at),
           lease_owner = null,
           lease_expires_at = null,
           error_class = v_error_class,
           error_redacted = null,
           safe_metadata = r.safe_metadata || jsonb_build_object(
             'approvalBindingState', 'finalized',
             'preparedReceiptId', p_prepared_receipt_id::text,
             'finalReceiptId', v_receipt_id::text,
             'finalizationOutcome', p_outcome,
             'finalizedByWorkerId', p_worker_id,
             'finalizedAt', v_finalized_at
           ),
           updated_at = v_finalized_at
     where r.org_id = v_run.org_id
       and r.id = v_run.id
       and r.fencing_token = p_fencing_token
       and r.status in ('running','verifying')
       and r.lease_owner = p_worker_id
       and r.lease_expires_at > v_finalized_at;

    if not found then
      raise exception 'alegra_finalization_state_changed';
    end if;
  elsif v_run.status is distinct from v_run_status
        or v_run.verification_status is distinct from v_verification_status
        or v_run.error_class is distinct from v_error_class
        or v_run.safe_metadata->>'approvalBindingState' is distinct from 'finalized'
        or v_run.safe_metadata->>'finalReceiptId' is distinct from v_receipt_id::text
        or v_run.safe_metadata->>'finalizationOutcome' is distinct from p_outcome
        or v_run.safe_metadata->>'finalizedByWorkerId' is distinct from p_worker_id then
    return null;
  end if;

  return jsonb_build_object(
    'runId', v_run.id,
    'finalReceiptId', v_receipt_id,
    'runStatus', v_run_status,
    'verificationStatus', v_verification_status,
    'replayed', v_replayed
  );
end;
$$;

revoke all on function public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)
  from public;
revoke all on function public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)
  from anon;
revoke all on function public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)
  from authenticated;
revoke all on function public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)
  from service_role;

comment on function public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb) is
  'Draft-only SECURITY DEFINER Alegra L3 finalization for a future EXECUTE-only writer role. Recovers or inserts one receipt linked to the dispatch marker and closes the fenced run in the same transaction; no runtime role receives EXECUTE in this draft.';

create or replace function public.toro_heartbeat_alegra_execution_v1(
  p_org_id uuid,
  p_run_id uuid,
  p_worker_id text,
  p_fencing_token bigint,
  p_prepared_receipt_id uuid,
  p_lease_seconds integer default 60
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.toro_execution_runs%rowtype;
  v_prepared public.toro_execution_receipts%rowtype;
  v_checked_at timestamptz;
  v_extended_at timestamptz;
  v_hard_expires_at timestamptz;
  v_lease_expires_at timestamptz;
begin
  if p_org_id is null or p_run_id is null then
    raise exception 'alegra_heartbeat_scope_required';
  end if;

  if p_worker_id is null or btrim(p_worker_id) = '' then
    raise exception 'alegra_heartbeat_worker_id_required';
  end if;

  if p_fencing_token is null or p_fencing_token < 1 then
    raise exception 'alegra_heartbeat_fencing_token_required';
  end if;

  if p_prepared_receipt_id is null then
    raise exception 'alegra_heartbeat_prepared_receipt_id_required';
  end if;

  if p_lease_seconds is null
     or p_lease_seconds < 30
     or p_lease_seconds > 120 then
    raise exception 'alegra_heartbeat_lease_seconds_out_of_range';
  end if;

  -- The run lock serializes heartbeat, finalization and expired-lease recovery.
  -- Sample wall time only after the potentially blocking lock.
  select *
    into v_run
  from public.toro_execution_runs r
  where r.org_id = p_org_id
    and r.id = p_run_id
  for update;

  if not found then
    return null;
  end if;

  v_checked_at := clock_timestamp();

  if v_run.fencing_token <> p_fencing_token
     or v_run.status not in ('running','verifying')
     or v_run.execution_authority_level is distinct from 'L3'
     or v_run.action_key is distinct from 'alegra_create_purchase_bill'
     or v_run.target_system is distinct from 'alegra'
     or v_run.actor_kind is distinct from 'human'
     or v_run.business_risk not in ('High','Critical')
     or v_run.attempt_count <> 1
     or v_run.max_attempts <> 1
     or v_run.verification_status is distinct from 'pending'
     or v_run.finished_at is not null
     or v_run.error_class is not null
     or v_run.error_redacted is not null
     or v_run.lease_owner is distinct from p_worker_id
     or v_run.safe_metadata->>'dispatchWorkerId' is distinct from p_worker_id
     or v_run.safe_metadata->>'approvalBindingState' is distinct from 'admitted'
     or v_run.safe_metadata->>'preparedReceiptId' is distinct from p_prepared_receipt_id::text
     or v_run.lease_expires_at is null
     or v_run.lease_expires_at <= v_checked_at
     or nullif(v_run.safe_metadata->>'dispatchAdmittedAt','') is null then
    return null;
  end if;

  v_hard_expires_at :=
    (v_run.safe_metadata->>'dispatchAdmittedAt')::timestamptz
      + interval '5 minutes';

  if v_hard_expires_at <= v_checked_at then
    return null;
  end if;

  -- Lock and verify the exact immutable prepared marker before extending the
  -- lease. A run row alone is not enough to prove dispatch admission.
  select *
    into v_prepared
  from public.toro_execution_receipts prepared
  where prepared.org_id = v_run.org_id
    and prepared.id = p_prepared_receipt_id
    and prepared.run_id = v_run.id
    and prepared.task_id = v_run.task_id
    and prepared.decision_id = v_run.decision_id
    and prepared.receipt_type = 'execution'
    and prepared.status = 'prepared'
    and prepared.action_key = v_run.action_key
    and prepared.target_system = v_run.target_system
    and prepared.actor_kind = v_run.actor_kind
    and prepared.actor_ref = v_run.actor_ref
    and prepared.dot_ref is not distinct from v_run.dot_ref
    and prepared.agent_ref is not distinct from v_run.agent_ref
    and prepared.execution_authority_level = 'L3'
    and prepared.business_risk = v_run.business_risk
    and prepared.correlation_id = v_run.correlation_id
    and prepared.trace_id is not distinct from v_run.trace_id
    and prepared.idempotency_key = v_run.idempotency_key
    and prepared.integrity_hash = v_run.safe_metadata->>'payloadHash'
    and prepared.desired_state->>'payloadHash' = v_run.safe_metadata->>'payloadHash'
    and prepared.desired_state->>'approvalId' = v_run.safe_metadata->>'approvalId'
    and prepared.desired_state->>'actorId' = v_run.actor_ref
    and (prepared.desired_state->>'approvedAt')::timestamptz =
        (v_run.safe_metadata->>'approvalApprovedAt')::timestamptz
    and (prepared.desired_state->>'expiresAt')::timestamptz =
        (v_run.safe_metadata->>'approvalExpiresAt')::timestamptz
    and (prepared.desired_state->>'decisionRevision')::timestamptz =
        (v_run.safe_metadata->>'decisionRevision')::timestamptz
    and prepared.desired_state->>'approvalReceiptId' = v_run.safe_metadata->>'approvalReceiptId'
    and prepared.desired_state->>'canonicalApprovalId' = v_run.safe_metadata->>'canonicalApprovalId'
    and prepared.executed_state->>'phase' = 'before_provider_dispatch'
    and prepared.executed_state->'providerEffect' = 'false'::jsonb
    and prepared.executed_state->'fencingToken' = to_jsonb(p_fencing_token)
    and prepared.source_receipt_system = 'toro_control_plane'
    and prepared.source_receipt_kind = 'alegra_l3_dispatch_admission'
    and prepared.source_receipt_ref = v_run.safe_metadata->>'canonicalApprovalId'
  for share;

  if not found then
    return null;
  end if;

  if jsonb_typeof(v_prepared.evidence_refs) is distinct from 'array'
     or jsonb_array_length(v_prepared.evidence_refs) = 0
     or exists (
       select 1
       from jsonb_array_elements(v_prepared.evidence_refs) evidence(value)
       where jsonb_typeof(evidence.value) <> 'string'
          or btrim(evidence.value #>> '{}') = ''
     ) then
    return null;
  end if;

  -- Re-sample after the marker lock. A heartbeat that waited through expiry is
  -- rejected and cannot revive the lease. The five-minute admission horizon
  -- bounds repeated heartbeats even though each extension has a narrow TTL.
  v_extended_at := clock_timestamp();

  update public.toro_execution_runs r
     set lease_expires_at = least(
           greatest(
             r.lease_expires_at,
             v_extended_at + make_interval(secs => p_lease_seconds)
           ),
           v_hard_expires_at
         ),
         updated_at = v_extended_at
   where r.org_id = v_run.org_id
     and r.id = v_run.id
     and r.fencing_token = p_fencing_token
     and r.status in ('running','verifying')
     and r.lease_owner = p_worker_id
     and r.lease_expires_at > v_extended_at
     and r.safe_metadata->>'approvalBindingState' = 'admitted'
     and r.safe_metadata->>'preparedReceiptId' = p_prepared_receipt_id::text
  returning r.lease_expires_at into v_lease_expires_at;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'runId', v_run.id,
    'fencingToken', p_fencing_token,
    'leaseExpiresAt', v_lease_expires_at,
    'preparedReceiptId', p_prepared_receipt_id
  );
end;
$$;

revoke all on function public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)
  from public;
revoke all on function public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)
  from anon;
revoke all on function public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)
  from authenticated;
revoke all on function public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)
  from service_role;

comment on function public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer) is
  'Draft-only narrow heartbeat for the same admitted Alegra L3 worker and fence before lease expiry. It verifies the exact prepared marker, cannot revive an expired lease, and grants no role EXECUTE.';

create or replace function public.toro_recover_expired_alegra_execution_v1(
  p_org_id uuid,
  p_run_id uuid,
  p_recovery_worker_id text,
  p_expected_fencing_token bigint,
  p_prepared_receipt_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.toro_execution_runs%rowtype;
  v_prepared public.toro_execution_receipts%rowtype;
  v_existing public.toro_execution_receipts%rowtype;
  v_receipt_id uuid;
  v_receipt_key text;
  v_payload_hash text;
  v_observed_after jsonb;
  v_executed_state jsonb;
  v_evidence_refs jsonb;
  v_recovered_at timestamptz;
  v_new_fencing_token bigint;
  v_is_replay boolean := false;
begin
  if p_org_id is null or p_run_id is null then
    raise exception 'alegra_recovery_scope_required';
  end if;

  if p_recovery_worker_id is null or btrim(p_recovery_worker_id) = '' then
    raise exception 'alegra_recovery_worker_id_required';
  end if;

  if p_expected_fencing_token is null or p_expected_fencing_token < 1 then
    raise exception 'alegra_recovery_fencing_token_required';
  end if;

  if p_prepared_receipt_id is null then
    raise exception 'alegra_recovery_prepared_receipt_id_required';
  end if;

  -- This RPC never calls Alegra, a transport, an HTTP extension, or another
  -- execution RPC. It only fences an expired local run and records that the
  -- provider state is unknown so a human/native reconciliation can resolve it.
  select *
    into v_run
  from public.toro_execution_runs r
  where r.org_id = p_org_id
    and r.id = p_run_id
  for update;

  if not found then
    return null;
  end if;

  v_recovered_at := clock_timestamp();
  v_payload_hash := nullif(v_run.safe_metadata->>'payloadHash','');
  v_receipt_key := v_run.idempotency_key || ':expired_lease_recovery';
  v_new_fencing_token := p_expected_fencing_token + 1;

  if v_run.execution_authority_level is distinct from 'L3'
     or v_run.action_key is distinct from 'alegra_create_purchase_bill'
     or v_run.target_system is distinct from 'alegra'
     or v_run.actor_kind is distinct from 'human'
     or v_run.business_risk not in ('High','Critical')
     or v_run.decision_id is null
     or v_run.attempt_count <> 1
     or v_run.max_attempts <> 1
     or v_payload_hash is null
     or v_payload_hash !~ '^[0-9a-f]{64}$'
     or nullif(v_run.safe_metadata->>'dispatchWorkerId','') is null
     or v_run.safe_metadata->>'preparedReceiptId' is distinct from p_prepared_receipt_id::text then
    return null;
  end if;

  if v_run.status in ('running','verifying') then
    if v_run.fencing_token <> p_expected_fencing_token
       or v_run.verification_status is distinct from 'pending'
       or v_run.finished_at is not null
       or v_run.error_class is not null
       or v_run.error_redacted is not null
       or v_run.safe_metadata->>'approvalBindingState' is distinct from 'admitted'
       or v_run.lease_owner is distinct from v_run.safe_metadata->>'dispatchWorkerId'
       or v_run.lease_expires_at is null
       or v_run.lease_expires_at > v_recovered_at then
      return null;
    end if;
  elsif v_run.status = 'blocked'
        and v_run.verification_status = 'partial'
        and v_run.error_class = 'ALEGRA_PROVIDER_STATE_UNKNOWN'
        and v_run.error_redacted is null
        and v_run.fencing_token = v_new_fencing_token
        and v_run.lease_owner is null
        and v_run.lease_expires_at is null
        and v_run.verifying_at is not null
        and v_run.finished_at is not null
        and v_run.safe_metadata->>'approvalBindingState' = 'recovery_blocked'
        and v_run.safe_metadata->>'recoveredFromFencingToken' = p_expected_fencing_token::text
        and v_run.safe_metadata->>'recoveryFencingToken' = v_new_fencing_token::text
        and v_run.safe_metadata->>'recoveryState' = 'PROVIDER_STATE_UNKNOWN'
        and nullif(v_run.safe_metadata->>'recoveryReceiptId','') is not null
        and v_run.safe_metadata->>'finalReceiptId' = v_run.safe_metadata->>'recoveryReceiptId' then
    v_is_replay := true;
  else
    return null;
  end if;

  -- Both the first recovery and every replay lock and validate the exact marker
  -- from the expired admitted fence. No run-only recovery is accepted.
  select *
    into v_prepared
  from public.toro_execution_receipts prepared
  where prepared.org_id = v_run.org_id
    and prepared.id = p_prepared_receipt_id
    and prepared.run_id = v_run.id
    and prepared.task_id = v_run.task_id
    and prepared.decision_id = v_run.decision_id
    and prepared.receipt_type = 'execution'
    and prepared.status = 'prepared'
    and prepared.action_key = v_run.action_key
    and prepared.target_system = v_run.target_system
    and prepared.actor_kind = v_run.actor_kind
    and prepared.actor_ref = v_run.actor_ref
    and prepared.dot_ref is not distinct from v_run.dot_ref
    and prepared.agent_ref is not distinct from v_run.agent_ref
    and prepared.execution_authority_level = 'L3'
    and prepared.business_risk = v_run.business_risk
    and prepared.correlation_id = v_run.correlation_id
    and prepared.trace_id is not distinct from v_run.trace_id
    and prepared.idempotency_key = v_run.idempotency_key
    and prepared.integrity_hash = v_payload_hash
    and prepared.desired_state->>'payloadHash' = v_payload_hash
    and prepared.desired_state->>'approvalId' = v_run.safe_metadata->>'approvalId'
    and prepared.desired_state->>'actorId' = v_run.actor_ref
    and (prepared.desired_state->>'approvedAt')::timestamptz =
        (v_run.safe_metadata->>'approvalApprovedAt')::timestamptz
    and (prepared.desired_state->>'expiresAt')::timestamptz =
        (v_run.safe_metadata->>'approvalExpiresAt')::timestamptz
    and (prepared.desired_state->>'decisionRevision')::timestamptz =
        (v_run.safe_metadata->>'decisionRevision')::timestamptz
    and prepared.desired_state->>'approvalReceiptId' = v_run.safe_metadata->>'approvalReceiptId'
    and prepared.desired_state->>'canonicalApprovalId' = v_run.safe_metadata->>'canonicalApprovalId'
    and prepared.executed_state->>'phase' = 'before_provider_dispatch'
    and prepared.executed_state->'providerEffect' = 'false'::jsonb
    and prepared.executed_state->'fencingToken' = to_jsonb(p_expected_fencing_token)
    and prepared.source_receipt_system = 'toro_control_plane'
    and prepared.source_receipt_kind = 'alegra_l3_dispatch_admission'
    and prepared.source_receipt_ref = v_run.safe_metadata->>'canonicalApprovalId'
  for share;

  if not found then
    return null;
  end if;

  if jsonb_typeof(v_prepared.evidence_refs) is distinct from 'array'
     or jsonb_array_length(v_prepared.evidence_refs) = 0
     or exists (
       select 1
       from jsonb_array_elements(v_prepared.evidence_refs) evidence(value)
       where jsonb_typeof(evidence.value) <> 'string'
          or btrim(evidence.value #>> '{}') = ''
     ) then
    return null;
  end if;

  v_observed_after := jsonb_build_object(
    'version', 'TORO-ALEGRA-WRITER-RECEIPT-v1',
    'idempotencyKey', v_run.idempotency_key,
    'payloadHash', v_payload_hash,
    'approvalId', v_run.safe_metadata->>'approvalId',
    'actorId', v_run.actor_ref,
    'nativeId', null,
    'executionState', 'blocked',
    'verificationState', 'PROVIDER_STATE_UNKNOWN',
    'verified', false,
    'reasons', jsonb_build_array(
      'LEASE_EXPIRED_AFTER_DISPATCH_PROVIDER_STATE_UNKNOWN'
    )
  );
  v_executed_state := jsonb_build_object(
    'phase', 'lease_expired_after_dispatch',
    'providerEffect', 'unknown',
    'expiredFencingToken', p_expected_fencing_token
  );

  select coalesce(jsonb_agg(to_jsonb(canonical_ref) order by canonical_ref), '[]'::jsonb)
    into v_evidence_refs
  from (
    select distinct evidence.value #>> '{}' as canonical_ref
    from jsonb_array_elements(
      v_prepared.evidence_refs || jsonb_build_array(
        'toro-execution-receipt:' || p_prepared_receipt_id::text
      )
    ) evidence(value)
  ) normalized_recovery_evidence;

  select *
    into v_existing
  from public.toro_execution_receipts receipt
  where receipt.org_id = v_run.org_id
    and receipt.idempotency_key = v_receipt_key
  for share;

  if v_is_replay then
    if not found
       or v_existing.run_id is distinct from v_run.id
       or v_existing.task_id is distinct from v_run.task_id
       or v_existing.decision_id is distinct from v_run.decision_id
       or v_existing.supersedes_receipt_id is distinct from p_prepared_receipt_id
       or v_existing.receipt_type is distinct from 'execution'
       or v_existing.status is distinct from 'blocked'
       or v_existing.action_key is distinct from v_run.action_key
       or v_existing.target_system is distinct from v_run.target_system
       or v_existing.external_reference is not null
       or v_existing.actor_kind is distinct from v_run.actor_kind
       or v_existing.actor_ref is distinct from v_run.actor_ref
       or v_existing.dot_ref is distinct from v_run.dot_ref
       or v_existing.agent_ref is distinct from v_run.agent_ref
       or v_existing.execution_authority_level is distinct from 'L3'
       or v_existing.business_risk is distinct from v_run.business_risk
       or v_existing.correlation_id is distinct from v_run.correlation_id
       or v_existing.trace_id is distinct from v_run.trace_id
       or v_existing.desired_state is distinct from v_prepared.desired_state
       or v_existing.executed_state is distinct from v_executed_state
       or v_existing.observed_after is distinct from v_observed_after
       or v_existing.verification_method is not null
       or v_existing.verification_status is distinct from 'partial'
       or v_existing.evidence_refs is distinct from v_evidence_refs
       or v_existing.source_receipt_system is distinct from 'toro_control_plane'
       or v_existing.source_receipt_kind is distinct from 'alegra_l3_expired_lease_recovery'
       or v_existing.source_receipt_ref is distinct from p_prepared_receipt_id::text
       or v_existing.integrity_hash is distinct from v_payload_hash
       or v_existing.error_class is distinct from 'ALEGRA_PROVIDER_STATE_UNKNOWN'
       or v_existing.error_redacted is not null
       or v_run.safe_metadata->>'recoveryReceiptId' is distinct from v_existing.id::text then
      return null;
    end if;

    return jsonb_build_object(
      'runId', v_run.id,
      'finalReceiptId', v_existing.id,
      'fencingToken', v_run.fencing_token,
      'runStatus', 'blocked',
      'verificationStatus', 'partial',
      'providerState', 'PROVIDER_STATE_UNKNOWN',
      'replayed', true
    );
  end if;

  if found then
    return null;
  end if;

  insert into public.toro_execution_receipts (
    org_id, run_id, task_id, decision_id, supersedes_receipt_id,
    receipt_type, status, action_key, target_system, external_reference,
    actor_kind, actor_ref, dot_ref, agent_ref, execution_authority_level,
    business_risk, correlation_id, trace_id, idempotency_key, desired_state,
    executed_state, observed_after, verification_method,
    verification_status, evidence_refs, source_receipt_system,
    source_receipt_kind, source_receipt_ref, integrity_hash, error_class,
    error_redacted
  ) values (
    v_run.org_id, v_run.id, v_run.task_id, v_run.decision_id,
    p_prepared_receipt_id, 'execution', 'blocked', v_run.action_key,
    v_run.target_system, null, v_run.actor_kind, v_run.actor_ref,
    v_run.dot_ref, v_run.agent_ref, 'L3', v_run.business_risk,
    v_run.correlation_id, v_run.trace_id, v_receipt_key,
    v_prepared.desired_state, v_executed_state, v_observed_after, null,
    'partial', v_evidence_refs, 'toro_control_plane',
    'alegra_l3_expired_lease_recovery', p_prepared_receipt_id::text,
    v_payload_hash, 'ALEGRA_PROVIDER_STATE_UNKNOWN', null
  )
  returning id into v_receipt_id;

  update public.toro_execution_runs r
     set status = 'blocked',
         verification_status = 'partial',
         verifying_at = coalesce(r.verifying_at, v_recovered_at),
         finished_at = coalesce(r.finished_at, v_recovered_at),
         lease_owner = null,
         lease_expires_at = null,
         fencing_token = v_new_fencing_token,
         error_class = 'ALEGRA_PROVIDER_STATE_UNKNOWN',
         error_redacted = null,
         safe_metadata = r.safe_metadata || jsonb_build_object(
           'approvalBindingState', 'recovery_blocked',
           'preparedReceiptId', p_prepared_receipt_id::text,
           'recoveryReceiptId', v_receipt_id::text,
           'finalReceiptId', v_receipt_id::text,
           'recoveryState', 'PROVIDER_STATE_UNKNOWN',
           'recoveredByWorkerId', p_recovery_worker_id,
           'recoveredAt', v_recovered_at,
           'recoveredFromFencingToken', p_expected_fencing_token,
           'recoveryFencingToken', v_new_fencing_token
         ),
         updated_at = v_recovered_at
   where r.org_id = v_run.org_id
     and r.id = v_run.id
     and r.fencing_token = p_expected_fencing_token
     and r.status in ('running','verifying')
     and r.lease_owner = r.safe_metadata->>'dispatchWorkerId'
     and r.lease_expires_at is not null
     and r.lease_expires_at <= v_recovered_at
     and r.safe_metadata->>'approvalBindingState' = 'admitted'
     and r.safe_metadata->>'preparedReceiptId' = p_prepared_receipt_id::text;

  if not found then
    raise exception 'alegra_expired_lease_recovery_state_changed';
  end if;

  return jsonb_build_object(
    'runId', v_run.id,
    'finalReceiptId', v_receipt_id,
    'fencingToken', v_new_fencing_token,
    'runStatus', 'blocked',
    'verificationStatus', 'partial',
    'providerState', 'PROVIDER_STATE_UNKNOWN',
    'replayed', false
  );
end;
$$;

revoke all on function public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)
  from public;
revoke all on function public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)
  from anon;
revoke all on function public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)
  from authenticated;
revoke all on function public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)
  from service_role;

comment on function public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid) is
  'Draft-only idempotent recovery for an expired admitted Alegra L3 lease. It never invokes the provider or retries creation; it fences the stale worker, records PROVIDER_STATE_UNKNOWN, and blocks the run for reconciliation atomically.';

-- Post-create owner/security preflight for every L3 function. The draft grants
-- none of them, including trigger functions. A separately reviewed activation
-- may grant the operational RPCs only to the dedicated no-DML Writer role and
-- the revoker only to authenticated owner sessions; never grant the revoker to
-- the Writer or service_role. Checking the complete ACL prevents a residual
-- grant to an unrelated role from surviving CREATE OR REPLACE.
do $$
declare
  v_function regprocedure;
  v_security_definer boolean;
begin
  for v_function, v_security_definer in
    select expected.function_oid, expected.security_definer
    from (values
      (
        to_regprocedure('public.toro_prevent_alegra_l3_owner_approval_mutation_v1()'),
        false
      ),
      (
        to_regprocedure('public.toro_capture_alegra_l3_owner_approval_v1()'),
        true
      ),
      (
        to_regprocedure('public.toro_guard_alegra_l3_approval_receipt_v1()'),
        true
      ),
      (
        to_regprocedure('public.toro_guard_alegra_l3_run_admission_v1()'),
        true
      ),
      (
        to_regprocedure('public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid)'),
        true
      ),
      (
        to_regprocedure('public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)'),
        true
      ),
      (
        to_regprocedure('public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)'),
        true
      ),
      (
        to_regprocedure('public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)'),
        true
      ),
      (
        to_regprocedure('public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)'),
        true
      )
    ) expected(function_oid, security_definer)
  loop
    if v_function is null or not exists (
      select 1
      from pg_catalog.pg_proc p
      where p.oid = v_function
        and p.prosecdef = v_security_definer
        and pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
        and coalesce(p.proconfig, '{}'::text[]) @> array['search_path=""']::text[]
        and not pg_catalog.has_function_privilege('public', p.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
        and not pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
        and (
          select count(*) = 1
            and pg_catalog.bool_and(
              privilege.grantee = p.proowner
              and privilege.privilege_type = 'EXECUTE'
              and privilege.grantor = p.proowner
              and not privilege.is_grantable
            )
          from pg_catalog.aclexplode(
            coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
          ) privilege
        )
    ) then
      raise exception 'alegra_l3_callable_function_security_drifted:%', v_function;
    end if;
  end loop;
end;
$$;

-- The legacy worker RPCs remain available for L0-L2 only. Without these
-- predicates, an admitted L3 Writer run could bypass the prepared receipt and
-- atomic finalizer by taking the generic transition/completion path.
create or replace function public.toro_transition_execution_run_v1(
  p_run_id uuid,
  p_worker_id text,
  p_fencing_token bigint,
  p_expected_status text,
  p_next_status text,
  p_verification_status text default null,
  p_error_class text default null,
  p_error_redacted text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer;
  v_transition_allowed boolean := false;
begin
  v_transition_allowed :=
    (p_expected_status = 'claimed' and p_next_status in ('running','blocked','failed','cancelled'))
    or (p_expected_status = 'running' and p_next_status in ('verifying','blocked','failed','cancelled'))
    or (p_expected_status = 'verifying' and p_next_status in ('succeeded','blocked','failed','cancelled'));

  if not v_transition_allowed then
    raise exception 'invalid_execution_transition';
  end if;

  update public.toro_execution_runs r
     set status = p_next_status,
         verification_status = coalesce(p_verification_status, r.verification_status),
         verifying_at = case
           when p_next_status = 'verifying' then coalesce(r.verifying_at, now())
           else r.verifying_at
         end,
         finished_at = case
           when p_next_status in ('succeeded','blocked','cancelled')
             then coalesce(r.finished_at, now())
           else r.finished_at
         end,
         error_class = p_error_class,
         error_redacted = p_error_redacted,
         lease_owner = case
           when p_next_status in ('succeeded','blocked','failed','cancelled')
             then null
           else r.lease_owner
         end,
         lease_expires_at = case
           when p_next_status in ('succeeded','blocked','failed','cancelled')
             then null
           else r.lease_expires_at
         end,
         updated_at = now()
   where r.id = p_run_id
     and r.lease_owner = p_worker_id
     and r.fencing_token = p_fencing_token
     and r.status = p_expected_status
     and r.lease_expires_at > now()
     and r.execution_authority_level in ('L0','L1','L2');

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.toro_complete_execution_run_v1(
  p_run_id uuid,
  p_worker_id text,
  p_fencing_token bigint,
  p_receipt jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_run public.toro_execution_runs%rowtype;
  v_receipt_id uuid;
  v_evidence_refs jsonb;
begin
  select *
    into v_run
  from public.toro_execution_runs r
  where r.id = p_run_id
    and r.status = 'verifying'
    and r.lease_owner = p_worker_id
    and r.fencing_token = p_fencing_token
    and r.lease_expires_at > now()
  for update;

  if not found then
    return null;
  end if;

  if v_run.execution_authority_level not in ('L0','L1','L2') then
    raise exception 'prohibited_execution_authority';
  end if;

  if jsonb_typeof(coalesce(p_receipt->'evidence_refs','[]'::jsonb)) <> 'array' then
    raise exception 'evidence_refs_must_be_array';
  end if;

  v_evidence_refs := coalesce(p_receipt->'evidence_refs','[]'::jsonb);

  insert into public.toro_execution_receipts (
    org_id,
    run_id,
    task_id,
    decision_id,
    receipt_type,
    status,
    action_key,
    target_system,
    external_reference,
    actor_kind,
    actor_ref,
    dot_ref,
    agent_ref,
    execution_authority_level,
    business_risk,
    correlation_id,
    trace_id,
    idempotency_key,
    desired_state,
    observed_before,
    executed_state,
    observed_after,
    verification_method,
    verification_status,
    evidence_refs,
    source_receipt_system,
    source_receipt_kind,
    source_receipt_ref,
    integrity_hash,
    error_class,
    error_redacted
  ) values (
    v_run.org_id,
    v_run.id,
    v_run.task_id,
    v_run.decision_id,
    'verification',
    'verified',
    v_run.action_key,
    v_run.target_system,
    nullif(p_receipt->>'external_reference',''),
    v_run.actor_kind,
    v_run.actor_ref,
    v_run.dot_ref,
    v_run.agent_ref,
    v_run.execution_authority_level,
    v_run.business_risk,
    v_run.correlation_id,
    v_run.trace_id,
    v_run.idempotency_key || ':verification',
    p_receipt->'desired_state',
    p_receipt->'observed_before',
    p_receipt->'executed_state',
    p_receipt->'observed_after',
    nullif(p_receipt->>'verification_method',''),
    'passed',
    v_evidence_refs,
    nullif(p_receipt->>'source_receipt_system',''),
    nullif(p_receipt->>'source_receipt_kind',''),
    nullif(p_receipt->>'source_receipt_ref',''),
    nullif(p_receipt->>'integrity_hash',''),
    null,
    null
  )
  returning id into v_receipt_id;

  update public.toro_execution_runs r
     set status = 'succeeded',
         verification_status = 'passed',
         finished_at = coalesce(r.finished_at, now()),
         lease_owner = null,
         lease_expires_at = null,
         error_class = null,
         error_redacted = null,
         updated_at = now()
   where r.id = v_run.id
     and r.status = 'verifying'
     and r.lease_owner = p_worker_id
     and r.fencing_token = p_fencing_token;

  if not found then
    raise exception 'completion_state_changed';
  end if;

  return v_receipt_id;
end;
$$;

-- Persist the exact post-forward function hashes in comments. CREATE OR
-- REPLACE preserves comments, so a later body change causes rollback to fail
-- closed instead of overwriting a newer migration. This avoids guessing a
-- pg_get_functiondef hash before the draft has compiled on the target version.
do $$
declare
  v_transition regprocedure := to_regprocedure(
    'public.toro_transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text)'
  );
  v_complete regprocedure := to_regprocedure(
    'public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb)'
  );
begin
  if v_transition is null or v_complete is null then
    raise exception 'alegra_l3_post_forward_rpc_missing';
  end if;

  execute format(
    'comment on function public.toro_transition_execution_run_v1(uuid,text,bigint,text,text,text,text,text) is %L',
    'Generic worker transition RPC. Alegra Writer L3 runs must use the dedicated atomic finalizer and are rejected here. TORO_ALEGRA_L3_V1_ROLLBACK_MD5=' ||
      md5(pg_catalog.pg_get_functiondef(v_transition))
  );

  execute format(
    'comment on function public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb) is %L',
    'Generic L0-L2 completion RPC. Alegra Writer L3 runs must use toro_finalize_alegra_execution_v1. TORO_ALEGRA_L3_V1_ROLLBACK_MD5=' ||
      md5(pg_catalog.pg_get_functiondef(v_complete))
  );
end;
$$;

commit;
