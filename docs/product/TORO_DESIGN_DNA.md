# TORO — Design DNA v1

**Status:** CURRENT CROSS-PRODUCT DESIGN CONTRACT
**Date:** 2026-09-24
**Owner:** Mauricio / TORO
**Scope:** TORO product surfaces, modules, embedded tenant experiences, Dreamcatcher proving ground, reports, WhatsApp handoffs, portal and future mobile/desktop apps

## 1. One brand, three modes

TORO has one visible brand and one design system. It may adapt presentation by context without becoming multiple brands.

### Mode A — TORO Core
Use for identity moments, login/launch, executive command, system health, AI/coordination visualization and formal TORO product material.

Visual character:
- Midnight / Deep Navy;
- Royal / Electric Blue;
- Gold as intelligence/premium accent;
- official TORO bull isotype;
- high contrast;
- calm, precise, premium.

### Mode B — TORO Work
Use for PayFlow, People, Operations, Revenue, Finance, Data, internal dashboards, approvals and task/evidence workflows.

Visual character:
- light, highly legible operational surfaces;
- TORO navy/blue for structure;
- gold for selective emphasis only;
- strong hierarchy;
- vertical reading flow;
- compact information density;
- status semantics consistent across modules;
- evidence one interaction away.

TORO Work is not a second visual identity. It is the operational expression of TORO Core.

### Mode C — TORO Embedded
Use when TORO powers a client/business surface.

Rules:
- retain TORO component behavior, hierarchy, accessibility, evidence states and interaction patterns;
- allow the tenant brand to control surface palette, photography, logo, tone and emotional styling;
- TORO identity is secondary/subtle when the experience belongs to the tenant;
- never force TORO navy/gold over a guest-facing hospitality brand.

For Dreamcatcher:
- guest/public skin = Dreamcatcher Sunset Jungle Boutique;
- internal TORO tools for Dreamcatcher may use TORO Work structure with Dreamcatcher tenant accents;
- co-branding should be contextual, not logo competition.

## 2. Naming

Visible product brand: **TORO**.

Allowed module names:
- TORO PayFlow
- TORO People
- TORO Operations
- TORO Revenue
- TORO Growth
- TORO Comms
- TORO Data
- TORO Systems

Do not introduce new visible names:
- TORO Brain
- TORO OS

Those remain historical/technical aliases only.

## 3. Logo hierarchy

### TORO
Current official master:
`TORO_LOGO_MASTER_v1.png`

Use the official bull isotype. Do not use the old TORO BRAIN wordmark on new surfaces.

Until an approved TORO wordmark exists:
- use the isotype plus UI text label "TORO" or module name;
- do not invent a new logo/wordmark font and treat it as official artwork.

### Dreamcatcher
Dreamcatcher retains its own logo identity on guest/public surfaces.

### Co-branding
- TORO-owned product surface: TORO primary; tenant logo contextual/secondary.
- Tenant-owned guest surface: tenant primary; TORO invisible or subtle "Powered by TORO" only when useful.
- Internal tenant tool: TORO module identity + tenant context, never equal-weight competing logos.

## 4. TORO palette

Canonical working palette:
- Midnight #010511
- Deep Navy #020C1E
- Royal Blue Dark #052456
- Royal Blue #084A8F
- Electric Blue #0D7CC8
- Cyan Highlight #39B2F0
- Gold Main #EBAE4A
- Gold Light #F9DB83
- Gold Deep #A66F2F
- Bronze Shadow #593718

Use neutral light surfaces for TORO Work only as UI neutrals; they are not new brand colors.

## 5. Dreamcatcher tenant skin

Dreamcatcher source direction: **Sunset Jungle Boutique**.

Tenant tokens:
- Warm Sand #F7F0E3
- Soft White #FFF9EF
- Deep Sand #D8C3A5
- Sunset Orange #E76F3C
- Burnt Sunset #B9562F
- Jungle Green #2F5D46
- Tropical Leaf #6FA66A
- Pool Blue #2F9CA6
- Deep Ocean #174A5A
- Antique Gold #B88A44
- Warm Charcoal #2C2723

Dreamcatcher guest surfaces should not inherit TORO Core dark-tech styling by default.

## 6. Shared component grammar

Across every mode:
- outcome first;
- next action second;
- uncertainty visible;
- evidence one tap away;
- one clear primary action;
- consistent status vocabulary;
- progressive disclosure;
- no duplicate information;
- no decorative charts without a decision;
- no fake success state;
- accessible contrast/touch targets/reduced motion;
- mobile-first and one-handed for common tasks.

## 7. Vertical operating layout

TORO Work should prefer a vertical operating spine:

1. Now — what requires attention.
2. Next — next 7 days / next operational window.
3. Forecast — 30/90 day anticipation.
4. Exceptions — anomalies, missing evidence, blocked items.
5. Evidence — documents/source/freshness.
6. Analysis — trends, comparisons, savings/opportunities.
7. Actions — approve, delegate, schedule, resolve.
8. Learning — what TORO changed because of the latest evidence.

Desktop may use supporting side panels, but the primary reading order remains vertical.

## 8. PayFlow application

TORO PayFlow uses **TORO Work**.

Primary mobile/vertical sections:
- Priority payments
- This week
- Overdue / processing
- Next 30 days
- Next 90 days
- Missing invoices/receipts
- Cash reserve by currency
- Variance / price drift
- Savings opportunities
- Evidence inbox
- Reconciliation status

Title contract:
`PROVIDER/SCOPE · COMPACT_AMOUNT · SHORT_STATE`

Forecast states:
- CONFIRMED
- ESTIMATED_FROM_HISTORY
- NEEDS_VERIFICATION

PayFlow must never visually present an estimate as confirmed debt.

## 9. Status semantics

Semantic status colors must stay consistent across modules:
- red = material overdue/blocker/risk;
- amber/yellow = action/preparation/uncertainty;
- blue = in process/automatic/active;
- green = verified/closed/success;
- gray = informational/inactive/historical.

Tenant accent colors may decorate; they must not redefine system-state meaning.

## 10. Motion

Motion communicates real system state only: listening, retrieving, connecting, reasoning, waiting for approval, executing, verifying, completed or degraded.

No decorative "AI thinking" animation that implies work was done when it was not.

## 11. AI-generation guardrail

Any generated UI, image, PDF, report, slide, website or app must receive:
- brand = TORO / tenant;
- mode = Core / Work / Embedded;
- logo master key;
- palette tokens;
- typography state;
- component rules;
- naming rule;
- status semantics;
- co-branding rule.

Generated assets that omit this context are drafts, not production-safe derivatives.

## 12. Governance

Source hierarchy:
1. Supabase `toro_brand_identity_v2`
2. GitHub `TORO_BRAND_CONTRACT.md` + this file
3. TORO General Plan
4. tenant brand contract
5. asset registry/library

Any material change to logo, brand architecture, core palette or naming requires owner approval and update of canonical records.

## 13. Priority closeout

P0:
- stop new TORO BRAIN / TORO OS visible propagation;
- align PayFlow/current modules to TORO Work;
- define co-branding boundary with Dreamcatcher;
- propagate Design DNA into generation prompts/contracts.

P1:
- approved TORO wordmark;
- vector/small-size/mono/reverse variants;
- exact typography and licenses;
- component token package;
- tenant theme contract;
- design QA checklist.

P2:
- controlled propagation to website, portal, WhatsApp handoffs, reports, decks, email, social, mobile and future apps;
- visual regression/brand QA;
- rollback lineage for every production derivative.
