# TORO Performance Intelligence v1

**Status:** TARGET SPEC + NEXT IMPLEMENTATION CONTRACT  
**Date:** 2026-09-22  
**Canonical parent:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Reference implementation:** Dreamcatcher Hotel  
**Owner model:** TORO Revenue + TORO Finance + TORO Data, surfaced through TORO executive control  
**Important:** this is a cross-subsystem capability, **not** a new subsystem, product, database, task engine, or master plan.

---

## 1. Purpose

TORO Performance Intelligence turns governed business facts into a compact operating view that helps an owner answer:

1. What is happening?
2. Why is it happening?
3. Is the number trustworthy?
4. What needs attention?
5. What action should happen next?

For Dreamcatcher, the first implementation covers hotel production, occupancy, pricing, channels, cash/accounting context and unit performance.

The capability must generalize to other businesses without carrying Dreamcatcher private facts into another tenant.

---

## 2. Product boundary

### This capability IS

- a governed KPI/metric layer;
- a reconciliation layer between operational, commercial and financial authorities;
- an exception detector;
- a decision-support surface for Portal and WhatsApp;
- a source-aware history of metric definitions and quality state.

### This capability IS NOT

- another accounting ledger;
- another PMS;
- another data warehouse;
- a replacement for Kross or Alegra authority;
- a duplicate dashboard project;
- a new TORO subsystem;
- a claim that current historical files are fully reconciled.

---

## 3. Canonical ownership

| Concern | Canonical owner |
| --- | --- |
| Hotel production, channel, rate, pickup, bookings | TORO Revenue |
| Accounting, cash, obligations, margin, reconciliation | TORO Finance |
| Metric grain, provenance, quality, conflicts, freshness | TORO Data |
| Executive exceptions, priorities, decisions | TORO Core / executive control |
| Kross/Alegra/system health | TORO Systems + TORO Tools |
| Dreamcatcher commercial specialist | TORO TERE |
| Dreamcatcher finance specialist | TORO FIONA |
| Integration / QA specialist | TORO SOBRESITO |

Specialists route work. They do not own shadow truth.

---

## 4. Source authority

TORO must always distinguish the meaning of a value from the system that produced it.

| Meaning | Primary authority | Notes |
| --- | --- | --- |
| Reservation / stay / room-night production | Kross | PMS authority; snapshots may contain future/on-the-books data |
| Daily occupancy / ADR / RevPAR | Kross daily operational report when scope is verified | Prefer dynamic available-room denominator over reconstructed fixed inventory |
| Rate plans / channels / agencies | Kross + governed TORO mappings | FrontOffice is a capture label, not automatically a direct-acquisition channel |
| Invoice / accounting record | Alegra | Fiscal/accounting authority, subject to correct entity/center classification |
| Cash / settlement / bank balance | Bank / processor evidence | Never infer cash from production or invoice totals |
| TORO-owned metric definition / quality state | Supabase | Stores governed projections, definitions, provenance and conflicts |
| Narrative working memory | Notion | Not an accounting or PMS authority |
| Files / exports / evidence | Drive/Dropbox/Library | Evidence source; derived files must not silently become authority |
| Product architecture / contracts | GitHub | Versioned product and metric contracts |

---

## 5. Metric state model

Every published metric must carry a state. A number without state is incomplete.

Allowed semantic states:

- **ACTUAL_OPERATIONAL** — observed operational result for a completed or elapsed period from the relevant authority.
- **ON_THE_BOOKS** — future or not-yet-completed reservations already present at a stated cutoff.
- **PARTIAL_PERIOD** — current period is still open.
- **ACCOUNTING_RECORDED** — accounting system value for its accounting scope.
- **CASH_VERIFIED** — bank/processor/cash evidence reconciled.
- **FORECAST** — modeled future value with assumptions.
- **PROXY** — useful approximation with an explicit limitation.
- **NEEDS_VERIFICATION** — usable only as a lead for investigation.
- **CONFLICT** — two or more sources/definitions materially disagree.
- **HISTORICAL** — preserved for reference but not automatically current.

Portal and WhatsApp must expose the state when it materially changes interpretation.

---

## 6. Canonical metric contract

Every metric definition must include:

- `metric_key`;
- business meaning;
- numerator;
- denominator where applicable;
- grain;
- time basis;
- currency;
- source authority;
- allowed filters;
- exclusions;
- semantic state;
- freshness;
- reconciliation status;
- known limitations;
- owner;
- evidence;
- version.

### Core Dreamcatcher metrics

#### 6.1 Accommodation production

**Key:** `accommodation_production`

Meaning: room/villa accommodation amount assigned by the PMS to the reporting period.

Rule:
- do not call this cash;
- do not call this accounting revenue unless reconciled to the accounting definition;
- keep original currency explicit or mark currency unknown;
- distinguish room accommodation from extras and total reservation amount.

