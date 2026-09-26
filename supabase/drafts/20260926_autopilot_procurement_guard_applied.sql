-- Applied to Supabase project abtyrbqlqbsastmridzp at 2026-09-26 03:48:46 UTC.
-- Migration: toro_autopilot_procurement_execution_guard_20260926.
-- Source snapshot for traceability. Already applied; do not replay as a new migration.
-- Rollback: compare the current view with this snapshot and remove only the added
-- e.task_key exception and PROCUREMENT_INVENTORY action predicate after review.
-- Never overwrite intervening changes by blindly restoring an older full view.

create or replace view operations.toro_autonomous_action_queue_v1 as  WITH candidates AS (
         SELECT e.id,
            e.task_key,
            e.task_name,
            e.project_id,
            e.canonical_module_key,
            e.area,
            e.priority,
            e.source_status,
            e.owner_name,
            e.assignee_name,
            e.execution_owner,
            e.start_date,
            e.due_date,
            e.blocking_reason,
            e.description,
            e.updated_at,
            e.lifecycle,
            e.execution_condition,
            e.constraint_class,
            e.structurally_ready,
            e.workstream,
            e.strategic_outcome,
            e.execution_bucket,
            e.execution_actor_mode,
            e.actor_instruction,
            COALESCE(cp.leverage_score, 0::bigint) AS leverage_score,
            row_number() OVER (PARTITION BY e.workstream ORDER BY (
                CASE
                    WHEN e.execution_bucket = 'EXECUTE_NOW'::text THEN 0
                    WHEN e.execution_condition = 'WAITING_EVIDENCE'::text THEN 1
                    WHEN e.execution_condition = 'BLOCKED_EXTERNAL'::text THEN 2
                    ELSE 9
                END), (COALESCE(cp.leverage_score, 0::bigint)) DESC, e.due_date, e.updated_at DESC) AS lane_rank
           FROM operations.toro_execution_actor_v1 e
             LEFT JOIN operations.toro_constraint_priority_v1 cp ON cp.constraint_class = e.constraint_class AND cp.execution_condition = e.execution_condition
          WHERE e.structurally_ready AND e.updated_at < (now() - '00:10:00'::interval) AND NOT (lower(COALESCE(e.blocking_reason, ''::text)) ~ '(owner[ _-]+hold|next human action|human follow[- ]?up)'::text OR lower(concat_ws(' '::text, COALESCE(e.task_name, ''::text), COALESCE(e.description, ''::text), COALESCE(e.blocking_reason, ''::text))) ~ '(physically verified|physical verification|physical count|conteo f[ií]sico|field partition)'::text OR lower(COALESCE(e.task_name, ''::text)) ~ '(^|[^[:alnum:]_])(connect|setup|activate|activation|install|provision|send|submit|publish|deploy|revoke|delete|archive|cutover|pay|payment|purchase|cablear|conectar|configurar|activar|instalar|enviar|presentar|publicar|revocar|borrar|eliminar|archivar|pagar|comprar)($|[^[:alnum:]_])'::text AND lower(COALESCE(e.task_name, ''::text)) !~ '(review|verify|reconcile|prepare|draft|audit|preview|evidence|check|revisi[oó]n|verificar|conciliar|preparar|borrador|auditar|vista previa|evidencia|comprobar)'::text) AND NOT (lower(COALESCE(e.task_name, ''::text)) ~ '(finish .*setup|complete .*setup|activate|activation|first purchase|purchase run|payment run|make payment|submit|file return|publish|production deploy|merge to production|revoke|delete|archive source|cutover)'::text AND lower(COALESCE(e.task_name, ''::text)) !~ '(review|verify|reconcile|prepare|draft|audit|preview|evidence|check)'::text) AND e.task_key <> 'procurement_first_purchase_run_pilot_2026_09'::text AND NOT (e.constraint_class = 'PROCUREMENT_INVENTORY'::text AND lower(concat_ws(' '::text, COALESCE(e.task_name, ''::text), COALESCE(e.description, ''::text))) ~ '(ejecutar compra|recibir cantidades|inventory_movements|recepci[oó]n piloto|first purchase|purchase run|comprar|pagar al proveedor)'::text) AND (e.execution_bucket = 'EXECUTE_NOW'::text AND (e.execution_actor_mode = ANY (ARRAY['AGENT_SAFE_READ_PREP'::text, 'AGENT_SAFE_PREVIEW'::text, 'AGENT_SAFE_REVIEW'::text, 'MIXED_PREP'::text])) OR e.execution_bucket = 'CONSTRAINED'::text AND e.execution_actor_mode = 'UNBLOCK_PREP'::text AND (e.execution_condition = ANY (ARRAY['WAITING_EVIDENCE'::text, 'BLOCKED_EXTERNAL'::text])) AND (e.constraint_class = ANY (ARRAY['ACCESS_IDENTITY'::text, 'INTEGRATION_RUNTIME'::text, 'DATA_QUALITY_GOVERNANCE'::text, 'BACKUP_MIGRATION'::text, 'FINANCE_EVIDENCE'::text, 'REGULATORY_LEGAL'::text, 'COMMERCIAL_CHANNEL'::text, 'STAFFING_OPERATIONS'::text, 'PROCUREMENT_INVENTORY'::text])) AND (e.updated_at >= (now() - '02:00:00'::interval) OR mod(abs(hashtext(e.task_key)), 4) = mod(EXTRACT(hour FROM (now() AT TIME ZONE 'America/Costa_Rica'::text))::integer, 4)))
        ), lane_capped AS (
         SELECT candidates.id,
            candidates.task_key,
            candidates.task_name,
            candidates.project_id,
            candidates.canonical_module_key,
            candidates.area,
            candidates.priority,
            candidates.source_status,
            candidates.owner_name,
            candidates.assignee_name,
            candidates.execution_owner,
            candidates.start_date,
            candidates.due_date,
            candidates.blocking_reason,
            candidates.description,
            candidates.updated_at,
            candidates.lifecycle,
            candidates.execution_condition,
            candidates.constraint_class,
            candidates.structurally_ready,
            candidates.workstream,
            candidates.strategic_outcome,
            candidates.execution_bucket,
            candidates.execution_actor_mode,
            candidates.actor_instruction,
            candidates.leverage_score,
            candidates.lane_rank
           FROM candidates
          WHERE candidates.lane_rank <= 3
        ), ranked AS (
         SELECT l.id,
            l.task_key,
            l.task_name,
            l.project_id,
            l.canonical_module_key,
            l.area,
            l.priority,
            l.source_status,
            l.owner_name,
            l.assignee_name,
            l.execution_owner,
            l.start_date,
            l.due_date,
            l.blocking_reason,
            l.description,
            l.updated_at,
            l.lifecycle,
            l.execution_condition,
            l.constraint_class,
            l.structurally_ready,
            l.workstream,
            l.strategic_outcome,
            l.execution_bucket,
            l.execution_actor_mode,
            l.actor_instruction,
            l.leverage_score,
            l.lane_rank,
            row_number() OVER (ORDER BY (
                CASE
                    WHEN l.execution_bucket = 'EXECUTE_NOW'::text THEN 0
                    WHEN l.execution_condition = 'WAITING_EVIDENCE'::text THEN 1
                    WHEN l.execution_condition = 'BLOCKED_EXTERNAL'::text THEN 2
                    ELSE 9
                END), l.leverage_score DESC, l.due_date, l.updated_at DESC) AS autonomous_rank
           FROM lane_capped l
        )
 SELECT id,
    task_key,
    task_name,
    project_id,
    canonical_module_key,
    area,
    priority,
    source_status,
    owner_name,
    assignee_name,
    execution_owner,
    start_date,
    due_date,
    blocking_reason,
    description,
    updated_at,
    lifecycle,
    execution_condition,
    constraint_class,
    structurally_ready,
    workstream,
    strategic_outcome,
    execution_bucket,
    execution_actor_mode,
    actor_instruction,
    autonomous_rank
   FROM ranked
  WHERE autonomous_rank <= 12;
