-- SANDBOX ONLY — destructive only to SECOND-TENANT-R1 synthetic fixture.
-- Never run against production.

delete from core.fulfillments where evidence_ref='SECOND-TENANT-R1';
delete from core.order_lines where source_authority='SECOND-TENANT-R1';
delete from core.work_objects where source_authority='SECOND-TENANT-R1';
delete from core.orders where source_authority='SECOND-TENANT-R1';
delete from core.offerings where source_authority='SECOND-TENANT-R1';
delete from core.external_references where source_authority='SECOND-TENANT-R1';
delete from core.relationships where source_authority='SECOND-TENANT-R1';
delete from core.parties
where id in (
  '51000000-0000-4000-8000-000000000101',
  '51000000-0000-4000-8000-000000000102'
);

delete from identity.organization_memberships
where source='SECOND-TENANT-R1';

delete from public.user_roles
where user_id in (
  '20000000-0000-4000-8000-000000000101',
  '20000000-0000-4000-8000-000000000102',
  '20000000-0000-4000-8000-000000000103'
);

delete from public.employees
where id in (
  '40000000-0000-4000-8000-000000000101',
  '40000000-0000-4000-8000-000000000102',
  '40000000-0000-4000-8000-000000000103'
);

delete from auth.users
where id in (
  '20000000-0000-4000-8000-000000000101',
  '20000000-0000-4000-8000-000000000102',
  '20000000-0000-4000-8000-000000000103'
);

delete from public.organizations
where id in (
  '10000000-0000-4000-8000-000000000101',
  '10000000-0000-4000-8000-000000000102'
);

delete from private.toro_portability_sandbox_manifest
where fixture_key='SECOND-TENANT-R1';

-- Schemas/tables are intentionally retained for repeated portability QA.
