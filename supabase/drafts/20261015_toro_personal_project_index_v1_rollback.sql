-- DRAFT ONLY. SAFE ROLLBACK FOR THE MATCHING UNAPPLIED DRAFT.
-- Never run without confirming that these objects were created by the reviewed migration.
-- Refuses to remove tables that contain user data. No CASCADE.

begin;

do $$
begin
  if to_regclass('user_vault.project_links') is not null
     and exists (select 1 from user_vault.project_links limit 1) then
    raise exception 'rollback blocked: user_vault.project_links contains rows';
  end if;

  if to_regclass('user_vault.projects') is not null
     and exists (select 1 from user_vault.projects limit 1) then
    raise exception 'rollback blocked: user_vault.projects contains rows';
  end if;
end
$$;

drop table if exists user_vault.project_links;
drop table if exists user_vault.projects;

-- This succeeds only when the schema is otherwise empty.
drop schema if exists user_vault;

commit;
