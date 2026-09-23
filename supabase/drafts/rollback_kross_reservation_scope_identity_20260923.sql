-- Rollback for kross_reservation_scope_identity_guard_20260923
-- Removes only the Kross-specific scoped external identity index.
drop index if exists operations.reservations_kross_scope_external_uq;
