\set ON_ERROR_STOP on

do $$
declare
  v_expected public.alegra_l3_rollback_test_context%rowtype;
  v_actual_rows bigint;
  v_fingerprint text;
  v_function regprocedure;
  v_security_definer boolean;
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
      'reapply_changed_immutable_ledger:expected=%,actual=%',
      v_expected.ledger_row_count,
      v_actual_rows;
  end if;

  for v_function, v_security_definer in
    select expected.function_oid, expected.security_definer
    from (values
      (to_regprocedure('public.toro_prevent_alegra_l3_owner_approval_mutation_v1()'), false),
      (to_regprocedure('public.toro_capture_alegra_l3_owner_approval_v1()'), true),
      (to_regprocedure('public.toro_guard_alegra_l3_approval_receipt_v1()'), true),
      (to_regprocedure('public.toro_guard_alegra_l3_run_admission_v1()'), true),
      (to_regprocedure('public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid)'), true),
      (to_regprocedure('public.toro_admit_approved_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,text,timestamptz,timestamptz,text,text,integer)'), true),
      (to_regprocedure('public.toro_finalize_alegra_execution_v1(uuid,uuid,text,bigint,uuid,text,jsonb)'), true),
      (to_regprocedure('public.toro_heartbeat_alegra_execution_v1(uuid,uuid,text,bigint,uuid,integer)'), true),
      (to_regprocedure('public.toro_recover_expired_alegra_execution_v1(uuid,uuid,text,bigint,uuid)'), true)
    ) expected(function_oid, security_definer)
  loop
    if v_function is null or not exists (
      select 1
      from pg_catalog.pg_proc function_row
      where function_row.oid = v_function
        and function_row.prosecdef = v_security_definer
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
    ) then
      raise exception 'reapply_l3_operational_function_invalid:%', v_function;
    end if;
  end loop;

  if to_regprocedure(
       'public.toro_revoke_alegra_execution_authority_v1(uuid,uuid,uuid,text)'
     ) is not null then
    raise exception 'reapply_restored_legacy_revoker_overload';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_trigger trigger_row
    where trigger_row.tgname in (
      'toro_capture_alegra_l3_owner_approval',
      'toro_guard_alegra_l3_run_admission',
      'toro_guard_alegra_l3_approval_receipt'
    )
      and not trigger_row.tgisinternal
      and trigger_row.tgenabled = 'O'
  ) <> 3 then
    raise exception 'reapply_l3_operational_triggers_missing';
  end if;

  if to_regprocedure('public.toro_prevent_alegra_l3_owner_approval_mutation_v1()') is null
     or not exists (
       select 1
       from pg_catalog.pg_trigger trigger_row
       where trigger_row.tgrelid = 'public.toro_alegra_l3_owner_approvals'::regclass
         and trigger_row.tgname = 'toro_prevent_alegra_l3_owner_approval_mutation'
         and not trigger_row.tgisinternal
         and trigger_row.tgenabled = 'O'
     ) then
    raise exception 'reapply_ledger_immutability_missing';
  end if;

  begin
    update public.toro_alegra_l3_owner_approvals
       set approval_id = approval_id || '-forbidden'
     where id = (
       select id
       from public.toro_alegra_l3_owner_approvals
       order by id
       limit 1
     );
    raise exception 'reapply_ledger_update_was_allowed';
  exception
    when others then
      if sqlerrm <> 'alegra_l3_owner_approval_is_immutable' then
        raise;
      end if;
  end;
end;
$$;
