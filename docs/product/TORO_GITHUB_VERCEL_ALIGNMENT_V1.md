# TORO GitHub + Vercel Alignment V1

Status: **canonical delivery-governance contract**  
Owner: **TORO Brain**  
Parent: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`  
Audit date: 2026-09-22/23, Costa Rica

## 1. Governing rule

Every material initiative — existing, in progress, or new — must map to the single **TORO Brain General Plan** before becoming a repository, branch, durable subsystem, Vercel project, production deployment, or permanent parallel workflow.

GitHub and Vercel are execution infrastructure under TORO Brain. They do not own a second brain, second architecture authority, or parallel Plan General.

## 2. Authority model

| Layer | Canonical authority |
|---|---|
| TORO Brain | portfolio intelligence, priorities, governance, Plan General |
| GitHub | product constitution, code, architecture, contracts, PR/change history |
| Vercel | deployment state, previews, production runtime evidence, logs/observability |
| Supabase | TORO-owned canonical structured runtime data |
| Domain systems | specialist transactional truth in their own domain |

Rules:
- deployed != verified;
- production != adopted;
- repository != automatically canonical;
- preview != production;
- connected != integrated;
- historical != deletable.

## 2.1 Fresh current-state verification — 2026-09-23

This section supersedes any older current-state SHA/deployment statements later in this document. Historical inventory remains useful as dated evidence, but live release questions must re-read GitHub/Vercel.

Fresh connected evidence:
- accessible GitHub repositories for owner `Dramcatcherst`: **13**; `dreamcatcher-el-sueno-de-mama` remains archived;
- visible Vercel projects in team `team_zUbLBlOtoQBHDfGMYpDlg0XO`: **20**;
- canonical governance repo: `Dramcatcherst/Toro-OS`;
- current `main` observed during this refresh: `d94459586ef4776cee503216063686e60657cab3`;
- active PR #16 backbone preview observed READY at `e3785bb1ff6a02d7c6e08fce26ba721c4d9cb610`, Vercel target = preview/null;
- `toro-pr11-preview` latest observed **production-target** deployment is READY from `main` at `d94459586ef4776cee503216063686e60657cab3`;
- therefore the project name `toro-pr11-preview` does **not** imply preview-only behavior. Production-target deployments from `main` remain an explicit release-topology risk/gate until branch/environment policy is intentionally separated and verified;
- TORO runtime `toro-os-v03` production remains READY from `Dramcatcherst/toro-os-v88-new` / `master` at `ae07afa930de537a671315b73d8276e3c245e41a`;
- `dreamcatcherhotel.com` currently resolves through Vercel deployment `dpl_2kpr9aTkLmPUyt9FUM6EksPHNFuE` on project `dreamcatcher-website-vnext-media-p0`, repo `dreamcatcher-website-vnext`, SHA `75a7e42754964331d811b70cba04c3a824b87b40`;
- `dream-team` and `dream-team-public` remain separate production projects from the same `dream-team` repo/SHA `947e8490fc6788a2de5b4d18eaaf83c8f657e04e`;
- `mau-dc-site` production remains READY from `Toro-OS---Dreamcatcher-Hotel` / `main` at `80768324ebeee59680e6bc86e20acd0961c875d7`;
- `site-production-v1` remains a READY production deployment for La Julia; current deployment metadata still does not establish a canonical Git repository, so source recovery remains required before creating a replacement repo.

Dynamic-state rule:
- do not encode a changing deployment SHA, traffic count, branch head or runtime-health result as permanent product truth;
- the contract stores canonical mappings and governance rules;
- GitHub/Vercel must be queried again for current release/runtime evidence before merge, production promotion, archive or cleanup.

## 3. GitHub inventory observed

Connected GitHub owner: `Dramcatcherst`.

| Repository | Classification | Evidence / role | Decision |
|---|---|---|---|
| `Dramcatcherst/Toro-OS` | **CANONICAL** | current Plan General, constitution, subsystem/context specs; active Sep 23 | sole governance/product authority |
| `Dramcatcherst/toro-os-v88-new` | **ACTIVE_RUNTIME_IMPLEMENTATION** | Vercel `toro-os-v03` production uses this repo, `master`, SHA `ae07afa...` | keep active; migration decision required later |
| `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel` | **ACTIVE_CHILD_REFERENCE** | Dreamcatcher proving-ground architecture; `mau-dc-site` deploys it | subordinate to TORO Brain |
| `Dramcatcherst/dreamcatcher-website-vnext` | **ACTIVE_CHILD_CANONICAL_WEBSITE** | newest active website line; current gallery preview deploys from it | one canonical Dreamcatcher website implementation |
| `Dramcatcherst/dream-team` | **ACTIVE_CHILD** | two live Vercel projects deploy same repo | destination is TORO People |
| `Dramcatcherst/dreamauro` | **SEPARATE_EXPERIMENTAL_PRODUCT** | RicoSky V3.6 / marketplace; preview deployed as `ricosky` | keep isolated unless TORO Exchange integration is approved |
| `Dramcatcherst/ai-for-dreamers` | **SEPARATE_PRODUCT_POWERED_BY_TORO** | explicitly defined relationship in canonical context | do not absorb automatically |
| `Dramcatcherst/dreamcatcher-el-sueno-de-mama` | **ARCHIVED_CAMPAIGN** | GitHub repository already archived | preserve history |
| `Dramcatcherst/dc-king` | **LEGACY_HOLD** | older Dreamcatcher generation, last observed Jun 20 | dependency/domain audit before archive decision |
| `Dramcatcherst/dreamcatcher-santa-teresa-next` | **LEGACY_HOLD** | isolated bootstrap Jul 25; superseded by vnext line | compare/retain evidence before archive |
| `Dramcatcherst/dreamcatcher-hotel-santa-teresa-v100` | **LEGACY_HOLD** | older V100 line; Vercel production still exists | do not archive until traffic/domain audit |
| `Dramcatcherst/agoversion-v100` | **LEGACY_HOLD** | older Aug website/release line; multiple Vercel derivatives remain | consolidate evidence first |
| `Dramcatcherst/SITE0926` | **LEGACY_HOLD** | Sep 4 catalog experiment; Vercel project has failed production target | inspect purpose/dependencies |

No repository deletion is authorized by this classification.

## 4. Vercel inventory observed

Connected team: **Dreamcatcher's projects**  
Team ID: `team_zUbLBlOtoQBHDfGMYpDlg0XO`.

Twenty projects were visible in the connected Vercel inventory.

| Vercel project | Classification | Git origin observed | Latest production evidence / state |
|---|---|---|---|
| `toro-pr11-preview` | **ACTIVE_CANONICAL_GOVERNANCE** | `Toro-OS` | production READY on `main`, SHA `a125d1d8...` |
| `toro-os-v03` | **ACTIVE_RUNTIME_PRODUCTION** | `toro-os-v88-new` | production READY, `master`, SHA `ae07afa9...` |
| `dreamcatcher-website-vnext-media-p0` | **ACTIVE_CANONICAL_WEBSITE_PRODUCTION** | `dreamcatcher-website-vnext` | `dreamcatcherhotel.com` currently resolves here; production READY, deployment `dpl_2kpr9aTkLmPUyt9FUM6EksPHNFuE`, SHA `75a7e427...` |
| `dream-team` | **ACTIVE_CHILD_PRODUCTION** | `dream-team` | production READY, SHA `947e8490...` |
| `dream-team-public` | **ACTIVE_CHILD_PRODUCTION** | `dream-team` | production READY, same SHA `947e8490...` |
| `mau-dc-site` | **ACTIVE_CHILD_REFERENCE** | `Toro-OS---Dreamcatcher-Hotel` | production READY, `main`, SHA `80768324...` |
| `ricosky` | **SEPARATE_EXPERIMENTAL_PREVIEW** | `dreamauro` | no production observed; preview READY |
| `site0926` | **ARCHIVE_CANDIDATE_HOLD** | failed production target, no current custom domain observed, no runtime log counts in 24h sample | recover purpose/source before archive |
| `dreamcatcher-hotel-santa-teresa-v100` | **ARCHIVE_CANDIDATE_HOLD** | old V100 generation; no current custom domain observed; no runtime log counts in 24h sample | production READY but dependency audit required |
| `site-production-v1` | **INCUBATOR_WITH_LIVE_DEPLOYMENT** | Git metadata absent / CLI-origin deployment | current domains `lajuliaguatape.com` + `www.lajuliaguatape.com`; production READY; business lifecycle remains INCUBATOR/inactive per Plan General |
| `dreamcatcher-public-home-p0-20260818` | **ARCHIVE_CANDIDATE_HOLD** | historical Dreamcatcher domain owner; current domain now resolves to vnext; no runtime log counts in 24h sample | preserve until dependency/env audit |
| `dreamcatcher-public-home-p0-20260817` | **ARCHIVE_CANDIDATE_HOLD** | older public-home generation; no current custom domain observed; no runtime log counts in 24h sample | preserve until dependency/env audit |
| `dreamcatcher-los50s-preview-p0` | **LEGACY_PREVIEW_HOLD** | `dreamcatcher-website-vnext` | latest BLOCKED; no production observed |
| `agoversion-issue17-20260816` | **LEGACY_PREVIEW_HOLD** | `agoversion-v100` | preview READY; historical production ERROR |
| `agoversion-v100-release-candidate` | **ARCHIVE_CANDIDATE_HOLD** | historical release candidate; no current custom domain observed; no runtime log counts in 24h sample | dependency audit before archive |
| `dist` | **ARCHIVE_CANDIDATE_HOLD** | generic historical deployment; no current custom domain observed; no runtime log counts in 24h sample | determine provenance before archive |
| `agoversion-v100` | **ARCHIVE_CANDIDATE_HOLD** | former Dreamcatcher production generation; current domain now resolves to vnext; no runtime log counts in 24h sample | compare/source audit before archive |
| `.preview-wow-f5edf00` | **ARCHIVE_CANDIDATE_HOLD** | preview-style historical project; no current custom domain observed; no runtime log counts in 24h sample | likely redundant, verify dependencies first |
| `dreamcatcher-coopemedicos` | **ARCHIVE_CANDIDATE_HOLD** | campaign/special-purpose name; no current custom domain observed; no runtime log counts in 24h sample | preserve until campaign/dependency audit |
| `encoding-probe` | **ARCHIVE_CANDIDATE_HOLD** | probe-purpose project; only Vercel aliases observed; no runtime log counts in 24h sample | high-priority archive candidate after dependency check |

Important: a Vercel `production` target does **not** prove current business traffic, custom-domain ownership, or business necessity. Legacy projects remain on hold until traffic/domain/dependency checks are complete.

## 4.1 Current custom-domain findings

Current domain resolution was checked directly through Vercel deployment lookup:

| Domain | Current Vercel project | State | Interpretation |
|---|---|---|---|
| `dreamcatcherhotel.com` | `dreamcatcher-website-vnext-media-p0` | READY / production | canonical public Dreamcatcher website |
| `www.dreamcatcherhotel.com` | `dreamcatcher-website-vnext-media-p0` | READY / production | same canonical public website |
| `lajuliaguatape.com` | `site-production-v1` | READY / production | separate active business/project; not Dreamcatcher legacy |
| `www.lajuliaguatape.com` | `site-production-v1` | READY / production | same separate business/project |

Historical deployments of `agoversion-v100` and `dreamcatcher-public-home-p0-20260818` contain old Dreamcatcher domain aliases in their deployment history. Current domain lookup resolves Dreamcatcher to the vnext project, so those historical alias records are evidence of previous production ownership, not current authority.

Inspected production deployments for TORO Brain, TORO runtime, DreamTeam and several legacy/probe projects exposed only `vercel.app` aliases in the retrieved deployment metadata.

## 4.2 Runtime health findings

Observed through Vercel runtime data during this audit:

| Surface | Window | Result |
|---|---|---|
| TORO Brain governance | 7 days | no runtime error groups returned |
| TORO runtime | 7 days | no runtime error groups returned |
| Dreamcatcher website | 7 days | no runtime error groups returned |
| DreamTeam protected | 7 days | no runtime error groups returned |
| DreamTeam public | 7 days | 11 `attendance_manual_edit_rejected` warnings on 2026-09-16 caused by duplicate-key conflict on `attendance_exceptions_day_type_idx` |
| La Julia Guatapé | 24h | no runtime error groups returned |

Traffic/activity evidence from grouped production runtime logs:
- Dreamcatcher website, last 24h: 1,941 HTTP 200; 341 HTTP 304; 111 HTTP 307; 4 HTTP 400; 1 HTTP 410.
- La Julia, last 24h: 296 HTTP 200; 58 HTTP 304; 35 HTTP 404.
- A narrow La Julia 404 sample was mostly automated `/wp-admin/install.php` probes plus one `/es/en` request; this requires route review but does not by itself prove a broken public journey.

Operational follow-up:
- DreamTeam: `Dramcatcherst/dream-team#34`
- La Julia portfolio alignment: `Dramcatcherst/Toro-OS#39`

