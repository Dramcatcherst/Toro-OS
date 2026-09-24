# TORO WhatsApp / OpenClaw Same-Brain V1

**Date:** 2026-09-23  
**Status:** CURRENT SUBORDINATE PRODUCT SPEC / IMPLEMENTATION IN PROGRESS  
**Parent:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Product name:** **TORO**. “TORO Brain” remains an acceptable internal architecture label; it is not a second product or runtime.

## 1. Decision

WhatsApp/OpenClaw is a **surface of TORO**, never a separate assistant, memory, persona, task store, project store or source of truth.

A message from WhatsApp must enter the same governed path used by Portal and other TORO surfaces:

```
message
  -> channel identity
  -> TORO identity + organization context
  -> shared personality / Human Layer
  -> intent + capability
  -> permissions + autonomy + risk
  -> canonical read/write/action
  -> evidence/receipt
  -> response
  -> follow-up notification
```

Channel-specific transport state may exist, but durable business state belongs to TORO canonical sources.

## 2. User outcome

An authorized user should be able to use WhatsApp as the simplest TORO client and, within their permission ceiling, do the same useful work they can initiate from the authenticated TORO experience:

- ask questions and search governed company knowledge;
- see “today”, priorities, decisions and exceptions;
- create internal tasks;
- create maintenance work;
- assign/follow up/close work with evidence when the workflow is enabled;
- read project status, blockers and next actions;
- create a project follow-up linked to the canonical project;
- queue work for TORO Builder / Codex;
- receive Builder/Codex progress, preview, failure and completion evidence;
- approve bounded actions when policy requires approval;
- send photos, voice notes and documents as workflow inputs where supported;
- continue the same conversation after reconnect/restart without creating another memory universe;
- receive proactive notifications only when useful and authorized.

The system must also understand normal free text. Menus, numbers and buttons are shortcuts, not the only interface.

## 3. One TORO identity and mind

The following are shared across Portal, ChatGPT-assisted workflows, Codex/Builder and WhatsApp/OpenClaw:

- canonical organization/user identity;
- role and position;
- personal-vs-work isolation policy;
- TORO personality / Human Layer version;
- source-authority rules;
- agent routing;
- capabilities and action ceilings;
- canonical tasks/projects/decisions;
- approved knowledge and learning signals;
- audit/evidence model.

OpenClaw may cache only bounded transport/session state. It may not maintain a competing durable “memory” that can contradict TORO.

## 4. Runtime topology

Use separate trust boundaries where privileges differ:

### Owner / personal
High-trust owner runtime. May expose stronger Builder/Codex and personal capabilities when explicitly enabled.

### Company / internal team
Role-scoped work runtime. No founder host privileges. User identity and organization permissions are resolved per sender.

### Guest
Guest-safe TERE runtime. No internal HR/finance/projects/Builder access.

All three resolve back to the same TORO governance and source-authority system.

## 5. Canonical objects

Do not create channel-specific copies.

| Need | Canonical object |
| --- | --- |
| General internal work | `operations.tasks` |
| Project | `operations.projects` |
| Maintenance incident/history | `facilities.maintenance_events` |
| Executive decision | `operations.executive_decisions` |
| Approval | canonical approval request |
| Team communication | `team_messages` / governed Comms state |
| Notifications | `notifications` |
| Action evidence | action receipt / audit evidence |
| Builder/Codex work | canonical task linked to TORO Builder/project, then execution evidence |
| Conversation state | canonical channel/session state; never a second business database |

## 6. Action model

### Read / explain / recommend
Allowed when identity, scope, source freshness and capability permit.

### Prepare
TORO may prepare task/action/configuration payloads without external impact.

### Internal low-risk writes
Examples: create an internal task, maintenance work item or project follow-up.

These require:
- authenticated/resolved identity;
- correct organization;
- role/capability permission;
- idempotency key;
- explicit user action or an earned bounded-autonomy workflow;
- canonical object + source metadata;
- observable result.

### Builder / Codex
WhatsApp must not expose raw host shell or unrestricted Codex execution.

Flow:

```
WhatsApp instruction
 -> TORO Builder task
 -> policy/approval when required
 -> trusted Builder worker / Codex session
 -> branch/PR/preview
 -> tests/verification
 -> evidence + status
 -> WhatsApp update
```

### High-risk
Money movement, reservation mutation, payroll approval/payment, legal commitments, permissions/secrets, destructive actions and material production changes remain gated.

## 7. Channel identity

Do not trust display names or phone text as authorization.

Required channel pairing model:
- OpenClaw authenticates as a known TORO channel runtime;
- sender/account identity is normalized;
- sender is matched only to an explicitly verified TORO identity binding;
- the binding resolves user + organization scope;
- every action re-evaluates current roles/permissions;
- unknown/unpaired senders fail closed or remain guest-safe.

No reusable founder credential is stored in WhatsApp/OpenClaw.

## 8. Conversation continuity

State should preserve:
- logical TORO session;
- active organization;
- current menu/workflow;
- active project/task focus;
- pending approval;
- last useful continuation;
- Human Layer config version/hash;
- replay/idempotency markers.

“continuar”, “1”, “dale”, voice and normal sentences may continue the current workflow only when session/identity/context remain safe.

## 9. Initial controlled-write slice

Implemented in branch `toro-whatsapp-same-brain-intake-20260923`:

`POST /api/brain/internal-work`

Initial actions:
- `task.create`
- `maintenance.task`
- `builder.task`
- `project.followup`

Properties:
- authenticated TORO organization context;
- first slice limited to ADMIN/GERENCIA, matching current `operations.tasks` RLS;
- canonical write to `operations.tasks`;
- project link resolved from canonical `operations.projects`;
- unique `task_key` derived from caller idempotency key;
- replay returns the existing task;
- maintenance routes to RICO / TORO Operations;
- Builder routes to SOBRESITO/CODEX / TORO Builder;
- no reservation, money, secret, permission, deploy or external-channel write.

This slice is a shared execution primitive. It is **not yet proof that the live OpenClaw host consumes it**.

## 10. Required next runtime slice

1. Implement channel-runtime authentication.
2. Implement verified channel identity bindings.
3. Reuse canonical context/permission logic for channel actors.
4. Make OpenClaw call the same action/intake contract.
5. Persist bounded cross-restart conversation state in TORO.
6. Add action receipts and outbound completion notifications.
7. Connect Builder queue to a trusted Codex worker with approval and verification gates.
8. Run OpenClaw runtime/security/replay QA.
9. Promote capabilities only after real end-to-end evidence.

## 11. Definition of done

WhatsApp parity is not “done” because messages can be sent.

It is done when a verified owner can, from WhatsApp:

1. ask for current project status and receive canonical current data;
2. say “créame una tarea…” and exactly one canonical task is created;
3. report maintenance and get a canonical work item with later closure evidence;
4. say “dale esto a Codex” and get a governed Builder task, execution status, PR/preview/test evidence and final result;
5. say “continúa” after reconnect and resume the correct safe workflow;
6. receive completion/blocker notifications without duplicate side effects;
7. see the same task/project state immediately in Portal;
8. prove no cross-user or personal/work leakage;
9. pass OpenClaw security, replay, identity and recovery gates.

Until those pass, status remains **PARTIAL / CHANNEL RUNTIME UNVERIFIED**.
