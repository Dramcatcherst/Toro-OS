"use client";
import { useState } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import styles from "./portal.module.css";

// Exact public install snippet read from Kross widget 6 on 12 Oct 2026.
// Opaque sandbox isolates provider scripts from TORO session/storage and DOM.
const widgetDocument = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><link rel="stylesheet" href="https://data.krossbooking.com/widget/v6/dreamcatcherhotel/6.css"><style>html,body{margin:0;padding:0;background:#132c3e;color:#eaf3fb;font-family:Arial,sans-serif}body{padding:8px;box-sizing:border-box}*{box-sizing:border-box}</style><script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script><script defer src="https://data.krossbooking.com/widget/v6/dreamcatcherhotel/6.js"></script></head><body><div class="kross-container"></div><script>document.addEventListener('submit',function(e){if(e.target.tagName==='FORM')e.target.target='_blank'},true)</script></body></html>`;
export function PortalKrossWidget({ available, motorUrl }: { available: boolean; motorUrl?: string }) {
  const [open, setOpen] = useState(false);
  return <section className={styles.panel + " " + styles.krossPanel} aria-labelledby="portal-kross-heading"><div className={styles.panelHeading}><h2 id="portal-kross-heading"><CalendarDays size={20} aria-hidden="true" />Buscar en Kross</h2></div><p className={styles.panelBody}>Motor oficial · fechas, huéspedes y habitaciones.</p>
    {available ? <><details className={styles.widgetDisclosure} onToggle={event => setOpen(event.currentTarget.open)}><summary><CalendarDays size={20} aria-hidden="true" /><span>Entrada — Salida<small>Abre el calendario de Kross</small></span></summary>{open ? <iframe title="Widget oficial de reservas Kross" className={styles.widgetFrame} sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" srcDoc={widgetDocument} /> : null}</details><a href={motorUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryAction}>Abrir motor completo<ArrowUpRight size={17} aria-hidden="true" /></a><p className={styles.panelNote}>La consulta y los resultados pertenecen a Kross. Si el widget no carga, abre el motor completo.</p></> : <p className={styles.emptyNote}>Acceso al motor no disponible en esta consulta.</p>}
  </section>;
}
