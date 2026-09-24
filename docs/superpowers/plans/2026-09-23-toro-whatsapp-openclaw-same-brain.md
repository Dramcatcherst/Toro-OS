# TORO WhatsApp / OpenClaw Same-Brain Execution Plan

**Date:** 2026-09-23  
**Parent spec:** `docs/product/TORO_WHATSAPP_OPENCLAW_SAME_BRAIN_V1.md`  
**Rule:** extend the canonical TORO project. Do not create another brain, task database, project database, OpenClaw backend or duplicate connector.

## Outcome

Make WhatsApp a governed TORO client with two-way execution and follow-up while preserving one identity, one context model and one canonical state.

## Current verified baseline

- TORO context resolver exists in `main`.
- Authenticated `/my-toro` has role/source-aware reads.
- Canonical projects/tasks exist in Supabase.
- Message-to-task, project portfolio and Builder/Codex capabilities are already cataloged.
- OpenClaw is configured/unverified; direct live host access is still unavailable from this execution environment.
- The historical/local `toro-openclaw-integration` worktree must be reused when recovered. Do not recreate its transport modules in another repository.

## Workstream A — shared execution primitive

- [x] Add a bounded internal-work request contract.
- [x] Add task/project validation and idempotency.
- [x] Add canonical task routing for normal, maintenance, Builder/Codex and project follow-up work.
- [x] Add an authenticated server executor using existing TORO context + Supabase RLS.
- [x] Add `POST /api/brain/internal-work`.
- [x] Add contract tests and register them in the canonical test suite.
- [x] CI green: TORO Brain CI + Workstation Health.
- [x] Merge PR #142 to `main` (`fb222134d9746e33b28e5160a88c583d7f81f4c8`).
- [x] Vercel production-target deployment READY for the exact merge commit.
- [ ] Verify one real authenticated test task in a controlled organization context; archive/delete only if test policy permits.

## Workstream B — channel identity and service authentication

- [ ] Define one channel-runtime authentication method for OpenClaw.
- [ ] Add verified hashed channel identity binding -> TORO user/org.
- [ ] Add pairing/revocation UX in TORO Portal.
- [ ] Never authorize from display name alone.
- [ ] Unknown/unpaired senders fail closed or guest-safe.
- [ ] Add tests: owner, employee, unknown, revoked, wrong org, replay.

## Workstream C — OpenClaw adapter

**Must resume in the existing `toro-openclaw-integration` worktree when recovered.**

Do not reimplement capabilities that current OpenClaw already provides. Target runtime strategy:
- primary WhatsApp DM stays bound/routed to TORO;
- secure multi-user DM isolation is enabled;
- requester/sender tool restrictions are defense in depth;
- TORO delegates coding jobs to native OpenClaw Codex/background task machinery;
- optional ACP configured bindings are reserved for dedicated coding conversations;
- TORO-specific plugin code owns only the bridge from channel requester -> canonical TORO identity/context/action contracts.

- [ ] Load/report canonical Human Layer version/hash.
- [ ] Resolve channel sender through TORO identity binding.
- [ ] Call the same TORO read/action contracts used by other surfaces.
- [ ] Map free text + menu/number continuation to canonical capabilities.
- [ ] Preserve external message ID as idempotency key.
- [ ] Persist only transport/session state locally; durable business state stays in TORO.
- [ ] Implement reconnect/replay-safe retry.
- [ ] Add completion/blocker outbound notifications.

## Workstream D — maintenance parity

- [ ] Owner/manager can create maintenance work from WhatsApp.
- [ ] Link room/area/asset when resolvable.
- [ ] Promote from generic task to canonical `maintenance_event` linkage without duplicate work.
- [ ] Assign to authorized person/team.
- [ ] Accept photo/voice evidence.
- [ ] Close only with required evidence/permission.
- [ ] Notify requester when resolved.

## Workstream E — projects

- [ ] Read NOW/BLOCKED project summary.
- [ ] Open project detail.
- [ ] Create canonical follow-up linked to project.
- [ ] Ask for blocker/next action/owner.
- [ ] Update status only through the governed project workflow.
- [ ] “continuar proyecto X” restores safe project focus.

## Workstream F — Builder / Codex

- [ ] Enable/verify the OpenClaw native Codex runtime on the real Gateway.
- [ ] Verify background task delivery / completion path on the real Gateway.
- [ ] “Dale esto a Codex” creates one canonical Builder task, then delegates execution through OpenClaw.
- [ ] Link canonical TORO task <-> OpenClaw runtime task/session <-> branch/PR evidence.
- [ ] Keep primary TORO WhatsApp on TORO; use explicit temporary Codex bind only when the user asks to work directly in Codex.
- [ ] Use persistent ACP binding only for a deliberately dedicated coding chat/group.
- [ ] No raw shell exposure from WhatsApp.
- [ ] Builder reports started / blocked / PR / preview / tests / done.
- [ ] Production/deploy/secret/security actions remain approval-gated.
- [ ] Completion evidence returns to the same TORO task and WhatsApp thread.

## Workstream G — continuity and shared mind

- [ ] Same TORO Human Layer/personality version across surfaces.
- [ ] Same business truth/source authority.
- [ ] Same role/capability rules.
- [ ] Same project/task state.
- [ ] Canonical conversation continuation state.
- [ ] No hidden cross-user memory.
- [ ] Personal/work isolation preserved.

## Workstream H — runtime acceptance

Run the existing OpenClaw audit gates:
- channel probe/capabilities;
- DM/group isolation;
- bindings;
- tool permissions;
- security audit;
- logs/privacy;
- replay/idempotency;
- TORO identity/authority;
- human escalation;
- reconnect/recovery;
- backups.

Then run end-to-end scenarios:
1. create internal task;
2. duplicate retry -> no duplicate;
3. create maintenance task;
4. project status + project follow-up;
5. Builder/Codex queue;
6. unauthorized employee action denied;
7. unknown sender denied/guest-safe;
8. reconnect + continue;
9. completed task -> one notification.

## Promotion rule

Do not mark WhatsApp/OpenClaw “full TORO” until the real runtime executes the scenarios above with evidence. Code/spec/CI alone = implementation foundation, not live proof.
