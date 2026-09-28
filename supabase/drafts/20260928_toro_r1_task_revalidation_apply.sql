-- Generated TORO R1-A guarded backlog reconciliation.
-- No DELETE statements. Every mutation requires id + task_key + observed_updated_at + needs_revalidation=true.
begin;
do $r1_apply_1$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'f2763b6e-6b9d-48d3-b91c-04f613c0213b'::uuid
    and task_key = 'critical_hotel_ops_safety_reverification_2026_09'
    and updated_at = '2026-09-21 14:53:01.583989+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: critical_hotel_ops_safety_reverification_2026_09';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Critical hotel safety revalidation remains blocked by missing dated on-property PASS/FAIL evidence; the current field packet explicitly requires physical verification and supervisor review. | evidence: supabase:operations.tasks/critical_hotel_ops_safety_reverification_2026_09@2026-09-21T14:53:01.583989+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_1$;
do $r1_apply_2$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'e514137d-a84b-42fc-b2a1-5e81cc3b4f0f'::uuid
    and task_key = 'task-dc-electrical-assessment-20260810'
    and updated_at = '2026-09-21 12:57:12.398081+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: task-dc-electrical-assessment-20260810';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Still requires licensed physical/electrical evidence. Historical age cannot satisfy the professional field-verification closure gate. | evidence: supabase:operations.tasks/task-dc-electrical-assessment-20260810@2026-09-21T12:57:12.398081Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_2$;
do $r1_apply_3$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '4319a7a7-c2df-4c96-a6d2-a863436e549a'::uuid
    and task_key = 'task-dc-security-readiness-20260810'
    and updated_at = '2026-09-23 00:56:35.385735+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: task-dc-security-readiness-20260810';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Still requires a dated on-property night inspection of cameras, recording, gate contingency and critical lighting; no current PASS evidence was found. | evidence: supabase:operations.tasks/task-dc-security-readiness-20260810@2026-09-23T00:56:35.385735Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_3$;
do $r1_apply_4$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '35fd3dc7-acd5-4fb3-bcd9-86f1f286404c'::uuid
    and task_key = 'DC2-022'
    and updated_at = '2026-09-23 06:06:49.23166+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-022';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The release-authority task remains the canonical production gate; current evidence still requires Channel Truth, exact SHA/domain/rollback verification and owner release approval. | evidence: supabase:operations.tasks/DC2-022@2026-09-23T06:06:49.23166+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_4$;
do $r1_apply_5$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '1f7142ed-ebaf-40ee-8b46-62f09e3759c6'::uuid
    and task_key = 'finance_accounting_reset_2026_09_15'
    and updated_at = '2026-09-22 20:54:46.341077+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: finance_accounting_reset_2026_09_15';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Finance rebuild is still an active in-progress program with unresolved fiscal, bank, Kross/CxP and reconciliation evidence gates; no closure or merge is justified. | evidence: supabase:operations.tasks/finance_accounting_reset_2026_09_15@2026-09-22T20:54:46.341077Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_5$;
do $r1_apply_6$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'daea4390-774a-4a77-bf67-7821842157bd'::uuid
    and task_key = 'finish_google_ads_new_account_setup'
    and updated_at = '2026-09-19 09:16:19.750733+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: finish_google_ads_new_account_setup';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The setup objective remains current and externally gated; no verified evidence of account setup completion or authorization to add campaign/billing was found in this R1 review. | evidence: supabase:operations.tasks/finish_google_ads_new_account_setup@2026-09-19T09:16:19.750733Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_6$;
do $r1_apply_7$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'f274911f-08e5-4baa-8c29-e17cdda69e81'::uuid
    and task_key = 'fix_google_ads_booking_conversion_tracking'
    and updated_at = '2026-09-19 09:16:19.750733+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: fix_google_ads_booking_conversion_tracking';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Conversion tracking remains a distinct current dependency for Ads performance attribution; no verified evidence of a completed fix was found in this R1 review. | evidence: supabase:operations.tasks/fix_google_ads_booking_conversion_tracking@2026-09-19T09:16:19.750733Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_7$;
do $r1_apply_8$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'blocked',
    needs_revalidation = false,
    updated_at = now()
  where id = '671d3866-1cd8-421b-a94f-082de2f6dfff'::uuid
    and task_key = 'google_ads_results_to_toro_os_v2'
    and updated_at = '2026-09-25 10:33:36.877168+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: google_ads_results_to_toro_os_v2';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'needs_revalidation']::text[],
    left('[REWRITE] The reporting objective remains valid, but the task is already dependency-gated by account setup and reliable booking conversion tracking; planned understates the current blocked state. | evidence: supabase:operations.tasks/google_ads_results_to_toro_os_v2@2026-09-25T10:33:36.877168+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_8$;
do $r1_apply_9$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '96e0893c-357e-46a0-9571-b9b6114ff73d'::uuid
    and task_key = 'ticos_live_terms_verification_2026_09'
    and updated_at = '2026-09-23 06:01:56.402707+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: ticos_live_terms_verification_2026_09';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] TICOS terms remain an active commercial truth gap: public Kross evidence still does not verify live percentage, validity, eligibility or stacking rules. | evidence: supabase:operations.tasks/ticos_live_terms_verification_2026_09@2026-09-23T06:01:56.402707+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_9$;
