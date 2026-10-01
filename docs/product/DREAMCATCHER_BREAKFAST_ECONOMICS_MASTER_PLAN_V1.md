# Dreamcatcher Breakfast Economics — Master Plan v1

**Status:** CANONICAL ANALYSIS PLAN  
**Owner directive:** 2026-09-30  
**Owner:** TORO Finance + TORO Revenue + Dreamcatcher Operations  
**Objective:** determine whether breakfast increases contribution, conversion and guest value enough to justify its cost, and use real reservation data to decide when breakfast should be included, optional, upsold, repriced or removed.

## 1. Decision questions

This work must answer with real data:

1. What percentage of reservations include breakfast?
2. What percentage are room-only?
3. What percentage have breakfast status unknown or insufficiently sourced?
4. How many breakfast portions are included per occupied guest-night?
5. How many included breakfasts are actually consumed?
6. How many included breakfasts are not consumed?
7. How many extra breakfasts are purchased?
8. What is the realized selling price of breakfast by channel/rate plan?
9. What does one served breakfast actually cost the hotel?
10. What gross margin and contribution margin does breakfast generate?
11. Does breakfast increase ADR enough to cover its cost?
12. Does breakfast improve conversion, length of stay, direct-booking share or guest satisfaction?
13. At what room rate does including breakfast destroy room contribution?
14. Which channels/rate plans should include breakfast and which should not?
15. What is the break-even breakfast price per person?
16. What is the maximum breakfast subsidy the hotel can absorb while protecting room margins?

## 2. Canonical data sources

### Reservation / rate source
Kross / PMS is the transactional authority for:
- reservation;
- stay dates;
- room;
- guest count;
- rate plan;
- channel;
- room price;
- breakfast inclusion;
- extras;
- reservation status.

### Breakfast operations
Breakfast Tomorrow / POS / meal reports are the operational authority for:
- breakfast plan;
- extra breakfasts;
- house breakfasts;
- included not consumed;
- served/consumed status;
- supplier payable.

### Accounting
Alegra is the accounting authority for:
- breakfast supplier expense;
- food / beverage expense;
- taxes;
- payments;
- cost-center treatment;
- supporting invoice/comprobante.

### Evidence archive
Dropbox stores durable supporting evidence where needed:
- supplier invoices;
- weekly breakfast summaries;
- spreadsheets;
- reconciliations;
- contracts / price agreements.

### Analytical layer
Supabase / TORO Finance stores:
- normalized reservation-to-breakfast relationships;
- calculated economics;
- provenance;
- freshness;
- data-quality state;
- reconciliation receipts.

## 3. Current verified baseline — 2026-09-30

### Supabase reservation mirror
The current reservation mirror contains **33 reservations** covering check-ins from 2026-09-15 and check-outs through 2026-11-22.

Breakfast field coverage:
- **9 reservations** marked breakfast included;
- **4 reservations** marked breakfast not included;
- **20 reservations** have breakfast inclusion unknown;
- latest reservation snapshot: **2026-09-21 09:28 UTC**;
- **0 rows are live-source rows**.

Therefore:
- included share of all mirrored reservations = **27.3%**;
- not-included share = **12.1%**;
- unknown = **60.6%**.

These percentages are descriptive of the stale mirror only and must not be treated as current hotel-wide mix.

### Detailed meal-plan evidence inside reservation mirror
For reservations containing detailed breakfast-plan day records:
- **17 reservations** have detailed day-level meal-plan data;
- **39 reservation-day meal-plan rows**;
- **82 included breakfast units**;
- **4 extra breakfast units**;
- **86 guest-day units** represented;
- **0 rows contain confirmed served evidence**;
- **0 rows contain confirmed payment evidence**.

Important distinction:
**rate-plan inclusion is not proof that breakfast was ordered, served, consumed or paid.**

### operations.breakfast_orders
Current row count: **0**.

This is a material operational data gap. The canonical economics model cannot yet prove:
- actual consumption;
- included-not-consumed rate;
- kitchen-confirmed portions;
- reception-confirmed portions;
- payment status for extras.

### Alegra breakfast accounting
Jan–Sep 2026 P&L category:
- **Desayunos/Almuerzos/Cenas: CRC 5,562,520**.

Data-quality issue:
postings are concentrated in a few months. Zero months must not be interpreted as zero breakfast activity without reconciliation.

## 4. Economic model

For every breakfast unit:

```text
Breakfast contribution
= realized breakfast revenue
- supplier/food cost
- attributable labor
- payment/channel cost
- waste/comp cost
```

For breakfast bundled into room rate:

```text
Breakfast package uplift
= room rate with breakfast
- comparable room-only rate

Incremental breakfast contribution
= package uplift
- breakfast marginal cost
- additional channel commission on uplift
```

If the breakfast package uplift is lower than incremental breakfast cost, breakfast destroys contribution unless it creates measurable value elsewhere (conversion, occupancy, LOS, direct share, review score, upsell).

## 5. Required cohorts

Compare real reservations by:

### Breakfast status
- INCLUDED_AND_CONSUMED
- INCLUDED_NOT_CONSUMED
- INCLUDED_UNKNOWN_CONSUMPTION
- ROOM_ONLY
- EXTRA_PURCHASED
- HOUSE / COMP
- UNKNOWN

### Channel
- direct engine
- direct/manual
- Booking
- Expedia / OTA
- agency / wholesaler
- walk-in/front desk

### Rate plan
Use exact Kross rate plan names.

