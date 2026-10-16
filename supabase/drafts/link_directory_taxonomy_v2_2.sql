-- APPLIED 2026-10-15 04:13:45.219011+00.
-- Readback passed; a second dry run returned ALREADY_APPLIED with 0 changes.
-- Canonical project: abtyrbqlqbsastmridzp.
-- Target: operations.knowledge_items / dreamcatcher_system_database_directory_v1.
--
-- Purpose
--   Apply the audited v2.2 taxonomy correction to the existing 244-entry
--   directory without creating another registry or changing Portal code.
--
-- Scope
--   * CAS on the exact audited row, timestamp, structured-content hash,
--     versions, content_es, matrix sizes, IDs and source classifications.
--   * The same entry-field and tag transformation is applied by ID to
--     link_directory.entries and portal_navigation_proposal.entries.
--   * Array order and every field outside state/project/project_section/
--     category/tags are preserved.
--   * structured_content.version and both nested versions become 2.2.
--   * A compact receipt is stored at link_directory.taxonomy_receipt.
--   * A second execution accepts the verified receipt and performs no write.
--
-- Execution boundary
--   Retained as the exact guarded source and audit receipt for the authorized
--   row update. It creates no schema, grant, policy or Portal change. The
--   current row is idempotent; do not retarget this script to another record.

-- ---------------------------------------------------------------------------
-- DRY RUN / CURRENT-STATE READ
-- Expected before first apply:
--   mode=READY_TO_APPLY, predicted_changed_entries=28.
-- Expected after a successful apply:
--   mode=ALREADY_APPLIED, predicted_changed_entries=0.
-- ---------------------------------------------------------------------------

with target as (
  select
    k.id,
    k.updated_at,
    k.content_es,
    k.structured_content,
    md5(k.structured_content::text) as structured_content_md5
  from operations.knowledge_items k
  where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
    and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
), entries as (
  select
    'link_directory'::text as matrix_name,
    e.ordinality,
    e.value as entry
  from target t
  cross join lateral jsonb_array_elements(
    t.structured_content #> '{link_directory,entries}'
  ) with ordinality as e(value, ordinality)

  union all

  select
    'portal_navigation_proposal'::text as matrix_name,
    e.ordinality,
    e.value as entry
  from target t
  cross join lateral jsonb_array_elements(
    t.structured_content #> '{portal_navigation_proposal,entries}'
  ) with ordinality as e(value, ordinality)
), mapped as (
  select
    e.*,
    case
      when e.entry ->> 'state' = 'Registrado' then 'registrado'
      else e.entry ->> 'state'
    end as new_state,
    case
      when e.entry ->> 'id' = 'LINK-243'
        then '04 TORO OS - gobierno, datos y tecnología'
      when e.entry ->> 'id' in (
        'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
      ) then '02 Dreamcatcher - web, marketing y contenidos'
      else e.entry ->> 'project'
    end as new_project,
    case
      when e.entry ->> 'id' = 'LINK-243'
        then '04 TORO OS - gobierno, datos y tecnología'
      when e.entry ->> 'id' in (
        'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
      ) then '02 Dreamcatcher - web, marketing y contenidos'
      else e.entry ->> 'project_section'
    end as new_project_section,
    case
      when e.entry ->> 'id' = 'LINK-242'
        then 'Finanzas y servicios'
      when e.entry ->> 'id' = 'LINK-243'
        then 'Plan y gobierno'
      when e.entry ->> 'provider' = 'ads.google.com'
        then 'Publicidad pagada'
      when e.entry ->> 'id' in (
        'LINK-010','LINK-065','LINK-172',
        'LINK-175','LINK-176','LINK-244'
      ) then 'Ventas y distribución'
      when e.entry ->> 'id' in (
        'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
      ) then 'Marketing y medición'
      else e.entry ->> 'category'
    end as new_category
  from entries e
), tagged as (
  select
    m.*,
    case
      when jsonb_typeof(m.entry -> 'tags') = 'array' then (
        select coalesce(
          jsonb_agg(
            case
              when tag.value #>> '{}' = m.entry ->> 'category'
                then to_jsonb(m.new_category)
              when tag.value #>> '{}' = m.entry ->> 'project'
                then to_jsonb(m.new_project)
              when m.entry ->> 'id' in (
                'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
              ) and tag.value #>> '{}' = '01 Dreamcatcher'
                then to_jsonb('02 Dreamcatcher'::text)
              else tag.value
            end
            order by tag.ordinality
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(m.entry -> 'tags') with ordinality
          as tag(value, ordinality)
      )
      else m.entry -> 'tags'
    end as new_tags
  from mapped m
), patched as (
  select
    t.matrix_name,
    t.ordinality,
    t.entry,
    t.new_tags,
    t.entry || jsonb_build_object(
      'state', t.new_state,
      'project', t.new_project,
      'project_section', t.new_project_section,
      'category', t.new_category,
      'tags', t.new_tags
    ) as patched_entry
  from tagged t
), predicted as (
  select
    matrix_name,
    count(*) as entry_count,
    count(*) filter (where entry is distinct from patched_entry)
      as predicted_changed_entries,
    coalesce(
      jsonb_agg(entry ->> 'id' order by entry ->> 'id')
        filter (where entry is distinct from patched_entry),
      '[]'::jsonb
    ) as predicted_changed_ids,
    count(*) filter (where entry -> 'tags' is distinct from new_tags)
      as predicted_tag_rewritten_entries,
    coalesce(
      jsonb_agg(entry ->> 'id' order by entry ->> 'id')
        filter (where entry -> 'tags' is distinct from new_tags),
      '[]'::jsonb
    ) as predicted_tag_rewritten_ids,
    md5(jsonb_agg(patched_entry order by ordinality)::text)
      as predicted_directory_entries_md5,
    count(*) filter (
      where patched_entry ->> 'state' = 'Registrado'
    ) as uppercase_registrado_after,
    count(*) filter (
      where patched_entry ->> 'category' = 'Publicidad pagada'
    ) as paid_advertising_after,
    count(*) filter (
      where patched_entry ->> 'category' = 'Ventas y distribución'
    ) as sales_distribution_after,
    count(*) filter (
      where patched_entry ->> 'category' = 'Marketing y medición'
    ) as marketing_measurement_after
  from patched
  group by matrix_name
), directory_prediction as (
  select *
  from predicted
  where matrix_name = 'link_directory'
), portal_prediction as (
  select *
  from predicted
  where matrix_name = 'portal_navigation_proposal'
)
select
  case
    when t.structured_content #>> '{link_directory,taxonomy_receipt,patch_id}'
           = 'link_directory_taxonomy_v2_2'
      and t.structured_content ->> 'version' = '2.2'
      and t.structured_content #>> '{link_directory,version}' = '2.2'
      and t.structured_content #>> '{portal_navigation_proposal,version}' = '2.2'
      and t.content_es =
        'Directorio interno TORO/Dreamcatcher con 244 fichas: 239 URI (237 HTTPS y 2 accesos de contacto tel:/mailto:) y 5 destinos pendientes sin URL. La taxonomía v2.2 separa publicidad pagada, marketing y medición, y ventas y distribución; conserva ámbitos separados e históricos fuera del inicio. Las URLs generales o rutas construidas no equivalen a sesiones, permisos, integraciones ni autoridad transaccional verificadas. Sin secretos ni llaves.'
      and md5(
        (t.structured_content #> '{link_directory,entries}')::text
      ) = 'b83fed9231924a73eae6a41ca94c5aea'
      and md5(
        (t.structured_content #> '{portal_navigation_proposal,entries}')::text
      ) = 'ceea49c7096f33219ec78109ee7d3d00'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,from_version}' = '2.1'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,to_version}' = '2.2'
      and t.structured_content
            #> '{link_directory,taxonomy_receipt,source_updated_at}'
            = to_jsonb(timestamptz '2026-10-15 03:51:00.249737+00')
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,source_md5}'
            = '795bdb5d2f3993a331963df9d7109f4e'
      and jsonb_typeof(
        t.structured_content
          #> '{link_directory,taxonomy_receipt,applied_at}'
      ) = 'string'
      and coalesce(
        t.structured_content
          #>> '{link_directory,taxonomy_receipt,applied_at}',
        ''
      ) <> ''
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,entries_per_matrix}' = '244'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,changed_entries}' = '28'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,state_normalized}' = '12'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,tag_rewritten_entries}' = '19'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,paid_advertising}' = '6'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,sales_distribution}' = '6'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,social_to_marketing}' = '5'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,canonical_taxonomy_fixes}' = '2'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,https_urls}' = '237'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,contact_uris}' = '2'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,blank_urls}' = '5'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,changed_ids_md5}' = md5(
        array_to_string(array[
          'LINK-003','LINK-007','LINK-009','LINK-010','LINK-011',
          'LINK-012','LINK-025','LINK-028','LINK-031','LINK-033',
          'LINK-036','LINK-065','LINK-170','LINK-171','LINK-172',
          'LINK-173','LINK-174','LINK-175','LINK-176','LINK-177',
          'LINK-190','LINK-234','LINK-235','LINK-236','LINK-237',
          'LINK-242','LINK-243','LINK-244'
        ]::text[], ',')
      )
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,tag_ids_md5}' = md5(
        array_to_string(array[
          'LINK-003','LINK-007','LINK-009','LINK-010','LINK-011',
          'LINK-012','LINK-025','LINK-028','LINK-031','LINK-033',
          'LINK-036','LINK-065','LINK-172','LINK-175','LINK-176',
          'LINK-190','LINK-242','LINK-243','LINK-244'
        ]::text[], ',')
      )
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,matrix_entry_hashes,link_directory}'
            = 'b83fed9231924a73eae6a41ca94c5aea'
      and t.structured_content
            #>> '{link_directory,taxonomy_receipt,matrix_entry_hashes,portal_navigation_proposal}'
            = 'ceea49c7096f33219ec78109ee7d3d00'
      then 'ALREADY_APPLIED'
    when t.updated_at = timestamptz '2026-10-15 03:51:00.249737+00'
      and t.structured_content_md5 = '795bdb5d2f3993a331963df9d7109f4e'
      and t.structured_content ->> 'version' = '1.2'
      and t.structured_content #>> '{link_directory,version}' = '2.1'
      and t.structured_content #>> '{portal_navigation_proposal,version}' = '2.1'
      and d.predicted_changed_ids = '["LINK-003","LINK-007","LINK-009","LINK-010","LINK-011","LINK-012","LINK-025","LINK-028","LINK-031","LINK-033","LINK-036","LINK-065","LINK-170","LINK-171","LINK-172","LINK-173","LINK-174","LINK-175","LINK-176","LINK-177","LINK-190","LINK-234","LINK-235","LINK-236","LINK-237","LINK-242","LINK-243","LINK-244"]'::jsonb
      and p.predicted_changed_ids = d.predicted_changed_ids
      and d.predicted_tag_rewritten_ids = '["LINK-003","LINK-007","LINK-009","LINK-010","LINK-011","LINK-012","LINK-025","LINK-028","LINK-031","LINK-033","LINK-036","LINK-065","LINK-172","LINK-175","LINK-176","LINK-190","LINK-242","LINK-243","LINK-244"]'::jsonb
      and p.predicted_tag_rewritten_ids = d.predicted_tag_rewritten_ids
      and d.predicted_directory_entries_md5
            = 'b83fed9231924a73eae6a41ca94c5aea'
      and p.predicted_directory_entries_md5
            = 'ceea49c7096f33219ec78109ee7d3d00'
      then 'READY_TO_APPLY'
    else 'DRIFT_REVIEW_REQUIRED'
  end as mode,
  t.updated_at,
  t.structured_content_md5,
  t.structured_content ->> 'version' as wrapper_version,
  t.structured_content #>> '{link_directory,version}' as directory_version,
  t.structured_content #>> '{portal_navigation_proposal,version}'
    as portal_projection_version,
  jsonb_array_length(
    t.structured_content #> '{portal_navigation_proposal,entries}'
  ) as portal_projection_entry_count,
  d.entry_count as directory_entry_count,
  p.entry_count as portal_entry_count,
  d.predicted_changed_entries,
  d.predicted_changed_ids,
  d.predicted_tag_rewritten_entries,
  d.predicted_tag_rewritten_ids,
  d.predicted_directory_entries_md5,
  p.predicted_directory_entries_md5 as predicted_portal_entries_md5,
  d.uppercase_registrado_after,
  d.paid_advertising_after,
  d.sales_distribution_after,
  d.marketing_measurement_after
