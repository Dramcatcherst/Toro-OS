\set ON_ERROR_STOP on

\set org_id '11111111-1111-1111-1111-111111111111'
\set founder_id '22222222-2222-2222-2222-222222222222'

insert into public.user_roles(user_id,org_id,role,status)
values (:'founder_id', :'org_id', 'ADMIN', 'active')
on conflict do nothing;

insert into core.rooms(id,org_id,name_es,room_number,room_type,slug)
values ('66666666-6666-6666-6666-666666666666', :'org_id', 'Habitación Fixture', 25, 'suite', 'habitacion-fixture')
on conflict (id) do nothing;

select set_config('request.jwt.claim.sub', :'founder_id', false);
select set_config(
  'request.jwt.claims',
  jsonb_build_object('sub', :'founder_id', 'app_metadata', jsonb_build_object('toro_role','FOUNDER'))::text,
  false
);

set role authenticated;
do $$
declare
  v_destination text;
begin
  select destination_path into v_destination
  from public.search_toro('Fixture', 12)
  where entity_type = 'room'
  limit 1;

  if v_destination is distinct from '/toro/habitaciones/DC-ROOM-25' then
    raise exception 'expected canonical Room 360 destination, got %', coalesce(v_destination, '<null>');
  end if;
end $$;
reset role;

select 'TORO Room 360 search destination assertion passed' as result;
