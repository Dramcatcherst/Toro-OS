# TORO alert delivery alignment — 2026-10-13

This change does **not** create another alert queue, scheduler, inbox or source of truth.

## Reused authority

- Owner Attention remains the owner/manager exception projection from `operations.communication_followups`, `operations.obligations` and `finance.invoices`.
- `finance.module_alerts` is accepted only through an explicit compatibility adapter and never becomes the master queue.
- Airtable remains a transitional human projection; delivery state is not inferred from an Airtable row.
- TORO Comms and issue #209 remain the OpenClaw/WhatsApp transport and evidence boundary.

## Added contract

`src/features/comms/alert-delivery.ts` provides a pure, fail-closed delivery projection:

1. a signal must include what happened, impact, action, responsible party, deadline, source/cutoff and reference;
2. Owner Attention always routes to the restricted `TORO Gerencia` logical room;
3. module alerts use an explicit module-to-room policy; unknown modules are rejected rather than guessed;
4. only one active, connected, healthy, verified and observed WhatsApp/OpenClaw **group** binding may become a destination;
5. a phone binding such as `toro-interno` never substitutes for a missing group;
6. duplicate prevention is keyed by destination + source alert + version;
7. message text is bounded to 120 words and contains the required operational fields.

## Current live evidence

Read-only Supabase inspection on 2026-10-13 found one active binding: `toro-interno`, endpoint kind `phone`, with no `last_sync_at` or `last_event_at`. No WhatsApp group binding exists. Therefore every group delivery remains blocked by design.

A group becomes eligible only after the protected binding registry records it with:

- `endpoint_kind = group`;
- `business_role = room:<room-key>`;
- connected authentication;
- healthy ingestion;
- verified status;
- send enabled;
- observed event evidence.

Protected external identifiers remain outside the repository.

## Not done by this change

- no Supabase writes or migrations;
- no Airtable changes;
- no WhatsApp messages;
- no group creation or inferred membership;
- no production deployment.

The remaining E2E gate is controlled enrollment and proof of the actual groups, followed by one non-sensitive test per room and recorded provider receipts.
