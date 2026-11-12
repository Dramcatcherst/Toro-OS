# TORO Mail R1–R3 preparation — 12 November 2026

## Scope and authority

Continuation of existing PR #308 and TORO Comms/TORO Mail under the sole General
Plan. Base inspected: `194593be07980fbae47b505808588610d34b2840`. Main inspected:
`425bfb0c61d0522f3362e42e80f19a99185a0838`. The task branch preserves #308's
history; it does not merge or overwrite unrelated main changes.

The owner adopted the bounded reply policy through “Ejecutar superprompt”.
Policy evidence remains in the existing operational registry, not this public
repository. The actual pilot remains `runtime_enabled=false`, with no effective
activation timestamp. No repeat authorization request is implied.

## Candidate behavior

- Native message identity includes provider, stable physical mailbox reference
  and native message ID. Aliases and reconnection do not create another message.
- Classification hints use parsed exact mailbox/domain matches; they do not
  authenticate senders or resolve notification recipients.
- TORO Mail consumes main's explicit freshness policy and requires current
  runtime acceptance before advertising organizational mutations. Authorized
  historical reads remain distinct from current synchronization health.
- The server-only R1–R3 preparation checks policy/cutoff, verified send-as,
  message/person/case linkage, exact recipient, loop headers, human state,
  source action outcome, current approved content and a canonical quota snapshot.
- An action key is stable across case reassignment, template changes and policy
  receipt changes. Previous resolved sends are distinguished from uncertain
  case sends and from replay of the same native message.
- Every result has `canSend=false`. There is no provider transport, active
  worker, case persistence, quota reservation, database migration or permission
  change in this slice. A prepared result is not an atomic dispatch admission.

## Local verification

Verified in the isolated task worktree using the lock-matching existing tool
versions: Next.js 16.3.8, Vitest 4.1.11, TypeScript 5.9.3, ESLint 9.39.4.

| Gate | Result |
| --- | --- |
| Comms directory | 8 files / 119 tests passed |
| TypeScript, no emit | Passed |
| Global ESLint | 0 errors; 2 pre-existing warnings outside this slice |
| Canonical `npm test` | Exit 0; main Vitest invocation 708 tests passed; all additional Vitest and Node suites passed |
| `npm run build -- --webpack` | Passed; 52 routes/pages generated |
| `git diff --check` | Passed |
| Independent focused review | Identity/action/recipient/state/input findings corrected and rechecked |

The pre-existing lint warnings are an unused request argument in the OAuth
protected-resource route and a navigation advisory in `portal-sign-out.tsx`.
They were not suppressed or altered. No live email, production credentials or
private guest fixtures were used. Additional suites overlap; their totals are
not added together as a unique-test count.

## Remaining gates and rollback

At the first preparation commit, PR #308 was already divergent/conflicted
against main. Only its mailbox freshness/context dependency was reconciled in
that slice. The continuation below supersedes that integration status. CI/preview of the final revision must be inspected
separately before any merge. No merge or deployment was performed in this task.

Future provider dispatch must re-read policy/identity/human state, bind the
approved template and exact final content hash, atomically reserve global/day
and case/rolling quotas through the existing fenced execution ledger, add
verified anti-loop headers, record provider evidence and reconcile ambiguous
results before retry. Reference strings and Boolean snapshots in preparation
are not proof that those controls exist in production.

Rollback: revert this isolated commit. It changes only code, tests and contracts;
there is no live provider, schema, permission or message side effect to reverse.


## Integration continuation — 12 November 2026

The same PR branch was reconciled with main
`425bfb0c61d0522f3362e42e80f19a99185a0838`, preserving the first preparation
revision `6201bd8423769fc55a549af4abf5a27c55f07942` as its other parent.
The only four textual conflicts were the package test script, the alert
delivery helper and tests, and the personal Gmail cleanup classifier.

- All current-main test commands remain, including the newer Alegra caller
  verification; the three TORO Mail suites are included in the canonical run.
- Mail alert preparation now passes the required organization, health window
  and UTF-8 message budget to the shared delivery guard. Main's strict input,
  scope, freshness and destination checks remain unchanged. Personal mail
  cannot enter a hotel group, and truthy non-Boolean privacy flags are rejected.
- Cleanup retains main's malformed-metadata protection and plural grammar
  while preserving the PR's purchase/order/shipping/delivery exclusions.
- The General Plan and context combined without conflict. No runtime policy,
  source data, scheduler, permissions or provider state changed.

Integration validation: 247/247 targeted Comms and Maintenance tests passed.
The full canonical `npm test` exited 0 (1,211 tests in its principal Vitest
invocation; all additional Vitest and Node suites passed). Global lint has
0 errors and one pre-existing unused-argument warning. The canonical
`npm run build` using Next.js 16.3.8/Turbopack passed, including its TypeScript
gate and generation of 53 pages; a fresh standalone TypeScript check passed.

The optional webpack build exposed an existing default-parameter PageProps
incompatibility in the unchanged main Portal page. This does not reproduce
with the repository's declared Turbopack build and its generated validator.
Portal code and type-checking policy were not changed. The task-worktree
dependency symlink was replaced with a local copy of the same installed
dependencies because Turbopack disallows a dependency symlink outside its root;
no package version, dependency manifest or runtime configuration was changed.

This is a reviewed branch-integration candidate, not a merge into main or a
deployment. Provider dispatch and durable atomic admission remain unimplemented
and `canSend=false` remains unchanged. Revert the integration revision to
restore the prior PR branch; canonical main and external systems are untouched.
