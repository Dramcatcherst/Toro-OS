# TORO Brain Multimodal Neural Fabric — Stage C Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect one authorized Dreamcatcher knowledge/media neighborhood to the real read-only TORO Visual Brain using the existing Identity/Context, Knowledge and media/provenance structures without creating a parallel source of truth.

**Architecture:** Reuse `resolveToroContext()` from the Phase 1/PR #42 integration path as the mandatory server-side identity/scope gate, reuse the PR #16 Knowledge reader patterns, and project existing `content.media_assets`, `content.media_assignments`, `integrations.media_file_manifest` and governed knowledge into the existing `BrainProjection` contract. Add only a thin read-only adapter layer that produces safe `BrainNode`/`BrainEdge` objects after authorization. Do not add a graph database, a new media store, a new permission engine or production writes.

**Tech Stack:** Next.js 16.3.6, React 19, TypeScript, Supabase/Postgres/RLS, Vitest, Testing Library, Vercel Preview, existing TORO Brain contracts.

**Spec:** `docs/superpowers/specs/2026-09-23-toro-brain-multimodal-neural-fabric-design.md`

## Global Constraints

- TORO Brain is the only visible product/brain.
- Execution base MUST already contain the canonical server-side `resolveToroContext()` contract or its approved replacement.
- Private real data MUST NOT be projected into Visual Brain before organization context and server-side permission filtering are canonical and tested.
- Reuse `operations.knowledge_items`, `content.media_assets`, `content.media_assignments`, `integrations.media_file_manifest` and current source-authority/RLS structures before creating any new persistence.
- No production DDL in this plan.
- No graph database.
- No new media ingestion pipeline.
- No public publication, media mutation, rights mutation, permission mutation, external messaging or writes to Kross/Alegra/Dropbox.
- Media observations/candidates MUST remain distinguishable from verified relationships.
- Media rights/public-safety state MUST be applied server-side before a URL or asset is returned.
- Do not send unrestricted `structured_content`, internal notes, source paths or private storage identifiers to the browser.
- A relationship does not grant authorization.
- A source hash proves byte identity/deduplication, not business truth.
- Synthetic Stage B remains available and clearly labeled; real Stage C is internal/read-only.
- Follow existing project hierarchy and PR merge train; do not create another TORO project identity for this work.

## Review Focus

1. **Cross-tenant request:** a user with valid Org A context requests a Dreamcatcher media/knowledge key — expected behavior is server-side denial/empty result, never client-side hiding.
2. **Public-looking asset with unresolved rights:** `public_visibility=true` but `rights_verified=false` or human review required — expected behavior is no public URL projection.
3. **AI/candidate relationship:** candidate subject/entity match exists but is not verified — expected behavior is candidate metadata only in authorized admin review, not a canonical Brain edge.
4. **Stale normalized knowledge projection:** source revision is newer than the projection source-as-of — expected behavior is `stale`/partial projection, never current/verified.
5. **Malformed or unexpected media type/source row:** expected behavior is fail-closed omission with partial/degraded projection rather than rendering unsafe arbitrary payload.

---

## File Structure

### Existing files to reuse

- `src/features/context/resolver.ts` — canonical server-side context resolution from PR #42 path; do not duplicate.
- `src/features/context/types.ts` — organization/personal context contract.
- `src/features/knowledge/server.ts` — PR #16 safe read-only Knowledge pattern.
- `src/features/knowledge/types.ts` — Knowledge metadata types.
- `src/lib/brain-contracts.ts` — canonical Brain node/edge/projection vocabulary.
- `src/app/brain/page.tsx` — Stage B synthetic UI.
- `src/lib/brain-fixtures.ts` — synthetic Stage B fixture; retain as fallback/demo.

### Files to create

- `src/features/brain/projections/types.ts` — internal projection inputs and safe media/knowledge DTOs.
- `src/features/brain/projections/media.ts` — media row parsing, rights/public-safety minimization and Brain media-node mapping.
- `src/features/brain/projections/knowledge.ts` — governed knowledge projection mapping.
- `src/features/brain/projections/dreamcatcher.ts` — compose a bounded Dreamcatcher real-state neighborhood.
- `src/features/brain/server.ts` — server-only authorized Stage C projection loader.
- `src/features/brain/projections/media.test.ts`
- `src/features/brain/projections/knowledge.test.ts`
- `src/features/brain/projections/dreamcatcher.test.ts`
- `src/features/brain/server.test.ts`

