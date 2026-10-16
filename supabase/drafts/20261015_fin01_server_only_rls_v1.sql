-- REVIEW ONLY / NOT APPLIED.
-- FIN01-P0-SEC-01: enable default-deny RLS on 12 server-only relations.
-- This migration creates no policies, grants, functions, views or data changes.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $preconditions$
declare
  missing_relations integer;
  unexpected_rls integer;
  unexpected_policies integer;
  public_privileges integer;
  finance_service_grant_drift integer;
  integration_service_privileges integer;
begin
  select count(*) into missing_relations
  from (values
    ('finance','daily_close_runs'),
    ('finance','daily_close_items'),
    ('finance','daily_close_questions'),
    ('finance','subscription_reviews'),
    ('finance','payflow_rules'),
    ('finance','payflow_write_receipts'),
    ('finance','module_alerts'),
    ('finance','intake_batches'),
    ('finance','management_budget_scenarios'),
    ('finance','management_budget_lines'),
    ('integrations','mail_ingest_census'),
    ('integrations','mail_ingest_checkpoints')
  ) target(schema_name,table_name)
  where to_regclass(format('%I.%I',target.schema_name,target.table_name)) is null;
  if missing_relations <> 0 then
    raise exception 'FIN01 RLS target drift: % relations missing', missing_relations;
  end if;

  select count(*) into unexpected_rls
  from (values
    ('finance','daily_close_runs'),('finance','daily_close_items'),('finance','daily_close_questions'),
    ('finance','subscription_reviews'),('finance','payflow_rules'),('finance','payflow_write_receipts'),
    ('finance','module_alerts'),('finance','intake_batches'),('finance','management_budget_scenarios'),
    ('finance','management_budget_lines'),('integrations','mail_ingest_census'),
    ('integrations','mail_ingest_checkpoints')
  ) target(schema_name,table_name)
  join pg_catalog.pg_namespace n on n.nspname=target.schema_name
  join pg_catalog.pg_class c on c.relnamespace=n.oid and c.relname=target.table_name
  where c.relrowsecurity or c.relforcerowsecurity;
  if unexpected_rls <> 0 then
    raise exception 'FIN01 RLS baseline changed on % relations', unexpected_rls;
  end if;

  select count(*) into unexpected_policies
  from pg_catalog.pg_policies p
  where (p.schemaname,p.tablename) in (
    ('finance','daily_close_runs'),('finance','daily_close_items'),('finance','daily_close_questions'),
    ('finance','subscription_reviews'),('finance','payflow_rules'),('finance','payflow_write_receipts'),
    ('finance','module_alerts'),('finance','intake_batches'),('finance','management_budget_scenarios'),
    ('finance','management_budget_lines'),('integrations','mail_ingest_census'),
    ('integrations','mail_ingest_checkpoints'));
  if unexpected_policies <> 0 then
    raise exception 'FIN01 policy baseline changed: % policies found', unexpected_policies;
  end if;

  select count(*) into public_privileges
  from (values
    ('finance','daily_close_runs'),('finance','daily_close_items'),('finance','daily_close_questions'),
    ('finance','subscription_reviews'),('finance','payflow_rules'),('finance','payflow_write_receipts'),
    ('finance','module_alerts'),('finance','intake_batches'),('finance','management_budget_scenarios'),
    ('finance','management_budget_lines'),('integrations','mail_ingest_census'),
    ('integrations','mail_ingest_checkpoints')
  ) target(schema_name,table_name)
  cross join (values ('anon'),('authenticated')) actor(role_name)
  cross join (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) action(privilege_name)
  where has_table_privilege(actor.role_name,format('%I.%I',target.schema_name,target.table_name),action.privilege_name);
  if public_privileges <> 0 then
    raise exception 'FIN01 public-role privilege drift: % effective privileges found', public_privileges;
  end if;

  select count(*) into finance_service_grant_drift
  from (values
    ('daily_close_runs'),('daily_close_items'),('daily_close_questions'),('subscription_reviews'),
    ('payflow_rules'),('payflow_write_receipts'),('module_alerts'),('intake_batches'),
    ('management_budget_scenarios'),('management_budget_lines')
  ) target(table_name)
  cross join (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) action(privilege_name)
  where not has_table_privilege('service_role',format('%I.%I','finance',target.table_name),action.privilege_name);
  if finance_service_grant_drift <> 0 then
    raise exception 'FIN01 finance service_role baseline changed: % privileges missing', finance_service_grant_drift;
  end if;

  select count(*) into integration_service_privileges
  from (values ('mail_ingest_census'),('mail_ingest_checkpoints')) target(table_name)
  cross join (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) action(privilege_name)
  where has_table_privilege('service_role',format('%I.%I','integrations',target.table_name),action.privilege_name);
  if integration_service_privileges <> 0 then
    raise exception 'FIN01 integrations service_role baseline changed: % privileges found', integration_service_privileges;
  end if;

  if not coalesce((select rolbypassrls from pg_catalog.pg_roles where rolname='postgres'),false)
     or not coalesce((select rolbypassrls from pg_catalog.pg_roles where rolname='service_role'),false)
     or coalesce((select rolbypassrls from pg_catalog.pg_roles where rolname='anon'),true)
     or coalesce((select rolbypassrls from pg_catalog.pg_roles where rolname='authenticated'),true)
  then
    raise exception 'FIN01 role BYPASSRLS baseline changed';
  end if;
end;
$preconditions$;

alter table finance.daily_close_runs enable row level security;
alter table finance.daily_close_items enable row level security;
alter table finance.daily_close_questions enable row level security;
alter table finance.subscription_reviews enable row level security;
alter table finance.payflow_rules enable row level security;
alter table finance.payflow_write_receipts enable row level security;
alter table finance.module_alerts enable row level security;
alter table finance.intake_batches enable row level security;
alter table finance.management_budget_scenarios enable row level security;
alter table finance.management_budget_lines enable row level security;
alter table integrations.mail_ingest_census enable row level security;
alter table integrations.mail_ingest_checkpoints enable row level security;

commit;