Runtime health becomes a **TORO Systems** responsibility: project existence alone is insufficient; TORO should monitor production errors, failing builds, domain drift, deployment-source drift and repeated 4xx/5xx patterns.

### Legacy runtime-activity sample

A 24-hour Vercel production runtime-log aggregation returned **no status-code counts** for these ten historical projects:
- `dreamcatcher-hotel-santa-teresa-v100`
- `dreamcatcher-public-home-p0-20260818`
- `dreamcatcher-public-home-p0-20260817`
- `agoversion-v100-release-candidate`
- `dist`
- `agoversion-v100`
- `.preview-wow-f5edf00`
- `dreamcatcher-coopemedicos`
- `encoding-probe`
- `site0926`

Interpretation: no runtime activity was observed through this Vercel runtime-log source in that window. This is **not equivalent to zero HTTP traffic**, especially for fully static responses. The result is sufficient to raise archive priority, but not sufficient to authorize archive/delete without checking domains, static analytics if available, env dependencies, webhooks and external references.

## 5. Canonical delivery mappings

### TORO Brain product/governance

- Canonical GitHub: `Dramcatcherst/Toro-OS`
- Plan: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`
- Context: `toro-context.yaml`
- Vercel evidence surface: `toro-pr11-preview`
- Role: constitution, product architecture, Plan General and reusable contracts.

### TORO runtime

- Runtime GitHub today: `Dramcatcherst/toro-os-v88-new`
- Vercel: `toro-os-v03`
- Production branch observed: `master`
- Production SHA observed: `ae07afa930de537a671315b73d8276e3c245e41a`

This is an **implementation child**, not a competing master product.

Long-term decision remains open:
1. keep governance/runtime split deliberately; or
2. migrate runtime into `Toro-OS`.

No migration should occur until tests, environment parity, domains, auth, rollback and production verification are explicit.

### Dreamcatcher website

- Canonical code: `Dramcatcherst/dreamcatcher-website-vnext`
- Current production Vercel project: `dreamcatcher-website-vnext-media-p0`
- Current public domains: `dreamcatcherhotel.com`, `www.dreamcatcherhotel.com`
- Current domain-resolution deployment: `dpl_2kpr9aTkLmPUyt9FUM6EksPHNFuE`
- Production state: `READY`
- Production source observed: repo `dreamcatcher-website-vnext`, branch `codex/r51-tropical-day-night`, SHA `75a7e42754964331d811b70cba04c3a824b87b40`
- Newer gallery work is separately previewed from branch `ToroOS/gallery-experience-20260922`, SHA `8eccdf33109818ccd9c291be22790865bcde8cbe`

Therefore the vnext line is not merely a preview candidate: it is the **current canonical public website production path**. Older website generations become comparison/evidence sources only unless a specific dependency proves otherwise.

### DreamTeam / TORO People

- Code: `Dramcatcherst/dream-team`
- Vercel projects: `dream-team`, `dream-team-public`
- Both observed at SHA `947e8490fc6788a2de5b4d18eaaf83c8f657e04e`

Two deployment surfaces may be justified by access/exposure boundaries, but this must be documented. Do not create a third DreamTeam product.

### Dreamcatcher proving-ground architecture

- Repo: `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel`
- Vercel evidence: `mau-dc-site`
- Role: reference implementation / Dreamcatcher-specific integration work.
- Governance: always subordinate to the TORO Brain General Plan.

### La Julia Guatapé

- Business/project lifecycle: **INCUBATOR / inactive** per the canonical Plan General.
- Technical web surface: **DEPLOYED / live**.
- A live deployment does not activate the business.
- Classification: **INCUBATOR_WITH_LIVE_DEPLOYMENT**
- Domain: `lajuliaguatape.com`, `www.lajuliaguatape.com`
- Vercel: `site-production-v1`
- Project ID: `prj_0EUpbahThy3oOBMLquDYwq9FDo7H`
- Production deployment: `dpl_9pcpsAo8e7JWoVnwbYaUGkDPpYpb`
- Deployment source: CLI; canonical Git source remains unknown.
- Public positioning: daytime finca / rural coworking / experiences in El Roble, Guatapé; not individual lodging.
- Scope rule: keep isolated from Dreamcatcher truth unless an explicit shared-service contract is created.
- Activation rule: only an explicit portfolio/business trigger may change INCUBATOR -> ACTIVE.
- Alignment issue: `Dramcatcherst/Toro-OS#39`.

