# TORO GitHub + Vercel Alignment V1

Status: **canonical delivery-governance contract**  
Owner: **TORO Brain**  
Parent: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
Date: 2026-09-22 (Costa Rica)

## 1. Non-negotiable rule

Every material initiative — existing, in progress, or new — must be mapped to the single **TORO Brain General Plan** before it becomes a new repository, branch, Vercel project, production deployment, or durable subsystem.

GitHub and Vercel are execution infrastructure under TORO Brain. They are not independent projects and do not own a second master plan.

## 2. Authority model

| Layer | Authority |
|---|---|
| TORO Brain | portfolio intelligence, priorities, governance and Plan General |
| GitHub | product constitution, code, architecture, contracts, PR history and technical evidence |
| Vercel | deployment state, previews, production runtime evidence, build/runtime logs and deployment observability |
| Supabase | TORO-owned canonical structured runtime data |
| Domain systems | authoritative transactional truth for their own domain |

A deployment is not product truth. A repository is not automatically canonical. A preview is not production. Production is not automatically adopted or verified.

## 3. Live inventory observed 2026-09-22

### GitHub account

Connected owner: `Dramcatcherst`.

Observed repositories include:

- `Dramcatcherst/Toro-OS`
- `Dramcatcherst/toro-os-v88-new`
- `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel`
- `Dramcatcherst/dreamcatcher-website-vnext`
- `Dramcatcherst/dream-team`
- `Dramcatcherst/dreamcatcher-hotel-santa-teresa-v100`
- `Dramcatcherst/agoversion-v100`
- `Dramcatcherst/dc-king`
- `Dramcatcherst/ai-for-dreamers`
- `Dramcatcherst/dreamauro`
- `Dramcatcherst/SITE0926`
- archived: `Dramcatcherst/dreamcatcher-el-sueno-de-mama`
- earlier combined repo: `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel`

This inventory is evidence of multiple generations. It must be normalized by role, not blindly merged or deleted.

### Vercel team

Observed team: **Dreamcatcher's projects**  
Team ID: `team_zUbLBlOtoQBHDfGMYpDlg0XO`.

At least 20 Vercel projects were visible in the connected account during this audit.

## 4. Canonical mapping now

### TORO Brain governance / constitution

**CANONICAL**

