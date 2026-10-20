# TORO — Canonical Vercel Deployment Contract v1

**Status:** CURRENT deployment target contract  
**Date:** 2026-10-01  
**Owner:** TORO Systems / SOBRESITO  
**Canonical repository:** `Dramcatcherst/Toro-OS`

## 1. Decision

Vercel is deployment/runtime evidence for TORO. It is not a second Brain, task system, plan or memory.

The canonical TORO deployment must come from the canonical repository `Dramcatcherst/Toro-OS` and preserve the current GitHub/Supabase authority model.

Existing Vercel projects are not automatically canonical merely because their names contain TORO.

## 2. Observed Vercel state — 2026-10-01

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

## 3. Canonical target

Create or reconnect exactly one Vercel project whose Git source is:

`Dramcatcherst/Toro-OS`

Requirements:

- Next.js auto-detected/current supported runtime;
- production branch = `main`;
- no deployment from `toro-os-v88-new`;
- no automatic custom-domain cutover until preview and production smoke gates pass;
- legacy Vercel projects remain untouched during the rollback window;
- after cutover, legacy projects may be archived only through a separately verified decommission decision.

The Vercel project name is an internal deployment identifier, not a second visible product brand. The visible product remains **TORO**.

## 4. Required configuration presence

Never store secret values in GitHub or this document.

The canonical Vercel project must contain the appropriate environment-scoped configuration for:

### Supabase public/runtime
- `NEXT_PUBLIC_SUPABASE_URL`;
- `SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- backend worker credential: prefer `SUPABASE_SECRET_KEY` or governed `SUPABASE_SECRET_KEYS`; legacy `SUPABASE_SERVICE_ROLE_KEY` is compatibility only.

### Runtime verification
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
2. Create/reconnect the single canonical Vercel project to `Dramcatcherst/Toro-OS`.
3. Keep automatic production deployment disabled until configuration inventory is complete.
4. Configure required public and backend variables without exposing values.
5. Enable runtime health temporarily with a dedicated bearer token.
6. Deploy an exact preview from current `main`.
7. Verify:
   - expected commit SHA;
   - Next.js build success;
   - runtime health authenticated path;
   - worker secret configured;
   - read-only Control Plane probe;
   - MCP remains disabled;
   - no unexpected external writes.
8. Promote the exact verified deployment to production.
9. Repeat health/readback against production.
10. Run one synthetic/internal L0/L1 Control Plane worker cycle with receipt.
11. Only after that begin authenticated MCP QA and PUMBA bridge.
12. Custom domain cutover is a separate gate.

## 7. Rollback

Until canonical production verification passes:
- do not delete legacy Vercel projects;
- do not repoint a public/custom domain;
- preserve the last known-good legacy production deployment;
- rollback means returning traffic to the previously verified deployment, not rewriting data.

## 8. Definition of done

Canonical Vercel deployment is DONE only when:
- Vercel project Git source is verified as `Dramcatcherst/Toro-OS`;
- deployed commit equals the intended current-main SHA;
- CI, build and runtime health pass;
- backend worker can read Control Plane through minimum privilege;
- MCP default-disabled behavior is verified;
- no secret value appears in logs/responses;
- one internal worker run produces a verified receipt;
- rollback candidate is known;
- Plan General records the verified deployment evidence.
