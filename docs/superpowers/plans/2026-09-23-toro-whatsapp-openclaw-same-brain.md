# TORO WhatsApp / OpenClaw Same-Brain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task after its review. Delegate independent units through the available collaboration tools; each implemented unit receives fresh review before promotion. This document alone does not authorize runtime activation.

**Goal:** Convertir los dos números existentes en entradas fiables al mismo TORO, con acceso amplio del propietario a sus ámbitos autorizados, una primera operación completa de Recepción y continuidad con su computador apagado.

**Architecture:** Reutilizar OpenClaw en el Lightsail existente, el bridge `toro-openclaw-integration`, TORO Identity, los servicios canónicos y el Control Plane. Resolver por solicitud cuenta, persona, ámbito, capacidad, fuente, efecto y política; ejecutar con un único escritor, verificar en destino y devolver el recibo al mismo objeto y conversación. Portal, ChatGPT/MCP y futuros ejecutores IA/Codex consumen esos contratos sin otro Brain, memoria, cola o sistema de permisos.

**Tech Stack:** TypeScript/Node, Next.js 16.3.8, Supabase/Postgres/Auth/RLS, Vitest/Node test runner, GitHub/CI y Vercel existentes; OpenClaw/Node/proveedor instalados pendientes de manifiesto del host; AWS SSM preparado por PR409. OpenAI API/Codex y conectores remotos requieren transporte/autenticación oficialmente soportados y comprobados; no se añade una dependencia ni se elige modelo por este plan.

