# TORO OS — Plan de ejecución Human Mode + Search V1 + Ficha 360

> **For agentic workers:** use Superpowers executing-plans / TDD. Work on an isolated branch. Do not implement on `main` directly.

**Goal:** cerrar la experiencia ejecutiva existente, implementar una búsqueda universal mínima sobre las fuentes actuales y preparar la primera Ficha 360° sin crear una segunda arquitectura.

**Arquitectura vigente:** “Cerebro de Toro” = TORO OS. Airtable `TORO OS — Sistema Operativo Central` es la capa gobernada actual de catálogo/control/cola; Kross/Alegra conservan sus dominios; Supabase entra solo cuando resuelve una necesidad técnica concreta.

**Spec:** `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`

## Restricciones globales

- No crear Human Mode V2.
- No crear otra base/interface madre.
- No crear `universal_search_index` en V1.
- No migrar Airtable a Supabase por defecto.
- No duplicar precio/disponibilidad/reservas de Kross como verdad propia.
- Reutilizar claves y relaciones existentes.
- Exact match debe ganar a fuzzy.
- Proyectar solo datos seguros y necesarios.
- Mobile-first.
- Cambios sensibles auditables y con gate.

---

## Task 1 — Alinear documentación canónica

**Files:**
- Modify: `docs/superpowers/specs/2026-09-14-toro-os-role-based-interface-design.md`
- Modify: `docs/superpowers/plans/2026-09-14-toro-os-phase-1-executive-shell.md`

- [x] Reemplazar la premisa obsoleta `Supabase canonical / Airtable backup-only`.
- [x] Documentar `Cerebro de Toro = TORO OS`.
- [x] Documentar autoridad por dominio.
- [x] Documentar Human Mode, Search V1 y Room 25 pilot.

---

## Task 2 — Cerrar Fase A en Human Mode — Hoy

**Target:** Airtable `TORO OS Executive Command Center → Human Mode — Hoy` existente.

**No crear una página nueva.**

Aplicar pares Big Number + lista con la misma población:

### Decisiones
`tasks`: `founder_action_required=true` AND `status NOT IN(done,cancelled)`.

Snapshot previo: 0.

### Acciones
`tasks`: (`portfolio_lane=NOW` OR `status=in_progress`) AND `status NOT IN(done,cancelled)`.

Snapshot previo: 8; 3 `in_progress`.

### Riesgos
`validations`: `severity IN(high,critical)` AND `status IN(open,in_review)`.

Snapshot previo: 7.

### Aprobaciones
`approvals`: `approval_status=pending`.

Snapshot previo: 0.

- [ ] Editar los filtros de la página existente.
- [ ] Recargar y verificar counts vivos.
- [ ] Confirmar que no aparecen DONE/CANCELLED ni backlog histórico irrelevante.
- [ ] QA móvil.

**Bloqueo conocido:** el conector Airtable disponible en la conversación no expone edición de filtros/elementos de una página existente. Si sigue igual, mantener esta task BLOQUEADA; no sortearla creando V2.

---

## Task 3 — Search V1: router puro y seguro

**Objetivo:** probar ranking y proyección segura sin depender de Next.js, Supabase ni una tabla índice.