do $r1_apply_10$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '207e2c88-4e79-45ff-bd7d-303cd117bfd7'::uuid
    and task_key = 'WA-ADMIN-P0-BOOKING-KYP-20260810'
    and updated_at = '2026-09-19 09:16:19.750733+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: WA-ADMIN-P0-BOOKING-KYP-20260810';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Booking KYP/location and Villa Toro availability still require external authenticated evidence; no verified resolution was found. | evidence: supabase:operations.tasks/WA-ADMIN-P0-BOOKING-KYP-20260810@2026-09-19T09:16:19.750733Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_10$;
do $r1_apply_11$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '42dd4306-4901-42e1-9f0a-9b01042e4b95'::uuid
    and task_key = 'wespeak_crm_reactivation_attribution_20260826'
    and updated_at = '2026-09-26 02:33:10.211396+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: wespeak_crm_reactivation_attribution_20260826';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The lifecycle/attribution objective remains current and its dependency is still blocked; no evidence supports closing or merging it. | evidence: supabase:operations.tasks/wespeak_crm_reactivation_attribution_20260826@2026-09-26T02:33:10.211396Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_11$;
do $r1_apply_12$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '2ecbad3e-6d99-4888-af63-8b5b510d2d48'::uuid
    and task_key = 'toro_surface_capability_parity_20260922'
    and updated_at = '2026-09-28 22:58:46.993081+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: toro_surface_capability_parity_20260922';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The refreshed task remains a core TORO runtime objective: capability parity now explicitly includes shared source-authority and mailbox bindings, while OpenClaw/channel identity/runtime evidence gates remain open. | evidence: supabase:operations.tasks/toro_surface_capability_parity_20260922@2026-09-28T22:58:46.993081+00:concurrent-refresh', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_12$;
do $r1_apply_13$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '567c455b-9ccb-4721-be2e-54e7a882ec41'::uuid
    and task_key = 'decommission_residual_airtable_estate_phase2'
    and updated_at = '2026-09-23 05:24:03.315102+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: decommission_residual_airtable_estate_phase2';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Residual Airtable consolidation is still current and non-destructive retirement gates remain open: parity, recoverable backup/restore, consumers and unique evidence are not yet proven. | evidence: supabase:operations.tasks/decommission_residual_airtable_estate_phase2@2026-09-23T05:24:03.315102+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_13$;
