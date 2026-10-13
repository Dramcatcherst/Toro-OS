"use client";

import { useId, useReducer } from "react";
import { RotateCcw, Search } from "lucide-react";
import type { ToolLink } from "./directory";
import { getToolPresentation, PortalToolLinks, type PortalToolCategory } from "./portal-tool-links";
import portalStyles from "@/features/portal/portal.module.css";
import styles from "./portal-tool-catalogue.module.css";

export type ToolCatalogueFilters = { query: string; category: string };
export type ToolCatalogueAction = { type: "query" | "category"; value: string } | { type: "reset" };

export function toolCatalogueReducer(state: ToolCatalogueFilters, action: ToolCatalogueAction): ToolCatalogueFilters {
  if (action.type === "reset") return { query: "", category: "Todas" };
  return { ...state, [action.type]: action.value };
}

const categoryOrder: readonly PortalToolCategory[] = ["Operación", "Comunicación", "Equipo", "Dinero", "Google", "Documentos", "Otros"];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function selectToolCatalogue(links: ToolLink[], state: ToolCatalogueFilters) {
  const present = new Set(links.map(link => getToolPresentation(link).category));
  const categories: string[] = ["Todas", ...categoryOrder.filter(category => present.has(category))];
  // A temporary source change does not silently change the user's active filter.
  if (!categories.includes(state.category)) categories.push(state.category);
  const query = normalize(state.query.trim());
  const filteredLinks = links.filter(link => {
    const item = getToolPresentation(link);
    const text = [link.label, item.name, item.title, item.detail, item.category, ...item.keywords].join(" ");
    return (state.category === "Todas" || item.category === state.category) && normalize(text).includes(query);
  });
  const groups = categoryOrder.flatMap(category => {
    const group = filteredLinks.filter(link => getToolPresentation(link).category === category);
    return group.length ? [{ category, links: group }] : [];
  });
  return { filteredLinks, groups, categories, total: links.length };
}

/** The caller supplies only permitted destinations. This is not a permission or integration resolver. */
export function PortalToolCatalogue({ links, idPrefix, directoryAvailable = true }: {
  links: ToolLink[]; idPrefix: string; directoryAvailable?: boolean;
}) {
  const [state, dispatch] = useReducer(toolCatalogueReducer, { query: "", category: "Todas" });
  const instance = useId();
  const catalogueId = idPrefix + "-" + instance;
  const { filteredLinks, groups, categories, total } = selectToolCatalogue(links, state);
  const filtered = Boolean(state.query.trim() || state.category !== "Todas");
  return <section className={portalStyles.viewPanel + " " + styles.catalogue} aria-label="Catálogo de herramientas">
    <div className={portalStyles.catalogFilters}>
      <label className={portalStyles.catalogSearch}><Search size={18} aria-hidden="true" />
        <span className={portalStyles.srOnly}>Buscar por nombre, uso o sección</span>
        <input type="search" value={state.query} onChange={event => dispatch({ type: "query", value: event.target.value })} placeholder="Buscar herramienta o tarea…" />
      </label>
      <label className={portalStyles.categorySelect}><span>Sección</span>
        <select value={state.category} onChange={event => dispatch({ type: "category", value: event.target.value })}>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
    </div>
    <div className={styles.feedbackRow}>
      <p role="status" aria-live="polite" className={portalStyles.panelNote}>{filteredLinks.length} de {total} accesos en esta consulta</p>
      <button type="button" className={portalStyles.utilityButton} disabled={!filtered} onClick={() => dispatch({ type: "reset" })}><RotateCcw size={15} aria-hidden="true" />Limpiar filtros</button>
    </div>
    {!directoryAvailable ? <p role="status" className={portalStyles.panelNote}>Cobertura parcial: el directorio no está disponible. Mostramos los accesos revisados recibidos en esta consulta.</p> : null}
    {groups.length ? <div className={styles.groups}>{groups.map((group, index) =>
      <section key={group.category} className={styles.group} aria-labelledby={catalogueId + "-category-" + index}>
        <div className={styles.groupHeading}><h3 id={catalogueId + "-category-" + index}>{group.category}</h3><span>{group.links.length} {group.links.length === 1 ? "acceso" : "accesos"}</span></div>
        <PortalToolLinks links={group.links} wide idPrefix={catalogueId + "-group-" + index} ariaLabel={"Herramientas · " + group.category} />
      </section>)}</div>
      : <p className={portalStyles.emptyNote}>{total ? "Sin coincidencias. Cambia la búsqueda o limpia los filtros." : "No hay destinos disponibles en esta consulta."}</p>}
    <p className={portalStyles.panelNote}>Cada herramienta abre otra pestaña y mantiene su sesión propia. Un enlace disponible no confirma sincronización ni datos actualizados.</p>
  </section>;
}
