# TORO ChatGPT App / MCP Contract v1

**Status:** TARGET P0 CONTRACT — subordinate to the single TORO General Plan  
**Date:** 2026-09-30, Costa Rica  
**Owner:** TORO Tools + TORO Brain + TORO Governance  
**Implementation owners:** TORO Core + TORO Builder  
**Canonical authority:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**VERSION FINAL companion:** `docs/product/TORO_VERSION_FINAL_SUPERPROMPT_V1.md`  
**Runtime activation authorized by this document:** No

---

## 1. Purpose

Define the smallest safe, reusable boundary that lets ChatGPT act as a first-class TORO interface without turning ChatGPT into TORO's backend.

This contract converts the approved architecture:

**ChatGPT App / Apps SDK -> TORO MCP -> TORO Brain / Control Plane -> identity/scope/policy -> authoritative source/tool or delegated worker -> verification/readback -> receipt -> TORO response**

into a concrete read-first interface contract.

It does not authorize:
- a second Brain;
- a second database;
- a second permission engine;
- a shadow task or receipt store;
- production writes;
- a public plugin release;
- secrets in prompts, components or model-visible state;
- bypass of source authority, RLS, tenant isolation, approval or autonomy gates.

---

## 2. External implementation basis — verified 2026-09-30

Current official OpenAI documentation states that:
- ChatGPT apps can be built with the Apps SDK and MCP;
- MCP servers expose tools and may optionally expose UI resources;
- tool-first implementation is recommended before adding custom UI;
- private customer-specific data or write actions require authenticated access;
- authorization must be enforced by the MCP server on every request;
- OAuth 2.1 is the expected custom authentication pattern for authenticated MCP servers;
- tool annotations must match actual behavior, including read-only and destructive semantics;
- production MCP servers use stable HTTPS endpoints with streamable HTTP;
- provider plan/UI/write availability can change and must be reverified at implementation time.

Official references:
- https://help.openai.com/en/articles/12515353-build-with-the-apps-sdk.iso
- https://developers.openai.com/plugins/build/mcp-server
- https://developers.openai.com/plugins/build/auth
- https://developers.openai.com/plugins/concepts/mcp-server
- https://developers.openai.com/plugins/app-guidelines

These references inform the adapter. TORO governance remains authoritative for TORO behavior.

---

## 3. Non-negotiable invariants

1. One TORO Brain.
2. One canonical identity/context resolver.
3. One source-authority model.
4. One approval/autonomy model.
5. One canonical work state.
6. One evidence/receipt lineage.
7. ChatGPT receives only data already allowed for the resolved actor and scope.
8. Hidden data is not sent and then hidden in UI.
9. Tool descriptions cannot expand permissions.
10. A model request cannot turn a read-only tool into a write.
11. Stale, conflicted or unavailable sources never become current facts.
12. Tool retries must not duplicate material effects.
13. Secrets remain server-side.
14. Provider capability is checked at runtime; it is not assumed from this document.
15. Every material future action follows:

**Intent -> Policy -> Approval -> Execution -> Verification -> Receipt -> Memory**

---

## 4. Existing TORO contracts to reuse

The MCP adapter MUST reuse current contracts instead of replacing them.

### Identity and context
- `resolveToroContext()`
- personal vs organization isolation policy
- organization membership and role resolution
- current Supabase SSR/Auth foundation

### Brain projection
- `src/lib/brain-contracts.ts`
- `BrainProjection`
- `BrainProjectionContext`
- `BrainSourceSummary`
- verification/freshness/degraded semantics

### Action/governance
- `RiskLevel`
- `ApprovalRequirement`
- `ActionLevel`
- policy evaluation
- approval ledger
- source authority rules
- domain governance

### Evidence
- Brain/Event Spine event semantics
- audit logs
- integration logs
- canonical evidence references
- domain-specific verification/readback

MCP is an adapter over these contracts.

---

## 5. Authentication and scope contract

### 5.1 Authentication

Private TORO tools require authenticated requests.

Target provider pattern:
- OAuth 2.1 / OIDC-compatible authorization;
- MCP server validates access token;
- validated identity maps to one TORO actor;
- TORO resolves current permitted organization/business scope server-side.

No API key, Supabase service role, connector token or provider secret is sent to ChatGPT.

### 5.2 Context resolution

Every tool invocation runs:

**validated identity -> resolveToroContext() -> requested scope -> isolation policy -> role/capability -> source/data policy -> tool logic -> redaction -> response**

Possible context outcomes:
- resolved;
- unauthenticated;
- context_choice_required;
- forbidden;
- runtime_unconfigured.

No organization data is returned unless organization context resolves successfully.

### 5.3 Multi-account helper

If the ChatGPT/MCP client in use supports the current profile convention, TORO MAY expose one auxiliary authenticated read-only profile tool using the provider profile metadata convention.

This helper:
- identifies the currently connected TORO account;
- returns only safe display identity/account context;
- cannot grant or change access;
- is not one of the six business tools.

---

## 6. Common request envelope

Every TORO MCP business tool accepts only the minimum fields it needs.

