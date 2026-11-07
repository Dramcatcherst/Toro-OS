# TORO Portal — native hotel operations — 2026-11-07

Status: native read module published; database role/scope acceptance passed. An existing authorized production browser session subsequently rendered Operation successfully. Fresh sign-in, other accounts and current Kross acquisition remain separate acceptance gates.

## Release checkpoint — 2026-11-07

- Canonical implementation/Plan alignment: PR395 merged as `849c7b297891306d8e432fb1965d0fe3265b6735`; CI1545 passed. The current Plan remains the sole authority.
- Exact production backport: `c2d2c6827bfed0991fdb6945c9a118d2e47e78d2`, tree `85b0750f27b9fae3946c0a76fb68fab77240107c`, parent equal to the previously active `349d15fb93061cba6a285fa3977f03e4d6b6b449`. No unrelated main or PR384 changes were released.
- Existing Vercel project `prj_nxerFw9ciNews6tUMAah3GAlAJzs`, production deployment `dpl_93ChZgZVMwQ7j3ufMmoqH6Rfjima` READY; a fresh domain lookup confirms that exact source SHA at `https://toro.dreamcatcherhotel.com`. Entry: `/portal?tab=operations`.
- Backport validation:214 hotel-tools and45 RPC tests, build/types and directed lint passed; independent review ran98 targeted tests successfully. Actual source payload passed projection in memory (141 tasks/21 source-health records); source rows were not saved in Git.
- SQL role acceptance first ran with the candidate inside a reverted transaction; the original function definition and ACL were independently confirmed restored. After the compatible production reader was READY, migration `portal_hotel_operations_read_v1_20261107` applied the guarded optional extension to the same RPC. A subsequent role test passed exact property/field/count checks and rejected anonymous, mismatched actor and organization. Current definition MD5:`e5a91926c06e7712281a0a8a55403045`; SECURITY INVOKER/STABLE and original authenticated-only EXECUTE ACL preserved.
- At this initial checkpoint, browser sign-in through the secure form was rejected by TORO with “Usuario o contraseña incorrectos, o acceso no habilitado.” No credential/identity/permission change was made. The later browser observation below supersedes only the missing navigation evidence, not the failed fresh-sign-in observation.
- Kross current occupancy remains unknown: the4352-row mirror is dated20/10/2026, `source_is_live=false`, with no usable current reservation rows. The new view never derives current occupancy from it.
- Auxiliary Site v6/`7666e08249f209ec77b40b37ebc60efe2f18ec82` keeps manual capture/history and reciprocal native Portal links; its owner-only audience is unchanged. Its observation status is derived from receipts/source cutoffs, with explicit partial coverage.


The owner's instruction places hotel control in the existing TORO Portal's Operation view. The auxiliary Sites capture remains a private manual contingency. It does not become a second task authority or authenticate users on behalf of TORO.

## Authenticated access diagnosis — 2026-11-07 16:46–16:47 UTC

Scope: existing `toro_executive_control` operating layer, Dreamcatcher reference implementation, TORO Identity/Systems and the same Portal. This is a CURRENT observation with a NEXT diagnostic patch under the sole General Plan, not a new application or permission model. The owner authorized investigation and preparation; production publication requires a separate approval for this change.

### Observed result and limits

- A fresh Vercel lookup still resolved the canonical domain to `c2d2c6827bfed0991fdb6945c9a118d2e47e78d2`, deployment `dpl_93ChZgZVMwQ7j3ufMmoqH6Rfjima`, READY.
- A newly opened browser tab reused an already authenticated session. `/portal?tab=operations` rendered the selected Operation tab, twelve tasks and 141 rows read, with current occupancy explicitly unavailable. The account screen displayed ADMIN and GERENCIA in the Dreamcatcher context. Identity details, screenshots, cookies, session identifiers, task contents and source payloads are deliberately excluded from this public evidence.
- This proves authorized production navigation/readback for that existing session. No password was entered, guessed, reset or retrieved. It does not prove a fresh form submission, session renewal past expiry, every management account, or browser negative-role/isolation acceptance. The session was not signed out merely to retest credentials.
- Read-only database inspection found active management assignments and reviewed account habilitation/identifier bindings. Display names are not login identifiers or authority; similarly named records must not be merged or have access broadened. Any required password update must be completed through the existing identity service, without clearing its flag.
- Auth logs show both `invalid_credentials` rejections and successful password grants. Available records do not correlate the original Portal form submission to a unique provider request/account, so its exact credential/identifier cause remains UNKNOWN. Vercel log searches returned no matching entries for their bounded windows; that is missing evidence, not proof that no rejection occurred.

