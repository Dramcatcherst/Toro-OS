-- Generated TORO R1-A guarded recovery.
-- Refuses recovery when the task no longer matches the exact R1 post-state/audit receipt.
begin;
do $r1_recovery_1$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'f2763b6e-6b9d-48d3-b91c-04f613c0213b'::uuid
    and t.task_key = 'critical_hotel_ops_safety_reverification_2026_09'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for critical_hotel_ops_safety_reverification_2026_09';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for critical_hotel_ops_safety_reverification_2026_09',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_1$;
do $r1_recovery_2$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'e514137d-a84b-42fc-b2a1-5e81cc3b4f0f'::uuid
    and t.task_key = 'task-dc-electrical-assessment-20260810'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for task-dc-electrical-assessment-20260810';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for task-dc-electrical-assessment-20260810',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_2$;
do $r1_recovery_3$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '4319a7a7-c2df-4c96-a6d2-a863436e549a'::uuid
    and t.task_key = 'task-dc-security-readiness-20260810'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for task-dc-security-readiness-20260810';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for task-dc-security-readiness-20260810',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_3$;
do $r1_recovery_4$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '35fd3dc7-acd5-4fb3-bcd9-86f1f286404c'::uuid
    and t.task_key = 'DC2-022'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-022';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for DC2-022',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_4$;
do $r1_recovery_5$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '1f7142ed-ebaf-40ee-8b46-62f09e3759c6'::uuid
    and t.task_key = 'finance_accounting_reset_2026_09_15'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for finance_accounting_reset_2026_09_15';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for finance_accounting_reset_2026_09_15',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_5$;
do $r1_recovery_6$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'daea4390-774a-4a77-bf67-7821842157bd'::uuid
    and t.task_key = 'finish_google_ads_new_account_setup'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for finish_google_ads_new_account_setup';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for finish_google_ads_new_account_setup',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_6$;
do $r1_recovery_7$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'f274911f-08e5-4baa-8c29-e17cdda69e81'::uuid
    and t.task_key = 'fix_google_ads_booking_conversion_tracking'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for fix_google_ads_booking_conversion_tracking';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for fix_google_ads_booking_conversion_tracking',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_7$;
do $r1_recovery_8$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '671d3866-1cd8-421b-a94f-082de2f6dfff'::uuid
    and t.task_key = 'google_ads_results_to_toro_os_v2'
    and needs_revalidation = false
    and status is not distinct from 'blocked'
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for google_ads_results_to_toro_os_v2';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition REWRITE for google_ads_results_to_toro_os_v2',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_8$;
do $r1_recovery_9$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '96e0893c-357e-46a0-9571-b9b6114ff73d'::uuid
    and t.task_key = 'ticos_live_terms_verification_2026_09'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for ticos_live_terms_verification_2026_09';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for ticos_live_terms_verification_2026_09',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_9$;
do $r1_recovery_10$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '207e2c88-4e79-45ff-bd7d-303cd117bfd7'::uuid
    and t.task_key = 'WA-ADMIN-P0-BOOKING-KYP-20260810'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for WA-ADMIN-P0-BOOKING-KYP-20260810';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for WA-ADMIN-P0-BOOKING-KYP-20260810',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_10$;
do $r1_recovery_11$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '42dd4306-4901-42e1-9f0a-9b01042e4b95'::uuid
    and t.task_key = 'wespeak_crm_reactivation_attribution_20260826'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for wespeak_crm_reactivation_attribution_20260826';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for wespeak_crm_reactivation_attribution_20260826',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_11$;
do $r1_recovery_12$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '2ecbad3e-6d99-4888-af63-8b5b510d2d48'::uuid
    and t.task_key = 'toro_surface_capability_parity_20260922'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for toro_surface_capability_parity_20260922';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for toro_surface_capability_parity_20260922',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_12$;
do $r1_recovery_13$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '567c455b-9ccb-4721-be2e-54e7a882ec41'::uuid
    and t.task_key = 'decommission_residual_airtable_estate_phase2'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for decommission_residual_airtable_estate_phase2';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for decommission_residual_airtable_estate_phase2',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_13$;
