# Portal Expediente First Lot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved compact casebook demonstration inside the existing private Portal, with real casebook reads closed.

**Architecture:** One client component in Reportes, reached from Dinero through the existing tab controller. Pure local filters and selection operate only on explicitly fictional fixtures; no data props, server reader, API, persistence, export, or new access grant.

**Tech Stack:** Existing Next 16, React 19, TypeScript, CSS modules and Vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-24-private-casebook-portal-integration-design.md` (approved by Mauricio on 24 October 2026). The first lot is the synthetic UI only; real-reader and authenticated acceptance remain later gates.

## Global Constraints

- Preserve the eight Portal tabs and modules 00–11, existing identity and context gates.
- Text at least 12px; interactive targets at least 44px; usable at 320/390px and desktop.
- No private identifiers, bank references, source payloads, custody documents or report copies in the repository, public assets or client bundle.
- Unknown differs from zero; partial differs from reconciled; never aggregate mixed currencies.
- Existing Plan General and Portal remain the sole product and governance system.
- Isolated task checkout from main `2da8a7217dcd263758f22230f647f10e19c35213`; preserve concurrent changes.

## Review Focus

- Accents, empty results and combined filters must not strand selection on a hidden record.
- A context change must discard local casebook state through the existing workspace identity key.
- A hidden tab is still serialized: every fixture and detail must be safe for client delivery.
- Mobile filters and long text must not cause page-wide horizontal overflow; selection must have a clear return path.
- Download/real-reader status must be honest, with no fake action or inferred permission.

## Task 1: Local state and synthetic contract

**Files:** Create `src/features/portal/casebook-model.ts`, `casebook-demo.ts`, `casebook-model.test.ts`.

**Interfaces:** `CasebookRecord`, `CasebookState`, `createCasebookState()`, `casebookReducer(state, action)`, `filterCasebookRecords(records, state)`, `selectedCasebookRecord(records, state)`. Fixtures use `demo-*` keys and generic invented labels only.

- [ ] Write tests for combined category/entity/period/status filters, accent-insensitive search, empty/cleared search, hidden selection fallback, reset, immutable state, and null versus zero amount labels.
- [ ] Run the targeted test and record RED before implementing.
- [ ] Implement the minimal pure model and fictional fixtures; no real-data extension switch.
- [ ] Run the model test GREEN and commit the coherent model.

## Task 2: Compact view inside existing Portal

**Files:** Create `src/features/portal/portal-casebook.tsx`, `portal-casebook.module.css`, `portal-casebook.test.tsx`; modify `portal-workspace.tsx`, `src/app/portal/page.test.tsx`.

**Interfaces:** `PortalCasebook()` accepts no props. Existing `openTab("reports")` handles the Dinero shortcut. Component stays mounted between tabs, while the existing per-user/org workspace key resets context.

- [ ] Add failing SSR tests for the explicit fictional/closed-read labels, physical and legal entity coverage, unique control IDs, safe text escaping and no export/original links. Extend anonymous/inactive-context tests to exclude the view.
- [ ] Implement a compact heading/filter row, category buttons, result list plus contextual detail, mobile selection/return, source/next-action disclosures and explicit unavailable originals/export text.
- [ ] Run focused model, component and Portal guard tests; then existing hotel-tools and portal-auth checks.
- [ ] Verify keyboard selection, filter reset, tab-state preservation, no empty-result stale detail, desktop/mobile overflow and 44px controls through a synthetic component harness outside production routes.
- [ ] Run TypeScript, lint and build. Commit the coherent UI.

## Task 3: Review and canonical closeout

**Files:** This plan, existing `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, private canonical checkpoint and synchronized report/workbook metadata.

- [ ] Obtain a fresh code/privacy review; repair findings and repeat affected checks only.
- [ ] Record exact SHA, synthetic QA scope, closed real-reader gate and rollback. Open one feature PR; attach it to this chat. Do not claim hosted/private acceptance from local tests.
- [ ] Update the existing checkpoint, report/workbook status, native TORO record, Dropbox version and same heartbeat prompt with verified receipts. Preserve financial evidence and pending bank-document search.
- [ ] Promote only if the existing exact-SHA CI, preview/auth isolation and rollback gates pass; otherwise leave the reviewable candidate and one precise next action.

## Execution and rollback

Mauricio explicitly approved this design and first lot, so execute in this session without repeating the approval. One implementation writer, bounded independent review. The task clone supplies isolation because existing local directories lacked usable Git metadata. No parallel application or database is created. Rollback is a revert of the feature commit; no data migration is involved.
