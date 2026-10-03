# TORO — Source & Surface Registry Contract

**Status:** CURRENT R1-D CONTRACT  
**Date:** 2026-09-28  
**Owner:** TORO  
**Runtime authority:** Supabase `abtyrbqlqbsastmridzp`

## 1. Purpose

TORO must know **where something lives, what role that surface plays, what it is allowed to own, and how it converges** without creating another manually maintained source of truth.

This document is a contract and navigation layer. It is **not** the live registry.

## 2. Canonical runtime registry

The live authority for system surfaces is Supabase:

- `operations.toro_system_surfaces_v1` — canonical surface inventory/classification;
- `operations.toro_system_surface_summary_v1` — summary/management projection;
- `operations.toro_surface_convergence_queue_v1` — convergence work queue;
- `integrations.source_asset_registry` — governed source-asset registry where source objects/assets require structured provenance.

GitHub defines the contract and architecture. Supabase holds current structured state.

Any dashboard, WhatsApp response, report, Airtable view or Notion page that lists surfaces should project from the canonical runtime objects or clearly identify itself as a dated snapshot.

## 3. Classification contract

Every material operating surface receives exactly one surface class:

- **CANONICAL** — authoritative/approved surface for its stated role;
- **TRANSITION** — still used, but must converge to a canonical target;
- **ARCHIVE** — historical/reference only; no new features or promotion;
- **PARKED** — intentionally inactive until a trigger/decision exists.

Every material surface also records:

- `surface_group`;
- `surface_id`;
- `surface_name`;
- `system_role`;
- `canonical_target`;
- `write_policy`;
- `evidence_note`;
- `review_state`.

A surface name containing “master”, “production”, “TORO”, or similar wording does not grant authority. The registry classification wins.

## 4. Verified snapshot — 2026-09-28

Live registry count: **65 surfaces**.

| Group | Total | Canonical | Transition | Archive | Parked | Needs audit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Airtable | 14 | 0 | 7 | 4 | 3 | 2 |
| Core | 7 | 6 | 1 | 0 | 0 | 1 |
| Dropbox | 11 | 1 | 4 | 2 | 4 | 2 |
| GitHub | 13 | 2 | 1 | 8 | 2 | 0 |
| Vercel | 20 | 2 | 2 | 14 | 2 | 1 |
| **Total** | **65** | **11** | **14** | **28** | **11** | **6** |

This table is evidence from the dated readback. Future state must resolve from Supabase, not from these numbers.

## 5. Canonical surfaces already established

### TORO / platform

- Supabase principal — canonical TORO structured backend.
- GitHub `Dramcatcherst/Toro-OS` — canonical TORO product/code repository.
- Vercel `toro-pr11-preview` — canonical TORO preview runtime; **PREVIEW_ONLY**.
- Notion Plan General — control/documentation surface, not transactional authority.

### Dreamcatcher

- Kross — live PMS transactional authority.
- Alegra — accounting/fiscal authority in its domain.
- Dropbox business / `/Dreamcatcher Hotel` — original business file/evidence home.
- WeSpeak / TERE — canonical conversational runtime, with truth resolved from governed systems.
- GitHub `Dramcatcherst/dreamcatcher-website-vnext` — canonical website release code.
- Vercel `dreamcatcher-website-vnext-media-p0` — canonical website production runtime.

## 6. Current convergence decisions

### Airtable

- `TORO OS — Master Brain` = **ARCHIVE / LEGACY_REFERENCE**.
- `TORO OS — Sistema Operativo Central` = **TRANSITION / HUMAN_UI_STAGING**.
- `TORO OS — Command Center` = **TRANSITION / HUMAN_UI**, target Supabase decisions + TORO Today.
- DreamTeam Knowledge OS = **TRANSITION**, target `operations.knowledge_items`.
- Legacy Dreamcatcher copies = **ARCHIVE**.
- No Airtable base is allowed to become a new TORO runtime backend.

