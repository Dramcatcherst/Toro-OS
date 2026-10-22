# TORO Finance — Bank, Card and Financial Mail Coverage v1

**Date:** 2026-10-21. **Status:** proposed and evidence-based policy; NOT a deployed bank/email configuration or live portal module. **Canonical parent:** [TORO General Plan](TORO_BRAIN_GENERAL_PLAN.md), E29/E30/E32/E36 and [Finance expense evidence policy](TORO_FINANCE_EXPENSE_EVIDENCE_POLICY_V1.md).

## Owner decision
1. Identify **legal holder** separately from **business beneficiary**, **funding source**, **card user**, **accounting entity**, **property**, **source mailbox**, **notification recipient** and **authorized reviewer**. A named individual may hold a bank account or credit card that pays for hotel business; never classify it PERSONAL solely from the holder name.
2. Confirmed Dreamcatcher business financial documents that do not arrive in a verified organization-controlled mailbox must carry `CAMBIAR_DESTINATARIO` (routing remediation required), even if a person already forwards the document. Personal-only financial data must remain `PRIVADO_NO_REDIRECCIONAR`.
3. Mixed/uncertain products must remain `USO_MIXTO_REVISAR` or `TITULARIDAD_PENDIENTE`, not silently redirect entire statements. Obtain lawful access/consent and determine a scoped delivery method for hotel-related evidence. A forwarded document is not equivalent to an original configured delivery.
4. Distinguish receipt of **monthly bank/card statement**, **individual debit/credit alerts**, **SINPE receipt/transfer rejection**, **card purchase notification**, **merchant-acquiring settlement/chargeback**, **card fee/interest**, **supplier invoice**, **tax voucher**, and **payment evidence**. Arrival of one category never proves another.
5. Cover all configured Alegra bank/cash/credit-card ledgers and all current instruments found in private source registers. The ledger name is not proof of a real, current bank account or card. Historical statements are not current-month confirmation.
6. For every expected document, track `RECIBIDO_OFICIAL`, `RECIBIDO_PERSONAL_CAMBIAR`, `REENVIADO_CAMBIAR`, `HISTORICO_SIN_ACTUAL`, `NO_LOCALIZADO`, `USO_MIXTO_REVISAR`, `PRIVADO_NO_REDIRECCIONAR`, `NO_APLICA`. Never turn `NO_LOCALIZADO` into 'never sent'.
7. Company notification routing should prefer an authenticated approved company finance inbox, with protected internal distribution; `admin` may be an approved fallback. Verify whether the existing dedicated accounting mailbox works before changing a bank's recipient. Do not hardcode a personal mailbox in product logic.
8. Original evidence goes to approved confidential archive; Alegra remains the accounting system of record; Supabase holds normalized metadata, fingerprint, scope, reconciliation and approvals. Do not ingest personal card statements or full account numbers into public repositories or broad employee surfaces.
9. Every changed delivery setting requires owner/authorized signer approval, bank/provider-authenticated channel, a before/after receipt, a test delivery and rollback notes. **Do not alter bank beneficiaries, payment mandates, MFA, PINs, cards, accounts or routing directly from inference.**
10. Treat rejected transfers, unexpected charges, payout failures, missing expected statements, chargebacks and payment-method failures as exceptions with severity/freshness, never as a paid/settled transaction until verified. Dedupe alert vs settlement vs expense/invoice.

## Data contract (private, per financial instrument)
- `instrument_key` (opaque), `institution`, `product_type`, `masked_suffix`, `legal_holder` (restricted), `beneficiary_entity`, `scope`, `scope_evidence`, `status`, `status_verified_at`.
- `ledger_refs`, `statement_expected_frequency`, `statement_period_last_seen`, `alert_types_expected`, `alert_types_last_seen`, `original_mailbox`, `official_mailbox_coverage`, `receipt_mode`, `routing_action`, `routing_owner_role`, `privacy_class`, `retention_location`, `source_reference`.
- `reconciliation_status`, `bank_transaction_ref`, `alegra_document_ref`, `card_issuer_statement_ref`, `exception_status`, `change_request_id`, `change_approval`, `proof_of_delivery`, `verified_at`. Unknown values explicit.
- No full IBAN/PAN, financial balances or individual transaction details on public or broadly visible surfaces.

## Portal TORO Finance — expected owner-facing surface
Existing portal, no new app or navigation silo. A compact **Finanzas › Cobertura documental** section within authorized Dreamcatcher organization context:
- summary counters: business instruments verified; business mail misrouted; current statements missing; transfers rejected; unresolved identity/scope; overdue reconciliations;
- filterable table by bank/card/wallet, legal holder (privileged only), business use, current mailbox (role-limited), statement freshness, notification category, cost center, routing action and evidence;
- split views `BANCO`, `TARJETA`, `COBRO/TPV`, `TRANSFERENCIA`, `FACTURA`, `PERSONAL/EXCLUIDO`; never imply those are independent accounts;
- drilldown displays original evidence links only when authorized, protects personal facts, shows a compact actionable next step and `POR_CAMBIAR` / `VERIFICAR` / `HECHO_VERIFICADO` status;
- change workflow **propose → owner review → approved bank/provider action → confirmation test → receipt → monitoring**, not a toggle that assumes a bank changed;
- highlight current data cutoff / connector health; show legacy snapshots as HISTORY; do not auto-resolve missing periods from old statements.
- WhatsApp operational messages are compact and contain masked identifiers + statuses only; do not post full bank/card statements or account identifiers to reception.