do $r1_recovery_14$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '339e81e9-982c-4419-b57d-ce8cca43f6b3'::uuid
    and t.task_key = 'legacy_task_rec8Qj1aPRrhgQEms'
    and needs_revalidation = false
    and status is not distinct from 'blocked'
    and blocking_reason is not distinct from 'Owner approval exists for a Kross-only USD20/night pet-fee change, but execution remains blocked on authenticated Kross live access, capture of the current live rule/version and rollback, Admin/Reception activation signoff, checkout QA, and read-only verification that WeSpeak reflects the integrated value. Do not edit WeSpeak manually or modify existing reservations automatically.'
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for legacy_task_rec8Qj1aPRrhgQEms';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    blocking_reason = 'P1: Mauricio approval is recorded for a Kross-only change request to USD20/night; WeSpeak must remain frozen/manual-edit forbidden. Remaining blockers: authenticated Kross live access; capture current live rule/version and rollback; Admin/Reception signoff for activation; checkout QA plus read-only verification that WeSpeak reflects the integrated value. Do not modify existing reservations automatically. If WeSpeak does not reflect Kross automatically, stop and report without editing WeSpeak.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition REWRITE for legacy_task_rec8Qj1aPRrhgQEms',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_14$;
do $r1_recovery_15$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '84e8fdea-f0b8-4fde-a011-7f6ebe7a0e61'::uuid
    and t.task_key = 'toro_auth_pilot_decommission_gate_2026_09'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for toro_auth_pilot_decommission_gate_2026_09';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for toro_auth_pilot_decommission_gate_2026_09',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_15$;
do $r1_recovery_16$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '1be1c7b3-26ff-4586-be04-0c4cdf613d1f'::uuid
    and t.task_key = 'DC2-045'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-045';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for DC2-045',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_16$;
do $r1_recovery_17$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'e1d738e0-4e7a-4d9b-9d9b-153473114884'::uuid
    and t.task_key = 'dreamteam_extra_task_points_design_20260922'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for dreamteam_extra_task_points_design_20260922';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for dreamteam_extra_task_points_design_20260922',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_17$;
do $r1_recovery_18$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '78a03d64-dcc0-4d69-9c45-4a67eae2264a'::uuid
    and t.task_key = 'fnb_october_kitchen_handoff_2026_09'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for fnb_october_kitchen_handoff_2026_09';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for fnb_october_kitchen_handoff_2026_09',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_18$;
do $r1_recovery_19$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '3e0e8543-e1bc-4c2d-a371-291206ecf19c'::uuid
    and t.task_key = 'task-dc-jacuzzi-mapping-20260810'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for task-dc-jacuzzi-mapping-20260810';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for task-dc-jacuzzi-mapping-20260810',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_19$;
do $r1_recovery_20$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '328dd9da-0ec8-4cbe-bcc3-5799d46ff034'::uuid
    and t.task_key = 'task-laundry-safety-startup-20260918'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for task-laundry-safety-startup-20260918';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for task-laundry-safety-startup-20260918',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_20$;
do $r1_recovery_21$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'f4757acd-e6a3-4c3b-a0e5-f18f498f7693'::uuid
    and t.task_key = 'toro_ops_staff_identity_onboarding_20260919'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for toro_ops_staff_identity_onboarding_20260919';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for toro_ops_staff_identity_onboarding_20260919',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_21$;
do $r1_recovery_22$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'b3476ed9-0887-438c-ab50-b491a6a8ad99'::uuid
    and t.task_key = 'WA-ADMIN-P1-DECK-TECH-REVIEW-20260810'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for WA-ADMIN-P1-DECK-TECH-REVIEW-20260810';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for WA-ADMIN-P1-DECK-TECH-REVIEW-20260810',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_22$;
do $r1_recovery_23$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'e790e0ea-d3a9-4878-bdc4-cb9efa875496'::uuid
    and t.task_key = 'connect_search_console_and_submit_sitemap'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for connect_search_console_and_submit_sitemap';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for connect_search_console_and_submit_sitemap',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_23$;
do $r1_recovery_24$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '97c9a2d3-455e-42e6-b9a8-670ede1cd554'::uuid
    and t.task_key = 'DC2-028'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-028';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for DC2-028',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_24$;
do $r1_recovery_25$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'd7e40354-f870-44d5-b6ce-ba3165a3a028'::uuid
    and t.task_key = 'DC2-030'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-030';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'blocked',
    active = true,
    completion_notes = 'Migrated from active unique Airtable task on 2026-09-19; source preserved and semantic duplication checked before migration.
