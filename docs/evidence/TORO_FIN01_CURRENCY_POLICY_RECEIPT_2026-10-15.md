# FIN-01 currency and FX policy receipt — 2026-10-15

## Outcome

`FIN01-P0-CUR-01` is complete as a documentation and control unit. It remains `MATRIX_READY_FOR_ACCOUNTANT_REVIEW / PREPARED_NOT_APPLIED`: the matrix resolves how CRC/USD must be handled, but does not ratify fiscal treatment, post an adjustment, change configuration or close a period.

## Verified evidence

- Company configuration evidence from 2026-09-19 shows CRC; the live 2026-10-15 currency catalog independently marks CRC `main=true`.
- Both current read links returned the same currency catalog and the same 18-account catalog.
- `getDefaultCurrency` returned USD/500; this conflicts semantically with the stronger base-currency evidence and is quarantined as an ambiguous endpoint.
- The USD rate 500 has `autoUpdate=no`; it is an observed configuration/historical value, not an implicit rate.
- All 18 active accounts are documented: 9 return USD explicitly and 9 omit native currency. The omissions remain `PENDING_EVIDENCE`, with CRC only as a candidate.
- TORO's bank projection contains 9 CRC and 9 USD accounts and showed zero account↔statement↔transaction currency mismatches at the cutoff. This corroborates internal consistency but does not replace omitted native Alegra fields.
- Existing TORO tables can be reused for bank reconciliation, but the cross-domain original-currency and FX provenance contract is incomplete. No DDL or backfill was performed.

No balances, account numbers, credentials or guest data are reproduced in the policy.

## Decision and controls

- Base currency: CRC, observed and corroborated, pending accountant ratification and one primary company-identity readback.
- Additional currency: USD.
- Always preserve original amount and currency.
- Separate document/commercial, fiscal, settlement and analytical rates.
- Record direction, source, date and purpose for every conversion.
- Missing evidence becomes `PENDING_EVIDENCE`, never zero or an inferred conversion.
- Existing rate 500 values remain historical as recorded; never apply 500 globally or rewrite history automatically.

The direct fiscal authority adopted is article 15 of Costa Rica Law 6826: the BCCR reference selling rate effective at the taxable event for consideration fixed in a currency other than CRC. An accountant still determines the taxable event and treatment for each operation.

## Files and validation

- `data/toro_fin01_currency_policy_2026_v1.json`
- `docs/product/TORO_FIN01_CURRENCY_AND_FX_POLICY_2026-10-15.md`
- `tests/toro-fin01-currency-policy.test.mjs`

The tests cover the 18/18 denominator, explicit-versus-missing currency evidence, the prohibition on implicit 500, preservation of originals, FX provenance, official authority and one-next-task continuity.

## Boundaries and recovery

- No Alegra, Supabase, Kross, bank, Dropbox or Airtable write occurred.
- No rate, company setting, document, account, balance, RLS policy, table, historical value or period was changed.
- Writer Alegra remains off and the financial heartbeat remains paused.
- Recovery is local only: revert this unit's repository/checkpoint delta.

## Single next action

Execute `FIN01-P0-SCOPE-01`: separate company, business, property, cost center, person and related-party scopes using existing evidence, without reopening the currency inventory or modifying external systems.
