-- TORO OS Phase 1: governed decision actions with durable audit evidence.
-- Founder approval requires BOTH explicit TORO metadata and active ADMIN/GERENCIA
-- membership in the decision organization. ADMIN alone never implies FOUNDER.

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

  select * into v_decision from operations.executive_decisions where id = p_decision_id for update;
  if not found then raise exception 'Decision not found'; end if;
  if v_decision.superseded_by is not null or coalesce(v_decision.status, '') in ('Respondida', 'Archivada', 'Archive', 'Historical') then raise exception 'Decision is no longer actionable'; end if;

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
comment on function public.resolve_toro_decision(uuid,text,text,text) is 'Audited TORO executive decision action. Requires explicit app_metadata.toro_role=FOUNDER plus active ADMIN/GERENCIA membership in the decision organization.';