### Authentication and permission path

The published adapter uses the fixed DreamTeam endpoint, whose deployed source was inspected at `Dramcatcherst/dream-team@b9cf10606f410a0e6a6cdb5162dac1b735230a27`. Usernames resolve through that service's account directory; an email uses Supabase Auth directly inside that same login service. The Portal accepts only canonical-project cookies, validates `auth.getUser()`, required password replacement, `enforce_user_session`, active/non-revoked organization roles and employee-context shape before issuing its own host cookies. A missing employee record is permitted; ambiguous/malformed employee context is not. Organization choice is explicit for multi-organization accounts, and a saved selection remains a preference, never a grant.

The session RPC retains its existing revocation, idle and absolute limits. Refresh and page authorization are separate checks; refreshing cookies cannot replace role/scope verification. The hotel reader requires ADMIN/GERENCIA and the exact Dreamcatcher organization/property, then revalidates context after its awaited read. The existing Brain RPC definition remains MD5 `e5a91926c06e7712281a0a8a55403045`, SECURITY INVOKER/STABLE, with EXECUTE only for its owner and `authenticated`. Relevant identity/task/source tables retain RLS. This inspection did not change a user, role, policy, grant, function or operational row.

### Minimal diagnostic correction prepared, not released

Both published and current-main login code collapse upstream HTTP400/401/403 into the same credential-style HTTP401. The inspected identity-service application returns400 for request validation,401 for credential/identifier rejection, and403 after its role gate. A400 is therefore an integration/request-contract failure, not evidence of a bad password. A403 can also hide a role-query failure in that upstream implementation; it is not sufficient authority to enable an account.

The seven-line adapter change treats upstream400 as HTTP503 with fixed reference `PI400`. It records only `PI400`, `PI401` or `PI403` for the corresponding upstream status, without logging identifiers, secrets, raw responses or cookies. Public401/403 account denials remain identical. Existing PV01–PV08 post-password verification codes, all authorization checks and cookie issuance gates are unchanged. This improves diagnosis; it is not claimed as the cause or recovery of the historical rejection.

| Evidence/code | Interpretation and safe continuation |
| --- | --- |
| PI400 | Upstream request validation; inspect the integration contract rather than reset credentials. |
| PI401 | Identifier/password rejected by the identity service; verify the exact individual login through its secure form. |
| PI403 | Upstream role/access gate; inspect active assignments and role-read transport before any access decision. |
| PV01–PV04 | Auth identity, password update, session transport or session policy respectively; preserve revocation/expiry controls. |
| PV05–PV08 | Role transport, role shape, organization membership or employee context respectively; repair the failing dependency without broader grants. |

Rollback: revert the diagnostic code/test commit. No migration, business-data reversal or credential/permission change is required. Any production backport must remain limited to this diagnostic delta and be verified on the exact approved production base; promoting current main would import unrelated work.

Validation: three focused diagnostic regressions failed against the unchanged adapter and passed after the seven-line correction. Current-main candidate:166 Portal/auth tests and288 context/Portal/RPC/proxy tests passed; production build/TypeScript passed. The same code/test delta was separately applied to an isolated worktree at the exact published `c2d2c68` base:130 Portal/auth tests and the production build/TypeScript passed. Both builds used synthetic public configuration, not a real account or production credentials. Repository lint reported zero errors and one existing unused-argument warning outside this change; directed auth lint and whitespace checks passed. These local checks do not claim a new production deployment or a fresh authenticated login.

### Real data and the Kross dependency

