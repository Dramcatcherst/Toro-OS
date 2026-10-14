do $$
begin
  if exists (select 1 from pg_class where oid in ('public.roles'::regclass,'public.user_roles'::regclass) and relrowsecurity) then
    raise exception 'rollback did not disable RLS';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename in ('roles','user_roles')) then
    raise exception 'rollback left role policies';
  end if;
  if not has_table_privilege('authenticated','public.roles','SELECT')
      or not has_table_privilege('authenticated','public.user_roles','SELECT') then
    raise exception 'rollback changed read grants';
  end if;
end
$$;