- GitHub: `Dramcatcherst/Toro-OS`
- Canonical plan: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`
- Context contract: `toro-context.yaml`
- Vercel observed: `toro-pr11-preview` currently deploys this repository for preview/evidence.

This repository owns the Plan General and governance. No other repo may create an independent master plan.

### TORO runtime implementation

**ACTIVE CHILD — needs eventual consolidation decision, not immediate deletion**

- GitHub: `Dramcatcherst/toro-os-v88-new`
- Vercel: `toro-os-v03`
- Observed production branch: `master`
- Recent production deployment evidence points to this repository.

Interpretation: `Toro-OS` owns canonical product/governance truth; `toro-os-v88-new` is the current runtime implementation until a deliberate migration/consolidation is verified.

No new architecture inside `toro-os-v88-new` may contradict the canonical Plan General.

### Dreamcatcher website

**ACTIVE CHILD / CANONICAL WEBSITE IMPLEMENTATION**

- GitHub: `Dramcatcherst/dreamcatcher-website-vnext`
- Vercel preview project observed: `dreamcatcher-website-vnext-media-p0`
- Recent deployments came from branch `ToroOS/gallery-experience-20260922`.

This remains the canonical hotel website codebase unless a replacement is explicitly approved in the Plan General.

### DreamTeam

**ACTIVE CHILD — destination: TORO People**

- GitHub: `Dramcatcherst/dream-team`
- Vercel: `dream-team` and `dream-team-public`
- Both observed projects deploy the same GitHub repository.

Do not create a third DreamTeam product. Future functional work should map to TORO People and progressively absorb the standalone naming boundary.

### Dreamcatcher architecture/integration working repo

**ACTIVE CHILD / REFERENCE IMPLEMENTATION**

- GitHub: `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel`
- Vercel observed: `mau-dc-site` deployments currently reference this repository.

It is subordinate to TORO Brain and represents Dreamcatcher as the proving-ground business. It is not a second master plan.

## 5. Projects requiring classification before cleanup

The following are **LEGACY_HOLD or UNKNOWN_NEEDS_AUDIT** until dependencies, domains and production traffic are verified:

GitHub:
- `dreamcatcher-hotel-santa-teresa-v100`
- `agoversion-v100`
- `dc-king`
- `SITE0926`
- `dreamauro`
- `ai-for-dreamers` (already defined as separate product powered by TORO; do not absorb automatically)

Vercel:
- `dreamcatcher-hotel-santa-teresa-v100`
- `site-production-v1`
- `site0926`
- `mau-dc-site` (active mapping above; name should eventually be normalized)
- historical Dreamcatcher public-home / agoversion / preview projects visible in the team.

Some of these Vercel projects expose no Git metadata in the current deployment listing. That is a reason to audit, not a reason to delete.

## 6. Required initiative traceability

Every material initiative must record:

1. **Scope** — person / portfolio / business / property / project.
2. **TORO subsystem** — e.g. TORO Systems, Builder, Channels, People.
3. **Plan General item** — CURRENT / TARGET / NEXT / FUTURE.
4. **Canonical repository**.
5. **Branch and PR** for code or durable product documentation.
6. **Vercel project** when deployed.
7. **Deployment evidence** — deployment ID/URL, commit SHA and environment.
8. **Verification state** — proposed / implemented / deployed / verified / adopted.
9. **Rollback or retirement path**.
10. **Owner and next action**.

If one of these is missing, TORO must treat the initiative as incompletely integrated.

## 7. Creation rules

### New GitHub repository

Create only when all are true:
- separate deployable or product boundary is real;
- existing canonical repo cannot house it cleanly;
- source-of-truth role is documented;
- owner and lifecycle are explicit;
- Plan General link exists;
- no equivalent repo already exists.

Default preference: branch/package/module inside an existing canonical repo.

### New Vercel project

Create only when there is a justified deployment boundary:
- separate domain/environment/security boundary;
- independent lifecycle or scaling requirement;
- explicit repository mapping;
- Plan General mapping;
- observability and rollback owner.

Preview deployments should normally come from branches/PRs of the canonical project, not from permanently multiplying projects.

## 8. Deployment gate

Required flow:

`TORO request -> Plan General mapping -> issue/task -> canonical repo -> branch -> PR -> tests -> Vercel preview -> verification -> production gate -> production deployment -> evidence/readback -> close/update Plan General`

Production deployment must identify:
- exact commit SHA;
- source repository/branch;
- Vercel project;
- tests/verification;
- rollback candidate;
- owner.

## 9. Cleanup policy

No destructive cleanup is authorized by this document.

For every legacy repo/project:

`inventory -> domain/traffic check -> dependency check -> source comparison -> archive candidate -> owner review -> archive/retain decision -> post-change verification`

Use **archive first**, delete only with explicit justification and verified backup.

## 10. TORO agents responsible

- **TORO Brain** — owns Plan General and portfolio decisions.
- **TORO Systems** — connector health, Vercel runtime, incidents, backup/restore and drift.
- **TORO Builder** — GitHub branches/PRs, CI, preview verification and delivery evidence.
- **TORO Channels** — Dreamcatcher web/channel implementation.
- **TORO People** — DreamTeam absorption and employee-facing product scope.
- **TORO Governance** — permissions, action ceilings, audit trail and destructive-change gates.

## 11. Immediate backlog

P0:
- create complete GitHub repo registry with status: CANONICAL / ACTIVE_CHILD / PREVIEW / LEGACY_HOLD / ARCHIVED / SEPARATE_PRODUCT;
- create complete Vercel project registry with repo, branch, environment, domain, traffic/usage and owner;
- identify every production target and custom domain before cleanup;
- confirm `toro-os-v03` ↔ `toro-os-v88-new` as the current runtime path;
- confirm `dreamcatcher-website-vnext` as the single canonical Dreamcatcher website implementation.

P1:
- decide whether `toro-os-v88-new` should remain the runtime implementation repo or be migrated into `Toro-OS`;
- normalize Vercel project naming;
- collapse redundant permanent preview projects where standard PR previews suffice;
- map DreamTeam into TORO People without breaking the working app;
- classify all historical Dreamcatcher website repos/projects.

P2:
- automate drift detection between Plan General registry, GitHub repositories and Vercel projects;
- surface deployment health inside TORO Brain;
- require every new initiative to pass a duplicate/project-boundary check automatically.

## 12. Definition of aligned

GitHub + Vercel are aligned when TORO can answer, for every active initiative:

**Why does it exist? Who owns it? Which Plan General item does it serve? Which repo is canonical? What is deployed? Where? From which commit? Is it verified? What replaces it? How do we roll it back?**

If TORO cannot answer those questions from evidence, the initiative remains **not fully aligned**.
