"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, CalendarDays, Home, LayoutGrid, Sparkles, Star, Users, Wallet, Wrench } from "lucide-react";
import { PortalToolLinks, getToolPresentation } from "@/features/tools/portal-tool-links";
import type { ToolCatalogueItem, ToolCatalogueMode, ToolLink } from "@/features/tools/directory";
import { PortalToolCatalogue } from "@/features/tools/portal-tool-catalogue";
import { PortalModuleCard } from "./module-card";
import type { PortalModule } from "./model";
import { PortalCashTools } from "./portal-cash-tools";
import { PortalResponseTools } from "./portal-response-tools";
import { PortalKrossWidget } from "./portal-kross-widget";
import { resolvePortalStructure } from "./structure";
import styles from "./portal.module.css";

type Tab = "today" | "agenda" | "manage";
const preferred = ["LINK-048", "PORTAL-POS", "LINK-178", "PORTAL-WHATSAPP", "LINK-086", "PORTAL-ALEGRA", "LINK-131", "LINK-056", "PORTAL-GMAIL"];

export function nextPortalTabIndex(key: string, index: number, length: number): number | null {
  if (!length) return null;
  if (key === "ArrowRight") return (index + 1) % length;
  if (key === "ArrowLeft") return (index - 1 + length) % length;
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  return null;
}

