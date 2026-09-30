-- Destructive rollback: stop writers, export/verify content and obtain approval.
-- Keep pre-existing bindings, sessions and receipts intact.
drop table if exists integrations.communication_channel_content;
drop index if exists integrations.communication_channel_receipts_id_session_idx;
drop index if exists integrations.communication_channel_sessions_id_org_idx;
