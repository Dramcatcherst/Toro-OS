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

### Canario de entradas v5 — 17/10/2026

**CHECKPOINT_FEEDBACK_INPUT_CANARY_V5_20261017.** Cinco correcciones adicionales fortalecen la frontera anterior al intake interno:

- codificación URL inválida falla cerrada antes de aceptar el enlace;
- canal de lote omitido se normaliza a `unknown` antes de construir fuente/idempotencia;
- canal de lote no soportado se rechaza una vez antes del fan-out;
- afirmaciones de desayuno no verificadas se deduplican bajo el valor efectivo `unknown`;
- ubicación y detalle no textuales se rechazan, sin pérdida silenciosa.

Readback local: 29/29 pruebas focales; 54 archivos/591 pruebas del bloque principal de `npm test` y sus suites encadenadas, TypeScript, ESLint, `git diff --check` y build aprobados. El intake interno fue leído, pero no invocado: su writer y gate ADMIN/GERENCIA no se cambiaron. Cero tareas, mensajes, huéspedes, reservas o cambios OTA.

### Límites de tipos e identidad v6 — 17/10/2026

**CHECKPOINT_FEEDBACK_TYPE_IDENTITY_V6_20261017.** Cinco correcciones adicionales quedaron aplicadas al mismo contrato prepare-only:

- los placeholders con más de tres capas de codificación se detectan, y una entrada que continúa cambiando tras el límite de seguridad se rechaza;
- desayuno verificado con derecho omitido y con `unknown` explícito comparte la misma identidad operativa;
- consentimiento de contacto, permiso de entrada y verificación de reserva no booleanos se rechazan en vez de convertirse silenciosamente en `false`;
- un `projectKey` no textual se rechaza en vez de perder el vínculo al proyecto;
- una fecha límite no textual se rechaza en vez de desaparecer del trabajo preparado.

Las dos primeras corrigen observaciones de revisión del commit remoto; las otras tres cierran pérdidas de contexto reproducidas sobre la misma frontera de entrada. Readback local: 34/34 pruebas focales; 54 archivos/596 pruebas del bloque principal de `npm test` y sus suites encadenadas, TypeScript, ESLint, `git diff --check` y build aprobados. Continúa `externalSend=false` e `internalWriteExecuted=false`; no se invocó el endpoint, no se activó el writer y no hubo huésped, tarea ni cambio PMS/OTA.

### Idempotencia semántica y enlaces v7 — 17/10/2026

**CHECKPOINT_FEEDBACK_SEMANTIC_IDEMPOTENCY_V7_20261017.** Cinco correcciones adicionales quedaron probadas sobre el contrato prepare-only:

- cada asunto usa un sufijo estable derivado de su identidad normalizada, por lo que invertir el orden del reintento no intercambia tareas;
- insertar un duplicado exacto en el reintento no cambia la clave de los demás asuntos;
- un porcentaje literal codificado (`%25`) permanece válido, mientras codificación malformada, placeholders anidados y exceso de capas continúan fallando cerrados;
- texto Unicode canónicamente equivalente y minúsculas independientes del locale comparten identidad operativa;
- enlaces con usuario o contraseña embebidos se rechazan antes de cualquier ruta de envío.

Las dos primeras cierran el hallazgo P1 de revisión y la tercera el P2 asociado al commit v6. Readback local: 39/39 pruebas focales; 54 archivos/601 pruebas del bloque principal de `npm test` y sus suites encadenadas, TypeScript, ESLint, `git diff --check` y build aprobados. Continúa `externalSend=false` e `internalWriteExecuted=false`; cero endpoint, writer, huésped, tarea productiva o cambio Kross/OTA.

### Replay estricto y consentimiento persistible v8 — 18/10/2026

**CHECKPOINT_FEEDBACK_REPLAY_CONSENT_V8_20261018.** Cinco correcciones de código cierran dos hallazgos nuevos de revisión sin activar el writer:

- el intake solo clasifica como replay una tarea cuyo contenido operativo persistible coincide exactamente;
- un aumento de prioridad con la misma clave queda como conflicto explícito, no como replay silencioso;
- una fecha límite adelantada con la misma clave también queda como conflicto explícito para conciliación humana;
- consentimiento de contacto se conserva como `granted|denied|unknown` y se incluye en la descripción persistible;
- consentimiento de entrada se conserva con los mismos tres estados, separado del contacto; omisión ya no equivale a denegación.

El endpoint mapea el conflicto a HTTP 409. La política escogida es fallar cerrado y exigir conciliación, no crear una segunda tarea ni actualizar una tarea existente sin un contrato transaccional aprobado. Readback local: 50/50 pruebas focales combinadas; 54 archivos/606 pruebas del bloque principal de `npm test` más suites encadenadas, TypeScript, ESLint, `git diff --check` y build aprobados. Sigue sin invocar el endpoint ni ejecutar una escritura, mensaje, contacto con huésped o cambio Kross/OTA.

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
