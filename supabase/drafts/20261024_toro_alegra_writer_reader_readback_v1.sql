-- PREPARED ONLY. Run after the separately approved reader stage.
-- Catalog readback only, no SET ROLE, LOGIN or persisted write.
-- Managed automatic membership can be ADMIN=true/INHERIT=false/SET=false.
begin read only;
with reader as (select oid,rolname,rolcanlogin,rolinherit,rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,rolconnlimit
  from pg_roles where rolname='toro_alegra_writer_reader_v1'),
expected(table_name,columns) as (values
  ('public.toro_execution_runs',array['id','org_id','task_id','decision_id','run_key','idempotency_key','correlation_id','trace_id','actor_kind','actor_ref','dot_ref','agent_ref','action_key','target_system','execution_authority_level','business_risk','status','verification_status','attempt_count','max_attempts','lease_owner','fencing_token','lease_expires_at','safe_metadata']),
  ('public.toro_execution_receipts',array['id','org_id','run_id','task_id','decision_id','receipt_type','status','verification_status','action_key','target_system','execution_authority_level','actor_kind','actor_ref','integrity_hash','desired_state','executed_state','observed_after','source_receipt_system','source_receipt_kind','source_receipt_ref','supersedes_receipt_id']),
  ('operations.executive_decisions',array['id','org_id','status','decision_value','processed_at','updated_at','decision_key','program_key','instruction','source_system','source_record_id','source_ref','superseded_by']),
  ('operations.knowledge_items',array['org_id','knowledge_key','structured_content','updated_at','active'])),
tables as (select e.*,c.oid,c.relrowsecurity from expected e join pg_class c on c.oid=e.table_name::regclass),
column_checks as (select t.table_name,bool_and(has_column_privilege(r.oid,t.oid,a.attnum,'SELECT')=(a.attname=any(t.columns))) as exact_select_columns,
  bool_or(has_column_privilege(r.oid,t.oid,a.attnum,'INSERT') or has_column_privilege(r.oid,t.oid,a.attnum,'UPDATE') or has_column_privilege(r.oid,t.oid,a.attnum,'REFERENCES')) as any_column_write
  from tables t cross join reader r join pg_attribute a on a.attrelid=t.oid and a.attnum>0 and not a.attisdropped group by t.table_name)
select jsonb_build_object(
  'at',clock_timestamp(),'reader',(select to_jsonb(r)-'oid' from reader r),
  'reader_exists',(select count(*)=1 from reader),
  'memberships',(select coalesce(jsonb_agg(jsonb_build_object('role',pg_get_userbyid(m.roleid),'member',pg_get_userbyid(m.member),'grantor',pg_get_userbyid(m.grantor),'admin',m.admin_option,'inherit',m.inherit_option,'set',m.set_option)),'[]'::jsonb)
    from pg_auth_members m join reader r on m.roleid=r.oid or m.member=r.oid),
  'schemas',(select jsonb_agg(jsonb_build_object('schema',s,'usage',has_schema_privilege(r.oid,s,'USAGE'),'create',has_schema_privilege(r.oid,s,'CREATE'))) from reader r cross join unnest(array['public','operations']) s),
  'tables',(select jsonb_agg(jsonb_build_object('table',t.table_name,'rls',t.relrowsecurity,'table_select',has_table_privilege(r.oid,t.oid,'SELECT'),'table_write',has_table_privilege(r.oid,t.oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'exact_select_columns',cc.exact_select_columns,'any_column_write',cc.any_column_write)) from tables t join column_checks cc using(table_name) cross join reader r),
  'policies',(select coalesce(jsonb_agg(jsonb_build_object('table',p.polrelid::regclass::text,'name',p.polname,'command',p.polcmd,'permissive',p.polpermissive,'using',pg_get_expr(p.polqual,p.polrelid)) order by p.polname),'[]'::jsonb) from pg_policy p cross join reader r where r.oid=any(p.polroles)),
  'unexpected_security_definer_execute',(select coalesce(jsonb_agg(p.oid::regprocedure::text),'[]'::jsonb) from pg_proc p join pg_namespace n on n.oid=p.pronamespace cross join reader r where n.nspname in('public','operations') and p.prosecdef and has_function_privilege(r.oid,p.oid,'EXECUTE')),
  'writer_off',(select count(*)=1 from operations.knowledge_items where org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid and knowledge_key='toro_alegra_connector_v2' and active and structured_content->'runtime_write_enabled'='false'::jsonb)
) as reader_catalog_readback;
rollback;
-- Require all expected columns, zero write/create/unexpected function access,
-- exactly eight expected policies (four permissive + four restrictive),
-- managed postgres membership explicitly reviewed and Writer OFF.
-- Otherwise stop and use only the separately authorized conditional rollback.
-- Native RLS allow/deny remains pending the separately approved dedicated
-- reader LOGIN/TLS session: reader_session_checks_v1.sql. Never widen SET
-- membership to make a test pass; NOLOGIN catalog stage is not runtime proof.
