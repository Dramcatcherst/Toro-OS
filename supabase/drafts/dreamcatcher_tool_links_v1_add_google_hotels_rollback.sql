-- REVIEW ONLY / NOT APPLIED.
-- Restores the exact six-link production body observed before the LINK-244 change.
do $preflight$
declare
  v_oid oid;
  v_body_hash text;
begin
  select p.oid, md5(replace(p.prosrc, chr(13), ''))
    into v_oid, v_body_hash
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'dreamcatcher_tool_links_v1'
    and pg_get_function_identity_arguments(p.oid) = '';

  if v_oid is null then
    raise exception 'dreamcatcher_tool_links_v1() is missing';
  end if;
  if v_body_hash <> 'd31196c3bc2a570413bb06fe111c8742' then
    raise exception 'rollback refused for unexpected body: %', v_body_hash;
  end if;
end;
$preflight$;

create or replace function public.dreamcatcher_tool_links_v1()
returns table(id text, url text)
language sql stable security invoker
set search_path = ''
as $function$
  with source as (
    select k.structured_content
    from operations.knowledge_items k
    where k.org_id = '595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid
      and k.property_id = '7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid
      and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
      and k.visibility = 'internal'
      and auth.uid() is not null
      and private.has_org_role(k.org_id, array['ADMIN','GERENCIA','JEFE_DEPARTAMENTO','AUDITOR']::text[])
  ), entries as (
    select e.value->>'id' as id, e.value->>'url' as url,
      count(*) over(partition by e.value->>'id') as matches
    from source s cross join lateral jsonb_array_elements(
      case when jsonb_typeof(s.structured_content #> '{link_directory,entries}') = 'array'
        then s.structured_content #> '{link_directory,entries}' else '[]'::jsonb end
    ) e(value)
    where (select count(*) from source) = 1
  ), reviewed(id,url) as (values
    ('LINK-048','https://dreamcatcherhotel.krossbooking.com/admin/dashboard#/admin/tableau/planner?id=dreamcatcherhotel'),
    ('LINK-002','https://dreamcatcherhotel.kross.travel/'),
    ('LINK-178','https://app.wespeak.pro/chatv2'),
    ('LINK-086','https://dream-team-public.vercel.app/dreamteam/ingresar'),
    ('LINK-056','https://calendar.google.com/'),
    ('LINK-131','https://www.dropbox.com/home/Dreamcatcher%20Hotel')
  )
  select e.id,e.url from entries e join reviewed r using(id,url)
  where e.matches=1;
$function$;

revoke all on function public.dreamcatcher_tool_links_v1() from public,anon,authenticated,service_role;
grant execute on function public.dreamcatcher_tool_links_v1() to authenticated;

do $readback$
declare
  v_body_hash text;
begin
  select md5(replace(p.prosrc, chr(13), ''))
    into v_body_hash
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'dreamcatcher_tool_links_v1'
    and pg_get_function_identity_arguments(p.oid) = '';

  if v_body_hash <> 'a3e88afd0d1f2f6450f080c0c5fc44f9' then
    raise exception 'unexpected restored dreamcatcher_tool_links_v1() body: %', v_body_hash;
  end if;
end;
$readback$;
