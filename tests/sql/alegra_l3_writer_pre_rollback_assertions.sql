\set ON_ERROR_STOP on

-- Capture immutable evidence immediately before rollback so the post-rollback
-- and reapply checks compare the exact same historical rows.
create table public.alegra_l3_rollback_test_context (
  singleton boolean primary key check (singleton),
  ledger_row_count bigint not null,
  ledger_fingerprint text not null check (ledger_fingerprint ~ '^[0-9a-f]{32}$')
);

do $$
declare
  v_expected_rows bigint;
  v_actual_rows bigint;
  v_fingerprint text;
begin
  if exists (
    select 1
    from public.toro_execution_runs run
    where run.target_system = 'alegra'
      and run.action_key = 'alegra_create_purchase_bill'
      and run.execution_authority_level = 'L3'
      and (
        run.status in ('running', 'verifying')
        or run.safe_metadata->>'approvalBindingState' in ('approved', 'admitted')
      )
  ) then
    raise exception 'pre_rollback_active_authority_or_execution';
  end if;

  select count(*)
    into v_expected_rows
  from public.alegra_l3_test_context;

  select count(*),
         md5(coalesce(jsonb_agg(to_jsonb(approval) order by approval.id)::text, '[]'))
    into v_actual_rows, v_fingerprint
  from public.toro_alegra_l3_owner_approvals approval;

  if v_expected_rows <> 10
     or v_actual_rows <> v_expected_rows
     or exists (
       select 1
       from public.alegra_l3_test_context context_row
       left join public.toro_alegra_l3_owner_approvals approval
         on approval.run_id = context_row.run_id
        and approval.approval_id = context_row.approval_id
       where approval.id is null
     ) then
    raise exception
      'pre_rollback_ledger_set_incomplete:expected=%,actual=%',
      v_expected_rows,
      v_actual_rows;
  end if;

  insert into public.alegra_l3_rollback_test_context (
    singleton,
    ledger_row_count,
    ledger_fingerprint
  ) values (
    true,
    v_actual_rows,
    v_fingerprint
  );
end;
$$;