Read-only native queries and browser readback agree on141 eligible task records;26 carry `needs_revalidation`. Their latest stored update is2026-11-02. These are real recorded tasks/states/assignments/dates, not proof of current physical housekeeping or maintenance completion.

The property-specific health reader currently sees21 records:11 stale and10 unknown. Known `source_as_of` values range from2026-09-20 to2026-09-23, with latest observation2026-09-24. This health registry is a distinct source from the4352-row historical mirror dated2026-10-20; neither establishes current PMS truth. A stored `safe_for_current_state` flag alone is insufficient: the reader independently enforces source cutoff/age and rejects unknown or older-than60-minute sources.

`projectHotelKrossHealth` deliberately returns `occupancy: null` even if a future source becomes fresh. Restoring acquisition is necessary for current occupancy, availability, arrivals/departures and prices, but is not alone sufficient to display numeric occupancy here. That requires a separately verified, scoped aggregate adapter through the existing reader and view, with date/inventory/coverage semantics and source receipts. Reuse the existing Kross lane and approved informational freshness contract; do not enable the paid API or create a new collector/scheduler by implication.

NEXT acceptance: verify one fresh individual sign-in and explicit Dreamcatcher selection through the secure form, then an authorized existing management-account read and the relevant negative-role/organization checks. Independently recover a governed Kross acquisition receipt and reconcile it to the native source registry before exposing current aggregates. The diagnostic patch and evidence are a review candidate; no production publication was performed by this investigation.

## Resulting behavior

- `/portal?tab=operations` opens the existing Operation tab only for an authorized hotel context; other values retain Home.
- A server-only adapter reads the existing canonical task records and Kross source-health records for the exact Dreamcatcher organization/property, with the existing authenticated RLS client. Management scope is rechecked after awaited reads; no service-role client or public API is added.
- The view shows up to twelve prioritized tasks from a bounded batch, their recorded states, assignment, dates, original modification times and canonical references. Raw notes, guest, financial and operational evidence payloads are excluded.
- Failed, unavailable, empty and partial reads remain distinct. A recent consultation does not refresh the source's modification time. Historical Kross copies never produce current occupancy, room availability or prices.
- Manual capture opens the existing private Site with its own access checks. It does not write canonical tasks or specialist systems.

## Optional existing-RPC extension

The existing `toro_portal_brain_read_v1(uuid,uuid)` can add an optional `hotelOperations` envelope for ADMIN/GERENCIA in the exact hotel scope. Existing sources and roles retain their contract; ordinary Brain projections ignore the new envelope. Older envelopes remain valid and show operations transport unavailable. The parser validates bounded rows, property and role before and after the RPC await.

The prepared SQL retains SECURITY INVOKER, STABLE, empty search path and existing RLS. It creates no table, grant, policy, role, writer or scheduler. Its precondition checks the exact prior function definition. The rollback draft preserves the prior definition. Deploy the compatible reader first; never apply this extension to an old strict reader.

The shared reader fails closed if a present optional envelope is malformed. This can make the full Brain read unavailable rather than only the operational section; current real-data validation passed, but this availability tradeoff remains explicit.

## Evidence and limits

- Native schema inspection established the selected fields. A bounded read on 2026-11-07 was passed through the actual TypeScript projection in memory: 141 task rows, twelve displayed items and 21 source-health rows accepted. Source states were stale/unknown and occupancy remained null. No source rows were saved in the repository or test fixtures.
- Directed tests cover old RPC compatibility, strict property/role boundaries, management-role demotion during an awaited call, errors and partial coverage, unknown states, read/source time separation, empty assignments, deep-link scope and the exact 60-minute source boundary.
- Local TypeScript, hotel-tools/RPC tests and production build validate code. They do not prove the production hostname's deployed SHA, authenticated source transport, current PMS data, delivery over WhatsApp or physical task completion.
- Production was observed by the owning release task on a different, older commit. A bounded backport onto that exact production base must be verified separately; do not promote unrelated main changes or the broader Portal draft by implication.

Rollback: revert this bounded code delta or return traffic to the previously verified deployment. If the optional RPC was applied, restore its exact prior definition only after verifying no concurrent function change; no business data needs reversal.
