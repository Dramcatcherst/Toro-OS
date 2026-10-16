-- REVIEW ONLY / NOT APPLIED.
-- Proposed additive RPC for the complete Dreamcatcher link catalogue.
-- It does not replace or broaden public.dreamcatcher_tool_links_v1().
-- Apply only after explicit schema-change authorization and isolated SQL tests.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $preflight$
declare
  v_source_count bigint;
  v_entry_count bigint;
  v_distinct_id_count bigint;
  v_invalid_entry_count bigint;
begin
  if to_regprocedure('public.dreamcatcher_tool_catalog_v1()') is not null then
    raise exception 'dreamcatcher_tool_catalog_v1 already exists; review drift instead of replacing it';
  end if;

  if to_regprocedure('public.dreamcatcher_tool_links_v1()') is null then
    raise exception 'existing narrow allowlist RPC is missing';
  end if;

  if to_regprocedure('private.has_org_role(uuid,text[])') is null
     or not has_function_privilege(
       'authenticated',
       'private.has_org_role(uuid,text[])',
       'EXECUTE'
     ) then
    raise exception 'required organization-role helper is unavailable to authenticated';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'operations'
      and c.relname = 'knowledge_items'
      and c.relkind in ('r', 'p')
      and c.relrowsecurity
  ) then
    raise exception 'operations.knowledge_items must exist with RLS enabled';
  end if;

  if not has_schema_privilege('authenticated', 'operations', 'USAGE')
     or not has_table_privilege(
       'authenticated',
       'operations.knowledge_items',
       'SELECT'
     ) then
    raise exception 'SECURITY INVOKER prerequisites are missing';
  end if;

  select count(*)
  into v_source_count
  from operations.knowledge_items k
  where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
    and k.org_id = '595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid
    and k.property_id = '7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid
    and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
    and k.visibility = 'internal'
    and k.active is true
    and (k.effective_from is null or k.effective_from <= current_date)
    and (k.effective_to is null or k.effective_to >= current_date)
    and jsonb_typeof(k.structured_content #> '{link_directory,entries}') = 'array';

  if v_source_count <> 1 then
    raise exception 'expected exactly one active, current canonical directory row; found %',
      v_source_count;
  end if;

  with source as (
    select k.structured_content
    from operations.knowledge_items k
    where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
      and k.org_id = '595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid
      and k.property_id = '7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid
      and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
      and k.visibility = 'internal'
      and k.active is true
      and (k.effective_from is null or k.effective_from <= current_date)
      and (k.effective_to is null or k.effective_to >= current_date)
  ), entries as (
    select e.value as entry
    from source s
    cross join lateral jsonb_array_elements(
      s.structured_content #> '{link_directory,entries}'
    ) e(value)
  )
  select
    count(*),
    count(distinct entry ->> 'id'),
    count(*) filter (
      where coalesce(jsonb_typeof(entry), 'missing') <> 'object'
        or coalesce(entry ->> 'id', '') !~ '^LINK-[0-9]{3,}$'
        or coalesce(jsonb_typeof(entry -> 'name'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'url'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'purpose'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'project'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'category'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'provider'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'state'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'lifecycle'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'priority'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'link_type'), 'missing') <> 'string'
        or coalesce(jsonb_typeof(entry -> 'scope'), 'missing') <> 'string'
        or coalesce(
          jsonb_typeof(entry -> 'home_eligible'),
          'missing'
        ) <> 'boolean'
        or coalesce(jsonb_typeof(entry -> 'visibility'), 'missing') <> 'string'
        or coalesce(entry ->> 'visibility', '') <> 'internal'
    )
  into v_entry_count, v_distinct_id_count, v_invalid_entry_count
  from entries;

  if v_entry_count not between 1 and 1000
     or v_entry_count <> v_distinct_id_count
     or v_invalid_entry_count <> 0 then
    raise exception
      'directory contract failed: entries %, distinct IDs %, invalid entries %',
      v_entry_count,
      v_distinct_id_count,
      v_invalid_entry_count;
  end if;
end;
$preflight$;

create function public.dreamcatcher_tool_catalog_v1()
returns table (
  id text,
  name text,
  url text,
  purpose text,
  project text,
  category text,
  provider text,
  state text,
  lifecycle text,
  priority text,
  link_type text,
  scope text,
  home_eligible boolean
)
language sql
stable
security invoker
set search_path = ''
as $function$
  with source as (
    select k.structured_content
    from operations.knowledge_items k
    where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
      and k.org_id = '595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid
      and k.property_id = '7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid
      and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
      and k.visibility = 'internal'
      and k.active is true
      and (k.effective_from is null or k.effective_from <= current_date)
      and (k.effective_to is null or k.effective_to >= current_date)
      and auth.uid() is not null
      and private.has_org_role(
        k.org_id,
        array['ADMIN', 'GERENCIA']::text[]
      )
  ), raw as (
    select e.ordinality, e.value as entry
    from source s
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(
          s.structured_content #> '{link_directory,entries}'
        ) = 'array'
          then s.structured_content #> '{link_directory,entries}'
        else '[]'::jsonb
      end
    ) with ordinality as e(value, ordinality)
    where (select count(*) from source) = 1
  ), gate as (
    select (
      count(*) between 1 and 1000
      and count(*) = count(distinct entry ->> 'id')
      and coalesce(
        bool_and(
          coalesce(jsonb_typeof(entry), 'missing') = 'object'
          and coalesce(entry ->> 'id', '') ~ '^LINK-[0-9]{3,}$'
          and coalesce(jsonb_typeof(entry -> 'name'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'url'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'purpose'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'project'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'category'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'provider'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'state'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'lifecycle'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'priority'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'link_type'), 'missing') = 'string'
          and coalesce(jsonb_typeof(entry -> 'scope'), 'missing') = 'string'
          and coalesce(
            jsonb_typeof(entry -> 'home_eligible'),
            'missing'
          ) = 'boolean'
          and coalesce(
            jsonb_typeof(entry -> 'visibility'),
            'missing'
          ) = 'string'
          and coalesce(entry ->> 'visibility', '') = 'internal'
        ),
        false
      )
    ) as ok
    from raw
  ), projected as (
    select
      r.ordinality,
      r.entry ->> 'id' as id,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'name', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        160
      ) as name,

      case
        when coalesce(r.entry ->> 'url', '') = '' then ''
        when length(r.entry ->> 'url') <= 2048
          and (r.entry ->> 'url') !~ '[[:cntrl:][:space:]]'
          and position(chr(92) in (r.entry ->> 'url')) = 0
          and (r.entry ->> 'url') !~* (
            '[?&#](token|access_token|id_token|refresh_token|jwt|'
            'api[_-]?key|key|secret|password|passwd|signature|sig|signed|'
            'auth|authorization|credential|code|'
            'x-amz-(credential|signature|security-token)|'
            'x-goog-(credential|signature))='
          )
          and (
            (r.entry ->> 'url') ~* (
              '^https://([a-z0-9]([a-z0-9.-]*[a-z0-9])?|'
              '\[[0-9a-f:.]+\])(:[0-9]{1,5})?([/?#].*)?$'
            )
            or (r.entry ->> 'url') ~* (
              '^mailto:[a-z0-9.!#$%&''*+/=?^_{}|~-]+'
              '@[a-z0-9.-]+[.][a-z]{2,63}$'
            )
            or (r.entry ->> 'url') ~ '^tel:[+]?[0-9().-]{6,30}$'
          )
          then r.entry ->> 'url'
        else ''
      end as url,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'purpose', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        500
      ) as purpose,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'project', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        120
      ) as project,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'category', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        100
      ) as category,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'provider', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        160
      ) as provider,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'state', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        120
      ) as state,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'lifecycle', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        80
      ) as lifecycle,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'priority', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        80
      ) as priority,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'link_type', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        80
      ) as link_type,

      left(
        btrim(regexp_replace(
          translate(coalesce(r.entry ->> 'scope', ''), '<>', ''),
          '[[:cntrl:]]+', ' ', 'g'
        )),
        120
      ) as scope,

      case
        when coalesce(
          jsonb_typeof(r.entry -> 'home_eligible'),
          'missing'
        ) = 'boolean'
          then (r.entry ->> 'home_eligible')::boolean
        else false
      end as home_eligible
    from raw r
  )
  select
    p.id,
    p.name,
    p.url,
    p.purpose,
    p.project,
    p.category,
    p.provider,
    p.state,
    p.lifecycle,
    p.priority,
    p.link_type,
    p.scope,
    p.home_eligible
  from projected p
  where (select ok from gate)
  order by p.ordinality;