from target t
cross join directory_prediction d
cross join portal_prediction p;

-- ---------------------------------------------------------------------------
-- GUARDED APPLY
-- Transaction rollback is automatic on any failed precondition or readback.
-- ---------------------------------------------------------------------------

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = '';

do $apply$
declare
  v_row operations.knowledge_items%rowtype;
  v_expected_updated_at constant timestamptz :=
    timestamptz '2026-10-15 03:51:00.249737+00';
  v_expected_md5 constant text := '795bdb5d2f3993a331963df9d7109f4e';
  v_expected_directory_entries_md5 constant text :=
    'b83fed9231924a73eae6a41ca94c5aea';
  v_expected_portal_entries_md5 constant text :=
    'ceea49c7096f33219ec78109ee7d3d00';
  v_patch_id constant text := 'link_directory_taxonomy_v2_2';
  v_expected_changed_ids constant text[] := array[
    'LINK-003','LINK-007','LINK-009','LINK-010','LINK-011',
    'LINK-012','LINK-025','LINK-028','LINK-031','LINK-033',
    'LINK-036','LINK-065','LINK-170','LINK-171','LINK-172',
    'LINK-173','LINK-174','LINK-175','LINK-176','LINK-177',
    'LINK-190','LINK-234','LINK-235','LINK-236','LINK-237',
    'LINK-242','LINK-243','LINK-244'
  ];
  v_expected_tag_ids constant text[] := array[
    'LINK-003','LINK-007','LINK-009','LINK-010','LINK-011',
    'LINK-012','LINK-025','LINK-028','LINK-031','LINK-033',
    'LINK-036','LINK-065','LINK-172','LINK-175','LINK-176',
    'LINK-190','LINK-242','LINK-243','LINK-244'
  ];
  v_expected_state_ids constant text[] := array[
    'LINK-170','LINK-171','LINK-172','LINK-173','LINK-174','LINK-175',
    'LINK-176','LINK-177','LINK-234','LINK-235','LINK-236','LINK-237'
  ];
  v_expected_paid_ids constant text[] := array[
    'LINK-003','LINK-007','LINK-009','LINK-025','LINK-028','LINK-031'
  ];
  v_expected_sales_ids constant text[] := array[
    'LINK-010','LINK-065','LINK-172','LINK-175','LINK-176','LINK-244'
  ];
  v_expected_content_es constant text :=
    'Directorio interno ampliado de sistemas externos y propios, fuentes, canales, bases y accesos TORO/Dreamcatcher. Inventario con estados mixtos: 154 enlaces y 6 accesos exactos pendientes. Las URLs generales y rutas construidas no equivalen a sesiones, permisos o integraciones verificadas. Vista humana objetivo: Sistemas > Enlaces y accesos. Conserva datos previos y ámbitos separados; sin secretos ni llaves.';
  v_new_content_es constant text :=
    'Directorio interno TORO/Dreamcatcher con 244 fichas: 239 URI (237 HTTPS y 2 accesos de contacto tel:/mailto:) y 5 destinos pendientes sin URL. La taxonomía v2.2 separa publicidad pagada, marketing y medición, y ventas y distribución; conserva ámbitos separados e históricos fuera del inicio. Las URLs generales o rutas construidas no equivalen a sesiones, permisos, integraciones ni autoridad transaccional verificadas. Sin secretos ni llaves.';
  v_expected_ids text[];
  v_ld_ids text[];
  v_pnp_ids text[];
  v_source_upper_ids text[];
  v_source_paid_ids text[];
  v_final_state_ids text[];
  v_final_paid_ids text[];
  v_final_sales_ids text[];
  v_ld_changed_ids text[];
  v_pnp_changed_ids text[];
  v_ld_tag_ids text[];
  v_pnp_tag_ids text[];
  v_original_content jsonb;
  v_new_content jsonb;
  v_new_ld_entries jsonb;
  v_new_pnp_entries jsonb;
  v_receipt jsonb;
  v_ld_count integer;
  v_ld_distinct_ids integer;
  v_pnp_count integer;
  v_pnp_distinct_ids integer;
  v_bad_tags integer;
  v_duplicate_tags integer;
  v_legacy_tag_mismatch integer;
  v_payload_mismatch integer;
  v_core_mismatch integer;
  v_upper_registrado integer;
  v_old_toro_project integer;
  v_old_finance_category integer;
  v_old_governance_category integer;
  v_paid_source integer;
  v_sales_source integer;
  v_social_source integer;
  v_target_source_mismatch integer;
  v_https_urls integer;
  v_contact_uris integer;
  v_blank_urls integer;
  v_other_urls integer;
  v_pnp_https_urls integer;
  v_pnp_contact_uris integer;
  v_pnp_blank_urls integer;
  v_pnp_other_urls integer;
  v_marketing_after integer;
  v_updated integer;
  v_already_applied boolean;
