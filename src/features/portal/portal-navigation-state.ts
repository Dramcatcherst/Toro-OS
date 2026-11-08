export const portalTabs = ["home", "operations", "money", "people", "growth", "tools", "reports", "modules", "more"] as const;
export type PortalTab = (typeof portalTabs)[number];
export type MainPortalTab = "home" | "operations" | "money" | "more";
export function resolvePortalTab(value: string | string[] | undefined | null, hotelAllowed: boolean): PortalTab {
  if (typeof value !== "string" || !portalTabs.includes(value as PortalTab) || (value === "operations" && !hotelAllowed)) return "home";
  return value as PortalTab;
}
export function readPortalTab(search: string, hotelAllowed: boolean): PortalTab {
  const values = new URLSearchParams(search).getAll("tab");
  return resolvePortalTab(values.length === 1 ? values[0] : undefined, hotelAllowed);
}
export function mainPortalTab(tab: PortalTab): MainPortalTab {
  return tab === "home" || tab === "operations" || tab === "money" ? tab : "more";
}
export function portalTabUrl(tab: PortalTab, search = ""): string {
  const params = new URLSearchParams(search); params.set("tab", tab);
  return `/portal?${params.toString()}`;
}
export function writePortalTab(history: Pick<History, "pushState">, tab: PortalTab, search: string): void {
  history.pushState(null, "", portalTabUrl(tab, search));
}
export function focusPortalContent(origin: "primary" | "shortcut", target: Pick<HTMLElement, "focus"> | null, schedule: (callback: () => void) => void): void {
  if (origin === "shortcut") schedule(() => target?.focus());
}
export function subscribePortalNavigation(listener: () => void): () => void {
  window.addEventListener("popstate", listener); window.addEventListener("toro:portal-navigation", listener);
  return () => { window.removeEventListener("popstate", listener); window.removeEventListener("toro:portal-navigation", listener); };
}
export function portalBrowserSearch(): string { return window.location.search; }