### GitHub

Canonical:
- `Dramcatcherst/Toro-OS`
- `Dramcatcherst/dreamcatcher-website-vnext`

Transition:
- `Dramcatcherst/dream-team` — staff app / current People migration owner during convergence.

Archive/reference:
- `toro-os-v88-new`
- `Toro-OS---Dreamcatcher-Hotel`
- `dreamcatcher-santa-teresa-next`
- `dreamcatcher-hotel-santa-teresa-v100`
- `agoversion-v100`
- `dc-king`
- `SITE0926`
- `dreamcatcher-el-sueno-de-mama`

Parked:
- `dreamauro`
- `ai-for-dreamers`

No archive/reference repository receives new product features unless its classification is deliberately changed first.

### Vercel

Canonical:
- `toro-pr11-preview` — TORO preview only.
- `dreamcatcher-website-vnext-media-p0` — Dreamcatcher production runtime.

Transition:
- `dream-team`
- `dream-team-public`

Archive/no-promotion:
- `toro-os-v03`
- website legacy/release-candidate/preview generations;
- `SITE0926` runtime;
- `site-production-v1`;
- test/build artifact runtimes.

Parked:
- `mau-dc-site`
- `ricosky`

A Vercel project named “production” or with a READY deployment is not canonical unless the registry says so.

## 7. Six current NEEDS_AUDIT surfaces

At the 2026-09-28 readback:

1. Airtable `DREAMCATCHER HOTEL` — mixed legacy operational base; human/external dependencies still need reconciliation.
2. Airtable `Untitled Base` — purpose unknown; quarantined/no writes.
3. OpenClaw WhatsApp — conversation runtime requires direct runtime/identity/security audit.
4. Dropbox `/PROVENZA` — separate scope not yet fully classified.
5. Dropbox `/RANCHO ESTRELLAS AZULES` — separate scope not yet fully classified.
6. Vercel `mau-dc-site` — separate/legacy consumer relationship still needs audit.

These are the R1-D convergence queue. They are not permission to delete or modify the surfaces.

## 8. Tooling is not automatically a business surface

The following are **capabilities/tools**, not business authorities merely because they are connected:

- Superpowers — execution methodology;
- Data Analytics — analysis/report generation;
- TinyFish — research/browser execution;
- Linear — currently parked; no active project authority;
- PostHog — analytics capability, currently unverified/wrong project connection for TORO;
- generic browser/computer tools.

They enter `toro_system_surfaces_v1` only when TORO can identify a concrete operating surface with a durable role, owner/scope, authority, consumer and write policy.

Do not create a duplicate Projects/Tasks authority in Linear.  
Do not use PostHog as product evidence until its TORO project identity is explicitly verified.

## 9. Convergence / retirement gate

A TRANSITION or ARCHIVE candidate may be retired only after:

1. canonical target is known;
2. unique data/evidence is mapped;
3. live consumers/dependencies are known;
4. parity is proven;
5. backup exists;
6. restore is tested where material;
7. write paths/automations are disabled or migrated safely;
8. owner approval exists for destructive retirement;
9. post-retirement readback shows no broken dependency.

“Not recently used” is not sufficient evidence.

## 10. Query contract

For current TORO decisions, read the Supabase registry first.

Preferred management flow:

`toro_system_surfaces_v1 -> toro_system_surface_summary_v1 -> toro_surface_convergence_queue_v1 -> evidence/source system`

A dated GitHub document may explain *why* a classification exists but must not silently override current runtime state.

## 11. R1-D completion target

R1-D is complete when:

- all material surfaces are represented or deliberately excluded by contract;
- every represented surface has authority/role/write policy;
- all material `NEEDS_AUDIT` entries have an evidence-backed disposition;
- unknown-consumer material runtimes are zero;
- no active domain depends on an unregistered shadow authority;
- destructive retirement remains separately gated.
