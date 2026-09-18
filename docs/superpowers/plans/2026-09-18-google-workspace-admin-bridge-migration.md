# Google Workspace Admin Bridge — canonical migration plan

**Status:** PREPARED / NOT LIVE / NO PRODUCTION AUTHORIZATION  
**Date:** 2026-09-18  
**Canonical target:** `Dramcatcherst/Toro-OS` stacked on PR #16  
**Legacy source:** `Dramcatcherst/toro-os-v88-new` merge `ae07afa930de537a671315b73d8276e3c245e41a`

## Decision

Preserve the proven read-only audit core from the legacy Google Admin Bridge, but do **not** carry forward its original delegated-admin/DWD runtime configuration.

The canonical direction is:

1. Vercel production workload identity (OIDC) -> Google Cloud Workload Identity Federation.
2. Impersonate a dedicated Google Cloud service account with short-lived credentials; no JSON service-account key.
3. Assign a least-privilege Google Workspace admin role directly to that service account for domain-administration reads.
4. Keep the exact read-only OAuth scope allowlist:
   - `admin.directory.user.readonly`
   - `admin.directory.group.readonly`
   - `admin.directory.domain.readonly`
   - `admin.reports.audit.readonly`
5. Treat Reports API access as an acceptance probe. Failure must produce PARTIAL/UNAVAILABLE, never trigger DWD or broader scopes automatically.
6. Shared Drive access remains deferred and outside V1.
7. No Google writes, Gmail access, Calendar user-data access, password reset, routing, DNS, billing, role mutation, session revocation or legacy-account retirement.

Official Google Workspace guidance now documents that service accounts can be assigned prebuilt/custom Workspace administrator roles for domain administration. Domain-wide delegation is for acting on behalf of users / user-domain data and is not the default path for this audit-only bridge:
- https://developers.google.com/workspace/guides/create-credentials
- https://cloud.google.com/iam/docs/workload-identity-federation

## What was migrated now

`src/features/systems/google-workspace-audit.ts` ports only the transport-independent, read-only contract:

- exact four-scope fail-closed validation;
- service-account identity shape instead of a human delegated subject;
- 7-day audit window;
- Workspace users, groups/members, domains, login/admin events;
- group member read concurrency capped at 4;
- COMPLETE/PARTIAL and AVAILABLE/UNAVAILABLE semantics;
- 2SV/admin and primary-domain findings;
- legacy identities retained as audit evidence, never auto-retired;
- Shared Drives explicitly `DEFERRED_SCOPE`;
- auth evidence explicitly `NOT_WIRED`.

No Google SDK, access token, WIF provider, service account, Workspace role or environment secret is configured by this branch.

## Gates before live auth

### Gate A — code contract
- tests green;
- exact scope bundle remains enforced;
- no write method or write scope exists;
- no secret values or delegated human credential fields in source.

### Gate B — identity design
Create/review, outside source code:
- dedicated Google Cloud project/pool/provider;
- Vercel production-only OIDC trust with restrictive attributes;
- dedicated service account;
- no service-account key;
- least-privilege Workspace custom admin role assigned to the service account;
- no Super Admin assignment.

### Gate C — transport adapter
Implement Google Directory/Reports client construction using short-lived WIF credentials. Keep adapters injected into the existing pure audit core.

### Gate D — read-only pilot
Read and reconcile only:
- users;
- groups and memberships;
- domains;
- login audit;
- admin audit.

Persist only normalized/sanitized evidence. Never persist raw tokens or private credential material.

### Gate E — acceptance
- sampled counts agree with Google Admin Console;
- no mutations occurred;
- Reports works or is explicitly PARTIAL;
- no broader scopes were added;
- Vercel preview/dev identities cannot obtain production Workspace authority;
- rollback disables the WIF trust/service-account role without touching human accounts.

## Legacy repo disposition

The merged V88 Google Admin Bridge is **migration evidence**, not current runtime authority.

Do not archive `toro-os-v88-new` until:
- this canonical migration contract is green;
- the Vercel Admin Bridge and any other unique modules are dispositioned;
- legacy PR #23 is marked superseded by this canonical plan or otherwise preserved as historical design evidence;
- backup/ref evidence is recorded.

## Explicit non-goals

This migration does not authorize:
- production merge;
- live Google API calls;
- Google Cloud or Workspace resource creation;
- DWD;
- secrets;
- Workspace writes;
- Drive;
- Gmail/Calendar data;
- account cleanup.