**Spec:** `docs/product/TORO_WHATSAPP_OPENCLAW_SAME_BRAIN_V1.md`, §§13–14; subordinado al único `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, su contrato de configuración cloud y `toro-context.yaml`.

**Current queue:** 2026-11-25, Asia/Tokyo. **Baseline:** `main@3e9beb4b58582b6415a8ee155a543c7863c78218` (incluye PR409 y PR415). Este bloque sustituye la cola de ejecución de septiembre, conservada íntegra como histórico abajo. Los ocho paquetes siguientes están **NEXT / pendientes de aceptación**, salvo la preparación existente citada; ninguna casilla acredita runtime por estar escrita.

## Global Constraints

- Revisión del plan y conciliación de sus dependencias antes de implementar; cada unidad sigue rama → PR → CI/revisión → preview cuando corresponda → aceptación del entorno → promoción autorizada → verificación. Este cambio es documental.
- Un TORO, identidad/ámbitos y fuentes canónicas comunes; un escritor activo por cuenta/acción. El computador local es desarrollo/contingencia, nunca segundo consumidor productivo.
- Amplitud del dueño incluye todos sus recursos autorizados; no equivale a grants productivos nuevos, lectura cruzada implícita ni credenciales universales. Separar personal, trabajo privado, organización y demás ámbitos durante cada cambio de contexto.
- Clasificar `read`, `search`, `draft` y escritura interna de bajo riesgo según política vigente; ejecutar lo ya autorizado sin reconfirmaciones rutinarias. Transacciones, mensajes/publicaciones, pagos, reservas, permisos, secretos y otros efectos conservan su gate específico. A0–A6 es autonomía por workflow; los L0–L4 del Control Plane son autoridad de ejecución, no una traducción numérica de A-levels.
- Recepción primero; incorporación funcional de terceros después. Desde el primer piloto, denegar desconocidos/revocados y comprobar aislamiento: sesiones o agentes dentro de un Gateway no aíslan herramientas/secretos entre usuarios no confiables.
- Piloto de Recepción: hasta **20 eventos permitidos y un caso**, con reloj operativo `America/Costa_Rica`, UTC para trazas y zona explícita para solicitudes personales. Cuenta compartida sin operador comprobado conserva `operador_no_identificado`; no se infiere un empleado ni ADMIN.
- PMS informativo: antigüedad inclusiva **60 minutos** desde `snapshot_as_of` real; 60 minutos + 1 ms no sirve como estado actual. No renovar edad por importación/respuesta ni llamar LIVE al snapshot. Precios/disponibilidad/transacciones necesitan su revalidación por propósito. Cada otra fuente declara su política de frescura antes de activación; no hereda 60 minutos automáticamente.
- Reusar objetos, binding, journal, aprobación, runs/leases/fencing, receipts, cursores y triggers existentes; no nueva tabla/migración/ingestor/scheduler por defecto. Datos privados, originales, logs e IDs del host quedan en el checkpoint protegido, no en git.
- Una unidad conserva los límites existentes de **12 minutos / 40 llamadas / 2 reintentos seguros**, respetando límites específicos más estrictos; SSM tiene hasta 6 llamadas de 12 s y no redispatch tras incertidumbre. No reintentar efectos ambiguos sin conciliación. Seleccionar límites monetarios, modelos y proveedores desde configuración/decisión autorizadas antes de activarlos; aquí no se inventan importes ni suscripciones.
- Mantener como máximo tres prioridades activas: host/identidad, una lectura/ejecución segura y una operación/reporte de Recepción. Trabajo independiente de fuentes/contratos puede avanzar en paralelo; un bloqueo libera el worker, conserva checkpoint causal y no reinicia inventarios ya cerrados.
- Los plugins/sesiones de ChatGPT no transfieren autenticación al servidor. MCP lector ChatGPT/Codex → TORO es distinto de TORO → API/worker IA/Codex. No controlar chats del sidebar por una API supuesta ni copiar cookies/tokens.
- Mantener Portal autenticado de lectura separado del runtime interno privilegiado. No cambiar el hostname público a `internal`, exponer shell/Gateway ni ampliar RLS para alcanzar una herramienta.
- Aceptar por capacidad/cuenta/recurso con SHA, versión/hash de configuración, fuente/corte/cobertura, actor/ámbito, resultado y receipt; preparado/probado/desplegado/verificado/medido son estados distintos. Una prueba no sensible sigue siendo un envío y usa solamente el destino/acción autorizados.

## Review Focus

1. **Dos cuentas y cambio de ámbito:** una cuenta conectada, un nombre coincidente o una sesión anterior no deben autorizar otra cuenta/persona/organización ni conservar su aprobación pendiente. Prueba propietaria: Task 3.
2. **Frescura y ceros:** snapshot recién importado pero antiguo, corte futuro, conflicto y cobertura parcial no deben producir ocupación/precio actual ni un falso cero. Prueba propietaria: Task 4.
3. **Timeout y replay:** un envío o finalización ambiguos, lease vencido y handler que ignora cancelación no deben repetirse ni convertirse en éxito; delivery, ACK humano y resolución física permanecen separados. Pruebas propietarias: Tasks 5–6.
4. **Permiso compuesto y fuga de secretos:** capability declarada, token OAuth válido o UUID de run no sustituyen permiso vigente, audience/scope, admisión/fencing o límite por recurso; ningún error revela credenciales/historia privada. Pruebas propietarias: Tasks 2–3 y 7.
5. **Dependencia oculta del computador:** un servicio activo, un PR verde o un chat abierto no deben acreditar operación remota; un reinicio/restauración o indisponibilidad IA debe conservar los objetos y permitir una continuación segura. Prueba propietaria: Task 8.

## Reconciliation and execution gates

| Lane existente | Estado observado al corte | Uso en esta cola |
|---|---|---|
| #122 / PR206 | Frontera de identidad/bridge existente; revisar head, esquema vivo y consumo antes de trasplantar | Task 3; no segundo resolver |
| #170 | Lector/capability y fallo histórico `Capability unavailable` | Tasks 1, 3–4; conservar causa concreta, no relajar guard |
| #209 / PR210 | Continuidad durable existente; revisar head, tablas y aceptación antes de integrar | Tasks 3, 5–6, 8; no journal paralelo |
| PR409 | MERGED, head `09c444b401216ddf4f64b5779d51b9d95766786b`, merge `87fd46b296af31a3cf8176fab34c1abad97a7e45`; SSM inactivo, no lectura WhatsApp | Tasks 1–2; reutilizar preparación |
| PR391 / #116 / PR121 | PR391 draft `adb011f914a4911acc51c4bde5b3efdf5950c912`: un run L0/L1 read-only; admisión fenced de PR121 pendiente de conciliación | Task 5; no escritor ni scheduler universal |
| PR291 | Draft `448dbc480149f5e9a211298d906905a4aabb7440`: cierre/contexto dueño/reportes compactos | Task 6; conciliar contenido sin duplicar reportes |
| PR410 | Draft `54f37540db3c429826cfa21f202d7b4332c1cb5d`: contenido/recorrido del huésped | Dependencia de contenido; no copiar su delta ni afirmar que habilita transporte |
| PR362 / PR415 | Extracción contable empresarial propuesta / inventario-compras integrado en main | Task 4 y ampliaciones posteriores; solicitud/captura no es pago/compra |

Antes de reclamar una unidad, refrescar estado/head/propietario de su lane y `main`, localizar task/proyecto/checkpoint canónico y registrar dependencia. No cerrar, fusionar o reactivar estos carriles por aparecer en la tabla. Una unidad bloqueada por contrato/acceso conserva su bloqueo y puede dejar paso a otra elegible.

## Interface decisions for this queue

Son contratos **TARGET de composición**, no endpoints ni tipos desplegados. Usar el equivalente existente descubierto en PR206/PR210/host; si ya existe, conservarlo y actualizar este mapping antes de crear archivos.

- `RuntimeManifestRef`: referencia privada verificada que vincula host, unidad/usuario/perfil, ejecutables/versiones, SHA/worktree/entrypoint del bridge, proveedor/cuentas protegidas, caller, configuración y rollback. El plan guarda referencia/hash/estado, nunca rutas reales, teléfonos o secretos.
- `ChannelWorkRequest`: `{ manifestRef, bindingRef, senderDigest, accountRef, eventRef, requestedScope, capability, effectClass, objectRefs, idempotencyKey, correlationId }`. `effectClass: "read" | "search" | "draft" | "internal_lowrisk" | "external"`; los campos del mensaje son petición, nunca prueba de identidad o autorización.
- `AuthorizedChannelContext`: resultado server-side con usuario/contexto TORO vigente, binding/cuenta/ámbito comprobados, capability y política por efecto. Se invalida/revalida al cambiar ámbito, rol, versión o antes de despachar tras una espera; no almacenar un JWT en journal.
- `SourceReadResult`: `{ state, authority, sourceRef, sourceAsOf, observedAt, coverage, excludedCount, data, receiptRef }`; `state: "READY" | "HISTORICAL" | "PARTIAL" | "DENIED" | "UNAVAILABLE"`. `coverage` es evidencia de cobertura, no una conclusión deducida del número de filas.
- `ChannelWorkResult`: `{ state, canonicalObjectRef, executionRunRef, verificationState, sourceReadRefs, receiptRefs, nextAction }`. Los IDs enlazan objetos actuales; estado y respuesta no contienen credenciales. `deliveryRef`, ACK humano y evidencia de resolución se mantienen como hechos separados en los contratos Comms existentes.

---

### Task 1: Recuperar manifiesto privado del runtime y conciliar las lanes

**Files:** Read `AGENTS.md`, `toro-context.yaml`, `docs/runbooks/TORO_OPENCLAW_RUNTIME_AUDIT.md`, `scripts/openclaw-host-diagnostics.mjs`, `scripts/openclaw-ssm-diagnostics.mjs` y `tests/openclaw-host-diagnostics.test.mjs`; actualizaciones de evidencia solo en el checkpoint protegido existente. No se propone ruta nueva de host.

**Interfaces:** Consumes lanes/checkpoint de la tabla y acceso autorizado existente. Produces `RuntimeManifestRef` verificado o bloqueo preciso por campo; es prerrequisito obligatorio para nombrar/modificar adapters o ejecutar pruebas del host.

- [ ] Leer main/PR206/PR210/PR121/PR391/PR409 actuales y esquema/configuración restringidos; distinguir preparación, aplicación y consumo. Obtener manifiesto del host mediante operador/caller autorizado; no explorar secretos ni instalar otra CLI/Gateway.
- [ ] Verificar host/unidad/usuario/perfil, ejecutables/versiones y entrypoint/worktree/SHA consumido, dos cuentas esperadas, escritor único y estado de acceso. Identificar qué configuración/source hash carga realmente el proceso; guardar solo referencia saneada.
- [ ] Registrar las rutas reales protegidas y el comando exacto de prueba del bridge únicamente en el checkpoint privado del manifiesto, con revisión allí antes del adapter. Los campos **Files** de Tasks 2–3 conservan solo `RuntimeManifestRef`/hash/estado y rutas de repositorio no sensibles; nunca publicar ese mapping en este plan. Si no hay manifiesto completo, detener esas tareas, registrar el dato mínimo faltante y seguir trabajo independiente.
- [ ] Verificar preparación local con `npm run test:openclaw-host`; esperado: suites host+SSM pasan sin AWS/WhatsApp real. Solo en el host correcto, ejecutar el probe existente con Node/CLI y dos aliases del manifiesto; esperado: packet saneado, cobertura por ambas cuentas, timestamp y gates pendientes explícitos. No introducir rutas o aliases ficticios en un comando ejecutable.
- [ ] Revisar manifiesto/evidencia y registrar checkpoint. **Rollback:** ninguno de configuración en esta unidad de lectura; retirar solo el artefacto diagnóstico nuevo si lo hubo, conservar proceso/cuentas/estado.

### Task 2: Conectar el caller protegido de administración SSM

**Files:** Reuse `scripts/openclaw-ssm-diagnostics.mjs`, `data/openclaw_ssm_service_document_v1.json`, `tests/openclaw-ssm-diagnostics.test.mjs`, `src/features/control-plane/worker-runtime.ts`, `src/lib/supabase/worker-config.ts`. **TARGET proposed**, solo si Task 1 confirma ausencia de equivalente: `src/features/openclaw/management-caller.ts` y `src/features/openclaw/management-caller.test.ts`; no endpoint público.

**Interfaces:** Consumes `RuntimeManifestRef`, contexto autorizado y admisión/claim vigente del Control Plane. Produces TARGET `runGovernedHostRead(request: ChannelWorkRequest, dependencies): Promise<ChannelWorkResult>` que llama `runSsmDiagnostics` únicamente tras comprobar actor, capability, host/recurso, task/run/lease/fencing y configuración protegida.

- [ ] Tras revisión del plan/manifiesto, escribir tests `denies_run_id_without_admission`, `denies_wrong_host_role_or_document`, `denies_expired_lease_before_dispatch`, `redacts_provider_error` y `resumes_uncertain_command_without_redispatch`; comprobar cero llamadas AWS en cada denegación.
- [ ] Ejecutar `npm exec --no -- vitest run src/features/openclaw/management-caller.test.ts`; esperado RED por el contrato nuevo ausente, sin AWS real. Implementar composición mínima sobre PR409 y admisión existente; `executionRunId` nunca es autorización.
- [ ] Comprobar enrolamiento SSM del Lightsail existente desde acceso autorizado; si falta, preparar cambio exacto de enrolamiento/rol/documento, costos y reversión para su revisión específica. No aplicar IAM, activar credenciales ni crear infraestructura por este paso documental.
- [ ] Ejecutar la suite anterior y `npm run test:openclaw-host`; esperado GREEN. En entorno y acción autorizados, una lectura saneada y negativa de recurso/acción producen receipts; `service_observed` conserva `whatsapp:not_checked` y no anuncia salud ni mensajes.
- [ ] Revisión independiente y PR de la unidad; aceptación remota conserva SHA/documento/hash. **Rollback:** desactivar solo binding/caller específico, conciliar CommandId/run y revocar solo acceso introducido; no detener Gateway/webhooks ni borrar receipts.

### Task 3: Vincular dos cuentas al actor y ámbito correctos en el bridge existente

**Files:** Reconcile PR206 y PR210; reuse `src/features/profile/channel-binding.ts`, `src/features/profile/channel-binding.test.ts`, `src/features/context/resolver.ts`, `src/features/context/resolver.test.ts`, `src/features/openclaw/channel-ledger.ts`, `src/features/openclaw/channel-ledger.test.ts` y `src/features/context/types.ts`. Bridge/host: únicamente los archivos existentes del manifiesto de Task 1; su ruta y comando de tests deben estar registrados/revisados antes de tocarlo.

**Interfaces:** Consumes `ChannelWorkRequest` y bindings autenticados existentes. Produces TARGET `resolveChannelWorkContext(request: ChannelWorkRequest, dependencies): Promise<AuthorizedChannelContext | ChannelWorkResult>` reutilizando `resolveCanonicalChannelBinding`, el resolver canónico y revocación/membership vigentes; no identidad ni roles inferidos desde texto.

- [ ] Escribir regresiones para `wrong_account_same_sender_denied`, `revoked_binding_denied`, `ambiguous_binding_denied`, `scope_switch_discards_pending_action` y `group_cannot_read_owner_private_context`. Un contexto huésped/equipo no hereda shell/browser/secretos/historia del owner Gateway.
- [ ] Ejecutar `npm exec --no -- vitest run src/features/profile/channel-binding.test.ts src/features/context/resolver.test.ts src/features/openclaw/channel-ledger.test.ts`; esperado RED en integración nueva antes del cambio. Implementar autenticación runtime→TORO y binding individual usando los contratos recuperados; nunca reutilizar credencial founder como usuario compartido.
- [ ] Añadir prueba de ámbito autorizado del dueño hotel/personal/proyecto y denegación del ámbito ajeno. Conservar permiso amplio donde existe; si falta reader para un ámbito, declarar `UNAVAILABLE`, no convertirlo en denegación inventada ni otorgar grants para ocultarlo.
- [ ] Ejecutar las suites anteriores y el comando exacto de pruebas del bridge del manifiesto; esperado GREEN. La falta de manifiesto/comando es gate BLOCKED, no permiso para sustituir mocks por aceptación del host.
- [ ] Probar lectura inocua por ambos números con receipts de actor/ámbito/configuración, más negativas autorizadas; comprobar configuración version/hash consumidos. **Rollback:** retirar solo routing/capability nueva y revocar binding afectado; preservar ambos canales y estado durable existente.

### Task 4: Homologar fuentes y frescura para las consultas del dueño

**Files:** Reuse `src/features/brain/canonical-read.ts`, `src/features/brain/canonical-read.test.ts`, `src/features/comms/mailbox-bindings.ts`, `src/features/comms/mailbox-bindings.test.ts`, `src/features/finance/alegra-canonical-reader.ts`, `src/features/kross/transport-adapter.ts`, `src/features/kross/normalize-reservation.ts` y sus tests. **TARGET proposed**, después de conciliar lector PR206: `src/features/openclaw/source-capabilities.ts` y `src/features/openclaw/source-capabilities.test.ts` como composición, nunca segundo registro de fuentes.

**Interfaces:** Consumes `AuthorizedChannelContext`, capability/recurso, fuente y política de frescura protegida. Produces TARGET `readChannelSource(context: AuthorizedChannelContext, request: ChannelWorkRequest, dependencies): Promise<SourceReadResult>` usando el reader de dominio y evidencia de cobertura; sin SQL libre ni acceso por plugin supuesto.

- [ ] Cerrar denominador de cuentas/bases/recursos elegibles desde registro existente, por familia: Supabase, Airtable, GitHub/Vercel, correo/Calendar/Contacts, Dropbox/Drive/Knowledge, Kross y finanzas. Registrar tipo API/MCP/worker/browser/export/espejo y acciones disponibles; una lista visible no es conexión productiva.
- [ ] Escribir tests `pms_nonlive_59m_allowed`, `pms_nonlive_exact_60m_allowed`, `pms_60m_plus_1ms_historical`, `recent_import_does_not_refresh_old_source`, `future_cutoff_denied`, `partial_empty_is_not_hotel_zero` y `wrong_org_property_denied`. No modificar por conveniencia `current_reservations_safe` ni el normalizador histórico de seis horas: aplicar el contrato informativo §13 en el reader de propósito correspondiente.
- [ ] Ejecutar `npm exec --no -- vitest run src/features/openclaw/source-capabilities.test.ts src/features/kross/normalize-reservation.test.ts src/features/brain/canonical-read.test.ts`; esperado RED para el reader nuevo. Implementar composición mínima; mantener `review`/conflictos/exclusiones, fuente/corte/moneda y valores desconocidos. Fuentes distintas declaran su máximo válido sin reutilizar la ventana PMS.
- [ ] Ejecutar las suites anteriores y las del reader de dominio tocado; esperado GREEN. Por recurso elegible comprobar desde cloud una lectura permitida y una negativa, versión/hash y receipt; mantener cobertura faltante concreta sin bloquear recursos independientes ya aceptados.
- [ ] Revisar/PR y registrar aceptación por recurso. **Rollback:** desactivar capability/binding de lectura nuevo y conservar originales, cursores, permisos y objetos. No reactivar API Kross pagada, Writer, compras o pagos como parte del lector.

### Task 5: Probar un worker cloud de lectura sobre el Control Plane actual

**Files:** Reconcile PR391/#116 y admisión PR121; reuse `src/features/control-plane/worker-runtime.ts`, `src/features/control-plane/worker-runtime.test.ts`, `src/lib/control-plane-contracts.ts`, `src/lib/control-plane-contracts.test.ts`, `src/features/runtime/canary.ts` y `docs/runbooks/TORO_WORKER_CANARY_V1.md`. Los archivos candidatos de PR391 se fijan desde su head reconciliado antes de editar; no crear otro worker.

**Interfaces:** Consumes una task/run exacta preadmitida, handler allowlisted read-only, identidad de worker y prueba fenced post-claim del carril de admisión. Produces `ChannelWorkResult` con readback y receipt durable a través de `claimToroExecutionRunById`, lease/transition y finalización actuales.

- [ ] Reconciliar el contrato de PR391 con main y su backend de admisión; comprobar que PR121 entrega prueba vinculada org/task/run/action/worker/fencing y lease vivo. Mientras falte, preparar fixtures independientes sin reclamar negocio ni llamar providers.
- [ ] Fijar regresiones `missing_admission_no_handler`, `expired_lease_no_dispatch`, `wrong_fence_no_running`, `timeout_ignoring_abort_cannot_finalize`, `ambiguous_completion_requires_reconciliation` y `receipt_readback_required` en los archivos de test del candidato; RED antes de implementación nueva. Preservar zero-external-actions del handler.
- [ ] Ejecutar `npm exec --no -- vitest run src/features/control-plane/worker-runtime.test.ts src/lib/control-plane-contracts.test.ts` y el comando del candidato PR391 registrado tras conciliación; esperado GREEN. No convertir L0/L1 en autorización de escritura interna/external ni el canary en consumidor ilimitado.
- [ ] Una lectura real autorizada de Task 4, con claim dirigido y PC apagado, debe devolver el mismo objeto/recibo y dejar intactos runs ajenos. Conciliar leases vencidos con fuentes/receipts antes de retomar efectos; no cerrar por antigüedad.
- [ ] PR/revisión/aceptación por capacidad. **Rollback:** detener únicamente consumidor nuevo, conciliar su lease/run y conservar cola, recibos, triggers y pausas de escritores previos.

### Task 6: Completar una operación de Recepción y su reporte al dueño

**Files:** Reuse `src/features/actions/internal-work.ts`, `src/features/actions/internal-work-server.ts`, `src/features/actions/internal-work.test.ts`, `src/features/comms/alert-delivery.ts`, `src/features/comms/alert-delivery.test.ts`, `src/features/guest/service-recovery.ts`, `src/features/guest/service-recovery.test.ts` y `src/features/attention/owner-attention-server.ts`; reconcile PR210/PR291. **TARGET proposed**, solo si no existe handler equivalente: `src/features/comms/reception-workflow.ts` y `src/features/comms/reception-workflow.test.ts`.

**Interfaces:** Consumes contexto de Task 3, lectura de Task 4 y evento/objeto existente de Recepción. Produces TARGET `advanceReceptionWork(context: AuthorizedChannelContext, request: ChannelWorkRequest, dependencies): Promise<ChannelWorkResult>`; compone captura→responsable→ACK→avance→evidencia→verificación→consulta. Para escrituras usa admisión/política del efecto correspondiente; PR391 read-only no es su writer.

- [ ] Elegir una solicitud interna ya realizada por el hotel y una task/caso canónico, responsable y destinatario verificados; lote hasta 20 eventos permitidos y un caso. La primera prueba es sintética; piloto real solo en acción/destino autorizados. No nuevo proveedor, venta ni mutación PMS como dependencia.
- [ ] Escribir tests `duplicate_event_one_task`, `assigned_is_not_acknowledged`, `provider_delivery_is_not_human_ack`, `close_without_evidence_denied`, `ambiguous_send_no_retry`, `same_object_visible_after_restart` y `personal_owner_data_hidden_from_team`. RED antes del handler nuevo. Foto/audio/transcripción fallida conserva original/referencia y estado pendiente, no hecho confirmado.
- [ ] Ejecutar `npm exec --no -- vitest run src/features/comms/reception-workflow.test.ts src/features/actions/internal-work.test.ts src/features/comms/alert-delivery.test.ts src/features/guest/service-recovery.test.ts`; implementar solo transiciones que falten en objetos/escritores existentes y repetir hasta GREEN. Intake actual es ADMIN/GERENCIA y crea task; no ampliar grants para asignar/cerrar ni suponer writer de empleados.
- [ ] Demostrar por el canal real captura→objeto único→responsable/ACK→avance→evidencia→verificación→consulta posterior y mismo estado en Portal; textos libres/continuaciones usan foco comprobado. Handoff aceptado no vuelve a preguntar consentimiento en bucle; sin ACK mantiene caso abierto.
- [ ] Entregar una prueba no sensible y una alerta material al dueño verificado por ruta privada autorizada; no usar `prepareAlertDelivery` de grupos como destino DM. Reusar reporte/Page/casos/triggers existentes y formato PR291: máximo 120 palabras al dueño, 100 a grupos cuando estén autorizados, máximo tres asuntos y tres emojis semánticos; fecha/corte, acción/responsable/plazo/enlace. Sin novedad material, sin mensaje.
- [ ] Verificar efectos secundarios de lectura/read receipts/reconexión y `cuenta + conversación + clase de acción → escritor vigente`; takeover humano o WeSpeak/TERE activo suprime el segundo emisor. Una cuenta compartida sin identidad individual no acusa como empleado verificado.
- [ ] Registrar referencias de envío, ACK y resolución por separado, replay sin duplicado y negativa cruzada. **Rollback:** desactivar solo salida/handler nuevo conservando captura, casos, notas/cierres humanos, Page, cursores y receipts; continuar por contingencia autorizada sin anunciar envío falso.

### Task 7: Conectar ejecución IA/Builder cloud sin depender del chat del propietario

**Files:** Reuse `src/features/mcp/server.ts`, `src/features/mcp/auth.ts`, `src/features/mcp/read-adapter-server.ts`, `src/features/mcp/runtime-reliability.test.ts`, `src/app/api/connectors/github-codex/route.ts`, `src/features/actions/internal-work.ts`, `src/lib/server/public-demo.ts` y `docs/product/TORO_OPENAI_SURFACE_MAP_V1.md`. **TARGET proposed**, tras comprobar ausencia de adapter en manifiesto/carriles: `src/features/control-plane/ai-worker-adapter.ts` y `src/features/control-plane/ai-worker-adapter.test.ts`.

**Interfaces:** Consumes task/run preadmitida, contexto/política, executor binding y presupuesto desde configuración protegida. Produces TARGET `runGovernedAiWork(request: ChannelWorkRequest, dependencies): Promise<ChannelWorkResult>` con artefactos y correlación `run_id/correlation_id/trace_id`; el caller asigna solo herramientas que la capability permite.

- [ ] Verificar el transporte oficialmente soportado para TORO→IA/Codex en el entorno disponible y su autenticación/costos: API o worker compatible antes de navegador gobernado. Registrar modelo permitido, techo monetario, timeout, concurrencia y cancelación desde decisión/configuración autorizadas; sin esos datos no activar. `github-codex` actual es `prepare_only`, no inicia Codex.
- [ ] Separar explícitamente el retorno ChatGPT/Codex→TORO por MCP lector de la ejecución TORO→worker. Escribir tests `plugin_session_is_not_worker_credential`, `oauth_wrong_audience_or_scope_denied`, `missing_budget_no_dispatch`, `cancelled_or_expired_run_cannot_publish_receipt`, `provider_outage_preserves_task` y `portal_mode_cannot_enable_worker`; RED antes del adapter nuevo. No presentar un chat/sidebar como API ni copiar sus cookies.
- [ ] Ejecutar `npm exec --no -- vitest run src/features/control-plane/ai-worker-adapter.test.ts src/features/mcp/runtime-reliability.test.ts src/lib/server/public-demo.test.ts`; implementar el adapter mínimo solo si la ruta soportada está comprobada y repetir hasta GREEN. Dejar los seis lectores MCP como lectores; cualquier writer obtiene contrato/nombre/gate propio.
- [ ] Probar desde WhatsApp una tarea técnica inocua aislada: task Builder única→ejecutor cloud→rama/artefacto→tests/PR/preview cuando proceda→receipt→consulta en el hilo correcto. No merge/deploy de producción ni cambio sensible por recibir `builder.task`; una traza explica ejecución, no sustituye verificación del resultado.
- [ ] Revisar/promover solo alcance comprobado. **Rollback:** desactivar executor binding/adapter específico, cancelar o conciliar runs del proveedor y revocar solo credencial propia; conservar task, artefactos y receipts. No afectar connectors ni sesiones humanas.

### Task 8: Aceptar continuidad, recuperación y expansión por capacidad

**Files:** Reuse `src/features/openclaw/runtime-evidence.ts`, `src/features/openclaw/runtime-evidence.test.ts`, `tests/openclaw-host-diagnostics.test.mjs`, `tests/openclaw-ssm-diagnostics.test.mjs`, `docs/runbooks/TORO_OPENCLAW_RUNTIME_AUDIT.md`, `docs/product/TORO_WHATSAPP_OPENCLAW_SAME_BRAIN_V1.md` y este plan; evidencia privada en checkpoint actual, no fixtures con datos de huéspedes.

**Interfaces:** Consumes manifests, bindings/configuración y receipts de Tasks 1–7. Produces paquete de aceptación por capacidad/cuenta/recurso con SHA, pruebas, recuperación y límites; una cobertura parcial no eleva todo OpenClaw a operativo.

- [ ] Añadir regresiones `one_connected_account_cannot_certify_two`, `complete_packet_without_live_receipts_unverified`, `reconnect_retains_correct_scope`, `restore_does_not_replay_effect` y `ai_unavailable_has_safe_continuation`; ejecutar `npm run test:openclaw-host` y `npm exec --no -- vitest run src/features/openclaw/runtime-evidence.test.ts` hasta GREEN. Tests sintéticos no marcan aceptación viva.
- [ ] Verificar respaldo protegido de estado/sesión y binarios pertinentes, restauración aislada, reinicio acotado, una sola instancia emisora y señal de fallo independiente de WhatsApp. No logout/reset de las cuentas ni interrupción de huéspedes para producir evidencia.
- [ ] En ventana propuesta de 24 horas con PC/navegador del dueño apagados, ejecutar lectura y caso/reporte de Recepción autorizados, interrupción controlada y recuperación. Comprobar hilo/objeto, origen, corte, permisos, ACK/receipt y repetición sin duplicados. La ventana es criterio piloto, no SLA ni disponibilidad absoluta.
- [ ] Ejecutar checks requeridos del cambio (`npm test`, `npm run lint`, `npm run build` y preview/CI del SHA exacto cuando apliquen), revisión independiente y readback en entorno final. No ejecutar pruebas remotas/mutaciones por este plan antes de su revisión y autorización de cada efecto.
- [ ] Medir éxito/fallo de trabajos elegibles, duplicados, edad/cobertura de fuente, detección/recuperación e intervenciones del dueño; dinero/tiempo recuperado solo con línea base. Registrar qué está preparado/probado/integrado/desplegado/verificado/medido y el siguiente bloqueo causal.
- [ ] Ampliar capacidades del dueño y después perfiles de terceros por necesidad verificada sin perder amplitud final: hotel hoy/búsqueda/unidad lista/check-in-out, desayuno/servicios/incidencias, cotización/respuesta permitida, comprobantes/cierre, inventario/compras y People/otras fuentes de §14.4. Cada variante reusa Tasks 4/6 con su actor/permiso/receipt, misma fuente y frontera real; no se marca implementada por superar el caso inicial. **Rollback:** retirar solo la capacidad fallida, reconciliar efectos y conservar contingencia local hasta paridad/restauración; no reactivar timers o writers pausados.

## Completion and handoff

Terminado de la primera etapa: dos cuentas identificadas y comprobadas; dueño resuelto en su ámbito autorizado; lectura con fuente/frescura; una operación completa de Recepción; entrega/ACK/resultado distintos; recuperación y replay sin duplicados; ejecución comprobada sin PC. Amplitud total se acepta por recurso/capacidad y conserva faltantes explícitos, sin limitar el objetivo al ejemplo inicial.

La revisión de este plan aprueba dirección y dependencias; no afirma implementación ni sustituye permisos por efecto, mapping protegido del host, admisión, review de cambios IAM, release o pruebas reales. La siguiente unidad es Task 1; Tasks 4/7 pueden preparar contratos y evidencia independiente mientras un acceso está bloqueado, sin activar sus adapters. Mantener los ocho paquetes en este mismo plan y los trabajos canónicos existentes.

---

## Histórico conservado — 23 de septiembre; no es una segunda cola activa

Las casillas, estados, fechas y cobertura siguientes se preservan como evidencia del plan original. No reabrirlas ni ejecutarlas en paralelo por estar pendientes aquí; su continuación se resuelve únicamente mediante la cola vigente de ocho paquetes de arriba y sus lanes reconciliadas.

<details>
<summary>Ver contenido original íntegro de septiembre (histórico, no ejecutar como cola)</summary>

# TORO WhatsApp / OpenClaw Same-Brain Execution Plan

**Date:** 2026-09-23  
**Parent spec:** `docs/product/TORO_WHATSAPP_OPENCLAW_SAME_BRAIN_V1.md`  
**Rule:** extend the canonical TORO project. Do not create another brain, task database, project database, OpenClaw backend or duplicate connector.

## Outcome

Make WhatsApp a governed TORO client with two-way execution and follow-up while preserving one identity, one context model and one canonical state.

## Current verified baseline

- TORO context resolver exists in `main`.
- Authenticated `/my-toro` has role/source-aware reads.
- Canonical projects/tasks exist in Supabase.
- Message-to-task, project portfolio and Builder/Codex capabilities are already cataloged.
- PR #142 is merged and the shared `POST /api/brain/internal-work` execution primitive exists in canonical TORO.
- OpenClaw live consumption remains configured/unverified; direct live host access is still unavailable from this execution environment.
- The historical/local `toro-openclaw-integration` worktree must be reused when recovered. Do not recreate its transport modules in another repository.

## Workstream A — shared execution primitive

- [x] Add a bounded internal-work request contract.
- [x] Add task/project validation and idempotency.
- [x] Add canonical task routing for normal, maintenance, Builder/Codex and project follow-up work.
- [x] Add an authenticated server executor using existing TORO context + Supabase RLS.
- [x] Add `POST /api/brain/internal-work`.
- [x] Add contract tests and register them in the canonical test suite.
- [x] CI green for PR #142.
- [x] PR #142 merged into canonical TORO.
- [ ] Verify one real authenticated test task in a controlled organization context; archive/delete only if test policy permits.

## Workstream B — channel identity and service authentication

- [ ] Define one channel-runtime authentication method for OpenClaw.
- [ ] Add verified hashed channel identity binding -> TORO user/org.
- [ ] Add pairing/revocation UX in TORO Portal.
- [ ] Never authorize from display name alone.
- [ ] Unknown/unpaired senders fail closed or guest-safe.
- [ ] Add tests: owner, employee, unknown, revoked, wrong org, replay.

## Workstream C — OpenClaw adapter

**Must resume in the existing `toro-openclaw-integration` worktree when recovered.**

- [ ] Load/report canonical Human Layer version/hash.
- [ ] Resolve channel sender through TORO identity binding.
- [ ] Call the same TORO read/action contracts used by other surfaces.
- [ ] Map free text + menu/number continuation to canonical capabilities.
- [ ] Preserve external message ID as idempotency key.
- [ ] Persist only transport/session state locally; durable business state stays in TORO.
- [ ] Implement reconnect/replay-safe retry.
- [ ] Add completion/blocker outbound notifications.

## Workstream D — maintenance parity

- [ ] Owner/manager can create maintenance work from WhatsApp.
- [ ] Link room/area/asset when resolvable.
- [ ] Promote from generic task to canonical `maintenance_event` linkage without duplicate work.
- [ ] Assign to authorized person/team.
- [ ] Accept photo/voice evidence.
- [ ] Close only with required evidence/permission.
- [ ] Notify requester when resolved.

## Workstream E — projects

- [ ] Read NOW/BLOCKED project summary.
- [ ] Open project detail.
- [ ] Create canonical follow-up linked to project.
- [ ] Ask for blocker/next action/owner.
- [ ] Update status only through the governed project workflow.
- [ ] “continuar proyecto X” restores safe project focus.

## Workstream F — Builder / Codex

- [ ] “Dale esto a Codex” creates one canonical Builder task.
- [ ] Trusted worker maps Builder task to isolated branch/session.
- [ ] No raw shell exposure from WhatsApp.
- [ ] Builder reports started / blocked / PR / preview / tests / done.
- [ ] Production/deploy/secret/security actions remain approval-gated.
- [ ] Completion evidence returns to the same TORO task and WhatsApp thread.

## Workstream G — continuity and shared mind

- [ ] Same TORO Human Layer/personality version across surfaces.
- [ ] Same business truth/source authority.
- [ ] Same role/capability rules.
- [ ] Same project/task state.
- [ ] Canonical conversation continuation state.
- [ ] No hidden cross-user memory.
- [ ] Personal/work isolation preserved.

## Workstream H — authorized source + mailbox parity

OpenClaw/WhatsApp must consume TORO capabilities through the shared Brain/router. It must not connect directly to raw credentials or create a second connector fabric.

- [ ] Enumerate every authoritative business connector currently available to TORO and classify read/write/approval ceiling.
- [ ] Verify WhatsApp owner identity can request governed reads across authorized Dreamcatcher/Atrapasueños domains: Finance, Operations, Revenue, Guests, People, Projects, Knowledge, Systems and Assets.
- [ ] Route source reads through the same source-authority rules used by Portal/Brain.
- [ ] Return source/freshness/provenance with material answers.
- [ ] Fail closed when a connector is unavailable, stale, outside active scope or not authorized.
- [ ] Never expose raw tokens, passwords, API keys, bank credentials or recovery secrets to the channel model.
- [ ] Preserve Personal / work-private / organization / family isolation even when the owner can access several scopes.

### Email coverage gate

Owner-confirmed business addresses to reconcile:
- `info@atrapasuenos.net`
- `proveedores@atrapasuenos.net`
- `accounting@atrapasuenos.net`
- `admin@dreamcatcherhotel.com`
- `info@dreamcatcherhotel.com`
- `accounting@dreamcatcherhotel.com`

Before claiming email parity:
- [ ] Google Workspace Admin classifies each address as user / alias / group / delegated/shared mailbox / route.
- [ ] Each real mailbox has an authorized read transport.
- [ ] Historical backfill is indexed with mailbox provenance and deduplication.
- [ ] New-mail ingestion uses official Gmail API/history/push where authorized.
- [ ] TORO Comms classifies actionable mail and writes governed follow-ups/tasks instead of duplicating raw mail.
- [ ] OpenClaw/WhatsApp can query cross-mailbox status via TORO Comms without direct mailbox passwords.
- [ ] Sending/reply/forward/delete/routing remain disabled until separately approved and tested.

Current 2026-09-28 evidence:
- ChatGPT Gmail connector covers only `admin@dreamcatcherhotel.com`;
- Supabase governed Gmail metadata index contains 6,128 rows from that mailbox only;
- therefore multi-mailbox coverage is incomplete.

## Workstream I — runtime acceptance

Run the existing OpenClaw audit gates:
- channel probe/capabilities;
- DM/group isolation;
- bindings;
- tool permissions;
- security audit;
- logs/privacy;
- replay/idempotency;
- TORO identity/authority;
- human escalation;
- reconnect/recovery;
- backups.

Then run end-to-end scenarios:
1. create internal task;
2. duplicate retry -> no duplicate;
3. create maintenance task;
4. project status + project follow-up;
5. Builder/Codex queue;
6. unauthorized employee action denied;
7. unknown sender denied/guest-safe;
8. reconnect + continue;
9. completed task -> one notification;
10. cross-domain authorized read -> source/evidence returned;
11. query all bound business mailboxes -> aggregated actionable summary without duplicate messages;
12. forbidden/private scope -> denied without leakage.

## Promotion rule

Do not mark WhatsApp/OpenClaw “full TORO” until the real runtime executes the scenarios above with evidence. Code/spec/CI alone = implementation foundation, not live proof.

</details>
