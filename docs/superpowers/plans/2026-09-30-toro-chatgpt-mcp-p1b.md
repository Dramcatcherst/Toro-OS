# TORO ChatGPT / MCP — P1-B Transport + Authentication Plan

**Status:** READY IMPLEMENTATION PLAN — NOT DEPLOYED / NOT ACTIVATED  
**Date:** 2026-09-30, Costa Rica  
**Parent contract:** `docs/product/TORO_CHATGPT_MCP_CONTRACT_V1.md`  
**Canonical authority:** `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
**Depends on:** merged P1-A guarded read adapter in `src/features/mcp/`  
**Production activation authorized by this plan:** No

---

## 1. Result

Expose the already-merged TORO read adapter as an authenticated, read-only MCP server that ChatGPT can connect to without creating a second Brain, data store, permission model or execution ledger.

Target chain:

**ChatGPT App -> HTTPS Streamable MCP -> TORO MCP transport -> runToroMcpReadTool() -> resolveToroContext() -> canonical Brain / Owner Attention -> structured response**

P1-B ends before:
- write tools;
- public plugin/directory submission;
- production enablement without OAuth;
- custom ChatGPT widgets beyond tool responses.

---

## 2. Current verified implementation choice — 2026-09-30

For the existing Next.js App Router / Vercel repository, use the current Vercel MCP route pattern:

- `mcp-handler@2.1.1`
- `@modelcontextprotocol/server@2`
- `zod@4`
- route: `app/api/mcp/route.ts`
- streamable HTTP transport
- authenticated wrapper for protected/private data

These versions are a dated implementation choice, not permanent architecture. Re-check official Vercel/OpenAI documentation immediately before installation and update this plan if the supported stack changes.

Do not hand-edit `package-lock.json`. Dependency installation must run through the repository package manager in an execution environment that can run `npm install` / `npm ci`, then commit the resulting lockfile.

---

## 3. Feature gates

Add these server-only controls:

- `TORO_MCP_ENABLED=false` by default
- `TORO_MCP_AUTH_REQUIRED=true` by default
- canonical Brain gate remains independent: `TORO_BRAIN_CANONICAL_READ_ENABLED`

Required behavior:

| MCP | Brain canonical read | Auth | Result |
|---|---|---|---|
| off | any | any | endpoint disabled |
| on | off/unverified | valid | tools fail closed with capability_unavailable |
| on | on | missing/invalid | 401/authorization challenge |
| on | on | valid restricted user | only resolved permitted scope |
| on | on | valid owner | owner-authorized scope only |

No flag combination may expose synthetic demo fixtures as real business data.

---

## 4. Authentication target

Production target: OAuth 2.1-compatible protected MCP resource.

The transport must:
1. validate the bearer access token server-side;
2. map validated identity to TORO identity;
3. invoke the existing TORO context resolver;
4. enforce organization/role/data scope on every tool call;
5. fail closed if mapping, membership or source access is unresolved.

Add protected-resource metadata under the current standard well-known route when implementing OAuth.

Never send to ChatGPT:
- Supabase service-role keys;
- database passwords;
- connector tokens;
- OAuth client secrets;
- refresh tokens;
- Vercel tokens;
- raw session secrets.

A static bearer token may be used only for isolated local/preview MCP Inspector smoke testing if explicitly scoped to non-production. It must never become the production auth model.

---

## 5. Transport structure

Target files:

```
src/app/api/mcp/route.ts
src/features/mcp/server.ts
src/features/mcp/tool-schemas.ts
src/features/mcp/tool-results.ts
src/features/mcp/auth.ts
src/features/mcp/auth.test.ts
src/features/mcp/server.test.ts
src/app/.well-known/oauth-protected-resource/route.ts
```

Do not move business logic into these files. They adapt MCP requests to the merged P1-A seam.

Canonical dispatch:

```
MCP tool
  -> validate schema
  -> validated authenticated actor
  -> runToroMcpReadTool(toolName, input)
  -> structuredContent
  -> concise content summary
