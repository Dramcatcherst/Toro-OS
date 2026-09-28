# TORO Comms — Mailbox Bindings V1

**Status:** DRAFT / subordinate to the TORO General Plan  
**Date:** 2026-09-28  
**Owner:** TORO Comms + SOBRESITO  
**Reference workspace:** Atrapasueños / Dreamcatcher

## Purpose

Give TORO one governed, auditable way to know which communication endpoints belong to an organization and how they are connected, without creating another inbox, another memory system, or another source of truth.

This contract exists to support:
- multi-mailbox Gmail/Workspace ingestion;
- WhatsApp/OpenClaw Same-Brain capability parity;
- source/provenance-aware search;
- actionable follow-ups;
- future draft/send workflows behind separate gates.

## Existing canonical components reused

Do not duplicate:
- `integrations.source_row_archive` — governed source metadata/evidence rows;
- `public.team_messages` + `public.team_message_read_states` — internal TORO team messaging;
- `operations.communication_followups` — actionable communication follow-up state;
- `operations.tasks` — canonical work;
- `operations.knowledge_items` — governed knowledge;
- TORO context / organization membership / role authorization;
- Gmail/provider mailbox itself — source authority for email.

The only missing primitive is a server-only binding registry that maps organization -> channel endpoint -> provider/auth/sync/capability state.

## Same-Brain rule

OpenClaw/WhatsApp, Portal, email and future channels consume the same TORO Brain.

`channel -> verified identity -> TORO context -> capability router -> authoritative source -> evidence/readback -> response/follow-up`

No channel may create:
- a parallel business memory;
- a parallel task/project store;
- a parallel approval model;
- a parallel connector fabric;
- its own unrestricted credentials.

## Owner-confirmed business addresses requiring inventory

1. `info@atrapasuenos.net`
2. `proveedores@atrapasuenos.net`
3. `accounting@atrapasuenos.net`
4. `admin@dreamcatcherhotel.com`
5. `info@dreamcatcherhotel.com`
6. `accounting@dreamcatcherhotel.com`

Workspace Admin must classify each address before activation:
- user mailbox;
- alias;
- group;
- delegated/shared mailbox;
- routed address;
- other/unknown.

Do not assume six addresses = six independent users.

## Current evidence

As of 2026-09-28:
- ChatGPT Gmail connector is authenticated as `admin@dreamcatcherhotel.com`;
- Supabase contains 6,128 governed Gmail metadata rows, all from `source_base_id=admin-dreamcatcherhotel`;
- no complete multi-mailbox coverage exists;
- the hotel Drive identity `admin@dreamcatcherhotel.com` is now separately connected and readable in ChatGPT;
- no Shared Drives are visible for that identity;
- `Google Admin Downloads` contains migration report `Migration_Report_7s22reb7vl8o0_202608140404_File`;
- that report proves a historical IMAP migration path on 2026-08-14 from `info@dreamcatcherhotel.com` folders into Gmail target `atrapasuenoshotel@gmail.com`;
- some folder/message crawler rows show `Success` and others `In Progress`, so the report proves migration activity but does **not** prove completion, current aliasing, forwarding, ownership, or that the target account remains canonical;
- Google Drive connector still authenticates as `mauricio.fernandez.toro@gmail.com` even after a mobile-app account switch; ChatGPT connector OAuth must be reconnected separately;
- PR #142 Same-Brain internal-work intake is merged;
- PR #167 runtime evidence gate supersedes stale #151 and is merged;
- PR #168 Same-Brain/Codex alignment supersedes stale #143 and is merged;
- General Plan multi-mailbox + OpenClaw parity alignment is merged via PR #176.

## Binding registry contract

Draft table: `integrations.communication_channel_bindings`.

It stores only governed connection metadata:
- organization/property;
- channel/provider;
- endpoint kind;
- normalized endpoint address;
- non-secret provider account reference;
- business role;
- authorization mode/status;
- capability flags;
- ingestion mode/status;
- non-secret sync/checkpoint metadata;
- health/freshness/error state;
- provenance/verification.

It MUST NOT store:
- passwords;
- OAuth access/refresh tokens;
- API keys;
- recovery codes;
- cookies;
- bank credentials;
- raw secret-bearing provider config.

A `credential_ref` may point to an approved server-side secret/vault object. It is a reference only.

