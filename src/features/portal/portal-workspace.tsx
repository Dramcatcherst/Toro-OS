"use client";

import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, BedDouble, Ellipsis, Home, Search, Star, Wallet } from "lucide-react";
import { PortalToolLinks, getToolPresentation } from "@/features/tools/portal-tool-links";
import type { ToolCatalogueItem, ToolCatalogueMode, ToolLink } from "@/features/tools/directory";
import { PortalToolCatalogue } from "@/features/tools/portal-tool-catalogue";
import { formatAttentionCut } from "@/features/attention/owner-attention-presentation";
import { PortalModuleCard } from "./module-card";
import type { PortalModule } from "./model";
import { PortalCashTools } from "./portal-cash-tools";
import { PortalResponseTools } from "./portal-response-tools";
import { PortalKrossWidget } from "./portal-kross-widget";
import { focusPortalContent, mainPortalTab, portalBrowserSearch, portalTabUrl, readPortalTab, subscribePortalNavigation, writePortalTab, type PortalTab } from "./portal-navigation-state";
import styles from "./portal.module.css";

const preferred = ["LINK-048", "PORTAL-POS", "LINK-178", "PORTAL-WHATSAPP", "LINK-086", "PORTAL-ALEGRA", "LINK-131", "LINK-056", "PORTAL-GMAIL"];
const titles: Record<PortalTab, string> = { home: "Hoy", operations: "Operación", money: "Dinero", people: "Personas", growth: "Mercadeo", tools: "Herramientas", reports: "Reportes", modules: "Módulos", more: "Más" };
const secondary: PortalTab[] = ["people", "growth", "tools", "reports", "modules"];
export type PortalHotelOverview = { ready: boolean; rowsRead: number | null; eligibleCount: number; readAt: string | null; latestUpdatedAt: string | null };

