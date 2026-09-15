# TORO OS Airtable Operational Independence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to execute domain work task-by-task. This plan is not a row-copy plan; it removes runtime/daily-use dependency while preserving unique truth and recoverability.

**Goal:** Reach zero critical operational dependency on Airtable while preserving unique business truth, auditability and recoverability, with Airtable reduced to governed backup/reference use.

**Architecture:** Work base-by-base and domain-by-domain using the canonical Supabase registry and dependency ledger. Migrate only unique/current TORO-owned truth, adapt to existing Supabase models first, archive/regenerate derived or external-authority data, and require independent backup/restore evidence before any destructive retirement.

**Tech Stack:** Airtable source estate, Supabase canonical schemas (`core`, `content`, `operations`, `integrations`, `assets`, `facilities`, `risk`, `finance`), TORO OS role-based UI, independent archive artifacts and restore drills.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Global Constraints

- Target is `0` critical Airtable-only workflows and `0` production/runtime dependencies on Airtable, not zero Airtable bases.
- Preferred residual estate is one `DREAMCATCHER VAULT — BACKUP` base; a small number may remain only with documented restore/ownership/permission justification.
- Do not physically delete Airtable bases automatically.
- Do not treat fingerprints as backup checksums.
- Do not mark backup valid until an independent artifact has been restored and verified.
- Do not migrate reloadable Kross/Alegra/OTA history merely to eliminate Airtable.
- Existing Supabase models are preferred over new tables.
- `unique_data_remaining=0` is necessary but not sufficient for operational retirement; consumer, automation, interface and backup gates still apply.
- Legacy delete-readiness scores remain optional-retirement metrics, not TORO OS completion metrics.

---

## Estate Baseline

| Base | Tables | Unique data remaining | Priority |
| --- | ---: | ---: | --- |
| TORO OS — Command Center | 2 | 0 | Quick win after Phase 1 parity |
| DreamTeam Knowledge OS | 7 | 1 | Quick win after one content migration |
| TORO OS — Master Brain | 28 | 21 | High: historical runtime fallback risk |
| Dreamcatcher Hotel — Inventario & Activos | 25 | 25 | High: map to existing asset/facility/risk models |
| TORO OS — Sistema Operativo Central | 118 | 97 | Largest: process by domain only |
| DREAMCATCHER WEB + CHANNELS | 49 | 0 | Original decommission scope; manual automation/backup gates remain |
| Proveedores de Tours · Santa Teresa | 1 | 0 | Original decommission scope; manual consumer/automation/backup gates remain |
| DREAMCATCHER HOTEL | 154 | 0 | Original scope; Revenue/AGENCIAS and human gates remain |

---

### Task 1: Command Center -> backup/reference

**Files/data:**
- Airtable base `appjjYrKezbfyp2vP`.
- Supabase historical archive already containing 18/18 Command Center rows.
- TORO Phase 1 Executive Home/Decisions replacement.

**Interfaces:**
- Produces the first residual base classified `SAFE TO RETIRE OPERATIONALLY` while physical deletion remains separately gated.

- [ ] **Step 1: Require Phase 1 real-user parity**

Expected: Mauricio can perform the decision flow in TORO without the legacy `TORO — Responde y Avanza` interface.

- [ ] **Step 2: Verify 18/18 historical rows remain preserved in Supabase with provenance**
- [ ] **Step 3: Audit Airtable Automations through authorized UI/API**

Record explicit zero only if the UI/API proves zero.

- [ ] **Step 4: Audit external consumers and direct human use**
- [ ] **Step 5: Produce independent archive artifact and restore evidence if physical retirement is desired**
- [ ] **Step 6: Classify the base as backup/reference or optional-retirement candidate**

Do not reactivate historical programs/decisions as current tasks.

---

### Task 2: DreamTeam Knowledge OS quick win

**Files/data:**
- Airtable base `appuvHYxW1R8CIbGb`.
- Remaining unique table: `Waste & Recycling`, currently 5 source rows.
- Canonical destination: governed knowledge/SOP/sustainability content.

**Interfaces:**
- Produces `unique_data_remaining=0` for DreamTeam Knowledge OS after verified semantic preservation.

- [ ] **Step 1: Read all 5 Waste & Recycling records and classify each as current guidance, historical guidance or duplicate**
- [ ] **Step 2: Write semantic parity tests/checks against existing Supabase sustainability/knowledge content**
- [ ] **Step 3: Preserve only missing unique guidance with source record provenance**
- [ ] **Step 4: Re-run parity and require zero unresolved unique current truth**
- [ ] **Step 5: Audit automations/consumers/direct-use separately**
- [ ] **Step 6: Archive/reference or retire operational use after parity**

---

### Task 3: Master Brain runtime and domain cutover

**Files/data:**
- Airtable base `appFdcxw7KqReHJI6`.
- 28 registered tables, 21 with unique/pending content.
- Known high-risk domains include guest communications, governance/tasks, assets/media registry and external mappings.

**Interfaces:**
- Produces zero runtime fallback to Master Brain and zero unique current truth left only in the base.