do $r1_apply_14$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'blocked',
    blocking_reason = 'Owner approval exists for a Kross-only USD20/night pet-fee change, but execution remains blocked on authenticated Kross live access, capture of the current live rule/version and rollback, Admin/Reception activation signoff, checkout QA, and read-only verification that WeSpeak reflects the integrated value. Do not edit WeSpeak manually or modify existing reservations automatically.',
    needs_revalidation = false,
    updated_at = now()
  where id = '339e81e9-982c-4419-b57d-ce8cca43f6b3'::uuid
    and task_key = 'legacy_task_rec8Qj1aPRrhgQEms'
    and updated_at = '2026-09-23 00:27:09.660769+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: legacy_task_rec8Qj1aPRrhgQEms';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'blocking_reason', 'needs_revalidation']::text[],
    left('[REWRITE] The task has real blockers but is still marked planned. Reclassify it as blocked without changing the approved Kross-only execution boundary. | evidence: supabase:operations.tasks/legacy_task_rec8Qj1aPRrhgQEms@2026-09-23T00:27:09.660769Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_14$;
do $r1_apply_15$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '84e8fdea-f0b8-4fde-a011-7f6ebe7a0e61'::uuid
    and task_key = 'toro_auth_pilot_decommission_gate_2026_09'
    and updated_at = '2026-09-26 23:12:09.677825+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: toro_auth_pilot_decommission_gate_2026_09';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The auth-pilot decommission gate remains active because the project is inactive but dependency, restore and security evidence plus human disposition are still unresolved. | evidence: supabase:operations.tasks/toro_auth_pilot_decommission_gate_2026_09@2026-09-26T23:12:09.677825+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_15$;
do $r1_apply_16$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '1be1c7b3-26ff-4586-be04-0c4cdf613d1f'::uuid
    and task_key = 'DC2-045'
    and updated_at = '2026-09-19 09:47:46.360289+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-045';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The practical drying pilot remains a bounded physical experiment with a 20-room baseline and five-room pilot still lacking dated field evidence. | evidence: supabase:operations.tasks/DC2-045@2026-09-19T09:47:46.360289+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_16$;
do $r1_apply_17$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'e1d738e0-4e7a-4d9b-9d9b-153473114884'::uuid
    and task_key = 'dreamteam_extra_task_points_design_20260922'
    and updated_at = '2026-09-23 00:54:46.852239+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: dreamteam_extra_task_points_design_20260922';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Recognition & Points remains an approved TORO People capability; implementation is still gated by identity, QA and labor/accounting review. | evidence: github:Dramcatcherst/Toro-OS/docs/product/TORO_BRAIN_GENERAL_PLAN.md#11-recognition--points', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_17$;
do $r1_apply_18$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '78a03d64-dcc0-4d69-9c45-4a67eae2264a'::uuid
    and task_key = 'fnb_october_kitchen_handoff_2026_09'
    and updated_at = '2026-09-22 18:24:28.11574+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: fnb_october_kitchen_handoff_2026_09';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The October kitchen handoff remains a current operational transition with identity, acceptance, backup coverage and handoff gates still open. | evidence: supabase:operations.tasks/fnb_october_kitchen_handoff_2026_09@2026-09-22T18:24:28.11574+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_18$;
do $r1_apply_19$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '3e0e8543-e1bc-4c2d-a371-291206ecf19c'::uuid
    and task_key = 'task-dc-jacuzzi-mapping-20260810'
    and updated_at = '2026-09-19 09:47:46.360289+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: task-dc-jacuzzi-mapping-20260810';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Both jacuzzis still require dated physical mapping and functional evidence for water/circulation/heating configuration before claims or closure. | evidence: supabase:operations.tasks/task-dc-jacuzzi-mapping-20260810@2026-09-19T09:47:46.360289+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_19$;
do $r1_apply_20$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '328dd9da-0ec8-4cbe-bcc3-5799d46ff034'::uuid
    and task_key = 'task-laundry-safety-startup-20260918'
    and updated_at = '2026-09-20 14:33:50.260379+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: task-laundry-safety-startup-20260918';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Laundry startup remains a current physical-safety/commissioning task; no verified closure evidence is present in the reviewed snapshot. | evidence: supabase:operations.tasks/task-laundry-safety-startup-20260918@2026-09-20T14:33:50.260379+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_20$;
do $r1_apply_21$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'f4757acd-e6a3-4c3b-a0e5-f18f498f7693'::uuid
    and task_key = 'toro_ops_staff_identity_onboarding_20260919'
    and updated_at = '2026-09-26 06:33:16.98217+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: toro_ops_staff_identity_onboarding_20260919';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] TORO People onboarding remains current after owner release, but individual identity, hosted role/isolation/revocation and verified channel gates are still open. | evidence: supabase:operations.tasks/toro_ops_staff_identity_onboarding_20260919@2026-09-26T06:33:16.98217+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_21$;
do $r1_apply_22$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'b3476ed9-0887-438c-ab50-b491a6a8ad99'::uuid
    and task_key = 'WA-ADMIN-P1-DECK-TECH-REVIEW-20260810'
    and updated_at = '2026-09-19 09:18:56.610286+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: WA-ADMIN-P1-DECK-TECH-REVIEW-20260810';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Still requires current external/physical technical evidence; the review cannot be closed from historical documentation alone. | evidence: supabase:operations.tasks/WA-ADMIN-P1-DECK-TECH-REVIEW-20260810@2026-09-19T09:18:56.610286Z', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_22$;
do $r1_apply_23$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'e790e0ea-d3a9-4878-bdc4-cb9efa875496'::uuid
    and task_key = 'connect_search_console_and_submit_sitemap'
    and updated_at = '2026-09-23 06:06:49.231509+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: connect_search_console_and_submit_sitemap';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Search Console baseline/indexation remains a current post-release measurement capability and no verified completion evidence supports closing or merging it. | evidence: supabase:operations.tasks/connect_search_console_and_submit_sitemap@2026-09-23T06:06:49.231509+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_23$;
do $r1_apply_24$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '97c9a2d3-455e-42e6-b9a8-670ede1cd554'::uuid
    and task_key = 'DC2-028'
    and updated_at = '2026-09-23 06:06:49.23953+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-028';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The room-comparison capability remains a distinct website selection/conversion improvement with governed catalog dependencies and no verified completion evidence. | evidence: supabase:operations.tasks/DC2-028@2026-09-23T06:06:49.23953+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_24$;
