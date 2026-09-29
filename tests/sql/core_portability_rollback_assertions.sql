do $$
begin
  if exists (
    select 1 from information_schema.schemata where schema_name='core'
  ) then
    raise exception 'core schema still exists after rollback';
  end if;

  if to_regclass('core.parties') is not null
     or to_regclass('core.orders') is not null
     or to_regclass('core.work_objects') is not null then
    raise exception 'core tables still exist after rollback';
  end if;
end
$$;
