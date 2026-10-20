-- REVIEW ONLY. NOT APPLIED. Reverses only the two RPCs and new financial grants/policies.
-- Disable TORO_PORTAL_READ_TRANSPORT=rpc_v1 in the authorized runtime first.
-- Confirm no concurrent consumer depends on these functions/column grants.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';
do $rollback_guard$
begin
  -- Refuse removal after function/policy/privilege drift. No CASCADE.
  if not exists (select 1 from pg_catalog.pg_proc where oid='public.toro_portal_brain_read_v1(uuid,uuid)'::regprocedure and not prosecdef and md5(replace(prosrc,chr(13),''))='4fb7a1034e6356db2fe6619ebf5b8965') then raise exception 'Rollback function drift: toro_portal_brain_read_v1'; end if;
  if not exists (select 1 from pg_catalog.pg_proc where oid='public.toro_portal_owner_attention_read_v1(uuid,uuid)'::regprocedure and not prosecdef and md5(replace(prosrc,chr(13),''))='ef281a7081b42459edcaeb66bbfb0615') then raise exception 'Rollback function drift: toro_portal_owner_attention_read_v1'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='finance' and tablename='invoices')<>1 or not exists (select 1 from pg_catalog.pg_policies where schemaname='finance' and tablename='invoices' and policyname='portal_narrow_invoices_read_v1' and cmd='SELECT' and roles=array['authenticated']::name[] and qual='private.has_org_role(org_id, ARRAY[''ADMIN''::text, ''GERENCIA''::text])') then raise exception 'Rollback policy drift: finance.invoices'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='operations' and tablename='communication_followups')<>1 or not exists (select 1 from pg_catalog.pg_policies where schemaname='operations' and tablename='communication_followups' and policyname='portal_narrow_followups_read_v1' and cmd='SELECT' and roles=array['authenticated']::name[] and qual='private.has_org_role(org_id, ARRAY[''ADMIN''::text, ''GERENCIA''::text])') then raise exception 'Rollback policy drift: operations.communication_followups'; end if;
  if not has_schema_privilege('authenticated','finance','USAGE') then raise exception 'Rollback schema privilege drift'; end if;
  if has_table_privilege('authenticated','operations.communication_followups','SELECT,INSERT,UPDATE,DELETE,TRUNCATE') or exists (select 1 from pg_catalog.pg_attribute a where a.attrelid='operations.communication_followups'::regclass and a.attnum>0 and not a.attisdropped and (has_column_privilege('authenticated',a.attrelid,a.attname,'SELECT') is distinct from (a.attname=any(array['org_id','followup_key','subject','followup_state','priority','owner_agent','human_owner','due_date','source_url','mailbox','related_obligation_key','active','id']::text[])) or has_column_privilege('authenticated',a.attrelid,a.attname,'INSERT,UPDATE'))) then raise exception 'Rollback column/write privilege drift: operations.communication_followups'; end if;
  if has_table_privilege('authenticated','finance.invoices','SELECT,INSERT,UPDATE,DELETE,TRUNCATE') or exists (select 1 from pg_catalog.pg_attribute a where a.attrelid='finance.invoices'::regclass and a.attnum>0 and not a.attisdropped and (has_column_privilege('authenticated',a.attrelid,a.attname,'SELECT') is distinct from (a.attname=any(array['org_id','invoice_key','issuer_name','document_number','due_date','currency','total','payment_status','obligation_key','mailbox','source_url','active','id']::text[])) or has_column_privilege('authenticated',a.attrelid,a.attname,'INSERT,UPDATE'))) then raise exception 'Rollback column/write privilege drift: finance.invoices'; end if;
  -- USAGE must not activate latent access to other financial objects.
  if exists (select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
      where n.nspname='finance' and c.relname<>'invoices' and case when c.relkind in ('r','v','m','p','f') then
        has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE') or exists (
          select 1 from pg_catalog.pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
            and has_column_privilege('authenticated',c.oid,a.attname,'SELECT,INSERT,UPDATE')) else false end)
      or exists (select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
        where n.nspname='finance' and has_function_privilege('authenticated',p.oid,'EXECUTE'))
      or exists (select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
        where n.nspname='finance' and case when c.relkind='S' then has_sequence_privilege('authenticated',c.oid,'USAGE,SELECT,UPDATE') else false end) then
    raise exception 'Rollback financial consumer privilege drift';
  end if;
end;
$rollback_guard$;

drop function public.toro_portal_brain_read_v1(uuid,uuid);
drop function public.toro_portal_owner_attention_read_v1(uuid,uuid);
drop policy portal_narrow_followups_read_v1 on operations.communication_followups;
revoke select (org_id,followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key,active,id) on operations.communication_followups from authenticated;
drop policy portal_narrow_invoices_read_v1 on finance.invoices;
revoke select (org_id,invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url,active,id) on finance.invoices from authenticated;
revoke usage on schema finance from authenticated;
-- Existing Kross invoker view/registry RLS never changed; there is no Kross rollback.
commit;
