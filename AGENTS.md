# Toro OS Codex Operating Rules

## Next.js Version Rule

This project uses a newer Next.js release. Read the relevant guide in `node_modules/next/dist/docs/` before changing Next.js APIs, conventions, routing, caching, or file structure. Heed deprecation notices.

## Repository Scope

- Work only in `Dramcatcherst/Toro-OS` on branch `main` unless the user explicitly selects another branch.
- Do not use, inspect, migrate from, copy from, or reference `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel`, `toro-os-v88-new`, or any other repository as a source of truth.
- Treat TORO OS V2 / Airtable as the source of truth for Dreamcatcher Hotel operating data.
- Do not rename rooms or villas inside external systems such as Krossbooking, WeSpeak, PMS, channel managers, OTAs, or booking engines. Map those systems with stable IDs, URLs, calendar links, or external IDs.

## Security

- Never print, commit, screenshot, or paste secrets, tokens, API keys, database URLs, Airtable keys, Vercel tokens, Dropbox tokens, OpenAI keys, cookies, session IDs, MFA codes, or credentials.
- Use `.env.example` for variable names only. Real values belong in the Codex Cloud environment, Vercel, or the local developer environment.
- Prefer read-only credentials for audits and connector checks. Use write-capable credentials only for a narrow task that explicitly requires writes.
- External writes must stay approval-gated. Do not create, update, delete, publish, charge, refund, cancel, send messages, or mutate external business systems unless the user has explicitly requested that exact action.

## Local Setup

- Package manager: npm.
- Install: `npm ci` when `package-lock.json` is present; otherwise `npm install`.
- Development server: `npm run dev`.
- Build: `npm run build`.
- Lint: `npm run lint`.

## Validation Expectations

- Before code changes, inspect the relevant files and confirm the current branch.
- After code changes, run the narrowest relevant check first.
- For broad app changes, run `npm run lint` and `npm run build` when feasible.
- Do not claim a check passed unless it was actually run and passed.

## Codex Cloud Environment

Recommended environment name: `toro-os-main`.

Setup script:

```bash
npm ci
```

Agent internet access should be enabled only with a limited allowlist. Start with:

- `github.com`
- `githubusercontent.com`
- `npmjs.com`
- `npmjs.org`
- `api.airtable.com`
- `api.vercel.com`

Keep allowed methods to `GET`, `HEAD`, and `OPTIONS` for audits. Add `POST` only for specific tasks that need authenticated API calls.

## Connector Policy

- Airtable: read schemas and records unless a task explicitly approves writes.
- Vercel: read deployment/project status unless a task explicitly approves deployment or promotion.
- GitHub: prepare issues and PR-ready changes; do not push or create issues without explicit user approval.
- Dropbox: resolve and inspect asset metadata; do not delete, move, or mutate media without explicit user approval.
- OpenAI: use for draft reasoning and agent preparation only when keys are configured and the task requires it.
