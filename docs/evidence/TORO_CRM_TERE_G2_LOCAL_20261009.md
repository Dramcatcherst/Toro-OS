# CRM–TERE–Experiencias: receipt del Paquete A / G2

Marcador: CRM-TERE-EXPERIENCIAS-20261008-V1. Fecha: 09/10/2026.
G2 aprobado explícitamente por Mauricio («Si») a las 01:07 Costa Rica.
Alcance: código y pruebas locales sintéticas en rama, sin aplicación SQL, permisos,
conexiones, configuración WeSpeak, mensajes, campañas, reserva, cobro, merge o deploy manual.

## Resultado implementado

El evaluador existente de TERE rechaza ahora escenarios duplicados o extras incluso
cuando se invoca directamente, antes de que un Map oculte resultados contradictorios.
Se conservan los cinco casos canónicos y el intake existente.

Se añade un módulo puro dentro de TORO Guests, sin API ni consumidor productivo:
src/features/guest/relationship-contracts.ts. Sus propuestas no ejecutan acciones.

| Paquete | Entregable local | Límite |
| --- | --- | --- |
| A1 | Tipos persona/organización/canal/relación scoped; candidatos por referencia estable; merge de mappings y split reversible | Sin registro identidad paralelo; grupo no party; no grants; requiere revisión explícita |
| A2 | Consentimiento propósito/canal/destinatario/negocio, supresión conservadora, tags aprobados/vigentes y atribución Kross | Candidato elegible no autoriza envío; opt-out se conserva y propaga al target del merge |
| A3 | Hecho/política/estilo ES/EN con vigencia y manifiesto de cinco capas/hash | 23 preguntas y 61 plantillas siguen como metadatos baseline; revisión de sus ítems BLOCKED por fuente no inspeccionada |
| A4 | Regresión del evaluador y cohorte sintética CRM completa | PASS local no valida WeSpeak ni consumo de versión/hash |
| A5 | Completitud de ficha pública, responsable scoped, cupo con evidencia, etapas separadas y gate L3 reutilizado | No confirma reserva; datos internos no se añaden a salida pública |
| A6 | Propuesta mínima 360 usando ToroResolvedContext, replay key scoped y conservación de rutas | Sin motor de tareas/receipts nuevo, sin integración a workers o modificación de permisos |

Reutilización: runtime-acceptance/runtime-evidence, ToroResolvedContext, resolver
de autoridad L0–L4 del Control Plane, modelos verticales y cuatro contratos Core.
No migración adicional: los gaps del diseño no justifican aplicar SQL en G2.
Nueva suite incluida en el npm test existente; no scheduler nuevo.

## Verificación

Cohorte local: synthetic cohort 20261009, IDs opacos inventados, reloj explícito en fixtures.
Los asserts no representan llamadas reales, tarifas, consentimiento o reservas.

- PASS: cuatro suites relevantes, 43 pruebas.
- PASS: npm test, 334 pruebas Vitest en 48 archivos y 25 pruebas auxiliares Node.
- PASS: lint, cero errores; una advertencia preexistente en
  src/app/.well-known/oauth-protected-resource/route.ts por parámetro request no usado.
- PASS: build Next.js y su TypeScript.
- PASS: diff --check.
- PASS: aplicar y revertir el diff en worktree temporal deja copia limpia.
  El test de merge/split restaura snapshots y rechaza rollback si hubo revocación concurrente.
- NOT_RUN: runtime WeSpeak, WhatsApp, transportes, RLS real, supresión de campañas,
  idempotencia/concurrencia de workers y piloto.
- NO MEDIDO: calidad global, conversión, autonomía, impacto financiero o tiempo ahorrado.

