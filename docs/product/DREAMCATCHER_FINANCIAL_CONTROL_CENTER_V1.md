# Dreamcatcher Financial Control Center v1

**Status:** GENERAL FINANCIAL REFERENCE — HISTORICAL BASELINE, CURRENT RECONCILIATION REQUIRED  
**Original baseline as of:** 2026-09-30; source reread 2026-10-20  
**Owner:** TORO Finance + TORO Revenue + Dreamcatcher Operations

This is the single general page for the ongoing financial analysis. It summarizes current truth, model rules, data quality, pending decisions and next actions. Detailed contracts remain subordinate and must not become parallel financial plans.

## 1. North star

Improve sustainable profit and cash generation while protecting guest experience, revenue, asset life and operational resilience.

Primary management metrics:
- contribution per occupied room-night;
- cash break-even;
- operating break-even;
- sustainable break-even;
- break-even occupancy;
- net ADR by channel;
- room-level cash/sustainable floors;
- monthly realized profit;
- verified savings realized.

Occupancy alone is not success.

## 2. Canonical calculation engine

Supabase parameter contract:
- `operations.knowledge_items.finance_room_unit_economics_engine_v1`
- effective from 2026-09-30;
- parameters are effective-dated and versioned;
- historical calculations must preserve the parameters valid at the time.

Core calculation:

```text
Gross guest payment
- pass-through taxes
- discounts
= net hotel revenue

Net hotel revenue
- channel/payment/acquisition cost
- turnover cost per stay
- occupied-night cost
- guest-driven cost
- breakfast/package cost
= contribution

Contribution
- allocated fixed operating cost
= operating result

Operating result
- replacement reserve
= sustainable result
```

Required floors:
- CASH FLOOR
- CONTRIBUTION FLOOR
- OPERATING BREAK-EVEN
- SUSTAINABLE FLOOR
- TARGET PRICE

Every output must identify:
- source;
- effective date;
- freshness;
- actual / inferred / estimated;
- formula version.

## 3. Historical accounting baseline — Alegra Jan–Sep 2026 (captured 2026-09-30)

Cost center: DREAMCATCHER.

**HISTORICAL SNAPSHOT — DO NOT TREAT AS CURRENT:** Amounts below preserve the original September extraction for reproducibility. Alegra's later read of the same January–September range yields different results. The latest values are kept in authorized/private financial reporting, not replicated in this public repository.

- Sales: CRC 265,585,084.46
- Operating expenses: CRC 199,724,118.69
- Operating profit: CRC 65,860,965.77
- Profit before tax: CRC 66,322,827.69
- Tax expense: CRC 21,744,372.38
- Net income: CRC 44,578,455.31

Historical provisional accounting break-even zone (recompute before using):
- approximately CRC 20.0M–21.5M monthly revenue depending on variable/fixed treatment.

**Not yet a pricing floor.**

### Source-validity gate discovered 2026-10-20 (E02/E29/E31)

**OBSERVED:** A read-only Alegra Profit & Loss report for cost center **DREAMCATCHER (ID 1)** and the *same* 2026-01-01–2026-09-30 period no longer matches the historical totals in the preceding snapshot. The difference affects operating expenses, tax and net profit. This is **accounting-baseline drift**, not proof of a new cash loss, fraud, a supplier overcharge, or a room-pricing problem. The document's historical numbers remain untouched for audit; newer monetary values stay in private, authorized reporting. The fiscal and bank reconciliation status is **UNVERIFIED**.

**Reproduction (read only):**

1. Query the **native** Alegra P&L, costCenterId=1, `from=2026-01-01`, `to=2026-09-30`, `includeComparativeAnalysis=false`, `forceSummary=true`, and `decimalPrecision=2`; preserve the execution timestamp, report parameters, source and exact account/period scope.
2. Extract **root** `Ventas` and the section `Total` lines, plus utility rows `Utilidad operativa`, `Utilidad antes de impuestos` and `Utilidad neta`. Do **not** add parent and child account balances together or treat period snapshots as transactions.
3. Compare like-for-like accounting slices and identify **which account/document revisions** explain the divergence; inspect journal/bill IDs and dates, late postings, reallocations, credits, reversals and cost-center attribution with original evidence. The report alone does not identify cause.
4. If differences remain, keep `FINANCE_BASELINE_RECONCILE` and do not recalculate price floors or claim a new savings figure. Close only with entry-level support, a reproducible updated balance, finance review and a versioned receipt in the **existing** finance-control record.

