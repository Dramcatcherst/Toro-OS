# TORO Brain Multimodal Neural Fabric v1 — Design Spec

**Status:** PROPOSED SPEC — pending Mauricio review  
**Date:** 2026-09-23  
**Master:** TORO Brain General Plan  
**Reference business:** Dreamcatcher Hotel  
**Scope:** Product-wide multimodal relationship architecture for business understanding, media, provenance, Visual Brain and future customer onboarding  
**Rule:** This is a subordinate architecture spec. It does not create another brain, product, project, subsystem, database, permission engine or graph store.

---

## 1. Purpose

TORO Brain should build and maintain a governed, multimodal model of a business that links the people, places, assets, customers, products, services, systems, applications, processes, agents, media, documents, decisions, tasks, evidence and outcomes that matter.

The model should become richer as TORO discovers and verifies more of the authorized business.

The product must let an authorized user understand:

1. what TORO knows;
2. how business entities are connected;
3. what media/evidence supports those connections;
4. what TORO does not yet know;
5. what is stale, conflicting or blocked;
6. which systems/agents/processes are active;
7. what changed over time;
8. what TORO learned from verified outcomes.

This architecture supports the owner experience, employee experience, future client experience, investor/product demonstration and the public-safe "Watch TORO Work" / "Watch Your Business Brain Grow" experience.

---

## 2. Core product idea

TORO Brain is not a conventional dashboard with files attached.

It represents the business as a living, governed relationship network.

Conceptually:

```text
business reality
  -> signals / connectors / media / systems
  -> identity + scope + authority + provenance
  -> entities + typed relationships + events
  -> knowledge / workflows / decisions / agents
  -> actions + verification + outcomes
  -> learning
  -> updated network
```

The visual metaphor may be neural, but the implementation remains evidence-based.

**Product rule:**

> Everything material should be connectable; not everything connected must be visible.

**Learning rule:**

> The Brain grows through verified relationships and observed outcomes, not by accumulating files.

---

## 3. Relationship to existing TORO architecture

This spec extends, but does not replace:

- TORO Brain General Plan;
- TORO Brain Cognitive Operating Model;
- TORO Visual Brain Architecture;
- TORO Visual Brain Stage A Contracts;
- TORO Scope Graph;
- TORO Identity/User Vault;
- TORO Knowledge;
- TORO Data;
- TORO Governance;
- TORO Systems;
- TORO Agents;
- TORO Assets;
- TORO Growth;
- TORO Comms.

Ownership remains distributed across existing subsystems.

### 3.1 No new subsystem by default

"Neural Fabric" is an architectural concept describing how canonical business objects relate.

It is not a new `TORO Neural Fabric` service unless future implementation evidence proves an independent subsystem is required.

### 3.2 No new graph database by default

The current canonical Supabase/Postgres estate remains the structured runtime data plane.

Relationship projections may be composed from existing typed domain tables and a thin relationship/event layer when required.

Neo4j or another graph database is not justified merely because the UI visualizes a graph.

---

## 4. Multimodal information is first-class

Media is not treated as a generic attachment.

TORO must be able to model media as a governed business entity or signal when it materially contributes to understanding, evidence, operations, growth or communication.

### 4.1 Media classes

Conceptual media types include:

- image;
- video;
- audio;
- document;
- screenshot;
- scan;
- diagram;
- map;
- floorplan;
- presentation;
- recording;
- generated visual;
- derived media;
- camera/sensor capture where explicitly authorized;
- future 3D/spatial capture.

This is a semantic model. It does not require a universal physical media table for every implementation.

### 4.2 Five roles of media

A media object may play one or more roles:

1. **Sensor** — an observation of the real business.
2. **Evidence** — support for a condition, incident, repair, state or outcome.
3. **Knowledge** — a manual, diagram, training asset or explanatory record.
4. **Business asset** — brand, sales, listing, campaign or reusable content.
5. **Interface** — media TORO selects to explain or communicate with a human.

The same media object may participate in several domains without duplication.

---

## 5. One identity, many relationships

A media file, person, room, asset, customer or process should have one canonical identity where practical.

Different domains see that same entity through typed relationships.

Example:

