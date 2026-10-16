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