**Files:**
- Create: `src/lib/search/search-router.test.mjs`
- Create: `src/lib/search/search-router.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**TDD:** test primero y observar RED en CI antes de crear producción.

### API mínima

```js
rankSearchResults(query, candidates)
groupSearchResults(results)
```

`candidate` de entrada puede contener:
- `entityType`
- `key`
- `title`
- `aliases`
- `searchText`
- `subtitle`
- `status`
- `destination`
- `source`

La salida debe conservar solo campos seguros necesarios y el `matchType`/score; nunca propagar campos arbitrarios o payload crudo.

### Ranking

1. exact key/number
2. exact title
3. exact alias
4. prefix
5. fuzzy/token

### Tests mínimos

- [ ] query vacía → `[]`.
- [ ] `25` prioriza `DC-ROOM-25` sobre registros cuyos textos solo contienen 25.
- [ ] alias exacto gana a fuzzy.
- [ ] normalización ignora mayúsculas/acentos razonablemente.
- [ ] salida no propaga `rawPayload`, notas privadas o campos desconocidos.
- [ ] agrupación estable por tipo de entidad.

### Datos fuente V1

El adaptador futuro consulta directamente Airtable actual:
`rooms`, `villas`, `sellable_units`, `properties`, `amenities`, `staff_directory`, `tasks`, `validations`, `experiences`, `sops`, `source_objects`.

No crear índice maestro.

---

## Task 4 — Room 360: view-model puro para #25

**Files:**
- Create: `src/lib/search/room-360.test.mjs`
- Create: `src/lib/search/room-360.mjs`

**TDD:** test primero y observar RED en CI.

### API mínima

```js
buildRoom360(input)
```

### Secciones esperadas

- `summary`
- `sale`
- `kross`
- `media`
- `operation`
- `knowledge`

### Fixture piloto #25

- key `DC-ROOM-25`
- capacity 5
- beds King + Queen + individual
- private kitchen
- projector
- 22 amenities
- individual sellable unit
- Villa Toro
- Full Property Buyout

### Reglas

- [ ] deduplicar sellable units.
- [ ] Kross se presenta como autoridad; no duplicar precio/disponibilidad.
- [ ] media se agrupa en hero / web / kross / pending; no payload crudo.
- [ ] operation incluye tasks/validations solo por claves estructuradas exactas.
- [ ] una nota que contiene “25” no crea relación operacional.
- [ ] salida omite campos privados/desconocidos.

---

## Task 5 — Integración con fuentes actuales

**Prerequisite:** Task 3 y 4 verdes.

- [ ] Crear un adapter server-side para Airtable actual usando configuración/variables seguras existentes o el mecanismo que ya use el repo.
- [ ] No hardcodear secretos.
- [ ] Consultar solo campos permitidos por entidad.
- [ ] Aplicar búsqueda exacta/estructurada antes de fuzzy cuando sea posible.
- [ ] Añadir manejo de stale/error/partial.

**Nota:** si implementar el adapter exige APIs de Next.js, primero leer la documentación de `node_modules/next/dist/docs/` como exige `AGENTS.md`. Si el entorno no tiene node_modules, esta task queda bloqueada y no se adivina la API.

---

## Task 6 — UI Search + Ficha 360

**Prerequisites:** Task 2 cerrada, Task 3–5 verdes, entorno con documentación Next disponible.

- [ ] Añadir búsqueda accesible desde la shell existente.
- [ ] Resultados agrupados: Habitaciones, Propiedades/Villas, Personas, Operación, Conocimiento, Experiencias, Sistemas.
- [ ] `Ver` abre detalle gobernado.
- [ ] Implementar Room 25 como primer detalle 360.
- [ ] Mobile QA: pocos taps, textos cortos, progressive disclosure.
- [ ] No mostrar raw tables en home.

---

## Task 7 — Decisión Supabase basada en evidencia

Solo después de medir Search V1.

Registrar:
- latencia;
- número de consultas;
- límites/costo de Airtable;
- permisos requeridos;
- necesidad de búsqueda semántica;
- volumen.

- [ ] Si existe problema concreto, diseñar componente Supabase específico.
- [ ] Si no existe, mantener V1 sin migración.

---

## Verificación final

- [ ] Human Mode usa filtros correctos en la página original.
- [ ] Search V1 exact>alias>prefix>fuzzy.
- [ ] No raw private payload.
- [ ] Room 25 view model usa relaciones estructuradas.
- [ ] Test/lint/build verdes.
- [ ] QA móvil de UI cuando exista.
- [ ] Airtable task `toro_human_mode_v1_20260914` actualizada.
- [ ] `TORO Executive Control` actualizado solo si cambió un hito real.
- [ ] Handoff canónico Notion actualizado.
- [ ] No se creó una nueva fuente de verdad.
