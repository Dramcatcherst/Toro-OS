# Portal Expediente First Lot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved compact casebook demonstration inside the existing private Portal, with real casebook reads closed.

**Architecture:** One client component in Reportes, reached from Dinero through the existing tab controller. Pure local filters and selection operate only on explicitly fictional fixtures; no data props, server reader, API, persistence, export, or new access grant.

**Tech Stack:** Existing Next 16, React 19, TypeScript, CSS modules and Vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-24-private-casebook-portal-integration-design.md` (approved by Mauricio on 24 October 2026). The first lot is the synthetic UI only; real-reader and authenticated acceptance remain later gates.

## Global Constraints

- Preserve the eight Portal tabs and modules 00–11, existing identity and context gates.
- Text at least 12px; interactive targets at least 44px; usable at 320/390px and desktop.
- No private identifiers, bank references, source payloads, custody documents or report copies in the repository, public assets or client bundle.
- Unknown differs from zero; partial differs from reconciled; never aggregate mixed currencies.
- Existing Plan General and Portal remain the sole product and governance system.
- Isolated task checkout from main `2da8a7217dcd263758f22230f647f10e19c35213`; preserve concurrent changes.

## Review Focus

- Accents, empty results and combined filters must not strand selection on a hidden record.
- A context change must discard local casebook state through the existing workspace identity key.
- A hidden tab is still serialized: every fixture and detail must be safe for client delivery.
- Mobile filters and long text must not cause page-wide horizontal overflow; selection must have a clear return path.
- Download/real-reader status must be honest, with no fake action or inferred permission.

## Task 1: Local state and synthetic contract

**Files:** Create `src/features/portal/casebook-model.ts`, `casebook-demo.ts`, `casebook-model.test.ts`.

**Interfaces:** `CasebookRecord`, `CasebookState`, `createCasebookState()`, `casebookReducer(state, action)`, `filterCasebookRecords(records, state)`, `selectedCasebookRecord(records, state)`. Fixtures use `demo-*` keys and generic invented labels only.

- [x] Write tests for combined category/entity/period/status filters, accent-insensitive search, empty/cleared search, hidden selection fallback, reset, immutable state, and null versus zero amount labels.
- [x] Run the targeted test and record RED before implementing.
- [x] Implement the minimal pure model and fictional fixtures; no real-data extension switch.
- [x] Run the model test GREEN and commit the coherent model.

## Task 2: Compact view inside existing Portal

**Files:** Create `src/features/portal/portal-casebook.tsx`, `portal-casebook.module.css`, `portal-casebook.test.tsx`; modify `portal-workspace.tsx`, `src/app/portal/page.test.tsx`.

**Interfaces:** `PortalCasebook()` accepts no props. Existing `openTab("reports")` handles the Dinero shortcut. Component stays mounted between tabs, while the existing per-user/org workspace key resets context.

- [x] Add failing SSR tests for the explicit fictional/closed-read labels, physical and legal entity coverage, unique control IDs, safe text escaping and no export/original links. Extend anonymous/inactive-context tests to exclude the view.
- [x] Implement a compact heading/filter row, category buttons, result list plus contextual detail, mobile selection/return, source/next-action disclosures and explicit unavailable originals/export text.
- [x] Run focused model, component and Portal guard tests; then existing hotel-tools and portal-auth checks.
- [x] Verify keyboard selection, filter reset, tab-state preservation, no empty-result stale detail, desktop/mobile overflow and 44px controls through a synthetic component harness outside production routes.
- [x] Run TypeScript, lint and build. Commit the coherent UI.

## Task 3: Review and canonical closeout

**Files:** This plan, existing `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, private canonical checkpoint and synchronized report/workbook metadata.

- [x] Obtain a fresh code/privacy review; repair findings and repeat affected checks only.
- [ ] Record exact SHA, synthetic QA scope, closed real-reader gate and rollback. Open one feature PR; attach it to this chat. Do not claim hosted/private acceptance from local tests.
- [ ] Update the existing checkpoint, report/workbook status, native TORO record, Dropbox version and same heartbeat prompt with verified receipts. Preserve financial evidence and pending bank-document search.
- [ ] Promote only if the existing exact-SHA CI, preview/auth isolation and rollback gates pass; otherwise leave the reviewable candidate and one precise next action.

