# TORO OS — Subsystem Alignment Audit

**Date:** 2026-09-22
**Status:** CURRENT ALIGNMENT AUDIT
**Canonical product:** TORO OS
**Reference implementation:** Dreamcatcher Hotel

## Executive finding

TORO does not primarily lack subsystems. It has too many partially overlapping implementations, historical names and parallel surfaces.

The program should focus on:
1. shared identity/context;
2. shared communication;
3. shared tools/permissions;
4. migration of legacy apps into canonical subsystems;
5. removal of shadow truth and duplicate UX.

## Verified Supabase domain footprint

Approximate table ownership based on current schema:

| Domain | Tables | Interpretation |
| --- | ---: | --- |
| TORO People | 48 | strong HR/payroll/scheduling model; UX still split into DreamTeam |
| TORO Data / Tools / Systems | 21 | strong integration/migration foundation; catalog/health UX incomplete |
| TORO Finance | 16 | substantial finance/reporting model |
| TORO Core / Projects / Guests | 16 | decisions, tasks, projects, guests, stays and knowledge |
| TORO Knowledge / Growth / Channels | 13 | content/governance/media/SEO foundation |
| TORO Guests / Growth | 9 | experience/catalog foundation |
| TORO Revenue | 8 | rate/agency domain exists |
| TORO Business / Assets | 8 | rooms/villas/products/amenities |
| TORO Assets | 7 | physical/inventory/purchasing foundation |
| TORO Operations | 7 | maintenance/inspections/utilities |
| TORO Identity | 5 | auth-adjacent canonical tables; membership abstraction missing |
| TORO Governance / Risk | 4 | risk/insurance/valuation |
| TORO Governance | 3 | approvals/audit/access |
| TORO Comms | 3 | team messages/read states/notifications; needs normalized channel layer |
| Shared/review | 13 | cross-cutting tables requiring explicit ownership |

## Shared/review ownership resolution

| Current object | Canonical owner |
| --- | --- |
| private.experience_fulfillment | TORO Guests / TORO Operations |
| private.fulfillment_partners | TORO Guests / TORO Growth |
| private.retreat_commercials | TORO Growth / TORO Revenue |
| private.tere_configuration | TORO Guests / TORO TERE |
| private.founder_profiles | TORO Core, organization-governed executive context |
| public.integration_logs | TORO Systems / TORO Data |
| public.sync_outbox | TORO Systems / TORO Data |
| public.login_attempts | TORO Identity / TORO Systems |
| public.labor_rule_versions | TORO People / TORO Governance |
| public.salary_history | TORO People restricted |
| public.properties | TORO Business |
| public.report_templates | Shared reporting capability |
| public.report_exports | Shared reporting capability |

No new subsystem is required for these objects.

## Canonical subsystem status

### TORO Core — YELLOW/GREEN
Exists and has strong constitution/architecture.
Phase 1 implementation remains in draft PR #15 and is not merged.
Gap: merge/reconcile the authenticated shell before building parallel runtime code.

### TORO Identity — YELLOW
Exists:
- auth users;
- app users;
- organizations;
- roles;
- user roles;
- sessions.

Gaps:
- explicit organization membership;
- employee/user reconciliation;
- shared context resolver;
- multi-organization proof.

### TORO Personal — RED/YELLOW
Architecture defined.
No production User Vault exists yet.
Draft branch exists; no personal ingestion is authorized.

### TORO People — YELLOW/GREEN
Very strong database/domain foundation inherited from DreamTeam.
Gap is integration, not data modeling:
- standalone DreamTeam UX;
- 8 active employees currently unlinked to user identity;
- employment-profile reconciliation;
- hosted RLS/security gate remains incomplete.

### TORO Comms — YELLOW
Existing team messages/read states/notifications.
WeSpeak confirmed active.
OpenClaw registered but direct runtime remains unverified.
Needs logical channels/bindings/message-to-action.

### TORO Guests — YELLOW/GREEN
Guests, reservations/stays, templates, TERE configuration and experience data exist.
Needs one shared guest/reception experience and channel continuity.

### TORO Operations — GREEN/YELLOW
Maintenance/inspection/utilities and task foundations exist.
Needs role UX, messaging bindings and evidence workflows.

### TORO Finance — YELLOW/GREEN
Finance schema/reporting foundation exists.
Alegra/external authorities remain separate.
Needs restricted UX and verified connector/reconciliation paths.

### TORO Revenue — YELLOW
Revenue schema exists.
Parallel Revenue Bridge workstream must converge on shared TORO Auth/shell.

### TORO Growth — YELLOW
Content/SEO/catalog/research foundations exist.
Needs workflow/approval/measurement integration, not another marketing app.

