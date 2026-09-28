# TORO Owner Attention + PayFlow V1

**Status:** CURRENT SUBORDINATE CONTRACT  
**Date:** 2026-09-28  
**Parent:** TORO General Plan  
**Owners:** TORO + FIONA + SOBRESITO + TERE  
**Canonical runtime:** Supabase

## Purpose

Give the owner one exception-driven queue across email, payments, obligations, communications, approvals and system health.

The owner must not need to watch every mailbox or vendor portal.

Canonical sources:
- `operations.communication_followups`
- `operations.obligations`
- `finance.invoices`
- `operations.tasks`
- approval records
- connector/runtime health

Knowledge contracts:
- `operations.knowledge_items/owner_attention_comms_payflow_v1`
- `operations.knowledge_items/payment_inbox_map_2026_09_v1`

## Surfaces

The same queue is projected to:
1. Portal **Today / Attention**
2. Portal **Money / PayFlow**
3. WhatsApp/OpenClaw owner summary
4. future governed voice surface

No surface owns separate state.

## Attention model

### Critical
- declined payment that may suspend a business-critical service;
- security/access incident;
- legal/tax deadline;
- in-house guest emergency;
- reservation/channel action deadline under 24 hours;
- critical connector/runtime failure.

### High
- invoice due within 3 days and not reconciled;
- duplicate charge or unreconciled collection claim;
- new contract/material commercial terms;
- high-value lead with response deadline;
- provider waiting for owner/manager decision;
- payment proof awaiting verification.

### Digest only
- routine successful receipt;
- informational vendor notice;
- usage summary without threshold breach;
- newsletter/marketing information.

## Owner actions

Safe owner actions:
- open evidence;
- acknowledge;
- assign;
- snooze until a date;
- request summary/context;
- prepare an approval-gated action.

Still gated:
- move money or pay invoice;
- change/cancel reservation or rate;
- accept a contract;
- alter permissions/secrets;
- delete business mail;
- modify DNS/MX/routing;
- send external messages outside the channel action policy.

## Payment Inbox Map

Observed operational payment/billing routes on 2026-09-28:

| Provider / flow | Verified receiving mailbox | TORO treatment |
| --- | --- | --- |
| WeSpeak vendor billing | `info@dreamcatcherhotel.com` | subscription + dispute evidence |
| WeSpeak guest payment requests | `info@dreamcatcherhotel.com` | TERE/FIONA follow-up, not processor proof |
| Alegra | `atrapasuenoshotel@gmail.com` | Finance / subscription |
| Booking invoices | `info@dreamcatcherhotel.com` | FIONA + official Extranet authority |
| Booking agreements/GDT | `admin@dreamcatcherhotel.com` | contract review |
| Google Workspace | `admin@dreamcatcherhotel.com` + legacy Gmail duplicate | Workspace obligation |
| Vercel | `atrapasuenoshotel@gmail.com` | TORO systems/finance |
| Airtable | `atrapasuenoshotel@gmail.com` | system dependency; current evidence says downgraded Free |
| Starlink fiscal invoice | `info@dreamcatcherhotel.com` | invoice + bank/Alegra reconciliation |
| ICE invoices | `atrapasuenoshotel@gmail.com` | utilities |
| INS | `admin@dreamcatcherhotel.com` + owner legacy Outlook | policy evidence |
| Meta Ads | `info@dreamcatcherhotel.com` | variable usage billing |
| WhatsApp Business | `info@dreamcatcherhotel.com` | variable usage billing |
| BAC transfer alerts | `info@dreamcatcherhotel.com` | bank evidence |
| LAFISE retention certificates | `accounting@atrapasuenos.net` -> legacy Gmail | tax/acquirer retention evidence |
| Kross support | `info@dreamcatcherhotel.com` | systems/revenue |
| Liberty / Telecable / AyA | not verified in connected Gmail | keep SOURCE_UNKNOWN |

## Corporate mailbox migration priority

1. Keep `admin@dreamcatcherhotel.com` connected.
2. Preserve/bind `atrapasuenoshotel@gmail.com` until dependency parity is proven.
3. Classify `info@dreamcatcherhotel.com` and `accounting@dreamcatcherhotel.com` in Workspace Admin.
4. Connect `info@atrapasuenos.net`, `accounting@atrapasuenos.net`, and `proveedores@atrapasuenos.net` through their real provider before deciding migration.
5. Personal/legacy owner or collaborator addresses remain external dependencies unless intentionally migrated; they never silently become corporate truth.

## Payment evidence rule

An email or invoice does not equal a paid balance.

The chain is:

`provider document -> receiving mailbox -> invoice -> obligation -> bank/acquirer/processor evidence -> Alegra/accounting reconciliation -> final state`

Examples:
- Booking “payment in progress” is not final paid state.
- Starlink fiscal invoice + provider paid state still needs bank match for complete reconciliation.
- WeSpeak duplicate March invoices are a dispute; no refund/credit is assumed without evidence.
- Meta/WhatsApp usage receipts are threshold transactions, not fixed monthly subscription values.

## WeSpeak Voice

Vendor evidence on 2026-09-28 says **“Atender llamadas de Voz con IA” = Completed**.

Dreamcatcher status remains **NOT ACTIVATED / UNVERIFIED** until direct account/runtime evidence confirms:
- eligibility and price;
- phone number/line;
- inbound/outbound scope;
- consent/recording rules;
- operating hours;
- emergency/human handoff;
- languages;
- transcript retention/privacy;
- identity and action ceilings;
- synthetic/owner QA.

Voice creates the same TORO Comms follow-ups. It cannot create a separate voice inbox.

Canonical task:
`wespeak_voice_activation_20260928`

## WeSpeak Payments

Current connected evidence proves:
- WeSpeak generates many guest payment-information/proof handoffs;
- SINPE/payment proof workflows currently reach `info@dreamcatcherhotel.com`.

It does **not** prove a native WeSpeak payment processor is enabled.

Before activation TORO must verify:
- actual product availability;
- processor(s);
- pricing/fees;
- settlement and payout;
- refunds/chargebacks;
- receipts;
- payer identity;
- Kross booking/payment handoff;
- bank/Alegra reconciliation;
- action/approval limits.

WeSpeak may become a payment **interaction surface**. Processor/bank/acquirer/Kross/Alegra evidence remains authoritative.

Canonical task:
`wespeak_payments_capability_audit_20260928`

## OpenClaw

OpenClaw reads the same Owner Attention state and may:
- summarize;
- open evidence;
- acknowledge;
- assign;
- snooze;
- prepare governed actions.

It does not gain permission to pay, accept a contract, alter a reservation, or bypass source authority because the request arrived through WhatsApp.

## Definition of done

V1 is operational when:
- every critical recurring provider has a known invoice/payment source or explicit SOURCE_UNKNOWN;
- owner sees one deduplicated queue;
- successful routine receipts do not flood owner attention;
- overdue/unverified/declined/duplicate items surface automatically;
- email/thread/obligation evidence is reopenable;
- Portal and OpenClaw return the same state;
- WeSpeak Voice and any payment capability feed the same governed pipeline;
- no money movement or contract acceptance occurs without the required gate.
