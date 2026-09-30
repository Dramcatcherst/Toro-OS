# TORO Dashboard v1

**Status:** DESIGN APPROVED · GENERAL PLAN INTEGRATED
**Canonical contract:** `operations.knowledge_items/toro_dashboard_surface_v1`

## Product rule

TORO Dashboard / Portal is the unified visual surface of the single TORO Brain.

It is not:
- another brain;
- another database;
- another task system;
- another approval system;
- another notification center;
- another source of truth.

Modules are role-aware views and actions over canonical capabilities and sources.

## Navigation

1. Brain
2. Today / Attention
3. Money
4. Studio
5. Customers
6. Operations
7. People
8. Growth
9. Legal & Risk
10. Assets & Spaces
11. Projects
12. Systems

TARGET default internal home: **Brain**, filtered by identity, context and capability, with a role-specific initial focus and equivalent list. **Today / Attention** remains one-tap operational focus. The eleven domain modules remain eleven; Brain is their shared entry/view, not a twelfth subsystem or authority. This 2026-09-30 owner direction supersedes the earlier Today-first landing rule; it is not a claim that the current route has changed.
Technical cockpit: **Systems/Admin only**.

## Progressive disclosure

`summary -> module -> object -> source/evidence -> action`

Default UI hides technical complexity. Evidence, provenance, uncertainty and system health remain available on drill-down.

## Common contracts

All modules reuse:
- identity and organization membership;
- role/capability grants;
- tasks;
- approvals;
- evidence/provenance;
- notifications;
- knowledge graph;
- audit trail;
- action ceilings;
- source freshness.

## Studio

Widgets:
- active campaigns;
- creative requests;
- draft/review/approved state;
- public-safe vs blocked assets;
- consent/rights blockers;
- approval queue;
- publishing schedule;
- performance;
- asset/template reuse;
- owner intervention time.

Current pilot:
`Costa Rica También Se Vacaciona / STUDIO-PILOT-01`

## Money / PayFlow

Widgets:
- P0 payments;
- this week;
- rolling 90-day forecast;
- cash reserve by currency;
- missing invoice/receipt;
- reconciliation state;
- price drift;
- savings opportunities;
- Alegra/bank/provider freshness.

Google Calendar is a time projection. PayFlow dashboard reads canonical Brain state.

## Mobile / WhatsApp / Desktop

- Mobile: concise cards, task actions, approvals, exceptions.
- WhatsApp: conversational entry and quick commands.
- Desktop: tables, media, timelines, analytics and evidence.

All surfaces use the same Brain, roles and action ceilings.

## Role examples

- Owner: all authorized modules.
- Finance: Today + Money + finance/legal risk.
- Reception: Today + Customers + Operations.
- Maintenance: Today + Operations + Assets & Spaces.
- Growth: Today + Growth + Studio + Customers.
- HR/People: Today + People + workforce operations.
- Systems/Admin: Today + Systems + authorized project health.

## Dashboard widget contract

Every widget must declare:
- widget_key
- module
- purpose
- source_authority
- scope
- role_visibility
- freshness
- primary_metric
- attention_state
- next_action
- deep_link

Status vocabulary:
`OK | ATTENTION | BLOCKED | NEEDS_VERIFICATION | STALE | DONE`

## Architecture

- Supabase/TORO Brain: canonical state.
- Kross: live reservations/rates/availability.
- Alegra: accounting.
- Banks: cash movement.
- TRIBU/official authorities: fiscal/legal truth.
- Calendar: temporal projection.
- WhatsApp: conversational interface.
- Dashboard: visual interface.

## Current implementation state

Design and module contracts are integrated.

Implementation task:
`DASHBOARD-UNIFIED-01`

Airtable task:
`recPKAwq4ZnuMvZqH`

Notion:
https://app.notion.com/p/3e6f5169a39a810f810adefdcd4851e7?pvs=204

## Next build

1. Audit current portal/routes/components.
2. Map existing screens to Dashboard v1 sections.
3. Define role-aware Home.
4. Implement MVP Today + Money + Studio.
5. Reuse existing auth/tasks/approvals/evidence.
6. Add freshness/uncertainty on every material widget.
7. Verify mobile/desktop parity by capability.
8. Avoid DDL unless a proven missing contract requires it.
