# TORO Mail V1

**Status:** LOCAL/CI CONTRACT; RUNTIME OAUTH UNVERIFIED  
**Date:** 2026-10-15  
**Canonical parent:** TORO General Plan  
**Owners:** TORO Comms + TORO Personal/User Vault + TORO Tools

## Decision

`TORO Mail` is one governed mail experience over existing TORO capabilities. It
is not a second Brain, inbox database, permission system, scheduler or mailbox.
Gmail and Outlook remain provider authorities for messages, labels/folders,
attachments, subscription controls and deletion state.

The surface combines only accounts visible in the active canonical
`ToroResolvedContext`:

- personal accounts are private to the matching User Vault owner;
- organization accounts require matching active organization membership;
- a personal account is never projected into the hotel view;
- an organization administrator receives no implicit access to personal mail.

## Connection truth

The model distinguishes:

1. **connector session verified** — an account is usable in the observed
   ChatGPT/Work connector surface;
2. **TORO runtime verified** — TORO's own per-user OAuth, server-only secret,
   grants, RLS, sync checkpoint and provider readback have been proven.

State 1 never implies state 2. No production OAuth, token storage, background
worker or provider settings are created by this contract.

## Action gates

- Search/read: explicit scope + account grant + runtime proof.
- Label/archive: inspected message evidence and reversible provider readback.
- Trash: approval receipt, bounded provider object set and before/after readback.
- Unsubscribe: provider-native control or authenticated sender request, with
  approval and outcome receipt; never follow arbitrary message links.
- Send: separate capability + approval + provider delivery receipt.
- Permanent deletion: never authorized by this module; separate human flow.

Every mutation receipt records account, action, timestamps, a hash of provider
object IDs, before/after readback, outcome and approval reference where required.
Receipts contain no OAuth tokens, message bodies or attachment bytes.

## Current implementation

- `src/features/comms/toro-mail.ts`: scope-filtered Gmail/Outlook projection and
  mutation receipt validator. Organization runtime state requires explicit
  runtime-acceptance evidence; connection state and sync timestamps alone are
  insufficient. Personal mutations honor `modifyEnabled`, and organization
  sends require an actor-specific organization execute grant.
- `src/features/comms/personal-mailbox-guard.ts`: provider-specific personal
  grant check for Gmail and Outlook.
- `src/features/comms/personal-gmail-cleanup.ts`: conservative classifier;
  protects purchase/order/shipping/delivery messages even when Gmail places
  them under Promotions.
- `src/features/comms/hotel-mail-trigger.ts`: metadata-only hotel trigger. It
  projects Reception, Management, Finance or Systems queues, suppresses
  promotional noise and forces every reservation-like email through Kross
  read reconciliation. It cannot mutate a reservation.
- Tests cover scope isolation, another user, connector-only status, Outlook,
  action gates, receipt failures and department trigger routing.

## Gmail visual organization readback — 2026-10-16

The authenticated Dreamcatcher Gmail connector reused the existing numbered
taxonomy; no duplicate labels were created. A bounded recent batch added only
reversible labels: 8 Kross messages to Guests & Reservations, 41 WeSpeak alerts
to Urgent plus Guests & Reservations, 6 Booking account events to Security, 50
GitHub messages to GitHub/CI and 28 Vercel messages to Vercel/Deploys. Readback
confirmed those labels and the Inbox remained at 1,182 messages / 513 unread,
proving that this pass did not archive, trash, delete or mark messages read.

Provider-native Gmail filters are still pending. The authenticated hotel tab
was visible in Chrome, but browser control failed before settings could be read
or saved. The connector does not expose filter administration. Therefore the
code trigger is CURRENT/TESTABLE while automatic future Gmail labeling and any
TORO runtime ingestion remain UNVERIFIED.

## Runtime acceptance

Do not claim TORO Mail operational until one account per intended scope proves:

1. owner identity and provider account readback;
2. OAuth scopes and server-only secret lifecycle;
3. private/organization RLS negative tests;
4. incremental cursor, replay and dedupe;
5. one reversible canary with before/after receipt;
6. revocation and recovery;
7. no duplicate scheduler or full-body mailbox copy.

ChatGPT connector results remain operational evidence for the current session,
not proof of this runtime acceptance.

## Hourly governed loop

Mauricio authorized one hourly heartbeat for the existing TORO Mail lane. It
continues from this specification, the General Plan, the private audit receipt
and the existing PR. It is an engineering/checkpoint loop, not a mailbox worker
or evidence of production OAuth.

Each pass may complete every safe, reversible and verified unit that is
compatible with the same checkpoint and available evidence. There is no
artificial one-unit ceiling. Each homogeneous batch may contain up to twenty
objects only when account, authority, classification, risk and readback are
identical, and multiple compatible batches may run in one pass. Unchanged state
remains silent. The loop may inspect metadata deltas, run tests, improve local
code/docs and verify PR/CI. It may not send, unsubscribe, label, archive, trash
or permanently delete mail;
read bodies/attachments in bulk; write Alegra/Supabase; change OAuth, secrets,
permissions or production; merge/deploy; or create another scheduler.

“Fifty improvements” is implemented as the fixed, test-enforced
`TORO_MAIL_GOVERNANCE_CONTROLS` baseline. It contains fifty unique controls
across identity, privacy, runtime truth, action safety, evidence and automation.
The loop reports only material changes; it never creates cosmetic work to reach
a numeric target.

Owner correction on 2026-10-16 removed the earlier one-safe-unit-per-pass rule
from the active automation, this contract and the tested control set. Safety is
now bounded by authority, compatibility, batch homogeneity, readback and the
existing action gates rather than by a unit counter.

## Alert routing through OpenClaw

Mail can produce a sanitized alert candidate, but it cannot choose a recipient
from a name, phone number or mailbox alone. Hotel guest-service alerts route to
the verified Reception group; hotel payment/security/system alerts route to the
verified restricted Management group. Personal or third-party mail never routes
to hotel groups and remains blocked until a separately verified owner-direct
binding exists.

Every alert requires privacy review and a SHA-256 provider-reference hash before
it reaches the existing `alert-delivery` contract. A ready candidate still does
not prove a send. Provider acceptance and verified delivery are distinct;
delivery requires destination binding, dedupe key, timestamps and readback in a
valid receipt. The current browser can reach the local OpenClaw gateway, but it
requires its secret and is not an authenticated delivery session.
