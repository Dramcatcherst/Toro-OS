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
create table integrations.kross_snapshot_registry (id uuid,org_id uuid,property_id uuid,source_name text,source_table text,snapshot_kind text,row_count integer,source_as_of timestamp with time zone,observed_at timestamp with time zone,live_required boolean,max_expected_age interval,use_as_current_state boolean,notes text,source_system text);
alter table integrations.kross_snapshot_registry enable row level security;
grant select on integrations.kross_snapshot_registry to authenticated;
create policy kross_snapshot_management_delete on integrations.kross_snapshot_registry for delete to authenticated using (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text]));
create policy kross_snapshot_management_insert on integrations.kross_snapshot_registry for insert to authenticated with check (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text]));
create policy kross_snapshot_management_read on integrations.kross_snapshot_registry for select to authenticated using (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text, 'JEFE_DEPARTAMENTO'::text, 'AUDITOR'::text]));
create policy kross_snapshot_management_update on integrations.kross_snapshot_registry for update to authenticated using (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text])) with check (private.has_org_role(org_id, ARRAY['ADMIN'::text, 'GERENCIA'::text]));
create view integrations.kross_snapshot_health with (security_invoker=true,security_barrier=true) as  SELECT id,
    org_id,
    property_id,
    source_name,
    source_table,
    snapshot_kind,
    row_count,
    source_as_of,
    observed_at,
    live_required,
    max_expected_age,
    use_as_current_state,
    notes,
    source_system,
        CASE
            WHEN source_as_of IS NULL THEN 'unknown'::text
            WHEN max_expected_age IS NULL THEN 'unbounded'::text
            WHEN (now() - source_as_of) <= max_expected_age THEN 'fresh'::text
            ELSE 'stale'::text
        END AS freshness_status,
        CASE
            WHEN live_required AND (source_as_of IS NULL OR max_expected_age IS NULL OR (now() - source_as_of) > max_expected_age) THEN false
            ELSE true
        END AS safe_for_current_state
   FROM integrations.kross_snapshot_registry k;
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

-- Stress-only SELECT on communication_attention_v; real metadata has no grant.
create view operations.communication_attention_v with (security_invoker=true) as  SELECT id,
    org_id,
    property_id,
    followup_key,
    channel,
    mailbox,
    thread_id,
    message_id,
    sender,
    subject,
    received_at,
    followup_state,
    priority,
    owner_agent,
    human_owner,
    due_date,
    related_obligation_key,
    related_task_key,
    source_url,
    evidence,
    notes,
    last_checked_at,
    active,
        CASE
            WHEN followup_state = ANY (ARRAY['needs_reply'::text, 'draft_ready'::text]) THEN true
            WHEN followup_state = 'review'::text AND (priority = ANY (ARRAY['critical'::text, 'high'::text])) THEN true
            ELSE false
        END AS needs_human_action,
        CASE
            WHEN received_at IS NULL THEN NULL::integer
            ELSE GREATEST(0, CURRENT_DATE - (received_at AT TIME ZONE 'America/Costa_Rica'::text)::date)
        END AS age_days,
        CASE priority
            WHEN 'critical'::text THEN 1
            WHEN 'high'::text THEN 2
            WHEN 'normal'::text THEN 3
            ELSE 4
        END AS priority_rank
   FROM operations.communication_followups
  WHERE active = true AND (followup_state <> ALL (ARRAY['resolved'::text, 'no_reply_needed'::text]))
  ORDER BY (
        CASE priority
            WHEN 'critical'::text THEN 1
            WHEN 'high'::text THEN 2
            WHEN 'normal'::text THEN 3
            ELSE 4
        END), (
        CASE
            WHEN followup_state = ANY (ARRAY['needs_reply'::text, 'draft_ready'::text]) THEN 1
            WHEN followup_state = 'review'::text THEN 2
            WHEN followup_state = 'waiting_on_them'::text THEN 3
            ELSE 4
        END), due_date, received_at;
grant select on operations.communication_attention_v to authenticated;
