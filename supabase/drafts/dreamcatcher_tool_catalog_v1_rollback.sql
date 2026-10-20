-- REVIEW ONLY / NOT APPLIED.
-- Rollback for the additive Dreamcatcher complete-catalogue RPC only.
-- No CASCADE: any dependent object must be reviewed before removal.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $preflight$
declare
  v_function_oid oid;
  v_result text;
  v_body_hash text;
begin
  select
    p.oid,
    pg_get_function_result(p.oid),
    md5(replace(p.prosrc, chr(13), ''))
  into v_function_oid, v_result, v_body_hash
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'dreamcatcher_tool_catalog_v1'
    and pg_get_function_identity_arguments(p.oid) = ''
    and not p.prosecdef
    and p.provolatile = 's'
    and 'search_path=""' = any(coalesce(p.proconfig, array[]::text[]));

  if v_function_oid is null then
    raise exception 'expected catalogue RPC is absent or has drifted metadata';
  end if;

  if v_result <> (
    'TABLE(id text, name text, url text, purpose text, project text, '
    'category text, provider text, state text, lifecycle text, priority text, '
    'link_type text, scope text, home_eligible boolean)'
  ) then
    raise exception 'refusing to drop RPC with unexpected signature: %', v_result;
  end if;

  if v_body_hash <> 'ff22d13d6de4f95847e7350485da11de' then
    raise exception 'refusing to drop RPC with drifted function body';
  end if;

  if to_regprocedure('public.dreamcatcher_tool_links_v1()') is null then
    raise exception 'existing narrow allowlist RPC is missing';
  end if;
end;
$preflight$;

revoke all
on function public.dreamcatcher_tool_catalog_v1()
from public, anon, authenticated, service_role;

drop function public.dreamcatcher_tool_catalog_v1();

do $readback$
begin
  if to_regprocedure('public.dreamcatcher_tool_catalog_v1()') is not null then
    raise exception 'catalogue RPC rollback readback failed';
  end if;

  if to_regprocedure('public.dreamcatcher_tool_links_v1()') is null then
    raise exception 'existing narrow allowlist RPC was not preserved';
  end if;
end;
$readback$;

commit;
