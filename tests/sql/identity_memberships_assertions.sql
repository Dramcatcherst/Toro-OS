-- Assertions for identity.organization_memberships.
-- Safe to execute repeatedly after the draft backfill.

do $$
declare
  n integer;
begin
  select count(*) into n from identity.organization_memberships;
  if n <> 5 then
    raise exception 'expected 5 memberships, got %', n;
  end if;

  select count(*) into n
  from identity.organization_memberships
  where membership_type='employee'
    and primary_employee_id is not null;
  if n <> 4 then
    raise exception 'expected 4 exact employee links, got %', n;
  end if;

  select count(*) into n
  from identity.organization_memberships
  where membership_type='other'
    and primary_employee_id is null;
  if n <> 1 then
    raise exception 'expected 1 unclassified non-employee relationship, got %', n;
  end if;

  select count(*) into n
  from identity.organization_memberships
  where org_id='10000000-0000-4000-8000-000000000001'
    and user_id='20000000-0000-4000-8000-000000000001';
  if n <> 1 then
    raise exception 'multiple roles must still produce exactly one membership';
  end if;
end
$$;

-- ADMIN user 1 may read all four Org A memberships while active.
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-4000-8000-000000000001',
  false
);
set role authenticated;
do $$
declare n integer;
begin
  select count(*) into n
  from identity.organization_memberships
  where org_id='10000000-0000-4000-8000-000000000001';
  if n <> 4 then
    raise exception 'active Org A ADMIN expected 4 visible memberships, got %',n;
  end if;

  if not private.has_active_membership(
    '10000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'active membership helper expected true';
  end if;
end
$$;
reset role;

-- Normal employee user 2 sees only self and cannot read another org.
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-4000-8000-000000000002',
  false
);
set role authenticated;
do $$
declare n integer;
begin
  select count(*) into n from identity.organization_memberships;
  if n <> 1 then
    raise exception 'employee expected self-only membership visibility, got %',n;
  end if;

  select count(*) into n
  from identity.organization_memberships
  where org_id='10000000-0000-4000-8000-000000000002';
  if n <> 0 then
    raise exception 'employee leaked cross-org membership rows';
  end if;

  if private.has_active_membership(
    '10000000-0000-4000-8000-000000000002'
  ) then
    raise exception 'employee must not have active membership in Org B';
  end if;
end
$$;
reset role;

-- Org B ADMIN user 3 cannot see Org A.
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-4000-8000-000000000003',
  false
);
set role authenticated;
do $$
declare n integer;
begin
  select count(*) into n
  from identity.organization_memberships
  where org_id='10000000-0000-4000-8000-000000000001';
  if n <> 0 then
    raise exception 'Org B admin leaked Org A membership rows';
  end if;

  select count(*) into n from identity.organization_memberships;
  if n <> 1 then
    raise exception 'Org B admin expected only own Org B rows, got %',n;
  end if;
end
$$;
reset role;

-- Role without membership does not unlock privileged reads.
begin;
insert into public.user_roles (org_id,user_id,role_id)
values (
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000006',
  '30000000-0000-4000-8000-000000000001'
);
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-4000-8000-000000000006',
  false
);
set local role authenticated;
do $$
declare n integer;
begin
  select count(*) into n from identity.organization_memberships;
  if n <> 0 then
    raise exception 'role without membership must not unlock organization membership rows';
  end if;
end
$$;
rollback;

-- Suspended admin retains self visibility but loses privileged org visibility.
begin;
set local role service_role;
update identity.organization_memberships
set status='suspended', updated_at=now()
where org_id='10000000-0000-4000-8000-000000000001'
  and user_id='20000000-0000-4000-8000-000000000001';
reset role;

select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-4000-8000-000000000001',
  false
);
set local role authenticated;
do $$
declare n integer;
begin
  select count(*) into n
  from identity.organization_memberships
  where org_id='10000000-0000-4000-8000-000000000001';
  if n <> 1 then
    raise exception 'suspended admin should see only self, got %',n;
  end if;

  if private.has_active_membership(
    '10000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'suspended membership helper expected false';
  end if;
end
$$;
rollback;

-- Cross-user/cross-org employee link must fail.
do $$
begin
  begin
    update identity.organization_memberships
    set primary_employee_id='40000000-0000-4000-8000-000000000003'
    where org_id='10000000-0000-4000-8000-000000000001'
      and user_id='20000000-0000-4000-8000-000000000002';

    raise exception 'employee-link mismatch was incorrectly accepted';
  exception
    when check_violation then
      null;
  end;
end
$$;

-- No anonymous table/schema access.
do $$
begin
  if has_schema_privilege('anon','identity','USAGE') then
    raise exception 'anon unexpectedly has identity schema usage';
  end if;

  if has_table_privilege(
    'anon',
    'identity.organization_memberships',
    'SELECT'
  ) then
    raise exception 'anon unexpectedly has membership select';
  end if;

  if has_table_privilege(
    'authenticated',
    'identity.organization_memberships',
    'INSERT'
  ) then
    raise exception 'authenticated unexpectedly has direct membership insert';
  end if;

  if not has_table_privilege(
    'service_role',
    'identity.organization_memberships',
    'SELECT,INSERT,UPDATE,DELETE'
  ) then
    raise exception 'service_role missing required server-side privileges';
  end if;
end
$$;
