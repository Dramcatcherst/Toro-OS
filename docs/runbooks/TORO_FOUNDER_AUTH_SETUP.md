# TORO Founder Auth Setup — Phase 1 Closeout

## Purpose

Create the two real Supabase Auth identities required to validate TORO Phase 1 without exposing credentials or weakening authorization:

1. **Mauricio / Founder** — real internal account.
2. **Restricted test user** — least-privilege identity used only to prove negative access.

This is an authorized human/admin operation. Do not create Auth users by inserting rows directly into `auth.users`.

## Project

Supabase project: `abtyrbqlqbsastmridzp`

Users page:
`https://supabase.com/dashboard/project/abtyrbqlqbsastmridzp/auth/users`

TORO Preview is an internal password-login app. The login form uses Supabase `signInWithPassword` and never needs a service-role key in the browser.

## Security Rules

- Never send passwords, session tokens, secret keys or recovery links through chat, GitHub, Airtable or logs.
- Never use `user_metadata` for authorization. End users can modify it.
- TORO Founder authorization uses `app_metadata.toro_role = FOUNDER` plus an active organization role of `ADMIN` or `GERENCIA`.
- `ADMIN` alone does **not** mean Founder.
- The restricted test user must never receive `toro_role=FOUNDER`.
- After changing `app_metadata`, the user must obtain a fresh JWT by signing out/in or refreshing the session before testing the claim.

## Step A — Create Mauricio's Auth account

1. Open **Authentication → Users** in the Supabase Dashboard.
2. Create a permanent internal user with the email Mauricio chooses for TORO.
3. Set a strong password privately. Do not paste it into ChatGPT or source control.
4. Confirm the email/account through the normal authorized Dashboard/Auth flow.
5. Record only the email label and resulting user ID in the closeout evidence; never record the password.

## Step B — Assign Founder application metadata

Authorization metadata must be stored in **App Metadata**, not User Metadata.

Required claim:

```json
{
  "toro_role": "FOUNDER"
}
```

Use an authorized Supabase Auth admin operation:

- the Dashboard user-detail control if it exposes **App Metadata**, or
- a server-side Supabase Auth admin `updateUserById` operation using a protected secret key outside browser/client code.

Do not place a secret/service-role key in TORO, Vercel public variables, GitHub source or the browser.

After the metadata change, sign out/in before validating TORO so the JWT contains the fresh claim.

## Step C — Verify Mauricio's organization authorization

The same Auth user must have an active `ADMIN` or `GERENCIA` membership in `public.user_roles` for the Dreamcatcher organization.

Verification conditions:

```text
Auth user exists
app_metadata.toro_role = FOUNDER
active user_roles membership exists
role code is ADMIN or GERENCIA
revoked_at is null
```

Do not create duplicate organization memberships if an equivalent active row already exists.

## Step D — Create restricted test user

1. Create a second permanent Auth user dedicated to access testing.
2. Use a non-Founder TORO role or no explicit TORO Founder metadata.
3. Assign the minimum active organization role required for the negative test, for example a reception/employee role where appropriate.
4. Never give this identity `ADMIN`/`GERENCIA` solely to make tests easier.
5. Keep its password private and inject it only into the approved E2E test environment when needed.

## Step E — Machine verification after both accounts exist

The closeout agent should verify, without exposing emails unnecessarily:

- exactly one intended Founder identity is found for the Phase 1 test;
- Founder has the required organization membership;
- restricted identity is not Founder;
- no unrelated user was silently repurposed;
- preview runtime is READY;
- real Playwright Founder/restricted paths can now run.

## Step F — Real E2E credential handling

For automated Playwright, provide credentials through protected CI/local environment variables only. Never commit them.

Expected variables are whatever `tests/e2e/toro-phase-1.spec.ts` currently consumes. Before adding secrets, inspect that file and use its exact variable names.

Founder mutation testing may operate only on a disposable test decision fixture. Do not approve/reject a live business decision to prove E2E.

## Done Criteria

- Mauricio can log into `/login` and reach `/toro` as Founder.
- Restricted test identity signs in but fails closed on Founder-only actions.
- Founder decision read/action authorization requires both explicit Founder metadata and active privileged org membership.
- No credential or secret value is committed, logged or shared through chat.
- E2E and Mauricio mobile parity can proceed.