19/09/2026 verification: PR #68 head 24826a77... remains draft/open/mergeable; Vercel preview is READY; GitHub workflow "Preview quality gates" run 35318802201 completed SUCCESS. The accessibility slice (single semantic main landmark, skip-link keyboard focus, governed 3px focus-visible outline) is verified in preview. Production remains untouched and DC2-030 stays in_progress because release/performance gates are separate.
DC2-030-20260921: stale PR68 intent was rebased onto current foundation fef6c735... in draft PR #71, branch codex/a11y-current-baseline-20260921. TDD contract added first; implementation moves skip target to each semantic page-shell main, preserves one main landmark, and governs 3px keyboard focus visibility. Current PR head e072db3c... is mergeable and remains draft/preview-only. Preview quality gates run 35571329293 started and is still in_progress at last check; therefore QA is not yet claimed complete. Production untouched.
AUDIT-R10-20260922: status normalizado de in_progress a blocked porque el propio execution_condition/blocking_reason exige gate/evidencia externa o consume evidencia de otro executor. No implica cierre, despriorización ni cambio de owner/due_date.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition MERGE for DC2-030',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_25$;
do $r1_recovery_26$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'ff79338a-be14-4810-85fc-10f469eea8e4'::uuid
    and t.task_key = 'MEDIA-KROSS-RECONCILE-22-UNITS-20260903'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for MEDIA-KROSS-RECONCILE-22-UNITS-20260903';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for MEDIA-KROSS-RECONCILE-22-UNITS-20260903',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_26$;
do $r1_recovery_27$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'b7de6e88-84f5-4492-bec8-2033148d6521'::uuid
    and t.task_key = 'dc_yoy_2025_2026_reconcile_sources'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for dc_yoy_2025_2026_reconcile_sources';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for dc_yoy_2025_2026_reconcile_sources',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_27$;
do $r1_recovery_28$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '73c73552-feef-4643-83c9-09c3ae2be042'::uuid
    and t.task_key = 'DROPBOX-P1-RECURRING-PAYMENTS-RECON-20260810'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DROPBOX-P1-RECURRING-PAYMENTS-RECON-20260810';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for DROPBOX-P1-RECURRING-PAYMENTS-RECON-20260810',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_28$;
do $r1_recovery_29$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '0d03aa3f-ff02-45d6-a70f-4f79dc18a733'::uuid
    and t.task_key = 'fnb_settlement_invoicing_sop_2026_09'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for fnb_settlement_invoicing_sop_2026_09';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for fnb_settlement_invoicing_sop_2026_09',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_29$;
do $r1_recovery_30$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'eff7627c-db3d-4534-a233-d86ba848b668'::uuid
    and t.task_key = 'dc_revenue_june_channel_2026_diagnostic'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for dc_revenue_june_channel_2026_diagnostic';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for dc_revenue_june_channel_2026_diagnostic',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_30$;
do $r1_recovery_31$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'fbd447d1-f10e-413b-a151-651784ae6f28'::uuid
    and t.task_key = 'fnb_costing_complete_2026_09'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for fnb_costing_complete_2026_09';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for fnb_costing_complete_2026_09',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_31$;
do $r1_recovery_32$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '6f0a92a7-349c-409e-82a9-092ef6036970'::uuid
    and t.task_key = 'start_post_launch_content_cadence_for_priority_clusters'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for start_post_launch_content_cadence_for_priority_clusters';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P1 NEXT classification 2026-09-19 = MIGRAR. Unique future work preserved as canonical backlog; no new project and no live action authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for start_post_launch_content_cadence_for_priority_clusters',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_32$;
do $r1_recovery_33$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '2da11573-db9c-4d44-8a68-c0874667c7ce'::uuid
    and t.task_key = 'wespeak_weekly_conversation_qa'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for wespeak_weekly_conversation_qa';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for wespeak_weekly_conversation_qa',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_33$;
do $r1_recovery_34$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '0b5f39f4-7aa1-462c-b2d4-4c8209e11943'::uuid
    and t.task_key = 'dreamcatcher_autonomy_acceptance_2027_01'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for dreamcatcher_autonomy_acceptance_2027_01';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for dreamcatcher_autonomy_acceptance_2027_01',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_34$;
do $r1_recovery_35$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '9023b678-5e2c-46fa-b945-a701a42de359'::uuid
    and t.task_key = 'dreamcatcher_autonomy_baseline_2026_09'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for dreamcatcher_autonomy_baseline_2026_09';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for dreamcatcher_autonomy_baseline_2026_09',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_35$;