```text
PHOTO-25-004
  -> depicts -> Room 25
  -> shows -> Projector
  -> published_on -> Website
  -> used_in -> Honeymoon campaign
  -> available_to -> TERE
  -> governed_by -> Media rights policy
  -> evidenced_by -> Original capture metadata
```

Do not create separate copies such as:

- marketing_photo_25;
- operations_photo_25;
- website_photo_25;
- TERE_photo_25.

Use one entity with multiple authorized relationships.

---

## 6. Canonical object categories

TORO Brain should support connections among existing object classes such as:

- principal/person;
- portfolio;
- organization/business/workspace;
- property/location;
- room/unit;
- customer/guest;
- supplier/provider;
- employee/team/role;
- asset;
- product/service;
- project/goal;
- process/workflow;
- task/action;
- approval;
- decision;
- risk/incident;
- system/application/connector;
- agent/subagent;
- skill/capability;
- knowledge;
- evidence;
- media;
- metric/outcome;
- event.

Not every internal record becomes a visible Brain node.

Visibility is relevance-, role-, scope- and permission-dependent.

---

## 7. Typed relationships

Relationships must have meaning.

Initial families:

### Ownership / structure
- owns
- controls
- part_of
- located_in
- member_of
- works_for
- responsible_for

### Operational
- uses
- executes
- depends_on
- blocks
- triggers
- produces
- affects
- verifies

### System/data
- connected_via
- reads_from
- writes_to
- synchronized_with
- derived_from
- supersedes

### Evidence/provenance
- sourced_from
- evidenced_by
- depicts
- recorded_by
- captured_at
- created_by
- modified_by
- contains
- contradicts
- supports

### Commercial/media
- published_on
- used_in
- represents
- promotes
- associated_with
- rights_held_by

### Governance
- governed_by
- visible_to
- requires_approval_from
- restricted_by

A relationship does not itself grant permission.

A relationship also does not prove causality unless its relationship class explicitly represents a verified causal or outcome linkage.

---

## 8. Relationship dimensions

Connections are not simply present/absent.

Where material, a relationship may carry:

- provenance;
- scope;
- authority;
- verification state;
- freshness;
- confidence;
- sensitivity;
- privacy class;
- importance;
- dependency strength;
- observed usage;
- outcome relevance;
- valid_from / valid_to;
- source reference;
- last reviewed;
- visibility.

These dimensions are not compressed into one misleading "confidence score".

The Visual Brain may express selected dimensions through line weight, pattern, badges or state, but every visual distinction must map to documented semantics.

---

## 9. Provenance model

TORO should adopt provenance concepts compatible with W3C PROV without requiring full RDF implementation.

W3C PROV distinguishes entities, activities and agents involved in producing or changing information.

TORO maps this conceptually as:

- **Entity:** media/document/data/business object.
- **Activity:** capture, edit, import, analysis, workflow, publication, verification.
- **Agent:** human, organization, TORO agent, connector or authorized system.

Important media and derived knowledge should be able to answer:

- where did this come from?
- who/what produced it?
- when?
- what changed?
- what was it derived from?
- who verified it?
- what scope owns it?
- what rights/consent apply?

Reference:
- https://www.w3.org/TR/prov-overview/
- https://www.w3.org/TR/prov-primer/

---

## 10. Content provenance / C2PA

When media contains C2PA Content Credentials or equivalent reliable provenance metadata, TORO should preserve and expose that signal where useful.

C2PA should be treated as provenance evidence, not as proof that the depicted business claim is true.

Conceptual fields may include:

- media_id;
- original_source;
- creator;
- captured_at;
- source hash/content binding;
- version;
- derived_from;
- edit history;
- AI generated / AI modified disclosure;
- rights;
- consent;
- privacy class;
- C2PA manifest/credential status;
- validation state.

TORO does not require C2PA for all media.

Reference:
- https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html

---

## 11. AI interpretation states

Model output about media is never promoted directly to truth.

Minimum interpretation progression:

```text
observation
-> entity candidate
-> relationship candidate
-> evidence/reconciliation
-> verified relation
```

Example:

- observation: image appears to contain a pool;
- candidate: possibly Dreamcatcher lower pool;
- verified relation: approved source/person confirms this image depicts the lower Dreamcatcher pool.

TORO must preserve the distinction.

Similarity is not identity.

Recognition is not authorization.

Visual inference is not source authority.

---

## 12. Multimodal acquisition loop

TORO's knowledge-acquisition process should support multimodal inputs.

Canonical conceptual loop:

```text
DISCOVER
-> PURPOSE / SCOPE / AUTHORIZATION
-> IDENTIFY SOURCE
-> PRESERVE PROVENANCE
-> DETECT MODALITY
-> EXTRACT SIGNALS
-> RESOLVE ENTITIES
-> PROPOSE RELATIONSHIPS
-> CHECK AUTHORITY / RIGHTS / PRIVACY
-> RECONCILE
-> VERIFY
-> PROMOTE
-> INDEX
-> USE
-> VERIFY OUTCOME
-> LEARN / INVALIDATE
```

Authorization precedes sensitive extraction.

Derived metadata does not refresh the underlying source verification date.

---

## 13. Search and retrieval

TORO should use hybrid retrieval.

Possible mechanisms:

- canonical IDs;
- exact metadata;
- relational traversal;
- lexical search;
- semantic embeddings;
- multimodal embeddings;
- temporal/freshness filters;
- permission filters.

Embeddings never become source authority.

The preferred retrieval sequence is:

```text
resolve context
-> filter authorized scope
-> identify canonical entity/source
-> retrieve structured/relational candidates
-> semantic/multimodal retrieval where useful
-> rank
-> preserve source and verification state
```

---

## 14. Media visibility strategy

Do not render every media object in the visual Brain.

Media becomes Brain-visible when it is materially relevant, for example when it:

- supports evidence;
- has commercial importance;
- is involved in an active workflow;
- has a conflict;
- is stale or missing;
- requires rights/consent review;
- represents a key asset/product/place;
- is requested by the user;
- affects an operational or commercial decision.

The internal Brain may index thousands of media objects while the owner sees only a small relevant neighborhood.

---

## 15. Visual Brain behavior

Visual Brain should expose separate lenses:

### Structure
What exists and how it relates.

### Coverage
What TORO understands, what is verified, what is missing.

### Activity
What was actually consulted, changed, executed or verified.

### Health
Whether a system/source/relationship is current, stale, degraded or unavailable.

### Evolution
How the business model changed over time.

Do not overload one color/state to represent all five.

---

## 16. Neural activation semantics

A node or edge may visually activate only when backed by an observable event/state.

Examples:

- source.read;
- media.indexed;
- entity.matched;
- relationship.proposed;
- relationship.verified;
- conflict.detected;
- approval.requested;
- action.started;
- verification.passed;
- evidence.attached;
- media.published;
- source.freshness_changed.

Do not animate hidden chain-of-thought.

OpenTelemetry-style trace/span concepts may inform correlation and replay without becoming the business evidence store.

Reference:
- https://opentelemetry.io/docs/concepts/signals/traces/

---

## 17. Brain evolution

TORO should support a governed history of how a business Brain developed.

Potential checkpoints:

- initial public discovery;
- first connected sources;
- first canonical entities;
- first verified processes;
- first workflow;
- first automation;
- first verified outcome;
- first reusable learned skill;
- first autonomy promotion;
- first autonomy demotion.

The product may present:

- Day 1;
- Week 1;
- Month 1;
- current.

Do not present growth in nodes as intelligence.

Better measures include:

- verified coverage;
- stale/conflicted knowledge reduced;
- authoritative sources connected;
- workflows modeled;
- verified outcomes;
- owner interruptions reduced;
- manual systems avoided;
- safe automation coverage;
- recovery/resilience maturity.

---

## 18. Customer onboarding experience

Future external-business onboarding should visually show the Brain forming.

Example progression:

```text
business identity
-> people
-> locations
-> products/services
-> systems
-> knowledge
-> media
-> workflows
-> customers
-> finance
-> risks
-> goals
-> activity
```

The user should see:

- what TORO discovered;
- what TORO inferred;
- what needs confirmation;
- what source is authoritative;
- what remains unconnected;
- why a deeper connector would create value.

