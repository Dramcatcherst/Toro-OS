# Alert preparation runtime validation — 2026-11-07

Status: candidate code and synthetic verification; no channel activation.
Plan: [single General Plan](../product/TORO_BRAIN_GENERAL_PLAN.md), TORO Comms, existing issue209. This is one bounded change to the alert preparer, not twenty hotel features deployed.

## Problem and resulting behavior

TypeScript annotations did not validate runtime JSON. Direct callers could prepare ready candidates with missing action, responsible role or provenance, unsupported enum values, blank destination IDs, or string values such as "false" in boolean switches. Malformed collections/context could throw unexpectedly. Owner Attention could be misclassified outside restricted management when a caller bypassed the constructor.

The existing preparer now validates shape, mandatory fields and enums, requires exact boolean activation/send flags and a valid destination identity/privacy, and blocks malformed data. Invalid signals produce no message or selected destination. This module still does not send messages or execute work.

## Twenty named acceptance cases

| Case | Control |
| --- | --- |
| AD20-01 | Null signal is blocked without an unexpected exception. |
| AD20-02 | Array signal is explicitly invalid. |
| AD20-03 | Source kind must belong to the approved enum. |
| AD20-04 | Room must belong to the approved enum. |
| AD20-05 | Privacy must be internal or restricted. |
| AD20-06 | Priority must belong to the approved enum. |
| AD20-07 | Case/source identity cannot be blank. |
| AD20-08 | Version cannot be blank. |
| AD20-09 | Subject cannot be blank. |
| AD20-10 | Summary cannot be blank. |
| AD20-11 | Impact cannot be blank. |
| AD20-12 | Required action cannot be blank. |
| AD20-13 | Responsible role cannot be blank. |
| AD20-14 | Due-time statement cannot be blank; no deadline is invented. |
| AD20-15 | Source system cannot be blank. |
| AD20-16 | Source cutoff cannot be blank. |
| AD20-17 | Source reference cannot be blank. |
| AD20-18 | Destination binding identity cannot be blank or padded. |
| AD20-19 | Active must be boolean true, not a truthy string. |
| AD20-20 | Sending must be boolean true, not a truthy string. |

Additional checks cover current valid payloads, organizational isolation and privacy, stale/future/impossible health probes, ambiguous destinations, UTF-8 budgets, malformed collections/context, nonstring JSON values, no rendered invalid message and restricted Owner Attention.

## Verification evidence and limits

Base: main commit 6bb325b0bf541abd08a14348f4eccdf075162ca6; upstream source blob e50e5b1bb580958cb10f87ce91199bdfe1e1e853.

An isolated Node24.22.1 harness exercised the actual TypeScript source with synthetic inputs. Before the change, 23 of 29 checks failed and 6 passed. After the change plus restricted-Owner-Attention and invalid non-JSON identity regressions, 31 of 31 passed. One named negative scenario (array signal) already blocked on the base; it now has an explicit signal-validation cause. Test counts are not newly implemented feature counts.

The same cases were added to the existing alert-delivery.test.ts suite, which is already included by npm test. Full Vitest, lint and application build were not available in the isolated local checkout; the existing PR CI must verify them on the exact candidate SHA before merge. No workflow, dependency, permission or production configuration is changed.

Valid payload formatting, localized due/source text, opaque references, UTF-8 budgets, destination identity and alert-delivery-v2 hashing are preserved. Invalid-room fallback metadata is conservative and never selects a destination. These checks cannot establish that free text contains no personal data or credentials; domain minimization and protected caller/recipient handling remain required. No universal120-word ceiling is claimed.

## Runtime acceptance remains separate

W24-01…20 in the [existing WhatsApp contract](../product/TORO_WHATSAPP_OPENCLAW_SAME_BRAIN_V1.md#12-explicit-roles-onboarding-and-twenty-hotel-workflow-refinements--2026-10-24) remain business acceptance requirements. Passing this preparer suite does not prove onboarding, an employee acknowledgement, physical work, guest delivery, task closure, restart continuity or operation with the owner's computer off.

Next material proof uses the existing issue209/runtime lanes: authorized actor/destination → permitted current read → same canonical case → provider delivery → human acceptance → operational result, with replay/reconnect and isolation checks. No real WhatsApp message, PMS/accounting write, new queue or scheduler was executed by this candidate.

Rollback: abandon/revert the candidate commit before promotion; no database or external effects require reversal.
