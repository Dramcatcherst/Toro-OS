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

## Governed loop every two hours

Mauricio authorized one heartbeat every two hours for the existing TORO Mail lane. It
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

From 2026-10-21, each pass advances until the first real authority/evidence
gate, may switch to another independent eligible unit instead of repeating a
blocker, and records denominators for any coverage claim. Before heavy local
work it reuses a fresh TORO PC Health receipt or runs the read-only probe; a
`STOP_HEAVY_WORK` result restricts the pass to connectors, analysis,
documentation and focused tests. This resource gate changes execution method,
not mail permissions.

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


## R1–R3 reply preparation — 12 November 2026

**Scope:** existing TORO Comms / TORO Mail lane, subordinate to the one General
Plan. **CURRENT:** reviewed preparation candidate on PR #308; **TARGET:**
verified provider dispatch. This change adds no transport, OAuth, secret, schema,
permission, scheduler, deployment or active writer.

The owner adopted the bounded R1–R3 policy through “Ejecutar superprompt” under
`external_email_specific_approval_policy_v1`. The operational record remains
`runtime_enabled=false` and `effective_activation_at=null` until the technical
acceptance gates pass. This is not a request to repeat the owner's authorization.
The initial sender target is `info@dreamcatcherhotel.com`; verify its physical
mailbox and send-as identity before activation. Admin and accounting remain
restricted; labels or aliases do not establish reception access boundaries.

`mail-reply-preparation.ts` is server-only and always returns `canSend=false`.
A `prepared` result is a proposal for the existing Control Plane, not atomic
admission or permission to send. Inputs must come from trusted server readers;
receipt references provide provenance, not self-verifying grants. No route in
this change accepts client JSON or email statements as trusted evidence.

The preparation requires current runtime/binding evidence, an exact send-as
identity, an adopted policy with an effective cutoff, a newer native message,
a verified direct sender/recipient, inspected loop headers, a linked person
and case, current human/dispatch state, an approved template and a current
canonical quota snapshot. R1 needs approved current public knowledge; R2 may
ask only arrival/departure dates and guest/room counts; R3 needs an actual
canonical case persistence receipt. Restricted intents remain for review.

Identity is `provider + physicalAccountRef + nativeMessageId`. The physical
mailbox reference is stable across aliases, send-as identities and reconnection;
it is not a connector/session/link ID or an address guessed from message text.
A server readback must relate each binding to that physical identity. Action
deduplication uses organization + native-message identity + reply operation;
changing case assignment, template or policy receipt cannot create another
automatic reply to the same source message. External address local-part case
is preserved unless a future provider-verified equivalence explicitly allows it.

WeSpeak/relay notifications require original conversation resolution and never
become recipients by copying quoted guest addresses. Human takeover or a newer
human reply blocks preparation. The source action outcome is distinct from
the last response elsewhere in the case; an uncertain case send pauses the
case, while a resolved earlier response does not prevent a new message from
being prepared within its quota.

Limits are at most 20 globally per operating day in `America/Costa_Rica` and
at most 2 per case in a rolling 24 hours. Snapshot checks here do not implement
durable counters or concurrency control. The future dispatcher must re-read
policy/identity/human state, bind the exact approved template and final content
hash, atomically reserve both quotas with the existing fenced outbox/ledger,
emit verified anti-loop headers, obtain provider evidence and reconcile any
uncertain result before retry. Until that integration is verified, no automated
send is enabled.

**Integration boundary:** PR #308 was inspected at
`194593be07980fbae47b505808588610d34b2840` and initially diverged from main.
The 12 November continuation reconciles the same branch with main
`425bfb0c61d0522f3362e42e80f19a99185a0838`: alert scope/health/message-budget
contracts, cleanup protections and all current test scripts are preserved.
Canonical tests, lint, typecheck and the declared build pass; no merge or
production acceptance is claimed. Rollback is the revert of this slice; it has no live
provider or database effects.
