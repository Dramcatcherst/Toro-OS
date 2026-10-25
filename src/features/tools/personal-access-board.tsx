"use client";

import { useId, useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import type { ToolCatalogueItem } from "./directory";
import { getToolPresentation, getToolFacetValue, PortalToolLinks } from "./portal-tool-links";
import styles from "./personal-access-board.module.css";

export type PersonalAccess = { id: string; label: string; url: string; favorite: boolean };
type Preferences = { version: 1; links: PersonalAccess[] };
type StoragePort = Pick<Storage, "getItem" | "setItem">;
export const PERSONAL_ACCESS_LIMIT = 50;
const controls = /[\u0000-\u001f\u007f-\u009f]/;
const sensitive = /token|password|passwd|auth|signature|api[_.-]?key|secret|credential|(?:^|[/?&#=])(?:sig|jwt|code|key|session(?:[_-]?id)?|sid|otp|csrf|sso|ticket)(?:[/?&#=]|$)/i;
const internalPaths = new Set(["/portal", "/brain", "/my-toro", "/my-toro/herramientas", "/booking-assist", "/modules", "/modules/event-ops", "/dreamcatcher"]);

/** Navigation only: no scripts, secrets, local files, API routes or arbitrary commands. */
export function safePersonalAccessUrl(input: string): string | null {
  if (!input || input.length > 2048 || input !== input.trim()) return null;
  let decoded = input;
  // Reject nested encodings rather than allowing a later decoder to reveal controls or credentials.
  for (let index = 0; index < 8; index += 1) {
    if (controls.test(decoded) || /\s|\\/.test(decoded) || sensitive.test(decoded)) return null;
    let next: string;
    try { next = decodeURIComponent(decoded); } catch { return null; }
    if (next === decoded) break;
    if (index === 7) return null;
    decoded = next;
  }
  if (controls.test(decoded) || /\s|\\/.test(decoded) || sensitive.test(decoded)) return null;
  if (input.startsWith("/")) {
    if (input.startsWith("//") || decoded.startsWith("//")) return null;
    const url = new URL(input, "https://toro.invalid");
    // Internal navigation is limited to existing page destinations; no API/action endpoints.
    if (!internalPaths.has(url.pathname) || url.pathname !== decoded.split(/[?#]/)[0]) return null;
    return input;
  }
  try {
    const url = new URL(input);
    const decodedUrl = new URL(decoded);
    if (!/^https:\/\//i.test(input) || url.protocol !== "https:" || !url.hostname || url.username || url.password || decodedUrl.username || decodedUrl.password) return null;
    return url.href;
  } catch { return null; }
}

export function personalAccessStorageKey(scopeKey: string): string {
  return `toro:personal-access:v1:${encodeURIComponent(scopeKey)}`;
}

export function readPersonalAccess(storage: StoragePort, scopeKey: string): { links: PersonalAccess[]; warning: boolean } {
  try {
    const raw = storage.getItem(personalAccessStorageKey(scopeKey));
    if (!raw) return { links: [], warning: false };
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1 || !("links" in data) || !Array.isArray(data.links) || data.links.length > PERSONAL_ACCESS_LIMIT) return { links: [], warning: true };
    const links: PersonalAccess[] = [];
    const seen = new Set<string>();
    for (const entry of data.links) {
      if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || !/^personal-[a-z0-9-]{1,80}$/i.test(entry.id) || seen.has(entry.id) || typeof entry.label !== "string" || !entry.label.trim() || entry.label.length > 80 || controls.test(entry.label) || typeof entry.url !== "string" || typeof entry.favorite !== "boolean") continue;
      const url = safePersonalAccessUrl(entry.url);
      if (!url) continue;
      seen.add(entry.id);
      links.push({ id: entry.id, label: entry.label.trim(), url, favorite: entry.favorite });
    }
    return { links, warning: links.length !== data.links.length };
  } catch { return { links: [], warning: true }; }
}

export function savePersonalAccess(storage: StoragePort, scopeKey: string, links: PersonalAccess[]): boolean {
  const data: Preferences = { version: 1, links };
  // Validate before any write, including callers other than this form.
  const serialized = JSON.stringify(data);
  const checked = readPersonalAccess({ getItem: () => serialized, setItem: () => undefined }, scopeKey);
  if (checked.warning) return false;
  try { storage.setItem(personalAccessStorageKey(scopeKey), JSON.stringify({ version: 1, links: checked.links })); return true; } catch { return false; }
}

export function movePersonalAccess(links: PersonalAccess[], id: string, direction: -1 | 1): PersonalAccess[] {
  const index = links.findIndex(link => link.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= links.length) return links;
  const reordered = [...links];
  [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
  return reordered;
}

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
const subscribeHydration = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;
export function groupPersonalAccessCatalogue(items: ToolCatalogueItem[], query: string, facets: { provider: string; scope: string } = { provider: "", scope: "" }) {
  const search = normalize(query.trim());
  const projects = new Map<string, Map<string, ToolCatalogueItem[]>>();
  let count = 0;
  for (const item of items) {
    const display = getToolPresentation(item);
    const project = item.kind === "directory" ? item.project : "Accesos revisados";
    const category = item.kind === "directory" ? item.category : display.category;
    if (facets.provider && getToolFacetValue(item, "provider") !== facets.provider) continue;
    if (facets.scope && getToolFacetValue(item, "scope") !== facets.scope) continue;
    const content = [project, category, display.name, display.detail, ...display.keywords, item.kind === "directory" ? `${item.provider} ${item.state} ${item.lifecycle} ${item.scope} ${item.linkType}` : ""].join(" ");
    if (search && !normalize(content).includes(search)) continue;
    if (!projects.has(project)) projects.set(project, new Map());
    const categories = projects.get(project)!;
    if (!categories.has(category)) categories.set(category, []);
    categories.get(category)!.push(item);
    count += 1;
  }
  return { count, groups: [...projects].map(([project, categories]) => ({ project, count: [...categories.values()].reduce((sum, entries) => sum + entries.length, 0), categories: [...categories].map(([category, links]) => ({ category, links })) })) };
}

/** scopeKey must include the authenticated user + organization/context. It is a UI partition, not an access grant. */
export function PersonalAccessBoard({ items, scopeKey }: { items: ToolCatalogueItem[]; scopeKey: string }) {
  // Remount before paint on context changes: drafts, query and previous preferences never cross profiles.
  return <ScopedPersonalAccessBoard key={scopeKey} items={items} scopeKey={scopeKey} />;
}

function ScopedPersonalAccessBoard({ items, scopeKey }: { items: ToolCatalogueItem[]; scopeKey: string }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("");
  const [scope, setScope] = useState("");
  const hasFilters = Boolean(query || provider || scope);
  const ready = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const [restored] = useState(() => {
    if (typeof window === "undefined") return { links: [] as PersonalAccess[], warning: false };
    try { return readPersonalAccess(window.localStorage, scopeKey); }
    catch { return { links: [] as PersonalAccess[], warning: true }; }
  });
  const [storedLinks, setLinks] = useState(restored.links);
  const links = ready ? storedLinks : [];
  const [notice, setNotice] = useState(restored.warning ? "Algunas preferencias no pudieron recuperarse. Puedes trabajar en esta sesión; no se aceptan enlaces inseguros." : "");
  const [editing, setEditing] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [deleted, setDeleted] = useState<{ link: PersonalAccess; index: number } | null>(null);
  const selection = useMemo(() => groupPersonalAccessCatalogue(items, query, { provider, scope }), [items, query, provider, scope]);
  const providers = [...new Set(items.map(item => getToolFacetValue(item, "provider")))].sort((a, b) => a.localeCompare(b, "es"));
  const scopes = [...new Set(items.map(item => getToolFacetValue(item, "scope")))].sort((a, b) => a.localeCompare(b, "es"));
  const personal = links.filter(link => (!onlyFavorites || link.favorite) && normalize(`${link.label} ${link.url}`).includes(normalize(query.trim())));

  function update(next: PersonalAccess[], message: string) {
    setLinks(next);
    let persisted = false;
    try { persisted = savePersonalAccess(window.localStorage, scopeKey, next); } catch { /* In-memory fallback for blocked storage. */ }
    setNotice(persisted ? message : `${message} Solo en esta sesión: el navegador no permitió guardar.`);
  }
  function resetForm() { setEditing(null); setLabel(""); setUrl(""); setError(""); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const safeUrl = safePersonalAccessUrl(url.trim());
    if (!label.trim() || label.trim().length > 80 || controls.test(label) || !safeUrl) {
      setError("Usa un nombre de hasta 80 caracteres y un enlace HTTPS o una página interna de TORO. No incluyas credenciales, códigos ni tokens.");
      return;
    }
    if (!editing && links.length >= PERSONAL_ACCESS_LIMIT) { setError("El límite es de 50 accesos personales."); return; }
    const next = editing ? links.map(link => link.id === editing ? { ...link, label: label.trim(), url: safeUrl } : link)
      : [...links, { id: `personal-${crypto.randomUUID()}`, label: label.trim(), url: safeUrl, favorite: false }];
    update(next, editing ? "Acceso actualizado." : "Acceso añadido.");
    resetForm();
  }

  return <section className={styles.board} aria-labelledby={id + "-title"}>
    <header className={styles.heading}><h2 id={id + "-title"}>Todos los accesos</h2><span>{items.length} del catálogo · {links.length} personales</span></header>
    <p className={styles.note}>Abre proyectos y categorías para ver todos los destinos autorizados. Un enlace abre su herramienta; no demuestra conexión ni comparte sesión.</p>
    <label className={styles.search} htmlFor={id + "-search"}><Search size={18} aria-hidden="true" /><span>Buscar accesos</span><input id={id + "-search"} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Herramienta, proyecto o tarea" /></label>
    <div className={styles.facets}>
      <label>Proveedor<select value={provider} onChange={event => setProvider(event.target.value)}><option value="">Todos</option>{providers.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Ámbito<select value={scope} onChange={event => setScope(event.target.value)}><option value="">Todos</option>{scopes.map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    <div className={styles.feedback}><span>{selection.count} de {items.length} destinos disponibles</span>{hasFilters ? <button type="button" onClick={() => { setQuery(""); setProvider(""); setScope(""); }}>Limpiar filtros</button> : null}</div>

    <details className={styles.personal} open>
      <summary>Mis accesos <span>{links.length}/{PERSONAL_ACCESS_LIMIT}</span></summary>
      <div className={styles.inset}>
        <p className={styles.note}>Solo en este navegador y perfil. No se sincronizan con TORO ni cambian permisos. No guardes secretos en nombres o enlaces.</p>
        <div className={styles.feedback}><label className={styles.checkbox}><input type="checkbox" checked={onlyFavorites} onChange={event => setOnlyFavorites(event.target.checked)} /> Solo favoritos ({links.filter(link => link.favorite).length})</label><span>{personal.length} visibles</span></div>
        {!ready ? <p className={styles.note}>Cargando preferencias locales…</p> : null}
        {personal.length ? <ul className={styles.personalList}>{personal.map(link => <li key={link.id}>
          <div className={styles.personalDestination}><span className={styles.tag}>Acceso personal · enlace</span><PortalToolLinks links={[link]} compact idPrefix={`${id}-personal`} ariaLabel={"Abrir " + link.label} /></div>
          <div className={styles.controls}>
            <button type="button" aria-label={(link.favorite ? "Quitar favorito " : "Marcar favorito ") + link.label} aria-pressed={link.favorite} onClick={() => update(links.map(item => item.id === link.id ? { ...item, favorite: !item.favorite } : item), "Favorito actualizado.")}><Star size={16} aria-hidden="true" fill={link.favorite ? "currentColor" : "none"} /></button>
            <button type="button" aria-label={"Subir " + link.label} disabled={links[0]?.id === link.id} onClick={() => update(movePersonalAccess(links, link.id, -1), "Orden actualizado.")}><ArrowUp size={16} aria-hidden="true" /></button>
            <button type="button" aria-label={"Bajar " + link.label} disabled={links.at(-1)?.id === link.id} onClick={() => update(movePersonalAccess(links, link.id, 1), "Orden actualizado.")}><ArrowDown size={16} aria-hidden="true" /></button>
            <button type="button" aria-label={"Editar " + link.label} onClick={() => { setEditing(link.id); setLabel(link.label); setUrl(link.url); setError(""); }}><Pencil size={16} aria-hidden="true" /></button>
            <button type="button" aria-label={"Eliminar " + link.label} onClick={() => { setDeleted({ link, index: links.findIndex(item => item.id === link.id) }); update(links.filter(item => item.id !== link.id), "Acceso eliminado. Puedes deshacerlo."); if (editing === link.id) resetForm(); }}><Trash2 size={16} aria-hidden="true" /></button>
          </div>
        </li>)}</ul> : ready ? <p className={styles.note}>{links.length ? "No hay accesos personales con estos filtros." : "Añade enlaces que uses a diario. El catálogo oficial permanece abajo."}</p> : null}
        {deleted ? <button type="button" className={styles.undo} disabled={links.length >= PERSONAL_ACCESS_LIMIT} onClick={() => { const next = [...links]; next.splice(Math.min(deleted.index, links.length), 0, deleted.link); update(next, "Acceso restaurado."); setDeleted(null); }}>Deshacer eliminación de {deleted.link.label}</button> : null}
        <form className={styles.form} onSubmit={submit} aria-label={editing ? "Editar acceso personal" : "Nuevo acceso personal"}>
          <h3><Plus size={16} aria-hidden="true" />{editing ? "Editar acceso" : "Nuevo acceso"}</h3>
          <label htmlFor={id + "-label"}>Nombre<input id={id + "-label"} value={label} onChange={event => setLabel(event.target.value)} maxLength={80} autoComplete="off" required /></label>
          <label htmlFor={id + "-url"}>Enlace HTTPS o ruta de TORO<input id={id + "-url"} value={url} onChange={event => setUrl(event.target.value)} maxLength={2048} autoComplete="off" spellCheck={false} placeholder="https://… o /portal" required aria-describedby={error ? id + "-error" : undefined} /></label>
          {error ? <p role="alert" id={id + "-error"} className={styles.error}>{error}</p> : null}
          <div className={styles.formActions}><button className={styles.primary} type="submit" disabled={!ready || (!editing && links.length >= PERSONAL_ACCESS_LIMIT)}>{editing ? "Guardar cambios" : "Añadir acceso"}</button>{editing ? <button type="button" onClick={resetForm}>Cancelar edición</button> : null}</div>
        </form>
        <p className={styles.notice} role="status" aria-live="polite">{ready ? notice : ""}</p>
      </div>
    </details>

    <div className={styles.projects} key={hasFilters ? "search" : "browse"}>{selection.groups.map((group, projectIndex) => <details className={styles.project} key={group.project} open={hasFilters ? true : undefined}>
      <summary>{group.project}<span>{group.count} accesos · {group.categories.length} categorías</span></summary>
      <div className={styles.categories}>{group.categories.map((category, categoryIndex) => <details className={styles.category} key={category.category} open={hasFilters ? true : undefined}>
        <summary>{category.category}<span>{category.links.length}</span></summary>
        <div className={styles.destinations}><PortalToolLinks links={category.links} compact idPrefix={`${id}-catalogue-${projectIndex}-${categoryIndex}`} ariaLabel={`${group.project} · ${category.category}`} /></div>
      </details>)}</div>
    </details>)}</div>
    {!selection.count ? <p className={styles.note}>{items.length ? "No hay destinos del catálogo que coincidan. Cambia la búsqueda." : "No hay destinos del catálogo disponibles para este contexto."}</p> : null}
  </section>;
}
