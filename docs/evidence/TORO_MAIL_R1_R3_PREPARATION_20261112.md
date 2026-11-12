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

PR #308 was already divergent/conflicted against main. Only its relevant
mailbox freshness/context dependency was reconciled here; the whole PR is not
certified merge-ready. CI/preview of the final revision must be inspected
separately before any merge. No merge or deployment was performed in this task.

Future provider dispatch must re-read policy/identity/human state, bind the
approved template and exact final content hash, atomically reserve global/day
and case/rolling quotas through the existing fenced execution ledger, add
verified anti-loop headers, record provider evidence and reconcile ambiguous
results before retry. Reference strings and Boolean snapshots in preparation
are not proof that those controls exist in production.

Rollback: revert this isolated commit. It changes only code, tests and contracts;
there is no live provider, schema, permission or message side effect to reverse.
