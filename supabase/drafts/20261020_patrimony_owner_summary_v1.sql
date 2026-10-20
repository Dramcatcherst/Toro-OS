-- REVIEW ONLY. NOT APPLIED. Canonical project abtyrbqlqbsastmridzp.
-- Adds one bounded aggregate RPC; no schema exposure, table/policy/data change or writer grant.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $preconditions$
declare
  target text;
  expected_tables constant text[] := array[
    'asset_interests','assets','conflicts','legal_entities','people',
    'property_relations','property_rights','registry_entries','source_snapshots',
    'subjects','vehicles'
  ];
begin
  if to_regprocedure('public.toro_patrimony_owner_summary_v1(uuid,uuid)') is not null then
    raise exception 'Patrimony owner summary already exists: do not reapply';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_proc
    where oid = 'private.toro_patrimony_has_active_org_role(uuid,text[])'::regprocedure
      and not prosecdef
      and provolatile = 's'
      and proconfig @> array['search_path=""']::text[]
      and md5(prosrc) = '854e847cc1fc73aaf66a069f840bad14'
  ) then
    raise exception 'Patrimony authorization helper drift';
  end if;

  if not has_schema_privilege('authenticated','patrimony','USAGE')
      or has_schema_privilege('anon','patrimony','USAGE') then
    raise exception 'Patrimony schema privilege drift';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'patrimony'
      and c.relkind = 'r'
      and c.relname = any(expected_tables)
      and c.relrowsecurity
  ) <> cardinality(expected_tables) then
    raise exception 'Patrimony table or RLS drift';
  end if;

  foreach target in array expected_tables loop
    if not has_table_privilege('authenticated',format('patrimony.%I',target),'SELECT')
        or has_table_privilege('authenticated',format('patrimony.%I',target),'INSERT,UPDATE,DELETE,TRUNCATE')
        or has_table_privilege('anon',format('patrimony.%I',target),'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') then
      raise exception 'Patrimony table privilege drift: %', target;
    end if;

    if (
      select count(*)
      from pg_catalog.pg_policies
      where schemaname = 'patrimony'
        and tablename = target
        and cmd = 'SELECT'
        and roles = array['authenticated']::name[]
        and qual = 'private.toro_patrimony_has_active_org_role(org_id, ARRAY[''ADMIN''::text, ''GERENCIA''::text, ''AUDITOR''::text])'
        and with_check is null
    ) <> 1 then
      raise exception 'Patrimony policy drift: %', target;
    end if;
  end loop;
end;
$preconditions$;

create function public.toro_patrimony_owner_summary_v1(p_org_id uuid, p_actor_id uuid)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $rpc$
declare
  result jsonb;
begin
  if current_user <> 'authenticated'
      or auth.uid() is null
      or p_actor_id is distinct from auth.uid()
      or p_org_id is null
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'toro_role','') <> 'FOUNDER'
      or not private.toro_patrimony_has_active_org_role(p_org_id,array['ADMIN']::text[]) then
    raise exception using errcode = '42501', message = 'Patrimony owner summary denied';
  end if;

  select jsonb_build_object(
    'contract','patrimony-owner-summary-v1',
    'actorId',auth.uid(),
    'orgId',p_org_id,
    'generatedAt',statement_timestamp(),
    'snapshot',coalesce((
      select jsonb_build_object(
        'matrixVersion',s.matrix_version,
        'observedAt',s.observed_at,
        'verifiedAt',s.verified_at
      )
      from patrimony.source_snapshots s
      where s.org_id = p_org_id
      order by s.verified_at desc nulls last,s.observed_at desc,s.id
      limit 1
    ),'null'::jsonb),
    'counts',jsonb_build_object(
      'snapshots',(select count(*) from patrimony.source_snapshots x where x.org_id = p_org_id),
      'subjects',(select count(*) from patrimony.subjects x where x.org_id = p_org_id),
      'legalEntities',(select count(*) from patrimony.legal_entities x where x.org_id = p_org_id),
      'people',(select count(*) from patrimony.people x where x.org_id = p_org_id),
      'assets',(select count(*) from patrimony.assets x where x.org_id = p_org_id),
      'propertyRights',(select count(*) from patrimony.property_rights x where x.org_id = p_org_id),
      'vehicles',(select count(*) from patrimony.vehicles x where x.org_id = p_org_id),
      'assetInterests',(select count(*) from patrimony.asset_interests x where x.org_id = p_org_id),
      'registryEntries',(select count(*) from patrimony.registry_entries x where x.org_id = p_org_id),
      'propertyRelations',(select count(*) from patrimony.property_relations x where x.org_id = p_org_id),
      'conflicts',(select count(*) from patrimony.conflicts x where x.org_id = p_org_id)
    ),
    'conflicts',jsonb_build_object(
      'open',(select count(*) from patrimony.conflicts x where x.org_id = p_org_id and x.status <> 'resolved'),
      'critical',(select count(*) from patrimony.conflicts x where x.org_id = p_org_id and x.status <> 'resolved' and x.severity = 'critical'),
      'high',(select count(*) from patrimony.conflicts x where x.org_id = p_org_id and x.status <> 'resolved' and x.severity = 'high')
    )
  ) into result;

  return result;
end;
$rpc$;

revoke all on function public.toro_patrimony_owner_summary_v1(uuid,uuid)
from public,anon,authenticated,service_role;
grant execute on function public.toro_patrimony_owner_summary_v1(uuid,uuid) to authenticated;

commit;
