# TORO Studio v1

**Status:** DESIGN APPROVED · GENERAL PLAN INTEGRATED · DREAMCATCHER PILOT IN PROGRESS
**Canonical TORO path:** Growth + Assets + Channels > TORO Studio
**Canonical machine contract:** `operations.knowledge_items/toro_studio_v1`
**Human spec:** https://app.notion.com/p/3e6f5169a39a81e9baa8cf1396d66140?pvs=204

## 1. Purpose

TORO Studio is the governed creative/media capability of the single TORO product. It turns real business goals and source-backed context into images, video, design and content while preserving brand truth, permissions, provenance, approvals and measurable learning.

It is not a second brain, brand, project root, database or permission model.

## 2. Tools

- TORO Images
- TORO Video
- TORO Design
- TORO Content
- TORO Media Library
- TORO Brand Guard

Internal specialist roles:
Brand Guardian, Creative Strategist, Prompt Architect, Image Producer, Video Producer, Copy Editor, QA Checker, Asset Librarian, Publisher, Performance Analyst.

## 3. Creative lifecycle

`IDEA -> BRIEF -> DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> MEASURED -> ARCHIVED`

Material outputs require:
brand, goal, audience, channel, format, CTA, source authority, references/assets, approver, privacy/rights and success metric when applicable.

Missing material context => DRAFT, never production-safe.

## 4. Data model — reuse first

TORO Studio MUST reuse current structures before proposing new production tables.

### Canonical structures already present
- `content.media_assets` — canonical asset index
- `content.media_assignments` — asset -> target role/ordering
- `content.brand_content` — governed brand/content truth
- `integrations.media_file_manifest` — file/hash/canonical disposition
- `integrations.media_intake_archive` — intake/recovery evidence
- `integrations.source_asset_registry` — source registry

Observed at integration:
- content.media_assets: 50 before Studio bridge
- Studio bridge candidates added: 9
- content.media_assignments: 10
- content.brand_content: 18
- media_file_manifest: 422
- media_intake_archive: 140
- source_asset_registry: 384

### Transitional Airtable structures
- `media_assets`
- `approvals`
- `asset_entity_links`
- `Content Roadmap`
- `Content Opportunities`
- `Campaign Ideas`

Do not create replacement campaign/prompt/performance/approval tables until the Dreamcatcher pilot proves a missing canonical contract.

## 5. Asset safety contract

Airtable contained 9 assets with:
- rights_status=cleared
- social_candidate=true
- approved_for_web=true
- approved_for_ai=true

These 9 were bridged into `content.media_assets`.

Bridge semantics:
- rights_verified=true
- public_safe=false
- publish_status=review
- requires_human_verification=true

The bridge makes them eligible for TORO Studio QA. It does not authorize publication.

## 6. Dreamcatcher pilot

### Existing campaign reused
Airtable `Campaign Ideas / rec0xG5HM10xV512o`

**Campaign:** Costa Rica También Se Vacaciona
**Segment:** domestic leisure / low-season direct booking
**Message:** Costa Rica también se vacaciona.
**CTA:** Hablar con TERE / ver disponibilidad real
**Strategy:** organic first; paid only on verified Kross need-dates + FIONA margin.

### Pilot workflow

1. Build canonical brief from campaign + Dreamcatcher Brand/Design DNA + verified current facts.
2. Select only governed candidate assets.
3. Produce three hero reel concepts + cutdowns + stories as DRAFT.
4. Produce copy/CTA variants; availability/pricing remain live-source facts.
5. Brand Guard QA: rights, fidelity, room/property identity, claims, dates, privacy and channel rules.
6. Prepare one human approval packet.
7. Publish organic only after approval.
8. Paid media is a separate gate requiring verified need-date and margin.
9. Measure qualified conversations, Kross booking-start, confirmed/net outcome when attributable, rework, production time and owner intervention.
10. Promote only evidence-backed templates/prompts/assets into reusable Studio learning.

### Candidate visual set

Priority candidates:
- Villa Toro pool courtyard hero enhanced — score 92
- Villa Toro private jacuzzi view — score 92
- Villa Toro pool canopy hero enhanced — score 92
- Villa Toro garden patio — score 84
- Room 25 bedroom — score 78
- Dreamcatcher short-logo candidate — final brand reconciliation still required

### Publication gate

No public publish until selected asset(s):
- remain rights-cleared,
- pass fidelity/identity QA,
- are explicitly promoted to public_safe,
- have campaign facts/CTA/expiry verified,
- pass action/approval gate.

## 7. Metrics

Primary:
- qualified conversations
- Kross booking starts
- confirmed bookings/net revenue when attributable
- owner intervention minutes
- time to approved pack
- rework count
- asset/template reuse rate

Do not use asset count, views or AI generation volume alone as success.

## 8. Non-negotiables

- one TORO
- no duplicate media brain
- no fabricated business facts
- no silent public-safe promotion
- no unapproved publication/spend
- no private-data leakage
- no brand drift
- no destructive media cleanup through this pilot
- preserve DF-003 decommission gate separately

## 9. Current execution record

- Canonical Studio contract: `toro_studio_v1`
- Pilot task: `STUDIO-PILOT-01`
- Airtable task id: `recgTe5yOA0PVf6YC`
- Pilot Notion page: https://app.notion.com/p/3e6f5169a39a81759b69cdb164ad8bea?pvs=204
- Existing campaign record: `rec0xG5HM10xV512o`
