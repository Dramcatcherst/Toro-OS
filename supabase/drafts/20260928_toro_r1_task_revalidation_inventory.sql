-- TORO R1-A read-only revalidation inventory
-- Canonical task source: operations.tasks
-- Production source project: abtyrbqlqbsastmridzp
-- Generated/verified 2026-09-28. No writes.
select
  t.id as task_id,
  t.task_key,
  t.task_name,
  p.project_key,
  p.project_name,
  t.canonical_module_key,
  t.status,
  t.priority,
  t.area,
  t.owner_name,
  t.assignee_name,
  t.source_system,
  t.source_table,
  t.source_record_id,
  t.migration_classification,
  t.blocking_reason,
  t.description,
  t.updated_at,
  t.needs_revalidation
from operations.tasks t
left join operations.projects p on p.id=t.project_id
where t.active=true
  and t.needs_revalidation=true
  and coalesce(t.status,'') not in ('done','completed')
order by
  case lower(coalesce(t.priority,'')) when 'critical' then 0 when 'p0' then 0 when 'high' then 1 when 'p1' then 1 when 'medium' then 2 when 'p2' then 2 else 9 end,
  t.canonical_module_key,
  t.task_key;