### Files to modify

- `src/lib/brain-contracts.ts` — add `media` node kind and minimal media-safe summary contract only.
- `src/app/brain/page.tsx` — choose real authorized Stage C projection when available; retain synthetic Stage B fallback/demo path.
- `src/app/brain/brain.module.css` — only if a semantic media-node state needs an existing-style-compatible presentation; no redesign in this plan.
- `docs/product/TORO_VISUAL_BRAIN_STAGE_A_CONTRACTS_V1.md` — add an implementation note referencing the now-proven media projection contract after tests pass.
- `docs/product/TORO_BRAIN_GENERAL_PLAN.md` — update Stage C status/evidence only after all acceptance checks pass; do not modify at task start.

---

### Task 1: Establish the integration-base identity gate

**Files:**
- Read/verify: `src/features/context/resolver.ts`
- Read/verify: `src/features/context/types.ts`
- Test: existing `src/features/context/resolver.test.ts`

**Interfaces:**
- Consumes: `resolveToroContext(request?: ToroContextRequest): Promise<ToroResolvedContext | null>`
- Produces: an execution-base gate proving organization context is available before Stage C code is added.

- [ ] **Step 1: Verify the integration branch contains the canonical context resolver**

Run:
```bash
test -f src/features/context/resolver.ts
grep -n "export const resolveToroContext" src/features/context/resolver.ts
grep -n "canUseOrganizationData" src/features/context/types.ts
```

Expected: all commands succeed and show the canonical resolver/type fields.

If they do not, STOP. Do not implement a replacement resolver in Visual Brain. Reconcile the existing PR #42/Phase 1 path first.

- [ ] **Step 2: Run the existing context resolver test suite**

Run:
```bash
npx vitest run src/features/context/resolver.test.ts src/features/context/legacy-session-adapter.test.ts
```

Expected: PASS with zero failed tests.

- [ ] **Step 3: Verify the test suite includes negative organization cases**

Run:
```bash
grep -nE "invalid|multiple|fail|den(y|ied)|organization" src/features/context/resolver.test.ts
```

Expected: tests demonstrate fail-closed behavior for invalid/unresolved organization context.

- [ ] **Step 4: Commit only if integration-base reconciliation required file movement/cherry-pick**

If no code changed, do not create an empty commit.

If approved existing context commits were brought onto the execution branch:
```bash
git add src/features/context
git commit -m "chore: align canonical TORO context resolver"
```

---

### Task 2: Extend the Brain contract with a minimal media-safe node type

**Files:**
- Modify: `src/lib/brain-contracts.ts`
- Test: create `src/features/brain/projections/media.test.ts`

**Interfaces:**
- Consumes: existing `BrainNode`, `BrainVerificationState`, `BrainFreshnessState`.
- Produces:
```ts
export type BrainMediaType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "diagram"
  | "other";

export type BrainMediaSummary = {
  mediaType: BrainMediaType;
  provenanceState: "verified" | "partial" | "unknown" | "conflicted";
  rightsState: "cleared" | "restricted" | "unknown" | "expired";
  aiDisclosure?: "original" | "edited" | "ai_modified" | "ai_generated" | "unknown";
};
```

- [ ] **Step 1: Write a failing type/behavior test for a media Brain node**

