# TORO — OpenAI / ChatGPT Surface Map v1

**Status:** CURRENT TARGET INTEGRATION MAP  
**Date:** 2026-10-01  
**Authority:** subordinate to `docs/product/TORO_BRAIN_GENERAL_PLAN.md` and `docs/product/TORO_BRAIN_CONSTITUTION.md`.

## Decision

TORO uses OpenAI/ChatGPT capabilities as **surfaces, workers, runtimes and distribution channels** over the same TORO Brain and Control Plane.

None of these becomes a competing source of truth, backlog, memory authority, permission system or approval universe.

Canonical loop remains:

`Intent -> Policy -> Approval -> Execution -> Verification -> Receipt -> Memory`

Every material autonomous action must map to:
- one canonical TORO scope;
- one canonical project/task;
- one Control Plane run when execution occurs;
- one receipt/evidence chain;
- one source-of-authority rule;
- one Plan General subsystem.

Routine successful receipts do not rewrite the General Plan. A material architecture, objective, risk, dependency, policy or program-direction change does.

## 1. ChatGPT Project — human context hub

**Use:** one primary ChatGPT Project named **TORO** as the human-facing context hub.

It may contain:
- strategic chats;
- architecture discussions;
- relevant files;
- project instructions;
- Work threads started with TORO context.

It is useful for continuity and organization.

It is **not**:
- the canonical Plan General;
- runtime state;
- the task database;
- the receipt store;
- a replacement for Supabase/GitHub/Dropbox.

Canonical state remains outside the Project.

## 2. ChatGPT Work — substantial human-delegated work

Use Work for:
- long multi-step analysis;
- connected-app research;
- file-heavy reconciliation;
- producing finished reports/documents/sites;
- browser/computer workflows that require interaction;
- substantial one-off or bounded project execution.

Work should read TORO context through plugins/MCP and return outputs/evidence to canonical TORO surfaces.

Work is a **human-delegated executor**, not PUMBA and not the always-on control plane.

## 3. Dots — persistent mission workers

Current intended persistent organization:

### PUMBA / CONTROL
Purpose:
- watch Control Plane health;
- surface stale/failed/unverified runs;
- prioritize safe eligible work;
- reduce owner interruption;
- detect duplicate/conflicting automation;
- coordinate, not own truth.

Status:
- user reports a PUMBA Dot exists;
- TORO Control Plane bridge remains to be runtime-verified.

### Future Dot candidates — promote only with evidence

- FINANCE CONTROL
- OPERATIONS
- GUEST & REVENUE
- GROWTH
- BUILD / SYSTEMS

Do not create all five merely because the names exist. Promote a candidate to a permanent Dot only after recurring workload, low coupling, clear ownership and measurable value justify persistent continuity.

Every Dot must:
- use TORO task/run/receipt state;
- respect L0-L4;
- use canonical source authority;
- never maintain a hidden authoritative backlog;
- never silently promote chat content into policy/memory;
- never bypass owner attention for L3;
- never execute L4.

## 4. TORO specialist agents

Durable specialists remain:

- TORO — executive orchestration;
- TERE — guest sales / concierge / lifecycle;
- RICO — operations / readiness / service quality;
- FIONA — finance / admin / people-sensitive administration;
- SKY — growth / brand / demand / ancillary products;
- SOBRESITO — systems / data / integrations / security / reliability;
- CODEX — bounded implementation worker under TORO + SOBRESITO, not business authority.

Agent identity is distinct from Dot identity.

A Dot may call multiple specialists. A specialist may run through ChatGPT, Work, Agents SDK, Codex or another governed runtime without changing its canonical identity.

## 5. Ephemeral worker templates

These are execution capacities, not durable personalities:

- Collector
- Extractor
- Analyst
- Planner
- Executor
- Verifier
- Auditor
- Reconciler

Prefer ephemeral workers over creating more permanent agents.

## 6. Plugins

Plugins are the preferred ChatGPT/Codex packaging/discovery layer for reusable workflows and connected apps.

TORO should use:
- **TORO Plugin** as the product workflow package;
- underlying TORO app/MCP connection for data/actions;
- reusable TORO skills;
- app templates/settings where useful.

Plugin permissions do not create TORO permissions. TORO must still enforce scope, policy, approval and receipts server-side.