#### 6.2 Total reservation amount

**Key:** `reservation_total`

Meaning: PMS reservation amount including the components defined by the source export.

Rule:
- never add it on top of accommodation production when both describe overlapping value;
- never sum detail rows, subtotals and annual totals together.

#### 6.3 Booking count

**Key:** `booking_count`

Meaning: unique reservations at the declared reporting grain.

Rule:
- booking count is **non-additive across time buckets**;
- do not sum daily or monthly reservation counts to derive a longer-period unique booking count;
- use distinct reservation identifiers at the target period grain, or a source-provided period total whose grain is verified;
- active-reservation counts in a daily operational report are not the same metric as unique bookings.

#### 6.4 Occupied room nights

**Key:** `occupied_room_nights`

Meaning: sellable accommodation nights consumed/assigned under the chosen scope.

Rule:
- full-villa sales and their component rooms must not be counted twice;
- unresolved room assignment remains unresolved, not guessed.

#### 6.5 Available room nights

**Key:** `available_room_nights`

Meaning: sellable inventory actually available to the chosen scope and date.

Preferred source:
1. verified daily PMS availability/occupancy denominator;
2. verified inventory calendar;
3. fixed physical inventory only as an explicitly labeled proxy.

Do not infer availability from current room count alone when historical inventory changed.

Coverage rule:
- Occupancy/RevPAR are decision-ready only when available-room denominator coverage spans **every calendar day in the declared period**, or an authoritative daily inventory calendar supplies the missing days;
- a zero-demand day still needs a denominator;
- missing denominator is not zero inventory;
- partial denominator coverage may be shown only as an explicitly labeled proxy/quality limitation.

#### 6.6 Occupancy

**Key:** `occupancy_pct`

`occupied_room_nights / available_room_nights`

Hard rule:
- do not publish a final occupancy if the denominator is not validated;
- fixed-calendar occupancy is labeled **PROXY**;
- full-villa / room overlap must be resolved before mixing scopes.

#### 6.7 ADR

**Key:** `adr`

`accommodation_production / occupied_room_nights`

Rule:
- weighted ADR only;
- never average monthly ADR values to derive period ADR;
- zero-revenue nights remain in the denominator when they are legitimate occupied nights;
- canjes can be separately classified but must not be silently deleted.

#### 6.8 RevPAR

**Key:** `revpar`

`accommodation_production / available_room_nights`

Rule:
- inherits the same availability gate as occupancy.

#### 6.9 Channel mix

Keys:
- `booking_share`
- `engine_share`
- `frontoffice_capture_share`
- other governed channel shares.

Rule:
- FrontOffice is not synonymous with direct acquisition;
- report capture channel separately from verified acquisition/source when available.

#### 6.10 Accounting income / expense / result

Keys:
- `accounting_income`
- `accounting_expenses`
- `accounting_result`

Rule:
- retain entity/legal/property/center scope;
- do not label entity-wide accounting result as Dreamcatcher-only margin until allocation is verified;
- CAPEX, financing and personal/family items require classification before operating-margin use.

#### 6.11 Cash

Keys:
- `cash_collected`
- `bank_closing_balance`
- `processor_net_settlement`

Rule:
- cash requires cash/bank/processor evidence;
- production, invoices and reservations are not cash;
- currency and FX source/date must be explicit.

---

## 7. Inventory and unit hierarchy

Dreamcatcher must support these distinct concepts:

- individual room;
- villa/full-property product;
- room bundle;
- auxiliary unit;
- retired/separate property;
- sellable inventory calendar.

### Double-count protection

If a villa booking consumes component rooms:

- either report villa production at villa-product grain;
- or allocate to component rooms using a documented allocation rule;
- never count the same consumed capacity and revenue in both totals.

### Mixed inventory grain

Room-product nights and villa-product nights are different grains.

- a villa-night is not automatically one room-night;
- do not aggregate mixed room/villa product nights into physical occupancy;
- keep villa production at villa-product grain unless reservation-level evidence allocates the stay to component rooms;
- do not multiply historical villa nights by today's room count as a shortcut.

### Complimentary / barter / canje

Confirmed complimentary or barter nights consume real inventory even when accommodation revenue is zero.

- do not delete them from occupied-capacity metrics merely because price is zero;
- preserve the source-observed ADR when reporting the source metric;
- an adjusted paid/revenue-bearing ADR may exclude verified complimentary/barter nights only as a separately labeled analytical metric;
- do not invent barter/marketing value as room revenue, cash or accounting income without evidence and approved accounting treatment.

### Reference-implementation configuration

Tenant-specific inventory rules belong in governed private configuration/knowledge, not in this public product contract.

