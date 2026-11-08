-- DRAFT: removes only this exact, unchanged guard; leaves source and RPCs intact.
begin;
set local lock_timeout = '2s';
set local statement_timeout = '15s';
lock table operations.knowledge_items in share row exclusive mode;
do $rollback_preflight$
declare guard_oid oid;
begin
  guard_oid := pg_catalog.to_regprocedure('private.dreamcatcher_tool_directory_write_guard_v1()');
  if guard_oid is null or not exists (
    select 1 from pg_catalog.pg_proc p where p.oid=guard_oid
      and not p.prosecdef
      and pg_catalog.md5(pg_catalog.replace(p.prosrc,pg_catalog.chr(13),''))='b44c83d076a03ab8f62132882ea40c18'
      and pg_catalog.md5(pg_catalog.replace(pg_catalog.pg_get_functiondef(p.oid),pg_catalog.chr(13),''))='156d77e96557afe8fe8845711d38b9ef'
      and p.proowner='postgres'::regrole
      and p.proacl=array['postgres=X/postgres']::aclitem[]
  ) then
    raise exception 'directory guard is absent or changed; refuse rollback';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_trigger t
    where t.tgrelid='operations.knowledge_items'::regclass
      and t.tgname='dreamcatcher_tool_directory_write_guard_v1'
      and t.tgfoid=guard_oid and t.tgtype=23 and t.tgenabled='O'
      and t.tgqual is null and t.tgnargs=0 and not t.tgisinternal
      and (select pg_catalog.array_agg(a.attname::text order by a.attname)
        from pg_catalog.pg_attribute a where a.attrelid=t.tgrelid
          and a.attnum=any(t.tgattr))
        = array['knowledge_key','org_id','property_id','structured_content']::text[]
  ) then
    raise exception 'directory trigger is absent or changed; refuse rollback';
  end if;
end;
$rollback_preflight$;
drop trigger dreamcatcher_tool_directory_write_guard_v1 on operations.knowledge_items;
drop function private.dreamcatcher_tool_directory_write_guard_v1();
commit;