Common optional fields where relevant:
- `scopeRef` — requested authorized business/workspace scope;
- `correlationId` — caller-provided trace identifier;
- `limit` — bounded result count;
- `cursor` — opaque pagination cursor.

Rules:
- `scopeRef` is a request, never proof of authorization;
- raw tenant/org IDs do not bypass context resolution;
- limits have server-side ceilings;
- cursors are opaque and scoped to the authenticated context;
- free-text input is untrusted data, not policy.

---

## 7. Common response envelope

Every tool returns a structured envelope with:

- `contractVersion`;
- `tool`;
- `generatedAt`;
- `correlationId`;
- resolved safe context summary;
- `partial`;
- source summaries;
- either `data` or one structured `error`.

Source summaries reuse Brain freshness/verification semantics.

A successful HTTP/MCP call with `partial=true` does not mean all requested business data is available.

---

## 8. Error semantics

Canonical MCP adapter error codes:

- `unauthenticated`
- `context_choice_required`
- `forbidden`
- `invalid_request`
- `not_found`
- `stale_source`
- `conflicted_source`
- `capability_unavailable`
- `runtime_unconfigured`
- `degraded`
- `rate_limited`
- `internal_error`

Error responses contain:
- safe user-facing message;
- retryable boolean;
- optional safe next action;
- no secret/config dump;
- no hidden stack trace;
- no cross-tenant existence leak.

---

## 9. Initial business tool surface

The v1 core contains exactly six read-first business tools.

### 9.1 `get_brain_status`

**Goal:** show the actor's current allowed TORO Brain projection/status.

Input:
- optional `scopeRef`;
- optional projection `mode`: focus/workspace/timeline/systems;
- optional `focusRef`.

Output:
- permission-filtered `BrainProjection` or compact equivalent;
- source/freshness summary;
- partial/degraded reason when applicable.

Rules:
- never returns synthetic data as real;
- demo fixtures require explicit demo mode outside private business claims;
- unavailable real projection returns degraded/unavailable semantics rather than invented values.

MCP annotation:
- read-only: true
- destructive: false

### 9.2 `search_toro`

**Goal:** find canonical authorized TORO objects across indexed scopes.

Input:
- required `query`;
- optional `scopeRef`;
- optional canonical kind filter;
- optional bounded `limit`;
- optional `cursor`.

Output hit:
- canonical object reference;
- safe label/type;
- scope reference;
- short summary;
- source authority;
- freshness/verification;
- allowed open/inspect capability summary.

Rules:
- searches only allowed scopes;
- no raw full-database dump;
- search ranking never grants access.

MCP annotation:
- read-only: true
- destructive: false

### 9.3 `get_priorities`

**Goal:** return prioritized work/attention for the resolved actor and scope.

Input:
- optional `scopeRef`;
- optional horizon: now / 7_30d / 30_90d / strategic;
- optional bounded `limit`.

Output item:
- canonical object/work ref;
- title;
- reason it matters;
- impact/urgency/effort/risk signals when supported;
- responsible owner;
- blocker/dependency;
- due date if authoritative;
- recommended next safe step;
- source/evidence refs;
- freshness/verification.

Rules:
- priority is a recommendation unless the owning workflow defines otherwise;
- no fake score precision from missing data.

MCP annotation:
- read-only: true
- destructive: false

### 9.4 `get_business_status`

**Goal:** produce a cross-domain status for one permitted business/scope.

Input:
- required or context-resolved `scopeRef`;
- optional sections from the eleven visible modules.

Output:
- scope identity;
- module/domain status;
- verified metrics only where an owner/source exists;
- exceptions/risks;
- source/freshness coverage;
- blocked/unknown sections.

Rules:
- absence is unknown/unavailable, not zero;
- Kross/Alegra/bank/etc. remain authoritative for their governed facts;
- conflicts are surfaced, not averaged away.

MCP annotation:
- read-only: true
- destructive: false

### 9.5 `get_pending_decisions`

**Goal:** return human decisions/approvals the actor is allowed to inspect or decide.

Input:
- optional `scopeRef`;
- optional state;
- optional bounded `limit`.

Output item:
- decision/approval ref;
- issue;
- why TORO cannot continue;
- recommendation and alternatives when supported;
- consequence/deadline when authoritative;
- required authority;
- evidence refs;
- current decision/approval state.

Rules:
- this v1 tool does not approve/reject;
- visibility of a decision does not imply authority to decide it.

MCP annotation:
- read-only: true
- destructive: false

### 9.6 `get_execution_receipts`

**Goal:** retrieve verified execution/result lineage for work already represented by canonical TORO evidence.

Input:
- optional `scopeRef`;
- one or more safe filters: `correlationId`, `actionRef`, `workflowRunRef`, time range;
- bounded `limit`.

Output item:
- canonical receipt/event ref;
- actor/workflow;
- action/result summary;
- timestamps;
- execution state;
- verification state;
- evidence refs;
- source/authority;
- rollback/cancellation relation when present.