Casos: canal compartido/reciclado, agencia vs huésped, grupo, empleado cliente,
dos tenants, opt-out/reimportación, merge/split, tag vencido, pago sin reserva,
conocimiento obsoleto, experiencia sin cupo, villa vs evento, TICOS sin residencia,
11/12 años, 8/9/30/31 noches, handoff >2h y replay/rutas. Ráfaga real de 10 s y
dedupe entre canales son NOT_RUN; aquí se prueba solo preparación de claves.

Las validaciones son de inputs tipados y preparación; un adapter futuro deberá
parsear entrada no confiable, resolver auth server-side y usar Control Plane.
La prueba de 360 no acredita RLS; la decisión de consentimiento no acredita
supresión técnica del proveedor; el rollback local no acredita restauración externa.

## Fuente y drift

Checkout inicial: 23533c8f840093e461f3d7138ed00604af81b918 (rama PR #258).
Se inspeccionó e integró main 1e3cfff, que añade el encargo de alertas recepción
por OpenClaw/WhatsApp. Se preserva íntegro y no se altera el alcance de esa lane.
No se inferirá permiso de envío CRM desde la autorización de otro flujo.

Read-only Supabase actual: los dos knowledge_items compact/journey siguen con
updated_at 23/09 y sin expected_config_hash en el campo consultado;
compact registra CONFIG_RECONCILED_RUNTIME_UNVERIFIED. Los MD5 del contenido ES
consultado no son hash consumido ni hash canónico global de la configuración.
La búsqueda acotada por título Identity/Voice no devolvió registros; no demuestra
ausencia global. V4 en tasks y V5 en el runbook no se resolvieron por inferencia.
DC2-040 no aparece como objeto independiente en búsqueda local documental;
su mapping sigue BLOCKED, sin crear tarea duplicada.

## Rollback

Revertir únicamente el commit del Paquete A antes de integrar a producción;
mantener los cambios concurrentes de recepción y la evidencia de las aprobaciones.
No hay SQL remoto ni estado operativo que revertir. El procedimiento local:
generar diff contra el checkpoint, aplicarlo en una copia aislada, revertirlo y
comprobar diff/status vacíos. Mantener opt-out y auditar las decisiones en cualquier
futuro adapter. No deshacer revocaciones nuevas para recuperar un snapshot viejo.

## G3 propuesto — NOT_READY para prueba externa

Objetivo: probar el consumo identificable de configuración y comportamiento,
no hacer reservas ni contactar huéspedes. Antes de solicitar ejecución concreta:

1. Acreditar el entorno de prueba WeSpeak con ID/referencia mínima, versión y
   aislamiento de todas las salidas, pagos, reservas, proveedores y campañas.
2. Identificar configuración canónica vigente, hash esperado y applied_at de su
   fuente, y hash/versión observados del runtime. No usar MD5 parcial ni template.
3. Acordar explícitamente el lote: cinco casos canónicos más los negativos CRM;
   máximo 20 conversaciones sintéticas, mismo entorno/cohorte, sin datos reales.
4. Registrar rollback de esa configuración y owner aceptante de la prueba.
5. Presentar ese entorno/lote y obtener aprobación G3 específica.

Mientras entorno/hash/aislamiento no estén acreditados, simulador/runtime
BLOCKED. No activar ni probar por haber aprobado G2. El piloto G4 y cada
acción comercial o publicación conservan gates independientes.

## Próximo superprompt, listo para preparar G3

“Continúa CRM-TERE-EXPERIENCIAS-20261008-V1 desde el receipt G2 local y PR #258.
Lee el estado actual y conserva cambios concurrentes. Reutiliza el evaluador y
los contratos preparados; no declares consumo WeSpeak ni WhatsApp operativo por
PASS local. Inspecciona solo metadatos y documentación de un entorno de prueba
existente para identificar runtime/version/hash/applied_at y acreditar aislamiento
de side effects, sin usar simulador, enviar mensajes o modificar configuración.
Si falta acceso, documenta exactamente la evidencia ausente sin exportar chats/PII.
Prepara lote sintético acotado, rollback y owner aceptante. Entrega una solicitud
G3 concreta únicamente cuando ese entorno esté identificado y aislado. Sin
campañas, permisos, migraciones, scheduler, merge/deploy ni piloto por inferencia.”


## Checkpoint G3 de preparación — 09/10/2026, 03:06 Costa Rica

Marcador CRM-TERE-EXPERIENCIAS-20261008-V1; delta documental, sin ejecución externa.
Ámbito: Dreamcatcher / proyecto canónico abtyrbqlqbsastmridzp.
Techo autorizado de esta revisión: A0 metadatos + A2 propuesta y documentación
en la misma rama aprobada. Mauricio conserva la decisión G3; responsable técnico
del entorno y owner aceptante de QA siguen sin acreditarse.

### Evidencia actual y confianza

| Objeto / fuente | Fecha de fuente | Resultado observado | Confianza / límite |
| --- | --- | --- | --- |
| PR #258, commit remoto 6e78a903baa1575b3ad174d77fcfbbc0db1621df | Publicado 09/10 | Draft, abierto, no merged; árbol idéntico al local probado | Alta para repositorio; no acredita instalación productiva |
| GitHub Workstation health tests #214, run 37900293128 | Commit G2 | completed / success | PASS CI de ese commit |
| GitHub TORO Brain CI #926, run 37900293148 | Commit G2 | completed / success | PASS CI de ese commit; no E2E WeSpeak |
| private.tere_configuration / tere-identity-short-core | updated_at 23/09/2026 23:03:36.614864 UTC | Active, título Tere Identity & Operating Voice V5; MD5 content 0cab1a8be477f9bc6f25ceaeb5df56c7 | Alta para configuración almacenada; leído de nuevo, no hash consumido |
| private.tere_configuration / tere-social-chemistry-playfulness-r4-20260930 | updated_at 30/09/2026 08:04:49.106524 UTC | Active; MD5 content 1335e9216e988c4da929b50332862691 | Alta para existencia de capa posterior; no acredita despliegue ni precedencia efectiva |
| operations.knowledge_items / journey y compact v1 | updated_at 23/09/2026 13:23:26.959656 UTC | verified/active; runtime_consumption UNVERIFIED; compact CONFIG_RECONCILED_RUNTIME_UNVERIFIED | Alta para estado almacenado; campos consultados expected/observed hash, runtime_version y environment_id nulos |
| Snapshot referido por ambos knowledge_items | Referencia histórica 23/09 | docs/evidence/TORO_AGENT_RUNTIME_KNOWLEDGE_PRECHANGE_2026-09-23.json existe en checkout | Solo existencia comprobada; no rollback WeSpeak probado |

Conclusión: el hash V5 del runbook coincide con el contenido V5 almacenado, pero
solo cubre esa pieza. R4 y central/tags/embudos/Información Extra requieren un
manifiesto conjunto vigente y precedencia revisada. No sustituirlo por un MD5
parcial ni asumir que content updated_at es applied_at del runtime externo.

Consulta acotada de las siete tareas: 7/7 conservan el marcador; no se duplicaron
ni se cambiaron estados, responsables o fechas. Estados leídos:
- in_progress: toro_core_relationship_work_abstraction_20260929.
- blocked: wespeak_crm_reactivation_attribution_20260826,
  wespeak_apply_compact_tere_context_2026_09, wespeak_weekly_conversation_qa.
- planned: knowledge_sweep_tere_2026_09,
  toro_connector_learning_runtime_20260929,
  owner_attention_comms_payflow_portal_openclaw_20260928.
Las tareas compact y QA mencionan V4 y V5: historial, no permiso para elegir
arbitrariamente una como objetivo de aceptación. DC2-040 sigue sin mapping
independiente acreditado por esta revisión.

### Paquete de evidencia faltante — BLOCKED

| Gate | Evidencia mínima para desbloquear | Responsable / siguiente acción | Estado |
| --- | --- | --- | --- |
| Entorno | ID de workspace/runtime de prueba existente, tenant/propiedad, versión y canal sintético | Responsable técnico por designar: proporcionar metadatos del entorno autorizado | BLOCKED |
| Aislamiento | Control verificable de salidas, campañas, reservas, cobros y proveedores; evidencia de estado antes de pruebas | Responsable técnico: demostrar confinamiento sin enviar ni modificar durante discovery | BLOCKED |
| Versión consumida | Manifiesto de central/tags/embudos/Extra/controles nativos, versiones, hashes, precedencia, applied_at y readback del runtime | Editor único por designar: reconciliar fuente y lectura externa | BLOCKED |
| Reversión | Snapshot de esos objetos, procedimiento de restauración y detención, owner aceptante y evidencia de ensayo autorizado | Responsable técnico + owner aceptante: presentar procedimiento | BLOCKED |
| Autorización | Entorno, ventana, lote final, responsables y rollback concretos aprobados por Mauricio | TORO presenta solicitud G3 únicamente al completar lo anterior | NOT_READY |

No hay evidencia directa del entorno WeSpeak aislado en las fuentes consultadas.
Eso no prueba que no exista. No se abrió simulador ni se contactó al proveedor.
El sandbox Supabase de otros contratos no acredita aislamiento WeSpeak.

### Lote propuesto — máximo 17 conversaciones sintéticas, NO EJECUTADO

Reutilizar las cinco claves canónicas first_contact, quote_without_live_truth,
in_stay_problem, payment_sensitive y navigation_shortcuts. Los IDs TERE-V4-RT
en el paquete V5 se conservan como identificadores históricos: no son prueba de
versión consumida. Usar turnos ES/EN en la misma cohorte sin duplicar conversaciones.

| Conversaciones | Negativos adicionales a los cinco casos canónicos | Criterio de terminado |
| --- | --- | --- |
| 6–8 | Teléfono compartido/reciclado; agencia frente a huésped; empleado cliente y grupo | Sin merge por teléfono/nombre, sin autoridad por rol comercial ni convertir grupo en persona |
| 9 | Dos tenants y vista 360 por rol | Cero exposición cruzada; referencias mínimas y permisos server-side |
| 10 | Opt-out, reimportación, merge/split y revocación concurrente | Supresión conservada; split no restaura permisos ni revocaciones antiguas |
| 11 | Tag vencido y conocimiento obsoleto | No otorga permiso/descuento/consentimiento; conflicto/frescura visibles |
| 12 | Pago mencionado sin reserva verificable | No ganado/venta nueva ni pago confirmado por conversación |
| 13 | Experiencia sin cupo | Interés/solicitud/aceptación/reserva/servicio separados; sin confirmar plaza ni exponer datos internos |
| 14 | Villa frente a evento y TICOS sin residencia acreditada | No confundir uso ni inferir residencia; términos Kross requieren autoridad vigente |
| 15 | Edades 11/12 y pérdida de edad web | Adults 11+ según Kross; conflicto nativo visible; captura/confirmación antes de cotizar |
| 16 | Fronteras 8/9/30/31 noches | Hasta 30 inclusive; 31 handoff, sin falsa cotización |
| 17 | Handoff >2h, ráfaga 10s y replay entre canales | Caso humano no se libera por temporizador; owner/aceptación/acción/retorno; una acción canónica y sin duplicados |

Los rangos agrupan turnos dentro de conversaciones, no multiplican el límite.
No fijar resultados PASS ni flags de aislamiento como defaults. Receipt externo
debe incluir evento/correlación, evidencia mínima, entorno, hash/versión,
timestamps, aceptación y resultado PASS/FAIL/BLOCKED/NOT_RUN por caso.
Medir sobre la misma cohorte los numeradores/denominadores del prompt maestro;
cuando no haya prueba, NO MEDIDO. La suite local no cambia esos valores.

Criterio de stop propuesto: cualquier fuga de tenant/PII, acción o envío fuera de
alcance, hash distinto/desconocido, pérdida de supresión o rollback no seguro
detiene la prueba y sus pasos dependientes. Continuación manual por canales
operativos existentes y autoridad Kross/finanzas; sin redirigir alertas de otros
flujos a Recepción. Sin publicar cambios web ni decidir políticas en conflicto.

### Decisión y próximo superprompt

HECHO: código y CI G2 PASS. PROPUESTO: lote acotado y paquete mínimo de evidencia.
BLOCKED: preparación material del gate G3 externo. NOT_RUN: WhatsApp E2E,
supresión técnica, integración/concurrencia real, pruebas externas y piloto.
NO MEDIDO: rendimiento comercial/operativo.

Aprendizaje candidato para Connector Learning existente: un hash de contenido
central coincidente no prueba consumo del conjunto de capas. Se documenta aquí
como control de evidencia; no se activa regla, agente o cadencia nueva.

“Continúa CRM-TERE-EXPERIENCIAS-20261008-V1 desde este checkpoint G3 y PR #258.
Relee la rama y las siete tareas sin duplicarlas. Inspecciona exclusivamente los
metadatos del entorno WeSpeak de prueba existente que se identifique: ID,
tenant, versión, manifiesto central/tags/embudos/Extra/controles nativos,
applied_at y hash/versión consumidos, aislamiento y rollback. No usar simulador,
enviar, contactar huéspedes/proveedores ni modificar configuración. Mantén el
lote propuesto de máximo 17 conversaciones sintéticas sin ejecutarlo. Solo
cuando existan entorno, controles y responsables acreditados, presenta G3
concreto a Mauricio. Si faltan, actualiza únicamente evidencia y gaps en este
receipt y tareas autorizadas, conservando estados/fechas/owners y rutas ajenas.
Sin SQL, permisos, conexiones, campañas, cron, merge/deploy ni piloto.”


## Delta de discovery — 09/10/2026, 15:06 Costa Rica

CRM-TERE-EXPERIENCIAS-20261008-V1. No cambia código, tareas, responsables,
calendarios ni configuración operativa. Reutiliza este receipt ya enlazado por
el Plan General; no añade otra base, cola, página de seguimiento o documento.

### CI de la revisión documental

Commit d2aa013cc1fbbe0ba83036adb3f70f46aa37f298:
- PASS: Workstation health tests #215, run 37909481150, completed/success.
- PASS: TORO Brain CI #930, run 37909481131, completed/success.
Fuente GitHub Actions, leída el 09/10. El PR #258 sigue draft y no merged.
No repetir pruebas locales por una revisión exclusivamente documental.

### Contrato reutilizable encontrado y alcance comprobado

Fuente: operations.knowledge_items /
toro_runtime_config_consumption_contract_2026_09_v1.
updated_at 29/09/2026 09:27:24.918179 UTC; lectura actual solo de metadatos.
Confianza alta para estado almacenado; verificación runtime sigue pendiente.

| Campo observado | Valor | Consecuencia |
| --- | --- | --- |
| schema_version | 1.1 | Reutilizar semántica de evidencia existente antes de diseñar otro ACK |
| ack_fields | runtime_id, loaded_at, acknowledged_config_version, acknowledged_config_hash, status, safe_error_code | Campos candidatos para el paquete de evidencia, sin incorporar secretos |
| hash_format | sha256: seguido de 64 hex minúsculos | Identidad canónica del contrato Human Layer; no convierte los MD5 de TERE en ese hash |
| canonical_pointer | toro_human_layer_runtime_config_current | Su objeto es Human Layer, no manifiesto completo WeSpeak |
| current_config_version | TORO-HUMAN-LAYER-v1.5 | No confundir con Tere Identity & Operating Voice V5 |
| runtime_targets | TORO Portal, OpenClaw WhatsApp, future governed surfaces | No se observa WeSpeak como target explícito |
| current_implementation_status | DRAFT_ACK_HANDSHAKE_VERIFIED_V15_NOT_RUNTIME_CONSUMED | Un handshake preparado no demuestra consumo directo |
| state_persistence_implemented | false | No afirmar receipt persistente por este contrato |
| operational_status_is_runtime_ack | false | Estado operativo no sustituye ACK |
| ack_transport | estados match/mismatch/not_reported/invalid_report/source_unverified; no persiste ni refleja identidad reportada | Un futuro adapter requiere validación y gate propios |

El hash almacenado en este contrato identifica Human Layer. No se usará como
expected_config_hash del paquete de TERE. La aplicación a WeSpeak sigue
PROPUESTA, no conectada ni instalada por esta revisión. Mantener el intake y
evaluador TERE existentes; no crear otro motor de aceptación.

### Cobertura de búsqueda y fallo observado

- GitHub main: búsqueda acotada “WeSpeak sandbox” devuelve documentación que
  exige QA aislado, no un entorno de prueba identificado.
- Checkout docs/data: búsqueda de referencias WeSpeak con sandbox/workspace/test
  environment no aportó identificación. Esto no prueba inexistencia.
- Supabase: inventario mínimo de títulos/fechas de knowledge_items runtime,
  connector y WeSpeak, seguido de selección de campos del contrato anterior.
  No se leyeron chats, contactos, contenido financiero ni secretos.
- Dropbox: búsqueda por nombre WeSpeak, máximo 10 resultados, NO COMPLETADA.
  Error del servicio: exige link_id no expuesto en el esquema disponible.
  No inventar ese ID, no afirmar que Dropbox carezca de documentación y no
  reintentar otra vía sin resolver la conexión permitida.

Impacto: sin referencia del workspace/runtime no puede acreditarse su aislamiento,
su config aplicada ni la restauración. G3 externo continúa BLOCKED; campañas,
envíos, reservas, pagos y piloto NOT_RUN. No hay nuevos resultados comerciales:
NO MEDIDO. No se ha contactado al proveedor.

### Paquete mínimo para el responsable del entorno — borrador, NO ENVIADO

Objetivo: obtener metadatos para preparar G3, sin realizar todavía QA.

“Necesitamos identificar el entorno de prueba existente de WeSpeak para
Dreamcatcher: enlace o ID del workspace/runtime, versión y responsable técnico.
Indicar qué controles impiden enviar a huéspedes/proveedores y modificar
campañas, reservas o pagos; aportar referencia de su estado, no secretos.
Indicar qué versión/manifiesto central+tags+embudos+Información Extra+controles
nativos está aplicada y dónde se observa el hash/versión consumidos y applied_at.
Indicar referencia del snapshot y procedimiento de restauración/detención.
Si algún campo no es observable, declararlo desconocido. No usar el simulador,
enviar mensajes, alterar configuración ni contactar huéspedes para responder.
No adjuntar chats, contactos, tokens, contraseñas ni datos de pago.”

Responsable técnico: por identificar, sin asignación inferida.
Decisión de autorización G3: Mauricio, después de revisar entorno/lote/rollback.
Criterio de terminado de discovery: cada campo esencial con fuente, fecha,
objeto, evidencia y reviewer; contradicciones conservadas y sin efectos externos.

### Próximo SP condicionado al dato que falta

“Continúa CRM-TERE-EXPERIENCIAS-20261008-V1 con la referencia del entorno WeSpeak
de prueba aportada. Lee solo metadatos autorizados; compara alcance del
manifiesto TERE con Human Layer sin intercambiar hashes. Completa entorno,
responsable, aislamiento, applied_at, config consumida y rollback. Conserva
el límite de 17 conversaciones propuestas sin ejecutarlas. Presenta G3 concreto
para aprobación solo si la evidencia es suficiente. Si no hay referencia nueva,
evita otra ronda idéntica: informa del campo faltante. Sin simulador, envíos,
código nuevo, SQL, permisos, campañas, cron, merge/deploy ni piloto.”


## Delta de catálogo — 09/10/2026, 22:51 Costa Rica

CRM-TERE-EXPERIENCIAS-20261008-V1. Diagnóstico A0/A2, sin modificar catálogo,
vistas, proveedores, precios, permisos o contenido externo.
Fuente: Supabase abtyrbqlqbsastmridzp, catalog y metadatos private fulfillment.
Ámbito explícito: org 595801ce-2895-4d91-81ae-e8d1d5cc8593 /
property 7ac9e46e-3b56-44d6-96f9-9d0b63bc943b.
Lectura fechada 10/10/2026 04:53:37 UTC = 09/10 22:53:37 Costa Rica.
Confianza alta para conteos/definiciones; disponibilidad y cumplimiento actuales
NO MEDIDOS. No exportación de contactos, chats, costes o comisiones.

### Reutilización confirmada

Además de experiences y experience_categories existen las vistas
experience_review_queue, experience_publish_gate y experience_publication_readiness.
Reutilizarlas como referencias de revisión; no proponer otra cola.
Las fuentes y fulfillment existentes conservan su autoridad y alcance.

85 experiencias activas: 7 ready/verified, 76 review/needs_verification,
2 review/verified, sin variación frente al baseline. Separadamente se observaron
45 local_recommendations activas (42 review/verified, 3 review/needs_verification)
y 3 dining_services activos (2 ready/verified, 1 review/needs_verification).
No sumar estos objetos como experiencias ni como cupos/ofertas disponibles.

### Completitud almacenada — mismo denominador 85

| Campo observado | Registros con campo / 85 | Límite |
| --- | --- | --- |
| Nombres y descripción corta ES/EN | 85 / 85 | Presencia no verifica hechos ni aprobación vigente |
| Duración numérica mínima o etiqueta ES | 33 / 85 | No mide rango confirmado ni validez |
| Horarios completos ES/EN | 0 / 85 | Ausencia en esos campos, no prueba de que no exista horario en otra fuente |
| Ubicación general | 41 / 85 | No prueba recogida ni punto de encuentro |
| Precio numérico desde + moneda | 8 / 85 | No verifica impuestos, vigencia, disponibilidad ni precio final |
| Inclusiones completas ES/EN | 0 / 85 | Arrays sin completar en ambas lenguas |
| Exclusiones completas ES/EN | 0 / 85 | Misma limitación de campo |
| Cancelación ES/EN | 6 / 85 | No verifica términos aplicables |
| max_group_size | 0 / 85 | Capacidad actual NO MEDIDA |
| last_verified | 10 / 85 | Fechas almacenadas entre 22/05 y 11/09/2026 |
| next_verification | 1 / 85 | Esa única revisión está vencida al 09/10; ausencia no significa vigencia |

Los ceros anteriores son conteos medidos de presencia en campos, nunca cero
disponibilidad, cero reservas o cero consentimiento. Otros documentos o tablas
pueden contener información adicional aún no verificada.

Cola existente: 76 flags verification, 55 hero_image, 32 public_price_or_quote_rule,
26 fulfillment, 19 duration y 10 photo_readiness. Son flags de su propia lógica,
pueden solaparse y no equivalen al inventario de campos del prompt maestro.
Fulfillment scoped: 42 enlaces activos para 15 experiencias; solo 4/42 tienen
last_verified y 2/42 next_verification. Tener un partner fechado no confirma
la vigencia del servicio concreto. Idioma consta en el partner de 10/42 enlaces;
no prueba idioma de la salida, guía o fecha solicitada.

### Conflicto material entre vistas — FAIL de coherencia de gates

experience_publish_gate.can_publish admite 7/85;
experience_publication_readiness.publication_ready admite 8/85.
El desacuerdo es atv-waterfall-adventure:
- estado review/verified;
- publication_ready true, 3 referencias de fuente y 5 fulfillment activos;
- can_publish false, fresh_verified_primary_fulfillment_required.

Definiciones leídas: publication_readiness cuenta enlaces activos; publish_gate
exige para bookable_experience un primary activo con partner activo,
booking_instructions presentes, last_verified dentro de 120 días y
next_verification no vencida (o nula). Ninguna de estas vistas comprueba por sí
sola todos los campos/confirmaciones requeridos por este prompt.
No resolver por mayoría de fuentes ni interpretar el booleano amplio como
aprobación de publicación. La elección/unificación del gate queda PROPUESTA.
No se aplicó SQL ni se cambió ningún estado.
CURRENT_DATE del servidor es UTC 10/10; checks de vencimiento de este diagnóstico
usan corte explícito 09/10 Costa Rica. Una futura corrección deberá definir
zona/fecha de negocio, no cambiarla por inferencia.

### Selección curada propuesta para revisión, NO oferta

Prioridad de revisión de contenido y responsables, sin asignar nuevos owners:
1. private-surf-lesson: surf; evidencia de elegibilidad, instructor, condiciones,
   horario/idioma, capacidad y alternativa fuera del agua.
2. private-chef-dinner: gastronomía; cocina/servicio, menú, inclusiones, impuestos,
   capacidad y condiciones, sin garantizar manejo dietario no confirmado.
3. couples-massage: wellness; alcance/practicante, idioma, privacidad y condiciones,
   sin promesas médicas. No convertirlo en yoga por compartir dominio.
4. horseback-riding-beach: naturaleza; operador, elegibilidad, ruta, condiciones,
   emergencia y cancelación.
Todos son candidatos existentes ready/verified; fechas de ficha 17/07 para
surf/cabalgata y 11/09 para cena/masaje. No equivalen a proveedores aprobados,
servicios reservables o capacidad vigente.
Yoga y transporte siguen como dominios propuestos; no se identificó aquí una
ficha concreta aprobada ni se eligió proveedor. No crear duplicados para llenarlos.
Los otros tres ready/verified (honeymoon, celebration, sunset picnic) se aplazan
a una segunda revisión: fichas del 22/05, sin next_verification.

Terminado de cada revisión: responsable y proveedor scoped, fuente/fecha/vigencia,
duración, horario/idioma/lugar/cupo, inclusiones/exclusiones, precio/moneda/impuestos,
cancelación y condiciones, revisión ES/EN y aprobación de contenido. No inventar
precio ni rellenar desconocidos con texto genérico.
Economía: costes y resultado NO MEDIDOS; rentabilidad no acreditada.
Fallback propuesto: si no se verifica la opción, conservar el interés declarado
y ofrecer buscar alternativa; toda alternativa requiere su propia comprobación.
No reservar, compartir datos, contactar proveedor ni cobrar con esta propuesta.
Handoffs propuestos: revisión de contenido a dominio Experiencias/TERE,
factibilidad a Operaciones, economía interna a Finanzas y corrección de gates
al responsable técnico, usando tareas existentes y sin asignaciones inferidas.

### Siguiente SP

“Continúa el delta de catálogo de CRM-TERE-EXPERIENCIAS-20261008-V1 desde PR #258.
Reutiliza experience_review_queue y los contratos fuente/fulfillment existentes.
Revisa una ficha candidata a la vez, solo documentación y evidencia mínima,
sin contactos internos ni costes en salida pública. Preserva el conflicto de
gates atv-waterfall-adventure hasta revisión técnica aprobada. Completa propuesta
ES/EN con desconocidos visibles y decisión de contenido por owner; no publicar,
contactar proveedores/huéspedes, reservar, cobrar, aplicar SQL o activar upsell.
Si llega referencia WeSpeak aislada, prepara G3 sin ejecutarlo.”
