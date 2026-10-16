\set ON_ERROR_STOP on

do $$
declare
  v_expected public.alegra_l3_rollback_test_context%rowtype;
  v_actual_rows bigint;
  v_fingerprint text;
  v_function regprocedure;
  v_expected_md5 text;
begin
  select *
    into strict v_expected
  from public.alegra_l3_rollback_test_context
  where singleton;

  select count(*),
         md5(coalesce(jsonb_agg(to_jsonb(approval) order by approval.id)::text, '[]'))
    into v_actual_rows, v_fingerprint
  from public.toro_alegra_l3_owner_approvals approval;

  if v_actual_rows <> v_expected.ledger_row_count
     or v_fingerprint is distinct from v_expected.ledger_fingerprint then
    raise exception
      'rollback_changed_immutable_ledger:expected=%,actual=%',
      v_expected.ledger_row_count,
      v_actual_rows;
  end if;

  if to_regprocedure('public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid)') is not null
     or to_regprocedure('public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid,text)') is not null
     or to_regprocedure('public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)') is not null
     or to_regprocedure('public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)') is not null
     or to_regprocedure('public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)') is not null
     or to_regprocedure('public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)') is not null
     or to_regprocedure('public.toro_guard_alegra_l3_run_admission_v1()') is not null
     or to_regprocedure('public.toro_guard_alegra_l3_approval_receipt_v1()') is not null
     or to_regprocedure('public.toro_capture_alegra_l3_owner_approval_v1()') is not null then
    raise exception 'rollback_left_l3_operational_function';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_trigger trigger_row
    where trigger_row.tgname in (
      'toro_capture_alegra_l3_owner_approval',
      'toro_guard_alegra_l3_run_admission',
      'toro_guard_alegra_l3_approval_receipt'
    )
      and not trigger_row.tgisinternal
  ) then
    raise exception 'rollback_left_l3_operational_trigger';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = 'public.toro_alegra_l3_owner_approvals'::regclass
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
    raise exception 'rollback_ledger_security_not_retained';
  end if;

  if to_regprocedure('public.toro_prevent_alegra_l3_owner_approval_mutation_v1()') is null
     or not exists (
       select 1
       from pg_catalog.pg_proc function_row
       where function_row.oid =
             'public.toro_prevent_alegra_l3_owner_approval_mutation_v1()'::regprocedure
         and not function_row.prosecdef
         and pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
         and coalesce(function_row.proconfig, '{}'::text[])
               @> array['search_path=""']::text[]
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
     )
     or not exists (
       select 1
       from pg_catalog.pg_trigger trigger_row
       where trigger_row.tgrelid = 'public.toro_alegra_l3_owner_approvals'::regclass
         and trigger_row.tgname = 'toro_prevent_alegra_l3_owner_approval_mutation'
         and not trigger_row.tgisinternal
         and trigger_row.tgenabled = 'O'
         and position('BEFORE UPDATE OR DELETE' in pg_catalog.pg_get_triggerdef(trigger_row.oid)) > 0
     ) then
    raise exception 'rollback_ledger_immutability_not_retained';
  end if;

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
    ) expected(function_oid, definition_md5)
  loop
    if v_function is null
       or md5(pg_catalog.pg_get_functiondef(v_function)) <> v_expected_md5
       or not pg_catalog.has_function_privilege('service_role', v_function, 'EXECUTE')
       or pg_catalog.has_function_privilege('public', v_function, 'EXECUTE')
       or pg_catalog.has_function_privilege('anon', v_function, 'EXECUTE')
       or pg_catalog.has_function_privilege('authenticated', v_function, 'EXECUTE')
       or not exists (
         select 1
         from pg_catalog.pg_proc function_row
         where function_row.oid = v_function
           and not function_row.prosecdef
           and pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
           and coalesce(function_row.proconfig, '{}'::text[])
                 @> array['search_path=""']::text[]
           and (
             select count(*) = 2
               and count(*) filter (
                 where privilege.grantee = function_row.proowner
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
       ) then
      raise exception 'rollback_generic_rpc_not_restored:%', v_function;
    end if;
  end loop;

  begin
    update public.toro_alegra_l3_owner_approvals
       set approval_id = approval_id || '-forbidden'
     where id = (
       select id
       from public.toro_alegra_l3_owner_approvals
       order by id
       limit 1
     );
    raise exception 'rollback_ledger_update_was_allowed';
  exception
    when others then
      if sqlerrm <> 'alegra_l3_owner_approval_is_immutable' then
        raise;
      end if;
  end;

  begin
    delete from public.toro_alegra_l3_owner_approvals
     where id = (
       select id
       from public.toro_alegra_l3_owner_approvals
       order by id
       limit 1
     );
    raise exception 'rollback_ledger_delete_was_allowed';
  exception
    when others then
      if sqlerrm <> 'alegra_l3_owner_approval_is_immutable' then
        raise;
      end if;
  end;
end;
$$;
