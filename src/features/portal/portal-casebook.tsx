"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FolderSearch, LockKeyhole, Search } from "lucide-react";
import { CASEBOOK_DEMO_RECORDS } from "./casebook-demo";
import { CASEBOOK_CATEGORIES, CASEBOOK_STATUSES, casebookReducer, createCasebookState, filterCasebookRecords, formatCasebookAmount, selectedCasebookRecord, type CasebookCategory, type CasebookState } from "./casebook-model";
import styles from "./portal-casebook.module.css";

// No data props or reader: hidden workspace panels are still delivered to the browser.
export function PortalCasebook() {
  const [state, dispatch] = useReducer(casebookReducer, undefined, createCasebookState);
  const id = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = [state.entity, state.period, state.status].filter(value => value !== "all").length;
  const search = useRef<HTMLInputElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const rowButtons = useRef(new Map<string, HTMLButtonElement>());
  const rows = filterCasebookRecords(CASEBOOK_DEMO_RECORDS, state);
  const selected = selectedCasebookRecord(CASEBOOK_DEMO_RECORDS, state);
  const entities = [...new Map(CASEBOOK_DEMO_RECORDS.map(row => [row.entityId, row.entityLabel])).entries()];
  const periods = [...new Set(CASEBOOK_DEMO_RECORDS.flatMap(row => row.period ? [row.period] : []))].sort().reverse();

  useEffect(() => {
    if (state.detailOpen) detailHeading.current?.focus();
  }, [state.detailOpen, state.selectedId]);

  function reset() { dispatch({ type: "reset" }); search.current?.focus(); }
  function back() {
    dispatch({ type: "back" });
    requestAnimationFrame(() => { if (selected) rowButtons.current.get(selected.id)?.focus(); });
  }

  return <section className={styles.casebook} aria-labelledby={`${id}-heading`} data-mode="synthetic" data-read-state="closed">
    <header className={styles.heading}>
      <div><h3 id={`${id}-heading`}><FolderSearch size={20} aria-hidden="true" />Expediente · demostración</h3><p>Personas, sociedades y patrimonio en el mismo Portal.</p></div>
      <span className={styles.closed}><LockKeyhole size={15} aria-hidden="true" />Lectura real cerrada</span>
    </header>
    <p className={styles.notice}><strong>Datos ficticios.</strong> Prueba el formato y los filtros. No son tus registros ni información del hotel.</p>

    <div className={styles.filters} data-expanded={filtersOpen}>
      <label className={styles.search} htmlFor={`${id}-search`}><span>Buscar en ejemplos</span><span className={styles.searchField}><Search size={16} aria-hidden="true" /><input ref={search} id={`${id}-search`} type="search" value={state.query} maxLength={200} placeholder="Nombre, bien, referencia…" onChange={event => dispatch({ type: "query", value: event.target.value })} /></span></label>
      <button type="button" className={styles.filterToggle} aria-expanded={filtersOpen} aria-controls={`${id}-advanced`} onClick={() => setFiltersOpen(open => !open)}>Filtros{activeFilters ? ` · ${activeFilters} ${activeFilters === 1 ? "activo" : "activos"}` : ""}</button>
      <div className={styles.advancedFilters} id={`${id}-advanced`}>
      <label htmlFor={`${id}-entity`}>Entidad<select id={`${id}-entity`} value={state.entity} onChange={event => dispatch({ type: "entity", value: event.target.value })}><option value="all">Todas las entidades</option>{entities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label htmlFor={`${id}-period`}>Período<select id={`${id}-period`} value={state.period} onChange={event => dispatch({ type: "period", value: event.target.value })}><option value="all">Todos los períodos</option>{periods.map(period => <option key={period}>{period}</option>)}<option value="unknown">Sin confirmar</option></select></label>
      <label htmlFor={`${id}-status`}>Estado<select id={`${id}-status`} value={state.status} onChange={event => dispatch({ type: "status", value: event.target.value as CasebookState["status"] })}><option value="all">Todos los estados</option>{Object.entries(CASEBOOK_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <button type="button" className={styles.reset} onClick={reset}>Limpiar</button>
    </div>
    <div role="group" aria-label="Secciones del expediente" className={styles.categories}>{Object.entries(CASEBOOK_CATEGORIES).map(([value, label]) => <button type="button" key={value} aria-pressed={state.category === value} onClick={() => dispatch({ type: "category", value: value as CasebookCategory })}>{label}</button>)}</div>
    <div className={styles.resultLine}><p role="status" aria-live="polite" aria-atomic="true">{rows.length} {rows.length === 1 ? "resultado de ejemplo" : "resultados de ejemplo"}</p><span>Selección y filtros solo en esta sesión</span></div>

    <div className={styles.workspace} data-detail-open={state.detailOpen}>
      <div className={styles.list}>
        {rows.length ? <ul aria-label="Registros de ejemplo">{rows.map(row => <li key={row.id}><button type="button" ref={element => { if (element) rowButtons.current.set(row.id, element); else rowButtons.current.delete(row.id); }} className={styles.row} aria-pressed={selected?.id === row.id} aria-controls={`${id}-detail`} onClick={() => dispatch({ type: "select", id: row.id })}>
          <span className={styles.rowTitle}>{row.title}<ArrowRight size={16} aria-hidden="true" /></span>
          <span className={styles.rowMeta}>{row.kind} · {row.entityLabel}</span>
          <span className={styles.rowBottom}><span className={styles.status} data-state={row.status}>{CASEBOOK_STATUSES[row.status]}</span><span>{row.period ?? "Período sin confirmar"}</span></span>
          <span className={styles.rowAction}>{row.nextAction}</span>
        </button></li>)}</ul> : <div className={styles.empty}><strong>Sin coincidencias</strong><p>No hay ejemplos con esta combinación de filtros.</p><button type="button" onClick={reset}>Restablecer filtros</button></div>}
      </div>
      <aside className={styles.detail} id={`${id}-detail`} aria-labelledby={selected ? `${id}-detail-heading` : undefined} aria-label={selected ? undefined : "Detalle sin selección"}>
        {selected ? <>
          <button type="button" className={styles.back} onClick={back}><ArrowLeft size={16} aria-hidden="true" />Volver a resultados</button>
          <div className={styles.detailTop}><span>{selected.kind} · ejemplo</span><span className={styles.status} data-state={selected.status}>{CASEBOOK_STATUSES[selected.status]}</span></div>
          <h4 ref={detailHeading} tabIndex={-1} id={`${id}-detail-heading`}>{selected.title}</h4>
          <p className={styles.summary}>{selected.summary}</p>
          <dl className={styles.facts}><div><dt>Referencia ficticia</dt><dd>{selected.reference}</dd></div><div><dt>Entidad</dt><dd>{selected.entityLabel}</dd></div><div><dt>Período</dt><dd>{selected.period ?? "Sin confirmar"}</dd></div><div><dt>Importe y naturaleza</dt><dd>{formatCasebookAmount(selected.amount)}</dd></div></dl>
          <div className={styles.next}><strong>Siguiente acción · ejemplo</strong><p>{selected.nextAction}</p></div>
          <details className={styles.disclosure}><summary>Fuente, corte y límites</summary><dl className={styles.facts}><div><dt>Fuente</dt><dd>{selected.source}</dd></div><div><dt>Corte</dt><dd>{selected.observed}</dd></div><div><dt>Límite</dt><dd>{selected.limitation}</dd></div></dl></details>
          <details className={styles.disclosure}><summary>Relaciones de ejemplo · {selected.relations.length}</summary><ul>{selected.relations.map(label => <li key={label}>{label}</li>)}</ul><p>Un vínculo no concede acceso ni prueba propiedad o representación.</p></details>
        </> : <p className={styles.summary}>El detalle aparecerá al encontrar un registro de ejemplo.</p>}
      </aside>
    </div>
    <footer className={styles.footer}><p><LockKeyhole size={14} aria-hidden="true" />Originales y exportación no disponibles en esta demostración.</p><details className={styles.disclosure}><summary>Guía rápida y cobertura</summary><ol><li>Filtra entidad, período o estado y selecciona una fila.</li><li>Abre fuente y relaciones para entender los límites del dato.</li><li>En móvil, vuelve a resultados sin perder los filtros.</li></ol><p>La lectura del expediente real requiere comprobar permiso, ámbito y aislamiento en el servidor. Este formato no modifica contabilidad, agenda ni datos de origen.</p></details></footer>
  </section>;
}
