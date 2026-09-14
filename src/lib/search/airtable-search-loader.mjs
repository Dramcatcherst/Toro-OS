export function createAirtableSearchLoader({ baseId, readRecords }) {
  if (!baseId) throw new TypeError("createAirtableSearchLoader requires baseId");
  if (typeof readRecords !== "function") throw new TypeError("createAirtableSearchLoader requires readRecords");

  return async function loadSource(source, query) {
    try {
      const response = await readRecords({
        baseId,
        tableId: source.tableId,
        fields: source.fields,
        searchFields: source.searchFields,
        query,
        pageSize: source.pageSize,
      });

      if (!response?.configured || response?.error || !response?.data) {
        return { ok: false, records: [], stale: false };
      }

      const records = Array.isArray(response.data.records) ? response.data.records : [];
      return { ok: true, records, stale: false };
    } catch {
      return { ok: false, records: [], stale: false };
    }
  };
}
