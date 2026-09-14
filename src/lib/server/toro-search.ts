import "server-only";

import { createAirtableSearchLoader } from "../search/airtable-search-loader.mjs";
import { createToroSearchService } from "../search/toro-search-service.mjs";
import { readAirtableRecords } from "./read-only-connectors";

const CANONICAL_TORO_OS_BASE_ID = "apptlzWcI6DdpLO0B";

export async function searchToroFromAirtable(query: string) {
  const baseId = process.env.AIRTABLE_BASE_ID ?? CANONICAL_TORO_OS_BASE_ID;
  const loadSource = createAirtableSearchLoader({
    baseId,
    readRecords: readAirtableRecords,
  });
  const searchToro = createToroSearchService({ loadSource });

  return searchToro(query);
}