export function PortalWorkspace({ modules, links, catalogueItems, catalogueMode, hotelAllowed, attention, hotelOperations, hotelOverview, hotelDailySummary, initialTab = "home" }: {
  modules: PortalModule[]; links: ToolLink[]; catalogueItems: ToolCatalogueItem[]; catalogueMode: ToolCatalogueMode;
  hotelAllowed: boolean; attention: ReactNode; hotelOperations?: ReactNode; hotelOverview?: PortalHotelOverview; hotelDailySummary?: ReactNode; initialTab?: PortalTab;
}) {
  const search = useSyncExternalStore(subscribePortalNavigation, portalBrowserSearch, () => portalTabUrl(initialTab).slice(7));
  const tab = readPortalTab(search, hotelAllowed);
  const primary = mainPortalTab(tab);
  const [favorites, setFavorites] = useState(() => [...preferred.filter(key => links.some(link => link.id === key)), ...links.filter(link => !preferred.includes(link.id)).map(link => link.id)].slice(0, 9));
  const id = useId();
  const controls = useRef<Array<HTMLButtonElement | null>>([]);
  const heading = useRef<HTMLHeadingElement | null>(null);
  const tabs = [{ key: "home" as const, label: "Hoy", Icon: Home },
    ...(hotelAllowed ? [{ key: "operations" as const, label: "Operación", Icon: BedDouble }] : []),
    { key: "money" as const, label: "Dinero", Icon: Wallet }, { key: "more" as const, label: "Más", Icon: Ellipsis }];
  const modulesFor = (...ordinals: number[]) => modules.filter(module => ordinals.includes(module.ordinal));
  const toolsFor = (...sections: string[]) => links.filter(link => sections.includes(getToolPresentation(link).category));
  const favoritesLinks = favorites.flatMap(key => links.filter(link => link.id === key));
  const motor = links.find(link => link.id === "LINK-002");
  const planner = links.find(link => link.id === "LINK-048");
  function openTab(next: PortalTab, origin: "primary" | "shortcut" = "shortcut") {
    if (next !== tab || readPortalTab(window.location.search, hotelAllowed) !== next) {
      writePortalTab(window.history, next, window.location.search);
      window.dispatchEvent(new Event("toro:portal-navigation"));
    }
    focusPortalContent(origin, heading.current, callback => requestAnimationFrame(callback));
  }
  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); openTab(tabs[next].key, "primary"); controls.current[next]?.focus();
  }
  function panel(key: PortalTab, content: ReactNode) {
    return <div role="tabpanel" id={`${id}-panel-${key}`} aria-labelledby={`${id}-tab-${mainPortalTab(key)}`} hidden={tab !== key} tabIndex={0} className={styles.tabPanel}>{content}</div>;
  }
  return <div className={styles.workspace} data-destination={tab}>
    <div role="tablist" aria-label="Vistas del Portal" className={styles.primaryTabs}>{tabs.map((item, index) => <button key={item.key} ref={element => { controls.current[index] = element; }} type="button" role="tab"
      id={`${id}-tab-${item.key}`} aria-selected={primary === item.key} aria-controls={`${id}-panel-${item.key === "more" && primary === "more" ? tab : item.key}`}
      tabIndex={primary === item.key ? 0 : -1} onClick={() => openTab(item.key, "primary")} onKeyDown={event => navigateTabs(event, index)}><item.Icon size={19} aria-hidden="true" /><span>{item.label}</span></button>)}</div>
    <div className={styles.workspaceHeading}><div><p>{hotelAllowed ? "Tu hotel" : "Tu organización"}, con fuentes a la vista</p><h1 ref={heading} tabIndex={-1}>{titles[tab]}</h1></div>
      <button type="button" className={styles.findTools} onClick={() => openTab("tools")}><Search size={17} aria-hidden="true" />Buscar herramientas</button></div>
    {hotelAllowed && catalogueMode === "fallback" ? <details className={styles.sourceDisclosure}><summary>Cobertura de accesos</summary><p>La lista completa no está disponible ahora. Mostramos solo accesos públicos revisados.</p></details> : null}
    {primary === "more" ? <nav aria-label="Más destinos del Portal" className={styles.secondaryTabs}>{secondary.map(key => <button key={key} type="button" aria-current={tab === key ? "page" : undefined} onClick={() => openTab(key)}>{titles[key]}</button>)}</nav> : null}
    {panel("home", <>
      <div className={styles.ownerHome}>
        {hotelAllowed ? <section className={styles.panel + " " + styles.viewPanel} aria-labelledby={`${id}-work-heading`}>
          <div className={styles.panelHeading}><h2 id={`${id}-work-heading`}>Trabajo del hotel</h2><span className={styles.readOnlyBadge}>Solo lectura</span></div>
          {hotelDailySummary ?? <>
          <p className={styles.homeMetric}>{hotelOverview?.ready ? `${hotelOverview.rowsRead} filas consultadas · ${hotelOverview.eligibleCount} tareas elegibles` : "Trabajo registrado no disponible en esta consulta"}</p>
          <p className={styles.panelNote}>Último cambio registrado: {hotelOverview?.latestUpdatedAt ? formatAttentionCut(hotelOverview.latestUpdatedAt) : "sin fecha comprobada"}.</p>
          </>}
          <p className={styles.panelNote}>Kross: <strong>Sin dato actual verificado</strong>. Lo registrado requiere comprobar su vigencia.</p>
          <div className={styles.homeActions}><button type="button" onClick={() => openTab("operations")}>Revisar Operación<ArrowRight size={17} aria-hidden="true" /></button>
            {planner ? <a href={planner.url} target="_blank" rel="noopener noreferrer">Abrir planner Kross ↗</a> : null}</div>
          {!hotelDailySummary ? <details className={styles.subtleDisclosure}><summary>Fuente y alcance de la consulta</summary><p>Consulta: {hotelOverview?.readAt ? formatAttentionCut(hotelOverview.readAt) : "hora no disponible"}. No renueva el corte original. Lote acotado; total del hotel no verificado. No certifica ejecución física.</p></details> : null}
        </section> : null}
        <section className={styles.panel + " " + styles.viewPanel}><div className={styles.panelHeading}><h2>Accesos de trabajo</h2></div><div className={styles.homeActions}>
          <button type="button" onClick={() => openTab("money")}>Contar caja CRC + USD<ArrowRight size={17} aria-hidden="true" /></button>
          <button type="button" onClick={() => openTab("people")}>Equipo y turnos<ArrowRight size={17} aria-hidden="true" /></button>
          <button type="button" onClick={() => openTab("tools")}>Herramientas y mensajes<ArrowRight size={17} aria-hidden="true" /></button>
          <button type="button" onClick={() => openTab("reports")}>Reportes y seguimiento<ArrowRight size={17} aria-hidden="true" /></button>
        </div></section>
      </div>
      {hotelAllowed ? <details className={styles.homeDisclosure} aria-labelledby="portal-favorites-heading"><summary id="portal-favorites-heading"><Star size={16} aria-hidden="true" />Accesos frecuentes · {favoritesLinks.length} favoritos</summary>
        {favoritesLinks.length ? <PortalToolLinks links={favoritesLinks} favorites idPrefix="favorite" /> : <p className={styles.emptyNote}>Aún no hay favoritos en esta consulta.</p>}
        <details className={styles.subtleDisclosure}><summary>Personalizar favoritos para esta sesión</summary><div className={styles.favoriteOptions}>{links.map(link => <label key={link.id}><input type="checkbox" checked={favorites.includes(link.id)} disabled={!favorites.includes(link.id) && favorites.length >= 9}
          onChange={event => setFavorites(current => event.target.checked ? [...current, link.id].slice(0, 9) : current.filter(key => key !== link.id))} />{getToolPresentation(link).name}</label>)}</div></details>
      </details> : null}
    </>)}
    {hotelAllowed ? panel("operations", <section className={styles.panel + " " + styles.viewPanel}>
      {hotelOperations ?? <p className={styles.emptyNote}>La consulta de trabajo no está disponible para este contexto. Usa los accesos permitidos para consultar su fuente.</p>}
      <details className={styles.subtleDisclosure}><summary>Abrir fuentes y herramientas de operación</summary><PortalToolLinks links={toolsFor("Operación", "Comunicación")} wide idPrefix="operations" /></details>
    </section>) : null}
    {panel("money", <section className={styles.panel + " " + styles.viewPanel}>
      {attention ? <details className={styles.homeDisclosure} open><summary>Registros financieros y seguimiento · por verificar</summary>{attention}</details> : null}
      <div className={styles.sectionHeading}><h2>Conteo de caja</h2><span>Manual · CRC + USD</span></div><PortalCashTools />
      <details className={styles.subtleDisclosure}><summary>Consulta financiera y sistemas contables</summary><div className={styles.grid}>{modulesFor(2).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div>
        {hotelAllowed ? <PortalToolLinks links={toolsFor("Dinero").concat(links.filter(link => link.id === "PORTAL-POS"))} wide idPrefix="money" /> : null}</details>
      <p className={styles.panelNote}>Este conteo no registra movimientos ni confirma pagos. Los documentos contables mantienen su fuente oficial.</p></section>)}
    {panel("more", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>Elige un área</h2></div><p className={styles.panelNote}>Los destinos de arriba conservan las consultas y herramientas permitidas para tu cuenta.</p><div className={styles.homeActions}>
      <Link href="/my-toro" prefetch={false}>Mi espacio y consultas<ArrowRight size={17} aria-hidden="true" /></Link>
      <Link href="/brain" prefetch={false}>Cerebro TORO<ArrowRight size={17} aria-hidden="true" /></Link>
      {hotelAllowed ? <Link href="/my-toro/herramientas" prefetch={false}>Directorio y guía del turno<ArrowRight size={17} aria-hidden="true" /></Link> : null}
      {hotelAllowed ? <a href="https://home.google.com/" target="_blank" rel="noopener noreferrer">Google Home ↗</a> : null}</div></section>)}
    {panel("people", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>{hotelAllowed ? "Personas y DreamTeam" : "Personas"}</h2><span>Accesos por perfil</span></div><div className={styles.grid}>{modulesFor(6).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div>{hotelAllowed ? <PortalToolLinks links={toolsFor("Equipo").concat(links.filter(link => link.id === "LINK-056"))} wide idPrefix="people" /> : null}<p className={styles.panelNote}>{hotelAllowed ? "DreamTeam conserva horarios, asistencia y planillas. Cada herramienta requiere su propia sesión y permisos." : "Las consultas de equipo dependen de tu cuenta y organización activa."}</p></section>)}
    {panel("growth", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>Mercadeo y comunicación</h2><span>Respuestas listas para adaptar</span></div>{hotelAllowed ? <><PortalToolLinks links={toolsFor("Mercadeo")} wide idPrefix="marketing-tools" /><PortalResponseTools prefix="marketing" /></> : <p className={styles.panelNote}>Las herramientas se habilitan según el contexto de tu cuenta.</p>}<div className={styles.grid}>{modulesFor(3, 4, 7).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div></section>)}
    {panel("tools", <section className={styles.panel + " " + styles.viewPanel} aria-labelledby="portal-tools-heading"><div className={styles.sectionHeading}><h2 id="portal-tools-heading">Catálogo de herramientas</h2><span>{catalogueItems.length} fichas visibles</span></div>{hotelAllowed ? <><PortalToolCatalogue items={catalogueItems} idPrefix="catalog" mode={catalogueMode} /><div className={styles.toolsFooter}><Link href="/my-toro/herramientas" prefetch={false} className={styles.guideLink}>Directorio y guía del turno<ArrowRight size={17} aria-hidden="true" /></Link></div><PortalResponseTools prefix="tools" /><details className={styles.subtleDisclosure}><summary>Cotizar en el motor público de Kross</summary><PortalKrossWidget available={Boolean(motor)} motorUrl={motor?.url} /></details></> : <p className={styles.panelNote}>Los accesos del hotel no corresponden al contexto de esta cuenta.</p>}</section>)}
    {panel("reports", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>Reportes y seguimiento</h2><span>Cobertura indicada en cada consulta</span></div><div className={styles.grid}>{modulesFor(1, 2, 5, 6, 10, 11).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div><p className={styles.panelNote}>Los reportes mantienen sus fuentes oficiales. Un enlace no acredita sincronización de reservas, aseo, mantenimiento o finanzas.</p></section>)}
    {panel("modules", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>Cerebro y módulos</h2><span>Plan General · 00–11</span></div><p className={styles.panelNote}>Consultas disponibles y funciones en preparación, con su cobertura.</p><div className={styles.grid}>{modules.map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div></section>)}
  </div>;
}

