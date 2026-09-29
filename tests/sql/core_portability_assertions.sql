-- Assertions for TORO Core multiindustry portability draft.

-- Seed one neutral B2B tenant data set in Org A and one retail tenant data set in Org B.
insert into core.parties(id,org_id,party_type,display_name) values
  ('51000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','organization','Client Alpha'),
  ('51000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','person','Retail Customer B');

insert into core.relationships(id,org_id,party_id,relationship_type) values
  ('52000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','customer'),
  ('52000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000002','customer');

insert into core.external_references(org_id,party_id,system,external_entity_type,external_id)
values
  ('10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','crm','customer','CUST-001'),
  ('10000000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000002','crm','customer','CUST-001');

insert into core.offerings(id,org_id,offering_type,name,currency) values
  ('53000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','service','Preventive Maintenance Plan','USD'),
  ('53000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','physical_product','Coffee Beans 1kg','USD');

insert into core.orders(id,org_id,customer_party_id,order_type,status,currency,subtotal,total,payment_status,fulfillment_status)
values
  ('54000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','service_order','confirmed','USD',500,500,'unpaid','pending'),
  ('54000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000002','sale','confirmed','USD',24,24,'paid','pending');

insert into core.order_lines(org_id,order_id,offering_id,description_snapshot,quantity,unit_price,line_total)
values
  ('10000000-0000-4000-8000-000000000001','54000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000001','Preventive Maintenance Plan',1,500,500),
  ('10000000-0000-4000-8000-000000000002','54000000-0000-4000-8000-000000000002','53000000-0000-4000-8000-000000000002','Coffee Beans 1kg',2,12,24);

insert into core.work_objects(id,org_id,customer_party_id,work_type,title,status)
values
  ('55000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','field_service','Quarterly HVAC visit','scheduled'),
  ('55000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000002','fulfillment_case','Prepare pickup','in_progress');

insert into core.fulfillments(org_id,order_id,work_object_id,fulfillment_type,status)
values
  ('10000000-0000-4000-8000-000000000001','54000000-0000-4000-8000-000000000001','55000000-0000-4000-8000-000000000001','service_visit','scheduled'),
  ('10000000-0000-4000-8000-000000000002','54000000-0000-4000-8000-000000000002','55000000-0000-4000-8000-000000000002','pickup','ready');

-- Same external ID may exist in two tenants without collision.
do $$
declare n integer;
begin
  select count(*) into n
  from core.external_references
  where system='crm' and external_entity_type='customer' and external_id='CUST-001';

  if n <> 2 then
    raise exception 'expected tenant-scoped external reference reuse, got %',n;
  end if;
end
$$;

-- Cross-tenant references must fail at FK integrity layer.
do $$
begin
  begin
    insert into core.relationships(org_id,party_id,relationship_type)
    values('10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000002','customer');
    raise exception 'cross-tenant relationship reference accepted';
  exception when foreign_key_violation then null; end;

  begin
    insert into core.orders(org_id,customer_party_id,order_type,status,currency,total)
    values('10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000002','sale','confirmed','USD',1);
    raise exception 'cross-tenant order customer accepted';
  exception when foreign_key_violation then null; end;

  begin
    insert into core.order_lines(org_id,order_id,offering_id,quantity,unit_price,line_total)
    values('10000000-0000-4000-8000-000000000001','54000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000002',1,1,1);
    raise exception 'cross-tenant order-line offering accepted';
  exception when foreign_key_violation then null; end;

  begin
    insert into core.work_objects(org_id,customer_party_id,work_type,title,status)
    values('10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000002','service','bad','new');
    raise exception 'cross-tenant work customer accepted';
  exception when foreign_key_violation then null; end;

  begin
    insert into core.fulfillments(org_id,order_id,work_object_id,fulfillment_type,status)
    values('10000000-0000-4000-8000-000000000001','54000000-0000-4000-8000-000000000001','55000000-0000-4000-8000-000000000002','bad','new');
    raise exception 'cross-tenant fulfillment work accepted';
  exception when foreign_key_violation then null; end;
end
$$;

-- Org A authenticated principal sees Org A only across all Core objects.
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',false);
set role authenticated;
do $$
declare n integer;
begin
  select count(*) into n from core.parties; if n <> 1 then raise exception 'Org A parties=%',n; end if;
  select count(*) into n from core.relationships; if n <> 1 then raise exception 'Org A relationships=%',n; end if;
  select count(*) into n from core.external_references; if n <> 1 then raise exception 'Org A external refs=%',n; end if;
  select count(*) into n from core.offerings; if n <> 1 then raise exception 'Org A offerings=%',n; end if;
  select count(*) into n from core.orders; if n <> 1 then raise exception 'Org A orders=%',n; end if;
  select count(*) into n from core.order_lines; if n <> 1 then raise exception 'Org A order lines=%',n; end if;
  select count(*) into n from core.work_objects; if n <> 1 then raise exception 'Org A work=%',n; end if;
  select count(*) into n from core.fulfillments; if n <> 1 then raise exception 'Org A fulfillments=%',n; end if;
end
$$;
reset role;

-- Org B authenticated principal sees Org B only across all Core objects.
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',false);
set role authenticated;
do $$
declare n integer;
begin
  select count(*) into n from core.parties; if n <> 1 then raise exception 'Org B parties=%',n; end if;
  select count(*) into n from core.relationships; if n <> 1 then raise exception 'Org B relationships=%',n; end if;
  select count(*) into n from core.external_references; if n <> 1 then raise exception 'Org B external refs=%',n; end if;
  select count(*) into n from core.offerings; if n <> 1 then raise exception 'Org B offerings=%',n; end if;
  select count(*) into n from core.orders; if n <> 1 then raise exception 'Org B orders=%',n; end if;
  select count(*) into n from core.order_lines; if n <> 1 then raise exception 'Org B order lines=%',n; end if;
  select count(*) into n from core.work_objects; if n <> 1 then raise exception 'Org B work=%',n; end if;
  select count(*) into n from core.fulfillments; if n <> 1 then raise exception 'Org B fulfillments=%',n; end if;
end
$$;
reset role;

-- Authenticated users are read-only in Core v1.
do $$
begin
  if has_schema_privilege('anon','core','USAGE') then
    raise exception 'anon unexpectedly has core schema usage';
  end if;

  if has_table_privilege('authenticated','core.orders','INSERT')
     or has_table_privilege('authenticated','core.orders','UPDATE')
     or has_table_privilege('authenticated','core.orders','DELETE') then
    raise exception 'authenticated unexpectedly has Core DML';
  end if;

  if not has_table_privilege('service_role','core.orders','SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'service_role missing Core DML';
  end if;
end
$$;
