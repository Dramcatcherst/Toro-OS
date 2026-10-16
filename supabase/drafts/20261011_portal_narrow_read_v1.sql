-- REVIEW ONLY. NOT APPLIED. Canonical project abtyrbqlqbsastmridzp.
-- No schema exposure, service key, new table, operational row or writer grant.
-- Reuses the observed active/non-revoked user_roles authorization helper unchanged.
-- Two new SECURITY INVOKER functions; one transaction, finite column/row projections.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';
do $preconditions$
declare target text; expected_rls boolean;
begin
  if to_regclass('public.organization_memberships') is not null then
    raise exception 'Membership model changed: review authorization parity';
  end if;
  if not exists (select 1 from pg_catalog.pg_proc where oid='private.has_org_role(uuid,text[])'::regprocedure
      and prosecdef and md5(prosrc)='c83c87aa1d6e6d946b7ca7a8511f470c') then
    raise exception 'Authorization helper drift: review before applying';
  end if;
  if not has_function_privilege('authenticated','private.has_org_role(uuid,text[])','EXECUTE') then
    raise exception 'Authorization helper unavailable';
  end if;
  if has_schema_privilege('authenticated','finance','USAGE') then
    raise exception 'Finance privilege baseline changed';
  end if;
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
    raise exception 'Finance latent privileges changed: review before granting USAGE';
  end if;
  foreach target in array array['finance.invoices','operations.communication_followups'] loop
    -- A new SELECT/USAGE must not revive a latent write permission.
    if has_table_privilege('authenticated',target,'INSERT,UPDATE,DELETE,TRUNCATE') or exists (
      select 1 from pg_catalog.pg_attribute a where a.attrelid=target::regclass and a.attnum>0 and not a.attisdropped
        and has_column_privilege('authenticated',target,a.attname,'INSERT,UPDATE')) then
      raise exception 'Target write privilege drift: %',target;
    end if;
    if has_table_privilege('authenticated',target,'SELECT') or exists (
      select 1 from pg_catalog.pg_attribute a where a.attrelid=target::regclass and a.attnum>0 and not a.attisdropped
        and has_column_privilege('authenticated',target,a.attname,'SELECT')) then
      raise exception 'Column privilege baseline changed: %',target;
    end if;
  end loop;
  if not exists (select 1 from pg_catalog.pg_class where oid='operations.projects'::regclass and relkind='r' and relrowsecurity=true and not relforcerowsecurity) then raise exception 'RLS drift: operations.projects'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='operations' and tablename='projects' and cmd in ('SELECT','ALL')) <> 1 then raise exception 'Read policy drift: operations.projects'; end if;
  if not exists (select 1 from pg_catalog.pg_class where oid='finance.invoices'::regclass and relkind='r' and relrowsecurity=true and not relforcerowsecurity) then raise exception 'RLS drift: finance.invoices'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='finance' and tablename='invoices') <> 0 then raise exception 'Read policy drift: finance.invoices'; end if;
  if not exists (select 1 from pg_catalog.pg_class where oid='operations.obligations'::regclass and relkind='r' and relrowsecurity=true and not relforcerowsecurity) then raise exception 'RLS drift: operations.obligations'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='operations' and tablename='obligations' and cmd in ('SELECT','ALL')) <> 1 then raise exception 'Read policy drift: operations.obligations'; end if;
  -- Kross health is an existing invoker view, not an RLS table. Never alter it.
  if not exists (select 1 from pg_catalog.pg_class where oid='integrations.kross_snapshot_health'::regclass
      and relkind='v' and reloptions @> array['security_invoker=true','security_barrier=true']::text[]) then
    raise exception 'Kross invoker view drift';
  end if;
  if md5(regexp_replace(pg_catalog.pg_get_viewdef('integrations.kross_snapshot_health'::regclass,true),'[[:space:]]','','g')) <> '3351f33f4a4d540f02d5af078d092946' then
    raise exception 'Kross view definition drift';
  end if;
  if not exists (select 1 from pg_catalog.pg_class where oid='integrations.kross_snapshot_registry'::regclass
      and relkind='r' and relrowsecurity and not relforcerowsecurity) then raise exception 'Kross registry RLS drift'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='integrations' and tablename='kross_snapshot_registry' and cmd in ('SELECT','ALL')) <> 1 then
    raise exception 'Kross registry read policy drift';
  end if;
  if not exists (select 1 from pg_catalog.pg_class where oid='integrations.source_authority_rules'::regclass and relkind='r' and relrowsecurity=true and not relforcerowsecurity) then raise exception 'RLS drift: integrations.source_authority_rules'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='integrations' and tablename='source_authority_rules' and cmd in ('SELECT','ALL')) <> 1 then raise exception 'Read policy drift: integrations.source_authority_rules'; end if;
  if not exists (select 1 from pg_catalog.pg_class where oid='integrations.domain_governance'::regclass and relkind='r' and relrowsecurity=true and not relforcerowsecurity) then raise exception 'RLS drift: integrations.domain_governance'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='integrations' and tablename='domain_governance' and cmd in ('SELECT','ALL')) <> 1 then raise exception 'Read policy drift: integrations.domain_governance'; end if;
  if not exists (select 1 from pg_catalog.pg_class where oid='operations.communication_followups'::regclass and relkind='r' and relrowsecurity=true and not relforcerowsecurity) then raise exception 'RLS drift: operations.communication_followups'; end if;
  if (select count(*) from pg_catalog.pg_policies where schemaname='operations' and tablename='communication_followups') <> 0 then raise exception 'Read policy drift: operations.communication_followups'; end if;
