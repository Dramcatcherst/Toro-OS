# Tripadvisor native audit — Dreamcatcher Hotel

**Cutoff:** 2026-10-17 · America/Costa_Rica  
**Scope:** Tripadvisor Management Center, main listing `locationId=1655967`.  
**Authority boundary:** this record distinguishes submitted, processing, pending acceptance/moderation and publicly published states. Tripadvisor provider readback is required before any pending state is called live.

## Verified state

- Owner-capable access is live in the institutional Chrome profile. The listing can be managed at `https://www.tripadvisor.com/overview?locationId=1655967`.
- Five users have Verified owner access. Their visible masked domains are Gmail, Live, Hotmail and `atrapasuenos.net`; no user on the `dreamcatcherhotel.com` domain is visible.
- Pre-change identity was `Dreamcatcher Hotel`; address `1 km North of the Crossroads, Santa Teresa 60111 Costa Rica`; 12 rooms/suites; business status open.
- Pre-change description began with the legacy name `Atrapasuenos-Dreamcatcher` and did not represent the current room, apartment and villa portfolio.
- Stored contact values are `+506 2640 0080`, `info@dreamcatcherhotel.com` and `http://www.dreamcatcherhotel.com`. Tripadvisor says these contact links are not publicly displayed without Business Advantage. The phone remains unverified in this unit; the canonical website uses HTTPS.
- Media manager contains 208 photos and zero videos. The current primary image is a daylight pool/garden view, media ID `393688627`.
- Reputation: 4.5/5 from 210 reviews. The native `No response` filter returns 144 reviews.
- Latest review: Barbara B, 2/5, 2026-01-04, Italian. It reports humidity and limited ventilation in ground-floor rooms, no place to dry swimwear, and breakfast not being replenished; it acknowledges the location.
- Native analytics for 2026-09-16 through 2026-10-15: rank #19 of 30 hotels in Santa Teresa; 2,202 listing impressions; 522 unique page visitors; 5 booking clicks; 0 direct referrals; 0 contact-link clicks.
- Public listing `locationId=34420954` remains outside the managed portfolio. The focused read below now classifies it as a duplicate of the main Dreamcatcher property.

## Submitted batch and native readback

Mauricio confirmed the three displayed actions immediately before execution. Cutoff: `2026-10-17T03:58:58-06:00`.

### General information — submitted, processing

- Submitted name: `Dreamcatcher Hotel & Villas`.
- Room count remains 12.
- Submitted English description, 650/999 characters:

> Dreamcatcher Hotel & Villas is a tropical boutique stay in Santa Teresa, Costa Rica, a short walk from the beach. The property combines distinctive hotel rooms, apartments with kitchens and private villas for couples, families and groups, surrounded by lush gardens and a swimming pool. Guests can explore nearby surf, restaurants and wellness experiences while staying close to the relaxed energy of Santa Teresa. Each accommodation has its own layout and amenities, from compact lofts to larger spaces for groups and private celebrations. For current room details, availability and rates, visit the official Dreamcatcher website and booking engine.

Native readback showed `Your changes have been saved`, the new values in Management Center and `Processing` on General Information. This proves Tripadvisor accepted the edit; it does not yet prove public propagation.

### Institutional access — invitation sent, acceptance pending

- Recipient: `admin@dreamcatcherhotel.com`.
- Access level: Verified owner.
- Affiliation: Owner.

After `Send invite`, the form closed and Tripadvisor showed `Invitation will be sent to`. The Verified owner table still shows five users, so the institutional account is not yet active. Invitation delivery and account acceptance remain separate states.

### First reputation response — moderation pending

Submitted Italian reply to Barbara B:

> Grazie, Barbara, per aver condiviso la sua esperienza. Ci dispiace che le camere al piano terra siano risultate umide e poco aerate, che mancasse uno spazio pratico per stendere i costumi e che la colazione non fosse stata rifornita adeguatamente. Questi punti richiedono attenzione e li prendiamo sul serio. Apprezziamo anche il suo commento sulla posizione. Se desidera, può contattarci tramite il sito ufficiale indicando le date del soggiorno, così potremo approfondire il caso in modo serio e diretto. — Hotel Dreamcatcher

Native readback shows `Response pending`, a disabled response field containing the submitted text and the self-service control `Delete Response`. It is submitted but not yet published.

### Canonical data readback

Supabase `operations.knowledge_items`, row `50df0e7d-1aed-489a-a942-274715734dd0`, advanced idempotently from `link_directory.version=2.4` through `2.5` to `2.6` while preserving 264 entries. Separate reads confirmed the submitted batch and duplicate classification:

- `state=native_owner_access_verified_updates_processing`
- `business_name_change_status=processing`
- `institutional_admin_invitation_status=sent_pending_acceptance`
- `review_response_status=pending_moderation`
- `possible_duplicate_status=verified_duplicate_of_main_booking_source`
- `toro_booking_property_id=14338337`
- `toro_separate_listing_eligibility=blocked_on_physical_license_and_nonoverlap_evidence`

## Duplicate classification and prepared merge request

Native/public read of `locationId=34420954` found:

- Public name `Dreamcatcher Santa Teresa`, address `C. Cóbano, Puntarenas 60111 Costa Rica`, zero reviews and five provider photos.
- Tripadvisor presents it as unclaimed and shows the free-claim prompt.
- The page's only loaded partner is Booking.com. Its `Read more on Booking.com` destination is `https://www.booking.com/hotel/cr/dreamcatcher-santa-teresa-puntarenas.html`.
- That Booking.com destination identifies itself as `Dreamcatcher Hotel & Villas, the best kept secret of Santa Teresa`, the main Dreamcatcher property, with the same Cóbano/Dreamcatcher address. It is not the separate `TORO by Dreamcatcher` page.
- Management Center's own FAQ routes duplicate cases to `https://www.tripadvisor.com/OwnerSupport-a_category.4-a_locationid.1655967-a_topic.47`, which opens the Virtual Support Assistant.

Decision: `34420954` is a duplicate of main managed listing `1655967`. Preserve `1655967`, its 210 reviews and owner access. Do not rename or repurpose the duplicate as TORO, and do not create a third listing.

Prepared, not sent, support message:

> Hello. I manage Dreamcatcher Hotel & Villas in Santa Teresa, Costa Rica. Tripadvisor currently has two accommodation listings for the same property. Please merge the unclaimed duplicate `locationId=34420954` into the managed main listing `locationId=1655967`. Main listing to preserve: https://www.tripadvisor.com/Hotel_Review-g635538-d1655967-Reviews-Dreamcatcher_Hotel-Santa_Teresa_Province_of_Puntarenas.html. Duplicate: https://www.tripadvisor.com/Hotel_Review-g309287-d34420954-Reviews-Dreamcatcher_Santa_Teresa-Puntarenas_Province_of_Puntarenas.html. The duplicate's Booking.com content link opens the same main property, `Dreamcatcher Hotel & Villas, the best kept secret of Santa Teresa`, at https://www.booking.com/hotel/cr/dreamcatcher-santa-teresa-puntarenas.html. Please keep listing `1655967`, its reviews and management access, and confirm the case number plus which content will be preserved before completing the merge.

Sending this message and initiating consolidation are external representational/destructive actions and require confirmation immediately before `Ask`.

## Amenities requiring operational verification

Do not save this section yet. The current listing includes claims that may be stale or overbroad: free breakfast, hot tub, babysitting, dry cleaning, yoga classes, pet friendly, wheelchair access/reduced-mobility rooms, smoking rooms available, airport transportation, car hire, shuttle service, kitchenette, private balcony and coffee/tea maker. Verify each against current operating reality and accommodation-level scope before changing the listing.

## TORO by Dreamcatcher eligibility gate

Mauricio describes `TORO by Dreamcatcher` as a sub-brand for units 21–28 and villa, while the main Dreamcatcher listing keeps the complete portfolio. Booking.com currently verifies a distinct `Toro by Dreamcatcher` property, ID `14338337`, at `https://www.booking.com/hotel/cr/toro-by-dreamcatcher.html`; the focused current result showed three reviews. No separate Tripadvisor TORO listing appeared in the focused search.

Tripadvisor's current listings guidelines do not permit a second accommodation listing merely for a group of rooms inside another property. A second listing is defensible only after evidence proves a fully separate section/property, official name, separate lodging/business license, non-overlapping inventory and its own reservable identity. A villa sold to one reserving party is not, by itself, a traditional accommodation listing. Current Kross public read shows all 22 solutions under `Dreamcatcher Hotel & Villas`, including rooms 21–28 and `Villa Toro`; therefore Booking separation alone does not prove channel/inventory non-overlap.

