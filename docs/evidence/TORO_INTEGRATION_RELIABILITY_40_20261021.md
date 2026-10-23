# TORO — 40 mejoras de fiabilidad e integración

Fecha local: 21/10/2026, Costa Rica. Baseline: `de7693eaf114bc7965fd827e42b4416c82853fe9`. Rama: `codex/toro-integration-40-20261021`.

Documento subordinado a [Plan General](../product/TORO_BRAIN_GENERAL_PLAN.md). Ámbito: TORO Finance, Tools, Identity, Comms, Systems y Human Experience, referencia Dreamcatcher. La petición autoriza corregir los flujos existentes; esta unidad no crea otro producto, identidad, ledger, Gateway, scheduler ni backlog.

## Diseño y aceptación

Reforzar la validez de datos y evidencia antes de aprobar, preparar o presentar un resultado. Mantener aislados los ámbitos, acotar dependencias externas, dar recuperación comprensible a las personas y rechazar configuraciones ambiguas. Cada resultado numerado corresponde a conducta del producto; sus pruebas y documentación son evidencia, no mejoras adicionales.

CURRENT: cuarenta cambios implementados y verificados localmente en la rama indicada; integración remota y SHA final registrados en su PR. Gran parte de Kross, writer y OpenClaw son contratos preparados sin caller productivo. El Portal y sus rutas existentes sí tienen superficie conectada. Ninguna prueba sintética acredita autenticación real, salud actual del Gateway, posteo, entrega o lectura de WhatsApp.

Aceptación del lote: regresiones RED → GREEN, suite completa, TypeScript, lint, build, revisión independiente, CI y comparación del árbol integrado. El estado productivo requiere verificación aparte sobre el mismo SHA y sesión autorizada. Rollback: revert selectivo del commit/PR; no hay cambio de datos, permisos o secretos.

## Lista trazable — 40 resultados

