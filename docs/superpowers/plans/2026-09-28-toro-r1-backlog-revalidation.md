# TORO R1-A Backlog Revalidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revalidate the 65 currently open TORO tasks marked `needs_revalidation=true`, reduce stale/duplicate active work without deleting history, and leave every surviving task correctly scoped and actionable.

**Architecture:** Keep `operations.tasks` as the only canonical task universe. Build a versioned, non-sensitive review manifest from a read-only snapshot, validate it locally, review tasks in risk/module batches, then apply guarded Supabase updates that require the original `updated_at` and `needs_revalidation=true` state to still match. Every mutation receives an explicit `public.audit_logs` receipt; no new task table or parallel project system is created.

**Tech Stack:** Supabase PostgreSQL, TORO GitHub repository, Node.js validation script/tests, JSON evidence manifest, SQL transactions, GitHub PR workflow.

**Spec:** `docs/superpowers/specs/2026-09-28-toro-consolidation-r1-design.md`

## Global Constraints

- Canonical task source remains `operations.tasks`.
- No bulk “mark reviewed” operation.
- Do not delete task rows.
- A changed task must be skipped if its `updated_at` no longer matches the reviewed snapshot.
- Preserve `migration_classification` as provenance unless the existing value is factually wrong and the correction is separately evidenced.
- Do not infer owner, completion, payment, field verification, deployment, legal state, or external execution.
- `MERGE`, `CLOSE`, and `HOLD` preserve history by archiving/deactivating rather than deleting.
- Every mutation inserts a corresponding `public.audit_logs` row with request ID `TORO-R1-A-20260928`.
- Do not modify production from a generated manifest until the manifest passes validation and the relevant batch has been reviewed.

## Review Focus

1. **Task changed after snapshot:** expected behavior is skip/fail that task, never overwrite concurrent work.
2. **MERGE target missing or archived:** expected behavior is reject the manifest entry.
3. **Physical/external task has no current evidence:** expected behavior is KEEP/BLOCKED or HOLD, never CLOSE as completed.
4. **Historical P2/incubator item still useful but not current:** expected behavior is HOLD/archive, not leave it inflating active NOW/NEXT work.
5. **Task already completed by verified evidence:** expected behavior is CLOSE with an evidence reference and audit receipt, not delete.

---

### Task 1: Create a deterministic 65-task review snapshot

**Files:**
- Create: `supabase/drafts/20260928_toro_r1_task_revalidation_inventory.sql`
- Create: `data/governance/toro-r1-task-revalidation-20260928.json`
- Create: `docs/evidence/TORO_R1_BACKLOG_REVALIDATION_20260928.md`

**Interfaces:**
- Consumes: `operations.tasks`, `operations.projects`.
- Produces: one immutable review snapshot keyed by `task_key`.

- [ ] **Step 1: Write the inventory SQL**

Return exactly the fields needed for review:
- task UUID;
- `task_key`;
- task name;
- project key/name;
- canonical module;
- status;
- priority;
- area;
- owner/assignee;
- source system/table/record;
- migration classification;
- blocking reason;
- description;
- `updated_at`;
- `needs_revalidation`.

Filter:
`active=true AND needs_revalidation=true AND status NOT IN ('done','completed')`.

- [ ] **Step 2: Run read-only inventory against production**

Expected baseline from this audit: 65 rows. If count differs, record the delta and use the new count; do not force the historical number.

- [ ] **Step 3: Write JSON manifest entries**

Each entry schema:

```ts
type RevalidationEntry = {
  task_id: string;
  task_key: string;
  observed_updated_at: string;
  canonical_module_key: string;
  current_status: string;
  current_priority: string | null;
  migration_classification: string;
  disposition: "KEEP" | "MERGE" | "CLOSE" | "HOLD" | "REWRITE" | null;
  merge_target_task_key: string | null;
  close_status: "done" | "archived" | null;
  proposed_status: "planned" | "blocked" | "in_progress" | "done" | "archived" | null;
  proposed_priority: string | null;
  proposed_task_name: string | null;
  proposed_description: string | null;
  proposed_blocking_reason: string | null;
  reason: string | null;
  evidence_ref: string | null;
};
```

At snapshot creation all disposition/proposed fields are `null`.

- [ ] **Step 4: Write baseline evidence summary**

Include module counts already observed:
- critical_hotel_operations 17;
- revenue_booking_stack 15;
- toro_executive_control 15;
- dreamcatcher_website 7;
- business_truth_bible 6;
- finance_controls 5.

Also record status split:
- planned 45;
- blocked 18;
- in_progress 2.

- [ ] **Step 5: Commit**

`docs: freeze TORO R1 backlog revalidation snapshot`

---

### Task 2: Add a strict manifest validator

**Files:**
- Create: `scripts/task-revalidation-validator.mjs`
- Create: `tests/task-revalidation-validator.test.mjs`
- Modify: `package.json` to add `test:task-revalidation`.

