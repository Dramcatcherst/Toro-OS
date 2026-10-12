

# Portal login verification incident — 12/10/2026

CURRENT incident: owner reports `No pudimos verificar tu acceso` on the published Portal. This is the post-provider verification branch, not proof of an invalid password. Read-only identity checks found active confirmed owner accounts/roles and provider sign-in successes; fresh successful Auth sessions were not yet represented in the existing session-policy table. This localizes the investigation but does not identify the exact failed boundary.

PREPARED: fixed PV00–PV08 diagnostics for Auth identity, password-change requirement, session transport/policy, roles and employee context. Logs contain a fixed code only: no identifier, email, password, token, cookie, provider payload or exception. A provider success followed by context failure is described accurately to the user. Existing checks, grants, RLS, session limits, origin protection, upstream rate limiting and writer gates are unchanged.

Verification: 87 directed auth/session tests PASS, including three new regression scenarios observed failing before implementation; TypeScript PASS; full existing test command PASS; lint has no errors and two existing warnings; production build PASS. Live owner sign-in and the exact PV boundary remain pending. Vercel environment metadata could not be inspected through this connector (403); configuration mismatch is a hypothesis, not a confirmed cause.

Visual reference reaffirmed: `1001761343.png`, uniform navy/slate, compact bordered panels, TORO blue wordmark, original tool logos, two mobile/three desktop favorite columns. No new render, fake room rows or design changes in this authentication incident.

NEXT: publish the bounded diagnostics through the existing branch/PR/preview path, request one owner sign-in without sharing credentials, capture only the PV code, fix that boundary with a regression test and verify the real login/context. Do not reset credentials, add grants, create accounts or weaken checks to make a login pass. Rollback: revert this diagnostic-only change or restore deployment dpl_7P9haAD7b8s61Myt2WC4m42LLUuj.


## Verified closure — 12/10/2026, 13:10 Costa Rica

PR270 merged at c5d800ac52694df28513afbd46c8e47214266589. CI38294968171 succeeded. Preview dpl_7PL7TFNVdTvPCkNnNAXaRDb11eHG READY; its branch lacks Portal-mode configuration and correctly returned the public-demo fail-closed response, so no authenticated preview acceptance is claimed. Exact production deployment dpl_CZbHyHWckcq54Mbham8WfkPq9a4u READY and aliases include toro.dreamcatcherhotel.com; independent HTTP200 login readback identified that deployment.

The owner confirmed `Ya pude ingresar` after the new deployment. Read-only Supabase readback corroborated a fresh owner Auth sign-in at13:09:13 Costa Rica, session-policy registration at13:09:13.926 and activity at13:10:40, with no revocation. Thus owner entry/session validation is now observed. No credentials or tokens were requested/exported, and no account/grant/database change was made.

Limits: the previous incident's exact PV boundary was not observed after publication; no failure log was returned in the sampled new-deployment window. Root cause remains unconfirmed; redeployment plus diagnostics restored observed access, but the code delta does not prove a cookie, key or password fix. The separate legacy DreamTeam username was not independently retested. This is owner-login acceptance, not certification of all Portal modules or cross-account isolation.

Visual request remains aligned to the existing design contract; no visual implementation changed in PR270. If entry fails again, use the fixed PV reference rather than resetting credentials or weakening controls. Existing rollback deployment remains preserved.

## Configuration and post-login navigation verified — 12/10/2026

Independent inspection of the earlier public bundle confirmed a configuration mismatch: its publishable key was rejected by canonical Supabase Auth settings with HTTP401; the already-active public key of the same project returned200. The existing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY was updated with that active public value, preserving Production/Preview scopes and Config type. No key was created or rotated; no credential value is recorded here. After deployment dpl_3j2S52ZTruwECrCdeUvoZpeC8H3H of edb117c5aa5c2a557a751a5be64e0a8bceaac698, all9 public scripts were read: the compiled key matched the active one and Auth settings returned200. This establishes a defect in the earlier artifact, without attributing every historical login attempt to it.

The existing owner form then passed verification and reached /portal, but initially displayed the anonymous view. A complete reload showed Inicio and Dreamcatcher. The DreamTeam branch now uses a full document replacement after verified success, preserving safe-next and clearing the password from React state before navigation. This discards an earlier anonymous Router Cache entry; the legacy login flow is unchanged. Failed/unverified responses stay on the form. No session cookies, tokens, form values or guest data were extracted. Diagnostics already merged in PR270 are preserved.

Rollback must preserve the valid public configuration and rebuild the selected source reference. Promoting an older compiled artifact can restore the rejected key or stale navigation behavior; an old READY deployment alone is not a verified recovery. No data migration or SQL rollback is involved. The exact final candidate/deployment and fresh acceptance remain in the existing canonical checkpoint.