$function$;

revoke all
on function public.dreamcatcher_tool_catalog_v1()
from public, anon, authenticated, service_role;

grant execute
on function public.dreamcatcher_tool_catalog_v1()
to authenticated;

do $readback$
declare
  v_function_oid oid;
  v_result text;
  v_public_execute boolean;
begin
  select p.oid, pg_get_function_result(p.oid)
  into v_function_oid, v_result
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'dreamcatcher_tool_catalog_v1'
    and pg_get_function_identity_arguments(p.oid) = ''
    and not p.prosecdef
    and p.provolatile = 's'
    and 'search_path=""' = any(coalesce(p.proconfig, array[]::text[]));

  if v_function_oid is null then
    raise exception 'catalogue RPC metadata readback failed';
  end if;

  if v_result <> (
    'TABLE(id text, name text, url text, purpose text, project text, '
    'category text, provider text, state text, lifecycle text, priority text, '
    'link_type text, scope text, home_eligible boolean)'
  ) then
    raise exception 'unexpected catalogue RPC result signature: %', v_result;
  end if;

  select exists (
    select 1
    from aclexplode(
      coalesce(
        p.proacl,
        acldefault('f', p.proowner)
      )
    ) a
    where a.grantee = 0
      and a.privilege_type = 'EXECUTE'
  )
  into v_public_execute
  from pg_catalog.pg_proc p
  where p.oid = v_function_oid;

  if v_public_execute
     or has_function_privilege('anon', v_function_oid, 'EXECUTE')
     or has_function_privilege('service_role', v_function_oid, 'EXECUTE')
     or not has_function_privilege(
       'authenticated',
       v_function_oid,
       'EXECUTE'
     ) then
    raise exception 'catalogue RPC privilege readback failed';
  end if;

  if to_regprocedure('public.dreamcatcher_tool_links_v1()') is null then
    raise exception 'existing narrow allowlist RPC was not preserved';
  end if;
end;
$readback$;

commit;