### TORO Projects — YELLOW/GREEN
Canonical projects/tasks already exist.
Needs portfolio UX and deduplication of historical project stores.

### TORO Knowledge — YELLOW
Canonical knowledge exists.
Residual DreamTeam Knowledge/Airtable content still requires semantic migration.

### TORO Tools — YELLOW
Dependency/source registries exist.
Needs normalized user-facing catalog, ownership, capabilities and health.

### TORO Agents — YELLOW
Agent tables/instructions exist historically.
Needs one canonical registry and context/tool ceilings.
Specialists must not become separate products.

### TORO Data — GREEN/YELLOW
Strong migration/source/provenance/conflict foundation.
Needs final Airtable operational-independence work.

### TORO Governance — GREEN/YELLOW
Approvals/audit/risk foundations are strong.
Needs User Vault privacy and shared action policy integration.

### TORO Assets — GREEN/YELLOW
Media/physical/inventory domains exist.
Needs one user-facing asset/evidence model and continued source cleanup.

### TORO Research — YELLOW
Large research/local-intelligence foundation exists in Airtable/content structures.
Needs canonical refresh/freshness workflow and selective persistence.

### TORO Channels — YELLOW/RED
Most fragmented implementation area.
Multiple Dreamcatcher website repositories/builds exist.
Need one canonical active site + reference/archive disposition for the rest.

### TORO Systems — YELLOW
Integration logs, dependency registry, deployment evidence and system concepts exist.
Needs unified connector health, backup/restore and incident dashboard.

### TORO Builder — GREEN/YELLOW
GitHub/Vercel/Codex workflows are mature relative to other subsystems.
Needs to consume the new subsystem/context rules and avoid generating parallel architectures.

### TORO Exchange — RED/YELLOW
RicoSky/dreamauro is an experiment.
Do not promote into core until marketplace economics, authority and transaction boundaries are decided.

## Missing capabilities that should NOT become new subsystems

### Recognition & Points
Owner: **TORO People**.
No current Supabase/GitHub implementation found.
Design before build.

### Employee learning/training
Owners: **TORO People + TORO Knowledge**.
Do not create a separate Learning OS.

### Reporting
Owner: shared TORO capability.
Use report templates/exports by domain; do not create a separate reporting database.

### Legal / compliance / insurance
Owner: **TORO Governance + TORO Finance/Risk** depending on object.
No separate legal operating system needed now.

### Physical map / property digital twin
Owners: **TORO Operations + TORO Assets**.
Use canonical physical spaces, rooms, areas, assets and evidence.
A future interactive map is a visualization, not a new source of truth.

### Automations
Owners: **TORO Core + TORO Tools + TORO Agents**.
Automation is a capability/workflow layer, not a standalone product.

### Onboarding/offboarding
Owners: **TORO Identity + TORO People + TORO Tools**.
One workflow must revoke organization access/tools while preserving personal TORO data.

### CRM
Owner: **TORO Guests** for hospitality; generic CRM connector support lives in TORO Tools.
Do not create another Dreamcatcher CRM database unless current guest model is proven insufficient.

## Legacy/project disposition summary

### Canonical
- Dramcatcherst/Toro-OS

### Migrate
- dream-team -> TORO People
- DreamTeam Knowledge OS -> TORO Knowledge

### Reference / mine useful evidence
- toro-os-v88-new
- Toro-OS---Dreamcatcher-Hotel
- historical Airtable TORO bases

### Active channel implementation
- dreamcatcher-website-vnext, subject to current production verification

### Website reference/parallel builds to reconcile
- dreamcatcher-hotel-santa-teresa-v100
- dc-king
- agoversion-v100 (snapshot/reference)
- SITE0926 (UNKNOWN until inspected)

### Experiment
- dreamauro/RicoSky -> possible TORO Exchange

### Separate product
- AI for Dreamers — powered by TORO

## Immediate consolidation order

1. TORO Identity context/membership.
2. Resolve Phase 1 PR #15 integration path.
3. TORO People identity reconciliation.
4. TORO Comms + OpenClaw runtime audit.
5. TORO Tools catalog/ownership.
6. Website/channel repository canonicalization.
7. Revenue Bridge convergence.
8. Airtable dependency retirement.
9. TORO Personal pilot.
10. Recognition & Points design after People identity is stable.

## Program rule

Before creating any new subsystem, answer:

1. Which existing TORO subsystem cannot own this capability?
2. Which canonical data object is missing?
3. Why is a workflow/feature insufficient?
4. What source of truth would the new subsystem own?
5. How does it avoid duplicating identity, permissions, messages, tasks, approvals, tools and memory?

If these questions do not produce a clear independent boundary, do not create a subsystem.
