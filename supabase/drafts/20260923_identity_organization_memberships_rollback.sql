-- DRAFT rollback for the first organization-membership wave.
-- Safe only before later identity-schema objects depend on these objects.

drop policy if exists organization_memberships_privileged_read
  on identity.organization_memberships;
drop policy if exists organization_memberships_self_read
  on identity.organization_memberships;

drop trigger if exists trg_validate_membership_employee_link
  on identity.organization_memberships;

drop table if exists identity.organization_memberships;

drop function if exists private.has_active_membership(uuid);
drop function if exists private.validate_membership_employee_link();

drop schema if exists identity;