Do not create a new La Julia repository until TORO proves that the original canonical source cannot be recovered.

## 6. Required initiative traceability

Every material initiative must record:

1. scope;
2. TORO subsystem;
3. Plan General item and horizon: CURRENT / TARGET / NEXT / FUTURE;
4. canonical repository;
5. issue/task;
6. branch + PR;
7. Vercel project if deployed;
8. exact deployment/commit evidence;
9. verification state: PROPOSED / IMPLEMENTED / DEPLOYED / VERIFIED / ADOPTED;
10. rollback or retirement path;
11. owner;
12. next action.

Missing traceability means **not fully integrated**.

## 7. Creation rules

### New GitHub repository

Default: **do not create one**.

A new repo is justified only when:
- there is a true separate product/deployable/security boundary;
- an existing canonical repo cannot house the work cleanly;
- authority, owner and lifecycle are documented;
- Plan General mapping exists;
- duplicate scan passes.

Prefer branch/package/module in a canonical repo.

### New Vercel project

Default: **use the canonical project's PR/preview deployment**.

Create a new Vercel project only for a real deployment boundary:
- distinct production domain;
- security/access boundary;
- independent lifecycle/scaling;
- special framework/runtime requirement;
- deliberate public/private split.

Every new Vercel project must declare its GitHub repo and Plan General parent.