Custom GPTs must not become a new TORO dependency. OpenAI announced a planned migration away from custom GPTs toward plugins; TORO should invest in plugins/skills/MCP instead.

## 7. Apps / connected systems

Apps connect external systems and accounts.

Examples relevant to TORO:
- Gmail / Outlook
- Google Drive
- Dropbox
- GitHub
- Vercel
- Airtable
- Supabase
- Alegra
- Slack/Notion when used

App access is capability evidence, not ownership or business authority.

## 8. TORO MCP

MCP is the canonical interoperability boundary between OpenAI surfaces and TORO.

### Read tools
Expose permission-filtered:
- Brain status;
- priorities;
- project/task state;
- source/evidence;
- execution receipts;
- business status.

### Governed action tools
Add one workflow at a time after:
- policy;
- idempotency;
- approval;
- verification;
- receipt;
- rollback;
- isolation tests.

Dots, Work, ChatGPT and future plugins should prefer TORO MCP rather than learning direct vendor credentials.

## 9. OpenAI Agents SDK

Use the Agents SDK inside TORO's server runtime when TORO owns:
- deployment;
- tools;
- state;
- approvals;
- storage;
- execution policy.

The SDK supplies:
- agent loop;
- tool calls;
- handoffs;
- guardrails;
- MCP integration;
- tracing.

It does not replace Supabase run state or TORO receipts.

## 10. Tracing

Use OpenAI tracing to understand **how** an agent worked.

TORO receipt proves **what actually happened**.

Correlate both with:
- `trace_id`;
- `correlation_id`;
- `run_id`.

Trace is observability, not completion proof.

## 11. Scheduled Tasks / existing ChatGPT automations

Scheduled Tasks are **triggers and reports**, not autonomous authority.

### New rule

A recurring task that can mutate TORO/business state must not execute the mutation directly.

Target pattern:

`schedule/event -> canonical task/run -> worker claim -> execute -> verify -> receipt`

Read-only reporting and personal reminders may remain direct scheduled tasks when they cannot conflict with canonical execution.

### Legacy lane cleanup — 2026-10-01

Paused because they conflict with the Control Plane model:
- TORO Portfolio Coordinator;
- TORO CONTROL Lane;
- TORO OPERATE Lane;
- TORO GROW Lane;
- TORO BUILD Lane was already paused;
- TORO Progress Watch was already paused;
- TORO Finance Guard was already paused;
- PayFlow document-ingest executor was already paused;
- legacy financial ingestion/direct executor and direct PayFlow close executor were paused during this consolidation.

Retained schedules should be classified as:
- read-only report/monitor;
- specific safe domain workflow;
- personal reminder/watch;
- transition candidate awaiting Control Plane migration.

## 12. Codex

Codex is the preferred bounded technical implementation worker for:
- code;
- tests;
- migration drafts;
- PRs;
- repository analysis.

Codex does not decide business policy, approve itself or become a second BUILD backlog.

All meaningful code work maps to the General Plan and leaves GitHub/CI evidence.

## 13. Sites

Use ChatGPT Sites for human-friendly interactive projections such as:
- TORO Control Center;
- executive status;
- portfolio map;
- reports;
- project launch/control hubs.

Sites are presentation layers. They should consume canonical data and never own task/approval truth.

## 14. Recommended human workflow

Human front door:

`ChatGPT Project: TORO`

Inside it:
- Chat for quick decisions/conversation;
- Work for substantial delegated work;
- Dots for persistent mission continuity;
- plugins for tools/context;
- TORO MCP for governed Brain/actions;
- Sites for dashboards/projections.

Canonical backend remains:

`GitHub + Supabase + domain systems + evidence stores`

## 15. Promotion order

1. Finish generic TORO Worker Runtime.
2. Bind runtime to current Control Plane RPCs.
3. Add safe L0/L1 worker adapter.
4. Add OpenAI trace/correlation bridge.
5. Bind PUMBA to the runtime.
6. Migrate retained legacy scheduled executors into trigger-only Control Plane intake.
7. Add first governed MCP action tool.
8. Promote a second persistent Dot only if metrics justify it.
9. Add Control Center Site/projection after execution evidence is stable.

## 16. Non-negotiable invariant

Every interface must be able to disappear without losing TORO's canonical truth.

If ChatGPT, a Dot, Work, Codex, a Site or a plugin is unavailable, TORO's tasks, decisions, runs, receipts, evidence and source authority remain intact.