## Security model

V1 is server-only:
- RLS enabled;
- `anon` has no grants;
- `authenticated` has no direct grants;
- only trusted server/service-role paths may read/write bindings;
- Portal/WhatsApp receives allowlisted status through server APIs, never raw binding rows or credential refs.

Later client-readable projections require a separate reviewed security-invoker view/RPC.

Authorization to use a binding comes from TORO context + capability/action policy, not merely from the existence of a row.

## Gmail/Workspace transport

Preferred production order:
1. Google Workspace Admin inventory: users, aliases, groups, delegation/routing, recovery/admin health.
2. Explicit OAuth or approved delegated/shared-mailbox connection for each real mailbox needed by TORO.
3. Read-only backfill of metadata with mailbox provenance and deterministic deduplication.
4. Gmail History / push notifications for incremental ingestion when authorized.
5. Classification -> follow-up/task/evidence promotion.
6. Draft support after read parity.
7. Send/reply/forward/delete/routing only after separate approval, idempotency, audit and rollback gates.

Domain-Wide Delegation is not a V1 shortcut. If ever needed, it requires a separate founder/security review.

## Data flow

For each email event:
1. binding resolves mailbox/org;
2. provider message/thread IDs are preserved;
3. minimal metadata enters governed intake/archive;
4. classifier resolves privacy + intent + domain + risk;
5. facts/tasks/follow-ups are promoted atomically when warranted;
6. body/attachments are read only when the task requires them;
7. original Gmail message remains authoritative evidence;
8. provenance remains sufficient to reopen the source message.

## OpenClaw/WhatsApp use

OpenClaw never receives mailbox passwords/tokens.

A verified owner request such as:
- “¿Qué necesita atención en todos los correos?”
- “Busca los reportes Evertec”
- “¿BAC respondió el caso?”
must route through TORO Comms, which queries only active/authorized bindings.

Responses must:
- separate mailbox/source;
- identify freshness;
- deduplicate threads;
- respect scope/privacy;
- surface actions/follow-ups;
- fail closed for unavailable or unauthorized sources.

## Initial proof sequence

### Proof A — Evertec / BCR
Target mailbox: `info@atrapasuenos.net`.

Success:
- classify its Workspace endpoint type;
- establish authorized read transport;
- locate Evertec/BCR retention correspondence and attachments;
- backfill relevant metadata with mailbox provenance;
- link evidence to the existing tax/acquirer-retention work;
- query the result from TORO and WhatsApp/OpenClaw through the same governed path.

### Proof B — Finance mailboxes
- `accounting@atrapasuenos.net`
- `accounting@dreamcatcherhotel.com`
- `proveedores@atrapasuenos.net`

Focus: bills, banks/processors, tax, vendors, obligations and reconciliation signals.

### Proof C — Guest/admin mailboxes
- `admin@dreamcatcherhotel.com`
- `info@dreamcatcherhotel.com`

Focus: reservations, guests, channels, reviews, systems and administrative notices.

## Acceptance gates

Do not claim complete mail access until all apply:
1. every owner-confirmed business address classified;
2. real mailbox/alias/group relationships documented;
3. all required real mailboxes have authorized read transport;
4. historical backfill counts and deduplication verified;
5. incremental ingestion observed;
6. failures/staleness visible;
7. privacy/scope tests pass;
8. no secrets stored in TORO data;
9. follow-up/task promotion is idempotent;
10. OpenClaw can query cross-mailbox state through TORO with provenance;
11. unauthorized/private scope negative test passes;
12. reconnect/replay creates no duplicate work.

## Rollback

Because V1 binding data is metadata only:
- disabling a binding stops ingestion/use without deleting Gmail data;
- provider OAuth can be revoked externally;
- TORO archived metadata can remain as evidence according to retention policy;
- no provider mailbox content is deleted by rollback;
- no DNS/MX/routing changes are part of V1.

## Next execution

1. Reconnect the ChatGPT Google Drive/Workspace connector to the intended hotel Workspace identity.
2. Obtain read-only Workspace Admin inventory.
3. Classify the six owner-confirmed addresses.
4. Connect `info@atrapasuenos.net` first and complete Evertec proof.
5. Validate the draft binding table in isolated/rollback SQL.
6. Prepare a reviewed production migration only after the inventory proves the required endpoint model.
