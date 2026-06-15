# TORO OS v0.3 SAFE

TORO OS is an AI business operator foundation. It models the `TORO OS - Master Brain` Airtable base into TypeScript contracts, safe mock data, connector scaffolds, approval gates and operational UI.

Product name is TORO OS only.

## Production / Routes

Current production deployment:

https://toro-os-v03.vercel.app

Public Dreamcatcher site:

- `/` — Dreamcatcher Hotel public home
- `/dreamcatcher` — Dreamcatcher Hotel microsite alias/review route
- `/dreamcatcher-media/*` — local editorial media pack used by the public site
- `/sitemap.xml`, `/robots.txt` and `/manifest.webmanifest` — production SEO/PWA crawl surfaces

TORO OS operator dashboard:

- `/os` — internal TORO OS dashboard

Deployment note: the previous `403 Forbidden` limitation was specific to this Cloud execution environment when installing/authenticating Vercel CLI. It was not a code or project deployment blocker; production is resolved outside this environment.

Public website status: the Dreamcatcher surface now includes local media, SEO/social metadata, Hotel + FAQ structured data, sitemap/robots/manifest support, qualified inquiry CTAs and explicit Kross/connector guardrails. Approved Dropbox/Eagle photography can replace the editorial SVG media later without changing the route architecture.

Preview validation helper:

- `/api/site-health` — safe JSON route map for validating Vercel Preview deployments without Playwright screenshots.
- `/api/connectors/kross` — read-only direct-booking readiness contract for the approved Kross booking URL.
- `docs/PREVIEW_VALIDATION.md` — exact Vercel Preview validation checklist and curl commands.

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Codex Cloud

Use `Dramcatcherst/Toro-OS` on branch `main`. Cloud environment setup, network allowlist, and variable names are documented in `docs/CODEX_CLOUD_SETUP.md`. Repository operating rules for Codex live in `AGENTS.md`.

## Safety Model

v0.3 does not perform direct external writes.

Blocked or approval-gated actions include Kross writes, price/availability changes, social publishing, WhatsApp sends, reservations, invoices, charges, refunds, cancellations, data deletion and media deletion.

## Connector Scaffolds

- `/api/modules`
- `/api/approvals`
- `/api/agent/prepare`
- `/api/policy/evaluate`
- `/api/connectors/airtable`
- `/api/connectors/vercel`
- `/api/connectors/github-codex`
- `/api/connectors/dropbox`

All connector routes currently return `externalWrite:false` and operate as `read_only` or `prepare_only`.

## Module Routes

- `/modules`
- `/modules/[id]`

Each module page carries source, status, risk, confidence, approval requirement, next action, queued actions and connector surface.

## Source Files

- `src/lib/toro-types.ts` - TypeScript contracts
- `src/lib/toro-data.ts` - Airtable-shaped mock data and module definitions
- `src/lib/policy-engine.ts` - approval/blocking rules
- `src/components/operational-console.tsx` - persistent local approval console
- `docs/` and `prompts/` - Airtable blueprint mirrors
