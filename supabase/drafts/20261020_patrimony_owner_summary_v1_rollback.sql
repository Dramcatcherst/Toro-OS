-- REVIEW ONLY. NOT APPLIED. Removes only the additive aggregate RPC.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $rollback_guard$
begin
  if not exists (
    select 1 from pg_catalog.pg_proc
    where oid = 'public.toro_patrimony_owner_summary_v1(uuid,uuid)'::regprocedure
      and not prosecdef
      and provolatile = 's'
      and proconfig @> array['search_path=""']::text[]
      and md5(replace(prosrc,E'\r\n',E'\n')) = '36326109d626a62532a12dd16238d45d'
  ) then
    raise exception 'Rollback function drift';
  end if;

  if has_function_privilege('public','public.toro_patrimony_owner_summary_v1(uuid,uuid)','EXECUTE')
      or has_function_privilege('anon','public.toro_patrimony_owner_summary_v1(uuid,uuid)','EXECUTE')
      or not has_function_privilege('authenticated','public.toro_patrimony_owner_summary_v1(uuid,uuid)','EXECUTE')
      or has_function_privilege('service_role','public.toro_patrimony_owner_summary_v1(uuid,uuid)','EXECUTE') then
    raise exception 'Rollback ACL drift';
  end if;
end;
$rollback_guard$;

drop function public.toro_patrimony_owner_summary_v1(uuid,uuid);
commit;
