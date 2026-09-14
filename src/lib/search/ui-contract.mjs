export const TORO_SEARCH_PATH = "/toro/buscar";

export function getSearchResultAction(result) {
  const entityType = typeof result?.entityType === "string" ? result.entityType : "";
  const key = typeof result?.key === "string" ? result.key.trim() : "";

  if (entityType === "room" && key) {
    return {
      kind: "room360",
      label: "Ver ficha 360",
      href: `/toro/habitaciones/${encodeURIComponent(key)}`,
    };
  }

  return {
    kind: "inline",
    label: "Ver",
    href: null,
  };
}