export function PortalWorkspace({ modules, links, catalogueItems, catalogueMode, hotelAllowed, attention }: {
  modules: PortalModule[]; links: ToolLink[]; catalogueItems: ToolCatalogueItem[]; catalogueMode: ToolCatalogueMode;
  hotelAllowed: boolean; attention: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("today");
  const [favorites, setFavorites] = useState(() => [...preferred.filter(key => links.some(link => link.id === key)), ...links.filter(link => !preferred.includes(link.id)).map(link => link.id)].slice(0, 9));
  const id = useId();
  const controls = useRef<Array<HTMLButtonElement | null>>([]);
  const structure = resolvePortalStructure(modules);
  const tabs = [
    { key: "today" as const, label: "Hoy", Icon: Home },
    { key: "agenda" as const, label: "Agenda", Icon: CalendarDays },
    { key: "manage" as const, label: "Gestión", Icon: LayoutGrid },
  ];
  const motor = hotelAllowed ? links.find(link => link.id === "LINK-002") : undefined;
  const calendar = hotelAllowed ? links.find(link => link.id === "LINK-056") : undefined;
  const people = modules.find(module => module.ordinal === 6 && module.href);
  const favoritesLinks = hotelAllowed ? favorites.flatMap(key => links.filter(link => link.id === key)) : [];

  function openTab(next: Tab) { setTab(next); controls.current[tabs.findIndex(item => item.key === next)]?.focus(); }
  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextPortalTabIndex(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault(); setTab(tabs[next].key); controls.current[next]?.focus();
  }
  function panel(key: Tab, content: ReactNode) {
    return <div role="tabpanel" id={`${id}-panel-${key}`} aria-labelledby={`${id}-tab-${key}`} hidden={tab !== key} tabIndex={0} className={styles.tabPanel}>{content}</div>;
  }
  function moduleGroup(label: string, group: readonly PortalModule[], open = false) {
    if (!group.length) return null;
    return <details className={styles.managementGroup} open={open}><summary>{label}<span>{group.length}</span></summary><div className={styles.grid}>{group.map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div></details>;
  }

  return <>
    <div role="tablist" aria-label="Vistas del Portal" className={styles.workspaceTabs}>{tabs.map((item, index) => <button key={item.key} ref={element => { controls.current[index] = element; }} type="button" role="tab" id={`${id}-tab-${item.key}`} aria-selected={tab === item.key} aria-controls={`${id}-panel-${item.key}`} tabIndex={tab === item.key ? 0 : -1} onClick={() => setTab(item.key)} onKeyDown={event => navigateTabs(event, index)}><item.Icon size={17} aria-hidden="true" />{item.label}</button>)}</div>
    <div className={styles.workspaceToolbar}><div className={styles.workspaceTitle}><span><Sparkles size={14} aria-hidden="true" />Vista {tabs.find(item => item.key === tab)?.label}</span><h1>Centro de mando</h1></div><Link href="/my-toro" prefetch={false} className={styles.searchEntry}><span>Abrir Mi espacio</span><ArrowRight size={17} aria-hidden="true" /></Link></div>

    {panel("today", <>
      <div className={styles.homeGrid} data-hotel={hotelAllowed} data-attention={Boolean(attention)}>
        <div className={styles.homeColumn}>{attention}<section className={`${styles.panel} ${styles.peoplePanel}`} aria-labelledby="portal-people-heading"><div className={styles.panelHeading}><h2 id="portal-people-heading"><Users size={20} aria-hidden="true" />Personas</h2>{people?.href ? <Link href={people.href} prefetch={false} className={styles.textLink}>Ver equipo<ArrowRight size={15} aria-hidden="true" /></Link> : null}</div><p className={styles.panelBody}>{people ? "Horarios · Asistencia · Planilla" : "Accesos de equipo según tu cuenta"}</p><details className={styles.subtleDisclosure}><summary>Acceso y cobertura</summary><p>{people?.note ?? "La cobertura depende del contexto autorizado."}</p></details></section></div>
        {hotelAllowed ? <><section className={`${styles.panel} ${styles.favoritesPanel}`} aria-labelledby="portal-favorites-heading"><div className={styles.panelHeading}><h2 id="portal-favorites-heading"><Star size={20} aria-hidden="true" />Favoritos</h2><button type="button" className={styles.textLink} onClick={() => openTab("manage")}>Ver todas<ArrowRight size={15} aria-hidden="true" /></button></div>{favoritesLinks.length ? <PortalToolLinks links={favoritesLinks} favorites idPrefix="favorite" /> : <p className={styles.emptyNote}>Selecciona tus favoritos abajo.</p>}{catalogueMode === "fallback" ? <p role="status" className={styles.panelNote}>La lista completa no está disponible ahora. Mostramos solo accesos públicos revisados.</p> : null}<details className={styles.subtleDisclosure}><summary>Personalizar · {favoritesLinks.length}/9</summary><p>Selecciona hasta nueve accesos para esta sesión.</p><div className={styles.favoriteOptions}>{links.map(link => <label key={link.id}><input type="checkbox" checked={favorites.includes(link.id)} disabled={!favorites.includes(link.id) && favorites.length >= 9} onChange={event => setFavorites(current => event.target.checked ? [...current, link.id].slice(0, 9) : current.filter(key => key !== link.id))} />{getToolPresentation(link).name}</label>)}</div></details></section><PortalKrossWidget available={Boolean(motor)} motorUrl={motor?.url} /></> : null}
      </div>
      <div className={styles.todayModules}>{structure.today.map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div>
      <div className={styles.utilityRail}><button type="button" onClick={() => openTab("manage")}><Wallet size={19} aria-hidden="true" /><span>Caja CRC + USD</span></button><button type="button" onClick={() => openTab("manage")}><Wrench size={19} aria-hidden="true" /><span>Mensajes y utilidades</span></button>{hotelAllowed ? <a href="https://home.google.com/" target="_blank" rel="noopener noreferrer"><Home size={19} aria-hidden="true" /><span>Google Home ↗</span></a> : null}<Link href="/brain" prefetch={false}><LayoutGrid size={19} aria-hidden="true" /><span>Cerebro TORO</span></Link></div>
    </>)}

    {panel("agenda", <section className={`${styles.panel} ${styles.agendaState}`} aria-labelledby="portal-agenda-heading"><div className={styles.sectionHeading}><h2 id="portal-agenda-heading">Agenda</h2><span>Fuente no conectada</span></div><p className={styles.panelBody}>Agenda integrada no disponible en este contexto</p><p className={styles.panelNote}>No se infieren eventos, citas ni disponibilidad desde la ausencia de una fuente integrada.</p>{calendar ? <a href={calendar.url} target="_blank" rel="noopener noreferrer" className={styles.guideLink}>Abrir origen autorizado<ArrowRight size={17} aria-hidden="true" /></a> : null}</section>)}

    {panel("manage", <>
      <section aria-labelledby="portal-management-heading"><div className={styles.sectionHeading}><h2 id="portal-management-heading">Gestión por áreas</h2><span>Todos los módulos autorizados</span></div><p className={styles.sectionNote}>La agrupación organiza la presentación; no cambia permisos, estados ni fuentes.</p><div className={styles.managementGrid}>{structure.families.map(family => moduleGroup(family.label, family.modules, true))}{moduleGroup("Mapa", structure.map)}{moduleGroup("Sistemas", structure.system)}{moduleGroup("Otros módulos", structure.unmapped)}</div></section>
      <section className={`${styles.panel} ${styles.viewPanel}`} aria-labelledby="portal-cash-heading"><div className={styles.sectionHeading}><h2 id="portal-cash-heading">Dinero y cierre de caja</h2><span>Conteo manual · CRC + USD</span></div><PortalCashTools /></section>
      <section className={`${styles.panel} ${styles.viewPanel}`} aria-labelledby="portal-tools-heading"><div className={styles.sectionHeading}><h2 id="portal-tools-heading">Catálogo de herramientas</h2><span>{catalogueItems.length} fichas visibles</span></div>{hotelAllowed ? <><PortalToolLinks links={links} wide idPrefix="management-tools" /><PortalToolCatalogue items={catalogueItems} idPrefix="catalog" mode={catalogueMode} /><div className={styles.toolsFooter}><Link href="/my-toro/herramientas" prefetch={false} className={styles.guideLink}>Directorio y guía del turno<ArrowRight size={17} aria-hidden="true" /></Link></div><h3 className={styles.toolsSubheading}>Respuestas listas para adaptar</h3><PortalResponseTools prefix="management" /></> : <p className={styles.panelNote}>Los accesos del hotel no corresponden al contexto de esta cuenta.</p>}</section>
    </>)}
  </>;
}