Before a true TORO Tripadvisor listing is requested, verify the physical boundary, separate lodging license and OTA/Kross unit mapping. Creating a TORO listing from `34420954` or duplicating the main inventory is out of scope. Primary sources: [Tripadvisor Listings Guidelines](https://www.tripadvisor.com/Trust-lvz7RK0Xs9UI.html), [listing request duplicate rule](https://www.tripadvisor.com/Trust-l8rPRnqD79BM.html), and [Popularity Ranking factors](https://www.tripadvisor.com/business/insights/resources/tripadvisor-popularity-ranking).

## DIEX source read and canonical drift — 2026-10-17

The first pass was read-only across Dropbox, the institutional Dreamcatcher Gmail account, Airtable `TORO OS — Master Brain` and Supabase. Mauricio then supplied the exact Admin Mode phrase recorded below, authorizing only the two Airtable ID corrections and the evidence update to the existing Supabase candidate. No OTA, Kross, rate, availability, inventory or channel mapping was changed.

### Primary-document findings

- Dropbox folder inspected: `/HOTEL ATRAPASUEÑOS Dropbox caché de espacio de equipo/HOTEL ATRAPASUEÑOS/CONSTRUCCION/DIEX PROYECTO NUEVO`.
- `DOCUMENTOS/ART 010 RES 1670-2022-SETENA DIGITAL RVLA D1-0534-2022.pdf` grants environmental viability to **Casa de Habitación Diex de Santa Teresa**, expediente `D1-0534-2022-SETENA`, plano `6-986552-2005`, finca `2611-Z--000`, 1,277.07 m². Its stated purpose is a two-level single-family house with pool, terraces, parking, sidewalks and green areas. It is an environmental license, not a separate lodging/business license. The resolution also says a change in activity type must be reported to the municipality.
- `PLANOS 2023/2023-10-24 Atrasueños LAMINAS_compressed (1).pdf` repeatedly identifies the project as `CASA DE HABITACION`, owned by DIEX de Santa Teresa S.A., on cadastral plan `6-986552-2005`.
- `DOCUMENTOS/PLANO CATASTRO DIEX RNPDIGITAL-15579-2024.pdf` is the Registro Nacional certification for cadastral plan `6-986552-2005`. It proves the certified plan, not hotel-operation authorization.
- `BIONEST/Carta Compromiso Firmada.pdf`, dated 2025-04-09, commits to operating and maintaining the wastewater treatment plant for `Hotel Atrapasueños`. It cites plan `6-985652-2005`, transposing the adjacent `65`/`56` digits found in the SETENA resolution, architectural plans and cadastral certification (`6-986552-2005`). This letter is wastewater-operation evidence, not a lodging license; the cadastral mismatch requires clarification against the signed original/filing.
- Exact institutional Gmail searches for both cadastral numbers and for DIEX plus `licencia`, `patente` or `uso de suelo` returned zero messages. This is a scoped negative search, not proof that the document does not exist elsewhere.

### Structured-system findings

- Airtable Master Brain models `Villa Toro` as rooms 21–28 plus the whole-villa sellable unit. Both the eight component rooms and the whole villa are marked active/Kross-controlled/ready. This proves the current catalog model but not parent-child inventory locking or non-overlapping OTA inventory.
- Supabase `kross_toro_housekeeping_integration_plan_2026_09_v1`, under `channel_alignment_audit_20261006`, maps room `#27` to Kross room type `43` for Agoda, Airbnb and both Booking.com properties (`14240671` and `14338337`). The statuses remain `observed_mapping_not_end_to_end`.
- Before execution, Airtable was stale in exactly two records: `07 Kross References/rec5Q2ezaVTcGJvg9` and `20 Kross BE Content Master/recmicop0rRJ1JKpk` stored Kross ID `28`. The current Kross correction receipt and Supabase map use `43`; legacy `28` is disabled but recoverable.
- Supabase `dreamcatcher_system_database_directory_v1` already recorded the separate-listing gate and the current Kross overlap. The authorized update therefore enriched the same `candidate.tripadvisor` object rather than creating another row, table or directory.

### Admin Mode execution and readback — 2026-10-17 04:44 CR

- **HECHO:** the evidence set narrows DIEX to residential/environmental/construction proof plus a later PTAR commitment; no separate TORO lodging license was found in the searched sources.
- **HECHO — Airtable:** exact Admin Mode was received. `rec5Q2ezaVTcGJvg9` now stores numeric Kross ID `43` and a provenance note that identifies current `idrt=43`, disabled/recoverable legacy `idrt=28` and the four observed Supabase channel mappings. `recmicop0rRJ1JKpk` now stores text Kross ID `43`, last-sync `2026-10-17` and the same identity boundary in QA notes. Fresh independent reads returned `43` from both records.
- **HECHO — Supabase:** the existing row `50df0e7d-1aed-489a-a942-274715734dd0`, key `dreamcatcher_system_database_directory_v1`, advanced only `link_directory.version` from `2.6` to `2.7`. Readback preserved 264 entries and exactly one `candidate.tripadvisor`; that object now contains 30 structured DIEX/TORO controls, four observed room-27 mappings, the cadastral conflict, missing-authority gates and explicit `false` receipts for rate, availability, inventory, channel and Kross-configuration changes.
- **HECHO — Kross read-only comparison:** current `idrt=43` is `#27 Superior King Room`, 30 m², up to two guests, one king bed, private bathroom, no kitchen and seven images; its long description still mentions the projector. Disabled legacy `idrt=28` is `#27 Intimate King Room with Projector`, 20 m² and fourteen images. They also expose different location text. Common facts are two guests, one king bed, private bathroom and no kitchen. The duplicate identity is resolved in favor of `43`, but title, metrage, photo set, projector surfacing and location still require a factual room-master decision; no Kross content was copied or edited.
- **HECHO — deleted Dropbox history, read-only:** the first two event pages for the exact DIEX folder exposed a deletion batch by `Atrapasuenos Santa Teresa` on `2026-05-20 15:39:27` CR: six 2024 architectural/distribution PDFs under `PLANOS 2024` and fourteen SUPERBLOQUE calculation, quotation and technical-sheet files. Revision metadata proves the sampled files are currently deleted; `PLANOS JUNIO 2024 PLANTA BAJA FINAL.pdf` and `PLANOS JUNIO 2024 PLANTA BAJA.pdf` share the same size and content hash, while `FINAL2` is a distinct variant. No deleted filename explicitly referenced a lodging license, patent, municipal/ICT authority, Villa Toro, either cadastral number or room 27. Dropbox could list revisions but could not extract deleted-file text without restoration. Nothing was restored, moved, deleted, renamed or shared.
- **BLOQUEADO:** a separate TORO Tripadvisor/OTA listing remains ineligible until a current municipal/ICT lodging authorization, physical separation and non-overlapping channel inventory are proven.
- **DESCONOCIDO:** current municipal patent/license, the legal effect of any later change of use, parent-child inventory lock across Kross/OTAs, the correct explanation for the PTAR letter's cadastral mismatch, and which authoritative current-room source resolves the 20 m² versus 30 m² room-27 conflict.
- **NEXT único:** locate one already-approved authoritative source for the physical current room 27 — room master, applicable plan, signed measurement or approved photo set — and use it to decide title, metrage, projector and location for `idrt=43`. Any Kross write needs a separate exact Admin Mode and must leave `idrt=28` disabled.

Required exact confirmation:

`CONFIRMO ADMIN MODE: corregir en Airtable los dos registros canónicos de la habitación 27 de Kross ID 28 a 43 y actualizar el registro Supabase candidate.tripadvisor con la evidencia DIEX/TORO sin cambiar tarifas, disponibilidad, inventario ni canales.`

## Optimization order after the submitted batch

1. After the current Airtable/Supabase correction is executed and read back, send the exact duplicate-merge message only after separate action-time confirmation and record the case ID/provider response.
2. Verify completion of the name/description review, invitation acceptance and review moderation as three independent states.
3. Verify TORO physical/license boundary and Kross/OTA unit mapping before proposing any second listing.
4. Reconcile amenities with current operations and Kross accommodation details.
5. Validate phone and replace the stored HTTP website URL with the canonical HTTPS URL in one verified contact batch.
6. Curate the existing 208 photos, choose a current high-resolution primary image and add a short property video only from approved originals.
7. Process recent unanswered reviews in language-matched, personalized batches, starting with 2026–2023; do not bulk-post generic replies.
8. Re-read 30-day analytics after the listing and reputation changes; measure impressions, visitors, booking clicks and direct-referral readiness.

## Reversal

- General information can be restored by submitting the exact pre-change name and description recorded above; that would be another public edit requiring action-time confirmation and provider readback.
- The institutional invitation can be cancelled or the user removed by an existing Verified owner, but removal is a separate destructive action.
- The submitted review now exposes `Delete Response`; using it would delete public/cloud data and requires separate confirmation.
- Duplicate consolidation can be difficult to reverse. The prepared request explicitly asks Tripadvisor to preserve `1655967`, its reviews and owner access and to confirm preservation before completing the merge.
- No paid product, advertisement, Business Advantage subscription, media upload, duplicate merge or deletion was executed in this audit.