do $r1_recovery_36$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '48875793-5529-45f5-8dd0-2eed9d4e8809'::uuid
    and t.task_key = 'toro_company_user_portal_contract_20260922'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for toro_company_user_portal_contract_20260922';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for toro_company_user_portal_contract_20260922',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_36$;
do $r1_recovery_37$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '5012fac0-a634-48fb-ac18-5b9721308c30'::uuid
    and t.task_key = 'toro_design_partner_monetization_20260922'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for toro_design_partner_monetization_20260922';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for toro_design_partner_monetization_20260922',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_37$;
do $r1_recovery_38$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '3573ec60-0fea-4e78-861d-e90a86f3126b'::uuid
    and t.task_key = 'DC2-037'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-037';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-037',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_38$;
do $r1_recovery_39$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '99af6e87-0dfa-4c28-a0f3-ad587279e915'::uuid
    and t.task_key = 'DC2-048'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-048';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-048',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_39$;
do $r1_recovery_40$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '7affee16-d4aa-41e3-adbb-536c5c38f773'::uuid
    and t.task_key = 'alexandra_ops_manager_development_20260918'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for alexandra_ops_manager_development_20260918';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for alexandra_ops_manager_development_20260918',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_40$;
do $r1_recovery_41$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'b92fe78d-447f-4efe-b4bd-414c0fe73a8f'::uuid
    and t.task_key = 'DC2-044'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-044';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-044',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_41$;
do $r1_recovery_42$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '79cb650f-f310-4202-87df-e7969b551307'::uuid
    and t.task_key = 'DC2-050'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-050';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-050',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_42$;
do $r1_recovery_43$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '217e7159-b630-41d0-b3eb-5f0a71495568'::uuid
    and t.task_key = 'DC2-055'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-055';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-055',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_43$;
do $r1_recovery_44$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '8364ad99-7f3a-4180-a581-a1221566bfbf'::uuid
    and t.task_key = 'DC2-064'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-064';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-064',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_44$;
do $r1_recovery_45$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '805baee5-0943-47a4-be11-55e1e1e1b7c9'::uuid
    and t.task_key = 'task-dc-wifi-survey-20260810'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for task-dc-wifi-survey-20260810';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for task-dc-wifi-survey-20260810',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_45$;
do $r1_recovery_46$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '43f85647-83e1-4d9c-8ae9-f8b63200edce'::uuid
    and t.task_key = 'DC2-027'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-027';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-027',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_46$;
do $r1_recovery_47$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '71a050f1-acb7-46bc-b423-4b35641a8414'::uuid
    and t.task_key = 'DC2-035'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-035';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-035',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_47$;
do $r1_recovery_48$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'bbf2b3ea-69f6-497c-8dee-37ef4bc767e9'::uuid
    and t.task_key = 'tax-audit-tourism-vat-2019-2023'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for tax-audit-tourism-vat-2019-2023';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for tax-audit-tourism-vat-2019-2023',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_48$;
do $r1_recovery_49$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '5168c5ed-1825-4de7-beec-ec526d0ee622'::uuid
    and t.task_key = 'DC2-063'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-063';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-063',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_49$;
do $r1_recovery_50$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '4c7e812c-d68f-4d28-a18c-51f4ffa4e2c5'::uuid
    and t.task_key = 'DC2-068'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-068';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for DC2-068',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_50$;
do $r1_recovery_51$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '42d95464-c6b2-406b-a362-b5673eae450f'::uuid
    and t.task_key = 'DC2-069'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-069';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-069',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_51$;
do $r1_recovery_52$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'f1bb525e-ac95-469b-abc5-2720417672f7'::uuid
    and t.task_key = 'verify_dreamcatcher_facebook_page_ownership'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for verify_dreamcatcher_facebook_page_ownership';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for verify_dreamcatcher_facebook_page_ownership',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_52$;
do $r1_recovery_53$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '502541b0-eebf-4a6e-a358-e67108172f3d'::uuid
    and t.task_key = 'wespeak_monthly_deep_review'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for wespeak_monthly_deep_review';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for wespeak_monthly_deep_review',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_53$;
do $r1_recovery_54$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'b57a45c2-86f6-4f5a-a9dc-1a6a5ad65ddd'::uuid
    and t.task_key = 'DC2-019'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-019';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-019',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_54$;
