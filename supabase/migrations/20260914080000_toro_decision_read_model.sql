-- TORO OS Phase 1: governed executive decision read model.
-- This migration intentionally keeps operations.executive_decisions canonical.

alter table operations.executive_decisions enable row level security;

drop policy if exists toro_executive_decisions_read on operations.executive_decisions;
create policy toro_executive_decisions_read
on operations.executive_decisions
for select
to authenticated
using (
  private.has_org_role(org_id, array['ADMIN', 'GERENCIA']::text[])
);

grant usage on schema operations to authenticated;
grant select on operations.executive_decisions to authenticated;

create or replace function public.list_my_decisions(p_limit integer default 5)
returns table (
  id uuid,
  title text,
  domain text,
  urgency text,
  recommendation text,
  rationale text,
  evidence text,
  owner text,
  deadline text,
  approval_level text,
  status text
)
language sql
stable
security invoker
set search_path = public, operations, private
as $$
  select
    d.id,
    d.decision_title as title,
    coalesce(nullif(d.program_key, ''), 'general') as domain,
    coalesce(nullif(d.priority, ''), 'P2') as urgency,
    d.recommendation,
    d.why_it_matters as rationale,
    d.evidence,
    d.owner_name as owner,
    null::text as deadline,
    'founder_approval'::text as approval_level,
    d.status
  from operations.executive_decisions d
  where d.superseded_by is null
    and coalesce(d.status, '') not in ('Respondida', 'Archivada', 'Archive', 'Historical')
  order by
    case upper(coalesce(d.priority, ''))
      when 'P0' then 0
      when 'P1' then 1
      when 'P2' then 2
      else 9
    end,
    d.updated_at desc,
    d.id
  limit least(greatest(coalesce(p_limit, 5), 1), 20);
$$;

revoke all on function public.list_my_decisions(integer) from public;
revoke all on function public.list_my_decisions(integer) from anon;
grant execute on function public.list_my_decisions(integer) to authenticated;

comment on function public.list_my_decisions(integer) is
  'Governed TORO decision feed. RLS limits rows to authenticated ADMIN/GERENCIA users. Existing executive decisions default to founder approval until a canonical approval rule is stored.';
