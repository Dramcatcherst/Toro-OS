do $$
begin
  if to_regclass('identity.organization_memberships') is not null then
    raise exception 'membership table still exists after rollback';
  end if;

  if to_regprocedure('private.has_active_membership(uuid)') is not null then
    raise exception 'membership helper still exists after rollback';
  end if;

  if exists (
    select 1 from information_schema.schemata where schema_name='identity'
  ) then
    raise exception 'identity schema still exists after first-wave rollback';
  end if;
end
$$;