do $r1_apply_25$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A MERGE -> DC2-022] The accessibility/performance preview slice is explicitly complete; the only remaining material step is the existing release gate owned by DC2-022, so a separate active task would duplicate release work.'),
    updated_at = now()
  where id = 'd7e40354-f870-44d5-b6ce-ba3165a3a028'::uuid
    and task_key = 'DC2-030'
    and updated_at = '2026-09-23 06:06:49.239745+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-030';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[MERGE] The accessibility/performance preview slice is explicitly complete; the only remaining material step is the existing release gate owned by DC2-022, so a separate active task would duplicate release work. | evidence: supabase:operations.tasks/DC2-030@2026-09-23T06:06:49.239745+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_25$;
do $r1_apply_26$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'ff79338a-be14-4810-85fc-10f469eea8e4'::uuid
    and task_key = 'MEDIA-KROSS-RECONCILE-22-UNITS-20260903'
    and updated_at = '2026-09-23 03:37:58.511773+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: MEDIA-KROSS-RECONCILE-22-UNITS-20260903';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Media/Kross reconciliation remains current: source identity/order is verified but rights/public-safe status, Booking capture and Villa Toro mapping are incomplete. | evidence: supabase:operations.tasks/MEDIA-KROSS-RECONCILE-22-UNITS-20260903@2026-09-23T03:37:58.511773+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_26$;
do $r1_apply_27$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'b7de6e88-84f5-4492-bec8-2033148d6521'::uuid
    and task_key = 'dc_yoy_2025_2026_reconcile_sources'
    and updated_at = '2026-09-25 08:43:40.54113+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: dc_yoy_2025_2026_reconcile_sources';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The year-over-year source reconciliation remains current and no verified canonical reconciliation result supports closure or merge. | evidence: supabase:operations.tasks/dc_yoy_2025_2026_reconcile_sources@2026-09-25T08:43:40.54113+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_27$;
do $r1_apply_28$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '73c73552-feef-4643-83c9-09c3ae2be042'::uuid
    and task_key = 'DROPBOX-P1-RECURRING-PAYMENTS-RECON-20260810'
    and updated_at = '2026-09-19 10:41:49.679191+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DROPBOX-P1-RECURRING-PAYMENTS-RECON-20260810';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Recurring-payments reconciliation remains active because source identifiers/provider evidence and master/calendar gaps remain unresolved despite the reporting stack being built. | evidence: supabase:operations.tasks/DROPBOX-P1-RECURRING-PAYMENTS-RECON-20260810@2026-09-19T10:41:49.679191+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_28$;
do $r1_apply_29$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '0d03aa3f-ff02-45d6-a70f-4f79dc18a733'::uuid
    and task_key = 'fnb_settlement_invoicing_sop_2026_09'
    and updated_at = '2026-09-22 18:24:28.11574+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: fnb_settlement_invoicing_sop_2026_09';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The A&B settlement/invoicing SOP remains active: payment is known, but invoice receipt, channel/contact certainty and operating acceptance remain unresolved. | evidence: supabase:operations.tasks/fnb_settlement_invoicing_sop_2026_09@2026-09-22T18:24:28.11574+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_29$;
do $r1_apply_30$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'eff7627c-db3d-4534-a233-d86ba848b668'::uuid
    and task_key = 'dc_revenue_june_channel_2026_diagnostic'
    and updated_at = '2026-09-25 08:43:40.54113+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: dc_revenue_june_channel_2026_diagnostic';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The June/channel diagnostic remains a distinct current Revenue analysis objective and no verified completed diagnostic is recorded in this snapshot. | evidence: supabase:operations.tasks/dc_revenue_june_channel_2026_diagnostic@2026-09-25T08:43:40.54113+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_30$;
do $r1_apply_31$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'fbd447d1-f10e-413b-a151-651784ae6f28'::uuid
    and task_key = 'fnb_costing_complete_2026_09'
    and updated_at = '2026-09-22 06:50:24.364506+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: fnb_costing_complete_2026_09';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] A&B costing/margin validation for the current product set remains an active revenue-control objective with no verified completion evidence. | evidence: supabase:operations.tasks/fnb_costing_complete_2026_09@2026-09-22T06:50:24.364506+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_31$;
do $r1_apply_32$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] This is explicitly post-launch cadence work. The production release gate is not closed, so keeping it active now inflates the backlog before its trigger exists.'),
    updated_at = now()
  where id = '6f0a92a7-349c-409e-82a9-092ef6036970'::uuid
    and task_key = 'start_post_launch_content_cadence_for_priority_clusters'
    and updated_at = '2026-09-19 09:47:46.360289+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: start_post_launch_content_cadence_for_priority_clusters';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] This is explicitly post-launch cadence work. The production release gate is not closed, so keeping it active now inflates the backlog before its trigger exists. | evidence: supabase:operations.tasks/start_post_launch_content_cadence_for_priority_clusters@2026-09-19T09:47:46.360289+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_32$;
