# Concession Hunter — TORO Owner / Portfolio · V1

**State:** TARGET governance + read-only portal reference (not a live watcher). **Date:** 2026-10-21. **Authority:** Sole TORO General Plan at `docs/product/TORO_BRAIN_GENERAL_PLAN.md`.

## Purpose, roles and containment

Search Costa Rican ZMT opportunities from Paquera through Cóbano/Cabuya–Montezuma/Tambor–Tango Mar to Nandayure/Coyote–San Miguel. Help a verified owner and expressly authorized partner plan lawful concession applications, but never imply that an unlisted or abandoned parcel is legally free. Operate inside existing **TORO Portfolio + Legal y Riesgo + Activos y Espacios**, not as a new brain, database, portfolio plan, writer or scheduler.

**Private scope:** `personal` or private owner-approved portfolio, least privilege, no hotel-employee access and no automatic access by mere familial/partner relationship. Partner access must come from verified individual identity plus explicit owner consent and a scope-scoped authorization. Public site code and docs contain **no private parcel inventory, beneficial ownership, home address, personal relationships, or live lead ranking**. Supabase existing private property/relationship knowledge is authoritative for TORO's research snapshots; municipal ZMT, official cadastral plan, Registry of concessions, ICT and SINAC remain authoritative for their respective legal facts. Dropbox original evidence only, Airtable projection only.

## Evidence pipeline

1. **Discover:** existing official municipal plans and requests, La Gaceta, ICT, SNIT/SIRI, Registro Nacional, SINAC/PNE, field-survey files and current official municipal inventory for all candidate lots including *no application on record*. Every entry has an evidence URL/file ref, source date, observed date, named agency and region/sector.
2. **Georeference:** immutable cadastral plan identifier, mojones and exact polygon with CRS, polygon source, hash/date; zoning GIS and public/road/protection layers with revision. **Never derive certified boundaries from screenshots or visual alignment alone.**
3. **Legal truth:** statuses are independent axes: municipal application, opposition, contract award, Registry inscription, expiry/renewal/archival, occupation and constructions, PNE, beach public zone, ICT tourist aptness, municipal road/right-of-way, approved use and outstanding canon per period. Distinguish issued vs approved vs executed vs registered, and recommended archive vs final and notified archive. No absence from web results = no right.
4. **Qualify:** `DISCOVERED_UNVERIFIED` → `PLAN_AND_GEOMETRY_VERIFIED` → `NO_CURRENT_REQUEST_CERTIFIED` → `REGISTER_AND_ENVIRONMENT_CERTIFIED` → `LEGAL_ELIGIBILITY_REVIEWED` → `OWNER_APPROVED_TO_FILE`. Each gate requires official dated primary evidence. `DISPUTED`, `PROTECTED` or `ALREADY_REQUESTED` blocks advertising as available.
5. **Decision:** evaluate intended lawful use, survey/legal fees, annual canon, access, title risk, environmental carrying capacity, opportunity cost, liquidity, repeatability and potential contributions. Unknown economics = `NO_MEDIDO`; no hidden budget commitment.

## Lawful multi-concession boundary

Ley 6043 art. 57(e) in tourist-declared zones limits an individual together with spouse and minor children to one concession. ICT opinion AL-A-0977-2024: wording does not automatically impose the identical numerical ceiling on legal entities, but municipalities may deny excessive concentration. PGR doctrine warns against company structures used to circumvent legal limits. Record the **applicant, spouse/minors when legally applicable, controlled entities, existing concessions, beneficiary/related-party conflicts and declared tourist-zone classification**, only from authorized private sources. No shell-company bypass, false nominees, assignment without approval or automatic grant to the partner. A corporate hospitality registration or ICT tourism declaration is **not** a concession title.

Authorities: [Ley 6043 official lookup](https://www.pgrweb.go.cr/scij/), [ICT AL-A-0977-2024](https://www.ict.go.cr/es/root-documentos-no-apagar/asesoria-legal-1/tesauros/3128-al-a-0977-2024/file.html), municipal official ZMT sources.

## First geographic iteration

- **Cabuya–Montezuma:** existing integrated coastal plan formally adopted 2016; inspect zoning MIX, TAP, public roads, PNE and current applications. The existence of zoned tourism hectares never establishes availability.
- **Tambor / Tango Mar:** distinct Playa Tambor planning and ownership/concession context; do not mix water abstractions or privately titled properties with municipal ZMT concession rights. Request current plot/marker index.
- **Paquera and Nandayure:** other municipal jurisdictions, distinct plan status and inventories. Test requests/expiry/appeals against current registry and public-domain maps.
- **Cóbano Playa Carmen:** maintain historical application, public road and private hotel property as separately scoped research; never infer that unrelated parcels are contiguous.

## TARGET experience / NEXT technical work

The route `/my-toro/concession-hunter` is a **read-only public-source guide, under owner ADMIN membership and organization context**; it does not pull or publish private dossiers, advertise live vacancy or claim to execute research continually. Link it from **Mi espacio**, not a new numbered 00–11 domain. Do not promote the route to a live hunter until identity binding and proof of private source authorization pass. For eventual private read endpoint reuse the current server-only data access and existing RLS; enforce owner scope and field minimization *on the server*; test employee, admin-but-nonowner, unknown user, mixed organization and partner-without-grant denials.

A perpetual monitor is **not operating merely by implementing a page or PR**. There are already 20 active ChatGPT scheduled tasks; prioritize reuse of an existing owner-private research worker *with explicit scope change and owner controls*, or free a slot with the owner's approval; never create paid monitors or duplicate schedulers automatically. Planned cadence: daily delta scan with max two cases per cycle, primary-source caching/dedupe; weekly owner private digest only for legally meaningful changes. Silent no-change; escalating actual legal deadlines only after verifying documents. No autonomous filing, notices, payments, introductions, contracts, companies, cadastral filings or municipal complaints. Write only via TORO existing task → run/lease/fencing → authorized worker → CAS/readback → receipt. CURRENT evidence may exist privately in Supabase; it is not a deployed UI/data pipeline.

## Acceptance and rollback

- Private viewer ownership gate denies employee, ordinary administrator and unauthenticated sessions. Intended Ale access requires separate verified grant and test.
- Public documents never include private beneficial ownership, share percentages, locations of personal assets or exact financial data.
- UI labels proven vs unverified and authentic existing sources with dates; no fake map, filters, automation or final-right statuses.
- Only a screenshot-independent georeferenced official parcel can acquire a geometry-verified badge.
- Frontend changes require directed tests, lint/build, review, PR and authenticated preview before merge/deploy. The current draft is **not published**. Revert branch/PR without affecting original source data if tests fail.