| # | ID | Frente | Cambio verificable | Código existente |
|---|---|---|---|---|
| 1 | F01 | Writer | Exigir reloj y ventana de vigencia explícitos para búsquedas de duplicados. | alegra-writer-dedupe |
| 2 | F02 | Writer | Unificar identidad nativa de documento/emisor para idempotencia sin cambiar el payload aprobado. | alegra-writer-contract |
| 3 | F03 | Writer | Vincular readback de la compra al marcador exacto de la ejecución. | alegra-native-purchase-transport |
| 4 | F04 | Writer | Recalcular el hash de la proyección importada y preservar exactitud monetaria. | alegra-evidence-preflight |
| 5 | F05 | Writer | Exigir cobertura completa y una observación inequívoca por fuente de duplicados. | alegra-writer-dedupe |
| 6 | F06 | Writer | Reconocer montos decimales equivalentes en duplicados probables. | alegra-writer-dedupe |
| 7 | F07 | Writer | Aplicar entidad/tipo antes de tratar un hash de evidencia como duplicado exacto. | alegra-writer-dedupe |
| 8 | F08 | Writer | Rechazar calendarios, orden de fechas y períodos incoherentes antes de aprobación. | alegra-writer-contract |
| 9 | F09 | Writer | Bloquear mappings de precio cuya aprobación es futura respecto de la operación. | alegra-evidence-preflight |
| 10 | K01 | Kross | Validar fechas de estancia con calendario exacto y años bisiestos. | normalize-reservation |
| 11 | K02 | Kross | Comprobar reloj y orden fuente → observación → evaluación. | normalize-reservation |
| 12 | K03 | Kross | Aplicar la frescura existente de seis horas a fuente y sincronización. | normalize-reservation |
| 13 | K04 | Kross | Admitir IDs escalares y rutas de propiedades propias sin coerción de objetos. | transport-adapter |
| 14 | K05 | Kross | Conservar errores de calidad del mapper hasta el gate del normalizador. | transport-adapter + normalize-reservation |
| 15 | K06 | Kross | Conciliar conteos de huéspedes y rechazar enteros inseguros. | normalize-reservation |
| 16 | K07 | Kross | Separar identidad del run por organización, propiedad y fila de origen. | dry-run-executor |
| 17 | K08 | Kross | Exigir coherencia entre replay, receipt persistido y reserva almacenada. | dry-run-executor |
| 18 | K09 | Kross | Preservar actualizaciones más nuevas ante entregas desordenadas o conflictivas. | dry-run-executor |
| 19 | K10 | Kross | Validar conteos de aceptación y distinguir cero acreditado de proyección contradictoria. | acceptance |
| 20 | K11 | Kross | Ofrecer enlace oficial accesible cuando una búsqueda válida no abre otra ventana. | booking-assist |
| 21 | A01 | Acceso/Portal | Cerrar la API legada de aprobaciones sin autoridad canónica de actor y scope. | api/approvals |
| 22 | A02 | Acceso/Portal | Acotar login DreamTeam y refresco de extremo a extremo; limitar cada petición del login interno legado, incluido el cuerpo. | dreamteam-login + browser + portal-refresh |
| 23 | A03 | Acceso/Portal | Impedir envíos simultáneos y cambios de credenciales durante login. | login-form |
| 24 | A04 | Acceso/Portal | Cerrar sesión local de forma recuperable aun cuando falla el proveedor. | portal-sign-out + auth/logout |
| 25 | A05 | Acceso/Portal | Dar salida y recuperación seguras ante contexto ausente o ambiguo. | my-toro + portal + brain |
| 26 | A06 | Acceso/Portal | Renderizar un fallo seguro y recuperable ante excepciones de Auth. | context/portal boundaries |
| 27 | A07 | Acceso/Portal | Normalizar destinos next con límite y rutas admitidas sin invalidar credenciales. | safe-next + routing perimeter |
| 28 | A08 | Acceso/Portal | Proteger respuestas autenticadas contra encuadre en sitios externos. | proxy / response headers |
| 29 | O01 | OpenClaw/WhatsApp | Exigir coincidencia explícita de organización y alcance al preparar alertas. | alert-delivery |
| 30 | O02 | OpenClaw/WhatsApp | Exigir probe de salud vigente; un último mensaje no acredita salud. | alert-delivery |
| 31 | O03 | OpenClaw/WhatsApp | Generar dedupe desde tupla canónica de ámbito, destino, fuente y versión. | alert-delivery |
| 32 | O04 | OpenClaw/WhatsApp | Exigir expiración finita de sesiones para el resumen patrimonial privado. | patrimony-owner-summary |
| 33 | O05 | OpenClaw/WhatsApp | Validar metadata y coherencia numérica del envelope patrimonial agregado. | patrimony-owner-summary |
| 34 | O06 | OpenClaw/WhatsApp | Rechazar opcionales malformados y fechas imposibles en intake interno. | internal-work |
| 35 | O07 | OpenClaw/WhatsApp | Incluir el área operativa en la igualdad de replay de una tarea. | internal-work |
| 36 | O08 | OpenClaw/WhatsApp | Diagnosticar contradicciones, limitar el proceso CLI y conservar versión exacta. | openclaw-host-diagnostics |
| 37 | R01 | Configuración | Aplicar un deadline efectivo a lecturas de proveedores, incluida su respuesta. | read-only-connectors |
| 38 | R02 | Configuración | Conservar salud verificable con resultados vacíos y fallos de red/JSON/esquema; alinear configured y evitar caché compartida. | read-only-connectors + connector-health + api/connectors |
| 39 | R03 | Configuración | Bloquear bundle moderno de secretos inválido sin recurrir a autoridad legacy. | worker-config |
| 40 | R04 | Configuración | Compartir validación segura de URL MCP entre configuración y diagnóstico. | mcp/config + runtime/health |

## Límites y dependencias preservados

