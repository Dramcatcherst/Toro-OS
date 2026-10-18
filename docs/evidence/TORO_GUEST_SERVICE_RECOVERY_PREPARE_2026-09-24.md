# TORO — Guest Service Recovery Prepare-Only Proof — 2026-09-24

**Workflow:** Product Proof #8 — In-stay request / complaint -> service recovery  
**Owners:** TERE + RICO + TORO Comms  
**State after this change:** PREPARED / PREPARE-ONLY  
**Guest sends enabled:** NO  
**Internal task write executed by this contract:** NO

## Rebaseline 2026-10-17 — feedback safety v1

**CHECKPOINT_FEEDBACK_SAFETY_V1_20261017.** El contrato prepare-only fue endurecido sin activar envíos ni escrituras:

- marcadores de enlaces sin resolver y HTTP fallan cerrados;
- consentimiento de contacto y de entrada quedan separados;
- seguridad/electricidad requieren atención humana inmediata y prioridad crítica;
- desayuno separa aspecto del servicio y derecho comercial verificado/desconocido;
- canal de origen y verificación de contexto quedan explícitos, conservando idempotencia.

Verificación del candidato exacto: `npx vitest run src/features/guest/service-recovery.test.ts` → 9/9; `npx tsc --noEmit` → aprobado. Alcance real: código y pruebas en rama; sin despliegue, formulario publicado, huésped contactado, tarea productiva, reparación ni cambio PMS/OTA. Rollback: revertir únicamente los commits del contrato y sus pruebas.

### Segunda unidad sintética — 17/10/2026

**CHECKPOINT_FEEDBACK_BATCH_V2_20261017.** Se añadió preparación acotada de respuestas con varios asuntos sobre el mismo contrato:

- máximo tres incidencias únicas por envío y máximo seis entradas brutas;
- duplicados exactos colapsados con contador explícito;
- replay idéntico conserva las mismas claves idempotentes;
- cada incidencia puede enlazarse al proyecto canónico desde contexto confiable;
- el acuse agregado utiliza el asunto que requiera atención humana inmediata.

Prueba sintética local: 14/14 casos, TypeScript y ESLint aprobados. Estado: código probado en rama; cero escrituras productivas, cero mensajes, cero huéspedes reales y cero cambios Kross/OTA.

### Endurecimiento v3 — 17/10/2026

**CHECKPOINT_FEEDBACK_HARDENING_V3_20261017.** Se reprodujeron y corrigieron cinco fallos adicionales en el mismo contrato y rama:

- los duplicados conservan la urgencia mayor y la fecha límite más temprana;
- la identidad usa serialización estructurada y evita colisiones por contenido con `|`;
- una incidencia `null` falla con respuesta controlada en lugar de lanzar excepción;
- categoría, urgencia, aspecto de desayuno y derecho comercial se validan también en ejecución;
- un marcador codificado, por ejemplo `%5BPRIVATE_FEEDBACK_LINK%5D`, falla cerrado.

Readback local del candidato: 19/19 pruebas focales; suite `npm test`, TypeScript, ESLint, `git diff --check` y `npm run build` aprobados. La PR #331 permanece en borrador hasta comprobar el commit remoto y su CI. El contrato sigue en `externalSend=false` e `internalWriteExecuted=false`; no acredita receptor real, persistencia, despliegue, contacto con huéspedes ni resultado operativo.

### Límites de verdad v4 — 17/10/2026

**CHECKPOINT_FEEDBACK_TRUTH_BOUNDARIES_V4_20261017.** Cinco correcciones adicionales quedaron probadas en el mismo contrato prepare-only:

- fuente omitida se conserva como `unknown`, nunca como reporte de `staff` inventado;
- derecho de desayuno permanece `unknown` hasta que la reserva esté verificada;
- payload raíz nulo de preparación individual falla con error controlado;
- payload raíz nulo de lote falla con error controlado;
- links opcionales de tipo no textual se rechazan en lugar de desaparecer silenciosamente.

Readback local: 24/24 pruebas focales; 54 archivos/586 pruebas del bloque principal de `npm test` y sus suites encadenadas, TypeScript, ESLint, `git diff --check` y build aprobados. Alcance: código, pruebas y documentación en la PR existente; cero envíos, escrituras de operación, cambios PMS/OTA o resultados físicos.

## Reused canonical building blocks

This preparation reuses:
- TORO Comms lifecycle/identity routing;
- existing `guest.issue_handoff` capability;
- canonical `POST /api/brain/internal-work` contract;
- canonical `operations.tasks` as eventual task authority;
- RICO for maintenance routing;
- TORO Operations for operational fulfillment.

No second guest CRM, message store, task engine or service-recovery table is introduced.

## Implemented preparation contract

Code:
- `src/features/guest/service-recovery.ts`

Tests:
- `src/features/guest/service-recovery.test.ts`

Input includes:
- stable source event key;
- service category;
- summary;
- optional location;
- optional detail;
- urgency;
- guest language;
- optional due date.

Output includes two bounded artifacts:

### Internal work
A validated canonical TORO internal-work request:
- maintenance -> `maintenance.task` -> RICO;
- other service issues -> `task.create`;
- deterministic `guest:<sourceEventKey>` idempotency key;
- evidence required;
- operational proof required before completion.

### Guest reply
A brief reply draft in ES/EN/PT:
- acknowledges the issue;
- avoids claiming resolution;
- promises an update only after verified progress;
- remains `draft_only`.

## Safety properties

The contract explicitly reports:
- `externalSend=false`;
- `internalWriteExecuted=false`;
- `workflowState=prepared`.

It does not:
- contact a real guest;
- create a task by itself;
- mark an incident resolved;
- infer room readiness;
- expose payment/reservation data;
- bypass source authority;
- bypass internal-work role/RLS gates.

## Next proof

Before RUNNING:
1. resolve a synthetic/disposable or explicitly authorized guest-service event;
2. verify channel identity/context;
3. call this preparation contract;
4. pass the resulting internal-work request through the existing governed intake;
5. prove one canonical task is created once despite replay;
6. capture operational evidence;
7. verify closure;
8. prepare/send guest follow-up only through an authorized channel path;
9. verify no duplicate shadow task/message exists.

A real guest should not be used merely to prove orchestration plumbing.
