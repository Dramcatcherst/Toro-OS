# TORO — canonical product repository

TORO is the master intelligence, memory, governance, orchestration and execution product. Business workflows, approvals, dashboards and actions are capabilities inside TORO. `TORO OS` remains only as a technical legacy alias where existing repository names, keys or integrations still depend on it.

Current canonical product references are `START_HERE.md`, `toro-context.yaml`, `docs/product/TORO_BRAIN_CONSTITUTION.md` and `docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md`. Historical `TORO OS - Master Brain` Airtable records remain migration/reference evidence, not master product authority.

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
