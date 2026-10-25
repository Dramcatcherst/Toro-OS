# TORO — Canonical Vercel Deployment Contract v1

**Status:** CURRENT deployment target contract  
**Updated:** 2026-10-24, Costa Rica
**Owner:** TORO Systems / SOBRESITO  
**Canonical repository:** `Dramcatcherst/Toro-OS`

## 1. Decision

Vercel is deployment/runtime evidence for TORO. It is not a second Brain, task system, plan or memory.

The canonical TORO deployment must come from the canonical repository `Dramcatcherst/Toro-OS` and preserve the current GitHub/Supabase authority model.

Existing Vercel projects are not automatically canonical merely because their names contain TORO.

## Evidence and current readback

The audit identified the existing Next.js project **toro-pr11-preview**, connected to `Dramcatcherst/Toro-OS`, and its canonical domain **toro.dreamcatcherhotel.com**. Despite the project's internal name, a deployment must be classified by its target and evidence. Reuse this target; do not provision a second project from the historical gap below.

The audited production artifact, main and candidate previews have different commit identities. A merge, READY preview or successful CI is not proof that production runs that version or that a business workflow has passed acceptance. The [24 October continuation](../evidence/TORO_INTEGRAL_AUDIT_2026-10-22.md#9-auditoría-del-portal-y-reconciliación--2026-10-24) records the newer cut, including the unresolved requested address `toro.jpghotel.co` and the limits of anonymous inspection. Re-read current deployment metadata and the release gates before any change; dated observations do not authorize a new project or domain cutover.

## 2. Historical discovery — 2026-10-01

This section records discovery of two legacy projects. It does not describe the current canonical project's absence or authorize creating another project. Use the newer readback below.

Connected Vercel team:

`Dreamcatcher's projects`

Observed legacy targets:

### `toro-os`
- project id: `prj_ZGxU60PB4VVHsiau18LrTKMYPJuG`;
- observed framework: **Vite**;
- recent production deployments are READY;
- current deployment metadata does not prove they were built from canonical `Dramcatcherst/Toro-OS`;
- **classification: LEGACY / NOT CANONICAL FOR CURRENT NEXT.JS TORO**.

### `toro-os-v03`
- project id: `prj_nzsVpQZree5WuErakMPKIyiK6gsA`;
- deployment metadata points to repository `Dramcatcherst/toro-os-v88-new`;
- recent preview attempts include ERROR states;
- last observed production target belongs to the legacy repository line;
- **classification: LEGACY / MIGRATION REFERENCE**.

Canonical GitHub `Dramcatcherst/Toro-OS` currently declares Next.js 16 and has Git-triggered `main` deployment disabled in `vercel.json`.

Therefore neither existing Vercel project may be treated as the current TORO production authority.

### Dated readback — 2026-10-22

- Canonical repository-connected project: `toro-pr11-preview`, id `prj_nxerFw9ciNews6tUMAah3GAlAJzs`, team `team_zUbLBlOtoQBHDfGMYpDlg0XO`.
- `toro.dreamcatcherhotel.com` resolves to deployment `dpl_55PLSKChYZARB1Vd3A6QiNz9nvxv`, READY/production, source `Dramcatcherst/Toro-OS`, SHA `349d15fb93061cba6a285fa3977f03e4d6b6b449`.
- Newer PR previews can be READY while production remains on that older SHA. The project name is an internal identifier; it is not evidence that its production alias is a demo or that it needs replacing.
- `vercel.json` still disables Git-triggered deployment of `main`. Keep that gate until the intended production release passes configuration, identity/scope and recovery acceptance.
- Listing environment-variable metadata without decryption returned403 in the preceding acceptance audit. Current values, scope assignments and completeness are not verified; do not retry unchanged, weaken protection or insert flags into build commands as a workaround.

Evidence and limits: [operating audit](../evidence/TORO_OPERATING_CONFIGURATION_AUDIT_20261022.md) and [anonymous Portal acceptance](../evidence/TORO_PORTAL_ANONYMOUS_ACCEPTANCE_20261022.md). Re-read current deployment metadata before any release; these observations are not perpetual health claims.

## 3. Canonical target

Reuse the verified existing canonical project whose Git source is:

`Dramcatcherst/Toro-OS`

Requirements:

- Next.js auto-detected/current supported runtime;
- production branch = `main`;
- no deployment from `toro-os-v88-new`;
- no automatic custom-domain cutover until preview and production smoke gates pass;
- legacy Vercel projects remain untouched during the rollback window;
- after cutover, legacy projects may be archived only through a separately verified decommission decision.

Do not create another project or move a domain merely because this historical contract once called for initial connection. A future additional privileged deployment requires an explicit consumer, trust boundary and release plan; it is not created by this document.

The Vercel project name is an internal deployment identifier, not a second visible product brand. The visible product remains **TORO**.

## 4. Required configuration presence

Never store secret values in GitHub or this document.

The canonical Vercel project must contain the appropriate environment-scoped configuration for:

### Supabase public/runtime by trust boundary
- `NEXT_PUBLIC_SUPABASE_URL`;
- `SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- Public/publishable config is not an authenticated identity or a permission grant.
- Backend worker credential belongs only to an authorized privileged runtime: prefer `SUPABASE_SECRET_KEY` or governed `SUPABASE_SECRET_KEYS`; legacy `SUPABASE_SERVICE_ROLE_KEY` is compatibility only. The authenticated read Portal must not receive worker or provider-write credentials merely because it shares repository code. Never prefix such secrets with `NEXT_PUBLIC_`.

### Existing deployment profiles

The values below describe the current code contract in `src/lib/server/public-demo.ts` and `src/proxy.ts`; they are not proof of configured remote values.

| Profile | Setting / behavior | Acceptance |
|---|---|---|
| Public demo | `TORO_DEPLOYMENT_MODE` absent or anything other than exact `portal`/`internal`; non-operational allowlist | Brain demo; blocked operational routes; no live identity/data promotion |
| Authenticated Portal | exact `TORO_DEPLOYMENT_MODE=portal`; verified session/context, two independently gated read APIs, bounded login/logout/context POST only | Positive and negative roles/scope, expiration/logout, no private cache, privileged routes404, no worker/provider-write secrets |
| Privileged internal runtime | exact `TORO_DEPLOYMENT_MODE=internal`; each capability still requires its own flag, auth/scope and approval | Minimum-principal read/claim/receipt checks, exact MCP audience if enabled, no anonymous access; separate verified ingress |

`internal` is not authorization. Do not switch the public Portal hostname to `internal` to expose a missing endpoint. The Portal denies legacy operations, task writers, MCP, worker canary and runtime health even when inherited flags are true. Unknown deployment modes fail to demo. Local acceptance with synthetic public config is a disposable QA build, never a release artifact.

### Runtime verification
Internal profile only; not a Portal requirement:
- `TORO_RUNTIME_HEALTH_ENABLED=true` only during an authorized runtime-verification window;
- `TORO_RUNTIME_HEALTH_TOKEN` as a backend-only random secret.

### MCP
Initial production state:
- `TORO_MCP_ENABLED=false`.

Only after authenticated isolation QA:
- set `TORO_MCP_ENABLED=true`;
- set a valid HTTPS `TORO_MCP_RESOURCE_URL` ending in `/api/mcp`.

### Canonical reads
Do not enable read surfaces merely because a deployment exists. Preserve the independent gates for:
- `TORO_BRAIN_CANONICAL_READ_ENABLED`;
- `TORO_OWNER_ATTENTION_READ_ENABLED`.

## 5. Protected health contract

The following handler contract applies to an authorized internal deployment. The Portal perimeter returns404 before the handler; demo returns its non-operational response. Do not weaken either perimeter to obtain a green health probe.

Route:

`GET /api/system/runtime-health`

Default behavior:
- health feature missing/false -> HTTP 404;
- enabled but wrong/missing bearer token -> HTTP 401;
- enabled but worker/public Supabase config incomplete -> HTTP 503;
- authorized and worker can read both Control Plane tables -> HTTP 200 `state=ready`;
- database/config problem -> HTTP 503 `state=degraded`.

The response exposes only safe configuration metadata:
- whether required config classes exist;
- worker credential source name and whether it is legacy;
- MCP gate/config state;
- Vercel environment/commit metadata;
- read-only run/receipt counts.

It never returns credential values or raw database errors.

## 6. Release sequence

1. Verify current `main` commit and CI.
2. Reconfirm the existing canonical project's Git source, deployment target and intended profile; reuse it. Inventory any internal consumer separately without creating a replacement by default.
3. Keep automatic production deployment disabled until configuration inventory is complete.
4. Verify names/presence/scope of configuration through authorized access, including build-time public settings; changes preserve a known rollback. Give each deployment only its required config. A denied config read is an access dependency, not a reason to copy secrets or bypass the API.
5. For an internal release only, enable runtime health temporarily with a dedicated bearer token. For Portal, verify the privileged routes remain unavailable.
6. Deploy an exact preview from current `main`.
7. Verify:
   - expected commit SHA;
   - Next.js build success;
   - Portal: positive login, role/scope denial, membership transport, refresh/context/logout; worker/provider-write secrets absent and privileged routes excluded;
   - internal: runtime health authenticated path, minimum worker credential and read-only Control Plane probe;
   - MCP remains disabled;
   - no unexpected external writes.
8. Promote the exact verified deployment only for the reviewed profile/configuration. A READY demo preview or local synthetic build is not Portal acceptance. Rebuild and reverify if build-time config/profile changes.
9. Repeat SHA, profile, identity/perimeter and rollback readback against production.
10. On the authorized internal runtime only, run one synthetic/internal L0/L1 Control Plane cycle with receipt; this is not required by changing Portal presentation.
11. Only after its independent gates begin authenticated MCP QA/PUMBA bridge; keep Writer and external operations on their existing gates.
12. Domain changes remain separate; the existing canonical alias does not need a new cutover simply to update this contract.

## 7. Rollback

Until canonical production verification passes:
- do not delete legacy Vercel projects;
- do not repoint a public/custom domain;
- preserve the actual last verified production deployment and its config/profile; legacy deployment history alone does not prove suitability as rollback;
- rollback means returning traffic to the previously verified deployment, not rewriting data.

## 8. Definition of done

Canonical Vercel deployment is DONE only when:
- Vercel project Git source is verified as `Dramcatcherst/Toro-OS`;
- deployed commit equals the intended current-main SHA;
- CI/build and profile-specific acceptance pass;
- Portal proves identity/scope/logout and exclusion of privileged routes/credentials;
- an internal runtime, when in scope, proves minimum-principal Control Plane reads and protected health;
- MCP default-disabled/excluded behavior is verified for the intended profile;
- no secret value appears in logs/responses;
- an internal worker release, when in scope, produces one verified receipt;
- rollback candidate is known;
- Plan General records the verified deployment evidence.