## Execution and rollback

Mauricio explicitly approved this design and first lot, so execute in this session without repeating the approval. One implementation writer, bounded independent review. The task clone supplies isolation because existing local directories lacked usable Git metadata. No parallel application or database is created. Rollback is a revert of the feature commit; no data migration is involved.


## Ampliación solicitada: fichas y facetas del directorio · 24/10/2026

Usando writing-plans para ejecutar el mismo diseño compacto aprobado y la petición de fichas informativas. Sin otro plan de producto.

- GOAL: cada acceso estándar explica destino y uso en una ficha accesible; el lector deja de depender del censo histórico244.
- DoD: contrato cliente1–1000/IDsLINK únicos/13campos, fallback intacto, filtros por proveedor/ámbito, fichaPC/móvil conEscape/foco, pruebas y build; sin afirmar catálogo global completo.
- REPO: Dramcatcherst/Toro-OS.
- BASE_SHA:3c748b77ac5bf17d5f083da7bfc17255d6ee0758;origin/main3fe9fd1;dirtydocs previos preservados.
- BRANCH:codex/portal-expediente-first-lot-20261024;PR384.
- SKILL:toro-brain R3-2026-09-19 B06/B09/B11/B12/B14/B24/B28;toro-company-integration;writing-plans.
- SoT:RPCdreamcatcher_tool_catalog_v1 y13campos existentes;SourceRegistry yPlanGeneral;fuentes especializadas conservan autoridad.
- ALLOWED:directorio/server/tests,componenteToolLinks ysu ficha,facetas ybúsqueda,documentación de tags/carpetas virtuales/estudios,QA sintético ypreview.
- FORBIDDEN:exponer tags/evidencia/cortes fuera delRPC;reparar/promover registros incompletos sin revisión;grants,RLS,tablas,asientos,mensajes,instalación/pareo móvil,otroGateway/plan yproducción con hallazgos abiertos.
- BLOCKERS:fuente contiene entradas incompatibles que cierran elgate;no total/cursor/versión de origen enRPC;Kross mantiene hallazgos previos;no lector patrimonial individual.
- TESTS:negativas de seguridadexistentes,cardinalidad/IDs válidos cambiantes,invalidación conjunta,facetas combinadas,dialog no anidado,Escape/foco,390px/PC,lint/tsc/build.
- REPORT:STATE/SHA/TESTS/PR/PREVIEW/BLOCKERS/NEXT.

- [x] Añadir pruebas de cardinalidad dinámica y facetas; comprobar fallo esperado (8 fallos antes de implementar).
- [x] Reutilizar los 13 campos y componentes para fichas, facetas y contraste; sin nuevas dependencias.
- [x] Validar interacción y negativas, registrar la fuente incompatible y alinear el Plan General; revisión independiente sin hallazgos estáticos pendientes. Checkpoint y custodia se cierran con el recibo privado de este lote.

Reversión:revertir solo elcommit de esta ampliación;no hay migración de datos ni cambios de permisos. Aprobación de diseño y ejecución ya dada en la conversación;no pedir otra del mismo estilo.


### Resultado verificado de fichas y facetas

269/269 pruebas Tools/Portal y 164/164 de acceso; TypeScript y lint PASS. Build completo PASS con un trabajador (`CIRCLE_NODE_TOTAL=2` solo en el proceso local). El intento con 21 trabajadores se interrumpió durante la recolección de páginas; no se cambió configuración persistente. QA sintética Chrome: 1280×575 y 390×844, sin desborde, imágenes rotas, IDs duplicados o errores de consola; botones ⓘ de 44×44 px, Escape y foco de retorno correctos, filtros proveedor/ámbito combinados y ficha pendiente sin enlace ficticio. El navegador integrado se desconectó y su recuperación no permitió capturas; se completó la prueba en Chrome. Fixture y servidor temporales cerrados.

Hallazgo nativo: 264 entradas únicas en la fuente, 244 compatibles y 20 incompatibles con ID/proyecto/propósito del RPC. Su validación conjunta impide afirmar carga completa del origen. Se preservó el fallback revisado y no se repararon filas sin procedencia. No nuevas consultas financieras, datos reales por objeto, grants o cambios de producción. La aceptación alojada del delta y los hallazgos previos de Kross continúan pendientes.
