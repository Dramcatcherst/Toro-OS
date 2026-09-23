-- Rollback for harden_current_reservations_safe_kross_gate_20260923
-- Restores the pre-2026-09-23 predicate only. Does not modify reservation rows.

create or replace view operations.current_reservations_safe
with (security_invoker=true, security_barrier=true)
as
select
    id,
    org_id,
    property_id,
    external_reservation_id,
    reservation_key,
    guest_id,
    guest_key_raw,
    room_id,
    room_code_raw,
    stay_key_raw,
    check_in,
    check_out,
    status,
    guests_count,
    adults,
    children,
    channel,
    breakfast_included,
    total_amount,
    currency,
    payment_status,
    amount_paid,
    transactional_authority,
    read_only_mirror,
    source_is_live,
    source_system,
    source_table,
    source_record_id,
    snapshot_as_of,
    last_synced_at,
    source_hash,
    data_quality_status,
    created_at,
    updated_at
from operations.reservations r
where source_is_live = true
  and last_synced_at is not null
  and (now() - last_synced_at) <= interval '6 hours'
  and check_out >= (current_date - 1);
