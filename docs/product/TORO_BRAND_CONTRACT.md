# TORO OS — Brand Identity Contract

**Status:** CURRENT  
**Date:** 2026-09-22

## Official identity

TORO OS uses the verified **blue bull with gold horns** identity.

### Verified source artwork

- Source repository: `Dramcatcherst/toro-os-v88-new`
- Source path: `public/assets/toro-azul-logo.jpg`
- Git blob SHA: `d9af9a45467ba96ce1e1456ac213491e24e44121`
- Registry record: `BRAND-005 — TORO OS blue bull logo`
- Registry status: `READY`
- Approved derived pack: `public/assets/toro-blue-pack/`
- Deprecated pack: `public/assets/toro-blue-pack-v1-deprecated/`

The source registry states that the blue bull with gold horns is the TORO OS identity mark.

## Non-negotiable rule

Official TORO surfaces must not substitute the identity with:

- generated bull artwork;
- a gold-only bull;
- a cartoon bull;
- another animal;
- a recolored approximation;
- a derivative that cannot be traced to the verified source artwork.

## Repository migration gate

The current product repository must contain a byte-preserving copy of the verified source artwork before a new public-facing TORO experience is released.

The current GitHub connector can identify the binary blob and SHA but does not return the large JPG bytes in a form that can be safely copied between repositories. Therefore:

- the source is **VERIFIED**;
- the identity is **CANONICAL**;
- local binary migration into `Dramcatcherst/Toro-OS` remains **PENDING**;
- no replacement should be generated to bypass that pending migration.

When migrated, verify the file against the source content/blob identity and record the final local path here.

## Visual system direction

The product should feel:

- premium;
- intelligent;
- calm;
- distinctive;
- confident;
- precise;
- alive without being childish.

The blue bull is a brand anchor, not decorative wallpaper. Use it with restraint and preserve visual hierarchy, legibility and functional clarity.

## Motion

Motion may communicate real system state:
- thinking;
- scanning;
- routing;
- approval;
- warning;
- completion;
- system health.

Motion must not falsely imply that an action executed, verified or succeeded.

## Dreamcatcher boundary

Dreamcatcher branding belongs to the reference implementation. It must not replace TORO OS product identity in universal product surfaces.
