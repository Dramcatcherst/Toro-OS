# Dreamcatcher Preview Validation

Use this checklist for the Vercel Preview created from the current branch. It intentionally replaces local Playwright screenshot validation when Chromium cannot be installed inside Codex Cloud.

## Required commands

```bash
npm install
npm run build
npm run lint
npx vercel --yes
```

If `npx vercel` is blocked by the Cloud package registry or missing Vercel auth, deploy the same commit through the connected Vercel project and validate the Preview URL there.

## Preview checks

Replace `$PREVIEW_URL` with the Vercel Preview URL:

```bash
curl -I $PREVIEW_URL/
curl -I $PREVIEW_URL/dreamcatcher
curl -I $PREVIEW_URL/os
curl -I $PREVIEW_URL/sitemap.xml
curl -I $PREVIEW_URL/robots.txt
curl -I $PREVIEW_URL/manifest.webmanifest
curl -s $PREVIEW_URL/api/site-health
curl -s $PREVIEW_URL/api/connectors/kross
```

Expected result:

- `/` returns 200 and serves the Dreamcatcher public home.
- `/dreamcatcher` returns 200 and serves the same Dreamcatcher microsite experience.
- `/os` returns 200 and preserves the TORO OS operator dashboard.
- SEO/PWA surfaces return 200.
- `/api/site-health` returns the route map and guardrails without exposing secrets.
- `/api/connectors/kross` returns direct-booking readiness without mutating Kross.

## Safety confirmation

The preview validation must confirm that the public website only prepares inquiry drafts. It must not write to Kross, Airtable, WhatsApp Business, social channels, payments or reservations.
