# TORO — canonical product repository

TORO is the master intelligence, memory, governance, orchestration and execution product. Business workflows, approvals, dashboards and actions are capabilities inside TORO. `TORO OS` remains only as a technical legacy alias where existing repository names, keys or integrations still depend on it.

Start with [START_HERE](START_HERE.md), `toro-context.yaml`, the [single General Plan](docs/product/TORO_BRAIN_GENERAL_PLAN.md), `docs/product/TORO_BRAIN_CONSTITUTION.md` and `docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md`. Historical `TORO OS - Master Brain` Airtable records remain migration/reference evidence, not master product authority.

## Deployment status

The canonical Portal entry is **https://toro.dreamcatcherhotel.com**, served by the existing Vercel project **`toro-pr11-preview`**, connected to `Dramcatcherst/Toro-OS`. Its internal project name does not classify its production domain as a preview.

The [24 October audit continuation](docs/evidence/TORO_INTEGRAL_AUDIT_2026-10-22.md#9-auditoría-del-portal-y-reconciliación--2026-10-24) records the observed production artifact, main, candidates and limits. The requested `toro.jpghotel.co` address was not verified as an alias in the authorized team. Its intended relationship remains unresolved; this observation does not authorize a DNS change or another project.

Release gates remain in the [canonical Vercel contract](docs/product/TORO_VERCEL_CANONICAL_DEPLOYMENT_V1.md). Re-read the exact artifact, deployment metadata and authenticated acceptance before release. Main and READY previews can differ from production; Git-triggered main deployment is disabled in the audited configuration. The [worker canary runbook](docs/runbooks/TORO_WORKER_CANARY_V1.md) governs the separate internal runtime boundary.

Legacy TORO-named projects retain their migration/reference role until their consumers and recovery path have been verified.

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Safety Model

TORO's [Control Plane contract](docs/product/TORO_CONTROL_PLANE_RUNTIME_V1.md) governs internal execution state, leases/fencing and receipts. Availability and acceptance are recorded per capability and environment; code presence or runtime availability does not grant business authority.

External or material actions remain blocked or approval-gated according to current policy, including Kross writes, price/availability changes, social publishing, WhatsApp sends, reservations, invoices, charges, refunds, cancellations, permission changes and destructive deletion.

## Historical/internal connector scaffolds

The following paths describe internal or historical scaffolds. This list is not an assertion that these routes are exposed or enabled on the public Portal; its deployment profile and current route guards govern availability.

- `/api/modules`
- `/api/approvals`
- `/api/agent/prepare`
- `/api/policy/evaluate`
- `/api/connectors/airtable`
- `/api/connectors/vercel`
- `/api/connectors/github-codex`
- `/api/connectors/dropbox`

Read and prepare contracts do not authorize external writes. Verify the current implementation, deployment profile and action policy for each capability.

## Historical module routes

- `/modules`
- `/modules/[id]`

These module scaffolds describe source, status, risk, confidence, approval requirement, next action, queued actions and connector surface; they do not establish the currently accepted Portal navigation.

## Source Files

- `src/lib/toro-types.ts` - TypeScript contracts
- `src/lib/toro-data.ts` - Airtable-shaped mock data and module definitions
- `src/lib/policy-engine.ts` - approval/blocking rules
- `src/components/operational-console.tsx` - persistent local approval console
- `docs/` and `prompts/` - product contracts, evidence and instructions; historical blueprint material retains its documented scope
