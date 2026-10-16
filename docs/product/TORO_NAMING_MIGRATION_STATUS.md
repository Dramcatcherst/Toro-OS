# TORO — Naming Migration Status

**Status:** CURRENT R1-C MIGRATION TRACKER  
**Date:** 2026-09-28  
**Authority:** `docs/product/TORO_BRAND_CONTRACT.md` + `START_HERE.md`

## 1. Canonical naming rule

The only visible product/brand is **TORO**.

`TORO Brain` and `TORO OS` are deprecated visible names retained only where historical or technical compatibility requires them.

This file does not redefine the brand contract. It tracks migration debt.

## 2. Do not rename blindly

Technical identifiers may remain unchanged when changing them would create compatibility risk, including examples such as:

- repository name `Dramcatcherst/Toro-OS`;
- `toro_os_portfolio_master`;
- `AGENT-TORO-OS`;
- historic migration/table/source keys;
- existing filenames such as `TORO_BRAIN_GENERAL_PLAN.md`;
- evidence references and hashes;
- historical Airtable names.

An identifier can be legacy internally while all user-facing copy says TORO.

Rule:

> Visible naming migrates aggressively. Technical identity migrates only with dependency proof, tests and rollback.

## 3. Current state

### Already compliant

- `START_HERE.md` — visible brand TORO; TORO OS explicitly legacy.
- `docs/product/TORO_BRAND_CONTRACT.md` — TORO-only visible brand contract.
- `toro-context.yaml` — visible brand TORO and legacy aliases explicitly governed.
- current architecture direction — one TORO, no separate Brain/OS product.

### Legacy technical names intentionally preserved

- `docs/product/TORO_BRAIN_GENERAL_PLAN.md`
- `toro_os_portfolio_master`
- `AGENT-TORO-OS`
- `product.id: toro-brain`
- old Airtable base names;
- historical asset filenames/manifests with `TORO_BRAIN_*`.

These are compatibility/provenance debt, not evidence of multiple products.

## 4. Migration priority

### P0 — visible/current conceptual conflicts

Fix current documentation or UI that:
- presents TORO Brain and TORO OS as two products/layers with separate authority;
- calls an obsolete store/base the master truth;
- introduces another “master brain”, “master plan” or independent TORO identity.

### P1 — visible legacy wording

Replace user-facing:
- “TORO OS” -> “TORO”
- “TORO Brain” -> “TORO”
unless discussing historical provenance.

### P2 — technical compatibility names

Do **not** rename merely for aesthetics.

A technical rename requires:
- references/consumers located;
- migration path;
- test coverage;
- redirects/aliases if applicable;
- rollback;
- no data/provenance loss.

## 5. Current known migration debt

- Notion executive page still contains accumulated historical `TORO Brain / TORO OS` wording and mixed execution logs.
- Airtable base/table names retain TORO OS-era naming by design during convergence.
- GitHub filenames and keys retain legacy compatibility labels.
- Dropbox brand filenames may contain legacy TORO_BRAIN names; exact canonical brand path still requires storage verification before any file rename.

## 6. Naming gate for new work

New user-visible surfaces must use:

- Product: **TORO**
- General plan: **TORO General Plan** / **Plan General**
- Domain surface: **TORO <Domain>** when a named subsystem is necessary
- Specialist: **TORO <Specialist>** internally; normal users may interact simply with TORO

New work must not introduce:
- TORO Brain as a separate product;
- TORO OS as a separate product;
- a new “master brain”;
- a parallel Plan General.

## 7. Completion target

R1-C is complete when:

- current user-facing product surfaces say TORO;
- current authoritative docs do not imply separate Brain/OS products;
- remaining legacy terms are explicitly technical/historical;
- the Notion Plan General surface is compacted so current strategy is separated from event/history logs;
- no destructive technical rename is performed without dependency evidence.
