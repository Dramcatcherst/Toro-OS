-- REVIEW DRAFT ONLY. Refuse rollback if the contract has drifted or contains
-- any durable draft rows; a later release must preserve/audit those records.
begin;
set local lock_timeout = '2s';
set local statement_timeout = '15s';

do $rollback_preflight$
declare signature text;
declare procedure_id regprocedure;
declare definition_marker text;
begin
  if current_user <> 'postgres' then raise exception 'postgres owner required'; end if;
  if pg_catalog.to_regclass('integrations.communication_channel_drafts') is null
    or pg_catalog.to_regprocedure('public.toro_channel_draft_find_v1(uuid,uuid,text,text,text,text,text,uuid,text)') is null
    or pg_catalog.to_regprocedure('public.toro_channel_draft_read_v1(uuid,uuid,text,text,text,text,text,uuid)') is null
    or pg_catalog.to_regprocedure('public.toro_channel_draft_cas_v1(uuid,uuid,text,text,text,text,text,uuid,text,bigint,text,text,jsonb)') is null then
    raise exception 'channel draft contract missing or already changed';
  end if;
  if exists (select 1 from integrations.communication_channel_drafts) then
    raise exception 'channel draft rows exist; preserve and migrate them instead of rollback';
  end if;
  if not exists (select 1 from pg_catalog.pg_class
      where oid='integrations.communication_channel_drafts'::regclass
        and relrowsecurity and relowner=(select oid from pg_catalog.pg_roles where rolname=current_user))
    or exists (select 1 from pg_catalog.pg_policies
      where schemaname='integrations' and tablename='communication_channel_drafts')
    or pg_catalog.has_table_privilege('anon','integrations.communication_channel_drafts','select,insert,update,delete')
    or pg_catalog.has_table_privilege('authenticated','integrations.communication_channel_drafts','select,insert,update,delete')
    or not pg_catalog.has_table_privilege('service_role','integrations.communication_channel_drafts','select,insert')
    or pg_catalog.has_table_privilege('service_role','integrations.communication_channel_drafts','update,delete') then
    raise exception 'channel draft table security drift; preserve it for reviewed reconciliation';
  end if;
  foreach signature in array array[
    'public.toro_channel_draft_find_v1(uuid,uuid,text,text,text,text,text,uuid,text)',
    'public.toro_channel_draft_read_v1(uuid,uuid,text,text,text,text,text,uuid)',
    'public.toro_channel_draft_cas_v1(uuid,uuid,text,text,text,text,text,uuid,text,bigint,text,text,jsonb)'
  ] loop
    procedure_id := pg_catalog.to_regprocedure(signature);
    select pg_catalog.obj_description(procedure_id,'pg_proc') into definition_marker;
    if definition_marker is distinct from
       'toro-channel-draft-v1:def-md5='||pg_catalog.md5(pg_catalog.pg_get_functiondef(procedure_id))
      or exists (select 1 from pg_catalog.pg_proc where oid=procedure_id and
        (prosecdef or proowner <> (select oid from pg_catalog.pg_roles where rolname=current_user)))
      or pg_catalog.has_function_privilege('anon',procedure_id,'execute')
      or pg_catalog.has_function_privilege('authenticated',procedure_id,'execute')
      or not pg_catalog.has_function_privilege('service_role',procedure_id,'execute') then
      raise exception 'channel draft function drift: %',signature;
    end if;
  end loop;
end;
$rollback_preflight$;

drop function public.toro_channel_draft_cas_v1(uuid,uuid,text,text,text,text,text,uuid,text,bigint,text,text,jsonb);
drop function public.toro_channel_draft_read_v1(uuid,uuid,text,text,text,text,text,uuid);
drop function public.toro_channel_draft_find_v1(uuid,uuid,text,text,text,text,text,uuid,text);
drop table integrations.communication_channel_drafts;
commit;
