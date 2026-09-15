-- TORO OS Phase 1: fail closed when a decision is not explicitly pending.
-- This migration replaces function bodies only; the canonical table, RLS policy,
-- signatures, grants and audit destination remain unchanged.

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
  where d.status = 'Pendiente'
    and d.decision_value is null
    and d.processed_at is null
    and d.superseded_by is null
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
  'Governed TORO decision feed. Only explicit, unprocessed Pendiente rows are actionable; RLS limits rows to authenticated ADMIN/GERENCIA users.';

create or replace function public.resolve_toro_decision(
  p_decision_id uuid,
  p_action text,
  p_note text default null,
  p_delegate_to text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, operations, private, auth
as $$
declare
  v_decision operations.executive_decisions%rowtype;
  v_actor uuid := auth.uid();
  v_toro_role text := coalesce(auth.jwt() -> 'app_metadata' ->> 'toro_role', '');
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_delegate_to text := nullif(btrim(coalesce(p_delegate_to, '')), '');
  v_status text;
  v_now timestamptz := now();
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if p_action not in ('approve', 'modify', 'delegate', 'postpone', 'reject') then raise exception 'Unsupported decision action'; end if;

  select * into v_decision
  from operations.executive_decisions
  where id = p_decision_id
  for update;

  if not found then raise exception 'Decision not found'; end if;
  if v_decision.status is distinct from 'Pendiente'
    or v_decision.decision_value is not null
    or v_decision.processed_at is not null
    or v_decision.superseded_by is not null
  then
    raise exception 'Decision is no longer actionable';
  end if;

  if v_toro_role <> 'FOUNDER' then raise exception 'Founder approval required'; end if;
  if not private.has_org_role(v_decision.org_id, array['ADMIN', 'GERENCIA']::text[]) then raise exception 'Organization membership required'; end if;

  if p_action = 'delegate' and v_delegate_to is null then raise exception 'Delegate target required'; end if;
  if p_action = 'reject' and v_note is null then raise exception 'A note is required to reject this decision'; end if;

  if p_action = 'approve' then
    update operations.executive_decisions set status='Respondida', decision_value='approved', response_text=coalesce(v_note,'Aprobada'), processed_at=v_now, updated_at=v_now where id=p_decision_id; v_status:='approved';
  elsif p_action = 'reject' then
    update operations.executive_decisions set status='Respondida', decision_value='rejected', response_text=v_note, processed_at=v_now, updated_at=v_now where id=p_decision_id; v_status:='rejected';
  elsif p_action = 'delegate' then
    update operations.executive_decisions set delegated_to=v_delegate_to, response_text=v_note, updated_at=v_now where id=p_decision_id; v_status:='delegated';
  elsif p_action = 'postpone' then
    update operations.executive_decisions set response_text=v_note, updated_at=v_now where id=p_decision_id; v_status:='postponed';
  else
    update operations.executive_decisions set response_text=v_note, updated_at=v_now where id=p_decision_id; v_status:='modified';
  end if;

  insert into public.audit_logs(org_id,table_name,record_id,operation,actor_user_id,changed_keys,reason,occurred_at,status,created_by,updated_by)
  values(v_decision.org_id,'operations.executive_decisions',p_decision_id,'toro_decision_'||p_action,v_actor,
    case p_action when 'delegate' then array['delegated_to','response_text','updated_at']::text[] when 'approve' then array['status','decision_value','response_text','processed_at','updated_at']::text[] when 'reject' then array['status','decision_value','response_text','processed_at','updated_at']::text[] else array['response_text','updated_at']::text[] end,
    v_note,v_now,'recorded',v_actor,v_actor);

  return jsonb_build_object('decision_id',p_decision_id,'action',p_action,'status',v_status,'audited_at',v_now);
end;
$$;

revoke all on function public.resolve_toro_decision(uuid,text,text,text) from public;
revoke all on function public.resolve_toro_decision(uuid,text,text,text) from anon;
grant execute on function public.resolve_toro_decision(uuid,text,text,text) to authenticated;

comment on function public.resolve_toro_decision(uuid,text,text,text) is
  'Audited TORO executive decision action. Requires an explicit, unprocessed Pendiente row plus FOUNDER metadata and active ADMIN/GERENCIA membership.';