do $r1_apply_33$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '2da11573-db9c-4d44-8a68-c0874667c7ce'::uuid
    and task_key = 'wespeak_weekly_conversation_qa'
    and updated_at = '2026-09-28 15:38:56.872353+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: wespeak_weekly_conversation_qa';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The recurring WeSpeak/TERE QA remains a valid ongoing control; current evidence explicitly says coverage is partial and native-source attribution is still blocked. | evidence: supabase:operations.tasks/wespeak_weekly_conversation_qa@2026-09-28T15:38:56.872353+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_33$;
do $r1_apply_34$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '0b5f39f4-7aa1-462c-b2d4-4c8209e11943'::uuid
    and task_key = 'dreamcatcher_autonomy_acceptance_2027_01'
    and updated_at = '2026-09-21 05:50:09.203077+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: dreamcatcher_autonomy_acceptance_2027_01';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The January 2027 autonomy acceptance test remains a current strategic readiness gate with explicit dependencies; it is not completed or duplicated by the baseline task. | evidence: supabase:operations.tasks/dreamcatcher_autonomy_acceptance_2027_01@2026-09-21T05:50:09.203077+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_34$;
do $r1_apply_35$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '9023b678-5e2c-46fa-b945-a701a42de359'::uuid
    and task_key = 'dreamcatcher_autonomy_baseline_2026_09'
    and updated_at = '2026-09-21 05:50:09.203077+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: dreamcatcher_autonomy_baseline_2026_09';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The autonomy baseline is required before the January 2027 acceptance test and still depends on real timing/case data and human role confirmation. | evidence: supabase:operations.tasks/dreamcatcher_autonomy_baseline_2026_09@2026-09-21T05:50:09.203077+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_35$;
do $r1_apply_36$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '48875793-5529-45f5-8dd0-2eed9d4e8809'::uuid
    and task_key = 'toro_company_user_portal_contract_20260922'
    and updated_at = '2026-09-25 09:14:40.291632+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: toro_company_user_portal_contract_20260922';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The company/user/Portal contract remains core current work: membership foundation exists, but hosted QA, sender identity, channel consumption and scope proof are still gated. | evidence: supabase:operations.tasks/toro_company_user_portal_contract_20260922@2026-09-25T09:14:40.291632+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_36$;
do $r1_apply_37$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '5012fac0-a634-48fb-ac18-5b9721308c30'::uuid
    and task_key = 'toro_design_partner_monetization_20260922'
    and updated_at = '2026-09-23 00:00:25.243556+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: toro_design_partner_monetization_20260922';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The design-partner/monetization task remains valid as a controlled productization objective, while its own blocker correctly prevents external private-data onboarding before readiness gates pass. | evidence: supabase:operations.tasks/toro_design_partner_monetization_20260922@2026-09-23T00:00:25.243556+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_37$;
do $r1_apply_38$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Valid future extras/NBO work, but current prerequisites for room fit, price freshness and availability are not yet closed; reactivate when those gates are ready rather than carrying it as active work.'),
    updated_at = now()
  where id = '3573ec60-0fea-4e78-861d-e90a86f3126b'::uuid
    and task_key = 'DC2-037'
    and updated_at = '2026-09-23 06:06:49.24081+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-037';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Valid future extras/NBO work, but current prerequisites for room fit, price freshness and availability are not yet closed; reactivate when those gates are ready rather than carrying it as active work. | evidence: supabase:operations.tasks/DC2-037@2026-09-23T06:06:49.24081+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_38$;
do $r1_apply_39$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Energy/water denominator analysis is valid but explicitly downstream of higher-priority source and operational gates; no current 30-day reconciliation trigger is active.'),
    updated_at = now()
  where id = '99af6e87-0dfa-4c28-a0f3-ad587279e915'::uuid
    and task_key = 'DC2-048'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-048';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Energy/water denominator analysis is valid but explicitly downstream of higher-priority source and operational gates; no current 30-day reconciliation trigger is active. | evidence: supabase:operations.tasks/DC2-048@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_39$;
do $r1_apply_40$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '7affee16-d4aa-41e3-adbb-536c5c38f773'::uuid
    and task_key = 'alexandra_ops_manager_development_20260918'
    and updated_at = '2026-09-23 04:53:56.858614+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: alexandra_ops_manager_development_20260918';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] This remains a current operational capability-development initiative with a defined mentor/QA path and measurable delegation objective; no promotion or permission change is implied. | evidence: supabase:operations.tasks/alexandra_ops_manager_development_20260918@2026-09-23T04:53:56.858614+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_40$;