Rules:
- if receipt lineage for a workflow is not yet canonical/verified, return capability unavailable/partial;
- do not synthesize a receipt from a narrative claim;
- successful provider response alone is not proof of completed business outcome when readback is required.

MCP annotation:
- read-only: true
- destructive: false

---

## 10. Tool annotations and side-effect policy

For v1:
- all six core business tools are read-only;
- `destructiveHint=false`;
- no hidden network/business side effect beyond the reads needed to answer;
- no message sending;
- no reservation/rate changes;
- no accounting writes;
- no payment;
- no file deletion/move;
- no permission changes.

Future write tools require separate names and contracts. A future write tool MUST:
- state its side effect in name/description;
- declare destructive semantics accurately;
- run current TORO policy evaluation;
- enforce approval/autonomy ceiling;
- use idempotency keys;
- verify readback;
- emit canonical receipt/evidence;
- expose rollback or exception behavior when applicable.

A read tool is never silently upgraded to perform a write.

---

## 11. ChatGPT UI contract

Custom UI is optional and comes after the tool contract works.

Initial useful components:
- Brain/status card;
- priority/attention list;
- decision card;
- receipt/result card;
- business status summary.

UI rules:
- every visual state maps to structured tool data;
- UI cannot imply unavailable capabilities;
- source freshness and partial/degraded state remain visible;
- write-looking controls are absent while the underlying capability is read-only;
- components do not hold authoritative state that is missing from TORO;
- reload/reconnect resolves from canonical TORO state.

Portal remains the richest TORO control surface. ChatGPT optimizes conversational search, analysis and command.

---

## 12. Security and prompt-injection boundary

Treat:
- email text;
- documents;
- webpages;
- guest/customer messages;
- search results;
- connector payloads

as untrusted content.

Untrusted content cannot:
- modify MCP tool policy;
- change actor identity or scope;
- reveal secrets;
- override source authority;
- authorize writes;
- disable audit/receipt behavior.

The MCP server, not the model, enforces authorization.

---

## 13. Privacy and data minimization

Return only what is required for the user's request.

Never return:
- raw access/refresh tokens;
- service-role credentials;
- passwords;
- private keys;
- unrestricted connector secrets;
- never-client redaction classes;
- hidden cross-tenant identifiers that reveal inaccessible objects.

Sensitive personal/work data follows the existing TORO redaction and scope contracts.

---

## 14. Observability

Every MCP invocation should produce safe server-side observability with:
- tool name;
- request/correlation ID;
- resolved actor reference;
- resolved scope reference;
- outcome class;
- latency;
- source systems consulted;
- partial/degraded flag;
- policy denial/error code where applicable.

Do not log raw secrets or unnecessary sensitive payloads.

Read observability is not itself a business execution receipt.

---

## 15. Acceptance tests before P1 runtime

### Identity/scope
1. unauthenticated request denied;
2. wrong organization denied without existence leak;
3. multi-org user receives context choice when required;
4. revoked membership loses access;
5. personal/work isolation holds;
6. role/data-scope filtering holds.

### Source truth
7. stale source labeled stale;
8. conflicting sources surfaced as conflict;
9. missing metric returns unknown/unavailable, not zero;
10. authoritative source metadata survives projection.

### Tool behavior
11. six core tool names are stable and unique;
12. all six are read-only;
13. no tool creates work or external side effects;
14. pagination cannot escape scope;
15. invalid kind/ref/limit fails safely.

### Security
16. injected instructions in source content cannot change policy;
17. secrets never appear in response or logs;
18. hidden data is not present in UI payload;
19. tool retry produces no duplicated effect.

### Reliability
20. runtime/source failure yields structured degraded state;
21. correlation IDs support tracing;
22. reconnect produces canonical current state;
23. receipt tool refuses narrative-only completion claims.

### Provider integration
24. MCP tool scan passes;
25. auth flow passes with a non-owner restricted test identity;
26. ChatGPT renders tool-only responses correctly before custom UI;
27. current provider capability/plan constraints are reverified at test time.

---

## 16. Delivery stages

### P0 — CONTRACT
This document + shared TypeScript contract constants/types + static tests.

No MCP endpoint.

### P1 — READ SERVER
- authenticated streamable HTTP MCP endpoint;
- optional safe profile helper;
- six core read tools;
- context/source/failure parity;
- no custom write tools.

### P2 — CHATGPT UI
Add only UI components justified by real tool data.

### P3 — GOVERNED ACTIONS
Introduce separate write tools one workflow at a time after:
- policy/approval contract;
- idempotency;
- verification/readback;
- receipt;
- rollback/exception;
- tenant-isolation tests.

### P4 — DISTRIBUTION
Only after internal:
- reliability;
- isolation;
- recovery;
- support;
- privacy;
- plugin/app review readiness;
- commercial readiness.

---

## 17. Definition of P0 done

P0 is done when:
- this contract is merged;
- machine-readable/shared tool metadata exists in code;
- tests prove exact six core names, uniqueness and read-only semantics;
- General Plan links to this subordinate contract;
- no production MCP endpoint or new authority has been created;
- CI remains green.

Anything beyond that is P1+.
