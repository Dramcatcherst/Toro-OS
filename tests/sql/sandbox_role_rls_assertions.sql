do $$
begin
  if exists (select 1 from pg_class where oid in ('public.roles'::regclass,'public.user_roles'::regclass) and not relrowsecurity) then
    raise exception 'expected RLS on both role tables';
  end if;
  if (select count(*) from pg_policies where schemaname='public' and tablename in ('roles','user_roles')) <> 2 then
    raise exception 'expected exactly two role policies';
  end if;
end
$$;

select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',false);
set role authenticated;
do $$
declare role_rows integer; user_role_rows integer;
begin
  select count(*) into role_rows from public.roles;
  select count(*) into user_role_rows from public.user_roles;
  if role_rows <> 1 or user_role_rows <> 1 then
    raise exception 'ADMIN self-read leaked role rows: roles %, user_roles %',role_rows,user_role_rows;
  end if;
end
$$;
reset role;

select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',false);
set role authenticated;
do $$
declare codes text[]; orgs uuid[];
begin
  select array_agg(code order by code) into codes from public.roles;
  select array_agg(org_id order by org_id) into orgs from public.user_roles;
  if codes is distinct from array['EMPLEADO']::text[] then raise exception 'employee role scope mismatch: %',codes; end if;
  if orgs is distinct from array['10000000-0000-4000-8000-000000000001'::uuid] then raise exception 'employee org scope mismatch: %',orgs; end if;
end
$$;
reset role;

select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000004',false);
set role authenticated;
do $$
declare n integer;
begin
  select count(*) into n from public.user_roles;
  if n <> 0 then raise exception 'revoked role remained visible'; end if;
  select count(*) into n from public.roles;
  if n <> 0 then raise exception 'revoked role code remained visible'; end if;
end
$$;
reset role;

set role authenticated;
do $$
begin
  begin insert into public.user_roles(id,org_id,user_id,role_id) values
    ('40000000-0000-4000-8000-000000000099','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001');
    raise exception 'authenticated insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end
$$;
reset role;

set role service_role;
do $$
declare n integer;
begin
  select count(*) into n from public.user_roles;
  if n <> 4 then raise exception 'service role expected four rows, got %',n; end if;
end
$$;
reset role;