For any reference implementation, TORO must resolve and version:
- canonical sellable rooms/units;
- villas and component-room relationships;
- auxiliary units excluded from standard denominators;
- separate or retired properties;
- canje/complimentary classifications;
- historical opening/closure/block dates;
- allocation rules when a composite product consumes component inventory.

Public product documentation must not contain private tenant financial values, private file identifiers/hashes, unpublished commercial anomalies or other tenant-confidential evidence.
---

## 8. Time semantics

Every report must distinguish:

- service/stay date;
- booking creation date;
- payment date;
- settlement date;
- invoice date;
- bank value date;
- accounting period;
- snapshot/cutoff timestamp.

### Comparisons

- compare completed periods with completed periods;
- compare on-the-books only against a comparable prior cutoff when doing pickup/pace analysis;
- never compare a partial month to a completed month without labeling the partial state;
- do not retroactively treat future bookings captured in a snapshot as realized revenue.

---

## 9. Currency semantics

- store original currency;
- do not assume USD because a source looks dollar-like;
- do not add CRC and USD;
- conversions require FX rate, date and source;
- presentation currency is a view, not replacement of the original amount.

---

## 10. Data-quality and reconciliation gates

A metric can be **trusted for decision use** only when relevant checks pass.

### Required checks

1. grain known;
2. duplicate detection passed;
3. denominator valid;
4. source authority known;
5. currency known or visibly unknown;
6. time basis known;
7. property/business scope known;
8. future/partial state known;
9. villa/room overlap checked;
10. unresolved assignments visible;
11. detail/subtotal/annual double-count protection passed;
12. source freshness within policy;
13. reconciliation tolerance defined;
14. material conflicts recorded in `integrations.data_conflicts`.

### Freshness gate

Current-state questions require current-state evidence.

- every live/current metric declares a maximum acceptable source age;
- when the source exceeds that threshold, TORO must not present it as `CURRENT` even if the snapshot is internally consistent;
- stale snapshots may still support historical/dated analysis when their cutoff is explicit;
- questions such as “today”, “now”, current availability, current occupancy, current balance, current in-house state or current pickup must fail closed when the relevant authority is stale or non-live;
- freshness is evaluated per metric/source; a fresh marketing signal does not refresh PMS or cash.

### Quality label

- **GREEN** — decision-ready for the declared scope.
- **YELLOW** — useful with named limitation.
- **RED** — do not use for decision or public claim.
- **GRAY** — missing/not yet assessed.

No color may imply audit certification.

---

## 11. Reference implementation evidence handling

Dreamcatcher is the proving ground, but its private evidence remains tenant-scoped.

### Public contract may contain
- metric definitions and formulas;
- source-authority rules;
- semantic states;
- generic data-quality gates;
- generic examples stripped of private values;
- reusable implementation boundaries.

### Private governed evidence contains
- source file IDs and hashes;
- internal revenue/cash/accounting values;
- room- or villa-level performance;
- exact discrepancies;
- canje quantities;
- unresolved reservation/unit assignments;
- reconciliation evidence and owner decisions.

Private evidence is stored/referenced through governed Supabase/Notion/authorized file sources with tenant scope, provenance and permissions. GitHub may reference the existence of the evidence contract but must not copy tenant-confidential payloads into a public repository.

### Required reference-implementation tests

Before a metric is considered decision-ready, the private Dreamcatcher evidence must prove:
- source identity and freshness;
- intended grain and no duplicate aggregation;
- unit/property mapping coverage;
- dynamic availability or an explicitly labeled proxy;
- separation of elapsed actuals from future/on-the-books values;
- reconciliation of conflicting operational sources;
- separation of PMS production, accounting and cash;
- villa/room/bundle double-count protection;
- unresolved assignments remain visible;
- no tenant-private data leaks into reusable/public product artifacts.

---
## 12. Portal experience

### Owner / executive

Default view should be compact and exception-oriented:

1. **Hotel health**
   - production vs comparable period;
   - verified occupancy;
   - ADR;
   - RevPAR;
   - state/freshness.

2. **Money**
   - accounting result where scope is verified;
   - cash status;
   - obligations due;
   - reconciliation exceptions.

3. **Commercial**
   - channel mix;
   - direct/engine trend;
   - pickup/pace;
   - cancellations;
   - rate anomalies.

4. **Units**
   - room/villa contribution;
   - outliers;
   - canjes/zero-revenue nights;
   - unavailable/blocked inventory.

5. **Attention**
   - top data conflicts;
   - unusual drops/spikes;
   - missing evidence;
   - recommended next action.

Progressive disclosure opens details; the owner home remains exception-oriented.

### Demand & Growth drivers

Performance Intelligence separates **outcomes** from **drivers**.

Outcome examples:
- accommodation production;
- occupancy;
- ADR;
- RevPAR;
- verified cash/accounting result where governed.

