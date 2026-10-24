-- READ-ONLY ROLLBACK PREFLIGHT — NOT A REVERSAL SCRIPT
-- Reconciled 2026-10-24. These canonical tables already exist independently of PR210.
-- The former blanket DROP TABLE recipe is withdrawn: it could remove another
-- migration's objects and canonical session/receipt evidence.
-- This file changes nothing. Applying the additive constraints still requires
-- schema/permission review and an authorized migration window. Before that
-- change, retain exact prior definitions and ownership for each constraint;
-- prepare a selective, fingerprint-guarded reversal for only that approved delta.
-- Never drop the existing tables or revoke their consumers as a PR rollback.

select n.nspname as schema_name,
       c.relname as table_name,
       k.conname as constraint_name,
       pg_get_constraintdef(k.oid, true) as constraint_definition
from pg_constraint k
join pg_class c on c.oid = k.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'integrations'
  and c.relname in ('communication_channel_sessions', 'communication_channel_receipts')
order by c.relname, k.conname;
