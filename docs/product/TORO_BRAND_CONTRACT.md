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
- Historical library path: `/TORO Brain/Brand/01_Master/TORO_BRAIN_LOGO_MASTER_v1.png`
- Dimensions: 1536×1536
- SHA-256: `8828b0d89b1fb2dc9aa2127c39c3322a7b6dc018f8c1baece7a7bf69f4457a98`
- Status: **LEGACY — contains deprecated TORO BRAIN wordmark**

### Current official master
- Asset key: `toro_logo_master_v1`
- Canonical library path: `/TORO/Brand/01_Master/TORO_LOGO_MASTER_v1.png`
- Dimensions: 1536×1536
- SHA-256: `15a1b661a12cc020b905188e1638d001cc0a21d2a2f47beb4077843b478be747`
- Status: **CURRENT MASTER**

#### Exact-byte repository mirror — verified 25/10/2026

The recovered current-master bytes are **JPEG, 1536×1536**, with the exact current SHA-256 above. The registered source path keeps its historical `.png` spelling; that name is not evidence of the encoded format. No conversion, redraw or new master was made.

- Repository mirror: `public/brand/toro/toro-logo-master-v1.jpg`, 386285 bytes.
- Verified source: PR347 commit `0d1934cc7018d52247ff0943475c3e7a1b1f57c8`, Git blob `fc0cea99e080c9d7785d37dde57e57aa15d3d86e`.
- Portal header use: the intact square image with `object-fit: contain`, through the exact JPEG URL. The Portal perimeter admits only safe GET/HEAD reads of that asset; neighboring files, writing methods and image-optimizer routes remain closed.
- This mirror is the same current master identified by hash, not the legacy `d9af9a...` artwork below. Favicon/app-icon derivatives remain governed by their separate approval and provenance pipeline.

### Owner-approved interim web icon — 15/10/2026

Mauricio authorized using an available logo or favicon when the current master file could not be recovered. This exception is limited to favicon and app-icon surfaces.

- Source: Dropbox asset `blue-bull-premium-close-up-gallery.png`
- Dropbox file ID: `id:RAP-nKYFY_UAAAAAAAIwNA`
- Source dimensions: `768×768`, transparent PNG
- Source SHA-256: `3767585343327970af6fb4a39790089d4a765e155208458f9fea1620b23fc384`
- Derived `src/app/favicon.ico` SHA-256: `94d0fd098cc99dd7cbca162e83bf55721dca224ba3df1dcf0a2c42a6718b4e01`
- Derived `src/app/icon.png` SHA-256: `df2038d1e82e7ba71e73cfff00ddf0dfed6da594f9a5e9053acd48b1b670e3c9`
- Derived `src/app/apple-icon.png` SHA-256: `4946c4c00b37ee7a2e3cffa65b9db7eb71ae459e013a6e5f69b7b3638b2c9ab4`
- Status: **INTERIM OWNER-APPROVED DERIVATIVE** — not a new brand master.

Replace these derivatives when the exact current master bytes are recovered. Do not use this exception to replace the canonical master in general branding.

### Brand documents
- `/TORO/Brand/01_Master/` = current master folder
- Legacy TORO Brain manifests/documents remain historical references until superseded by TORO-named documents.

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

Production derivatives normally trace back to the current master asset key and hash. A documented owner-approved interim exception may be used for a bounded surface while the master bytes are unavailable; it must not be promoted to a new master.

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


## 13. Cross-product Design DNA

The canonical cross-product visual and interaction contract is:
`docs/product/TORO_DESIGN_DNA.md`.

It defines the three presentation modes:
- TORO Core
- TORO Work
- TORO Embedded

These are modes of one TORO brand, not separate identities.

Dreamcatcher remains a tenant brand with its own guest/public visual system. TORO components may power Dreamcatcher surfaces without replacing Dreamcatcher identity.