## 8. Release path

`TORO request -> scope -> Plan General -> subsystem -> issue -> canonical repo -> branch -> PR -> tests -> Vercel preview -> verification -> production gate -> production -> readback -> Plan General/state update`

A production record must preserve:
- repo;
- branch;
- commit SHA;
- Vercel project/deployment;
- checks/tests;
- owner;
- rollback candidate;
- verification evidence.

## 9. Cleanup policy

No destructive cleanup is authorized by this contract.

Legacy lifecycle:

`inventory -> domain check -> traffic check -> dependency check -> data/env/secret dependency check -> source comparison -> archive candidate -> human gate if material -> archive -> verification`

Rules:
- archive before delete;
- retain rollback evidence;
- never detach an unknown domain blindly;
- never remove a project merely because its name looks old;
- production targets with unknown traffic remain `LEGACY_HOLD`.

## 10. Ownership

- **TORO Brain** — Plan General and portfolio authority.
- **TORO Systems** — connector health, Vercel runtime, incidents, observability, backup/restore.
- **TORO Builder** — GitHub issues/branches/PRs, CI, preview verification, release evidence.
- **TORO Channels** — Dreamcatcher web/channel surfaces.
- **TORO People** — DreamTeam scope.
- **TORO Governance** — permissions, action ceilings, destructive-change gates.
- **TORO Assets** — source/media/evidence when deployment depends on files/assets.