Driver examples:
- pickup/pace by need date;
- verified acquisition-source mix;
- booking-engine starts and completions;
- qualified website/search demand;
- Search Console query/page visibility;
- Google Business Profile / Hotel Center health signals;
- campaign/referral signals when instrumented.

Rules:
- demand signals explain outcomes; they are not revenue or cash;
- future need-date windows are `ON_THE_BOOKS` snapshots unless an explicit forecast model exists;
- capture channel and acquisition source are distinct;
- booking-engine labels do not prove all direct acquisition;
- public Google listing observations do not substitute authenticated console state;
- TORO Growth/Revenue connector workstreams remain the executors; Performance Intelligence consumes verified outputs instead of opening duplicate audits.

### Executive readiness gate

A metric shown as an owner headline must be decision-ready for its declared use.

- **GREEN** — source authority, grain, time/currency scope, freshness and material reconciliation pass.
- **YELLOW** — useful for a bounded decision with a visible limitation.
- **RED** — materially unsafe as a confident KPI; show it in Attention with the blocker, not as a headline number.
- **GRAY** — not measured, not live, or not yet assessed.

The quality label describes **metric readiness**, not financial-audit certification.

### WhatsApp

Examples:

- "¿Cómo vamos este mes?"
- "¿Por qué hay menos plata si vendimos más?"
- "Compárame agosto 2025 vs agosto 2026."
- "¿Qué habitaciones están produciendo mejor?"
- "¿Cuánto es real y cuánto está solo reservado?"
- "¿Qué número de ocupación sí puedo confiar?"

TORO answers with:
- metric value;
- state;
- cutoff;
- comparison;
- short explanation;
- source/quality note when material;
- next action when needed.

---

## 13. Alert rules

Examples:

- production > threshold but cash not reconciled;
- occupancy drops while ADR rises materially;
- channel concentration exceeds configured threshold;
- current month is being compared to a completed month without cutoff alignment;
- occupancy denominator changes unexpectedly;
- room production exists with unmapped unit;
- canje/zero-revenue nights materially affect ADR;
- accounting margin moves materially but property scope is incomplete;
- source is stale beyond policy;
- same metric differs materially across approved sources.

Alerts create attention/decision objects or reuse existing work items; they do not create duplicate task systems.

---

## 14. Implementation rule: reuse first

Initial implementation must reuse:

- `finance.kross_room_channel_monthly`;
- `finance.monthly_metrics`;
- `finance.period_evidence`;
- `integrations.kross_entity_mappings`;
- `integrations.data_conflicts`;
- `operations.tasks`;
- `operations.knowledge_items`;
- existing room/villa/product tables;
- existing Portal/WhatsApp context and permissions.

Do not create new tables until a demonstrated missing grain or performance requirement justifies one.

**Reuse does not mean readiness.** An existing projection table such as `finance.monthly_metrics` may be the correct target structure while still being unsuitable for executive display. It must pass completeness, source-scope, reconciliation and freshness gates before becoming metric authority.

---

## 15. Current / Target / Next / Future

### CURRENT

- historical Kross production is partially preserved;
- monthly finance metrics are partial;
- derived workbooks contain useful methodology and documented limitations;
- the standalone reference performance view has not yet passed source-parity and retirement gates;
- occupancy definitions conflict across historical reports;
- no unified production-grade metric contract is yet proven live.

### TARGET

One governed metric layer shared by Portal, WhatsApp and reports.

### NEXT

1. resolve the property/unit mapping on the preserved Kross history without duplicating history;
2. formalize the metric registry in governed knowledge;
3. reconcile occupancy denominator using daily availability authority;
4. reconcile production vs accounting vs cash by semantic lane;
5. connect owner performance view to shared definitions;
6. validate all calculations against original files and source systems;
7. keep the existing performance-dashboard task as the one execution item.

### FUTURE

- multi-business performance rollups;
- industry KPI packs;
- forecast scenarios;
- automated anomaly detection;
- benchmarking;
- portfolio capital allocation analysis.

Do not prioritize FUTURE ahead of identity, tenant isolation and connector readiness.

---

## 16. Definition of done

Dreamcatcher Performance Intelligence v1 is ready when:

- one metric definition is used by Portal, WhatsApp and reports;
- production/cash/accounting are never conflated;
- every displayed period has state and cutoff;
- occupancy/RevPAR denominator is source-backed;
- room / villa / auxiliary / historical scopes cannot double count;
- canjes are explicitly classified;
- monthly and room-level aggregates reconcile within documented tolerance;
- sources and freshness are visible;
- data conflicts are surfaced, not silently resolved;
- permissions and tenant scope are enforced;
- no duplicate project, ledger or task engine was created;
- the old standalone view can be retired only after parity, backup and rollback evidence.

---

## 17. Non-negotiable rule

**A dashboard is a view. The metric contract is the product.**

TORO should become increasingly sophisticated inside while the owner's outside experience becomes simpler.