**Interfaces:**
- Consumes: `data/governance/toro-r1-task-revalidation-20260928.json`.
- Produces: non-zero exit when the manifest is incomplete, internally inconsistent, stale by construction, or unsafe.

- [ ] **Step 1: Write failing tests**

Test cases:
- duplicate `task_key` rejected;
- null disposition rejected in “ready” mode;
- MERGE without `merge_target_task_key` rejected;
- self-merge rejected;
- CLOSE without `close_status` and evidence/reason rejected;
- HOLD must target `archived`;
- REWRITE requires at least one material proposed field plus reason;
- KEEP cannot silently alter task fields;
- missing `observed_updated_at` rejected;
- `task_id` and task key required.

- [ ] **Step 2: Run**

`node --test tests/task-revalidation-validator.test.mjs`

Expected: FAIL before validator exists.

- [ ] **Step 3: Implement validator**

CLI:
`node scripts/task-revalidation-validator.mjs --file data/governance/toro-r1-task-revalidation-20260928.json --mode snapshot|ready`

`snapshot` accepts null dispositions; `ready` requires every entry resolved.

- [ ] **Step 4: Run tests and snapshot validation**

`node --test tests/task-revalidation-validator.test.mjs`
`node scripts/task-revalidation-validator.mjs --file data/governance/toro-r1-task-revalidation-20260928.json --mode snapshot`

Expected: PASS.

- [ ] **Step 5: Commit**

`test: validate TORO task revalidation manifests`

---

### Task 3: Revalidate P0/P1 review and the two in-progress tasks first

**Files:**
- Modify: `data/governance/toro-r1-task-revalidation-20260928.json`
- Modify: `docs/evidence/TORO_R1_BACKLOG_REVALIDATION_20260928.md`

**Interfaces:**
- Consumes: current source evidence for each selected task.
- Produces: reviewed dispositions for the highest-risk cohort.

- [ ] **Step 1: Select first cohort**

Include:
- all `p0_review_migrated_2026_09_19`;
- all `p1_review_migrated_2026_09_19`;
- all current `in_progress` tasks with `needs_revalidation=true`.

- [ ] **Step 2: For each task, resolve one disposition**

Rules:
- verified still-current outcome -> KEEP;
- duplicate objective -> MERGE to exact canonical task;
- verified completed/obsolete -> CLOSE;
- valid but intentionally not active -> HOLD -> `archived`;
- objective valid but task definition stale -> REWRITE.

Do not use “it looks old” as evidence.

- [ ] **Step 3: Record evidence_ref and reason for every entry**

- [ ] **Step 4: Run validator in partial-review mode by filtering this cohort**

Use the validator library in tests or a temporary filtered file; do not mark the whole manifest ready yet.

- [ ] **Step 5: Commit**

`governance: review TORO R1 P0 P1 backlog cohort`

---

### Task 4: Revalidate current critical/high canonical and additive work

**Files:**
- Modify: `data/governance/toro-r1-task-revalidation-20260928.json`
- Modify: `docs/evidence/TORO_R1_BACKLOG_REVALIDATION_20260928.md`

**Interfaces:**
- Consumes: Task 3 manifest state plus current source systems.
- Produces: dispositions for critical/high tasks not covered by the migrated review cohort.

- [ ] **Step 1: Review `canonical`, `canonical_additive`, `canonical_created`, and `review` items with critical/high priority**

- [ ] **Step 2: Re-check blockers against current evidence**

Examples:
- Kross access/freshness remains BLOCKED unless current authenticated evidence exists;
- physical maintenance/safety remains BLOCKED until dated field evidence exists;
- Vercel preview does not equal production;
- owner-reported completion remains REWRITE/KEEP until closure evidence is complete.

- [ ] **Step 3: Resolve every selected entry and run cohort validation**

- [ ] **Step 4: Commit**

`governance: review current critical TORO backlog`

---

### Task 5: Revalidate P1/P2 NEXT and incubator history

**Files:**
- Modify: `data/governance/toro-r1-task-revalidation-20260928.json`
- Modify: `docs/evidence/TORO_R1_BACKLOG_REVALIDATION_20260928.md`

**Interfaces:**
- Consumes: remaining unresolved manifest entries.
- Produces: final disposition for all historical NEXT/incubator tasks.

- [ ] **Step 1: Review remaining `p1_next_migrated_2026_09_19` entries**

- [ ] **Step 2: Review all 20 `p2_next_migrated_2026_09_19` entries**

Default is not KEEP. KEEP requires a current objective and current next action.

- [ ] **Step 3: Review `incubator_migrated_2026_09_19` entries**

Unless a current trigger exists, disposition = HOLD with target `archived`.

- [ ] **Step 4: Resolve any remaining entries**

- [ ] **Step 5: Run full ready validation**

`npm run test:task-revalidation`
`node scripts/task-revalidation-validator.mjs --file data/governance/toro-r1-task-revalidation-20260928.json --mode ready`

Expected: PASS with zero null dispositions.

- [ ] **Step 6: Commit**

`governance: complete TORO R1 backlog dispositions`

