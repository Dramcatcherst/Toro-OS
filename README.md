# TORO OS v0.3 SAFE

TORO OS is an AI business operator foundation. It models the `TORO OS - Master Brain` Airtable base into TypeScript contracts, safe mock data, connector scaffolds, approval gates and operational UI.

Product name is TORO OS only.

## Preview

Latest preview:

https://toro-os-v03-gklbiqzri-dreamcatcher-s-projects.vercel.app

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
