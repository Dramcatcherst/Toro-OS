# Codex Cloud Setup

This repo is intended to run in Codex Cloud as `Dramcatcherst/Toro-OS` on branch `main`.

## Environment

Recommended environment name:

```text
toro-os-main
```

Setup script:

```bash
npm ci
```

Maintenance script:

```bash
npm ci
```

## Required Repository Selection

When starting a Codex Cloud task, select:

```text
Repository: Dramcatcherst/Toro-OS
Branch: main
```

Do not run Toro OS tasks in `Dramcatcherst/Toro-OS---Dreamcatcher-Hotel`, `toro-os-v88-new`, or another repository.

## Agent Internet Access

Enable agent internet access only for this environment and keep it allowlisted.

Recommended initial domains:

```text
github.com
githubusercontent.com
npmjs.com
npmjs.org
api.airtable.com
api.vercel.com
```

Use `GET`, `HEAD`, and `OPTIONS` for audit/read tasks. Add `POST` only for a task that needs authenticated API calls.

## Variables

Configure real values in Codex Cloud environment settings. Keep this file and `.env.example` free of real secrets.

Minimum audit/read configuration:

```text
TORO_OS_DRY_RUN=true
GITHUB_REPOSITORY=Dramcatcherst/Toro-OS
AIRTABLE_TOKEN=
AIRTABLE_BASE_ID=
BLOB_READ_WRITE_TOKEN=
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=
DROPBOX_ACCESS_TOKEN=
OPENAI_API_KEY=
KROSS_PUBLIC_BOOKING_URL=
```

Use read-only or least-privilege tokens whenever possible.

## First Validation Task

Use this prompt after the environment is configured:

```text
Confirm you are in Dramcatcherst/Toro-OS on branch main.
Run pwd, git status --short --branch, git remote -v, npm ci if needed,
npm run lint and npm run build.
Check whether Airtable/Vercel/GitHub/Dropbox/OpenAI variables are configured,
but do not print secret values. Do not modify files.
Report blockers exactly.
```

## Safety Rules

- Never print secrets or token values.
- Never commit `.env` files.
- Never mutate external systems during audits.
- Keep Krossbooking, WeSpeak, PMS, channel managers, OTAs, and booking engines mapped by stable IDs instead of renamed externally.
