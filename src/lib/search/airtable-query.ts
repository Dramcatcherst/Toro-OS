function cleanFields(fields?: string[]) {
  if (!Array.isArray(fields)) return [];
  return [
    ...new Set(
      fields
        .filter((field): field is string => typeof field === "string" && Boolean(field.trim()))
        .map((field) => field.trim()),
    ),
  ];
}

function clampPageSize(value?: number) {
  const numeric = Number.isFinite(value) ? Math.trunc(value as number) : 10;
  return Math.max(1, Math.min(25, numeric));
}

function escapeFormulaString(value: string) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function fieldReference(field: string) {
  return `{${field}}`;
}

export function buildAirtableReadQuery({
  fields,
  searchFields,
  query,
  pageSize,
}: {
  fields?: string[];
  searchFields?: string[];
  query?: string;
  pageSize?: number;
} = {}) {
  const allowedFields = cleanFields(fields);
  const allowedSet = new Set(allowedFields);
  const safeSearchFields = cleanFields(searchFields).filter((field) => allowedSet.has(field));
  const params = new URLSearchParams();

  params.set("pageSize", String(clampPageSize(pageSize)));
  for (const field of allowedFields) params.append("fields[]", field);

  const cleanQuery = String(query ?? "").trim();
  if (cleanQuery && safeSearchFields.length) {
    const escapedQuery = escapeFormulaString(cleanQuery.toLowerCase());
    const clauses = safeSearchFields.map(
      (field) => `SEARCH(LOWER("${escapedQuery}"), LOWER(${fieldReference(field)}&""))`,
    );
    params.set("filterByFormula", clauses.length === 1 ? clauses[0] : `OR(${clauses.join(",")})`);
  }

  return params;
}