The system must not imply completeness merely because a visual looks dense.

---

## 19. Product / investor experience

The commercial experience should demonstrate the governed architecture rather than generic AI chat.

Approved conceptual experiences:

### My Business Brain
The user's live governed business model.

### Watch TORO Learn
Shows observable discovery, reconciliation and verification events.

### Watch TORO Work
Shows source -> analysis/decision -> approval -> action -> verification.

### Brain Evolution
Shows how verified coverage, connectivity and operational maturity increased over time.

### Presentation Mode
A richer narrative for owners, clients and investors using synthetic, public or explicitly approved data.

Potential narrative:

> TORO builds the operational brain of your business by connecting the people, processes, systems, documents, media, assets and decisions that already exist — then uses those verified connections to coordinate work, find opportunities and learn from outcomes.

---

## 20. Dreamcatcher proving-ground scenarios

Initial scenarios should reuse existing work.

### Media + room identity
Room -> approved images -> website/OTA/concierge usage -> visual QA.

### Maintenance evidence
Incident -> before media -> asset/location -> repair -> after media -> verification.

### Housekeeping/Laundry
Knowledge -> equipment/assets -> procedures -> tasks -> evidence -> verification.

### Growth/media
Media -> room/product -> campaign/channel -> conversion/booking evidence.

### Guest journey
Guest request -> TERE -> room/media/experience -> source authority -> response -> outcome.

No scenario should require private guest/employee data for a public demo.

---

## 21. Specialist-agent relationship

Specialists observe different relations over the same entities.

Examples:

- RICO: physical truth, condition, maintenance, assets.
- SKY: brand, visual quality, campaigns, channel performance.
- TERE: guest suitability, content safe to send, conversion context.
- FIONA: costs, contracts, invoices, financial evidence.
- SOBRESITO: systems, provenance, integrations, data health.
- TORO: cross-domain orchestration, priority, conflicts and outcomes.

Do not create media copies per specialist.

Do not let specialist assignment grant access automatically.

---

## 22. Self-building Brain rules

TORO may create candidate nodes/relationships automatically when allowed.

Promotion requires the appropriate combination of:

- authorized source;
- canonical entity match;
- provenance;
- tenant/scope;
- privacy/rights;
- confidence;
- verification;
- regression/consistency check when material.

The Brain may:

- discover;
- propose;
- link candidates;
- identify missing information;
- identify duplicate media/entities;
- recommend deeper connectors;
- identify stale relationships.

The Brain may not silently:

- merge people;
- change ownership;
- grant access;
- assert causal relationships;
- declare repairs/payment/compliance complete;
- publish media;
- train on private business data;
- expose private media in public/investor mode.

---

## 23. Rights, privacy and sensitive media

Media requires explicit handling of:

- ownership;
- copyright/license;
- model/property releases where relevant;
- employee/guest privacy;
- face/voice sensitivity;
- children;
- credentials/screenshots;
- IDs/documents;
- exact location;
- security-sensitive infrastructure;
- retention/deletion;
- export/offboarding;
- legal hold when applicable.

Public/investor mode uses only synthetic, public or explicitly approved material.

---

## 24. Data and storage strategy

No universal new media database is required by this spec.

Preferred direction:

- original media remains in its authoritative/original file system or governed object storage;
- Supabase stores canonical metadata/relationships where justified;
- Dropbox/Drive may remain original file authorities during migration;
- media fingerprints/hashes help identity and deduplication;
- derived thumbnails/embeddings are rebuildable projections;
- captions/embeddings do not replace originals;
- rights/provenance metadata must survive migration.

A storage location is not business identity.

---

## 25. Brain contract evolution

The existing `BrainNodeKind` should eventually support `media` when implementation reaches the appropriate contract revision.

Potential future typed media summary:

```ts
type BrainMediaSummary = {
  mediaType: "image" | "video" | "audio" | "document" | "diagram" | "other";
  provenanceState: "verified" | "partial" | "unknown" | "conflicted";
  rightsState: "cleared" | "restricted" | "unknown" | "expired";
  aiDisclosure?: "original" | "edited" | "ai_modified" | "ai_generated" | "unknown";
};
```

