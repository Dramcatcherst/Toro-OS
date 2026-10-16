-- REVIEW ONLY / NOT EXECUTED.
-- Exact rollback for 20261015_fin01_server_only_rls_v1.sql.
-- Restores the observed disabled-RLS state and refuses policy/grant drift.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $preconditions$
declare
  unexpected_state integer;
  unexpected_policies integer;
  public_privileges integer;
begin
  select count(*) into unexpected_state
  from (values
    ('finance','daily_close_runs'),('finance','daily_close_items'),('finance','daily_close_questions'),
    ('finance','subscription_reviews'),('finance','payflow_rules'),('finance','payflow_write_receipts'),
    ('finance','module_alerts'),('finance','intake_batches'),('finance','management_budget_scenarios'),
    ('finance','management_budget_lines'),('integrations','mail_ingest_census'),
    ('integrations','mail_ingest_checkpoints')
  ) target(schema_name,table_name)
  left join pg_catalog.pg_namespace n on n.nspname=target.schema_name
  left join pg_catalog.pg_class c on c.relnamespace=n.oid and c.relname=target.table_name
  where c.oid is null or not c.relrowsecurity or c.relforcerowsecurity;
  if unexpected_state <> 0 then
    raise exception 'FIN01 rollback RLS state drift on % relations', unexpected_state;
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
    raise exception 'FIN01 rollback refuses % unexpected policies', unexpected_policies;
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
    raise exception 'FIN01 rollback public-role privilege drift: % effective privileges found', public_privileges;
  end if;
end;
$preconditions$;

alter table finance.daily_close_runs disable row level security;
alter table finance.daily_close_items disable row level security;
alter table finance.daily_close_questions disable row level security;
alter table finance.subscription_reviews disable row level security;
alter table finance.payflow_rules disable row level security;
alter table finance.payflow_write_receipts disable row level security;
alter table finance.module_alerts disable row level security;
alter table finance.intake_batches disable row level security;
alter table finance.management_budget_scenarios disable row level security;
alter table finance.management_budget_lines disable row level security;
alter table integrations.mail_ingest_census disable row level security;
alter table integrations.mail_ingest_checkpoints disable row level security;

commit;
