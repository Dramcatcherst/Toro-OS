# TORO — Brand Identity Contract

**Status:** CURRENT  
**Date:** 2026-09-23  
**Owner:** TORO / Mauricio  
**Scope:** Official product identity, source-of-truth rules, logo masters, derivatives and production gates

## 1. Canonical brand

The only visible product/brand is **TORO**. `TORO Brain` and `TORO OS` are deprecated visible names retained only for historical/technical compatibility.

`TORO OS` is a technical legacy alias only where older keys, repository names or integrations still require it. It must not be presented as a second product, brand, brain or master plan.

## 2. Core metaphor

- **Blue bull:** the business / living organization.
- **Brain + microchip/circuit:** one fused symbol for biological intelligence + AI/computation.
- **Meaning:** a relatively small, well-connected intelligent core can coordinate a much larger and more powerful system.

The brain and microchip are not separate product identities.

## 3. Current official masters

### Legacy wordmark (do not use on new public surfaces)
- Asset key: `toro_brain_logo_master_v1`
- Canonical library path: `/TORO/Brand/01_Master/TORO_BRAIN_LOGO_MASTER_v1.png`
- Dimensions: 1536×1536
- SHA-256: `8828b0d89b1fb2dc9aa2127c39c3322a7b6dc018f8c1baece7a7bf69f4457a98`
- Status: **LEGACY — contains deprecated TORO BRAIN wordmark**

### Current official master
- Asset key: `toro_logo_master_v1`
- Canonical library path: `/TORO/Brand/01_Master/TORO_BRAIN_ISOTYPE_MASTER_v1.png`
- Dimensions: 1536×1536
- SHA-256: `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747`
- Status: **CURRENT MASTER**

### Brand documents
- `/TORO/Brand/01_Master/TORO_BRAIN_BRAND_MASTER_MANIFEST_v1.md`
- `/TORO/Brand/TORO_BRAIN_BRAND_SYSTEM_v1.md`
- `/TORO/Brand/TORO_BRAIN_CLEARANCE_BRIEF_v1.md`

## 4. Legacy provenance

Historical source artwork:
- Repository: `Dramcatcherst/toro-os-v88-new`
- Source path: `public/assets/toro-azul-logo.jpg`
- Git blob SHA: `d9af9a45467ba96ce1e1456ac213491e24e44121`
- Registry record: `BRAND-005`

This historical artwork remains provenance/reference. It is **not** the current production master after the owner-approved brain+microchip identity was adopted.

Older generated logo hashes and packs remain lineage/history only.

## 5. Non-negotiable identity rules

Official production surfaces must not:
- substitute a different or generic bull;
- use bullfighting, violent or aggressive imagery as the brand language;
- recolor the bull into an unrelated identity;
- separate the brain and microchip into competing symbols;
- present TORO OS as a second public product;
- treat an unverified derivative as a new master.

Derivatives must trace back to the current master asset key and hash.

## 6. Visual character

The brand should feel:
- powerful;
- intelligent;
- noble;
- premium;
- calm;
- precise;
- technological;
- alive;
- distinctive.

It should not feel:
- violent;
- cartoonish;
- childish;
- militaristic;
- like a bullfighting brand;
- like generic crypto/AI clip art.

## 7. Approximate palette from current raster master

These values are provisional until a color-calibrated vector master is approved.

- Midnight: `#010511`
- Deep Navy: `#020C1E`
- Royal Blue Dark: `#052456`
- Royal Blue: `#084A8F`
- Electric Blue: `#0D7CC8`
- Cyan Highlight: `#39B2F0`
- Gold Main: `#EBAE4A`
- Gold Light: `#F9DB83`
- Gold Deep: `#A66F2F`
- Bronze Shadow: `#593718`

## 8. Production derivative pipeline

No hand-edited derivative becomes canonical.

Target pipeline:

`CURRENT MASTER -> approved crop/simplification -> generated derivative -> QA -> hash -> register -> deploy`

Every production derivative should record:
- parent asset key;
- parent hash;
- use case;
- dimensions;
- crop/safe-area rules;
- generated file hash;
- approval status;
- deployed surfaces.

## 9. Motion

Motion may communicate:
- thinking;
- scanning;
- routing;
- approval;
- warning;
- completion;
- system health.

Motion must not imply execution or verification that did not occur.

## 10. Naming / legal gate

Internal brand approval does not equal legal trademark clearance.

Current status:
- brand internally approved;
- visual masters approved;
- Costa Rica exact/fonetic WIPO Publish search not yet completed because the public interface requires manual reCAPTCHA;
- preliminary external research shows existing TORO uses/marks in technology/software contexts.

No filing, domain purchase bundle or high-investment public launch should be justified by an assumption of legal availability.

## 11. Remaining professional closeout

- true vector master;
- monochrome/reverse variants;
- favicon/app/small-size simplification;
- typography and license specification;
- clear-space/minimum-size rules;
- durable rights/provenance evidence for original artwork;
- Costa Rica + target-market trademark clearance;
- domain and handle verification;
- governed external backup;
- binary migration into the canonical code repository or approved CDN when tooling permits.

## 12. Dreamcatcher boundary

Dreamcatcher is the first proving ground. Its hotel branding must not replace TORO product identity in universal product surfaces.