---

### Task 6: Generate guarded apply SQL from the approved manifest

**Files:**
- Create: `scripts/generate-task-revalidation-sql.mjs`
- Create: `tests/generate-task-revalidation-sql.test.mjs`
- Create generated output: `supabase/drafts/20260928_toro_r1_task_revalidation_apply.sql`
- Create generated recovery output: `supabase/drafts/20260928_toro_r1_task_revalidation_recovery.sql`

**Interfaces:**
- Consumes: ready manifest from Task 5.
- Produces: deterministic SQL with stale-write guards and matching recovery statements.

- [ ] **Step 1: Write failing generator tests**

Assertions:
- every UPDATE targets both `id/task_key` and exact `observed_updated_at`;
- every UPDATE requires `needs_revalidation=true`;
- zero-row update raises/records stale conflict rather than continuing silently;
- KEEP only clears `needs_revalidation`;
- MERGE archives/deactivates source and names exact target in `completion_notes`;
- CLOSE uses reviewed `done` or `archived`;
- HOLD sets `status='archived'`, `active=false`;
- REWRITE changes only fields named in manifest and clears `needs_revalidation`;
- each successful task update inserts one `public.audit_logs` row with `request_id='TORO-R1-A-20260928'`;
- recovery SQL restores the captured pre-R1 fields only when the current row still matches the R1-applied state.

- [ ] **Step 2: Implement generator**

No database connection. Pure JSON -> SQL generation.

- [ ] **Step 3: Generate apply/recovery SQL**

- [ ] **Step 4: Static review generated SQL**

Reject:
- `DELETE`;
- updates without stale guards;
- task keys not in manifest;
- changes to `migration_classification` unless explicitly approved;
- audit inserts missing request ID.

- [ ] **Step 5: Run**

`node --test tests/generate-task-revalidation-sql.test.mjs`
`npm run test:task-revalidation`

Expected: PASS.

- [ ] **Step 6: Commit**

`build: generate guarded TORO R1 backlog reconciliation SQL`

---

### Task 7: Dry-run the apply SQL against a transaction and reconcile counts

**Files:**
- Modify: `docs/evidence/TORO_R1_BACKLOG_REVALIDATION_20260928.md`

**Interfaces:**
- Consumes: generated apply SQL.
- Produces: rollback-only evidence showing expected row changes and count deltas.

- [ ] **Step 1: Execute the apply SQL inside `BEGIN ... ROLLBACK` against production**

No committed write.

- [ ] **Step 2: Check invariants inside the transaction**

Expected:
- exactly the reviewed manifest rows are touched;
- zero stale-guard conflicts;
- zero duplicate task keys;
- zero orphan `project_id`;
- no new project/module created;
- audit rows equal successful task updates;
- `needs_revalidation=true` count for the reviewed set becomes zero inside transaction.

- [ ] **Step 3: Calculate projected portfolio counts**

Record before/after:
- total active open;
- active open by module;
- planned/blocked/in_progress;
- archived/done;
- needs_revalidation.

Do not set a target open-task count in advance; report the result from reviewed dispositions.

- [ ] **Step 4: Roll back and verify production unchanged**

- [ ] **Step 5: Commit dry-run evidence**

`docs: record TORO R1 backlog dry-run reconciliation`

---

### Task 8: Apply the reviewed backlog reconciliation in controlled module batches

**Files:**
- Modify: `docs/evidence/TORO_R1_BACKLOG_REVALIDATION_20260928.md`
- Update after verified closeout: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`

**Interfaces:**
- Consumes: approved ready manifest, dry-run evidence, generated SQL.
- Produces: canonical task state with zero unresolved R1 revalidation flags for the reviewed snapshot.

- [ ] **Step 1: Split apply SQL into module batches**

Order:
1. `toro_executive_control`;
2. `business_truth_bible`;
3. `critical_hotel_operations`;
4. `revenue_booking_stack`;
5. `dreamcatcher_website`;
6. `finance_controls`.

- [ ] **Step 2: Before each batch, refresh touched rows**

If any `updated_at` differs from manifest, stop that row and return it to review. Do not regenerate around the conflict automatically.

- [ ] **Step 3: Apply one batch transaction**

- [ ] **Step 4: Verify batch immediately**

Check:
- expected number updated;
- audit receipts inserted;
- no source row deleted;
- merge targets still active/current;
- no open task lost without CLOSE/MERGE/HOLD disposition.

- [ ] **Step 5: Continue only after the previous batch reconciles**

- [ ] **Step 6: Final production query**

Expected for the original reviewed snapshot:
- zero rows still `needs_revalidation=true` unless they were explicitly skipped due to concurrent change; skipped rows must be listed as unresolved rather than silently counted complete.

- [ ] **Step 7: Update Plan General with verified aggregate outcome**

Only summary/counts and major portfolio changes belong in the Plan General. Per-task history remains in Supabase/audit/evidence.

- [ ] **Step 8: Commit closeout**

`docs: close TORO R1 backlog revalidation`

