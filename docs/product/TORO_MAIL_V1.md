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
  mutation receipt validator.
- `src/features/comms/personal-mailbox-guard.ts`: provider-specific personal
  grant check for Gmail and Outlook.
- `src/features/comms/personal-gmail-cleanup.ts`: conservative classifier;
  protects purchase/order/shipping/delivery messages even when Gmail places
  them under Promotions.
- Tests cover scope isolation, another user, connector-only status, Outlook,
  action gates and receipt failures.

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

Each pass may complete at most one safe, reversible and verified unit. A batch
may contain up to twenty objects only when account, authority, classification,
risk and readback are identical. Unchanged state remains silent. The loop may
inspect metadata deltas, run tests, improve local code/docs and verify PR/CI. It
may not send, unsubscribe, label, archive, trash or permanently delete mail;
read bodies/attachments in bulk; write Alegra/Supabase; change OAuth, secrets,
permissions or production; merge/deploy; or create another scheduler.

“Fifty improvements” is implemented as the fixed, test-enforced
`TORO_MAIL_GOVERNANCE_CONTROLS` baseline. It contains fifty unique controls
across identity, privacy, runtime truth, action safety, evidence and automation.
The loop reports only material changes; it never creates cosmetic work to reach
a numeric target.
