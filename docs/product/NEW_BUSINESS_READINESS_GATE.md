# TORO OS — New Business Readiness Gate

**Status:** ACTIVE GATE  
**Date:** 2026-09-22  
**Current decision:** **NOT READY FOR EXTERNAL BUSINESSES**

This gate determines when TORO OS may begin onboarding businesses outside Dreamcatcher.

No sales pressure, visual polish, demo quality or founder enthusiasm can override this gate.

## Readiness stages

### Stage 0 — Internal Proof
Dreamcatcher is the live proving ground.

**Current stage.**

### Stage 1 — Portable Sandbox
TORO can instantiate a second isolated organization using synthetic/non-customer data without Dreamcatcher assumptions.

### Stage 2 — Controlled External Pilot
One explicitly selected external business may be onboarded with founder supervision, restricted action permissions and rollback.

### Stage 3 — New Business Ready
TORO can accept additional businesses through a repeatable, governed onboarding process.

### Stage 4 — Scale Ready
Onboarding, operations, support, monitoring, billing and recovery can scale without founder-level intervention.

## Gate A — Product constitution and context integrity

PASS requires:
- one CURRENT constitution;
- one machine-readable context contract;
- one clear current-state source;
- superseded documents labeled;
- ChatGPT/Codex preflight rules enforced;
- zero unresolved P0 architecture contradictions.

## Gate B — Business truth and source authority

PASS requires:
- critical Dreamcatcher domains mapped to explicit authorities;
- provenance and freshness available for critical imported facts;
- unresolved P0 data conflicts = 0;
- historical/derived/unverified data cannot silently become operational truth;
- unique current truth is not stranded in an uncontrolled legacy store.

## Gate C — Connector fabric

PASS requires:
- every production-critical connector has owner, scope, health and failure behavior;
- critical reads are verified end-to-end;
- permitted writes are policy-gated and auditable;
- stale/outage behavior is visible;
- secrets are outside client code and logs;
- production runtime does not depend on undocumented manual credentials.

## Gate D — Execution engine

PASS requires:
- at least 12 representative end-to-end Dreamcatcher workflows execute from intent to verified result;
- workflows cover executive, guest/reception, operations, finance/admin and systems;
- each workflow has completion criteria, evidence and failure handling;
- retries do not create duplicate destructive effects;
- high-risk actions remain gated.

## Gate E — Agent/context quality

PASS requires:
- TORO routes work to the correct domain consistently;
- agents use authoritative sources rather than convenient copies;
- evaluation set covers common, ambiguous, conflicting-source and permission-denied cases;
- no critical hallucination/authority failure remains open;
- corrections feed a governed improvement process.

## Gate F — Security, tenant isolation and user privacy

PASS requires:
- organization isolation is proven with positive and negative tests;
- role boundaries are proven;
- RLS/server-side enforcement protects private data;
- one tenant cannot retrieve or mutate another tenant's data;
- one human keeps one canonical TORO identity across memberships without cross-tenant leakage;
- personal User Vault content is inaccessible to employers/organization admins by default;
- personal, work-private, work-organization, shared and system scopes are explicitly enforced;
- offboarding removes organization access without deleting the user's personal TORO data;
- audit identity is attributable;
- permission escalation paths are controlled.

## Gate G — Reliability and recovery

PASS requires:
- critical backups exist independently of the primary runtime;
- restore drills have succeeded;
- connector failures degrade safely;
- production-critical jobs are observable;
- rollback/recovery ownership is explicit;
- critical incidents have a runbook.

## Gate H — Continuous improvement loop

PASS requires:
- repeated failures create durable fixes, not just chat instructions;
- corrections can update governed knowledge;
- changes are tested before becoming production behavior;
- regression checks protect stable rules;
- value and failure metrics can be reviewed over time.

## Gate I — Portability

PASS requires:
- no hard-coded Dreamcatcher assumption in the universal core;
- a clean organization can be created without copying Dreamcatcher private data;
- company identity, people, permissions, systems, knowledge and workflows can be configured independently;
- user membership is distinct from role assignment;
- one user can belong to at least two isolated organizations in the sandbox without duplicate identity;
- a new employee/person can be onboarded without creating a subsystem-specific account;
- personal User Vault data survives organization offboarding and remains private;
- the second sandbox tenant completes core setup and workflows successfully;
- teardown/export is documented.

## Gate J — Experience readiness

This gate is intentionally late.

PASS requires:
- the underlying engine already passes A-I;
- WhatsApp and Portal call the same governed engine;
- surfaces do not contain separate shadow truth;
- normal users can complete common tasks without seeing backend complexity;
- important states are consistent across channels;
- accessibility, mobile use, latency and failure states are acceptable.

## Gate K — External pilot operations

PASS requires:
- onboarding checklist;
- data-processing/privacy boundaries;
- support/escalation process;
- incident ownership;
- customer-facing capability matrix;
- explicit list of what TORO cannot yet do;
- rollback/offboarding procedure;
- pilot success metrics.

## Decision rule

TORO may enter **Controlled External Pilot** only when Gates A-I pass and a founder explicitly approves the pilot.

TORO may be declared **New Business Ready** only when Gates A-K pass for two isolated organizations:
1. Dreamcatcher;
2. one sandbox or supervised pilot organization.

## Current blockers from the current plan

The current repository still documents:
- Dreamcatcher-specific product framing in key specs;
- active Airtable operational-dependency removal;
- unfinished real-user Phase 1 validation;
- incomplete end-to-end domain rollout;
- second-tenant portability not yet proven;
- user experience work occurring before the complete engine is proven.

Therefore the current readiness state remains:

> **INTERNAL PROOF — DO NOT ONBOARD EXTERNAL BUSINESSES YET.**

## Owner notification rule

The product owner must be told explicitly when:
- a gate changes from FAIL to PASS;
- Stage 1 becomes available;
- Controlled External Pilot becomes justified;
- New Business Ready becomes justified.

No readiness transition should happen silently.
