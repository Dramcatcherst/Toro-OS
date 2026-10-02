# TORO — Actor & Surface Registry v1

**Status:** CURRENT classification contract  
**Date:** 2026-10-01  
**Owner:** TORO Governance + TORO Agents  
**Runtime authorities:** Supabase Control Plane + ChatGPT Scheduled Tasks + connected domain systems

## 1. Purpose

This registry prevents TORO from turning into a collection of independent bots.

It separates:
- persistent Dots;
- durable specialist agents;
- temporary workers;
- scheduled triggers/reports/watches;
- interfaces/surfaces;
- tools/connectors.

No entry in this registry becomes a source of business truth merely because it can execute or observe work.

## 2. Single execution rule

Material autonomous work follows:

`canonical task -> public.toro_execution_runs -> lease/fencing -> bounded worker/agent -> verification -> public.toro_execution_receipts`

No Dot, Scheduled Task, ChatGPT Work thread, Plugin/App, Codex session or UI surface may own a parallel authoritative backlog/run/completion state.

## 3. Persistent Dots

### PUMBA / CONTROL
**State:** FIRST DOT / candidate for runtime bridge  
**Mission:** persistent control and exception supervision.

Owns no business truth. Watches:
- Control Plane health;
- blocked/stale work;
- failed/dead-letter runs;
- missing verification/receipts;
- duplicate/concurrent work;
- owner attention;
- policy/runtime drift.

PUMBA may select/coordinate governed work only after the canonical worker/deployment gates pass.

### Candidate future Dots

Not active until workload and measured value justify a persistent agent:
- Finance Control;
- Operations;
- Guest & Revenue;
- Growth;
- Build / Systems.

Promotion requires:
1. recurring mission;
2. canonical task/project home;
3. bounded tools;
4. worker path;
5. receipt/trace;
6. measurable value;
7. demonstrated non-duplication with PUMBA/schedules.

## 4. Durable TORO specialists

| Specialist | Primary responsibility | Durable identity |
|---|---|---|
| TORO | portfolio orchestration, policy, cross-domain reasoning | yes |
| TERE | guest sales, concierge, guest-fit reasoning | yes |
| RICO | operations, maintenance, readiness | yes |
| FIONA | finance, reconciliation, administration/people support | yes |
| SKY | growth, demand, commercial productization | yes |
| SOBRESITO | systems, data, reliability, integrations | yes |
| CODEX | governed implementation/build work | implementation tool, not business authority |

Specialist identity is not a worker lease, schedule, model session or prompt.

## 5. Temporary worker classes

Workers are instantiated for bounded jobs and should not become permanent characters without need.

Canonical worker roles:
- Collector;
- Extractor;
- Analyst;
- Planner;
- Executor;
- Verifier;
- Auditor;
- Reconciler.

A worker must declare:
- accepted work/action class;
- tool/read/write scope;
- execution authority ceiling;
- timeout/cost budget;
- retry policy;
- verification method;
- receipt requirements;
- fallback/escalation.

## 6. Scheduled Tasks

Scheduled Tasks are **triggers, monitors, reports or temporary domain exceptions**. They are not autonomous execution authority.

Current classes:

### Read-only/reporting surfaces
- daily/weekly/monthly TORO and Dreamcatcher briefs/reports;
- PayFlow forecast/coverage/review reports;
- WeSpeak quality reviews.

Rules:
- may read/reconcile/analyze;
- may report gaps and decisions;
- may not create a parallel backlog;
- material follow-up maps to existing canonical project/task;
- future automated writes go through a Control Plane worker.

### Condition watches/reminders
Personal or bounded operational watches may remain outside the worker runtime when they do not mutate business truth.

### Transitional direct-write exception
The daily maintenance P0/P1 round may call its existing canonical maintenance-round function during migration.

This is the only documented active scheduled write exception in this registry. It may not expand scope and should migrate to:
`trigger -> task/run -> maintenance worker -> verification -> receipt`.

### Retired legacy patterns
The old coordinator + lane fan-out, direct finance writer/watch and post-cycle executor pattern is retired as execution architecture.

Historical task records/prompts remain provenance only and must not be reactivated as a parallel control system.

## 7. Interfaces and OpenAI surfaces

| Surface | TORO role | Authority |
|---|---|---|
| ChatGPT Project TORO | human context hub | none by itself |
| Chat | fast collaboration | none by itself |
| ChatGPT Work | substantial delegated work | only through connected governed tools |
| Dots | persistent mission workers | Control Plane-bound |
| Plugin/App | capability packaging and connections | tool permissions only |
| TORO MCP | governed interoperability/read bridge | currently read-only |
| Agents SDK | code-first worker/agent runtime | bounded by Control Plane |
| Codex | implementation worker | GitHub/build authority only |
| Scheduled Tasks | triggers/reports/watches | no material write authority by default |
| Sites/Portal | presentation | no source-of-truth authority |

Canonical companion:
`docs/product/TORO_OPENAI_SURFACE_MAP_V1.md`.

## 8. Runtime/state ownership

| Concern | Canonical owner |
|---|---|
| Product architecture / code | GitHub |
| TORO runtime state | Supabase |
| Business task home | `operations.tasks` |
| Execution attempt | `public.toro_execution_runs` |
| Execution proof | `public.toro_execution_receipts` + domain receipt |
| Owner attention | `operations.toro_owner_attention_v1` |
| Reservation/rate truth | Kross while current authority applies |
| Accounting truth | Alegra |
| Source documents/evidence | governed Dropbox/Drive source |
| Deployment evidence | canonical Vercel target |
| Schedule cadence | ChatGPT Scheduled Tasks |

## 9. Plan General write-back rule

Do write the Plan General when a run materially changes:
- product architecture;
- objective;
- policy;
- authority;
- dependency;
- risk;
- program direction;
- canonical source relationship.

Do **not** write the Plan General for:
- routine successful receipts;
- heartbeat checks;
- unchanged scheduled reports;
- repeated analysis with no delta;
- worker-level implementation detail already captured by run/receipt/evidence.

## 10. Promotion order

Default improvement order:

1. eliminate duplicate work;
2. simplify;
3. reuse existing agent/skill/workflow;
4. add a temporary worker;
5. automate through Control Plane;
6. measure;
7. only then promote to persistent Dot if recurrence/value justifies it.

## 11. Current activation sequence

1. canonical Vercel project sourced from `Dramcatcherst/Toro-OS`;
2. protected runtime-health verification;
3. internal L0/L1 Worker Runtime cycle;
4. verified receipt;
5. authenticated MCP read QA;
6. PUMBA Control Plane bridge;
7. maintenance scheduled-write migration;
8. observation period;
9. decide whether Finance Control deserves promotion as second Dot.

No later step implies permission for payments, reservations/rates, external messages, publication, legal filing, permission expansion or destructive actions.
