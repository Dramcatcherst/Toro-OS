# TORO — canonical product repository

TORO is the master intelligence, memory, governance, orchestration and execution product. Business workflows, approvals, dashboards and actions are capabilities inside TORO.

`TORO OS` and `TORO Brain` are historical/technical aliases only. They may remain in repository names, technical keys, filenames or integrations where changing them could break compatibility, but they are not separate visible products or master plans.

Current canonical product references are `START_HERE.md`, `toro-context.yaml`, `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, `docs/product/TORO_BRAIN_CONSTITUTION.md`, `docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md` and `docs/product/TORO_DESIGN_DNA.md`. The filenames containing `TORO_BRAIN` are retained for compatibility; their current product identity is TORO.

Historical Airtable `TORO OS` bases and older repositories remain migration/reference evidence, not master product authority.

## Runtime / Preview

Canonical Vercel runtime:

https://toro-pr11-preview.vercel.app

- Vercel project: `toro-pr11-preview`
- Source repository: `Dramcatcherst/Toro-OS`
- Canonical branch: `main`
- Legacy Vercel `toro-os-v03` is rollback/reference only and must not be treated as the default runtime.

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Safety Model

TORO does not perform unrestricted external writes.

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

Connector routes remain governed by TORO capability, permission and action-ceiling rules. A connected tool is not automatically authorized to write.

## Module Routes

- `/modules`
- `/modules/[id]`

Each module page carries source, status, risk, confidence, approval requirement, next action, queued actions and connector surface.

## Source Files

- `src/lib/toro-types.ts` - TypeScript contracts
- `src/lib/toro-data.ts` - compatibility/mock data and module definitions
- `src/lib/policy-engine.ts` - approval/blocking rules
- `src/components/operational-console.tsx` - operational approval console
- `docs/` and `prompts/` - governed specifications, plans, historical mirrors and reference material