do $r1_apply_41$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] The task itself is explicitly P2 and deferred until P0/P1 close; keep it out of the active backlog until that trigger exists.'),
    updated_at = now()
  where id = 'b92fe78d-447f-4efe-b4bd-414c0fe73a8f'::uuid
    and task_key = 'DC2-044'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-044';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] The task itself is explicitly P2 and deferred until P0/P1 close; keep it out of the active backlog until that trigger exists. | evidence: supabase:operations.tasks/DC2-044@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_41$;
do $r1_apply_42$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] The water-reuse technical dossier is valid but explicitly deferred behind higher-priority work; no current technical/legal trigger requires active execution.'),
    updated_at = now()
  where id = '79cb650f-f310-4202-87df-e7969b551307'::uuid
    and task_key = 'DC2-050'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-050';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] The water-reuse technical dossier is valid but explicitly deferred behind higher-priority work; no current technical/legal trigger requires active execution. | evidence: supabase:operations.tasks/DC2-050@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_42$;
do $r1_apply_43$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] The reversible sound pilot depends on earlier work and has no current trigger; retain as future experiment rather than active commitment.'),
    updated_at = now()
  where id = '217e7159-b630-41d0-b3eb-5f0a71495568'::uuid
    and task_key = 'DC2-055'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-055';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] The reversible sound pilot depends on earlier work and has no current trigger; retain as future experiment rather than active commitment. | evidence: supabase:operations.tasks/DC2-055@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_43$;
do $r1_apply_44$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Low-risk physical sharing pilots are future experiments dependent on earlier safety/workstream gates; no current trigger justifies active status.'),
    updated_at = now()
  where id = '8364ad99-7f3a-4180-a581-a1221566bfbf'::uuid
    and task_key = 'DC2-064'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-064';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Low-risk physical sharing pilots are future experiments dependent on earlier safety/workstream gates; no current trigger justifies active status. | evidence: supabase:operations.tasks/DC2-064@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_44$;
do $r1_apply_45$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] The survey is valid but explicitly P2/non-blocking. Reactivate when network troubleshooting or the planned resilience work needs room-level measurements.'),
    updated_at = now()
  where id = '805baee5-0943-47a4-be11-55e1e1e1b7c9'::uuid
    and task_key = 'task-dc-wifi-survey-20260810'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: task-dc-wifi-survey-20260810';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] The survey is valid but explicitly P2/non-blocking. Reactivate when network troubleshooting or the planned resilience work needs room-level measurements. | evidence: supabase:operations.tasks/task-dc-wifi-survey-20260810@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_45$;
do $r1_apply_46$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] CTA testing is valid but explicitly downstream of website/release gates; reactivate after the production baseline is settled.'),
    updated_at = now()
  where id = '43f85647-83e1-4d9c-8ae9-f8b63200edce'::uuid
    and task_key = 'DC2-027'
    and updated_at = '2026-09-23 06:06:49.232028+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-027';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] CTA testing is valid but explicitly downstream of website/release gates; reactivate after the production baseline is settled. | evidence: supabase:operations.tasks/DC2-027@2026-09-23T06:06:49.232028+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_46$;
do $r1_apply_47$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] ES/EN + TICOS profile routing is valid but downstream of verified live TICOS terms and current website truth; keep it on HOLD until those inputs exist.'),
    updated_at = now()
  where id = '71a050f1-acb7-46bc-b423-4b35641a8414'::uuid
    and task_key = 'DC2-035'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-035';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] ES/EN + TICOS profile routing is valid but downstream of verified live TICOS terms and current website truth; keep it on HOLD until those inputs exist. | evidence: supabase:operations.tasks/DC2-035@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_47$;
do $r1_apply_48$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] This is a narrow historical tax opportunity with a founder/legal gate and no current evidence package; keep it parked until materiality/support justify reopening.'),
    updated_at = now()
  where id = 'bbf2b3ea-69f6-497c-8dee-37ef4bc767e9'::uuid
    and task_key = 'tax-audit-tourism-vat-2019-2023'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: tax-audit-tourism-vat-2019-2023';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] This is a narrow historical tax opportunity with a founder/legal gate and no current evidence package; keep it parked until materiality/support justify reopening. | evidence: supabase:operations.tasks/tax-audit-tourism-vat-2019-2023@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_48$;