begin
  select k.*
  into strict v_row
  from operations.knowledge_items k
  where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
    and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
  for update;

  v_original_content := v_row.structured_content;

  select array_agg(
    format('LINK-%s', lpad(n::text, 3, '0'))
    order by n
  )
  into v_expected_ids
  from generate_series(1, 244) as g(n);

  v_already_applied := coalesce(
    v_row.structured_content #>> '{link_directory,taxonomy_receipt,patch_id}'
      = v_patch_id,
    false
  );

  if jsonb_typeof(
       v_row.structured_content #> '{link_directory,entries}'
     ) is distinct from 'array'
     or jsonb_typeof(
       v_row.structured_content #> '{portal_navigation_proposal,entries}'
     ) is distinct from 'array' then
    raise exception 'Directory matrix shape drift';
  end if;

  select
    count(*),
    count(distinct e.value ->> 'id'),
    array_agg(e.value ->> 'id' order by e.value ->> 'id'),
    count(*) filter (
      where jsonb_typeof(e.value -> 'tags') is distinct from 'array'
    )
  into v_ld_count, v_ld_distinct_ids, v_ld_ids, v_bad_tags
  from jsonb_array_elements(
    v_row.structured_content #> '{link_directory,entries}'
  ) as e(value);

  if v_ld_count <> 244
     or v_ld_distinct_ids <> 244
     or v_ld_ids is distinct from v_expected_ids
     or v_bad_tags <> 0 then
    raise exception
      'link_directory precondition drift: count %, IDs %, exact set %, bad tags %',
      v_ld_count,
      v_ld_distinct_ids,
      v_ld_ids is not distinct from v_expected_ids,
      v_bad_tags;
  end if;

  select
    count(*),
    count(distinct e.value ->> 'id'),
    array_agg(e.value ->> 'id' order by e.value ->> 'id'),
    count(*) filter (
      where jsonb_typeof(e.value -> 'tags') is distinct from 'array'
    )
  into v_pnp_count, v_pnp_distinct_ids, v_pnp_ids, v_bad_tags
  from jsonb_array_elements(
    v_row.structured_content #> '{portal_navigation_proposal,entries}'
  ) as e(value);

  if v_pnp_count <> 244
     or v_pnp_distinct_ids <> 244
     or v_pnp_ids is distinct from v_expected_ids
     or v_bad_tags <> 0 then
    raise exception
      'portal projection precondition drift: count %, IDs %, exact set %, bad tags %',
      v_pnp_count,
      v_pnp_distinct_ids,
      v_pnp_ids is not distinct from v_expected_ids,
      v_bad_tags;
  end if;

  select
    count(*) filter (
      where coalesce(e.value ->> 'url', '') ~ '^https://'
    ),
    count(*) filter (
      where coalesce(e.value ->> 'url', '') ~ '^(tel:|mailto:)'
    ),
    count(*) filter (
      where coalesce(e.value ->> 'url', '') = ''
    ),
    count(*) filter (
      where coalesce(e.value ->> 'url', '') <> ''
        and coalesce(e.value ->> 'url', '') !~ '^(https://|tel:|mailto:)'
    ),
    count(*) filter (
      where jsonb_array_length(e.value -> 'tags') <> (
        select count(distinct tag.value)
        from jsonb_array_elements(e.value -> 'tags') as tag(value)
      )
    )
  into
    v_https_urls,
    v_contact_uris,
    v_blank_urls,
    v_other_urls,
    v_duplicate_tags
  from jsonb_array_elements(
    v_row.structured_content #> '{link_directory,entries}'
  ) as e(value);

  if v_https_urls <> 237
     or v_contact_uris <> 2
     or v_blank_urls <> 5
     or v_other_urls <> 0
     or v_duplicate_tags <> 0 then
    raise exception
      'link_directory URI/tag drift: HTTPS %, contacts %, blank %, other %, duplicate tags %',
      v_https_urls,
      v_contact_uris,
      v_blank_urls,
      v_other_urls,
      v_duplicate_tags;
  end if;

  select
    count(*) filter (
      where coalesce(e.value ->> 'url', '') ~ '^https://'
    ),
    count(*) filter (
      where coalesce(e.value ->> 'url', '') ~ '^(tel:|mailto:)'
    ),
    count(*) filter (
      where coalesce(e.value ->> 'url', '') = ''
    ),
    count(*) filter (
      where coalesce(e.value ->> 'url', '') <> ''
        and coalesce(e.value ->> 'url', '') !~ '^(https://|tel:|mailto:)'
    ),
    count(*) filter (
      where jsonb_array_length(e.value -> 'tags') <> (
        select count(distinct tag.value)
        from jsonb_array_elements(e.value -> 'tags') as tag(value)
      )
    )
  into
    v_pnp_https_urls,
    v_pnp_contact_uris,
    v_pnp_blank_urls,
    v_pnp_other_urls,
    v_duplicate_tags
  from jsonb_array_elements(
    v_row.structured_content #> '{portal_navigation_proposal,entries}'
  ) as e(value);

  if v_pnp_https_urls <> 237
     or v_pnp_contact_uris <> 2
     or v_pnp_blank_urls <> 5
     or v_pnp_other_urls <> 0
     or v_duplicate_tags <> 0 then
    raise exception
      'portal projection URI/tag drift: HTTPS %, contacts %, blank %, other %, duplicate tags %',
      v_pnp_https_urls,
      v_pnp_contact_uris,
      v_pnp_blank_urls,
      v_pnp_other_urls,
      v_duplicate_tags;
  end if;

  with ld as (
    select e.value ->> 'id' as id, e.value as entry
    from jsonb_array_elements(
      v_row.structured_content #> '{link_directory,entries}'
    ) as e(value)
  ), pnp as (
    select e.value ->> 'id' as id, e.value as entry
    from jsonb_array_elements(
      v_row.structured_content #> '{portal_navigation_proposal,entries}'
    ) as e(value)
  )
  select count(*)
  into v_core_mismatch
  from ld
  full join pnp using (id)
  where ld.id is null
     or pnp.id is null
     or jsonb_build_object(
       'url', ld.entry -> 'url',
       'name', ld.entry -> 'name',
       'project', ld.entry -> 'project',
       'project_section', ld.entry -> 'project_section',
       'category', ld.entry -> 'category',
       'provider', ld.entry -> 'provider',
       'state', ld.entry -> 'state',
       'priority', ld.entry -> 'priority',
       'link_type', ld.entry -> 'link_type',
       'visibility', ld.entry -> 'visibility',
       'home_eligible', ld.entry -> 'home_eligible',
       'tags', ld.entry -> 'tags'
     ) is distinct from jsonb_build_object(
       'url', pnp.entry -> 'url',
       'name', pnp.entry -> 'name',
       'project', pnp.entry -> 'project',
       'project_section', pnp.entry -> 'project_section',
       'category', pnp.entry -> 'category',
       'provider', pnp.entry -> 'provider',
       'state', pnp.entry -> 'state',
       'priority', pnp.entry -> 'priority',
       'link_type', pnp.entry -> 'link_type',
       'visibility', pnp.entry -> 'visibility',
       'home_eligible', pnp.entry -> 'home_eligible',
       'tags', pnp.entry -> 'tags'
     );

  if v_core_mismatch <> 0 then
    raise exception 'Directory matrices diverged in audited fields: %',
      v_core_mismatch;
  end if;

  if not v_already_applied then
    if v_row.updated_at is distinct from v_expected_updated_at
     or md5(v_row.structured_content::text) is distinct from v_expected_md5
     or v_row.content_es is distinct from v_expected_content_es
     or v_row.structured_content ->> 'version' is distinct from '1.2'
     or v_row.structured_content #>> '{link_directory,version}'
          is distinct from '2.1'
     or v_row.structured_content
          #>> '{portal_navigation_proposal,version}'
          is distinct from '2.1' then
    raise exception using
      errcode = '40001',
      message = 'CAS failed: canonical directory changed after audit';
    end if;

  select
    count(*) filter (where e.value ->> 'state' = 'Registrado'),
    coalesce(
      array_agg(e.value ->> 'id' order by e.value ->> 'id')
        filter (where e.value ->> 'state' = 'Registrado'),
      '{}'::text[]
    ),
    count(*) filter (
      where e.value ->> 'project'
        = '04 TORO OS - gobierno y tecnología'
    ),
    count(*) filter (
      where e.value ->> 'category' = 'Finanzas y administración'
    ),
    count(*) filter (
      where e.value ->> 'category' = 'Gobierno y planificación'
    ),
    count(*) filter (
      where e.value ->> 'provider' = 'ads.google.com'
        and e.value ->> 'category' = 'Marketing y medición'
    ),
    coalesce(
      array_agg(e.value ->> 'id' order by e.value ->> 'id') filter (
        where e.value ->> 'provider' = 'ads.google.com'
          and e.value ->> 'category' = 'Marketing y medición'
      ),
      '{}'::text[]
    ),
    count(*) filter (
      where e.value ->> 'id' in (
        'LINK-010','LINK-065','LINK-172',
        'LINK-175','LINK-176','LINK-244'
      )
    ),
    count(*) filter (
      where e.value ->> 'id' in (
        'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
      )
        and e.value ->> 'project'
          = '01 Dreamcatcher - operación y administración'
        and e.value ->> 'project_section'
          = '01 Dreamcatcher - operación y administración'
        and e.value ->> 'category' = 'Comunicación y redes'
    ),
    count(*) filter (
      where (
        e.value ->> 'id' = 'LINK-010'
        and e.value ->> 'category' <> 'Web y marca'
      ) or (
        e.value ->> 'id' in (
          'LINK-065','LINK-172','LINK-175','LINK-176','LINK-244'
        )
        and e.value ->> 'category' <> 'Marketing y medición'
      ) or (
        e.value ->> 'id' = 'LINK-242'
        and (
          e.value ->> 'category' <> 'Finanzas y administración'
          or e.value ->> 'project'
            <> '01 Dreamcatcher - operación y administración'
        )
      ) or (
        e.value ->> 'id' = 'LINK-243'
        and (
          e.value ->> 'category' <> 'Gobierno y planificación'
          or e.value ->> 'project'
            <> '04 TORO OS - gobierno y tecnología'
        )
      )
    )
  into
    v_upper_registrado,
    v_source_upper_ids,
    v_old_toro_project,
    v_old_finance_category,
    v_old_governance_category,
    v_paid_source,
    v_source_paid_ids,
    v_sales_source,
    v_social_source,
    v_target_source_mismatch
  from jsonb_array_elements(
    v_row.structured_content #> '{link_directory,entries}'
  ) as e(value);

  if v_upper_registrado <> 12
     or v_source_upper_ids is distinct from v_expected_state_ids
     or v_old_toro_project <> 1
     or v_old_finance_category <> 1
     or v_old_governance_category <> 1
     or v_paid_source <> 6
     or v_source_paid_ids is distinct from v_expected_paid_ids
     or v_sales_source <> 6
     or v_social_source <> 5
     or v_target_source_mismatch <> 0 then
    raise exception
      'Audited taxonomy preconditions changed: state %, project %, finance %, governance %, ads %, sales %, social %, target mismatches %',
      v_upper_registrado,
      v_old_toro_project,
      v_old_finance_category,
      v_old_governance_category,
      v_paid_source,
      v_sales_source,
      v_social_source,
      v_target_source_mismatch;
  end if;

  with current_row as (
    select k.id, k.structured_content
    from operations.knowledge_items k
    where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
      and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
      and k.updated_at = v_expected_updated_at
      and k.content_es = v_expected_content_es
      and md5(k.structured_content::text) = v_expected_md5
  ), matrix_entries as (
    select
      c.id,
      'link_directory'::text as matrix_name,
      e.ordinality,
      e.value as entry
    from current_row c
    cross join lateral jsonb_array_elements(
      c.structured_content #> '{link_directory,entries}'
    ) with ordinality as e(value, ordinality)

    union all

    select
      c.id,
      'portal_navigation_proposal'::text as matrix_name,
      e.ordinality,
      e.value as entry
    from current_row c
    cross join lateral jsonb_array_elements(
      c.structured_content #> '{portal_navigation_proposal,entries}'
    ) with ordinality as e(value, ordinality)
  ), mapped as (
    select
      e.*,
      case
        when e.entry ->> 'state' = 'Registrado' then 'registrado'
        else e.entry ->> 'state'
      end as new_state,
      case
        when e.entry ->> 'id' = 'LINK-243'
          then '04 TORO OS - gobierno, datos y tecnología'
        when e.entry ->> 'id' in (
          'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
        ) then '02 Dreamcatcher - web, marketing y contenidos'
        else e.entry ->> 'project'
      end as new_project,
      case
        when e.entry ->> 'id' = 'LINK-243'
          then '04 TORO OS - gobierno, datos y tecnología'
        when e.entry ->> 'id' in (
          'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
        ) then '02 Dreamcatcher - web, marketing y contenidos'
        else e.entry ->> 'project_section'
      end as new_project_section,
      case
        when e.entry ->> 'id' = 'LINK-242'
          then 'Finanzas y servicios'
        when e.entry ->> 'id' = 'LINK-243'
          then 'Plan y gobierno'
        when e.entry ->> 'provider' = 'ads.google.com'
          then 'Publicidad pagada'
        when e.entry ->> 'id' in (
          'LINK-010','LINK-065','LINK-172',
          'LINK-175','LINK-176','LINK-244'
        ) then 'Ventas y distribución'
        when e.entry ->> 'id' in (
          'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
        ) then 'Marketing y medición'
        else e.entry ->> 'category'
      end as new_category
    from matrix_entries e
  ), tagged as (
    select
      m.*,
      (
        select coalesce(
          jsonb_agg(
            case
              when tag.value #>> '{}' = m.entry ->> 'category'
                then to_jsonb(m.new_category)
              when tag.value #>> '{}' = m.entry ->> 'project'
                then to_jsonb(m.new_project)
              when m.entry ->> 'id' in (
                'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
              ) and tag.value #>> '{}' = '01 Dreamcatcher'
                then to_jsonb('02 Dreamcatcher'::text)
              else tag.value
            end
            order by tag.ordinality
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(m.entry -> 'tags') with ordinality
          as tag(value, ordinality)
      ) as new_tags
    from mapped m
  ), patched_entries as (
    select
      t.id,
      t.matrix_name,
      t.ordinality,
      t.entry,
      t.new_tags,
      t.entry || jsonb_build_object(
        'state', t.new_state,
        'project', t.new_project,
        'project_section', t.new_project_section,
        'category', t.new_category,
        'tags', t.new_tags
      ) as patched_entry
    from tagged t
  ), matrix_arrays as (
    select
      p.id,
      p.matrix_name,
      jsonb_agg(p.patched_entry order by p.ordinality) as entries,
      coalesce(
        array_agg(p.entry ->> 'id' order by p.entry ->> 'id')
          filter (where p.entry is distinct from p.patched_entry),
        '{}'::text[]
      ) as changed_ids,
      coalesce(
        array_agg(p.entry ->> 'id' order by p.entry ->> 'id')
          filter (where p.entry -> 'tags' is distinct from p.new_tags),
        '{}'::text[]
      ) as tag_changed_ids,
      count(*) filter (
        where (
          p.entry - array[
            'state','project','project_section','category','tags'
          ]::text[]
        ) is distinct from (
          p.patched_entry - array[
            'state','project','project_section','category','tags'
          ]::text[]
        )
      ) as payload_mismatch
    from patched_entries p
    group by p.id, p.matrix_name
  ), assembled as (
    select
      c.id,
      c.structured_content,
      ld.entries as link_directory_entries,
      pnp.entries as portal_navigation_entries,
      ld.changed_ids as link_directory_changed_ids,
      pnp.changed_ids as portal_navigation_changed_ids,
      ld.tag_changed_ids as link_directory_tag_ids,
      pnp.tag_changed_ids as portal_navigation_tag_ids,
      ld.payload_mismatch + pnp.payload_mismatch as payload_mismatch
    from current_row c
    join matrix_arrays ld
      on ld.id = c.id
     and ld.matrix_name = 'link_directory'
    join matrix_arrays pnp
      on pnp.id = c.id
     and pnp.matrix_name = 'portal_navigation_proposal'
  ), entries_document as (
    select
      a.*,
      jsonb_set(
        jsonb_set(
          a.structured_content,
          '{link_directory,entries}',
          a.link_directory_entries,
          false
        ),
        '{portal_navigation_proposal,entries}',
        a.portal_navigation_entries,
        false
      ) as new_structured_content
    from assembled a
  ), versioned_document as (
    select
      e.*,
      jsonb_set(
        jsonb_set(
          jsonb_set(
            e.new_structured_content,
            '{version}',
            to_jsonb('2.2'::text),
            false
          ),
          '{link_directory,version}',
          to_jsonb('2.2'::text),
          false
        ),
        '{portal_navigation_proposal,version}',
        to_jsonb('2.2'::text),
        false
      ) as versioned_structured_content
    from entries_document e
  ), patched_document as (
    select
      v.*,
      jsonb_set(
        v.versioned_structured_content,
        '{link_directory,taxonomy_receipt}',
        jsonb_build_object(
          'patch_id', v_patch_id,
          'from_version', '2.1',
          'to_version', '2.2',
          'applied_at', statement_timestamp(),
          'source_updated_at', v_expected_updated_at,
          'source_md5', v_expected_md5,
          'entries_per_matrix', jsonb_array_length(v.link_directory_entries),
          'changed_entries', cardinality(v.link_directory_changed_ids),
          'state_normalized', v_upper_registrado,
          'tag_rewritten_entries', cardinality(v.link_directory_tag_ids),
          'paid_advertising', v_paid_source,
          'sales_distribution', v_sales_source,
          'social_to_marketing', v_social_source,
          'canonical_taxonomy_fixes',
            v_old_finance_category + v_old_governance_category,
          'https_urls', v_https_urls,
          'contact_uris', v_contact_uris,
          'blank_urls', v_blank_urls,
          'changed_ids_md5',
            md5(array_to_string(v.link_directory_changed_ids, ',')),
          'tag_ids_md5',
            md5(array_to_string(v.link_directory_tag_ids, ',')),
          'matrix_entry_hashes', jsonb_build_object(
            'link_directory', md5(v.link_directory_entries::text),
            'portal_navigation_proposal',
              md5(v.portal_navigation_entries::text)
          )
        ),
        true
      ) as patched_structured_content
    from versioned_document v
  )
  select
    p.patched_structured_content,
    p.link_directory_entries,
    p.portal_navigation_entries,
    p.link_directory_changed_ids,
    p.portal_navigation_changed_ids,
    p.link_directory_tag_ids,
    p.portal_navigation_tag_ids,
    p.payload_mismatch
  into strict
    v_new_content,
    v_new_ld_entries,
    v_new_pnp_entries,
    v_ld_changed_ids,
    v_pnp_changed_ids,
    v_ld_tag_ids,
    v_pnp_tag_ids,
    v_payload_mismatch
  from patched_document p;

  if v_ld_changed_ids is distinct from v_expected_changed_ids
     or v_pnp_changed_ids is distinct from v_expected_changed_ids
     or v_ld_changed_ids is distinct from v_pnp_changed_ids
     or v_ld_tag_ids is distinct from v_expected_tag_ids
     or v_pnp_tag_ids is distinct from v_expected_tag_ids
     or v_ld_tag_ids is distinct from v_pnp_tag_ids
     or md5(v_new_ld_entries::text)
          is distinct from v_expected_directory_entries_md5
     or md5(v_new_pnp_entries::text)
          is distinct from v_expected_portal_entries_md5
     or v_payload_mismatch <> 0 then
    raise exception
      'Patch preview failed: directory changes %, portal changes %, directory tags %, portal tags %, payload mismatches %',
      cardinality(v_ld_changed_ids),
      cardinality(v_pnp_changed_ids),
      cardinality(v_ld_tag_ids),
      cardinality(v_pnp_tag_ids),
      v_payload_mismatch;
  end if;

  if (
    v_original_content
      #- '{version}'
      #- '{link_directory,entries}'
      #- '{link_directory,version}'
      #- '{link_directory,taxonomy_receipt}'
      #- '{portal_navigation_proposal,entries}'
      #- '{portal_navigation_proposal,version}'
  ) is distinct from (
    v_new_content
      #- '{version}'
      #- '{link_directory,entries}'
      #- '{link_directory,version}'
      #- '{link_directory,taxonomy_receipt}'
      #- '{portal_navigation_proposal,entries}'
      #- '{portal_navigation_proposal,version}'
  ) then
    raise exception 'Patch preview changed fields outside the authorized paths';
  end if;

  update operations.knowledge_items k
  set
    structured_content = v_new_content,
    content_es = v_new_content_es,
    updated_at = statement_timestamp()
  where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
    and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
    and k.updated_at = v_expected_updated_at
    and k.content_es = v_expected_content_es
    and md5(k.structured_content::text) = v_expected_md5;

  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception using
      errcode = '40001',
      message = 'CAS update affected a row count other than one';
  end if;

  end if;

  select k.*
  into strict v_row
  from operations.knowledge_items k
  where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
    and k.knowledge_key = 'dreamcatcher_system_database_directory_v1';

  if v_row.content_es is distinct from v_new_content_es
     or v_row.structured_content ->> 'version' is distinct from '2.2'
     or v_row.structured_content #>> '{link_directory,version}'
          is distinct from '2.2'
     or v_row.structured_content
          #>> '{portal_navigation_proposal,version}'
          is distinct from '2.2'
     or v_row.structured_content
          #>> '{link_directory,taxonomy_receipt,patch_id}'
          is distinct from v_patch_id then
    raise exception 'v2.2 metadata readback failed';
  end if;

  if md5(
       (v_row.structured_content #> '{link_directory,entries}')::text
     ) is distinct from v_expected_directory_entries_md5
     or md5(
       (v_row.structured_content
          #> '{portal_navigation_proposal,entries}')::text
     ) is distinct from v_expected_portal_entries_md5 then
    raise exception 'v2.2 exact matrix hash readback failed';
  end if;

  v_receipt :=
    v_row.structured_content #> '{link_directory,taxonomy_receipt}';

  if jsonb_typeof(v_receipt) is distinct from 'object'
     or v_receipt ->> 'patch_id' is distinct from v_patch_id
     or v_receipt ->> 'from_version' is distinct from '2.1'
     or v_receipt ->> 'to_version' is distinct from '2.2'
     or jsonb_typeof(v_receipt -> 'applied_at') is distinct from 'string'
     or coalesce(v_receipt ->> 'applied_at', '') = ''
     or v_receipt -> 'source_updated_at'
          is distinct from to_jsonb(v_expected_updated_at)
     or v_receipt ->> 'source_md5' is distinct from v_expected_md5
     or v_receipt ->> 'entries_per_matrix' is distinct from '244'
     or v_receipt ->> 'changed_entries' is distinct from '28'
     or v_receipt ->> 'state_normalized' is distinct from '12'
     or v_receipt ->> 'tag_rewritten_entries' is distinct from '19'
     or v_receipt ->> 'paid_advertising' is distinct from '6'
     or v_receipt ->> 'sales_distribution' is distinct from '6'
     or v_receipt ->> 'social_to_marketing' is distinct from '5'
     or v_receipt ->> 'canonical_taxonomy_fixes' is distinct from '2'
     or v_receipt ->> 'https_urls' is distinct from '237'
     or v_receipt ->> 'contact_uris' is distinct from '2'
     or v_receipt ->> 'blank_urls' is distinct from '5'
     or v_receipt ->> 'changed_ids_md5' is distinct from md5(
       array_to_string(v_expected_changed_ids, ',')
     )
     or v_receipt ->> 'tag_ids_md5' is distinct from md5(
       array_to_string(v_expected_tag_ids, ',')
     )
     or v_receipt #>> '{matrix_entry_hashes,link_directory}'
          is distinct from v_expected_directory_entries_md5
     or v_receipt
          #>> '{matrix_entry_hashes,portal_navigation_proposal}'
          is distinct from v_expected_portal_entries_md5 then
    raise exception 'v2.2 receipt readback failed';
  end if;

  select
    count(*),
    count(distinct e.value ->> 'id'),
    array_agg(e.value ->> 'id' order by e.value ->> 'id'),
    count(*) filter (where e.value ->> 'state' = 'Registrado'),
    coalesce(
      array_agg(e.value ->> 'id' order by e.value ->> 'id') filter (
        where e.value ->> 'id' = any(v_expected_state_ids)
          and e.value ->> 'state' = 'registrado'
      ),
      '{}'::text[]
    ),
    count(*) filter (
      where e.value ->> 'project'
        = '04 TORO OS - gobierno y tecnología'
    ),
    count(*) filter (
      where e.value ->> 'category' in (
        'Finanzas y administración','Gobierno y planificación'
      )
    ),
    count(*) filter (
      where e.value ->> 'category' = 'Publicidad pagada'
    ),
    coalesce(
      array_agg(e.value ->> 'id' order by e.value ->> 'id') filter (
        where e.value ->> 'category' = 'Publicidad pagada'
      ),
      '{}'::text[]
    ),
    count(*) filter (
      where e.value ->> 'category' = 'Ventas y distribución'
    ),
    coalesce(
      array_agg(e.value ->> 'id' order by e.value ->> 'id') filter (
        where e.value ->> 'category' = 'Ventas y distribución'
      ),
      '{}'::text[]
    ),
    count(*) filter (
      where e.value ->> 'category' = 'Marketing y medición'
    ),
    count(*) filter (
      where e.value ->> 'id' in (
        'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
      )
        and e.value ->> 'project'
          = '02 Dreamcatcher - web, marketing y contenidos'
        and e.value ->> 'project_section'
          = '02 Dreamcatcher - web, marketing y contenidos'
        and e.value ->> 'category' = 'Marketing y medición'
    ),
    count(*) filter (
      where e.value ->> 'id' in (
        'LINK-003','LINK-007','LINK-009','LINK-010','LINK-011',
        'LINK-012','LINK-025','LINK-028','LINK-031','LINK-033',
        'LINK-036','LINK-065','LINK-172','LINK-175','LINK-176',
        'LINK-190','LINK-242','LINK-243','LINK-244'
      )
        and not (
          e.value -> 'tags' @> jsonb_build_array(e.value ->> 'category')
        )
    ),
    count(*) filter (
      where e.value ->> 'id' in (
        'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
      )
        and (
          not (e.value -> 'tags' @> '["02 Dreamcatcher"]'::jsonb)
          or e.value -> 'tags' @> '["01 Dreamcatcher"]'::jsonb
        )
    ),
    count(*) filter (
      where (
        e.value ->> 'id' in (
          'LINK-003','LINK-007','LINK-009','LINK-025','LINK-028','LINK-031'
        )
        and e.value -> 'tags' @> '["Marketing y medición"]'::jsonb
      ) or (
        e.value ->> 'id' = 'LINK-010'
        and e.value -> 'tags' @> '["Web y marca"]'::jsonb
      ) or (
        e.value ->> 'id' in (
          'LINK-065','LINK-172','LINK-175','LINK-176','LINK-244'
        )
        and e.value -> 'tags' @> '["Marketing y medición"]'::jsonb
      ) or (
        e.value ->> 'id' in (
          'LINK-011','LINK-012','LINK-033','LINK-036','LINK-190'
        )
        and (
          e.value -> 'tags' @> '["Comunicación y redes"]'::jsonb
          or e.value -> 'tags' @>
            '["01 Dreamcatcher - operación y administración"]'::jsonb
          or e.value -> 'tags' @> '["01 Dreamcatcher"]'::jsonb
        )
      ) or (
        e.value ->> 'id' = 'LINK-242'
        and e.value -> 'tags' @> '["Finanzas y administración"]'::jsonb
      ) or (
        e.value ->> 'id' = 'LINK-243'
        and (
          e.value -> 'tags' @> '["Gobierno y planificación"]'::jsonb
          or e.value -> 'tags' @>
            '["04 TORO OS - gobierno y tecnología"]'::jsonb
        )
      )
    ),
    count(*) filter (
      where jsonb_array_length(e.value -> 'tags') <> (
        select count(distinct tag.value)
        from jsonb_array_elements(e.value -> 'tags') as tag(value)
      )
    )
  into
    v_ld_count,
    v_ld_distinct_ids,
    v_ld_ids,
    v_upper_registrado,
    v_final_state_ids,
    v_old_toro_project,
    v_old_finance_category,
    v_paid_source,
    v_final_paid_ids,
    v_sales_source,
    v_final_sales_ids,
    v_marketing_after,
    v_social_source,
    v_bad_tags,
    v_target_source_mismatch,
    v_legacy_tag_mismatch,
    v_duplicate_tags
  from jsonb_array_elements(
    v_row.structured_content #> '{link_directory,entries}'
  ) as e(value);

  if v_ld_count <> 244
     or v_ld_distinct_ids <> 244
     or v_ld_ids is distinct from v_expected_ids
     or v_upper_registrado <> 0
     or v_final_state_ids is distinct from v_expected_state_ids
     or v_old_toro_project <> 0
     or v_old_finance_category <> 0
     or v_paid_source <> 6
     or v_final_paid_ids is distinct from v_expected_paid_ids
     or v_sales_source <> 6
     or v_final_sales_ids is distinct from v_expected_sales_ids
     or v_marketing_after <> 16
     or v_social_source <> 5
     or v_bad_tags <> 0
     or v_target_source_mismatch <> 0
     or v_legacy_tag_mismatch <> 0
     or v_duplicate_tags <> 0 then
    raise exception
      'v2.2 entry readback failed: count %, IDs %, state %, project %, categories %, ads %, sales %, marketing %, social %, tags %, social tags %, legacy tags %, duplicate tags %',
      v_ld_count,
      v_ld_distinct_ids,
      v_upper_registrado,
      v_old_toro_project,
      v_old_finance_category,
      v_paid_source,
      v_sales_source,
      v_marketing_after,
      v_social_source,
      v_bad_tags,
      v_target_source_mismatch,
      v_legacy_tag_mismatch,
      v_duplicate_tags;
  end if;

  with ld as (
    select e.value ->> 'id' as id, e.value as entry
    from jsonb_array_elements(
      v_row.structured_content #> '{link_directory,entries}'
    ) as e(value)
  ), pnp as (
    select e.value ->> 'id' as id, e.value as entry
    from jsonb_array_elements(
      v_row.structured_content #> '{portal_navigation_proposal,entries}'
    ) as e(value)
  )
  select count(*)
  into v_core_mismatch
  from ld
  full join pnp using (id)
  where ld.id is null
     or pnp.id is null
     or jsonb_build_object(
       'url', ld.entry -> 'url',
       'name', ld.entry -> 'name',
       'project', ld.entry -> 'project',
       'project_section', ld.entry -> 'project_section',
       'category', ld.entry -> 'category',
       'provider', ld.entry -> 'provider',
       'state', ld.entry -> 'state',
       'priority', ld.entry -> 'priority',
       'link_type', ld.entry -> 'link_type',
       'visibility', ld.entry -> 'visibility',
       'home_eligible', ld.entry -> 'home_eligible',
       'tags', ld.entry -> 'tags'
     ) is distinct from jsonb_build_object(
       'url', pnp.entry -> 'url',
       'name', pnp.entry -> 'name',
       'project', pnp.entry -> 'project',
       'project_section', pnp.entry -> 'project_section',
       'category', pnp.entry -> 'category',
       'provider', pnp.entry -> 'provider',
       'state', pnp.entry -> 'state',
       'priority', pnp.entry -> 'priority',
       'link_type', pnp.entry -> 'link_type',
       'visibility', pnp.entry -> 'visibility',
       'home_eligible', pnp.entry -> 'home_eligible',
       'tags', pnp.entry -> 'tags'
     );

  if v_core_mismatch <> 0 then
    raise exception 'v2.2 matrix readback mismatch: %', v_core_mismatch;
  end if;

  if v_already_applied then
    raise notice 'link_directory_taxonomy_v2_2 already applied; no write';
  else
    raise notice 'link_directory_taxonomy_v2_2 applied and verified';
  end if;
end;
$apply$;

commit;

-- ---------------------------------------------------------------------------
-- READBACK
-- pass=true is necessary but does not prove any downstream Portal release.
-- ---------------------------------------------------------------------------

with target as (
  select
    k.updated_at,
    k.content_es,
    k.structured_content,
    md5(k.structured_content::text) as structured_content_md5
  from operations.knowledge_items k
  where k.id = '50df0e7d-1aed-489a-a942-274715734dd0'::uuid
    and k.knowledge_key = 'dreamcatcher_system_database_directory_v1'
), ld as (
  select e.value ->> 'id' as id, e.value as entry
  from target t
  cross join lateral jsonb_array_elements(
    t.structured_content #> '{link_directory,entries}'
  ) as e(value)
), pnp as (
  select e.value ->> 'id' as id, e.value as entry
  from target t
  cross join lateral jsonb_array_elements(
    t.structured_content #> '{portal_navigation_proposal,entries}'
  ) as e(value)
), metrics as (
  select
    count(*) as entry_count,
    count(distinct ld.id) as distinct_ids,
    (select count(*) from pnp) as portal_entry_count,
    (select count(distinct pnp.id) from pnp) as portal_distinct_ids,
    count(*) filter (
      where coalesce(ld.entry ->> 'url', '') ~ '^https://'
    ) as https_urls,
    count(*) filter (
      where coalesce(ld.entry ->> 'url', '') ~ '^(tel:|mailto:)'
    ) as contact_uris,
    count(*) filter (
      where coalesce(ld.entry ->> 'url', '') = ''
    ) as blank_urls,
    count(*) filter (
      where coalesce(ld.entry ->> 'url', '') <> ''
        and coalesce(ld.entry ->> 'url', '')
          !~ '^(https://|tel:|mailto:)'
    ) as other_urls,
    count(*) filter (
      where jsonb_array_length(ld.entry -> 'tags') <> (
        select count(distinct tag.value)
        from jsonb_array_elements(ld.entry -> 'tags') as tag(value)
      )
    ) as duplicate_tag_entries,
    count(*) filter (where ld.entry ->> 'state' = 'Registrado')
      as uppercase_registrado,
    count(*) filter (
      where ld.entry ->> 'project'
        = '04 TORO OS - gobierno y tecnología'
    ) as legacy_toro_project,
    count(*) filter (
      where ld.entry ->> 'category' in (
        'Finanzas y administración','Gobierno y planificación'
      )
    ) as legacy_categories,
    count(*) filter (
      where ld.entry ->> 'category' = 'Publicidad pagada'
    ) as paid_advertising,
    count(*) filter (
      where ld.entry ->> 'category' = 'Ventas y distribución'
    ) as sales_distribution,
    count(*) filter (
      where ld.entry ->> 'category' = 'Marketing y medición'
    ) as marketing_measurement,
    count(*) filter (
      where pnp.id is null
         or jsonb_build_object(
           'url', ld.entry -> 'url',
           'name', ld.entry -> 'name',
           'project', ld.entry -> 'project',
           'project_section', ld.entry -> 'project_section',
           'category', ld.entry -> 'category',
           'provider', ld.entry -> 'provider',
           'state', ld.entry -> 'state',
           'priority', ld.entry -> 'priority',
           'link_type', ld.entry -> 'link_type',
           'visibility', ld.entry -> 'visibility',
           'home_eligible', ld.entry -> 'home_eligible',
           'tags', ld.entry -> 'tags'
         ) is distinct from jsonb_build_object(
           'url', pnp.entry -> 'url',
           'name', pnp.entry -> 'name',
           'project', pnp.entry -> 'project',
           'project_section', pnp.entry -> 'project_section',
           'category', pnp.entry -> 'category',
           'provider', pnp.entry -> 'provider',
           'state', pnp.entry -> 'state',
           'priority', pnp.entry -> 'priority',
           'link_type', pnp.entry -> 'link_type',
           'visibility', pnp.entry -> 'visibility',
           'home_eligible', pnp.entry -> 'home_eligible',
           'tags', pnp.entry -> 'tags'
         )
    ) as matrix_core_mismatches
  from ld
  left join pnp using (id)
)
select
  (
    t.structured_content ->> 'version' = '2.2'
    and t.structured_content #>> '{link_directory,version}' = '2.2'
    and t.structured_content #>> '{portal_navigation_proposal,version}' = '2.2'
    and t.content_es =
      'Directorio interno TORO/Dreamcatcher con 244 fichas: 239 URI (237 HTTPS y 2 accesos de contacto tel:/mailto:) y 5 destinos pendientes sin URL. La taxonomía v2.2 separa publicidad pagada, marketing y medición, y ventas y distribución; conserva ámbitos separados e históricos fuera del inicio. Las URLs generales o rutas construidas no equivalen a sesiones, permisos, integraciones ni autoridad transaccional verificadas. Sin secretos ni llaves.'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,patch_id}'
          = 'link_directory_taxonomy_v2_2'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,from_version}' = '2.1'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,to_version}' = '2.2'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,source_md5}'
          = '795bdb5d2f3993a331963df9d7109f4e'
    and t.structured_content
          #> '{link_directory,taxonomy_receipt,source_updated_at}'
          = to_jsonb(timestamptz '2026-10-15 03:51:00.249737+00')
    and jsonb_typeof(
      t.structured_content
        #> '{link_directory,taxonomy_receipt,applied_at}'
    ) = 'string'
    and coalesce(
      t.structured_content
        #>> '{link_directory,taxonomy_receipt,applied_at}',
      ''
    ) <> ''
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,entries_per_matrix}' = '244'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,changed_entries}' = '28'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,state_normalized}' = '12'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,tag_rewritten_entries}' = '19'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,paid_advertising}' = '6'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,sales_distribution}' = '6'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,social_to_marketing}' = '5'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,canonical_taxonomy_fixes}' = '2'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,https_urls}' = '237'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,contact_uris}' = '2'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,blank_urls}' = '5'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,changed_ids_md5}' = md5(
      array_to_string(array[
        'LINK-003','LINK-007','LINK-009','LINK-010','LINK-011',
        'LINK-012','LINK-025','LINK-028','LINK-031','LINK-033',
        'LINK-036','LINK-065','LINK-170','LINK-171','LINK-172',
        'LINK-173','LINK-174','LINK-175','LINK-176','LINK-177',
        'LINK-190','LINK-234','LINK-235','LINK-236','LINK-237',
        'LINK-242','LINK-243','LINK-244'
      ]::text[], ',')
    )
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,tag_ids_md5}' = md5(
      array_to_string(array[
        'LINK-003','LINK-007','LINK-009','LINK-010','LINK-011',
        'LINK-012','LINK-025','LINK-028','LINK-031','LINK-033',
        'LINK-036','LINK-065','LINK-172','LINK-175','LINK-176',
        'LINK-190','LINK-242','LINK-243','LINK-244'
      ]::text[], ',')
    )
    and md5(
      (t.structured_content #> '{link_directory,entries}')::text
    ) = 'b83fed9231924a73eae6a41ca94c5aea'
    and md5(
      (t.structured_content
        #> '{portal_navigation_proposal,entries}')::text
    ) = 'ceea49c7096f33219ec78109ee7d3d00'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,matrix_entry_hashes,link_directory}'
          = 'b83fed9231924a73eae6a41ca94c5aea'
    and t.structured_content
          #>> '{link_directory,taxonomy_receipt,matrix_entry_hashes,portal_navigation_proposal}'
          = 'ceea49c7096f33219ec78109ee7d3d00'
    and jsonb_array_length(
      t.structured_content #> '{portal_navigation_proposal,entries}'
    ) = 244
    and m.entry_count = 244
    and m.distinct_ids = 244
    and m.portal_entry_count = 244
    and m.portal_distinct_ids = 244
    and m.https_urls = 237
    and m.contact_uris = 2
    and m.blank_urls = 5
    and m.other_urls = 0
    and m.duplicate_tag_entries = 0
    and m.uppercase_registrado = 0
    and m.legacy_toro_project = 0
    and m.legacy_categories = 0
    and m.paid_advertising = 6
    and m.sales_distribution = 6
    and m.marketing_measurement = 16
    and m.matrix_core_mismatches = 0
  ) as pass,
  t.updated_at,
  t.structured_content_md5,
  t.structured_content ->> 'version' as wrapper_version,
  t.structured_content #>> '{link_directory,version}' as directory_version,
  t.structured_content #>> '{portal_navigation_proposal,version}'
    as portal_projection_version,
  t.structured_content #> '{link_directory,taxonomy_receipt}' as receipt,
  m.*
from target t
cross join metrics m;
