"use client";

import { useId, useRef } from "react";
import { ArrowUpRight, Info, X } from "lucide-react";
import styles from "./portal-tool-details.module.css";

/** Only the already-authorized display projection crosses this client boundary. */
export function PortalToolDetails({ name, purpose, url, fields, source }: {
  name: string; purpose: string; url: string | null; fields: [string, string][]; source: string;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const external = url?.startsWith("https://");
  return <>
    <button ref={trigger} type="button" className={styles.trigger} aria-label={"Información de " + name}
      aria-haspopup="dialog" aria-controls={id} title={"Información de " + name}
      onClick={() => dialog.current?.showModal()}><Info size={18} aria-hidden="true" /></button>
    <dialog ref={dialog} id={id} className={styles.dialog} aria-labelledby={id + "-title"}
      aria-describedby={id + "-purpose"} onClose={() => trigger.current?.focus()}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className={styles.content}>
        <header className={styles.heading}><h3 id={id + "-title"}>{name}</h3>
          <button type="button" className={styles.close} aria-label="Cerrar información" onClick={() => dialog.current?.close()}><X size={19} aria-hidden="true" /></button>
        </header>
        <p id={id + "-purpose"} className={styles.purpose}>{purpose}</p>
        <p className={styles.notice}>Conexión sin comprobar · enlace de navegación; sesión y automatización sin verificar.</p>
        <dl className={styles.facts}>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <div className={styles.destination}><strong>Dirección</strong><span>{url ?? "Destino pendiente"}</span></div>
        <p className={styles.source}>Origen: {source}. Fecha de verificación no incluida en esta consulta.</p>
        {url ? <a className={styles.open} href={url} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          Abrir herramienta <ArrowUpRight size={17} aria-hidden="true" />{external ? <span className={styles.srOnly}> · abre otra pestaña</span> : null}
        </a> : <p className={styles.source}>La ficha informa; no habilita un acceso nuevo.</p>}
      </div>
    </dialog>
  </>;
}
