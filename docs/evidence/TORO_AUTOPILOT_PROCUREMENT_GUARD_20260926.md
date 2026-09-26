# Autopilot procurement guard — applied evidence

**Scope:** TORO operating layer / Dreamcatcher reference implementation.  
**Date:** 2026-09-25 Costa Rica (2026-09-26 UTC).  
**Authority:** Supabase `operations.toro_autonomous_action_queue_v1`; source task remains in `operations.tasks`.  
**Migration:** `toro_autopilot_procurement_execution_guard_20260926` (Supabase version `20260926034846`).  
**SQL snapshot:** [20260926_autopilot_procurement_guard_applied.sql](../../supabase/drafts/20260926_autopilot_procurement_guard_applied.sql).

## Problem and correction

The queue selected `procurement_first_purchase_run_pilot_2026_09`, whose primary objective includes executing a purchase, receiving goods and creating inventory movements. Its `UNBLOCK_PREP` classification made it eligible despite that objective.

The applied view now excludes that task by key and excludes procurement tasks whose title or description contains execution signals for buying, receiving or inventory movements. This changes queue selection only. It did not modify the source task, grant permissions, buy anything or write inventory.

## Verification

| Check | Before | After |
| --- | ---: | ---: |
| Selected queue rows | 10 | 9 |
| Selected purchase/receipt/inventory execution rows | 1 | 0 |
| Portfolio open work | 205 | 205 |
| Source purchase task | planned | planned |

The Supabase migration API returned success; a fresh query of the queue returned nine rows and the unsafe selection count returned zero. The migration appears in Supabase migration history.

## Recovery and follow-up

The view definition before the change differs by the two added predicates in the snapshot. If rollback is required, inspect the **current** view first and remove only those predicates after review; restoring an old full definition could erase intervening changes. Keep the procurement task under a human purchasing and receipt workflow. For future queue changes, test that both a known unsafe task is excluded and safe read/preparation tasks remain selectable.

Related narrative checkpoint: Notion `09 — TORO — Cerebro, portafolio, prioridades y ejecución`, section `AGENT-CONNECTOR-AUDIT-R1`; structured receipt: `operations.knowledge_items/toro_connector_portfolio_v1.execution_audit_20260925`.
