# Kross Public Booking Deep-Link Observation — 2026-09-23

**Scope:** Dreamcatcher public Kross booking engine  
**Mode:** public search only / no reservation / no personal data / no payment  
**Result:** one-room search state is encoded in a shareable URL  
**Important:** observed public behavior, not vendor API documentation

## Controlled observation

A public availability search was performed on:
- arrival: 2026-10-10;
- departure: 2026-10-12;
- rooms: 1;
- adults: 2;
- children: 0.

Observed result URL:

`https://dreamcatcherhotel.kross.travel/book/step1?adults=2&children=0&rooms=1&guests=2&n_guests=2&guests_rooms=2,0;&kross_lang=en&from=2026-10-10&to=2026-10-12&`

Observed explicit parameters:
- `from=YYYY-MM-DD`;
- `to=YYYY-MM-DD`;
- `adults=N`;
- `children=N`;
- `rooms=1`;
- `guests=N`;
- `n_guests=N`;
- `guests_rooms=ADULTS,CHILDREN;`;
- `kross_lang=en|es`;
- currency can be supplied as `currency=USD|CRC`.

## Product decision

TORO may use this observed pattern only for **user handoff**:
- collect dates and occupancy;
- validate them locally;
- construct a one-room Kross search URL;
- open the official Kross booking engine.

TORO may **not**:
- parse the result into live PMS truth;
- call this a Kross API;
- set `source_is_live=true` from the public page;
- infer internal arrivals/departures;
- create or modify reservations;
- assume the multi-room distribution syntax beyond what has been directly observed.

## Initial limit

The first helper supports:
- exactly 1 room;
- 1–12 adults;
- 0–6 children;
- USD or CRC;
- Spanish/English link language;
- valid future/ordered date pairs.

Multi-room deep-link construction remains disabled until directly observed or documented.

## Implementation

- builder: `src/features/kross/public-search-link.ts`;
- UI: `src/features/kross/booking-assist.tsx`;
- route: `/booking-assist`;
- tests: `src/features/kross/public-search-link.test.ts`.

This is a UX continuity improvement while structured Kross transport remains blocked.
