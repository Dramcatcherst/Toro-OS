\set ON_ERROR_STOP on

\set org_id '11111111-1111-1111-1111-111111111111'
\set founder_id '22222222-2222-2222-2222-222222222222'
\set admin_id '33333333-3333-3333-3333-333333333333'
\set restricted_id '44444444-4444-4444-4444-444444444444'
\set outsider_founder_id 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set revoked_id 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

insert into public.user_roles(user_id,org_id,role,status) values
  (:'founder_id', :'org_id', 'ADMIN', 'active'),
  (:'admin_id', :'org_id', 'ADMIN', 'active'),
  (:'restricted_id', :'org_id', 'RECEPCION', 'active');

insert into public.user_roles(user_id,org_id,role,status,revoked_at)
values (:'revoked_id', :'org_id', 'GERENCIA', 'active', now());

insert into operations.executive_decisions(id,org_id,decision_title,priority,status,recommendation)
values ('55555555-5555-5555-5555-555555555555', :'org_id', 'Decisión fixture', 'P1', 'Pendiente', 'Probar de forma aislada');
insert into core.rooms(id,org_id,name_es,room_number,room_type,slug)
values ('66666666-6666-6666-6666-666666666666', :'org_id', 'Habitación Fixture', 25, 'suite', 'habitacion-fixture');
insert into operations.projects(id,org_id,project_name,project_key,category,status,business_area)
values ('77777777-7777-7777-7777-777777777777', :'org_id', 'Proyecto Fixture', 'fixture', 'systems', 'active', 'hotel');
insert into operations.knowledge_items(id,org_id,title,knowledge_key,knowledge_class,verified_status,visibility)
values
 ('88888888-8888-8888-8888-888888888888', :'org_id', 'Conocimiento visible', 'visible', 'sop', 'verified', 'internal'),
 ('99999999-9999-9999-9999-999999999999', :'org_id', 'Conocimiento privado', 'privado', 'sop', 'verified', 'private');

set role anon;
do $$ begin
  begin perform * from public.list_my_decisions(5); raise exception 'anon unexpectedly executed list_my_decisions'; exception when insufficient_privilege then null; end;
  begin perform * from public.search_toro('Fixture', 12); raise exception 'anon unexpectedly executed search_toro'; exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub', :'restricted_id', false);
select set_config('request.jwt.claims', jsonb_build_object('sub', :'restricted_id', 'app_metadata', jsonb_build_object('toro_role','RECEPTION'))::text, false);
set role authenticated;
do $$ declare n integer; begin select count(*) into n from public.list_my_decisions(5); if n <> 0 then raise exception 'restricted user saw % executive decisions', n; end if; end $$;
reset role;

-- A revoked membership must not retain global-search visibility even if its status was not cleaned up.
select set_config('request.jwt.claim.sub', :'revoked_id', false);
select set_config('request.jwt.claims', jsonb_build_object('sub', :'revoked_id', 'app_metadata', jsonb_build_object('toro_role','GERENCIA'))::text, false);
set role authenticated;
do $$ declare n integer; begin
  select count(*) into n from public.search_toro('Fixture',12);
  if n <> 0 then raise exception 'revoked membership saw % search results', n; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub', :'admin_id', false);
select set_config('request.jwt.claims', jsonb_build_object('sub', :'admin_id', 'app_metadata', jsonb_build_object('toro_role','MANAGER'))::text, false);
set role authenticated;
do $$ begin
  begin perform public.resolve_toro_decision('55555555-5555-5555-5555-555555555555','approve',null,null); raise exception 'ADMIN without FOUNDER unexpectedly mutated decision';
  exception when others then if sqlerrm not like '%Founder approval required%' then raise; end if; end;
end $$;
reset role;

-- FOUNDER metadata alone must never cross an organization boundary.
select set_config('request.jwt.claim.sub', :'outsider_founder_id', false);
select set_config('request.jwt.claims', jsonb_build_object('sub', :'outsider_founder_id', 'app_metadata', jsonb_build_object('toro_role','FOUNDER'))::text, false);
set role authenticated;
do $$ begin
  begin perform public.resolve_toro_decision('55555555-5555-5555-5555-555555555555','modify','should fail',null); raise exception 'FOUNDER without org membership unexpectedly mutated decision';
  exception when others then if sqlerrm not like '%Organization membership required%' then raise; end if; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub', :'founder_id', false);
select set_config('request.jwt.claims', jsonb_build_object('sub', :'founder_id', 'app_metadata', jsonb_build_object('toro_role','FOUNDER'))::text, false);
set role authenticated;
do $$ declare n integer; begin
  select count(*) into n from public.list_my_decisions(5); if n <> 1 then raise exception 'FOUNDER expected 1 decision, got %', n; end if;
  perform public.resolve_toro_decision('55555555-5555-5555-5555-555555555555','approve','fixture approval',null);
end $$;
reset role;

do $$ declare n integer; begin select count(*) into n from public.audit_logs where record_id='55555555-5555-5555-5555-555555555555' and operation='toro_decision_approve'; if n <> 1 then raise exception 'expected one audit log, got %', n; end if; end $$;

select set_config('request.jwt.claim.sub', :'founder_id', false);
select set_config('request.jwt.claims', jsonb_build_object('sub', :'founder_id', 'app_metadata', jsonb_build_object('toro_role','FOUNDER'))::text, false);
set role authenticated;
do $$ declare n integer; begin
  select count(*) into n from public.search_toro('Fixture',12); if n <> 2 then raise exception 'expected room+project search results, got %', n; end if;
  select count(*) into n from public.search_toro('privado',12); if n <> 0 then raise exception 'private knowledge leaked into search'; end if;
end $$;
reset role;

select 'TORO Phase 1 SQL assertions passed' as result;