**October 2026:** A 2026-10-01–2026-10-20 P&L can be queried, but it is an **open, partial period**. At this cut the OTA-commission category contains no recorded charge. Do not interpret that as zero acquisition cost, a complete monthly profit/loss, evidence of cash on hand or a valid hotel occupancy trend. The prior month and YTD comparisons must use matched accrual/closing states and source timing.

**Next action:** TORO Finance/FIONA and the existing Alegra/PayFlow reconciliation lane own this case; Kross remains the commercial authority for actual room nights. Proposals to change inventory, rates, taxes, posts or accounts require their own approvals; do not create a second reconciliation job, database or scheduler.

## 4. Data-quality / reconciliation flags

### Revenue
Alegra surfaces disagree:
- DREAMCATCHER P&L sales: CRC 265.585M
- unfiltered P&L sales: CRC 265.651M
- general sales report before tax: CRC 273.350M

Status: **RECONCILE**.

### Kross reservations
Current Supabase mirror:
- 33 reservations;
- latest snapshot 2026-09-21 09:28 UTC;
- source rows not live.

Status: **STALE / HISTORICAL REFERENCE ONLY**.

### Breakfast
- 9 reservations marked included;
- 4 marked not included;
- 20 unknown;
- 82 included breakfast units represented in detailed meal-plan history;
- 4 extra units;
- no confirmed served/payment evidence in current normalized table;
- `operations.breakfast_orders` = 0 rows.

Status: **DATA GAP**.

### Property/cost-center contamination candidate
Within DREAMCATCHER P&L, Jan–Sep 2026 explicitly named lines include:

**Santa Toro**
- repairs: CRC 1,791,925.81
- dotation: CRC 543,108.00
- electricity: CRC 217,625.00
- water: CRC 269,324.00
- internet: CRC 164,194.00
- subtotal: **CRC 2,986,176.81**

**Diex**
- electricity: CRC 1,606,870.00
- water: CRC 3,337,971.36
- municipal taxes: CRC 1,622,043.00
- subtotal: **CRC 6,566,884.36**

Total explicitly flagged: **CRC 9,553,061.17**.

Status: **RECLASSIFY / VERIFY BENEFITING ENTITY**.

Do not remove these from accounting automatically. Determine whether they belong to Dreamcatcher, another entity/property, shared overhead or a project, then allocate correctly.

### Validación reciente 20/10/2026 — Kross y alertas financieras (no reemplaza cierres históricos)

