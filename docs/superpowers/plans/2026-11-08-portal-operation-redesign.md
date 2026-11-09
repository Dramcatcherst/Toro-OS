# Portal operation redesign implementation plan

> For agentic workers: execute inline with the existing single code writer; root reviews and owns QA/deployment. Track test results and rulings here. No production writes.

**Goal:** make the existing Portal's real bounded work review discoverable and useful.
**Architecture:** current authenticated server reader and scope gates feed a client explorer of up to200 eligible tasks, paginated12. Existing mounted utility panels use URL-backed four-destination navigation; no transactional integration is added.
**Tech Stack:** locked Next16.3.8, React19.2.4, TypeScript, CSS Modules, Vitest; no new dependency.
**Spec:** `docs/superpowers/specs/2026-11-08-portal-operation-redesign-design.md`.

## Global constraints

Same Portal; exact existing roles/scope/RPC; occupancy:null; no SQL/flags/writer/integration/scheduler;12px/44px/320px; historical URLs and mounted drafts preserved. Copy omits free text and personal names. Source time and read time remain separate.

## Review focus

Search on a later page; missing dates/owners; retained filters and cash drafts after back/forward; old critical records shown neutrally; clipboard rejection and partial-source limits. Authenticated browser behavior remains an independent acceptance gate.

## Task1: bounded task explorer

Files: hotel-operations.ts, hotel-task-explorer.ts/tests, hotel-operations-panel.tsx/tests and its CSS.
Interfaces: `projectHotelTasks` returns all eligible rows in the existing200-row batch; `selectHotelTasks` returns matches/page bounds; reducer resets pagination on criteria changes; `buildHotelTaskSummary` returns a minimized draft.

- [x] Write regressions for200+sentinel and search/filter/sort/reset/copy before code; observed RED (200 expected,12 received; missing explorer; missing search control).
- [x] Preserve validation and terminal exclusion; implement bounded selection and client controls/details.
- [x] Run focused projection/server/RPC/explorer tests;92/92 GREEN before commit. Full surface acceptance remains pending.

## Task2: navigation and owner-first Hoy

Files: portal-navigation-state.ts/tests, portal-workspace.tsx/tests, hotel-operations.ts, portal/page.tsx/tests, portal-attention-summary.tsx/tests.
Interfaces: strict tab parsing for existing eight plus More; native History API changes only tab query and preserves unrelated query values; page injects the existing operations view plus safe coverage overview.

- [x] Write URL/history, neutral historical attention and mounted-form regressions; observed17 failures against the previous surface.
- [x] Implement four primary destinations, explicit secondary destinations, retained hidden panels, real tool-search wording and overview.
- [x] Run hotel-tools266/266 and auth164/164; focused RPC coverage92/92 from Task1. GREEN before commit.

## Task3: working visual hierarchy and verification

Files: portal.module.css, hotel-operations.module.css and focused evidence in this plan.

- [x] Apply navy shell/clear working surfaces, mobile bottom navigation and wide desktop rows; generated reference inspected only as design guidance, not a product asset. Browser inspection remains root's acceptance.
- [x] Relevant regressions and full `npm test` PASS. Lint0errors/1pre-existing unused-request warning in oauth-protected-resource route; TypeScript PASS. Next16 build PASS in portal mode with synthetic public URL/key, no real credentials.
- [x] Root independent code review on11f16b8: no new material findings,63/63 focused tests PASS (navigation14/14 is a subset; do not sum).
- [ ] Browser visual/interaction acceptance and release on exact SHA. No production claim while this gate remains open.

## Execution record

- 2026-11-07: clean worktree `codex/portal-operation-redesign-20261108`, base5eac040af52c2bf0552a95a13946d0542355d7cc.425 lockfile packages installed. Baseline `npm run test:hotel-tools`:237/237 PASS. Native History API guidance read from installed Next docs.
- Ruling: retain current terminal-state exclusion; eligibility counts differ from read-row counts. Copy reference/structured state/date instead of task titles, owners or raw query to minimize personal data. These limits are visible.
- 2026-11-07: Task1commit6e7f96f. Task2 adds URL-backed navigation, operational Home and clear working surfaces. No SQL/auth/reader/service changes. Parent reports prior owner session later expired; this implementation does not claim a new authenticated acceptance or fix auth timeouts.
- Ruling: secondary financial attention is collapsed on Hoy so historical invoices do not dominate the first viewport. Clipboard uses filtered-set aggregates plus at most3 short visible references and details URL; no free-text titles/names/query. Independent review and browser acceptance pending on final SHA.
- Independent read-only review identified prototype-shaped labels crashing aggregates, unsearchable copied short references, misattributed calculated attention priority, and primary-tab focus loss. All reproduced with five RED regressions (including valid-organization wording), fixed in one pass, then hotel-tools270/270 GREEN and full `npm test` PASS. Full lint0errors/1pre-existing warning and Next portal build PASS after fixes. A browser still must verify the actual history/focus/draft/clipboard/mobile behavior.
- Ruling: corrected non-hotel context wording in the same pass because a valid different organization must not be represented as Dreamcatcher; the change is text only, with an isolation regression. No authority, permissions or records changed.
- 2026-11-08 root acceptance limit: renewed cloud tab shows sign-in, not an authenticated hotel view. The prior secure sign-in request was cancelled; no repeated credential request or access-policy change. Cloud Browser could not open the isolated local component harness (`ERR_CONNECTION_REFUSED`). A separate automated local test attempt found no installed Chromium; its official download returned an invalid archive and was stopped. Neither attempt establishes visual or mobile acceptance. Publish an exact protected preview for the remaining review, keep replacement PR draft and retain current production until the gate passes.