do $r1_apply_49$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Wedding/group SOP work is useful but not tied to a current event-specific trigger in this task; reactivate when a live group/event requires the standardized package.'),
    updated_at = now()
  where id = '5168c5ed-1825-4de7-beec-ec526d0ee622'::uuid
    and task_key = 'DC2-063'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-063';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Wedding/group SOP work is useful but not tied to a current event-specific trigger in this task; reactivate when a live group/event requires the standardized package. | evidence: supabase:operations.tasks/DC2-063@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_49$;
do $r1_apply_50$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '4c7e812c-d68f-4d28-a18c-51f4ffa4e2c5'::uuid
    and task_key = 'DC2-068'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-068';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The PMS evaluation remains current: Cloudbeds is an active candidate and the task has concrete TCO/API/inventory/reversibility questions that still require a decision. | evidence: supabase:operations.tasks/DC2-068@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_50$;
do $r1_apply_51$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] This experiment-decision task depends on upstream pricing/data readiness and a later review window; no current trigger exists.'),
    updated_at = now()
  where id = '42d95464-c6b2-406b-a362-b5673eae450f'::uuid
    and task_key = 'DC2-069'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-069';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] This experiment-decision task depends on upstream pricing/data readiness and a later review window; no current trigger exists. | evidence: supabase:operations.tasks/DC2-069@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_51$;
do $r1_apply_52$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Meta ownership verification remains important before paid/automation integration, but there is no current integration/cutover trigger; keep it parked until that workstream activates.'),
    updated_at = now()
  where id = 'f1bb525e-ac95-469b-abc5-2720417672f7'::uuid
    and task_key = 'verify_dreamcatcher_facebook_page_ownership'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: verify_dreamcatcher_facebook_page_ownership';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Meta ownership verification remains important before paid/automation integration, but there is no current integration/cutover trigger; keep it parked until that workstream activates. | evidence: supabase:operations.tasks/verify_dreamcatcher_facebook_page_ownership@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_52$;
do $r1_apply_53$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = '502541b0-eebf-4a6e-a358-e67108172f3d'::uuid
    and task_key = 'wespeak_monthly_deep_review'
    and updated_at = '2026-09-21 05:50:09.203077+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: wespeak_monthly_deep_review';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] The monthly deep review is an ongoing quality/conversion control that consolidates weekly QA and remains valid without duplicating live WeSpeak/Kross mutation. | evidence: supabase:operations.tasks/wespeak_monthly_deep_review@2026-09-21T05:50:09.203077+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_53$;
do $r1_apply_54$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] A generic weekly three-front review would duplicate newer TORO command/reporting rhythms unless a specific gap is demonstrated; keep it parked rather than create another recurring review loop.'),
    updated_at = now()
  where id = 'b57a45c2-86f6-4f5a-a9dc-1a6a5ad65ddd'::uuid
    and task_key = 'DC2-019'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-019';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] A generic weekly three-front review would duplicate newer TORO command/reporting rhythms unless a specific gap is demonstrated; keep it parked rather than create another recurring review loop. | evidence: supabase:operations.tasks/DC2-019@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_54$;
do $r1_apply_55$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] This is explicitly a later portfolio-selection gate for demonstrated improvements; reactivate at the evidence/decision window rather than carrying it as active work.'),
    updated_at = now()
  where id = '82f06e56-7b45-4a0e-ba4f-025a54d40da0'::uuid
    and task_key = 'DC2-070'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: DC2-070';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] This is explicitly a later portfolio-selection gate for demonstrated improvements; reactivate at the evidence/decision window rather than carrying it as active work. | evidence: supabase:operations.tasks/DC2-070@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_55$;
do $r1_apply_56$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Translation workflow is valid only after English/Spanish source truth is approved; keep it parked until that source-truth trigger is satisfied.'),
    updated_at = now()
  where id = '196224e7-45e5-4ea1-9f2c-90ab9a1b95b2'::uuid
    and task_key = 'legacy_task_recmYCDbpmMvpHMQo'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: legacy_task_recmYCDbpmMvpHMQo';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Translation workflow is valid only after English/Spanish source truth is approved; keep it parked until that source-truth trigger is satisfied. | evidence: supabase:operations.tasks/legacy_task_recmYCDbpmMvpHMQo@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_56$;
do $r1_apply_57$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'd52aaebb-4f96-4524-baf7-0524b3fbf892'::uuid
    and task_key = 'occ_sep_oct_daily_revenue_dashboard_20260825'
    and updated_at = '2026-09-23 05:38:31.835823+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: occ_sep_oct_daily_revenue_dashboard_20260825';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] This is the single active Performance Intelligence execution task and already contains the governed metric/data-quality workstream; archiving it would strand current canonicalization/conflict-resolution work. | evidence: supabase:operations.tasks/occ_sep_oct_daily_revenue_dashboard_20260825@2026-09-23T05:38:31.835823+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_57$;
