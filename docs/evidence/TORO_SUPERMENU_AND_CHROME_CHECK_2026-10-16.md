# TORO Supermenu + Chrome — evidence checkpoint

**Date / zone:** 2026-10-16 · America/Costa_Rica
**Branch:** `codex/toro-supermenu-20261016`
**Base checkpoint:** `43e5074`
**Scope:** local contracts, pure resolvers, static validation and one read-only
browser observation. No external send, deployment, provider write, permission
change, reservation, payment or production activation.

## HECHO

- Extended the existing structured-menu manifest; no parallel menu database or
  application was created.
- Added ten stable families (`MA`–`MJ`) and 91 canonical routes.
- Preserved short aliases such as `A4` and `C3`, but only with the exact active
  menu version `2026.10.16-v1` and a receipt matching subject, context
  fingerprint and a maximum 30-minute lifetime.
- Kept `MA4`/`MC3` as the unambiguous canonical forms so menu codes cannot be
  confused with TORO autonomy levels `A0–A6`.
- Added scope isolation: Personal routes fail closed in organization mode and
  organization administration fails closed in Personal mode.
- Added capability fail-closed behavior: a recognized code without a current
  capability state returns unavailable and never executes.
- Added a standard formatter with direct answer, truth/source/cutoff, up to
  three bullets, one to three numbered continuations, `M0` and free-text
  fallback.
- Added a WhatsApp reply-button projection capped at three, with unique IDs,
  unique titles and a 20-character button-title compatibility check. Each ID
  includes an opaque menu receipt; `M0` is reserved and cannot be duplicated.
- Filtered categories and item counts by effective capability. Empty or
  unavailable categories disappear instead of advertising dead actions.
- Declared 50 not-yet-registered capabilities as `TARGET_BLOCKED`; typos or
  undeclared capability names now fail the static audit.
- Added the `MH` training family and `MJ` governed-browser family. Training does
  not grant permission. Browser availability requires point-in-time evidence.

## Chrome observation

The connected computer-use session returned two Chrome profiles and current
tabs. A user-owned tab already open at the public Dreamcatcher Kross booking
engine was read successfully for 8–9 December 2026. The rendered page reported
`22 available solutions` and exposed room/rate text in the accessibility tree.

This proves only that the current assistant session could read that Chrome tab
at the cutoff. It does not prove:

- a permanent OpenClaw browser relay;
- an OpenClaw host/runtime capability grant;
- WhatsApp → OpenClaw → Chrome round-trip;
- authenticated Kross back-office access;
- complete live PMS truth;
- a durable availability/price feed.

No click, form submission, login, reservation, payment, message, configuration
change or screenshot artifact was produced.

## Verification

- JSON parse: PASS.
- Supermenu + response-format tests: `19/19 PASS`.
- Menu/resolver focal Vitest set: `39/39 PASS`.
- Static architecture tests: `8/8 PASS`.
- Static manifest audit: `PASS`:
  - 15 menu profiles;
  - 15 message profiles;
  - 15 toolbox profiles;
  - 89 existing bound menu options;
  - 10 Supermenu categories;
  - 91 stable routes;
  - 50 explicitly `TARGET_BLOCKED` capabilities;
  - zero errors and zero warnings.
- Canonical project graph: `929/929 PASS`.
- TypeScript, affected lint and Next.js production build (webpack): `PASS`.
- Three independent review passes found and closed two P1 plus four P2 issues;
  final review found no remaining material P0/P1/P2 in the local-contract
  scope.

## PREPARADO

- Canonical response shape for Portal, OpenClaw and WhatsApp.
- Stable training and browser route families.
- Official WhatsApp constraints documented: service-window/template boundary,
  three reply buttons, ten list rows and human escalation.
- Safe alias migration path: short code only inside a matching menu receipt;
  canonical `M`-prefixed code everywhere else.

## BLOQUEADO

- No runtime currently consumes the Supermenu across all three channels.
- No server-side menu-receipt store or cross-channel composer has been proven;
  only the pure validation contract exists locally.
- No real WhatsApp interactive reply/webhook receipt has been observed.
- No evidence shows the autonomous OpenClaw runtime can access Chrome from a
  WhatsApp request.
- Kross cloud truth remains separately blocked by the absence of an authorized
  server-to-server transport.

## DESCONOCIDO

- Which exact OpenClaw host owns the future browser capability.
- Its allowlisted domains, session lifetime, recovery behavior and receipt
  storage.
- The Graph API version and exact production limits that the WhatsApp provider
  binding will use.

## Reversal

Revert only the Supermenu commit after checking subsequent work. Restore the
prior structured-manifest version and rerun the focal/static tests. Do not reset
the worktree, delete data or alter the preserved Kross commit.

## NEXT único

`SUPERMENU-CROSSCHANNEL-COMPOSER-01`: connect the pure Supermenu resolver and
formatter to the existing server-only `get_toro_profile` composition path using
PII-free fixtures and no external I/O. Done only when Portal, OpenClaw and
WhatsApp projections produce the same subject/profile/menu version/context
fingerprint/hash, reject stale aliases and cross-scope requests, and preserve
explicit confirmation for `MJ9`.

## Primary external references

- https://whatsappbusiness.com/policy/
- https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/interactive/
- https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/types/ActionObject/
- https://whatsappbusiness.com/blog/quality-customer-care-messages/
