# TORO OS v0.3 SAFE

TORO OS is an AI business operator foundation. It models the `TORO OS - Master Brain` Airtable base into TypeScript contracts, safe mock data, connector scaffolds, approval gates and operational UI.

Product name is TORO OS only.

## Production / Routes

Current production deployment:

https://toro-os-v03.vercel.app

Public Dreamcatcher site:

- `/` — Dreamcatcher Hotel public home
- `/dreamcatcher` — Dreamcatcher Hotel microsite alias/review route

TORO OS operator dashboard:

- `/os` — internal TORO OS dashboard

Deployment note: the previous `403 Forbidden` limitation was specific to this Cloud execution environment when installing/authenticating Vercel CLI. It was not a code or project deployment blocker; production is resolved outside this environment.

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

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
