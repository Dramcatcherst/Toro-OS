-- Prepared candidate only. Apply after the optional-envelope reader is deployed and authenticated acceptance/reversal gates pass.
-- Reuses the existing SECURITY INVOKER function and RLS; no grants, roles, policies, tables or writers change.
BEGIN;
DO $guard$
BEGIN
  IF md5(pg_get_functiondef('public.toro_portal_brain_read_v1(uuid,uuid)'::regprocedure)) <> '7bc9956de1fffe806facd553fd4582d1' THEN
    RAISE EXCEPTION 'Portal Brain read definition changed; reread and reconcile before applying';
  END IF;
END
$guard$;
CREATE OR REPLACE FUNCTION public.toro_portal_brain_read_v1(p_org_id uuid, p_actor_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
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
  -- Optional, property-bound management read. Existing Brain sources and role ceiling are unchanged.
  if p_org_id = '595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid
      and private.has_org_role(p_org_id,array['ADMIN','GERENCIA']::text[]) then
    result := result || jsonb_build_object('hotelOperations', jsonb_build_object(
      'propertyId','7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid,
      'tasks',jsonb_build_object('limit',201,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (
        select id,org_id,property_id,task_name,status,priority,area,owner_name,assignee_name,due_date,source_system,updated_at,needs_revalidation
        from operations.tasks where org_id = p_org_id and property_id = '7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid and active = true
          and (status is null or lower(status) not in ('completed','cancelled','canceled','done','closed'))
        order by updated_at desc,id limit 201
      ) r),'[]'::jsonb)),
      'krossHealth',jsonb_build_object('limit',26,'rows',coalesce((select jsonb_agg(to_jsonb(r)) from (
        select id,org_id,property_id,source_name,snapshot_kind,source_as_of,observed_at,live_required,freshness_status,safe_for_current_state
        from integrations.kross_snapshot_health where org_id = p_org_id and property_id = '7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid
        order by observed_at desc nulls last,id limit 26
      ) r),'[]'::jsonb))
    ));
  end if;
  return result;
end;
$function$
;
COMMIT;