## 11. Current gaps

### P0
- establish real traffic/usage or explicit non-use for each legacy Vercel production target;
- document why both `dream-team` and `dream-team-public` are needed;
- map secrets/env dependencies without exposing secret values;
- map external integrations/webhooks that reference legacy deployment URLs;
- identify the canonical source repository/owner for `site-production-v1` / La Julia Guatapé;
- map La Julia Guatapé into the correct TORO scope as a separate active business/project rather than Dreamcatcher legacy.

### P1
- decide `Toro-OS` vs `toro-os-v88-new` long-term runtime repository boundary;
- normalize legacy Vercel naming;
- archive confirmed dead previews/probes;
- classify historical website source differences before archiving repos;
- map DreamTeam visibly into TORO People while preserving working deployment boundaries.

### P2
- automate GitHub/Vercel drift detection;
- TORO Systems dashboard: repo -> PR -> deployment -> runtime health;
- block new unmapped repos/projects by policy/check;
- detect permanent previews that should be ordinary PR previews;
- auto-open reconciliation tasks when observed state diverges from Plan General.

## 12. Definition of aligned

GitHub + Vercel are aligned when TORO can answer for every active initiative:

**Why does it exist? Who owns it? Which Plan General item does it serve? Which repo is canonical? What is deployed, from which commit, in which environment? Is it verified? What supersedes it? How is it rolled back or retired?**

Anything that cannot answer those questions from evidence remains **NOT_FULLY_ALIGNED**.
