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

## Optimization order after the submitted batch

1. Send the exact duplicate-merge message only after action-time confirmation and record the case ID/provider response.
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

