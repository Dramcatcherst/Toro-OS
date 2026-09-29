-- SANDBOX ONLY — run after identity + Core drafts are applied.

insert into identity.organization_memberships(
  org_id,user_id,membership_type,status,primary_employee_id,source,joined_at
)
values
  ('10000000-0000-4000-8000-000000000101','20000000-0000-4000-8000-000000000101','owner','active','40000000-0000-4000-8000-000000000101','SECOND-TENANT-R1',now()),
  ('10000000-0000-4000-8000-000000000101','20000000-0000-4000-8000-000000000102','employee','active','40000000-0000-4000-8000-000000000102','SECOND-TENANT-R1',now()),
  ('10000000-0000-4000-8000-000000000102','20000000-0000-4000-8000-000000000103','owner','active','40000000-0000-4000-8000-000000000103','SECOND-TENANT-R1',now())
on conflict (org_id,user_id) do nothing;

insert into core.parties(id,org_id,party_type,display_name) values
  ('51000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','organization','Synthetic Client Alpha'),
  ('51000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000102','person','Synthetic Retail Customer')
on conflict (id) do nothing;

insert into core.relationships(id,org_id,party_id,relationship_type,status,source_authority) values
  ('52000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','51000000-0000-4000-8000-000000000101','customer','active','SECOND-TENANT-R1'),
  ('52000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000102','51000000-0000-4000-8000-000000000102','customer','active','SECOND-TENANT-R1')
on conflict (id) do nothing;

insert into core.external_references(id,org_id,party_id,system,external_entity_type,external_id,source_authority) values
  ('52500000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','51000000-0000-4000-8000-000000000101','synthetic_crm','customer','CUST-001','SECOND-TENANT-R1'),
  ('52500000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000102','51000000-0000-4000-8000-000000000102','synthetic_crm','customer','CUST-001','SECOND-TENANT-R1')
on conflict (id) do nothing;

insert into core.offerings(id,org_id,offering_type,name,status,currency,source_authority) values
  ('53000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','service','Synthetic Preventive Maintenance Plan','active','USD','SECOND-TENANT-R1'),
  ('53000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000102','physical_product','Synthetic Coffee Beans 1kg','active','USD','SECOND-TENANT-R1')
on conflict (id) do nothing;

insert into core.orders(id,org_id,customer_party_id,order_type,status,currency,subtotal,total,payment_status,fulfillment_status,source_authority) values
  ('54000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','51000000-0000-4000-8000-000000000101','service_order','confirmed','USD',500,500,'unpaid','pending','SECOND-TENANT-R1'),
  ('54000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000102','51000000-0000-4000-8000-000000000102','sale','confirmed','USD',24,24,'paid','pending','SECOND-TENANT-R1')
on conflict (id) do nothing;

insert into core.order_lines(id,org_id,order_id,offering_id,description_snapshot,quantity,unit_price,line_total,source_authority) values
  ('54500000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','54000000-0000-4000-8000-000000000101','53000000-0000-4000-8000-000000000101','Synthetic Preventive Maintenance Plan',1,500,500,'SECOND-TENANT-R1'),
  ('54500000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000102','54000000-0000-4000-8000-000000000102','53000000-0000-4000-8000-000000000102','Synthetic Coffee Beans 1kg',2,12,24,'SECOND-TENANT-R1')
on conflict (id) do nothing;

insert into core.work_objects(id,org_id,customer_party_id,work_type,title,status,source_authority) values
  ('55000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','51000000-0000-4000-8000-000000000101','field_service','Synthetic Quarterly HVAC visit','scheduled','SECOND-TENANT-R1'),
  ('55000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000102','51000000-0000-4000-8000-000000000102','fulfillment_case','Synthetic Prepare pickup','in_progress','SECOND-TENANT-R1')
on conflict (id) do nothing;

insert into core.fulfillments(id,org_id,order_id,work_object_id,fulfillment_type,status,evidence_ref) values
  ('56000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000101','54000000-0000-4000-8000-000000000101','55000000-0000-4000-8000-000000000101','service_visit','scheduled','SECOND-TENANT-R1'),
  ('56000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000102','54000000-0000-4000-8000-000000000102','55000000-0000-4000-8000-000000000102','pickup','ready','SECOND-TENANT-R1')
on conflict (id) do nothing;