El corte histórico de 33 filas fechado en septiembre se conserva arriba por trazabilidad, pero **no describe la cobertura actual de la tabla**. Lectura agregada de Supabase `abtyrbqlqbsastmridzp` realizada el 20/10/2026: `operations.reservations` tenía **4.352 filas Kross**, con 4.352 claves compuestas `org_id+property_id+external_reservation_id` distintas, 4.350 clasificadas `review`, 2 `conflict`, 44 sin identidad de habitación y 26 sin canal. `source_is_live=true`: **0**; `operations.current_reservations_safe`: **0**. `integrations.import_runs` registró la carga de 4.352 filas, que no equivale a disponibilidad/precio/ocupación vigentes ni garantiza paridad histórica. El responsable del carril Kross [PR #315](https://github.com/Dramcatcherst/Toro-OS/pull/315) conserva reconciliación, deduplicación, prueba de transportes y tratamiento de conflictos; la API paga permanece pausada. No volver a importar los mismos archivos simplemente por este reporte.

**Riesgo de falsas urgencias:** el lote `finance.invoices` mostró **27 registros** con fechas anteriores al 20/10 y estados diferentes de deuda exigible: 13 `unknown`, 10 `payment_reported`, 2 `duplicate_billing_dispute_unresolved` y 2 `no_payment_due_extranet_verified_2026_09_29`. La cifra **no son 27 impagos, 27 pagos ni 27 casos nuevos**; son candidatos a clasificación errónea por fecha. La corrección versionada en el carril de [PR #342](https://github.com/Dramcatcherst/Toro-OS/pull/342) distingue el total de la factura del saldo deudor y evita usar la fecha pasada como prueba suficiente de mora: `due/unpaid/overdue` explícito vencido conserva criticidad; aviso `unknown/reported/processing/disputed` conserva revisión sin convertirse en deuda confirmada; `paid/credited/no_payment_due_*verified` no genera alerta de impago. El pago registrado aún exige contraste con banco/factura/cuenta y no cierra obligación por implicación. Consultar el CI y el estado de merge de la PR antes de declarar el arreglo incorporado o publicado.

**Próximo trabajo ejecutable:** reutilizar el mismo FIN/PayFlow y los recibos existentes para (1) verificar documentos prioritarios sin declarar mora a partir del bruto o la fecha; (2) reconciliar discrepancia de ventas Alegra y asignación por entidad/costo; (3) recuperar una fuente Kross vigente y los márgenes por habitación/canal antes de optimizar precios. Para cada oportunidad reportar `HECHO / POR VERIFICAR / NO_MEDIDO`, fuente, período, moneda, decisión, siguiente responsable y beneficio marginal solo si se observa. Ningún asiento, pago, cancelación de proveedor o promoción queda autorizado aquí.

### Obligation urgency guard — 2026-10-20 (E29/E30/E36)

**OBSERVED, read-only:** Nine active `operations.obligations` records classified `needs_verification` also carry a `next_due_date` before 20 October 2026. Two have explicit critical-source signals; seven do not. These are historical-status counts, **not nine verified unpaid debts**. An old date can be a forecast, pending bank match, an administrative control date or an unresolved obligation; the source must distinguish them.

The existing Owner Attention classifier is being hardened in [PR #346](https://github.com/Dramcatcherst/Toro-OS/pull/346): if `status=needs_verification`, a past date alone yields **HIGH / verification required**. Preserve **CRITICAL** when source evidence explicitly signals failed/declined payment, suspension/restriction or provider-confirmed overdue, or when an active obligation has a genuinely elapsed payment due date. The display continues to identify invoice **total** versus outstanding balance. This code change does not certify the source's correctness, pay anything, send an alert or reconcile bank evidence; read back CI and merger state before declaring the fix in `main`.

**NEXT:** the existing TORO Finance/FIONA / PayFlow lane reviews source notices, bank match and current billing periods, then closes cases only with evidence and approval. Do not rewrite the original due date or `verification_status` to make alerts disappear. No new ledger, scheduler, role, phone channel or invoice writer.

## 5. Preliminary management classification

| Cost line | Current management treatment |
|---|---|
| OTA commissions | VARIABLE_PER_SALE |
| Travel-agency commissions | VARIABLE_PER_SALE |
| Card/bank processing | VARIABLE_PER_SALE or MIXED_FINANCIAL after detail |
| Electricity | MIXED: BASE + OCCUPANCY |
| Water | MIXED: BASE + OCCUPANCY |
| Internet | FIXED_OPERATING |
| Software | FIXED_OPERATING unless transaction-based |
| Cleaning products | MIXED: COMMON_AREA + OCCUPANCY |
| Housekeeping payroll | STEP_FIXED |
| Reception payroll | FIXED / STEP_FIXED |
| Maintenance payroll | FIXED / STEP_FIXED |
| Breakfast supplier/food | VARIABLE_PER_GUEST / PACKAGE after reconciliation |
| Room dotation | REPLACEMENT_RESERVE / CAPEX review |
| Repairs | OPERATING_MAINTENANCE vs CAPEX / OTHER PROPERTY review |
| Vehicle repairs | FLEET / NON_ROOM; allocate only if hotel-operating use |
| Income tax | TAX — excluded from room cash floor |
| Loan principal | FINANCING — excluded from room operating cost |
| Interest | FINANCING — separate owner/full-economics layer |
| Owner/shareholder distributions | OWNER_NON_OPERATING |
| Municipal/property statutory cost | FIXED/TAX by benefiting property |

## 6. Breakfast commercial parameter

Owner-confirmed current retail reference:
- USD 15 per person.
- nominal 2-person breakfast value = USD 30.

This is a reference, not yet a proven required room-rate uplift.

Final rule will use:
```text
actual package uplift
- actual marginal breakfast cost
- incremental OTA/card cost
= incremental breakfast contribution
```

## 7. Room workload

Existing table:
- `operations.room_workload_profiles`
- 20 room profiles;
- turnover/stayover weights exist;
- current status: provisional;
- based on room features, capacity and kitchens;
- not yet calibrated to real cleaning minutes.

Use weights for sensitivity/allocation only until actual cleaning-time evidence exists.

## 8. Continuous update architecture

The model must update when any of the following changes:
- supplier price;
- OTA commission;
- card fee;
- tax rate;
- breakfast price/cost;
- payroll;
- utility month;
- room workload;
- room inventory/configuration;
- rate plan;
- package inclusion;
- monthly close.

New parameter values receive:
- effective_from;
- effective_to where superseded;
- source;
- verification state.

Never overwrite history.

## 9. Current priorities

### P0 — Accounting truth
1. reconcile sales-report discrepancy;
2. classify Santa Toro / Diex lines;
3. separate capex/expansion from operating expenses;
4. separate owner/personal/non-operating items;
5. map recurring bank/card charges;
6. reconcile invoice/comprobante coverage into Alegra.

### P0 — Unit economics
7. obtain fresh reservation/room-night data;
8. calculate room-level ADR/occupancy/channel mix;
9. calibrate housekeeping/laundry actual cost;
10. reconcile breakfast actual cost and consumption;
11. identify true card/OTA fees.

### P1 — Savings
12. top controllable expenses;
13. subscription audit;
14. supplier renegotiation candidates;
15. utilities base-load review;
16. maintenance recurring-failure review;
17. staffing productivity by occupancy band.

### P1 — Revenue
18. direct-vs-OTA net contribution;
19. rate-floor simulator;
20. breakfast package profitability;
21. promotion/discount maximum safe limits;
22. room-level target price.

## 10. Change-day gate

Future milestone:
**FINANCIAL OPTIMIZATION CHANGE DAY**

No broad coordinated pricing/cost changes until:
- major sources are reconciled;
- expected impact is quantified;
- dependencies/guest impact are reviewed;
- each change has owner + rollback + verification.

## 11. Related canonical contracts

- `docs/product/TORO_BRAIN_GENERAL_PLAN.md`
- `docs/product/DREAMCATCHER_FINANCIAL_DEEP_DIVE_MASTER_PLAN_V1.md`
- `docs/product/DREAMCATCHER_BREAKFAST_ECONOMICS_MASTER_PLAN_V1.md`
- `docs/product/TORO_FINANCE_EXPENSE_EVIDENCE_POLICY_V1.md`



## 12. New findings — cost classification wave 1

### Bank / payment fees
Alegra category `Comisiones bancarias` Jan–Sep 2026:
- total: **CRC 6,233,776.15**
- 515 ledger entries;
- 100% recorded as `transactionOut`;
- BAC: CRC 5,333,291.29;
- Lafise: CRC 610,235.41;
- BCR: CRC 265,966.25;
- BN: CRC 12,708.60;
- PayPal: CRC 4,929.60;
- other: CRC 6,645.00.

This equals approximately **2.35% of DREAMCATCHER P&L sales** for the period.

Interpretation:
- strong candidate for payment-processing / merchant-acquiring variable cost;
- not yet proven entirely variable;
- reconcile against dataphone/card processor settlements before promoting to `VARIABLE_PER_SALE`.

### Ferretería / project-spend candidate
Alegra category `Ferreteria`:
- total Jan–Sep: **CRC 8,301,475.72**
- 95 entries;
- Jan–Apr spend: **CRC 6,876,157.92**
- Jan–Apr share: **82.83%**.

Largest suppliers:
- Fercosta: CRC 2,838,328.86
- EPA: CRC 1,945,295.00
- Importadora Solis CR: CRC 855,609.86
- Carbone: CRC 839,580.85
- Construplaza: CRC 399,548.00
- Novex: CRC 387,815.00

Interpretation:
- high-priority **CAPEX / expansion / major-maintenance split**;
- transaction/project purpose must be verified before removing any amount from operating expenses.

### Software / subscriptions
Alegra software category reviewed:
- total ledger review: **CRC 3,292,517.10**
- 89 entries.

Largest vendors:
- Simple Booking: CRC 1,238,800
- WeSpeak: CRC 795,880
- OpenAI: CRC 487,558.01
- Alegra: CRC 269,225
- bizee.com: CRC 148,103
- Dropbox: CRC 72,008.12
- Perplexity: CRC 52,273.50
- Airtable: CRC 49,440
- Spotify: CRC 49,158.27
- Quovis: CRC 46,375.20
- Trysoro: CRC 35,802
- Manus AI: CRC 20,000
- Vercel: CRC 18,394
- MyClaw AI: CRC 9,500

Action:
- no automatic cancellations;
- audit purpose, active use, overlap, owner, annual-vs-monthly plan and dependency/rollback;
- quantify realized monthly savings only after verified cancellation/downgrade.

### Analytical classification registry
Supabase:
- `operations.knowledge_items/dreamcatcher_cost_classification_2026_ytd_v1`

This registry is analytical only. It does **not** rewrite Alegra categories.



## 13. New findings — maintenance and labor wave

### Maintenance / repairs split

Alegra `Reparaciones` total Jan–Sep 2026: **CRC 17,594,860.19**.

Amounts requiring extraordinary/scope review:
- Ferretería: **CRC 8,301,475.72**
- Vehicle repairs: **CRC 4,899,531.56**
- Santa Toro repairs: **CRC 1,791,925.81**
- Total under review: **CRC 14,992,933.09**
- Share of repair category: **85.21%**

Residual recurring-property candidate:
- Reparaciones varias: **CRC 1,591,605.00**
- Artículos de piscina: **CRC 1,010,322.10**
- Residual: **CRC 2,601,927.10**

Interpretation:
- the accounting repair category is not a clean proxy for recurring room-maintenance cost;
- vehicle, other-property, CAPEX/expansion and ordinary maintenance must remain separate;
- no amount is removed from Alegra merely because it is under analytical review.

Sensitivity only:
if all CRC 14.99M under review were ultimately proven outside recurring Dreamcatcher operating cost, the commission-only monthly break-even diagnostic would move from about **CRC 21.48M to CRC 19.66M**. This is not an approved reclassification or pricing floor.

### Labor structure

Alegra Jan–Sep 2026:
- total personnel expense: **CRC 65,953,460.46** = **24.83% of sales**
- salaries/wages: **CRC 64,651,470.46**
- administrative payroll: **CRC 20,262,901.46** = **7.63% of sales**
- reception payroll: **CRC 9,953,438.00** = **3.75%**
- maintenance payroll: **CRC 11,020,318.00** = **4.15%**
- housekeeping payroll: **CRC 14,102,196.00** = **5.31%**
- reception + maintenance + housekeeping: **CRC 35,075,952.00** = **13.21%**
- CCSS: **CRC 5,985,933.00** = **2.25%**

Monthly averages:
- administration: ~CRC 2.25M
- reception: ~CRC 1.11M
- maintenance: ~CRC 1.22M
- housekeeping: ~CRC 1.57M

Model rule:
- **cash break-even** uses actual unavoidable payroll cash outflow;
- **economic break-even** also reflects required management labor / reasonable replacement-value compensation;
- owner/family compensation is not automatically excluded merely because of ownership relationship;
- housekeeping/reception/maintenance are modeled as fixed/step-fixed by occupancy bands, not simple linear room-night costs.

Next labor gate:
- map staffing by month against occupancy;
- isolate expansion/project labor;
- identify overtime/extra shifts;
- establish occupancy thresholds where extra staffing is actually needed;
- calibrate housekeeping workload weights to real cleaning minutes.



## 14. Scenarios — Current / Clean / Target

Supabase analytical contract:
- `operations.knowledge_items/dreamcatcher_break_even_scenarios_2026_ytd_v1`

### CURRENT — provisional accounting diagnostic

- monthly fixed/semi-fixed proxy: **CRC 19.59M**
- contribution ratio after recorded sales commissions: **91.18%**
- provisional monthly break-even revenue: **CRC 21.48M**

This is the current diagnostic baseline, not a rate floor.

### CLEAN — sensitivity only

Candidate amounts already identified for verification:
- explicit other-property lines (Santa Toro + Diex): **CRC 9.553M**
- Ferretería CAPEX/project candidate: **CRC 8.301M**
- vehicle repairs / fleet candidate: **CRC 4.900M**
- unique candidate total: **CRC 22.754M** across Jan–Sep.

If all of these are ultimately proven outside recurring Dreamcatcher operating cost:
- clean fixed/semi-fixed proxy: ~**CRC 17.06M/month**
- break-even if bank fees remain fixed: ~**CRC 18.71M/month**
- break-even if bank fees are confirmed variable payment-processing cost: ~**CRC 19.21M/month**

The range differs because moving payment-processing fees from fixed to variable lowers the fixed-cost base but also lowers the contribution ratio.

### TARGET — hypothetical planning scenarios

Using the CLEAN sensitivity as a base and treating payment processing as variable, additional controllable fixed-cost reductions would imply approximately:

| Scenario | Additional controllable fixed-cost reduction | Monthly break-even |
|---|---:|---:|
| TARGET 5 | 5% | ~CRC 18.25M |
| TARGET 10 | 10% | ~CRC 17.29M |
| TARGET 15 | 15% | ~CRC 16.32M |

These are **planning scenarios only**. They are not budgets, commitments or approved cuts.

### Guardrails

- Accounting cleanup is not automatically cash savings.
- CAPEX reclassification does not reduce future cash unless project spend actually stops or falls.
- Moving bank fees to variable cost changes contribution economics; it does not make the fees disappear.
- Labor/service cuts are not assumed.
- Savings count only after implementation + verification/readback.
- Changes must protect guest experience, revenue, asset life and operational resilience.

