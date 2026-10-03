-- Los 50s materializer — org-scoped final definition
-- APPLIED LIVE 2026-10-02 after org scoping.

create or replace function public.los50s_materialize_registration(p_registration_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_event_key text;
  v_payload jsonb;
  v_person jsonb;
  v_ref text;
  v_route text;
  v_member_key text;
  v_leader_key text;
  v_respondent_ref text;
  v_respondent_phone text;
  v_guardian_key text;
  v_guardian_ref text;
  v_phone text;
  v_count integer := 0;
  v_profiles integer := 0;
  v_rooms integer := 0;
  v_transport integer := 0;
begin
  select org_id,event_key,payload
    into v_org_id,v_event_key,v_payload
  from public.los50s_registrations
  where id=p_registration_id
  for update;

  if not found then raise exception 'registration_not_found'; end if;
  if jsonb_typeof(v_payload->'people') <> 'array' then raise exception 'registration_people_missing'; end if;

  v_leader_key := nullif(v_payload->'leader'->>'memberKey','');
  v_respondent_ref := nullif(v_payload->'respondent'->>'personId','');
  v_respondent_phone := nullif(v_payload->'respondent'->>'whatsapp','');

  for v_person in select value from jsonb_array_elements(v_payload->'people')
  loop
    v_member_key := nullif(v_person->>'memberKey','');
    v_ref := nullif(v_person->>'personId','');
    if v_ref is null then
      v_ref := 'provisional:' || coalesce(v_member_key,gen_random_uuid()::text);
    end if;

    v_route := coalesce(nullif(v_person->>'effectiveRoute',''),'undecided');
    if v_route not in ('direct','manuel-antonio','undecided') then
      v_route := 'undecided';
    end if;

    v_guardian_key := nullif(v_person->>'guardianMemberKey','');
    v_guardian_ref := null;
    if v_guardian_key is not null then
      select coalesce(
        nullif(g.value->>'personId',''),
        case when nullif(g.value->>'memberKey','') is not null
          then 'provisional:' || (g.value->>'memberKey') end
      )
      into v_guardian_ref
      from jsonb_array_elements(v_payload->'people') g
      where g.value->>'memberKey'=v_guardian_key
      limit 1;
    end if;

    v_phone := nullif(v_person->>'personalPhone','');
    if v_phone is null and v_respondent_ref is not null and v_ref=v_respondent_ref then
      v_phone := v_respondent_phone;
    end if;

    v_count := v_count + 1;

    insert into public.los50s_participant_ops(
      org_id,event_key,participant_ref,registration_id,display_name,group_key,group_role,
      is_group_leader,phone,age_band,dob,lives_in_costa_rica,route_choice,
      seat_required,uses_bed,bed_preference,accommodation_preference,food_preference,
      food_dislikes,allergies,guardian_participant_ref,luggage_count,special_luggage,
      room_notes,participant_status,updated_by
    ) values (
      v_org_id,v_event_key,v_ref,p_registration_id,
      coalesce(nullif(v_person->>'name',''),'Participante'),
      p_registration_id::text,
      coalesce(nullif(v_person->>'groupRole',''),'Participante'),
      (v_leader_key is not null and v_member_key=v_leader_key),
      v_phone,
      case when v_person->>'age' in ('adult','teen','kid','toddler','baby') then v_person->>'age' else 'adult' end,
      case when nullif(v_person->>'dob','') is not null then (v_person->>'dob')::date end,
      coalesce((v_person->>'livesInCostaRica')::boolean,false),
      v_route,
      coalesce((v_person->>'seatRequired')::boolean,true),
      coalesce((v_person->>'usesBed')::boolean,true),
      nullif(v_person->>'bedPreference',''),
      nullif(v_person->>'accommodationPreference',''),
      nullif(v_person->>'foodPreference',''),
      nullif(v_person->>'foodDislikes',''),
      nullif(v_person->>'allergies',''),
      v_guardian_ref,
      coalesce((v_person->>'luggageCount')::integer,0),
      nullif(v_person->>'specialLuggage',''),
      nullif(v_person->>'roomNotes',''),
      case when v_person->>'personId' is null then 'provisional' else 'active' end,
      'registration:'||p_registration_id::text
    )
    on conflict(org_id,event_key,participant_ref) do update set
      registration_id=excluded.registration_id,
      display_name=excluded.display_name,
      group_key=excluded.group_key,
      group_role=excluded.group_role,
      is_group_leader=excluded.is_group_leader,
      phone=coalesce(excluded.phone,public.los50s_participant_ops.phone),
      age_band=excluded.age_band,
      dob=excluded.dob,
      lives_in_costa_rica=excluded.lives_in_costa_rica,
      route_choice=excluded.route_choice,
      seat_required=excluded.seat_required,
      uses_bed=excluded.uses_bed,
      bed_preference=excluded.bed_preference,
      accommodation_preference=excluded.accommodation_preference,
      food_preference=excluded.food_preference,
      food_dislikes=excluded.food_dislikes,
      allergies=excluded.allergies,
      guardian_participant_ref=excluded.guardian_participant_ref,
      luggage_count=excluded.luggage_count,
      special_luggage=excluded.special_luggage,
      room_notes=excluded.room_notes,
      participant_status=excluded.participant_status,
      updated_at=now(),
      updated_by=excluded.updated_by;
    v_profiles := v_profiles + 1;

    insert into public.los50s_room_assignments(
      org_id,event_key,participant_ref,assignment_status,accommodation_notes,
      preferred_bed,preferred_accommodation,guardian_participant_ref,updated_by
    ) values (
      v_org_id,v_event_key,v_ref,'unassigned',
      nullif(v_person->>'roomNotes',''),
      nullif(v_person->>'bedPreference',''),
      nullif(v_person->>'accommodationPreference',''),
      v_guardian_ref,
      'registration:'||p_registration_id::text
    )
    on conflict(org_id,event_key,participant_ref) do update set
      accommodation_notes=excluded.accommodation_notes,
      preferred_bed=excluded.preferred_bed,
      preferred_accommodation=excluded.preferred_accommodation,
      guardian_participant_ref=excluded.guardian_participant_ref,
      version=public.los50s_room_assignments.version+1,
      updated_at=now(),
      updated_by=excluded.updated_by;
    v_rooms := v_rooms + 1;

    if v_route='direct' then
      insert into public.los50s_transport_manifest(
        org_id,event_key,participant_ref,leg,route_choice,travel_date,
        seat_required,luggage_count,special_luggage,status,updated_by
      ) values (
        v_org_id,v_event_key,v_ref,'sjo_to_direct','direct',date '2026-11-28',
        coalesce((v_person->>'seatRequired')::boolean,true),
        coalesce((v_person->>'luggageCount')::integer,0),
        nullif(v_person->>'specialLuggage',''),'planned',
        'registration:'||p_registration_id::text
      )
      on conflict(org_id,event_key,participant_ref,leg) do update set
        route_choice=excluded.route_choice,
        travel_date=excluded.travel_date,
        seat_required=excluded.seat_required,
        luggage_count=excluded.luggage_count,
        special_luggage=excluded.special_luggage,
        updated_at=now(),
        updated_by=excluded.updated_by;
      v_transport := v_transport + 1;

    elsif v_route='manuel-antonio' then
      insert into public.los50s_transport_manifest(
        org_id,event_key,participant_ref,leg,route_choice,travel_date,
        seat_required,luggage_count,special_luggage,status,updated_by
      ) values
      (v_org_id,v_event_key,v_ref,'sjo_to_manuel_antonio','manuel-antonio',date '2026-11-28',
       coalesce((v_person->>'seatRequired')::boolean,true),coalesce((v_person->>'luggageCount')::integer,0),
       nullif(v_person->>'specialLuggage',''),'planned','registration:'||p_registration_id::text),
      (v_org_id,v_event_key,v_ref,'manuel_antonio_to_st','manuel-antonio',date '2026-11-29',
       coalesce((v_person->>'seatRequired')::boolean,true),coalesce((v_person->>'luggageCount')::integer,0),
       nullif(v_person->>'specialLuggage',''),'planned','registration:'||p_registration_id::text)
      on conflict(org_id,event_key,participant_ref,leg) do update set
        route_choice=excluded.route_choice,
        travel_date=excluded.travel_date,
        seat_required=excluded.seat_required,
        luggage_count=excluded.luggage_count,
        special_luggage=excluded.special_luggage,
        updated_at=now(),
        updated_by=excluded.updated_by;
      v_transport := v_transport + 2;
    end if;

    insert into public.los50s_transport_manifest(
      org_id,event_key,participant_ref,leg,route_choice,travel_date,
      seat_required,luggage_count,special_luggage,status,updated_by
    ) values
    (v_org_id,v_event_key,v_ref,'st_to_sjo',
     case when v_route in ('direct','manuel-antonio') then v_route else 'undecided' end,
     date '2026-12-05',
     coalesce((v_person->>'seatRequired')::boolean,true),
     coalesce((v_person->>'luggageCount')::integer,0),
     nullif(v_person->>'specialLuggage',''),
     'planned','registration:'||p_registration_id::text),
    (v_org_id,v_event_key,v_ref,'sjo_hotel_to_airport',
     case when v_route in ('direct','manuel-antonio') then v_route else 'undecided' end,
     date '2026-12-06',
     coalesce((v_person->>'seatRequired')::boolean,true),
     coalesce((v_person->>'luggageCount')::integer,0),
     nullif(v_person->>'specialLuggage',''),
     'planned','registration:'||p_registration_id::text)
    on conflict(org_id,event_key,participant_ref,leg) do update set
      route_choice=excluded.route_choice,
      travel_date=excluded.travel_date,
      seat_required=excluded.seat_required,
      luggage_count=excluded.luggage_count,
      special_luggage=excluded.special_luggage,
      updated_at=now(),
      updated_by=excluded.updated_by;
    v_transport := v_transport + 2;
  end loop;

  return jsonb_build_object(
    'ok',true,'org_id',v_org_id,'registration_id',p_registration_id,'people',v_count,
    'profile_rows',v_profiles,'room_rows',v_rooms,'transport_rows',v_transport
  );
end;
$$;

revoke all on function public.los50s_materialize_registration(uuid) from public,anon,authenticated;
grant execute on function public.los50s_materialize_registration(uuid) to service_role;
