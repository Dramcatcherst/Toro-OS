-- DRAFT ROLLBACK — run only with an authorized migration window.
begin;

revoke all on table integrations.communication_channel_receipts
  from public, anon, authenticated, service_role;
revoke all on table integrations.communication_channel_sessions
  from public, anon, authenticated, service_role;

drop table if exists integrations.communication_channel_receipts;
drop table if exists integrations.communication_channel_sessions;

commit;