do $r1_recovery_55$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '82f06e56-7b45-4a0e-ba4f-025a54d40da0'::uuid
    and t.task_key = 'DC2-070'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for DC2-070';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for DC2-070',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_55$;
do $r1_recovery_56$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '196224e7-45e5-4ea1-9f2c-90ab9a1b95b2'::uuid
    and t.task_key = 'legacy_task_recmYCDbpmMvpHMQo'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for legacy_task_recmYCDbpmMvpHMQo';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P2 NEXT classification 2026-09-19 = MIGRATE_BACKLOG. Unique future work preserved as canonical planned/medium backlog; no live action, purchase, external message, filing, deployment or configuration change authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for legacy_task_recmYCDbpmMvpHMQo',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_56$;
do $r1_recovery_57$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'd52aaebb-4f96-4524-baf7-0524b3fbf892'::uuid
    and t.task_key = 'occ_sep_oct_daily_revenue_dashboard_20260825'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for occ_sep_oct_daily_revenue_dashboard_20260825';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for occ_sep_oct_daily_revenue_dashboard_20260825',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_57$;
do $r1_recovery_58$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'ad46f9e6-c613-45ca-adcc-5a74b3f3fd4d'::uuid
    and t.task_key = 'WA-ADMIN-P2-NETWORK-INVENTORY-20260810'
    and needs_revalidation = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for WA-ADMIN-P2-NETWORK-INVENTORY-20260810';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition KEEP for WA-ADMIN-P2-NETWORK-INVENTORY-20260810',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_58$;
do $r1_recovery_59$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'eb3817a8-3c68-4e19-b89f-4f38ffcf6ab7'::uuid
    and t.task_key = 'confirm_wifi_wording_backup_2026_06_17'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for confirm_wifi_wording_backup_2026_06_17';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P3/INCUBATOR classification 2026-09-19 = MIGRAR_LOW. Preserved as low-priority future decision; no purchase, external action, secret change or production action authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for confirm_wifi_wording_backup_2026_06_17',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_59$;
do $r1_recovery_60$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = 'd9c2f2c6-24f8-47c7-b65c-31981d8563a8'::uuid
    and t.task_key = 'maintenance-projector-auto-off-mauricio-20260922'
    and needs_revalidation = false
    and status is not distinct from 'blocked'
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for maintenance-projector-auto-off-mauricio-20260922';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition REWRITE for maintenance-projector-auto-off-mauricio-20260922',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_60$;
do $r1_recovery_61$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '7e6ccf08-c09b-43a4-9416-33580a6703b7'::uuid
    and t.task_key = 'dreamteam_role_manuals_incubator_20260913'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for dreamteam_role_manuals_incubator_20260913';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P3/INCUBATOR classification 2026-09-19 = MIGRAR_LOW. Preserved as low-priority future decision; no purchase, external action, secret change or production action authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for dreamteam_role_manuals_incubator_20260913',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_61$;
do $r1_recovery_62$
declare
  v_id uuid;
  v_org_id uuid;
begin
  select t.id, t.org_id
    into v_id, v_org_id
  from operations.tasks t
  where t.id = '01063c62-08b8-45ff-9855-0518d2c389fa'::uuid
    and t.task_key = 'future_domain_purchase_readiness'
    and needs_revalidation = false
    and status = 'archived'
    and active = false
    and exists (
      select 1
      from public.audit_logs a
      where a.record_id = t.id
        and a.table_name = 'operations.tasks'
        and a.request_id = 'TORO-R1-A-20260928'
        and a.occurred_at = t.updated_at
    )
  for update;

  if v_id is null then
    raise exception 'TORO R1-A recovery refused: post-state drifted for future_domain_purchase_readiness';
  end if;

  update operations.tasks
  set
    needs_revalidation = true,
    status = 'planned',
    active = true,
    completion_notes = 'P3/INCUBATOR classification 2026-09-19 = MIGRAR_LOW. Preserved as low-priority future decision; no purchase, external action, secret change or production action authorized.',
    updated_at = now()
  where id = v_id;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_RECOVERY',
    array['needs_revalidation', 'status', 'active', 'priority', 'task_name', 'description', 'blocking_reason', 'completion_notes']::text[],
    'Recovery of TORO R1-A disposition HOLD for future_domain_purchase_readiness',
    'TORO-R1-A-20260928-RECOVERY',
    now()
  );
end
$r1_recovery_62$;
commit;
