"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, BookOpen, CalendarDays, LayoutGrid, Search, Star, Users } from "lucide-react";
import { PortalToolLinks, portalToolBrands } from "@/features/tools/portal-tool-links";
import type { ToolLink } from "@/features/tools/directory";
import { PortalModuleCard } from "./module-card";
import type { PortalModule } from "./model";
import styles from "./portal.module.css";

type Tab = "home" | "modules" | "tools";
const categories: Record<string, string> = { "LINK-048": "Operación", "LINK-002": "Operación", "LINK-178": "Operación", "LINK-086": "Equipo", "LINK-056": "Agenda", "LINK-131": "Documentos" };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function PortalWorkspace({ modules, links, hotelAllowed, attention }: {
  modules: PortalModule[]; links: ToolLink[]; hotelAllowed: boolean; attention: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const id = useId();
  const controls = useRef<Array<HTMLButtonElement | null>>([]);
  const tabs: { key: Tab; label: string }[] = [{ key: "home", label: "Inicio" }, { key: "modules", label: "Módulos" }, ...(hotelAllowed ? [{ key: "tools" as const, label: "Catálogo" }] : [])];
  const filtered = links.filter(link => {
    const brand = portalToolBrands[link.id as keyof typeof portalToolBrands];
    return brand && (category === "Todas" || categories[link.id] === category) && normalize(`${brand.name} ${brand.title} ${brand.detail}`).includes(normalize(query.trim()));
  });
  const motor = links.find(link => link.id === "LINK-002");
  const people = modules.find(module => module.ordinal === 6 && module.href);

  function openTab(next: Tab) {
    setTab(next); controls.current[tabs.findIndex(item => item.key === next)]?.focus();
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); setTab(tabs[next].key); controls.current[next]?.focus();
  }

  const peoplePanel = people?.href ? <section className={styles.panel + " " + styles.peoplePanel} aria-labelledby="portal-people-heading">
    <div className={styles.panelHeading}><h2 id="portal-people-heading"><Users size={20} aria-hidden="true" />Personas</h2><Link href={people.href} prefetch={false} className={styles.textLink}>Ver equipo<ArrowRight size={15} aria-hidden="true" /></Link></div>
    <p className={styles.panelBody}>Horarios · Asistencia · Planilla según acceso</p>
    <p className={styles.panelNote}>{people.note}</p>
  </section> : <section className={styles.panel + " " + styles.peoplePanel}><div className={styles.panelHeading}><h2><LayoutGrid size={20} aria-hidden="true" />Tu trabajo</h2></div><p className={styles.panelBody}>Consulta los módulos y accesos disponibles para tu cuenta.</p><button type="button" className={styles.textLink} onClick={() => openTab("modules")}>Ver módulos<ArrowRight size={15} aria-hidden="true" /></button></section>;

  return <>
    <div className={styles.workspaceToolbar}><h1>{tabs.find(item => item.key === tab)?.label}</h1>
      <Link href="/my-toro" prefetch={false} className={styles.searchEntry}><Search size={18} aria-hidden="true" /><span>Buscar en Mi espacio</span><ArrowRight size={17} aria-hidden="true" /></Link>
    </div>
    <div role="tablist" aria-label="Vistas del Portal" className={styles.workspaceTabs}>
      {tabs.map((item, index) => <button key={item.key} ref={element => { controls.current[index] = element; }} type="button" role="tab" id={`${id}-tab-${item.key}`} aria-selected={tab === item.key} aria-controls={`${id}-panel-${item.key}`} tabIndex={tab === item.key ? 0 : -1} onClick={() => setTab(item.key)} onKeyDown={event => navigateTabs(event, index)}>{item.label}{item.key === "modules" ? <span>{modules.length}</span> : item.key === "tools" ? <span>{links.length}</span> : null}</button>)}
    </div>
    <div role="tabpanel" id={`${id}-panel-home`} aria-labelledby={`${id}-tab-home`} hidden={tab !== "home"} tabIndex={0} className={styles.tabPanel}>
      <div className={styles.homeGrid} data-hotel={hotelAllowed} data-attention={Boolean(attention)}>
        {attention ? <div className={styles.homeColumn}>{attention}</div> : null}
        {hotelAllowed ? <>
          <section className={styles.panel + " " + styles.favoritesPanel} aria-labelledby="portal-favorites-heading">
            <div className={styles.panelHeading}><h2 id="portal-favorites-heading"><Star size={20} aria-hidden="true" />Favoritos</h2><button type="button" className={styles.textLink} onClick={() => openTab("tools")}>Ver catálogo<ArrowRight size={15} aria-hidden="true" /></button></div>
            {links.length ? <PortalToolLinks links={links.slice(0, 9)} favorites idPrefix="favorite" /> : <p role="status" className={styles.emptyNote}>La lista no está disponible ahora. Puedes consultar la guía del turno.</p>}
            <p className={styles.panelNote}>{Math.min(links.length, 9)} accesos disponibles · capacidad para 9</p>
            <details className={styles.subtleDisclosure}><summary>Personalizar favoritos</summary><p>Guardar tu selección y añadir accesos aún está en preparación. El catálogo reúne los destinos revisados disponibles.</p></details>
          </section>
          <section className={styles.panel + " " + styles.krossPanel} aria-labelledby="portal-kross-heading">
            <div className={styles.panelHeading}><h2 id="portal-kross-heading"><CalendarDays size={20} aria-hidden="true" />Buscar en Kross</h2></div>
            <p className={styles.panelBody}>Disponibilidad, precios y condiciones en el motor oficial.</p>
            <div className={styles.krossSummary}><CalendarDays size={22} aria-hidden="true" /><div><strong>Entrada — Salida</strong><span>Selecciona las fechas en Kross</span></div></div>
            {motor ? <a href={motor.url} target="_blank" rel="noopener noreferrer" className={styles.primaryAction}>Abrir motor Kross<ArrowRight size={17} aria-hidden="true" /></a> : <p className={styles.emptyNote}>Acceso al motor no disponible en esta consulta.</p>}
            <p className={styles.panelNote}>Se abre otra pestaña. El widget integrado y el calendario de rango siguen pendientes de verificación.</p>
            <details className={styles.subtleDisclosure}><summary>Niños y varias habitaciones</summary><p>Usa las opciones del motor oficial. Las edades, el reparto por habitación y sus resultados deben verificarse antes de mostrarlos aquí.</p></details>
          </section>
        </> : null}
        {peoplePanel}
      </div>
      <section className={styles.overviewRow} aria-label="Accesos al trabajo"><div><BookOpen size={21} aria-hidden="true" /><span><strong>Cerebro y módulos</strong><small>Consultas y guías según tu cuenta</small></span></div><button type="button" className={styles.textLink} onClick={() => openTab("modules")}>Ver {modules.length} módulos<ArrowRight size={16} aria-hidden="true" /></button></section>
    </div>
    <div role="tabpanel" id={`${id}-panel-modules`} aria-labelledby={`${id}-tab-modules`} hidden={tab !== "modules"} tabIndex={0} className={styles.tabPanel}>
      <section aria-labelledby="portal-modules-heading"><div className={styles.sectionHeading}><h2 id="portal-modules-heading">Cerebro y módulos</h2><span>Plan General · 00–11</span></div><p className={styles.sectionNote}>Abre una consulta o guía disponible. Cada vista informa su cobertura.</p><div className={styles.grid}>{modules.map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div></section>
    </div>
    {hotelAllowed ? <div role="tabpanel" id={`${id}-panel-tools`} aria-labelledby={`${id}-tab-tools`} hidden={tab !== "tools"} tabIndex={0} className={styles.tabPanel}>
      <section className={styles.panel} aria-labelledby="portal-tools-heading"><div className={styles.sectionHeading}><h2 id="portal-tools-heading">Catálogo de herramientas</h2><span>{links.length} destinos revisados</span></div>
        <div className={styles.catalogFilters}><label className={styles.catalogSearch}><Search size={18} aria-hidden="true" /><span className={styles.srOnly}>Buscar herramienta</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar herramienta…" /></label><label className={styles.categorySelect}><span>Sección</span><select value={category} onChange={event => setCategory(event.target.value)}>{["Todas", "Operación", "Equipo", "Agenda", "Documentos"].map(value => <option key={value}>{value}</option>)}</select></label></div>
        <p role="status" className={styles.panelNote}>{filtered.length} de {links.length} accesos</p>
        {filtered.length ? <PortalToolLinks links={filtered} wide idPrefix="catalog" /> : <p className={styles.emptyNote}>{links.length ? "Sin resultados. Cambia la búsqueda o la sección." : "La lista no está disponible ahora. Puedes consultar la guía del turno."}</p>}
        <div className={styles.toolsFooter}><p className={styles.note}>Cada herramienta conserva su sesión y permisos.</p><Link href="/my-toro/herramientas" prefetch={false} className={styles.guideLink}>Guía de mi turno<ArrowRight size={17} aria-hidden="true" /></Link></div>
      </section>
    </div> : null}
  </>;
}
