-- DRAFT: not installed by a Portal deployment. Apply only through the reviewed
-- database release after these exact SQL bytes pass the local PostgreSQL tests.
-- Existing direct writers retain authority. This only rejects invalid documents;
-- it does not move proposals, rewrite source data, grant access or add a writer.
begin;
set local lock_timeout = '2s';
set local statement_timeout = '15s';

do $preflight$
begin
  -- Matches the existing Supabase migration/table/RPC owner verified at this cut.
  if current_user <> 'postgres' then
    raise exception 'directory guard requires the existing postgres migration owner';
  end if;
  if not exists (select 1 from pg_catalog.pg_class
    where oid = pg_catalog.to_regclass('operations.knowledge_items') and relrowsecurity) then
    raise exception 'knowledge_items with existing RLS is required';
  end if;
  if pg_catalog.to_regprocedure('private.dreamcatcher_tool_directory_write_guard_v1()') is not null
    or exists (select 1 from pg_catalog.pg_trigger where tgrelid='operations.knowledge_items'::regclass
      and tgname='dreamcatcher_tool_directory_write_guard_v1') then
    raise exception 'directory write guard already exists; inspect instead of replacing it';
  end if;
end;
$preflight$;

-- Bound the lock and close the gap between validating the current source and
-- enabling its guard. No canonical row is updated, even for the preflight.
lock table operations.knowledge_items in share row exclusive mode;

create function private.dreamcatcher_tool_directory_write_guard_v1()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  entries jsonb;
  entry jsonb;
  field text;
  seen text[] := array[]::text[];
begin
  if new.org_id is distinct from '595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid
    or new.property_id is distinct from '7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid
    or new.knowledge_key is distinct from 'dreamcatcher_system_database_directory_v1' then
    return new;
  end if;

  entries := new.structured_content #> '{link_directory,entries}';
  if pg_catalog.jsonb_typeof(entries) is distinct from 'array' then
    raise check_violation using message='directory entries must be an array',
      constraint='dreamcatcher_tool_directory_contract_v1';
  end if;
  -- Same finite source bound as the existing RPC; no hard-coded 244-row ceiling.
  if pg_catalog.jsonb_array_length(entries) not between 1 and 1000 then
    raise check_violation using message='directory entry count is outside the RPC contract',
      constraint='dreamcatcher_tool_directory_contract_v1';
  end if;

  for entry in select value from pg_catalog.jsonb_array_elements(entries) loop
    if pg_catalog.jsonb_typeof(entry) is distinct from 'object'
      or pg_catalog.jsonb_typeof(entry->'id') is distinct from 'string'
      or coalesce(entry->>'id','') !~ '^LINK-[0-9]{3,}$'
      or (entry->>'id') = any(seen) then
      raise check_violation using message='directory entries require unique contractual LINK IDs',
        detail='Keep proposals in link_directory.candidate_entries.',
        constraint='dreamcatcher_tool_directory_contract_v1';
    end if;
    foreach field in array array['name','url','purpose','project','category','provider',
      'state','lifecycle','priority','link_type','scope','visibility'] loop
      if pg_catalog.jsonb_typeof(entry->field) is distinct from 'string' then
        raise check_violation using message='directory entry fields must match the RPC contract',
          constraint='dreamcatcher_tool_directory_contract_v1';
      end if;
    end loop;
    if pg_catalog.jsonb_typeof(entry->'home_eligible') is distinct from 'boolean'
      or entry->>'visibility' <> 'internal' then
      raise check_violation using message='directory entry visibility or eligibility is invalid',
        constraint='dreamcatcher_tool_directory_contract_v1';
    end if;
    seen := pg_catalog.array_append(seen,entry->>'id');
  end loop;
  return new;
end;
$function$;

revoke all on function private.dreamcatcher_tool_directory_write_guard_v1()
from public, anon, authenticated, service_role;

-- Run the very same validator on a private temporary copy. This never fires
-- canonical audit triggers, changes timestamps, or echoes the source document.
create temporary table toro_directory_guard_preflight_v1 (
  org_id uuid, property_id uuid, knowledge_key text, structured_content jsonb
) on commit drop;
create trigger directory_guard_preflight_v1 before insert on toro_directory_guard_preflight_v1
for each row execute function private.dreamcatcher_tool_directory_write_guard_v1();

do $validate_current_source$
declare source_count integer;
begin
  insert into toro_directory_guard_preflight_v1
  select org_id,property_id,knowledge_key,structured_content from operations.knowledge_items
  where id='50df0e7d-1aed-489a-a942-274715734dd0'::uuid
    and org_id='595801ce-2895-4d91-81ae-e8d1d5cc8593'::uuid
    and property_id='7ac9e46e-3b56-44d6-96f9-9d0b63bc943b'::uuid
    and knowledge_key='dreamcatcher_system_database_directory_v1';
  get diagnostics source_count = row_count;
  if source_count <> 1 then
    raise exception 'expected one canonical directory for write-guard preflight';
  end if;
end;
$validate_current_source$;

create trigger dreamcatcher_tool_directory_write_guard_v1
before insert or update of org_id,property_id,knowledge_key,structured_content
on operations.knowledge_items
for each row execute function private.dreamcatcher_tool_directory_write_guard_v1();
commit;