## Initial rollout (status: audit-only)
- Read-only inventory against current Alegra bank and card ledgers, prior bookkeeping and private bank-statement catalog.
- Validate **company account vs individual-account** and *beneficiary purpose* on cards legally held by employees/representatives, including any used by hotel staff; do not assume every historical personal card is business-use.
- Prove receipt category and timeline on each approved mailbox; especially distinguish that notifications may reach a private inbox even when the company bank account is already known.
- Create owner-approved remediations for misdirected company evidence; do not change recipients until authorization.
- Close each item only with a new incoming test document and matching ledger/account mapping.

**Implementation status:** policy proposal in GitHub documentation only. Existing TORO portal UI, source integrations and banking recipients remain unchanged.

<!-- BEGIN:OWNER_2026_STATEMENT_CONTROL_20261021 -->
## Owner control — 2026 statements, routing and completion

### Compact inventory
| Instrument | 2026 evidence observed | Required next state | Route |
| --- | --- | --- | --- |
| BAC bank CRC ••••3660 / USD ••••3588 | Jan–Aug indexed; Sep original recovered | Validate originals; Oct at cycle close | 📩 |
| BAC cards ••••4966 / ••••4961 / ••••5042 / ••••7161; Visa ••••4701 | Current/partial statements only | Complete cycles; map holder/use/ledger | 📩 |
| BN CRC ••••9468 / USD ••••8174 | No company originals localized in current audit | Recover missing 2026 originals | 📩 |
| BCR CRC ••••7251 / USD ••••7849 | No company originals localized | Recover missing 2026 originals | 📩 |
| LAFISE bank CRC ••••1998 / USD ••••7740 | Historical ZIP exists, months unclassified | Inspect first; request only gaps | 📩 |
| LAFISE card ••••7930 | Monthly coverage incomplete | Complete cycles and CRC/USD mapping | 📩 |
| WINK CRC ••••1547 | Personal-context reference exists | Verify business identity; then fill gaps | 📩 conditional |
| PayPal USD | Partial operational evidence | Monthly exports incl. gross/fees/refunds/FX/net payout | 📩 after business validation |
| BAC loan ••••2411 | Product observed | Contractual schedule; principal/interest/insurance split | 📩 |

**📩 means:** configure verified business-use statements/documents to arrive automatically at `admin@dreamcatcherhotel.com`. It does **not** mean the routing change is already executed. Close this action only after authenticated provider change + new test document received at admin + retained receipt.

### Completeness rule
A month/account is complete only when TORO can resolve: issuer + masked instrument + legal/business scope + period/cutoff + original statement/export + opening/closing balance when applicable + movements + payment/settlement evidence where applicable + mapped Alegra ledger + reconciliation status. Index rows, alerts, screenshots, derived spreadsheets and ZIP filenames are discovery evidence, not substitutes for the original.

### Recovery workflow
1. Search existing approved archive/mail first; never request a duplicate by default.
2. Validate instrument identity and business scope.
3. Mark periods genuinely missing.
4. Obtain originals through bank/provider portal, authorized email delivery or export.
5. For 📩 items, configure admin delivery only after authorization and scope verification.
6. Confirm with a newly received statement/document.
7. Store original privately, fingerprint/reference it, reconcile to Alegra and mark the period complete.
8. Keep personal-only products outside company routing and reporting.

### Assistance boundary
TORO may inventory, compare, prepare provider-specific steps, detect missing periods, reconcile documents and verify receipt when connected access permits. Login/MFA/signature/bank-recipient changes that require the authorized account holder remain an authenticated human/provider action unless a governed connector explicitly supports them. Never claim configuration succeeded without a provider receipt or test delivery.
<!-- END:OWNER_2026_STATEMENT_CONTROL_20261021 -->

<!-- BEGIN:ADMIN_MAIL_VERIFICATION_20261021 -->
## Admin mailbox verification — 2026-10-21

Direct search of `admin@dreamcatcherhotel.com` for 2026 found **no monthly account/card statements** for the currently tracked BAC, Banco Nacional, BCR, LAFISE, WINK or PayPal instruments.

Observed exceptions:
- BAC does send some **transaction/transfer alerts** to the hotel mailbox; these are not monthly statements.
- PayPal references appear inside Airbnb/Meta/operational emails, but no PayPal monthly statement/export from PayPal was found.
- WINK appears only in accounting/support context, not as an official WINK statement delivered to admin.

Therefore the current 📩 / `CONFIGURAR_A_ADMIN` remediation remains valid for the tracked business instruments, subject to scope/holder verification for mixed or personal products. Do not mark any of these as already configured merely because alerts or third-party references arrive.
<!-- END:ADMIN_MAIL_VERIFICATION_20261021 -->