Create `src/features/brain/projections/media.test.ts` with:
```ts
import { describe, expect, it } from "vitest";

import type { BrainNode } from "@/lib/brain-contracts";

describe("Brain media contract", () => {
  it("supports a media node without requiring storage-private fields", () => {
    const node: BrainNode = {
      id: "media:room-25-hero",
      kind: "media",
      label: "Room 25 hero image",
      scopeRef: "org:dreamcatcher",
      status: "Ready",
      risk: "Low",
      verification: "verified",
      freshness: "current",
      sourceSystem: "content.media_assets",
      authoritySystem: "TORO Content",
      capabilities: {
        canOpen: true,
        canInspectEvidence: true,
        canPrepareAction: false,
        canExecute: false,
        canApprove: false,
        actionCeiling: "observe",
        approvalRequirement: "None",
      },
      media: {
        mediaType: "image",
        provenanceState: "verified",
        rightsState: "cleared",
        aiDisclosure: "original",
      },
    };

    expect(node.kind).toBe("media");
    expect(node.media?.rightsState).toBe("cleared");
    expect(JSON.stringify(node)).not.toContain("provider_path");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:
```bash
npx vitest run src/features/brain/projections/media.test.ts
```

Expected: FAIL because `"media"` and/or `node.media` are not yet part of the contract.

- [ ] **Step 3: Add the minimal contract**

Modify `src/lib/brain-contracts.ts`:

1. Add `"media"` to `BrainNodeKind`.
2. Add the exact `BrainMediaType` and `BrainMediaSummary` types above.
3. Add optional:
```ts
media?: BrainMediaSummary;
```
to `BrainNode`.

Do not add storage URLs, raw metadata, C2PA payloads, embeddings or rights documents to `BrainNode`.

- [ ] **Step 4: Run contract tests**

Run:
```bash
npx vitest run src/features/brain/projections/media.test.ts
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/brain-contracts.ts src/features/brain/projections/media.test.ts
git commit -m "feat: add media node contract to TORO Brain"
```

---

### Task 3: Build the safe media projection adapter over existing Supabase tables

**Files:**
- Create: `src/features/brain/projections/types.ts`
- Create: `src/features/brain/projections/media.ts`
- Modify/Test: `src/features/brain/projections/media.test.ts`

**Interfaces:**
- Consumes: rows selected from `content.media_assets` and `content.media_assignments`.
- Produces:
```ts
export type SafeMediaProjectionRow = {
  id: string;
  orgId: string;
  assetKey: string;
  assetType: string;
  title: string | null;
  publicUrl: string | null;
  subjectType: string | null;
  subjectKey: string | null;
  rightsStatus: string | null;
  rightsVerified: boolean;
  publicSafe: boolean;
  verifiedStatus: string;
  requiresHumanVerification: boolean;
  riskLevel: string;
  sourceSystem: string | null;
  lastVerified: string | null;
  nextReview: string | null;
  updatedAt: string;
};

export function projectMediaNode(
  row: SafeMediaProjectionRow,
  now: Date,
): BrainNode | null;
```

- [ ] **Step 1: Add failing tests for rights, tenant-safe output and malformed type**

Extend `media.test.ts`:
```ts
import { projectMediaNode } from "./media";

const base = {
  id: "00000000-0000-0000-0000-000000000101",
  orgId: "00000000-0000-0000-0000-000000000201",
  assetKey: "ROOM-25-HERO",
  assetType: "image",
  title: "Room 25 hero",
  publicUrl: "https://example.invalid/room25.jpg",
  subjectType: "room",
  subjectKey: "DC-ROOM-25",
  rightsStatus: "cleared",
  rightsVerified: true,
  publicSafe: true,
  verifiedStatus: "verified",
  requiresHumanVerification: false,
  riskLevel: "low",
  sourceSystem: "content.media_assets",
  lastVerified: "2026-09-22",
  nextReview: "2026-10-22",
  updatedAt: "2026-09-22T20:00:00Z",
} as const;

it("projects only minimized safe media metadata", () => {
  const node = projectMediaNode(base, new Date("2026-09-23T06:00:00Z"));
  expect(node?.kind).toBe("media");
  expect(node?.media?.rightsState).toBe("cleared");
  expect(JSON.stringify(node)).not.toMatch(/provider_path|source_path|internal_notes|raw_metadata/i);
});

it("does not expose a media node as open when rights are unresolved", () => {
  const node = projectMediaNode(
    { ...base, rightsVerified: false, rightsStatus: "unknown", requiresHumanVerification: true },
    new Date("2026-09-23T06:00:00Z"),
  );
  expect(node?.media?.rightsState).toBe("unknown");
  expect(node?.capabilities.canOpen).toBe(false);
});

