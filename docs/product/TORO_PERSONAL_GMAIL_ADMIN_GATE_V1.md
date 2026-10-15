# TORO Comms — Personal Gmail Administration Gate V1

**Status:** IMPLEMENTED POLICY CONTRACT / TORO OAuth NOT CONNECTED / NO PRODUCTION ACTIVATION
**Date:** 2026-10-15
**Canonical parent:** TORO Brain General Plan + TORO Comms mailbox bindings.
**Owner scope:** private TORO User Vault only, not Dreamcatcher organization.

## Executive decision

Use the existing TORO Comms classifier, followups, provenance and Control Plane.
Do **not** register the owner's personal Gmail as an organizational mailbox in
`integrations.communication_channel_bindings` (that registry requires `org_id`).
Do **not** proxy the owner's Gmail through a corporate Workspace administrator,
forward personal mail into company inboxes, or give organization employees
access to personal messages.

The connected ChatGPT Gmail plugin grants **ChatGPT session** capabilities,
not an OAuth grant to TORO's own cloud runtime. Neither this document nor the
permission guard connects Google, deploys a worker, or makes TORO an account admin.

## Actual connection sequence — no passwords or app passwords

1. Resolve the authenticated owner in TORO Personal/User Vault; verify that
   the private context and requested mailbox owner match.
2. Use Google's official per-user OAuth consent from the owner's **personal**
   Google account. Store the refresh token only in an authorized server-side
   secret vault, never in GitHub, database rows, logs, ChatGPT messages or the
   browser bundle. Verify redirect URI, scopes, token rotation and revocation.
3. Start with `gmail.readonly` or `gmail.metadata` plus `gmail.labels`
   as justified. Add `gmail.modify` only for authorized reversible
   classification/archiving; `gmail.compose` / `gmail.send` for draft/send;
   `gmail.settings.basic` only when vetted rules are ready. Avoid
   full `https://mail.google.com/` and `gmail.settings.sharing` by default.
   Google's applicable scope-verification/security requirements must be checked
   before production and especially before multi-user SaaS access.
4. Save non-secret binding metadata in the existing governed User Vault
   infrastructure after confirming its schema and RLS. Keep userId, provider,
   connection health, grants, last sync/checkpoint, and per-action audit;
   no duplicate inbox/database or parallel state machine.
5. Read mailbox metadata and 1 reversible low-risk sample, then verify owner,
   scope, message ID/thread ID, history checkpoint, label before/after and
   receipt. Prove logout/revocation; negative-test an organization-context
   request and a different user before enabling any worker.
6. Incremental ingestion must use the existing `integrations.mail_ingest_*`
   pattern, dedupe by mailbox identity + provider message/thread ID, and avoid
   double-reprocessing historic messages. If those checkpoints are
   organization-only, use a private scoped projection with proven RLS rather
   than placing personal bodies in company rows.
7. Reuse the already scheduled TORO mail ingest/reconciliation function.
   Do not introduce a second scheduler or persist full email bodies by default.

## Action policy implemented in the code

Code: `src/features/comms/personal-mailbox-guard.ts`.
Tests: `src/features/comms/personal-mailbox-guard.test.ts`.

- Read/search and draft only with verified personal-context connection and
  matching explicit personal tool grants.
- Auto-label/archive only *inspected, low-risk marketing*; protected and
  unreviewed messages require a verified Control Plane approval receipt.
- Send, move-to-Trash and edit settings require a verified approval receipt
  plus the relevant capability grant, and audit/readback.
- Delegation, permanent deletion and Google Account security changes are
  **not** authorized by this guard, even if an approval boolean is passed.
  These need a separate human-supervised security flow.
- Financial records, hotel reservations, visa documents, banks, security
  alerts, personal communications and legal papers must never be treated as
  low-risk advertising from keywords alone.
- No email body or private attachment is visible in organization context.
  Promote business facts selectively only after entity/scope evidence,
  redaction and explicit sharing authorization.

## Inbox experience

Maintain minimal labels (reuse existing labels, avoid copying originals).
Give the owner a focused view of *important today*, *pending response*,
*finance/receipts*, *travel*, *business-linked*, *marketing cleanup*. Classify
by conversation state, checking both received and sent messages. Marketing
archives stay in Gmail for recovery; archiving is not storage reclamation.

Use subscriptions management via Gmail's own UI or separately consented
provider settings, never blindly click tracking/unsubscribe links in an
untrusted email. For actual quota relief first measure Google One/Drive/Photos,
then select originals and duplicates with a manifest/restore path; do not
empty Trash or delete attachments by policy assumption.

## Verification gates still missing

- [ ] TORO OAuth consent completed by account owner and scopes recorded.
- [ ] TORO server-only secret vault/storage verified; no exposure in logs.
- [ ] Owner's private connection metadata + RLS negative test confirmed.
- [ ] Incremental read, cursor durability, deduplication and backfill verified.
- [ ] Label/archive canary with before/after Gmail readback.
- [ ] Draft/send/settings capabilities individually tested behind approval.
- [ ] Daily run integrated into existing TORO task (not another scheduler).
- [ ] Revocation, replay, denied org employee access and restore all verified.
- [ ] Gmail storage quota measured; any permanent deletions approved individually.

**No production rights, migration, extra subscriptions, forwarding,
domain-wide delegation or application passwords are created by this PR.**

## Operational gate — 15 October 2026

The owner authorized personal Gmail decluttering and TORO alignment. ChatGPT's
connected Gmail interface previously supported classification and reversible
moves; subsequent Gmail searches returned **FORBIDDEN**. This is a source-access
blocker, not evidence of revoked OAuth or permanent loss. Do not retry an
unauthorized operation blindly, scrape credentials, or substitute the company
mailbox.

Connected personal Google Drive was checked: the Drive Trash query returned
zero files, but this says nothing about Gmail Trash, Google Photos or actual
Google One quota. User-facing cleaning must **not** claim freed GB from Gmail
archiving or moving messages to Trash.

### Next authorized execution, no parallel tools or new subscriptions

1. In the user's authenticated Work/Google session verify account identity,
   check current Google One storage totals by **service**, preserve numbers
   and date as private receipts.
2. Review Gmail Trash selectively, distinguish previously owned content from
   reviewed advertising and exclude any financial, personal, hotel, travel,
   legal, security, attachment or account-recovery message. Permanent deletion
   requires concrete selection and a user-visible confirmation on Google's
   irreversible-deletion step. Never empty the whole Trash without validating
   its contents; older items may predate TORO cleanup.
3. Use Google's native **Manage subscriptions** to unsubscribe only from
   commercial newsletters, and check already-submitted requests before
   repeating. Keep receipts/security/purchases/OTA/service alerts enabled.
4. Reconcile the Gmail connector's FORBIDDEN result and TORO OAuth runtime
   independently. Only enable personal-mail read/modify after owner-consented
   scopes, private User Vault RLS/negative tests, evidence, and rollback.
5. Return current Inbox/Spam/Trash counts, permanent deletions (count and
   selected class), before/after storage GB by service, unsubscribe outcomes,
   permission health and remaining human approval. If any is not proven,
   report PENDING rather than FINISHED.

This is a status/checklist update, not a claim of production operation.
