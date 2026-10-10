# TORO — canonical product repository

TORO is the master intelligence, memory, governance, orchestration and execution product. Business workflows, approvals, dashboards and actions are capabilities inside TORO. `TORO OS` remains only as a technical legacy alias where existing repository names, keys or integrations still depend on it.

Current canonical product references are `START_HERE.md`, `toro-context.yaml`, `docs/product/TORO_BRAIN_CONSTITUTION.md` and `docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md`. Historical `TORO OS - Master Brain` Airtable records remain migration/reference evidence, not master product authority.

## Deployment status

The canonical TORO repository does **not** currently publish an authoritative Vercel preview URL.

Observed TORO-named Vercel projects are legacy/migration surfaces and must not be treated as current deployment authority. The next canonical deployment must be sourced from this repository (`Dramcatcherst/Toro-OS`) and pass the release gates in:

- `docs/product/TORO_VERCEL_CANONICAL_DEPLOYMENT_V1.md`
- `docs/runbooks/TORO_WORKER_CANARY_V1.md`

Do not use legacy preview URLs as proof of current TORO runtime state.

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Safety Model

TORO has a production Control Plane for governed internal execution state, leases/fencing and receipts. Runtime availability does not grant business authority.

External or material actions remain blocked or approval-gated according to current policy, including Kross writes, price/availability changes, social publishing, WhatsApp sends, reservations, invoices, charges, refunds, cancellations, permission changes and destructive deletion.

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
