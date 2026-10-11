-- SYNTHETIC LOCAL QA ONLY; never run on the canonical project.
create role anon nologin; create role authenticated nologin; create role service_role nologin;
create schema auth; create schema private; create schema operations; create schema integrations; create schema finance;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table public.roles (id uuid primary key,code text);
create table public.user_roles (org_id uuid,user_id uuid,role_id uuid,status text,revoked_at timestamptz);
create table public.organizations (id uuid primary key,name text,status text,deleted_at timestamptz);
grant usage on schema auth,private,operations,integrations to authenticated;
grant select on public.organizations to authenticated;
alter table public.organizations enable row level security;
CREATE OR REPLACE FUNCTION private.has_org_role(target_org uuid, allowed_roles text[])
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.org_id = target_org
      and ur.user_id = (select auth.uid())
      and ur.revoked_at is null
      and ur.status = 'active'
      and (
        r.code = any(allowed_roles)
        or (r.code = 'ADMIN' and 'ADMINISTRADOR' = any(allowed_roles))
        or (r.code = 'RRHH' and 'RECURSOS_HUMANOS' = any(allowed_roles))
        or (r.code = 'JEFE_DEPARTAMENTO' and 'JEFATURA' = any(allowed_roles))
        or (r.code = 'EMPLEADO' and 'COLABORADOR' = any(allowed_roles))
      )
  );
$function$;
create policy organizations_read on public.organizations for select to authenticated using (private.has_org_role(id,array['ADMIN','GERENCIA','JEFE_DEPARTAMENTO','AUDITOR']::text[]));
create table operations.projects (id uuid,org_id uuid,property_id uuid,project_key text,project_name text,category text,priority text,status text,impact text,difficulty text,owner_name text,business_area text,summary text,next_action text,potential text,time_horizon text,notes text,active boolean,source_system text,source_table text,source_record_id text,created_at timestamp with time zone,updated_at timestamp with time zone,source_status_raw text,migration_classification text,needs_revalidation boolean,project_level text,parent_project_key text,canonical_module_key text,merged_into_project_key text,owner_agent text,completion_pct numeric,last_consolidated_at timestamp with time zone);
alter table operations.projects enable row level security;
grant select on operations.projects to authenticated;
create policy projects_management_read on operations.projects for select to authenticated using (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text, 'JEFE_DEPARTAMENTO'::text, 'AUDITOR'::text]));
create table finance.invoices (id uuid,org_id uuid,property_id uuid,invoice_key text,source_system text,mailbox text,message_id text,thread_id text,source_received_at timestamp with time zone,source_subject text,source_sender text,source_url text,doc_type text,document_number text,tax_key text,issuer_name text,issuer_tax_id text,receiver_name text,receiver_tax_id text,issue_date date,due_date date,currency text,subtotal numeric,tax numeric,total numeric,balance_due numeric,business_scope text,property_scope text,expense_category text,obligation_key text,supplier_id uuid,payment_status text,tax_validity text,attachment_names jsonb,pdf_filename text,xml_filename text,response_xml_filename text,duplicate_group_key text,verification_status text,notes text,active boolean,created_at timestamp with time zone,updated_at timestamp with time zone,invoice_direction text);
alter table finance.invoices enable row level security;
create table operations.obligations (id uuid,org_id uuid,property_id uuid,project_id uuid,obligation_key text,obligation_name text,obligation_type text,business_or_project_key text,legal_entity_label text,property_label text,counterparty text,recurrence text,last_completed_period text,last_completed_date date,last_period_end date,last_paid_date date,last_paid_amount numeric,currency text,next_due_date date,next_review_date date,due_date_confidence text,due_date_basis text,status text,verification_status text,privacy_class text,owner_agent text,human_owner text,canonical_domain text,canonical_ref text,source_system text,source_path text,source_file_id text,source_record_id text,evidence text,notes text,active boolean,created_at timestamp with time zone,updated_at timestamp with time zone,current_amount numeric,current_amount_currency text,current_amount_as_of date,current_amount_kind text);
alter table operations.obligations enable row level security;
grant select on operations.obligations to authenticated;
grant insert,update,delete on operations.obligations to authenticated;
create policy obligations_management_read on operations.obligations for select to authenticated using (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text, 'CONTABILIDAD'::text, 'AUDITOR'::text]));
create table integrations.kross_snapshot_health (id uuid,org_id uuid,property_id uuid,source_name text,source_table text,snapshot_kind text,row_count integer,source_as_of timestamp with time zone,observed_at timestamp with time zone,live_required boolean,max_expected_age interval,use_as_current_state boolean,notes text,source_system text,freshness_status text,safe_for_current_state boolean);
grant select on integrations.kross_snapshot_health to authenticated;
create table integrations.source_authority_rules (id uuid,org_id uuid,property_id uuid,domain text,official_source text,supporting_sources text,forbidden_sources text,reading_rule text,human_approval_required boolean,authority_level text,rule_status text,last_reviewed date,source_system text,source_table text,source_record_id text,created_at timestamp with time zone,updated_at timestamp with time zone);
alter table integrations.source_authority_rules enable row level security;
grant select on integrations.source_authority_rules to authenticated;
create policy source_authority_management_read on integrations.source_authority_rules for select to authenticated using (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text, 'JEFE_DEPARTAMENTO'::text, 'AUDITOR'::text]));
create table integrations.domain_governance (id uuid,org_id uuid,property_id uuid,domain text,data_owner text,review_cadence interval,max_source_age interval,quality_target numeric,current_quality_score numeric,criticality text,last_reviewed_at timestamp with time zone,next_review_at timestamp with time zone,notes text);
alter table integrations.domain_governance enable row level security;
grant select on integrations.domain_governance to authenticated;
create policy domain_governance_read on integrations.domain_governance for select to authenticated using (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text, 'JEFE_DEPARTAMENTO'::text, 'AUDITOR'::text]));
create table operations.communication_followups (id uuid,org_id uuid,property_id uuid,followup_key text,channel text,mailbox text,thread_id text,message_id text,sender text,subject text,received_at timestamp with time zone,followup_state text,priority text,owner_agent text,human_owner text,due_date date,related_obligation_key text,related_task_key text,source_url text,evidence text,notes text,last_checked_at timestamp with time zone,active boolean,created_at timestamp with time zone,updated_at timestamp with time zone);
alter table operations.communication_followups enable row level security;
