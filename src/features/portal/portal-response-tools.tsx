"use client";
import { useState } from "react";
import { Copy, MessagesSquare, Plus, Trash2 } from "lucide-react";
import styles from "./portal.module.css";
const initialTemplates = [
  { name: "Nueva consulta", text: "¡Hola! Gracias por escribir a Dreamcatcher 😊 Para ayudarte con una cotización, cuéntanos las fechas de entrada y salida, cuántos adultos y niños viajan y cuántas habitaciones necesitan." },
  { name: "Preparar llegada", text: "¡Hola! Estamos preparando tu llegada a Dreamcatcher 😊 ¿Nos confirmas a qué hora calculas llegar? Revisaremos los detalles de tu reserva y te compartiremos la información para tu check-in." },
  { name: "Solicitud recibida", text: "Gracias por avisarnos. Ya recibimos tu solicitud y vamos a revisarla con el equipo. Te confirmaremos en cuanto tengamos una respuesta." },
  { name: "Después de la estancia", text: "¡Gracias por visitarnos! Esperamos que hayan disfrutado Santa Teresa. Nos encantará conocer cómo estuvo su experiencia y qué podemos mejorar. Un abrazo del equipo Dreamcatcher 🌴" },
];
export function PortalResponseTools({ prefix }: { prefix: string }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState(initialTemplates[0].text);
  const [name, setName] = useState(initialTemplates[0].name);
  const [feedback, setFeedback] = useState("");
  async function copy() { try { await navigator.clipboard.writeText(draft); setFeedback("Texto copiado. Revísalo antes de enviarlo."); } catch { setFeedback("No se pudo copiar. Selecciona el texto y cópialo manualmente."); } }
  return <section className={styles.responseTools} aria-labelledby={`${prefix}-responses`}>
    <h3 id={`${prefix}-responses`}><MessagesSquare size={18} aria-hidden="true" />Respuestas rápidas</h3>
    <p className={styles.utilityNote}>Adapta, crea o elimina plantillas durante esta sesión. No se guardan datos de huéspedes.</p>
    <div className={styles.responseControls}><label className={styles.utilityField}>Plantilla<select value={selected} onChange={event => { const index = Number(event.target.value); setSelected(index); setDraft(templates[index].text); setName(templates[index].name); setFeedback(""); }}>{templates.map((item, index) => <option key={index} value={index}>{item.name}</option>)}</select></label><label className={styles.utilityField}>Nombre<input value={name} maxLength={80} onChange={event => setName(event.target.value)} /></label></div>
    <label className={styles.utilityField} htmlFor={`${prefix}-draft`}>Mensaje<textarea id={`${prefix}-draft`} rows={5} maxLength={5000} value={draft} onChange={event => { setDraft(event.target.value); setFeedback(""); }} /></label>
    <div className={styles.utilityActions}><button type="button" className={styles.utilityButton} disabled={!draft.trim()} onClick={copy}><Copy size={16} aria-hidden="true" />Copiar</button><button type="button" className={styles.utilityButton} disabled={!name.trim() || !draft.trim()} onClick={() => { setTemplates(current => current.map((item, index) => index === selected ? { name: name.trim(), text: draft } : item)); setFeedback("Plantilla actualizada para esta sesión."); }}>Actualizar</button><button type="button" className={styles.utilityButton} disabled={templates.length >= 20} onClick={() => { setTemplates(current => [...current, { name: "Nueva respuesta", text: "" }]); setSelected(templates.length); setName("Nueva respuesta"); setDraft(""); setFeedback(""); }}><Plus size={16} aria-hidden="true" />Nueva</button><button type="button" className={styles.utilityButton} disabled={templates.length <= 1} onClick={() => { const next = templates.filter((_, index) => index !== selected); setTemplates(next); setSelected(0); setName(next[0].name); setDraft(next[0].text); setFeedback("Plantilla eliminada de esta sesión."); }}><Trash2 size={16} aria-hidden="true" />Eliminar</button><a className={styles.utilityButton} href="https://web.whatsapp.com/" target="_blank" rel="noopener noreferrer">Abrir WhatsApp ↗</a><a className={styles.utilityButton} href="https://translate.google.com/" target="_blank" rel="noopener noreferrer">Traductor ↗</a></div>
    <p role="status" className={styles.utilityNote}>{feedback || "El envío y la traducción se completan en la herramienta correspondiente."}</p>
  </section>;
}
