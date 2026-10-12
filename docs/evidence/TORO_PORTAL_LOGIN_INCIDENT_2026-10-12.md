

# Portal login verification incident — 12/10/2026

CURRENT incident: owner reports `No pudimos verificar tu acceso` on the published Portal. This is the post-provider verification branch, not proof of an invalid password. Read-only identity checks found active confirmed owner accounts/roles and provider sign-in successes; fresh successful Auth sessions were not yet represented in the existing session-policy table. This localizes the investigation but does not identify the exact failed boundary.

PREPARED: fixed PV00–PV08 diagnostics for Auth identity, password-change requirement, session transport/policy, roles and employee context. Logs contain a fixed code only: no identifier, email, password, token, cookie, provider payload or exception. A provider success followed by context failure is described accurately to the user. Existing checks, grants, RLS, session limits, origin protection, upstream rate limiting and writer gates are unchanged.

Verification: 87 directed auth/session tests PASS, including three new regression scenarios observed failing before implementation; TypeScript PASS; full existing test command PASS; lint has no errors and two existing warnings; production build PASS. Live owner sign-in and the exact PV boundary remain pending. Vercel environment metadata could not be inspected through this connector (403); configuration mismatch is a hypothesis, not a confirmed cause.

Visual reference reaffirmed: `1001761343.png`, uniform navy/slate, compact bordered panels, TORO blue wordmark, original tool logos, two mobile/three desktop favorite columns. No new render, fake room rows or design changes in this authentication incident.

NEXT: publish the bounded diagnostics through the existing branch/PR/preview path, request one owner sign-in without sharing credentials, capture only the PV code, fix that boundary with a regression test and verify the real login/context. Do not reset credentials, add grants, create accounts or weaken checks to make a login pass. Rollback: revert this diagnostic-only change or restore deployment dpl_7P9haAD7b8s61Myt2WC4m42LLUuj.
