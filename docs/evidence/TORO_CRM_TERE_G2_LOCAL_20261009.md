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