end;
$preconditions$;

-- Minimum new SELECT columns include WHERE/order fields; no whole-table SELECT.
grant usage on schema finance to authenticated;
grant select (org_id,followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key,active,id) on operations.communication_followups to authenticated;
create policy portal_narrow_followups_read_v1 on operations.communication_followups for select to authenticated using (private.has_org_role(org_id,array['ADMIN','GERENCIA']::text[]));
grant select (org_id,invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url,active,id) on finance.invoices to authenticated;
create policy portal_narrow_invoices_read_v1 on finance.invoices for select to authenticated using (private.has_org_role(org_id,array['ADMIN','GERENCIA']::text[]));

-- Existing Kross invoker view and underlying registry RLS remain unchanged.

create function public.toro_portal_brain_read_v1(p_org_id uuid,p_actor_id uuid)
returns jsonb language plpgsql stable security invoker set search_path = ''
as $rpc$
declare result jsonb;
begin
  if current_user <> 'authenticated' or auth.uid() is null or p_actor_id is distinct from auth.uid()
      or p_org_id is null or not private.has_org_role(p_org_id,array['ADMIN','GERENCIA','JEFE_DEPARTAMENTO','AUDITOR']::text[]) then
    raise exception using errcode='42501',message='Portal read denied';
  end if;
  select jsonb_build_object('contract','portal-read-rpc-v1','actorId',auth.uid(),'orgId',p_org_id,
    'generatedAt',statement_timestamp(),'sources',jsonb_build_object(
      'organization',jsonb_build_object('limit',1,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (select id,name,status from public.organizations where id = p_org_id and deleted_at is null order by id limit 1) r),'[]'::jsonb)),
      'projects',jsonb_build_object('limit',25,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (select org_id,id,project_name,priority,status,business_area,canonical_module_key,completion_pct,needs_revalidation,source_system,updated_at from operations.projects where org_id = p_org_id and active = true order by updated_at desc,id limit 25) r),'[]'::jsonb)),
      'sourceAuthority',jsonb_build_object('limit',25,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (select org_id,id,domain,official_source,human_approval_required,authority_level,rule_status,last_reviewed from integrations.source_authority_rules where org_id = p_org_id order by domain,id limit 25) r),'[]'::jsonb)),
      'domainGovernance',jsonb_build_object('limit',25,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (select org_id,id,domain,criticality,quality_target,current_quality_score,last_reviewed_at,next_review_at from integrations.domain_governance where org_id = p_org_id order by domain,id limit 25) r),'[]'::jsonb)),
      'krossHealth',jsonb_build_object('limit',25,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (select org_id,id,source_name,snapshot_kind,source_as_of,observed_at,live_required,freshness_status,safe_for_current_state from integrations.kross_snapshot_health where org_id = p_org_id order by observed_at desc nulls last,id limit 25) r),'[]'::jsonb))
    )) into result;
  if jsonb_array_length(result#>'{sources,organization,rows}') <> 1 then raise exception using errcode='42501',message='Portal organization unavailable'; end if;
  return result;
end;
$rpc$;
revoke all on function public.toro_portal_brain_read_v1(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.toro_portal_brain_read_v1(uuid,uuid) to authenticated;

create function public.toro_portal_owner_attention_read_v1(p_org_id uuid,p_actor_id uuid)
returns jsonb language plpgsql stable security invoker set search_path = ''
as $rpc$
declare result jsonb;
begin
  if current_user <> 'authenticated' or auth.uid() is null or p_actor_id is distinct from auth.uid()
      or p_org_id is null or not private.has_org_role(p_org_id,array['ADMIN','GERENCIA']::text[]) then
    raise exception using errcode='42501',message='Portal read denied';
  end if;
  select jsonb_build_object('contract','portal-read-rpc-v1','actorId',auth.uid(),'orgId',p_org_id,
    'generatedAt',statement_timestamp(),'sources',jsonb_build_object(
      'followups',jsonb_build_object('limit',100,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (select org_id,followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key from operations.communication_followups where org_id = p_org_id and active = true order by followup_key,id limit 100) r),'[]'::jsonb)),
      'obligations',jsonb_build_object('limit',150,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (select org_id,obligation_key,obligation_name,counterparty,status,verification_status,next_due_date,next_review_date,current_amount,current_amount_currency,owner_agent,human_owner,source_system,source_path from operations.obligations where org_id = p_org_id and active = true order by obligation_key,id limit 150) r),'[]'::jsonb)),
      'invoices',jsonb_build_object('limit',200,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (select org_id,invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url from finance.invoices where org_id = p_org_id and active = true order by invoice_key,id limit 200) r),'[]'::jsonb))
    )) into result;
  return result;
end;
$rpc$;
revoke all on function public.toro_portal_owner_attention_read_v1(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.toro_portal_owner_attention_read_v1(uuid,uuid) to authenticated;

commit;
