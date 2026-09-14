import { mapAirtableRecordsToCandidates } from "./airtable-candidates.mjs";
import { groupSearchResults, rankSearchResults } from "./search-router.mjs";

export const SEARCH_SOURCES = [
  {
    tableName: "rooms",
    tableId: "tblzfPcXbDft3upck",
    fields: ["room_key", "room_number", "official_name_es", "official_name_en", "max_capacity", "kitchen_type", "has_projector", "guest_facing_status"],
    searchFields: ["room_key", "room_number", "official_name_es", "official_name_en", "kitchen_type"],
    pageSize: 12,
  },
  {
    tableName: "villas",
    tableId: "tblSSShG4IqmlCOk3",
    fields: ["villa_key", "villa_name", "max_capacity", "room_count", "has_pool", "has_kitchen", "has_jacuzzi", "guest_facing_status"],
    searchFields: ["villa_key", "villa_name"],
    pageSize: 10,
  },
  {
    tableName: "sellable_units",
    tableId: "tblhaoXgvoO1qjI65",
    fields: ["unit_key", "unit_name", "unit_type", "max_capacity", "commercial_summary_es", "sales_status"],
    searchFields: ["unit_key", "unit_name", "unit_type", "commercial_summary_es"],
    pageSize: 12,
  },
  {
    tableName: "properties",
    tableId: "tblJsTpCuyJguApq0",
    fields: ["property_key", "property_name", "operational_status", "public_positioning"],
    searchFields: ["property_key", "property_name", "public_positioning"],
    pageSize: 8,
  },
  {
    tableName: "amenities",
    tableId: "tbla5C9vxfwmLGwC5",
    fields: ["amenity_key", "amenity_name_es", "amenity_name_en", "verified_status"],
    searchFields: ["amenity_key", "amenity_name_es", "amenity_name_en"],
    pageSize: 12,
  },
  {
    tableName: "staff_directory",
    tableId: "tbl4gVIIDWmmLy9oD",
    fields: ["staff_key", "display_name", "known_as", "department", "role_title", "status"],
    searchFields: ["staff_key", "display_name", "known_as", "department", "role_title"],
    pageSize: 10,
  },
  {
    tableName: "tasks",
    tableId: "tblX3FBDLqm7K4O8B",
    fields: ["task_key", "task_name", "domain", "status", "priority", "linked_entity_key"],
    searchFields: ["task_key", "task_name", "domain", "linked_entity_key"],
    pageSize: 15,
  },
  {
    tableName: "validations",
    tableId: "tbl2BgFOn2uGIWQvv",
    fields: ["validation_key", "validation_type", "severity", "status", "linked_entity_key"],
    searchFields: ["validation_key", "validation_type", "linked_entity_key"],
    pageSize: 12,
  },
  {
    tableName: "experiences",
    tableId: "tblFf620zk3VKVPxA",
    fields: ["experience_key", "experience_name", "experience_category", "publish_status", "verified_status", "guest_facing_summary_es"],
    searchFields: ["experience_key", "experience_name", "experience_category", "guest_facing_summary_es"],
    pageSize: 10,
  },
  {
    tableName: "sops",
    tableId: "tblhMvRB4Vz9E1Qtt",
    fields: ["sop_key", "sop_name", "category", "status", "applies_to"],
    searchFields: ["sop_key", "sop_name", "category", "applies_to"],
    pageSize: 10,
  },
  {
    tableName: "source_objects",
    tableId: "tblIakbd1mIJll8e5",
    fields: ["source_key", "source_name", "source_type", "source_status", "freshness_status"],
    searchFields: ["source_key", "source_name", "source_type"],
    pageSize: 10,
  },
];

function normalizedQuery(value) {
  return String(value ?? "").trim();
}

export function createToroSearchService({ loadSource }) {
  if (typeof loadSource !== "function") {
    throw new TypeError("createToroSearchService requires loadSource(source, query)");
  }

  return async function searchToro(query) {
    const cleanQuery = normalizedQuery(query);
    if (!cleanQuery) {
      return {
        query: "",
        state: "empty",
        results: [],
        groups: [],
        failedSources: [],
        staleSources: [],
        callCount: 0,
      };
    }

    const sourceResults = await Promise.all(
      SEARCH_SOURCES.map(async (source) => {
        try {
          const result = await loadSource(source, cleanQuery);
          return {
            source,
            ok: result?.ok === true,
            records: Array.isArray(result?.records) ? result.records : [],
            stale: result?.stale === true,
          };
        } catch {
          return { source, ok: false, records: [], stale: false };
        }
      }),
    );

    const failedSources = sourceResults.filter((entry) => !entry.ok).map((entry) => entry.source.tableName);
    const staleSources = sourceResults.filter((entry) => entry.ok && entry.stale).map((entry) => entry.source.tableName);
    const candidates = sourceResults.flatMap((entry) =>
      entry.ok ? mapAirtableRecordsToCandidates(entry.source.tableName, entry.records) : [],
    );
    const results = rankSearchResults(cleanQuery, candidates);

    let state = "ready";
    if (failedSources.length === SEARCH_SOURCES.length) state = "error";
    else if (failedSources.length > 0) state = "partial";
    else if (staleSources.length > 0) state = "stale";

    return {
      query: cleanQuery,
      state,
      results,
      groups: groupSearchResults(results),
      failedSources,
      staleSources,
      callCount: SEARCH_SOURCES.length,
    };
  };
}
