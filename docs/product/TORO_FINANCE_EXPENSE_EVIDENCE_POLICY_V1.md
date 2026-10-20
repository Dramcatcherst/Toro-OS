# TORO Finance — Expense & Evidence Policy v1

**Status:** CANONICAL POLICY  
**Owner directive:** 2026-09-30  
**Applies to:** Dreamcatcher / Atrapa Sueños and every authorized TORO business scope

## 1. Core rule

Every legitimate business expense that is reported to TORO and has a supporting invoice, electronic invoice, receipt, payment voucher, contract, supplier statement or equivalent evidence must be incorporated into the accounting workflow.

The accounting system of record for Dreamcatcher is **Alegra**.

The documentary archive is **Dropbox** where durable external evidence retention is required or where Alegra cannot retain the original file in the needed form.

Supabase / TORO Finance stores normalized metadata, provenance, workflow state, reconciliation state and receipts. It does not replace Alegra as the accounting book or Dropbox as the durable file archive.

## 2. Canonical lifecycle

```text
Document / proof received
→ identify entity / property / project
→ duplicate check
→ validate issuer + date + amount + currency + tax + business purpose
→ classify accounting category + cost center
→ determine payment source
→ register / reconcile in Alegra
→ attach evidence in Alegra when supported
→ archive original in Dropbox when required
→ record durable reference + source + checksum / receipt where available
→ reconcile to bank / card / cash / supplier balance
→ close only after verification
```

## 3. Mandatory evidence fields

For every supported expense, capture as available:

- supplier / issuer;
- legal receiver;
- issue date;
- document / invoice number;
- currency;
- subtotal;
- taxes;
- total;
- payment method / account;
- business purpose;
- benefiting entity / property / project;
- cost center;
- accounting category;
- original evidence location;
- Alegra transaction/document identifier;
- duplicate/reconciliation status;
- source mailbox / WhatsApp / upload / Dropbox path;
- ingestion date;
- reviewer / confidence when classification was inferred.

## 4. No-document expenses

An expense may exist without a formal invoice. In that case:

- do not invent an invoice;
- register only if the accounting treatment is valid and sufficiently supported;
- label the evidence type correctly (receipt, transfer proof, internal voucher, statement, etc.);
- flag missing tax support where relevant;
- keep it separate from fully supported invoice expenses for tax/audit reporting.

## 5. Owner-paid and mixed personal/business expenses

Payment source does not determine accounting scope.

A personal card/bank payment can still be a company expense if business purpose and benefiting entity are verified.

Process:

1. verify business purpose;
2. verify supporting document;
3. classify as owner-paid / reimbursement / shareholder-current-account treatment as appropriate;
4. do not count both invoice and payment notification as separate expenses;
5. never classify a personal bank statement as company bank truth.

## 6. Alegra rule

If a supported business expense is not yet represented in Alegra, it remains **OPEN / UNACCOUNTED** until:

- it is registered to the correct supplier/category/cost center/date/currency/tax treatment; or
- there is a documented reason not to post it.

If it already exists, link/reconcile the evidence rather than creating a duplicate.

Do not mark the workflow DONE merely because the file exists in Dropbox.

## 7. Dropbox rule

Dropbox is the durable supporting-document archive where useful.

Preferred logical structure:

```text
Finance/
  YYYY/
    MM/
      Expenses/
        Supplier/
          ORIGINALS/
          SUPPORT/
```

Keep the original file unchanged. Derived/OCR/normalized files must be separate derivatives, never replacements for originals.

Where Alegra supports the original attachment reliably, Dropbox may still hold a backup for material documents, contracts, tax evidence, insurance, bank/processor settlements and other audit-critical records.

## 8. Duplicate control

Before any Alegra write, compare at least:

- issuer;
- invoice/document number;
- date;
- amount;
- currency;
- existing Alegra document/payment references.

Potential duplicates are REVIEW, not auto-post.

## 9. Cost-model integration

Every reconciled expense must receive a management-cost classification for TORO's profitability model:

- VARIABLE_PER_STAY
- VARIABLE_PER_OCCUPIED_NIGHT
- VARIABLE_PER_GUEST
- VARIABLE_PER_SALE
- STEP_FIXED
- FIXED_OPERATING
- REPLACEMENT_RESERVE
- CAPITAL
- FINANCING
- TAX
- OWNER_NON_OPERATING
- UNKNOWN_REVIEW

Accounting category and management-cost behavior are separate dimensions.

Example:
- electricity can be one accounting category but split analytically into a fixed base + occupancy-driven component;
- housekeeping payroll may be fixed/step-fixed even though cleaning products are occupancy-driven;
- OTA commissions are variable per sale;
- loan principal is financing, not room operating cost.

## 10. Close criteria

An expense evidence item is DONE only when:

- entity/business purpose is known;
- duplicate check passed;
- Alegra representation is verified;
- evidence is attached or durably referenced;
- Dropbox backup exists when required;
- payment/reconciliation state is known;
- cost-model behavior is classified or explicitly UNKNOWN_REVIEW;
- verification receipt exists.

## 11. Controls

Never:
- post the same expense twice because the invoice and card alert both arrived;
- treat internal bank transfers as operating expense;
- treat loan principal as room operating cost;
- treat shareholder distributions as room operating cost;
- infer business purpose solely from mailbox location;
- destroy originals after extraction;
- claim accounting completeness without reconciliation.

## 12. Continuous ingestion

New invoices and expense proofs from authorized email, WhatsApp, uploads, Dropbox, bank/card evidence or supplier portals should enter this same pipeline.

TORO should surface:
- unaccounted supported expenses;
- missing evidence;
- duplicates;
- unreconciled payments;
- wrong cost-center/category candidates;
- stale OPEN items;
- month-close completeness percentage.