- [ ] **Step 1: Search code/runtime configuration for `AIRTABLE_BASE_ID` and any fallback to `appFdcxw7KqReHJI6`**
- [ ] **Step 2: Remove/replace runtime fallback only after the canonical Supabase path is verified**
- [ ] **Step 3: Process `13 Guest Communication` semantically against `operations.guest_message_templates`, `private.tere_configuration`, hotel facts and governed knowledge**
- [ ] **Step 4: Process `External Mappings` by separating non-secret Kross entity mappings from secret/tokenized feed data; secrets belong in an approved secret store/Vault, not a public mapping table**
- [ ] **Step 5: Map governance/tasks/rules to existing `operations.tasks`, `integrations.data_conflicts`, `content.governance_rules` and knowledge structures before creating any new schema**
- [ ] **Step 6: Treat `08 Assets Registry` as media/archive evidence; do not blindly copy 2,676 rows into a second canonical media catalog**
- [ ] **Step 7: Recalculate `unique_data_remaining` by table after each domain pass**
- [ ] **Step 8: Audit interfaces/forms/automations/consumers, then classify backup/reference readiness**

---

### Task 4: Inventory & Assets -> existing Supabase domain models

**Files/data:**
- Airtable base `app4Z5H1xhFWGfM7M`.
- Existing Supabase schemas include `assets.*`, `facilities.*`, `risk.*` and governed knowledge.

**Interfaces:**
- Produces a record-level parity map for all 25 source tables without automatically creating 25 destination tables.

- [ ] **Step 1: Count live rows for each of the 25 tables; do not treat unknown row counts as empty**
- [ ] **Step 2: Map physical inventory/stock to `assets.*` only where the source is current operational truth**
- [ ] **Step 3: Map maintenance/inspection/utilities to `facilities.*`**
- [ ] **Step 4: Map insurance/valuation/due-diligence facts to `risk.*` with appropriate privacy and evidence**
- [ ] **Step 5: Map laundry planning/loads only if needed by the RICO workflow; archive purely derived demand reports that can be regenerated**
- [ ] **Step 6: Preserve supplier/contact data only in an approved private supplier model; do not expose it through guest-facing surfaces**
- [ ] **Step 7: Recalculate remaining unique truth and close each table by evidence**

---

### Task 5: Sistema Operativo Central domain reduction

**Files/data:**
- Airtable base `apptlzWcI6DdpLO0B`.
- 118 registered tables, 97 currently unique/pending.

**Interfaces:**
- Produces a reduced residual archive by domain rather than a 118-table row-copy migration.

Process domains in this order:

1. `tere_guest_comms`
2. `executive_governance`
3. `toro_governance_agents`
4. `people_hr`
5. `hotel_operations_risk`
6. `website_content` + `media_governance`
7. `market_destination_intelligence`
8. `finance_analytics`
9. `personal_event_legacy` and other historical domains

For every domain:

- [ ] **Step 1: Identify authoritative source**
- [ ] **Step 2: Classify each table as `MIGRATE_CURRENT`, `EXTERNAL_AUTHORITY`, `REGENERABLE`, `HISTORICAL_ARCHIVE` or `DROP_CANDIDATE_AFTER_BACKUP`**
- [ ] **Step 3: For `MIGRATE_CURRENT`, compare against existing Supabase canonical records and preserve only missing current truth**
- [ ] **Step 4: For `EXTERNAL_AUTHORITY`, preserve mappings/import contracts, not duplicate ledgers**
- [ ] **Step 5: For `REGENERABLE`, document regeneration source and do not force canonical persistence**
- [ ] **Step 6: For `HISTORICAL_ARCHIVE`, preserve as archive/reference without making it operational**
- [ ] **Step 7: Recompute unique remaining and dependency status before moving to the next domain**

Specific finance rule:

- Alegra transactions, bank statements/transactions, Kross payments/channel metrics and derived monthly metrics must not be copied merely because they exist in Airtable. Use governed import/read models only when the FIONA product needs them.

---

### Task 6: Original Main / WEB / Provider retirement gates

**Files/data:**
- Main `appuk6zInco941sgc`
- WEB `appltN1brkbhD4FVb`
- Provider `appYRL3P7ugPtQN1h`

**Interfaces:**
- Keeps historical delete-readiness separate from product completion.

- [ ] **Step 1: Do not repeat stable data audits without a change trigger**
- [ ] **Step 2: Complete authorized Airtable Automations inventory for each base**
- [ ] **Step 3: Complete direct staff-use/external-consumer attestation where still required**
- [ ] **Step 4: Complete real independent snapshot + checksum + restore drill for any base considered for physical retirement**
- [ ] **Step 5: Complete Revenue Bridge before clearing Main/AGENCIAS dependency**
- [ ] **Step 6: Obtain human destructive approval only after technical readiness**

Physical deletion is optional. A base may remain as backup/reference if operational dependencies are zero and the residual role is documented.

---

### Task 7: Consolidate residual Airtable backup/reference estate

**Interfaces:**
- Produces the documented end-state estate.

- [ ] **Step 1: Identify archival data that benefits from one consolidated `DREAMCATCHER VAULT — BACKUP` base**
- [ ] **Step 2: Do not consolidate if doing so harms restore clarity, permissions or ownership**
- [ ] **Step 3: Document each residual base with owner, purpose, write policy, restore method and retention rationale**
- [ ] **Step 4: Confirm no application runtime points at backup/reference bases**
- [ ] **Step 5: Confirm routine users have no operational reason to open Airtable**

## Definition of Done

- Daily users requiring Airtable: 0.
- Critical Airtable-only workflows: 0.
- Runtime Airtable dependencies: 0.
- Unique current business truth left only in Airtable: 0.
- Every critical retained dataset has independent recoverability evidence appropriate to its risk.
- Airtable is documented as backup/reference only.
- Physical deletion, if any, is separately human-approved and evidence-backed.