"use client";
import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, LayoutGrid, Sparkles, Star, Users, BedDouble, Wallet, Megaphone, Wrench, ChartNoAxesCombined, Home } from "lucide-react";
import { PortalToolLinks, getToolPresentation } from "@/features/tools/portal-tool-links";
import type { ToolCatalogueItem, ToolCatalogueMode, ToolLink } from "@/features/tools/directory";
import { PortalToolCatalogue } from "@/features/tools/portal-tool-catalogue";
import { PortalModuleCard } from "./module-card";
import type { PortalModule } from "./model";
import { PortalCashTools } from "./portal-cash-tools";
import { PortalResponseTools } from "./portal-response-tools";
import { PortalKrossWidget } from "./portal-kross-widget";
import styles from "./portal.module.css";
type Tab = "home" | "operations" | "money" | "people" | "growth" | "tools" | "reports" | "modules";
const preferred = ["LINK-048", "PORTAL-POS", "LINK-178", "PORTAL-WHATSAPP", "LINK-086", "PORTAL-ALEGRA", "LINK-131", "LINK-056", "PORTAL-GMAIL"];
export function PortalWorkspace({ modules, links, catalogueItems, catalogueMode, hotelAllowed, attention }: {
  modules: PortalModule[]; links: ToolLink[]; catalogueItems: ToolCatalogueItem[]; catalogueMode: ToolCatalogueMode;
  hotelAllowed: boolean; attention: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("home");
  const [favorites, setFavorites] = useState(() => [...preferred.filter(key => links.some(link => link.id === key)), ...links.filter(link => !preferred.includes(link.id)).map(link => link.id)].slice(0, 9));
  const id = useId();
  const controls = useRef<Array<HTMLButtonElement | null>>([]);
  const tabs = [
    { key: "home" as Tab, label: "Inicio", Icon: Home },
    ...(hotelAllowed ? [{ key: "operations" as Tab, label: "Operación", Icon: BedDouble }] : []),
    { key: "money" as Tab, label: "Dinero", Icon: Wallet },
    { key: "people" as Tab, label: "Personas", Icon: Users },
    { key: "growth" as Tab, label: "Mercadeo", Icon: Megaphone },
    { key: "tools" as Tab, label: "Herramientas", Icon: Wrench },
    { key: "reports" as Tab, label: "Reportes", Icon: ChartNoAxesCombined },
    { key: "modules" as Tab, label: "Más", Icon: LayoutGrid },
  ];
  const motor = links.find(link => link.id === "LINK-002");
  const people = modules.find(module => module.ordinal === 6 && module.href);
  const modulesFor = (...ordinals: number[]) => modules.filter(module => ordinals.includes(module.ordinal));
  const toolsFor = (...sections: string[]) => links.filter(link => sections.includes(getToolPresentation(link).category));
  const favoritesLinks = favorites.flatMap(key => links.filter(link => link.id === key));
  function openTab(next: Tab) { setTab(next); controls.current[tabs.findIndex(item => item.key === next)]?.focus(); }
  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); setTab(tabs[next].key); controls.current[next]?.focus();
  }
  function panel(key: Tab, content: ReactNode) { return <div role="tabpanel" id={`${id}-panel-${key}`} aria-labelledby={`${id}-tab-${key}`} hidden={tab !== key} tabIndex={0} className={styles.tabPanel}>{content}</div>; }
  const peoplePanel = <section className={styles.panel + " " + styles.peoplePanel} aria-labelledby="portal-people-heading">
    <div className={styles.panelHeading}><h2 id="portal-people-heading"><Users size={20} aria-hidden="true" />Personas</h2>{people?.href ? <Link href={people.href} prefetch={false} className={styles.textLink}>Ver equipo<ArrowRight size={15} aria-hidden="true" /></Link> : null}</div>
    <p className={styles.panelBody}>{people ? "Horarios · Asistencia · Planilla" : "Accesos de equipo según tu cuenta"}</p>
    <details className={styles.subtleDisclosure}><summary>Acceso y cobertura</summary><p>{people?.note ?? "Selecciona Personas para consultar tu cobertura."}</p></details>
  </section>;
  return <>
    <div role="tablist" aria-label="Vistas del Portal" className={styles.workspaceTabs}>{tabs.map((item, index) => <button key={item.key} ref={element => { controls.current[index] = element; }} type="button" role="tab" id={`${id}-tab-${item.key}`} aria-selected={tab === item.key} aria-controls={`${id}-panel-${item.key}`} tabIndex={tab === item.key ? 0 : -1} onClick={() => setTab(item.key)} onKeyDown={event => navigateTabs(event, index)}><item.Icon size={17} aria-hidden="true" />{item.label}</button>)}</div>
    <div className={styles.workspaceToolbar}>
      <div className={styles.workspaceTitle}><span><Sparkles size={14} aria-hidden="true" />Vista {tabs.find(item => item.key === tab)?.label}</span><h1>Centro de mando</h1></div>
      <Link href="/my-toro" prefetch={false} className={styles.searchEntry}><span>Abrir Mi espacio</span><ArrowRight size={17} aria-hidden="true" /></Link>
    </div>
    {panel("home", <>
      <div className={styles.homeGrid} data-hotel={hotelAllowed} data-attention={Boolean(attention)}>
        <div className={styles.homeColumn}>{attention}{peoplePanel}</div>
        {hotelAllowed ? <>
          <section className={styles.panel + " " + styles.favoritesPanel} aria-labelledby="portal-favorites-heading">
            <div className={styles.panelHeading}><h2 id="portal-favorites-heading"><Star size={20} aria-hidden="true" />Favoritos</h2><button type="button" className={styles.textLink} onClick={() => openTab("tools")}>Ver todas<ArrowRight size={15} aria-hidden="true" /></button></div>
            {favoritesLinks.length ? <PortalToolLinks links={favoritesLinks} favorites idPrefix="favorite" /> : <p className={styles.emptyNote}>Selecciona tus favoritos abajo.</p>}
            {catalogueMode === "fallback" ? <p role="status" className={styles.panelNote}>La lista completa no está disponible ahora. Mostramos solo accesos públicos revisados.</p> : null}
            <details className={styles.subtleDisclosure}><summary>Personalizar · {favoritesLinks.length}/9</summary><p>Selecciona hasta nueve accesos para esta sesión.</p><div className={styles.favoriteOptions}>{links.map(link => <label key={link.id}><input type="checkbox" checked={favorites.includes(link.id)} disabled={!favorites.includes(link.id) && favorites.length >= 9} onChange={event => setFavorites(current => event.target.checked ? [...current, link.id].slice(0, 9) : current.filter(key => key !== link.id))} />{getToolPresentation(link).name}</label>)}</div></details>
          </section><PortalKrossWidget available={Boolean(motor)} motorUrl={motor?.url} />
        </> : null}
      </div>
      <div className={styles.utilityRail}><button type="button" onClick={() => openTab("money")}><Wallet size={19} aria-hidden="true" /><span>Caja CRC + USD</span></button><button type="button" onClick={() => openTab("tools")}><Wrench size={19} aria-hidden="true" /><span>Mensajes y utilidades</span></button>{hotelAllowed ? <a href="https://home.google.com/" target="_blank" rel="noopener noreferrer"><Home size={19} aria-hidden="true" /><span>Google Home ↗</span></a> : null}<Link href="/brain" prefetch={false}><LayoutGrid size={19} aria-hidden="true" /><span>Cerebro TORO</span></Link></div>
    </>)}
    {hotelAllowed ? panel("operations", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>Operación del hotel</h2><span>Fuentes oficiales</span></div><p className={styles.sectionNote}>Reservas, entradas, salidas, cobros y seguimiento del turno.</p><PortalToolLinks links={toolsFor("Operación", "Comunicación")} wide idPrefix="operations" /><div className={styles.grid}>{modulesFor(1, 5, 9).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div><p className={styles.panelNote}>La ocupación, habitaciones vacías y precios del día se consultan en Kross. Su resumen automático aún no está conectado al Portal.</p></section>) : null}
    {panel("money", <><div className={styles.sectionHeading}><h2>Dinero y cierre de caja</h2><span>Conteo manual · CRC + USD</span></div><PortalCashTools /><div className={styles.grid}>{modulesFor(2).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div>{hotelAllowed ? <PortalToolLinks links={toolsFor("Dinero").concat(links.filter(link => link.id === "PORTAL-POS"))} wide idPrefix="money" /> : null}<p className={styles.panelNote}>Ingresos, gastos, bancos y comprobantes: consulta el sistema contable. Este conteo no registra movimientos ni confirma pagos.</p></>)}
    {panel("people", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>{hotelAllowed ? "Personas y DreamTeam" : "Personas"}</h2><span>Accesos por perfil</span></div><div className={styles.grid}>{modulesFor(6).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div>{hotelAllowed ? <PortalToolLinks links={toolsFor("Equipo").concat(links.filter(link => link.id === "LINK-056"))} wide idPrefix="people" /> : null}<p className={styles.panelNote}>{hotelAllowed ? "DreamTeam conserva sus horarios, asistencia y planillas. La sesión compartida entre sitios requiere completar la integración de identidad." : "Las consultas de equipo se habilitan según tu cuenta y organización."}</p></section>)}
    {panel("growth", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>Mercadeo y comunicación</h2><span>Respuestas listas para adaptar</span></div>{hotelAllowed ? <><PortalToolLinks links={toolsFor("Mercadeo")} wide idPrefix="marketing-tools" /><PortalResponseTools prefix="marketing" /></> : <p className={styles.panelNote}>Las herramientas de comunicación se habilitan según el contexto de tu cuenta.</p>}<div className={styles.grid}>{modulesFor(3, 4, 7).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div></section>)}
    {panel("tools", <section className={styles.panel + " " + styles.viewPanel} aria-labelledby="portal-tools-heading"><div className={styles.sectionHeading}><h2 id="portal-tools-heading">Catálogo de herramientas</h2><span>{catalogueItems.length} fichas visibles</span></div>{hotelAllowed ? <><PortalToolCatalogue items={catalogueItems} idPrefix="catalog" mode={catalogueMode} /><div className={styles.toolsFooter}><Link href="/my-toro/herramientas" prefetch={false} className={styles.guideLink}>Directorio y guía del turno<ArrowRight size={17} aria-hidden="true" /></Link></div></> : <p className={styles.panelNote}>Los accesos del hotel no corresponden al contexto de esta cuenta.</p>}{hotelAllowed ? <PortalResponseTools prefix="tools" /> : null}</section>)}
    {panel("reports", <section className={styles.panel + " " + styles.viewPanel}><div className={styles.sectionHeading}><h2>Reportes y seguimiento</h2><span>Cobertura indicada en cada consulta</span></div><div className={styles.grid}>{modulesFor(1, 2, 5, 6, 10, 11).map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div><p className={styles.panelNote}>{hotelAllowed ? "Los reportes de Kross, Alegra y DreamTeam conservan su fuente oficial. La sincronización de reservas, aseo, mantenimiento y finanzas sigue pendiente." : "Cada consulta indica las fuentes y cobertura disponibles para tu cuenta."}</p></section>)}
    {panel("modules", <section aria-labelledby="portal-modules-heading"><div className={styles.sectionHeading}><h2 id="portal-modules-heading">Cerebro y módulos</h2><span>Plan General · 00–11</span></div><p className={styles.sectionNote}>Abre una consulta o guía disponible. Cada vista informa su cobertura.</p><div className={styles.grid}>{modules.map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div></section>)}
  </>;
}
