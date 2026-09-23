-- TORO Human Layer: PII-free runtime config identity projection.
--
-- Purpose:
-- Machine consumers authenticate to the Next.js service endpoint with the
-- governed OpenClaw bearer, but do not carry a human Supabase session. The
-- canonical Human Layer payload remains private in operations.knowledge_items.
-- This RPC intentionally exposes only version/hash/readiness metadata.
--
-- Security:
-- - no payload, people, roles, messages, secrets or business facts are returned;
-- - pointer/snapshot parity is checked inside the function;
-- - unknown organizations return no row;
-- - the function is intentionally executable by anon/authenticated so a
--   publishable-key server client can read the safe projection without a
--   service-role key;
-- - SECURITY DEFINER is required only to read the private canonical source;
-- - search_path is pinned empty and every relation is schema-qualified.
--
-- This intentional anon SECURITY DEFINER endpoint must remain narrow. Do not
-- add arbitrary knowledge fields to its return shape.

create or replace function public.get_toro_human_layer_config_identity(
  p_org_slug text default 'dreamcatcher'
)
returns table (
  knowledge_key text,
  snapshot_key text,
  config_version text,
  config_hash text,
  onboarding_step_count integer,
  state_persistence text,
  source_updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with target_org as (
    select o.id
    from public.organizations o
    where o.slug = nullif(lower(btrim(p_org_slug)), '')
      and o.status = 'active'
      and o.deleted_at is null
      and p_org_slug ~ '^[A-Za-z0-9][A-Za-z0-9-]{0,62}$'
    limit 1
  ),
  pointer as (
    select
      k.org_id,
      k.knowledge_key,
      k.structured_content ->> 'current_snapshot_key' as snapshot_key,
      k.structured_content ->> 'config_version' as config_version,
      k.structured_content ->> 'config_hash' as config_hash,
      case
        when coalesce(k.structured_content ->> 'onboarding_step_count', '') ~ '^[0-9]+$'
        then (k.structured_content ->> 'onboarding_step_count')::integer
        else null
      end as onboarding_step_count,
      k.structured_content ->> 'state_persistence' as state_persistence,
      k.updated_at as source_updated_at
    from operations.knowledge_items k
    join target_org o on o.id = k.org_id
    where k.knowledge_key = 'toro_human_layer_runtime_config_current'
      and k.active is true
      and k.verified_status = 'verified'
    limit 1
  ),
  snapshot as (
    select
      s.org_id,
      s.knowledge_key,
      s.structured_content ->> 'config_version' as config_version,
      s.structured_content ->> 'config_hash' as config_hash,
      case
        when coalesce(s.structured_content ->> 'onboarding_step_count', '') ~ '^[0-9]+$'
        then (s.structured_content ->> 'onboarding_step_count')::integer
        else null
      end as onboarding_step_count
    from operations.knowledge_items s
    join pointer p
      on p.org_id = s.org_id
     and p.snapshot_key = s.knowledge_key
    where s.active is true
      and s.verified_status = 'verified'
    limit 1
  )
  select
    p.knowledge_key,
    s.knowledge_key as snapshot_key,
    p.config_version,
    p.config_hash,
    p.onboarding_step_count,
    p.state_persistence,
    p.source_updated_at
  from pointer p
  join snapshot s on s.org_id = p.org_id
  where p.snapshot_key ~ '^toro_human_layer_runtime_config_v[0-9]+_[0-9]+_[0-9]{8}$'
    and p.config_version ~ '^TORO-HUMAN-LAYER-v[0-9]+([.][0-9]+)?$'
    and p.config_hash ~ '^sha256:[0-9a-f]{64}$'
    and p.onboarding_step_count = 10
    and p.state_persistence in ('IMPLEMENTED', 'NOT_IMPLEMENTED')
    and s.config_version = p.config_version
    and s.config_hash = p.config_hash
    and s.onboarding_step_count = p.onboarding_step_count;
$$;

revoke all on function public.get_toro_human_layer_config_identity(text) from public;
revoke all on function public.get_toro_human_layer_config_identity(text) from anon;
revoke all on function public.get_toro_human_layer_config_identity(text) from authenticated;
grant execute on function public.get_toro_human_layer_config_identity(text) to anon, authenticated;

comment on function public.get_toro_human_layer_config_identity(text) is
  'PII-free TORO Human Layer runtime identity projection. Intentionally callable by anon/authenticated; returns only validated config version/hash/readiness metadata from canonical operations.knowledge_items.';
