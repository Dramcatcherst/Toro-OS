-- REVIEW ONLY. Functional rollback; keeps the Kross RLS security correction.
-- Disable TORO_PORTAL_READ_TRANSPORT=rpc_v1 in the authorized runtime first.
-- Confirm no concurrent consumer depends on these functions/column grants.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
drop function public.toro_portal_brain_read_v1(uuid,uuid);
drop function public.toro_portal_owner_attention_read_v1(uuid,uuid);
drop policy portal_narrow_followups_read_v1 on operations.communication_followups;
revoke select (org_id,followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key,active,id) on operations.communication_followups from authenticated;
drop policy portal_narrow_invoices_read_v1 on finance.invoices;
revoke select (org_id,invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url,active,id) on finance.invoices from authenticated;
revoke usage on schema finance from authenticated;
-- DO NOT restore unprotected Kross SELECT. Keep RLS and portal_narrow_kross_read_v1.
-- Reverting that security correction would require a new explicit decision.
commit;
