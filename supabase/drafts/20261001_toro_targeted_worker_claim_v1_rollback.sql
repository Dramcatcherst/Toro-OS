-- DRAFT ROLLBACK — pairs with 20261001_toro_targeted_worker_claim_v1.sql
-- NOT AUTHORIZED FOR PRODUCTION APPLY

drop function if exists public.toro_complete_execution_run_v1(uuid,text,bigint,jsonb);
drop function if exists public.toro_claim_execution_run_by_id_v1(uuid,uuid,text,integer);