```

---

## 6. Exact P1-B tool registry

Expose exactly the six approved business tools:

1. `get_brain_status`
2. `search_toro`
3. `get_priorities`
4. `get_business_status`
5. `get_pending_decisions`
6. `get_execution_receipts`

Optional provider/account helper:
- `get_toro_profile` only if required by the active ChatGPT/MCP account-linking convention.

The profile helper is not a seventh business capability and cannot expand scope.

All six business tools:
- `readOnlyHint: true`
- `destructiveHint: false`
- no external side effect
- no hidden work creation
- no message send
- no approval/decision mutation

Tool descriptions must describe only behavior the adapter actually performs.

---

## 7. Input schemas

Use Zod schemas that match `src/lib/toro-mcp-contracts.ts`.

General rules:
- reject unknown/invalid structural values rather than coercing unsafe requests;
- server-side maximum result limits remain authoritative;
- caller-provided `scopeRef` is never authorization;
- cursor is opaque;
- search text is treated as untrusted input;
- tool schema cannot request secrets.

Keep schemas small so ChatGPT can select tools reliably.

---

## 8. Result format

MCP result should return:
- `structuredContent`: the TORO MCP response envelope;
- `content`: concise natural-language summary useful to ChatGPT;
- no duplicate hidden authoritative state in UI metadata.

Errors remain structured from the merged TORO MCP contract:
- unauthenticated
- context_choice_required
- forbidden
- invalid_request
- not_found
- stale_source
- conflicted_source
- capability_unavailable
- runtime_unconfigured
- degraded
- rate_limited
- internal_error

Provider transport errors must not erase or rewrite TORO business error semantics.

---

## 9. Honest-current-data rule

The MCP route inherits P1-A behavior:

- if the Brain returns synthetic-only state, MCP refuses it as business truth;
- if current canonical reads are disabled/unverified, return capability_unavailable;
- if Owner Attention is not allowed for the current role, do not leak owner data;
- if decisions are not exposed by a canonical projection/read seam, do not invent them;
- if receipt lineage is absent, do not infer completion from prose.

Before promoting P1-B, add direct canonical readers for decisions/receipts only if their source contracts are explicit and separately permission-tested.

---

## 10. CORS / methods / transport

Use the current supported MCP handler methods and streamable HTTP behavior.

Expected route surface:
- POST for MCP messages/tool calls;
- GET only as required by the selected handler/transport;
- OPTIONS/CORS only to the extent needed by supported ChatGPT/MCP clients.

Do not add permissive wildcard credential behavior.

Production hostname must be stable HTTPS.

---

## 11. Observability

Record safe server-side operational telemetry for each MCP call:

- correlation/request id;
- tool name;
- resolved actor reference;
- resolved scope reference;
- outcome class;
- latency;
- source systems consulted;
- partial/degraded flag;
- policy/auth denial code when applicable.

Do not log:
- bearer tokens;
- cookies;
- secrets;
- raw sensitive payloads not needed for diagnosis.

MCP invocation telemetry is not automatically a business execution receipt.

---

## 12. P1-B tests

### Route / feature gate
1. endpoint disabled when `TORO_MCP_ENABLED != true`;
2. production cannot run with auth disabled;
3. disabled endpoint exposes no tool list;
4. unsupported method fails safely.

### Authentication
5. missing token denied;
6. invalid/expired token denied;
7. valid token maps to one TORO identity;
8. revoked membership loses access;
9. wrong organization does not reveal existence;
10. context-choice state returns a bounded actionable error.

### Tools
11. tools/list exposes exactly six business tools;
12. every tool is read-only/non-destructive;
13. `search_toro` rejects blank query;
14. limit ceiling holds;
15. requested scope cannot bypass context;
16. real Brain data is permission filtered;
17. synthetic Brain state is rejected;
18. unavailable decisions/receipts fail honestly.

### Reliability / security
19. repeated read call has no material side effect;
20. prompt-injected source text cannot alter tool policy;
21. no secrets in tool response;
22. no secrets in application logs;
23. MCP Inspector can list/call tools against a preview test identity;
24. restricted test identity cannot read owner-only priorities;
25. reconnect preserves canonical TORO state rather than session-local shadow state.

### Repository
26. `npm ci` passes;
27. tests pass;
28. lint passes;
29. build passes;
30. Vercel preview passes before merge.

---

## 13. Preview gate

Before any production enablement:

1. deploy protected Vercel preview;
2. keep `TORO_MCP_ENABLED=true` only in that preview;
3. enable canonical Brain read only for the test environment/account already authorized for Stage C;
4. connect MCP Inspector;
5. run tools/list;
6. test the six tools;
7. test restricted identity denial;
8. test stale/unavailable source behavior;
9. verify logs redact auth material;
10. record preview URL, commit SHA, test actor class and results.

A successful preview is not production authorization.

---

## 14. ChatGPT connection gate

Only after preview + auth pass:

1. re-check current OpenAI Apps SDK / MCP developer documentation;
2. enable the relevant ChatGPT developer/app connection flow;
3. connect the protected preview/staging MCP endpoint;
4. authenticate with a dedicated TORO test identity;
5. verify tool discovery/annotations;
6. run read-only acceptance cases;
7. verify account switching/revocation behavior where supported;
8. only then evaluate custom UI components.

No write tool is introduced to make a demo look more complete.

---

## 15. Production promotion gate

Production MCP stays disabled until all are true:

- stable HTTPS endpoint;
- OAuth/protected-resource metadata verified;
- exact issuer/audience/token validation verified;
- restricted role test passed;
- cross-org denial passed;
- canonical Brain read passed;
- no synthetic truth leakage;
- six read tools pass;
- secrets/log redaction pass;
- replay/reconnect pass;
- rate/abuse controls set;
- monitoring and rollback defined;
- owner approves production connection.

Rollback:
- set `TORO_MCP_ENABLED=false`;
- disconnect ChatGPT app/connection;
- revoke client/token credentials;
- preserve canonical TORO data unchanged.

---

## 16. Package-manager execution constraint

Current GitHub connector execution can safely edit repository files but does not run the repository package manager and cannot generate a trustworthy npm lockfile.

Therefore:
- do not add the new npm dependencies from this connector alone;
- do not handcraft the lockfile;
- install them only in an execution environment that can run the package manager;
- commit `package.json` and `package-lock.json` together;
- require `npm ci`, tests, lint and build before merge.

This is an execution-environment constraint, not a product blocker.

---

## 17. P1-B done

P1-B is complete only when:
- dependencies are installed with a valid lockfile;
- read-only MCP route exists behind default-off feature flag;
- production auth cannot be bypassed;
- six tools route through P1-A;
- MCP Inspector acceptance passes;
- CI/Vercel preview pass;
- evidence is recorded;
- endpoint is still not promoted to production unless the production gate is separately approved.

