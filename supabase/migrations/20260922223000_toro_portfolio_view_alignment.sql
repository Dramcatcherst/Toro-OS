-- TORO OS executive portfolio view alignment
-- 2026-09-22
--
-- Keeps executive views aligned with the canonical project tree and the
-- project-home vs operational-submodule contract.
--
-- No business data is mutated by this migration.

create or replace view operations.toro_project_portfolio as
select
  p.project_key,
  p.project_name,
  p.project_level,
  p.parent_project_key,
  p.canonical_module_key,
  p.owner_agent,
  p.status,
  p.priority,
  p.completion_pct,
  p.active,
  p.next_action,
  count(t.id) filter (
    where t.active
      and t.status = any(array['planned','todo','in_progress','blocked'])
  )::integer as open_task_count,
  count(t.id) filter (
    where t.active
      and t.status='blocked'
  )::integer as blocked_task_count,
  p.last_consolidated_at,
  p.updated_at
from operations.projects p
left join operations.tasks t on t.project_id=p.id
where p.active=true
  and p.project_level = any(array[
    'PORTFOLIO',
    'MASTER',
    'PORTFOLIO_LANE',
    'MODULE',
    'PROJECT',
    'INCUBATOR',
    'HOLD',
    'EXTERNAL',
    'EXTERNAL_PROJECT'
  ])
group by p.id;

comment on view operations.toro_project_portfolio is
  'Active canonical TORO projects across all supported project levels. Human projections must mirror project_key; this view does not derive project identity from Airtable.';

create or replace view operations.toro_unified_portfolio_v1 as
select
  id,
  task_key,
  task_name,
  project_id,
  canonical_module_key,
  area,
  priority,
  source_status,
  owner_name,
  assignee_name,
  execution_owner,
  start_date,
  due_date,
  blocking_reason,
  description,
  updated_at,
  lifecycle,
  execution_condition,
  constraint_class,
  structurally_ready,
  case
    when canonical_module_key = any(array[
      'critical_hotel_operations',
      'maintenance_assets',
      'procurement_inventory'
    ]) then 'OPERATE'
    when canonical_module_key = any(array[
      'revenue_booking_stack',
      'dreamcatcher_website',
      'dropbox_media_quality_cleanup',
      'ricosky_marketplace',
      'aprende_ai_maufertoro',
      'dream_shares'
    ]) then 'GROW'
    when canonical_module_key = any(array[
      'finance_controls',
      'business_truth_bible',
      'toro_executive_control',
      'toro_os_portfolio_master'
    ]) then 'CONTROL'
    when canonical_module_key = any(array[
      'property_corporate_portfolio',
      'construction_diex_development',
      'cabuya_purchase_regularization',
      'la_julia_guatape',
      'santa_toro_closeout'
    ]) then 'BUILD'
    else 'UNMAPPED'
  end as workstream,
  case
    when canonical_module_key = any(array[
      'critical_hotel_operations',
      'maintenance_assets',
      'procurement_inventory',
      'revenue_booking_stack',
      'dreamcatcher_website',
      'dropbox_media_quality_cleanup'
    ]) then 'HOTEL_STABLE_PROFITABLE'
    when canonical_module_key = any(array[
      'finance_controls',
      'business_truth_bible',
      'toro_executive_control',
      'toro_os_portfolio_master'
    ]) then 'CONTROL_AUTONOMY'
    when canonical_module_key = any(array[
      'property_corporate_portfolio',
      'construction_diex_development',
      'cabuya_purchase_regularization',
      'la_julia_guatape',
      'santa_toro_closeout',
      'ricosky_marketplace',
      'aprende_ai_maufertoro',
      'dream_shares'
    ]) then 'ASSETS_FUTURE'
    else 'UNMAPPED'
  end as strategic_outcome,
  case
    when lifecycle='ACTIVE' and execution_condition='CLEAR' then 'EXECUTE_NOW'
    when lifecycle='READY' and execution_condition='CLEAR' then 'READY_NEXT'
    when execution_condition = any(array[
      'OWNER_GATE',
      'WAITING_EVIDENCE',
      'BLOCKED_EXTERNAL',
      'WAITING_DATE'
    ]) then 'CONSTRAINED'
    when lifecycle='BACKLOG' then 'BACKLOG'
    else 'REVIEW'
  end as execution_bucket
from operations.toro_task_execution_v1 t
where lifecycle <> 'DONE';

comment on view operations.toro_unified_portfolio_v1 is
  'Unified open-work projection using canonical task project homes plus specialized canonical_module_key submodules. Known external/property scopes are classified without creating projects.';
