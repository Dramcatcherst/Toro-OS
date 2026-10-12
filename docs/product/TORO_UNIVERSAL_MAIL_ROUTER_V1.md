# TORO Universal Mail Router V1

Status: DRAFT IMPLEMENTATION CONTRACT  
Owner: TORO  
Master plan: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
Scope: Mail Ingest V2 + PayFlow + cross-domain routing

## Purpose

Every authorized email is observed once and converted into zero or more verified deltas against TORO's existing canonical objects. The router does not create a second inbox, CRM, finance writer, scheduler, calendar or backlog.

## Decision envelope

For each message TORO produces a decision envelope:

```text
mail identity
-> scope/privacy
-> facts/entities/documents
-> canonical objects
-> action classes
-> authority checks
-> proposed writes
-> verification/readback
-> receipts
```

No external mutation occurs merely because an email asks for it.

## Action classes

| Class | Canonical destination | Typical projection |
|---|---|---|
| NO_ACTION | mail census only | none |
| KNOWLEDGE_UPDATE | operations.knowledge_items | portal/search |
| DOCUMENT_ARCHIVE | integrations.document_manifest + domain evidence | Dropbox/Drive |
| FINANCE_RECONCILE | finance.* + operations.obligations | Alegra / Calendar |
| CALENDAR_CONTROL | operations.obligations | existing Google Calendar |
| TASK_OR_FOLLOWUP | communication_followups or tasks | Today/Owner Attention |
| RESERVATION_SIGNAL | reservations/guests links | Kross/OTA readback |
| GUEST_SERVICE | communication_followups | Reception/TERE |
| MAINTENANCE_SIGNAL | facilities.maintenance_events | Operations |
| PEOPLE_HR | People/employee domain | HR views |
| SALES_OPPORTUNITY | customer/revenue domain | CRM/followup |
| LEGAL_COMPLIANCE | obligations + evidence | Calendar/Legal |
| SYSTEM_INCIDENT | Systems/Projects task | engineering surface |
| SECURITY_ALERT | Systems/Governance | owner attention |

## Routing principles

1. One message identity; multiple deltas allowed.
2. One canonical object per business fact.
3. Resolve entity/property before any write.
4. Use source authority per field, not per email.
5. Original material documents are preserved; ordinary email text stays in the mailbox and is referenced.
6. Calendar is a projection, not obligation truth.
7. Alegra is accounting authority, not document inbox.
8. Dropbox is archive/custody, not operational database.
9. Personal and business scopes never cross without explicit evidence.
10. All material writes use the TORO Control Plane.

## Document custody

Material attachments and generated originals use `integrations.document_manifest` and, for finance, `finance.evidence_documents`.

Archive verification states:

```text
ARCHIVE_PENDING
ARCHIVE_UPLOADED
ARCHIVE_READBACK_OK
ARCHIVE_HASH_VERIFIED
ARCHIVE_VERIFIED
```

Do not claim `ARCHIVE_VERIFIED` from an upload response alone.

## Alegra handoff

Current connector usage is read-only. TORO may:

- look up providers;
- inspect bills, invoices, payments and accounts;
- resolve cost center;
- compare document/payment state;
- prepare posting/reconciliation candidates.

A future writer must consume a Control Plane task and return readback + receipt before TORO says “recorded in Alegra”.

## Email-to-action examples

**Invoice arrives:** archive PDF/XML -> invoice/evidence -> obligation -> check Alegra -> update same Calendar event if authorized -> receipt.

**Guest asks for early check-in:** link reservation/guest -> followup -> operational task only if work remains -> no Dropbox/Alegra.

**Maintenance photo:** maintenance event -> archive evidence if material -> procurement candidate if needed -> no finance posting until an actual purchase/evidence exists.

**Candidate CV:** People domain + privacy -> archive CV only if policy/consent allows -> no public knowledge.

**Newsletter:** extract durable policy/product change only if material; otherwise NO_ACTION.

**Bank debit email:** reconciliation signal -> match obligation/document/Alegra -> never manufacture an invoice.

## Daily run output

Report only:
- coverage actually inspected;
- new valuable deltas;
- actions proposed/executed and receipts;
- archive status;
- Alegra match/posting-candidate status;
- Calendar diffs;
- unresolved exceptions;
- up to three next steps.

Routine successful routing stays in receipts, not in the master plan.
