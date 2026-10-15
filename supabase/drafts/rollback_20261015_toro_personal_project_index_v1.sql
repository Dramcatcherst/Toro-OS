-- SELECTIVE ROLLBACK DRAFT.
-- Run only after verifying no application dependency and no retained data.
-- Refuses to remove either table when rows exist. No CASCADE.

begin;

do $$
declare
  has_rows boolean;
begin
  if to_regclass('user_vault.project_links') is not null then
    execute 'select exists (select 1 from user_vault.project_links limit 1)'
      into has_rows;
    if has_rows then
      raise exception 'Refusing rollback: user_vault.project_links contains data';
    end if;
  end if;

  if to_regclass('user_vault.projects') is not null then
    execute 'select exists (select 1 from user_vault.projects limit 1)'
      into has_rows;
    if has_rows then
      raise exception 'Refusing rollback: user_vault.projects contains data';
    end if;
  end if;
end
$$;

drop table if exists user_vault.project_links;
drop table if exists user_vault.projects;

do $$
begin
  if exists (
    select 1
    from information_schema.schemata
    where schema_name = 'user_vault'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'user_vault'
  ) then
    execute 'drop schema user_vault';
  end if;
end
$$;

commit;
