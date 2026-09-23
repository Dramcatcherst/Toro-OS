-- TORO OS Room 360: route governed room search results to the canonical Room 360 detail.
-- Preserves the active + non-revoked organization membership guard from the prior search hardening.

create or replace function public.search_toro(
  p_query text,
  p_limit integer default 12
)
returns table (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  destination_path text,
  freshness text
)
language sql
stable
security definer
set search_path = public, core, operations, auth
as $$
  with current_orgs as (
    select distinct ur.org_id
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.status = 'active'
      and ur.revoked_at is null
  ),
  normalized as (
    select nullif(btrim(p_query), '') as q
  ),
  room_results as (
    select
      'room'::text as entity_type,
      r.id as entity_id,
      coalesce(nullif(r.name_es, ''), nullif(r.name_en, ''), 'Habitación ' || r.room_number::text) as title,
      concat_ws(' · ', nullif(r.room_type, ''), 'Hab. ' || r.room_number::text) as subtitle,
      '/toro/habitaciones/DC-ROOM-' || r.room_number::text as destination_path,
      r.updated_at::text as freshness,
      1 as entity_rank
    from core.rooms r, normalized n
    where n.q is not null
      and r.active is true
      and exists (select 1 from current_orgs co where co.org_id = r.org_id)
      and (
        r.room_number::text ilike '%' || n.q || '%'
        or coalesce(r.name_es, '') ilike '%' || n.q || '%'
        or coalesce(r.name_en, '') ilike '%' || n.q || '%'
        or coalesce(r.slug, '') ilike '%' || n.q || '%'
        or coalesce(r.room_type, '') ilike '%' || n.q || '%'
      )
  ),
  project_results as (
    select
      'project'::text as entity_type,
      p.id as entity_id,
      p.project_name as title,
      concat_ws(' · ', nullif(p.category, ''), nullif(p.status, '')) as subtitle,
      '/toro/proyectos?project=' || p.id::text as destination_path,
      p.updated_at::text as freshness,
      2 as entity_rank
    from operations.projects p, normalized n
    where n.q is not null
      and p.active is true
      and exists (select 1 from current_orgs co where co.org_id = p.org_id)
      and (
        coalesce(p.project_name, '') ilike '%' || n.q || '%'
        or coalesce(p.project_key, '') ilike '%' || n.q || '%'
        or coalesce(p.category, '') ilike '%' || n.q || '%'
        or coalesce(p.business_area, '') ilike '%' || n.q || '%'
      )
  ),
  knowledge_results as (
    select
      'knowledge'::text as entity_type,
      k.id as entity_id,
      k.title,
      concat_ws(' · ', nullif(k.knowledge_class, ''), nullif(k.verified_status, '')) as subtitle,
      '/toro/conocimiento?item=' || k.id::text as destination_path,
      k.updated_at::text as freshness,
      3 as entity_rank
    from operations.knowledge_items k, normalized n
    where n.q is not null
      and k.active is true
      and coalesce(k.visibility, '') <> 'private'
      and exists (select 1 from current_orgs co where co.org_id = k.org_id)
      and (
        coalesce(k.title, '') ilike '%' || n.q || '%'
        or coalesce(k.knowledge_key, '') ilike '%' || n.q || '%'
        or coalesce(k.knowledge_class, '') ilike '%' || n.q || '%'
      )
  ),
  combined as (
    select * from room_results
    union all
    select * from project_results
    union all
    select * from knowledge_results
  )
  select c.entity_type, c.entity_id, c.title, c.subtitle, c.destination_path, c.freshness
  from combined c
  order by c.entity_rank, c.title
  limit least(greatest(coalesce(p_limit, 12), 1), 20);
$$;

revoke all on function public.search_toro(text, integer) from public;
revoke all on function public.search_toro(text, integer) from anon;
grant execute on function public.search_toro(text, integer) to authenticated;

comment on function public.search_toro(text, integer) is
  'Authorization-safe TORO global search. Active, non-revoked organization memberships only. Governed room results route to /toro/habitaciones/DC-ROOM-N; finance, guests and private knowledge remain excluded.';