do $r1_apply_58$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    needs_revalidation = false,
    updated_at = now()
  where id = 'ad46f9e6-c613-45ca-adcc-5a74b3f3fd4d'::uuid
    and task_key = 'WA-ADMIN-P2-NETWORK-INVENTORY-20260810'
    and updated_at = '2026-09-19 09:55:36.680053+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: WA-ADMIN-P2-NETWORK-INVENTORY-20260810';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['needs_revalidation']::text[],
    left('[KEEP] Network topology, recovery ownership and failover documentation remain a current operational resilience need with a concrete non-secret next action and no duplicate active authority. | evidence: supabase:operations.tasks/WA-ADMIN-P2-NETWORK-INVENTORY-20260810@2026-09-19T09:55:36.680053+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_58$;
do $r1_apply_59$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Accepted-risk Wi-Fi credential rotation has no current trigger; keep the secret out of TORO and reactivate only on the documented exposure/personnel/network conditions.'),
    updated_at = now()
  where id = 'eb3817a8-3c68-4e19-b89f-4f38ffcf6ab7'::uuid
    and task_key = 'confirm_wifi_wording_backup_2026_06_17'
    and updated_at = '2026-09-19 09:50:38.924282+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: confirm_wifi_wording_backup_2026_06_17';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Accepted-risk Wi-Fi credential rotation has no current trigger; keep the secret out of TORO and reactivate only on the documented exposure/personnel/network conditions. | evidence: supabase:operations.tasks/confirm_wifi_wording_backup_2026_06_17@2026-09-19T09:50:38.924282+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_59$;
do $r1_apply_60$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'blocked',
    needs_revalidation = false,
    updated_at = now()
  where id = 'd9c2f2c6-24f8-47c7-b65c-31981d8563a8'::uuid
    and task_key = 'maintenance-projector-auto-off-mauricio-20260922'
    and updated_at = '2026-09-23 01:54:29.094214+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: maintenance-projector-auto-off-mauricio-20260922';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'needs_revalidation']::text[],
    left('[REWRITE] Owner reported timers configured, but room-by-room interval, observed auto-off, restart and QA evidence remain missing; blocked pending verification is more accurate than planned. | evidence: supabase:operations.tasks/maintenance-projector-auto-off-mauricio-20260922@2026-09-23T01:54:29.094214+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_60$;
do $r1_apply_61$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Role manuals remain an incubator artifact until core staff/SOP truth stabilizes; active backlog should not carry this future derived-document work.'),
    updated_at = now()
  where id = '7e6ccf08-c09b-43a4-9416-33580a6703b7'::uuid
    and task_key = 'dreamteam_role_manuals_incubator_20260913'
    and updated_at = '2026-09-19 09:50:38.924282+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: dreamteam_role_manuals_incubator_20260913';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Role manuals remain an incubator artifact until core staff/SOP truth stabilizes; active backlog should not carry this future derived-document work. | evidence: supabase:operations.tasks/dreamteam_role_manuals_incubator_20260913@2026-09-19T09:50:38.924282+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_61$;
do $r1_apply_62$
declare
  v_id uuid;
  v_org_id uuid;
begin
  update operations.tasks
  set
    status = 'archived',
    active = false,
    needs_revalidation = false,
    completion_notes = concat_ws(E'\n', nullif(completion_notes, ''), '[TORO-R1-A HOLD] Future domain purchase has no current product/content trigger and explicitly requires later pricing/ownership/privacy approval; keep it on HOLD rather than active backlog.'),
    updated_at = now()
  where id = '01063c62-08b8-45ff-9855-0518d2c389fa'::uuid
    and task_key = 'future_domain_purchase_readiness'
    and updated_at = '2026-09-19 09:50:38.924282+00'::timestamptz
    and needs_revalidation = true
  returning id, org_id into v_id, v_org_id;

  if v_id is null then
    raise exception 'TORO R1-A stale/conflict: future_domain_purchase_readiness';
  end if;

  insert into public.audit_logs (
    org_id, table_name, record_id, operation, changed_keys, reason, request_id, occurred_at
  ) values (
    v_org_id,
    'operations.tasks',
    v_id,
    'TORO_R1_REVALIDATE',
    array['status', 'active', 'needs_revalidation', 'completion_notes']::text[],
    left('[HOLD] Future domain purchase has no current product/content trigger and explicitly requires later pricing/ownership/privacy approval; keep it on HOLD rather than active backlog. | evidence: supabase:operations.tasks/future_domain_purchase_readiness@2026-09-19T09:50:38.924282+00', 1000),
    'TORO-R1-A-20260928',
    now()
  );
end
$r1_apply_62$;
commit;