it("fails closed on an unsupported media type", () => {
  expect(
    projectMediaNode({ ...base, assetType: "<script>" }, new Date("2026-09-23T06:00:00Z")),
  ).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:
```bash
npx vitest run src/features/brain/projections/media.test.ts
```

Expected: FAIL because `projectMediaNode` does not exist.

- [ ] **Step 3: Implement strict parsers and mapper**

Create `src/features/brain/projections/types.ts` with the exact DTO above.

Create `media.ts` with:
- explicit allowlist mapping `image|photo -> image`, `video -> video`, `audio -> audio`, `document|pdf -> document`, `diagram|floorplan|map -> diagram`;
- unsupported values return `null`;
- `canOpen=true` only when the URL is intentionally safe for this authorized projection AND rights are cleared for the use being exposed;
- `requiresHumanVerification=true` prevents treating verification as `verified`;
- freshness derives from `nextReview` / `lastVerified`, not `updatedAt` alone;
- never copy source paths, internal notes, raw metadata, provider file IDs or hashes into the client node.

Use explicit mapping functions; do not spread raw rows into `BrainNode`.

- [ ] **Step 4: Run tests and typecheck**

```bash
npx vitest run src/features/brain/projections/media.test.ts
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/brain/projections/types.ts src/features/brain/projections/media.ts src/features/brain/projections/media.test.ts
git commit -m "feat: project governed media into Brain nodes"
```

---

### Task 4: Build the governed Knowledge projection adapter

**Files:**
- Create: `src/features/brain/projections/knowledge.ts`
- Create: `src/features/brain/projections/knowledge.test.ts`

**Interfaces:**
- Consumes:
```ts
export type AuthorizedKnowledgeProjection = {
  id: string;
  orgId: string;
  knowledgeKey: string;
  title: string;
  visibility: string;
  verifiedStatus: string;
  riskLevel: string;
  requiresHumanVerification: boolean;
  lastVerified: string | null;
  nextReview: string | null;
  sourceSystem: string | null;
  sourceAsOf: string | null;
  projectionUpdatedAt: string | null;
  projectionStatus: string | null;
};
```
- Produces:
```ts
export function projectKnowledgeNode(
  row: AuthorizedKnowledgeProjection,
  now: Date,
): BrainNode;
```

- [ ] **Step 1: Write failing tests for R3 semantics**

Create tests:
```ts
it("marks a normalized projection stale when the source is newer", () => {
  const node = projectKnowledgeNode({
    id: "00000000-0000-0000-0000-000000000301",
    orgId: "00000000-0000-0000-0000-000000000201",
    knowledgeKey: "housekeeping_laundry_operating_manual_snapshot_2026_09_18_v1",
    title: "Housekeeping + Laundry",
    visibility: "internal",
    verifiedStatus: "verified",
    riskLevel: "high",
    requiresHumanVerification: true,
    lastVerified: "2026-09-18",
    nextReview: null,
    sourceSystem: "Notion/Supabase snapshot",
    sourceAsOf: "2026-09-19T07:02:14Z",
    projectionUpdatedAt: "2026-09-18T07:02:14Z",
    projectionStatus: "NORMALIZED_HISTORICAL_REFERENCE_NOT_OPERATIONAL_APPROVAL",
  }, new Date("2026-09-23T06:00:00Z"));

  expect(node.freshness).toBe("stale");
  expect(node.verification).not.toBe("verified");
});

it("does not translate historical reference into operational approval", () => {
  const node = projectKnowledgeNode(/* same row with current projection */);
  expect(node.summary).toMatch(/human review|historical|not operational/i);
  expect(node.capabilities.canExecute).toBe(false);
});
```

- [ ] **Step 2: Run tests and verify they fail**

```bash
npx vitest run src/features/brain/projections/knowledge.test.ts
```

Expected: FAIL because mapper does not exist.

- [ ] **Step 3: Implement Knowledge mapping**

Rules:
- map source verification and projection verification separately;
- `requiresHumanVerification` downgrades final node verification from fully verified;
- source date newer than projection date => `stale`;
- R3 `operational_approval=false` must never produce an executable/approved state;
- client DTO contains summary metadata only at this stage; do not return full `content_es` or unrestricted `structured_content`.

- [ ] **Step 4: Run tests and typecheck**

```bash
npx vitest run src/features/brain/projections/knowledge.test.ts
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/brain/projections/knowledge.ts src/features/brain/projections/knowledge.test.ts
git commit -m "feat: add governed Knowledge Brain projection"
```

---

### Task 5: Compose one bounded Dreamcatcher neural neighborhood

**Files:**
- Create: `src/features/brain/projections/dreamcatcher.ts`
- Create: `src/features/brain/projections/dreamcatcher.test.ts`

**Interfaces:**
- Consumes:
  - one authorized knowledge node;
  - 0..N safe media nodes;
  - verified `content.media_assignments` only;
  - existing room/asset identifiers already resolved by canonical tables.
- Produces:
```ts
export type DreamcatcherBrainSlice = {
  nodes: BrainNode[];
  edges: BrainEdge[];
  sources: BrainSourceSummary[];
  partial: boolean;
  degradedReason?: string;
};

export function composeDreamcatcherBrainSlice(input: {
  scopeRef: string;
  knowledge: BrainNode[];
  media: BrainNode[];
  assignments: SafeMediaAssignment[];
}): DreamcatcherBrainSlice;
```

- [ ] **Step 1: Write failing tests for verified vs candidate relationships**

```ts
it("creates a depicts edge only from a verified assignment", () => {
  const slice = composeDreamcatcherBrainSlice({
    scopeRef: "org:dreamcatcher",
    knowledge: [],
    media: [safeMediaNode],
    assignments: [{
      id: "assignment:1",
      assetId: safeMediaNode.id,
      targetType: "room",
      targetKey: "DC-ROOM-25",
      mediaRole: "hero",
      verifiedStatus: "verified",
      requiresHumanVerification: false,
    }],
  });

  expect(slice.edges).toContainEqual(
    expect.objectContaining({ relation: "connected_to", target: "room:DC-ROOM-25" }),
  );
});

it("does not promote a candidate/intake match to a canonical edge", () => {
  const slice = composeDreamcatcherBrainSlice({
    scopeRef: "org:dreamcatcher",
    knowledge: [],
    media: [safeMediaNode],
    assignments: [{
      id: "assignment:2",
      assetId: safeMediaNode.id,
      targetType: "room",
      targetKey: "DC-ROOM-25",
      mediaRole: "candidate",
      verifiedStatus: "needs_verification",
      requiresHumanVerification: true,
    }],
  });

  expect(slice.edges).toEqual([]);
  expect(slice.partial).toBe(true);
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/features/brain/projections/dreamcatcher.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement bounded composer**

Rules:
- no generic traversal;
- only allowed target types for first slice: `room`, `knowledge`, `asset`;
- edges created only from canonical/verified assignments;
- candidate matches remain omitted from canonical edges and may set `partial=true`;
- dedupe nodes/edges by canonical ID;
- deterministic sort for stable tests/rendering.

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/features/brain/projections/dreamcatcher.test.ts
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/brain/projections/dreamcatcher.ts src/features/brain/projections/dreamcatcher.test.ts
git commit -m "feat: compose Dreamcatcher multimodal Brain slice"
```

---

### Task 6: Add the authorized server-side Stage C loader

**Files:**
- Create: `src/features/brain/server.ts`
- Create: `src/features/brain/server.test.ts`

**Interfaces:**
- Consumes: `resolveToroContext({ mode: "organization", orgId? })`.
- Produces:
```ts
export async function loadAuthorizedBrainProjection(
  request?: ToroContextRequest,
): Promise<BrainProjection | null>;
```

- [ ] **Step 1: Write failing authorization tests**

Required cases:
1. unauthenticated => no query;
2. personal context => no Dreamcatcher organization data;
3. unresolved/multiple org => no real projection;
4. valid organization context but different `orgId` => no cross-tenant projection;
5. valid Dreamcatcher org => queries include `.eq("org_id", context.orgId)`;
6. query failure => partial/degraded or fail-closed according to domain, never raw error payload/client leak.

Use mocked Supabase chains and mock `resolveToroContext`.

- [ ] **Step 2: Verify failures**

```bash
npx vitest run src/features/brain/server.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement the loader**

Server query allowlist:

From `operations.knowledge_items` select only:
```text
id,org_id,knowledge_key,title,visibility,verified_status,risk_level,
requires_human_verification,last_verified,next_review,source_system,
structured_content,updated_at
```

Immediately parse/minimize `structured_content` server-side to the specific normalized projection keys needed for freshness/status. Do not pass the raw JSON to the returned `BrainProjection`.

From `content.media_assets` select only:
```text
id,org_id,asset_key,asset_type,title,public_url,subject_type,subject_key,
rights_status,rights_verified,public_safe,verified_status,
requires_human_verification,risk_level,source_system,last_verified,next_review,updated_at
```

From `content.media_assignments` select only:
```text
id,org_id,asset_id,target_type,target_key,media_role,active,
verified_status,requires_human_verification,updated_at
```

Every query MUST include `.eq("org_id", context.orgId)` and appropriate active filters.

Do not read `integrations.media_intake_archive.raw_metadata` into the user projection in v1.

- [ ] **Step 4: Add the cross-tenant Review Focus test**

Test a valid context for Org A and a requested Dreamcatcher key. The server must either scope to Org A or return no Dreamcatcher object; it must never trust the key alone.

- [ ] **Step 5: Run tests/typecheck**

```bash
npx vitest run src/features/brain/server.test.ts src/features/brain/projections/*.test.ts
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/brain/server.ts src/features/brain/server.test.ts
git commit -m "feat: load authorized real Brain projection"
```

---

### Task 7: Wire Stage C to the existing Brain UI without removing Stage B

**Files:**
- Modify: `src/app/brain/page.tsx`
- Test: add `src/app/brain/page.test.tsx` if no existing page-level test; otherwise use current Brain component tests.

**Interfaces:**
- Consumes: `loadAuthorizedBrainProjection()`.
- Produces: real internal read-only mode when authorized, synthetic fallback/demo only when explicitly appropriate.

- [ ] **Step 1: Write the failing UI behavior test**

Test:
- authorized real projection displays an explicit `real · read only` marker;
- synthetic fixture displays `synthetic`;
- real mode never displays synthetic cash/revenue story;
- empty/degraded real projection shows an explanatory state rather than silently falling back to fake real-looking data.

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/app/brain/page.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Refactor `BrainPage` to consume a projection prop/internal loader**

Keep Stage B fixture in `brain-fixtures.ts`.

Do not mutate `visualBrainDemo` to contain real data.

Real and synthetic states must be impossible to confuse visually.

- [ ] **Step 4: Add a media icon and accessible label**

Add `media` to `nodeIcons` using an existing Lucide icon such as `Image` or `FileImage`.

Accessible node labels must include verification and freshness, not rely on line/color only.

- [ ] **Step 5: Run tests/build**

```bash
npx vitest run src/app/brain/page.test.tsx src/features/brain/**/*.test.ts
npm run lint
npm run build
```

Expected: all PASS / build exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/brain src/features/brain
git commit -m "feat: render authorized multimodal Brain projection"
```

---

### Task 8: Add source-change invalidation behavior for normalized knowledge

**Files:**
- Modify: `src/features/brain/projections/knowledge.ts`
- Modify: `src/features/brain/projections/knowledge.test.ts`

**Interfaces:**
- Consumes: source-as-of and normalized projection creation/update timestamps.
- Produces: explicit stale/partial Brain state.

- [ ] **Step 1: Add failing invalidation tests**

Cases:
- source newer than projection => stale;
- projection has no source-as-of => unknown/partial;
- metadata-only `updated_at` on the knowledge row does not automatically mean source content was re-verified;
- `last_verified` remains the truth for verification freshness when no stronger source timestamp exists.

- [ ] **Step 2: Run tests and see failure**

```bash
npx vitest run src/features/brain/projections/knowledge.test.ts
```

- [ ] **Step 3: Implement explicit freshness resolver**

Create an internal function:
```ts
export function resolveKnowledgeProjectionFreshness(input: {
  sourceAsOf: string | null;
  projectionAsOf: string | null;
  lastVerified: string | null;
  nextReview: string | null;
  now: Date;
}): BrainFreshnessState;
```

Do not use row `updated_at` as proof of source re-verification.

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/features/brain/projections/knowledge.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/brain/projections/knowledge.ts src/features/brain/projections/knowledge.test.ts
git commit -m "feat: invalidate stale Brain knowledge projections"
```

---

### Task 9: Add a reserved evaluation fixture for media/knowledge semantics

**Files:**
- Create: `src/features/brain/evals/multimodal-stage-c.fixture.ts`
- Create: `src/features/brain/evals/multimodal-stage-c.test.ts`

**Interfaces:**
- Produces a fixed test set that is not the same examples used to author the initial mappers.

- [ ] **Step 1: Create six reserved cases**

Include exactly these semantic classes using fictional/synthetic IDs and content:
1. verified image assignment;
2. unresolved rights;
3. stale knowledge projection;
4. negative instruction ("do not use X");
5. candidate entity match requiring human verification;
6. wrong-tenant asset key.

Do not copy private guest/employee data.

- [ ] **Step 2: Write assertions**

Assertions:
- verified assignment produces edge;
- unresolved rights cannot open;
- stale source marks stale;
- negative instruction remains represented as non-approved/blocked semantics;
- candidate produces no canonical edge;
- wrong tenant produces no node.

- [ ] **Step 3: Run reserved eval**

```bash
npx vitest run src/features/brain/evals/multimodal-stage-c.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/brain/evals
git commit -m "test: add reserved multimodal Brain evaluation"
```

---

### Task 10: Verify current Supabase security assumptions without DDL

**Files:**
- No production code changes unless a discrepancy requires the plan to stop.
- Evidence note may be added to docs after checks pass.

**Interfaces:**
- Validates existing RLS/policy assumptions for `content.media_assets`, `content.media_assignments`, and knowledge access.

- [ ] **Step 1: Run current Supabase advisor checks**

Use the connected Supabase advisor tool for security.

Expected: collect current findings; this task does not claim to resolve unrelated existing advisor debt.

- [ ] **Step 2: Verify media policies remain org-scoped**

Read policies for:
- `content.media_assets`;
- `content.media_assignments`;
- `integrations.media_intake_archive`.

Expected: internal authenticated access is constrained by current org-role predicate and public access has explicit publication/verification/rights gates.

- [ ] **Step 3: Verify Stage C server queries add explicit `org_id` filtering even when RLS exists**

Run the server tests from Task 6.

Expected: tests assert `.eq("org_id", context.orgId)`.

Defense in depth is required; do not rely solely on RLS.

- [ ] **Step 4: Stop on auth-policy mismatch**

If the final membership/RLS migration changes `private.has_org_role` semantics, update the Stage C tests to the final canonical contract before merge. Do not patch around it with service-role access or SECURITY DEFINER.

---

### Task 11: Preview and visually verify the real read-only Brain slice

**Files:**
- No new product behavior beyond Tasks 1–10.
- Optional evidence doc: `docs/evidence/2026-09-23-multimodal-stage-c-preview.md`

**Interfaces:**
- Consumes fully tested branch.
- Produces preview evidence only.

- [ ] **Step 1: Run the complete local verification**

```bash
npx vitest run src/features/context src/features/knowledge src/features/brain src/app/brain
npm run lint
npm run build
npm audit
```

Expected:
- zero test failures;
- lint exit 0;
- build exit 0;
- audit reports zero known vulnerabilities or any exception is explicitly blocked from merge.

- [ ] **Step 2: Deploy a Vercel preview through the existing canonical project path**

Do not repoint production or legacy projects.

Expected: preview READY.

- [ ] **Step 3: Verify in a browser**

Check:
- real/synthetic label;
- no private raw paths/notes;
- media node readable;
- evidence/freshness states visible;
- no overlap/clipping on desktop;
- usable list fallback/mobile;
- unauthorized session cannot see real projection;
- degraded state does not silently show synthetic data as real.

- [ ] **Step 4: Record evidence**

Create `docs/evidence/2026-09-23-multimodal-stage-c-preview.md` containing:
- branch/commit;
- test commands/results;
- preview deployment reference;
- browser viewport(s);
- observed pass/fail;
- known limitations;
- rollback path.

- [ ] **Step 5: Commit evidence**

```bash
git add docs/evidence/2026-09-23-multimodal-stage-c-preview.md
git commit -m "docs: record multimodal Stage C verification"
```

---

### Task 12: Update canonical status only after verified exit criteria

**Files:**
- Modify only after Tasks 1–11 pass:
  - `docs/product/TORO_BRAIN_GENERAL_PLAN.md`
  - `docs/product/TORO_VISUAL_BRAIN_ARCHITECTURE_V1.md`
  - `docs/product/TORO_VISUAL_BRAIN_STAGE_A_CONTRACTS_V1.md`
  - `toro-context.yaml` only if a canonical spec pointer/status materially changes.

**Interfaces:**
- Consumes: verified implementation/evidence.
- Produces: current-state documentation that matches actual code/runtime.

- [ ] **Step 1: Update Stage C wording narrowly**

Do not claim Stage C complete unless:
- context/identity is canonical on the integration path;
- cross-tenant negative tests pass;
- real Dreamcatcher read-only projection renders;
- media rights/freshness semantics are tested;
- preview verification is recorded.

If only the first multimodal slice is complete, document:
```text
Stage C — PARTIAL: first authorized multimodal read-only slice verified; broader real-state domains remain in progress.
```

- [ ] **Step 2: Register the approved multimodal spec**

Add the spec path to canonical product-spec references only after owner approval and implementation evidence justify making it CURRENT rather than proposed.

- [ ] **Step 3: Run doc/contract consistency search**

```bash
grep -R "Stage C" docs/product/TORO_BRAIN_GENERAL_PLAN.md docs/product/TORO_VISUAL_BRAIN_*
grep -R "Multimodal Neural Fabric" docs/product docs/superpowers/specs toro-context.yaml
```

Expected: no contradictory status.

- [ ] **Step 4: Commit**

```bash
git add docs/product toro-context.yaml
git commit -m "docs: record verified multimodal Stage C slice"
```

---

## Follow-up Plans — intentionally separate

Do not implement these as part of this Stage C foundation plan.

### Plan B — Relationship verification + media provenance
Scope:
- candidate relation workflow;
- rights/consent provenance;
- C2PA parser/evidence adapter where present;
- source-change invalidation for derived captions/embeddings;
- dedupe/identity across original stores;
- no publication writes.

### Plan C — Event Spine + Brain Evolution
Scope:
- normalized `media.discovered`, `media.indexed`, `relation.proposed`, `relation.verified`, `relation.invalidated`;
- correlation IDs;
- replay;
- Brain Evolution checkpoints;
- no hidden chain-of-thought.

### Plan D — Customer / investor experience
Scope:
- My Business Brain;
- Watch TORO Learn;
- Watch TORO Work;
- Brain Evolution;
- Presentation Mode;
- synthetic/public-safe demo fixtures;
- conversion analytics;
- no Dreamcatcher private data.

---

## Exit Criteria for This Plan

This plan is complete only when:

1. one authorized internal Dreamcatcher user can load a real read-only Brain projection through the canonical context resolver;
2. one real governed Knowledge node and one real safe Media node can appear;
3. at least one verified media relationship appears without promoting a candidate relationship;
4. unresolved rights prevent media opening/public URL exposure;
5. stale normalized Knowledge is visibly stale/partial;
6. wrong-tenant requests return no private node;
7. raw `structured_content`, internal notes, provider paths and private file IDs never reach the client projection;
8. Stage B synthetic demo remains clearly separated;
9. tests/lint/build/security checks pass;
10. preview/browser evidence exists;
11. no production write, DDL, media mutation or permission bypass occurred;
12. canonical docs describe exactly what was verified and no more.