This is a design direction, not implementation authorization.

Do not add fields to production contracts before Stage C identity/context integration and contract tests are ready.

---

## 26. Event Spine evolution

Future normalized event classes may include:

- media.discovered;
- media.indexed;
- media.updated;
- media.derived;
- media.published;
- media.unpublished;
- media.rights_changed;
- entity.candidate_detected;
- entity.matched;
- relation.proposed;
- relation.verified;
- relation.invalidated.

Events show observable operations, not hidden reasoning.

---

## 27. Technical implementation order

Do not implement this full spec at once.

Recommended sequence:

1. complete canonical Identity/Context integration;
2. complete Stage C read-only entity projection;
3. add governed Knowledge projection;
4. map existing media/source registries and original stores;
5. define media identity/provenance contract using current sources;
6. prove one Dreamcatcher media-to-entity scenario read-only;
7. add relationship candidates + verification;
8. add media-aware Brain node projection;
9. add Event Spine events;
10. add internal Brain Evolution;
11. add synthetic/public onboarding/investor experience;
12. evaluate multimodal embeddings/search only after canonical identity and relationships work.

No step should create a parallel source of truth.

---

## 28. Acceptance criteria

The architecture is acceptable when:

1. one real-world/media entity is not duplicated merely because multiple domains use it;
2. every visible media relationship has scope and provenance;
3. AI observations remain distinguishable from verified facts;
4. rights/privacy are enforced server-side;
5. original media remains recoverable;
6. derived metadata can be rebuilt;
7. a source update can invalidate stale derived relationships;
8. cross-tenant media access is denied;
9. media can support evidence without automatically proving an outcome;
10. Brain activation maps to observed events;
11. the owner can understand important connections without seeing the entire graph;
12. investor/public mode cannot expose private business content;
13. the same model is reusable for Dreamcatcher, TORO Business and future businesses without code forks;
14. no graph database is required merely for visualization;
15. Brain growth is measured by governed business understanding/outcomes, not node count.

---

## 29. Anti-patterns

Do not:

- treat media as dumb attachments;
- create one media copy per agent/domain/channel;
- promote model recognition directly to canonical identity;
- infer causal relationships from co-occurrence;
- use embeddings as authority;
- expose all media as Brain nodes;
- treat C2PA as proof that a business claim is true;
- show private media in investor/public mode;
- display fake neural activity;
- expose hidden chain-of-thought;
- create a "media brain" parallel to TORO Brain;
- create a graph DB only because the interface uses nodes and edges;
- count connections as intelligence;
- let a visual relationship bypass permissions;
- publish/modify media without the owning workflow and authority.

---

## 30. Product principles to add to TORO DNA

1. **Everything material should be connectable; not everything connected must be visible.**
2. **Media is first-class business information, not an attachment class.**
3. **One entity, many governed relationships.**
4. **Every important relationship should be explainable by provenance.**
5. **The Brain grows through verified relationships and outcomes, not storage volume.**
6. **AI can propose meaning; evidence and authority promote meaning.**
7. **Visual activity must reflect observed events.**
8. **Deep inside. Simple outside. Visible when it matters.**

---

## 31. Open questions for implementation planning

These should be resolved only after this spec is approved:

- Which current media registry/storage sources become the first identity/provenance adapter?
- What minimum media fields already exist in Supabase/Dropbox/website/media audits and can be reused?
- Should `BrainNodeKind.media` be added in the first Stage C contract revision or after Knowledge real-state projection?
- What is the first reserved evaluation set for media identity/relationship verification?
- Which rights/privacy states are already modeled versus needing an extension?
- What source-change event invalidates captions/embeddings/relationships?
- Which Dreamcatcher scenario gives the strongest end-to-end proof without introducing privacy risk?
- What information can safely appear in Presentation Mode for investors?

---

## 32. Decision requested

Approve, revise or reject this architecture before implementation planning.

Approval of this spec authorizes the next step only:

> create a detailed implementation plan that maps the design to current TORO branches, contracts, tests and rollout gates.

It does **not** authorize production schema changes, media ingestion, public publication, permission changes, tenant creation, merges or deployment.
