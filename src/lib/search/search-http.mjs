export function parseSearchQuery(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 120);
}
