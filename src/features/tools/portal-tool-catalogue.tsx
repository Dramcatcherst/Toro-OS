"use client";

import { useId, useReducer } from "react";
import { RotateCcw, Search } from "lucide-react";
import type { ToolCatalogueItem, ToolCatalogueMode } from "./directory";
import { getToolPresentation, PortalToolLinks } from "./portal-tool-links";
import portalStyles from "@/features/portal/portal.module.css";
import styles from "./portal-tool-catalogue.module.css";

export const TOOL_CATALOGUE_BATCH_SIZE = 48;
export type ToolCatalogueFilters = { query: string; project: string; category: string; state: string; visibleCount: number };
export type ToolCatalogueAction =
  | { type: "query" | "project" | "category" | "state"; value: string }
  | { type: "reset" }
  | { type: "more" };

export const initialToolCatalogueFilters: ToolCatalogueFilters = {
  query: "", project: "Todos", category: "Todas", state: "Todos", visibleCount: TOOL_CATALOGUE_BATCH_SIZE,
};

export function toolCatalogueReducer(state: ToolCatalogueFilters, action: ToolCatalogueAction): ToolCatalogueFilters {
  if (action.type === "reset") return initialToolCatalogueFilters;
  if (action.type === "more") return { ...state, visibleCount: state.visibleCount + TOOL_CATALOGUE_BATCH_SIZE };
  return { ...state, [action.type]: action.value, visibleCount: TOOL_CATALOGUE_BATCH_SIZE };
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const valueFor = (item: ToolCatalogueItem, key: "project" | "category" | "state") =>
  item.kind === "directory" ? item[key] : key === "project" ? "Accesos revisados" : key === "category" ? getToolPresentation(item).category : "Revisado";
const priorityRank = (item: ToolCatalogueItem) => {
  if (item.kind !== "directory") return 4;
  const rank = /^P([0-3])(?:$|[\s:._-])/i.exec(item.priority.trim());
  return rank ? Number(rank[1]) : 5;
};
const optionList = (items: ToolCatalogueItem[], key: "project" | "category" | "state", all: string, current: string) => {
  const options = [all, ...new Set(items.map(item => valueFor(item, key)))].sort((a, b) =>
    a === all ? -1 : b === all ? 1 : a.localeCompare(b, "es"));
  if (!options.includes(current)) options.push(current);
  return options;
};

export function selectToolCatalogue(items: ToolCatalogueItem[], filters: ToolCatalogueFilters) {
  const query = normalize(filters.query.trim());
  const filteredLinks = items.filter(item => {
    const presentation = getToolPresentation(item);
    const directoryText = item.kind === "directory"
      ? [item.name, item.purpose, item.project, item.category, item.provider, item.state, item.lifecycle, item.priority, item.linkType, item.scope]
      : [];
    const text = [item.label, presentation.name, presentation.title, presentation.detail,
      presentation.category, ...presentation.keywords, ...directoryText].join(" ");
    return (filters.project === "Todos" || valueFor(item, "project") === filters.project) &&
      (filters.category === "Todas" || valueFor(item, "category") === filters.category) &&
      (filters.state === "Todos" || valueFor(item, "state") === filters.state) && normalize(text).includes(query);
  }).sort((a, b) => priorityRank(a) - priorityRank(b) ||
    valueFor(a, "project").localeCompare(valueFor(b, "project"), "es") ||
    Number(b.kind === "directory" && b.homeEligible) - Number(a.kind === "directory" && a.homeEligible) ||
    getToolPresentation(a).name.localeCompare(getToolPresentation(b).name, "es"));
  const visibleLinks = filteredLinks.slice(0, filters.visibleCount);
  const projects = optionList(items, "project", "Todos", filters.project);
  const categories = optionList(items, "category", "Todas", filters.category);
  const states = optionList(items, "state", "Todos", filters.state);
  // Group only adjacent items: collecting a project across priority bands would
  // move its routine items ahead of another project's critical work.
  const groups: { project: string; links: ToolCatalogueItem[] }[] = [];
  for (const item of visibleLinks) {
    const project = valueFor(item, "project");
    const previous = groups.at(-1);
    if (previous?.project === project) previous.links.push(item);
    else groups.push({ project, links: [item] });
  }
  return { filteredLinks, visibleLinks, groups, projects, categories, states, total: items.length,
    filteredTotal: filteredLinks.length, hasMore: visibleLinks.length < filteredLinks.length };
}

/** The caller supplies only destinations already permitted and sanitized by the server reader. */
export function PortalToolCatalogue({ items, idPrefix, mode = "reviewed" }: {
  items: ToolCatalogueItem[]; idPrefix: string; mode?: ToolCatalogueMode;
}) {
  const [filters, dispatch] = useReducer(toolCatalogueReducer, initialToolCatalogueFilters);
  const instance = useId();
  const catalogueId = idPrefix + "-" + instance;
  const selection = selectToolCatalogue(items, filters);
  const filtered = Boolean(filters.query.trim() || filters.project !== "Todos" || filters.category !== "Todas" || filters.state !== "Todos");
  return <section className={portalStyles.viewPanel + " " + styles.catalogue} aria-label="Catálogo de herramientas">
    <div className={styles.catalogueIntro}>
      <p>{mode === "complete" ? "Catálogo interno completo para tu rol." : mode === "reviewed"
        ? "Accesos revisados para tu rol." : "Cobertura parcial: mostramos únicamente los accesos revisados disponibles."}</p>
      {mode === "complete" && items.some(item => item.kind === "reviewed") ? <p>{items.filter(item => item.kind === "directory").length} fichas del directorio y {items.filter(item => item.kind === "reviewed").length} accesos manuales revisados.</p> : null}
      <p>El estado y el ámbito indican el uso previsto; un enlace no confirma sesión, integración ni datos vigentes.</p>
    </div>
    <div className={portalStyles.catalogFilters}>
      <label className={portalStyles.catalogSearch}><Search size={18} aria-hidden="true" />
        <span className={portalStyles.srOnly}>Buscar por nombre, uso, proveedor, proyecto o sección</span>
        <input type="search" value={filters.query} onChange={event => dispatch({ type: "query", value: event.target.value })} placeholder="Buscar herramienta, tarea o proveedor…" />
      </label>
      <div className={styles.selectGrid}>
        <label className={portalStyles.categorySelect}><span>Proyecto</span><select value={filters.project} onChange={event => dispatch({ type: "project", value: event.target.value })}>
          {selection.projects.map(project => <option key={project} value={project}>{project}</option>)}
        </select></label>
        <label className={portalStyles.categorySelect}><span>Categoría</span><select value={filters.category} onChange={event => dispatch({ type: "category", value: event.target.value })}>
          {selection.categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select></label>
        <label className={portalStyles.categorySelect}><span>Estado</span><select value={filters.state} onChange={event => dispatch({ type: "state", value: event.target.value })}>
          {selection.states.map(state => <option key={state} value={state}>{state}</option>)}
        </select></label>
      </div>
    </div>
    <div className={styles.feedbackRow}>
      <p role="status" aria-live="polite" className={portalStyles.panelNote}>{selection.visibleLinks.length} mostrados · {selection.filteredTotal} coincidencias · {selection.total} en el catálogo</p>
      <button type="button" className={portalStyles.utilityButton} disabled={!filtered} onClick={() => dispatch({ type: "reset" })}><RotateCcw size={15} aria-hidden="true" />Limpiar filtros</button>
    </div>
    {selection.groups.length ? <div className={styles.groups}>{selection.groups.map((group, index) =>
      <section key={group.project + "-" + index} className={styles.group} aria-labelledby={catalogueId + "-project-" + index}>
        <div className={styles.groupHeading}><h3 id={catalogueId + "-project-" + index}>{group.project}</h3><span>{group.links.length} {group.links.length === 1 ? "ficha" : "fichas"} en este lote</span></div>
        <PortalToolLinks links={group.links} wide idPrefix={catalogueId + "-group-" + index} ariaLabel={"Herramientas · " + group.project} />
      </section>)}</div>
      : <p className={portalStyles.emptyNote}>{selection.total ? "Sin coincidencias. Cambia la búsqueda o limpia los filtros." : "No hay destinos disponibles en esta consulta."}</p>}
    {selection.hasMore ? <div className={styles.moreRow}><button type="button" className={portalStyles.utilityButton} onClick={() => dispatch({ type: "more" })}>
      Mostrar {Math.min(TOOL_CATALOGUE_BATCH_SIZE, selection.filteredTotal - selection.visibleLinks.length)} más
    </button></div> : null}
  </section>;
}