### Room
All sellable rooms and canonical combinations.

### Guest profile
- 1 guest
- 2 guests
- family / 3+
- child included
- extra guest

### Stay length
- 1 night
- 2 nights
- 3–4 nights
- 5–7 nights
- 8+ nights

## 6. Core KPIs

### Demand / attachment
- breakfast-included reservation %
- room-only %
- breakfast extra attach rate
- included breakfast units / guest-night
- extra breakfast units / guest-night

### Consumption
- included consumed %
- included not consumed %
- no-show / waste %
- supplier-paid but unconsumed %

### Economics
- average realized breakfast price
- breakfast cost per served person
- breakfast contribution / person
- breakfast contribution margin %
- package uplift vs room-only
- incremental margin after OTA/card fees
- breakfast cost as % of room ADR
- breakfast contribution per occupied room-night

### Commercial effect
- ADR with breakfast vs comparable room-only
- direct share with breakfast vs room-only
- length of stay
- cancellation rate
- conversion where available
- review / satisfaction signal where available

## 7. Pricing decisions

TORO Revenue must classify each breakfast offer as:

- **KEEP / PROFITABLE**
- **KEEP / CONVERSION SUPPORT**
- **REPRICE**
- **MAKE OPTIONAL**
- **DIRECT-ONLY VALUE ADD**
- **REMOVE FROM OTA PACKAGE**
- **REVIEW — INSUFFICIENT EVIDENCE**

No offer should be recommended for removal solely because its direct unit margin is low if verified conversion or ADR lift more than compensates for the subsidy.

## 8. Break-even breakfast price

Required outputs:

- cash cost per served breakfast;
- sustainable cost per served breakfast;
- minimum direct selling price;
- minimum OTA selling price after commission;
- minimum bundled room-rate uplift;
- target breakfast price at desired contribution margin.

Scenario sensitivity:
- supplier cost +10%;
- supplier cost -10%;
- OTA commission 15%, 18%, 20%;
- card fee;
- 1, 2, 3, 4 guests;
- included no-consumption at 0%, 10%, 20%, 30%.

## 9. Included-but-not-consumed treatment

This is a critical metric.

If the hotel only pays the supplier for breakfasts actually consumed:
- unused included breakfasts create package margin and should not be expensed as consumed.

If the supplier charges planned breakfasts regardless of consumption:
- unused breakfasts are waste and reduce package contribution.

The supplier payment contract / weekly settlement method must therefore be treated as a source-of-truth dependency.

## 10. Reconciliation workflow

Weekly:
1. Kross reservations with breakfast;
2. Breakfast Tomorrow / operational sheet;
3. extras paid;
4. house breakfasts;
5. not consumed;
6. supplier payable;
7. Alegra expense/payment;
8. difference report;
9. unresolved exception queue.

Every week should close with:
- planned units;
- served units;
- paid extra units;
- included no-consume units;
- supplier units payable;
- revenue;
- cost;
- gross contribution;
- unexplained difference.

## 11. Reservation-level profitability

TORO should eventually calculate for every reservation:

```text
Reservation revenue net of tax
- OTA / channel fee
- payment fee
- room marginal cost
- breakfast marginal cost
- other package cost
= reservation contribution
```

This enables direct comparison of:
- same room with breakfast;
- same room without breakfast;
- direct vs OTA;
- package vs discount.

## 12. Lowering company break-even

Breakfast analysis is part of a broader objective: lower Dreamcatcher's monthly break-even **without damaging revenue or guest experience**.

Priority levers:
1. reduce non-value-generating fixed cost;
2. move avoidable fixed costs to variable/usage-based structures;
3. increase direct booking share;
4. reduce OTA commission leakage;
5. eliminate duplicate / personal / non-operating expenses from hotel operating view;
6. reduce utility base load;
7. improve housekeeping productivity without lowering standards;
8. reduce waste and unconsumed breakfast payable;
9. renegotiate supplier unit economics where volume supports it;
10. increase contribution per occupied room-night before chasing occupancy.

Break-even reduction must be measured through:
- fixed operating cost / month;
- variable cost / occupied room-night;
- weighted contribution margin;
- required occupied room-nights;
- break-even occupancy;
- break-even revenue.

## 13. Acceptance criteria

Breakfast economics is DONE only when:

- at least 90% of reservations in the selected analysis period have resolved breakfast status;
- served/consumed evidence is available or supplier-payable logic is provably equivalent;
- breakfast supplier costs are reconciled to Alegra;
- extra breakfast revenue is reconciled;
- included-not-consumed treatment is verified;
- room-only vs breakfast rate-plan comparison is based on actual comparable reservations;
- results are segmented by channel;
- stale / unknown records are excluded or visibly labeled;
- recommendation is based on contribution, not revenue alone;
- at least 8–12 weeks of clean data are available for ongoing monitoring.

## 14. Immediate next actions

P0:
- backfill the 20 unknown breakfast statuses in the current 33-reservation mirror where source evidence exists;
- populate / normalize breakfast operational events instead of leaving `operations.breakfast_orders` empty;
- reconcile the 82 included + 4 extra historical plan units against actual served/payable evidence;
- reconcile Jan–Sep Alegra breakfast category against weekly supplier records;
- identify exact Kross rate-plan price uplift for breakfast vs room-only.

P1:
- calculate actual breakfast unit cost;
- calculate actual package uplift;
- calculate contribution by channel;
- establish direct/OTA breakfast minimums.

P2:
- automate weekly breakfast economics dashboard and exceptions.