- Contraseñas, cookies, tokens y claves reales no se leen, imprimen, exportan ni rotan. La revisión usa código y metadatos; fixtures sintéticas en pruebas.
- El cambio de lectura a membresías canónicas requiere comprobar su transporte antes de cutover; roles existentes no se convierten en prueba de membresía vigente por esta unidad.
- Writer OFF hasta recuperar su fuente y binding existentes, verificar principal mínimo/funciones L3 y completar piloto compatible con custodia restaurable. Starlink sigue sin enlace inequívoco; no crear otra compra.
- No se cambia redondeo fiscal, CABYS, precios, reservas, saldos, permisos, tablas, RPC, producción ni destinatarios. No mensajes reales ni nuevo Gateway; WSL conserva su papel de respaldo frío.
- El escáner especializado no expone sus referencias/capacidad en este entorno. La revisión realizada es de fuentes y regresiones; no se declara un reporte de Codex Security ni una auditoría de credenciales reales.

## Compatibilidad y siguiente aceptación

- Writer: el dedupe exige `now` y `maxAgeMs` explícitos. Las preparaciones nuevas emiten claves `alegra:v4`; se validan identidades históricas v3 sin reescribir recibos ni payloads aprobados. Antes de activar el caller hay que reconciliar también variantes históricas de la identidad y los marcadores del proveedor; el cambio de clave no autoriza repetir una operación.
- Kross: las reglas de normalización/replay son contratos preparados. El enlace de búsqueda sí está conectado a Booking Assist; la prueba acredita renderizado y destino, sin modificar reservas ni probar una ventana real del navegador.
- Portal: la API legada de aprobaciones responde 410 sin ejecutar I/O. Login DreamTeam tiene presupuesto completo de 10 s servidor / 15 s cliente y refresh SSR de 3 s. El cliente interno legado limita cada petición de red/cuerpo a 15 s con un controlador nuevo; no es una promesa de tiempo total para cualquier flujo futuro del SDK. La salida local borra las cookies del proyecto canónico y el contexto activo mediante POST del mismo origen; no acredita revocación de otros dispositivos. El acceso real y la recuperación requieren aceptación con una sesión autorizada.
- OpenClaw: el nuevo dedupe de alertas v2 y la evidencia explícita de ámbito/probe requieren adaptar y reconciliar el caller existente antes de activarlo. `collectHostDiagnostics` es asíncrono y su CLI espera el resultado; solo puede terminar el proceso hijo de diagnóstico que creó, nunca el Gateway.
- Configuración: un bundle moderno inválido impide recurrir silenciosamente a la clave legacy. Las lecturas externas tienen cancelación de red y cuerpo; sus mensajes fijos no incluyen excepciones del proveedor. Vacío alcanzable acredita conectividad, no registros de negocio.

## Verificación

Comprobación final del candidato congelado, 22/10/2026 UTC (21/10 Costa Rica):

- `npm test`: PASS, incluida la batería completa encadenada. El bloque principal pasó 63 archivos / 831 pruebas; Writer pasó 243. No se suman ejecuciones repetidas como pruebas únicas.
- `tsc --noEmit --incremental false`: PASS.
- `npm run lint`: PASS, cero errores; conserva una advertencia preexistente de parámetro `request` sin usar en `.well-known/oauth-protected-resource/route.ts`, fuera del delta.
- `next build --webpack`: PASS. Webpack se usa localmente por el symlink de dependencias entre worktrees; el comando estándar de build y CI no se modifica.
- `git diff --check` y manifest con exactamente 40 IDs únicos / números 1–40: PASS.
- Revisión independiente de Writer, Kross, acceso/Portal, OpenClaw y configuración; los contraejemplos encontrados en fechas, precisión/envelope monetario y fence futuro fueron corregidos y revalidados. La revisión final del transporte browser y los gates remotos constan en la PR antes de integrar.

Los nuevos tests entran en `npm test`, directamente o mediante las suites de área existentes. Los registros privados RED/GREEN y pruebas adversariales quedan fuera del repositorio. La evidencia remota de CI/preview y el SHA integrado se conservan en la PR de esta rama; el estado de publicación exige readback independiente. Estas pruebas no usan contraseñas reales ni certifican ingreso de una persona, aislamiento RLS publicado, VPS, posteo o mensajes.
