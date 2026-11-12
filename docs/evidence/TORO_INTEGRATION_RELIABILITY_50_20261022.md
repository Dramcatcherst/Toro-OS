# TORO — 50 mejoras adicionales de fiabilidad

Fecha: 22/10/2026 UTC, 21/10 Costa Rica. Baseline: `2f0396d52f3d28c458972247392c92dd62bb4f13`, PR #358. Rama: `codex/toro-integration-50-20261022`.

Documento subordinado al [Plan General](../product/TORO_BRAIN_GENERAL_PLAN.md). Continúa las [40 mejoras anteriores](TORO_INTEGRATION_RELIABILITY_40_20261021.md) sin volver a contarlas. Scope: TORO Finance, Data, Identity, Tools, Comms, Systems y Human Experience; Dreamcatcher como referencia. No crea otro plan maestro, producto, identidad, Gateway, ledger ni scheduler.

CURRENT: cincuenta cambios de conducta implementados y verificados localmente; integración remota y SHA final registrados en la PR de la rama indicada. Cada fila describe un resultado distinto; sus casos de prueba, documentación y validaciones auxiliares no se cuentan aparte. No se atribuye ahorro, rentabilidad, velocidad productiva o salud de proveedores sin medición real.

## Resultados seleccionados

| # | ID | Frente | Resultado verificable |
|---|---|---|---|
| 1 | F50-01 | Finance | Bloquear tipos de operación desconocidos antes de solicitar aprobación. |
| 2 | F50-02 | Finance | Validar calendario y zona de timestamps de aprobación antes de comprobar vigencia. |
| 3 | F50-03 | Finance | Rechazar replay de un recibo que contradice su supuesta ejecución verificada. |
| 4 | F50-04 | Finance | Registrar reconciliación ante respuestas malformadas después de admisión o POST, con durabilidad explícita. |
| 5 | F50-05 | Finance | Mantener las capacidades de ejecución capturadas durante las esperas asíncronas. |
| 6 | F50-06 | Finance | Hacer efectivo el plazo nativo de 20 s incluso si el cliente o cuerpo no coopera. |
| 7 | F50-07 | Finance | Tratar estados HTTP inválidos como indisponibles o ambiguos, sin certificar éxito. |
| 8 | F50-08 | Finance | Verificar cantidades nativas sin coerción de booleanos, arrays u objetos. |
| 9 | F50-09 | Finance | Preservar el destino independiente de restauración frente a mutaciones del adapter. |
| 10 | F50-10 | Finance | Rechazar bindings de custodia sin identidad, modo o capacidades válidas antes de I/O. |
| 11 | F50-11 | Finance | Separar el plan de importación validado de referencias mutables a entradas. |
| 12 | F50-12 | Finance | Evitar que excepciones externas con prefijos internos filtren detalles a recibos. |
| 13 | K50-01 | Kross | Exigir tiempo válido de observación del proveedor y reloj de evaluación explícito. |
| 14 | K50-02 | Kross | Exigir booleanos literales y claims válidos en las fronteras de autoridad. |
| 15 | K50-03 | Kross | Conservar facturación omitida o malformada como desconocida y bloqueante. |
| 16 | K50-04 | Kross | Impedir que un transporte desconocido eluda sus requisitos de admisión. |
| 17 | K50-05 | Kross | Propagar cadencia de exportación documentada y rechazar frecuencias no finitas. |
| 18 | K50-06 | Kross | Declarar handoff listo solo cuando fechas y huéspedes sobreviven la validación del destino. |
| 19 | K50-07 | Kross | Conservar prefill útil y pedir corrección de salida contradictoria en Booking Assist. |
| 20 | K50-08 | Kross | Impedir que una reserva sin estado sea certificada como verificada. |
| 21 | I50-01 | Identidad/Portal | Ordenar P0 antes de prioridades rutinarias, incluidos los grupos y lotes del catálogo. |
| 22 | I50-02 | Identidad/Portal | Conservar accesos manuales aprobados en el catálogo completo y su búsqueda. |
| 23 | I50-03 | Identidad/Portal | Detectar parámetros sensibles en fragmentos de destinos antes de proyectarlos. |
| 24 | I50-04 | Identidad/Portal | Rechazar controles codificados en destinatarios y cabeceras de enlaces de contacto. |
| 25 | I50-05 | Identidad/Portal | Vincular directorio al actor/organización de la página y revalidarlos después de esperas. |
| 26 | I50-06 | Identidad/Portal | Resolver empleado y posición solo desde una relación válida e inequívoca. |
| 27 | I50-07 | Identidad/Portal | Preservar contexto exclusivamente personal ante fallo del almacén organizacional. |
| 28 | I50-08 | Identidad/Portal | Acotar lectura y cancelación del formulario de selección de contexto. |
| 29 | I50-09 | Identidad/Portal | Retirar contenido privado obsoleto tras logout en otra pestaña o restauración del navegador. |
| 30 | I50-10 | Identidad/Portal | Recuperar navegación manual verificada cuando falla el transporte del directorio. |
| 31 | C50-01 | Comms | Aplicar presupuesto explícito a alertas sin truncar su procedencia. |
| 32 | C50-02 | Comms | Dar precedencia a etiquetas Gmail actuales frente a etiquetas legadas. |
| 33 | C50-03 | Comms | Mostrar conflicto de dominios Gmail de forma determinista y pedir clasificación. |
| 34 | C50-04 | Comms | Ignorar claves heredadas de objetos al resolver etiquetas Gmail. |
| 35 | C50-05 | Comms | Acreditar salud de buzón con sincronización observada válida y fresca. |
| 36 | C50-06 | Comms | Exigir ámbito y membresía organizacional coherentes para acceso a buzones. |
| 37 | C50-07 | Comms | Denegar tareas internas con membresía suspendida, retirada o de otra organización. |
| 38 | C50-08 | Comms | Proteger asuntos financieros en inglés y plural frente a recomendaciones de archivo. |
| 39 | C50-09 | Comms | Rechazar metadata malformada antes de recomendar archivo automático. |
| 40 | C50-10 | Comms | Exigir booleanos y estructura válidos para completar un paquete de evidencia OpenClaw. |
| 41 | R50-01 | Runtime/MCP | Responder configuración MCP indisponible de forma controlada. |
| 42 | R50-02 | Runtime/MCP | Contener excepciones de verificación bearer sin registrarlas como errores crudos. |
| 43 | R50-03 | Runtime/MCP | Acotar red y cuerpo del transporte bearer con controladores independientes. |
| 44 | R50-04 | Runtime/MCP | Mantener rutas privilegiadas de runtime fuera del despliegue Portal. |
| 45 | R50-05 | Runtime/MCP | Limitar probes del Control Plane y devolver salud degradada ante timeout. |
| 46 | R50-06 | Runtime/MCP | Recuperar fallos de preparación del canario sin filtrar errores ni limpiar runs ajenos. |
| 47 | R50-07 | Runtime/MCP | Vincular replay del canario a tarea, acción y metadata del commit configurado. |
| 48 | R50-08 | Runtime/MCP | Comparar rangos de recibos por instante real y fronteras inclusivas. |
| 49 | R50-09 | Runtime/MCP | Validar tamaño de página Airtable antes de consumir una llamada del proveedor. |
| 50 | R50-10 | Runtime/MCP | Leer prioridades desde Owner Attention sin depender de fuentes y layout ajenos. |

## Autoridad, compatibilidad y límites

GitHub conserva contratos/código; Supabase identidad, runtime y auditoría; Kross reservas/estancias; Alegra contabilidad nativa; bancos liquidación; Dropbox originales; Airtable proyección humana transitoria. Los contratos preparados de Writer, proveedor Kross y OpenClaw siguen preparados; un test no los activa ni demuestra salud real.

- Writer OFF. No se cambia el redondeo fiscal ni la identidad histórica v3/v4 de intentos aprobados. Un POST ambiguo requiere reconciliación; un timeout no prueba ausencia de efecto.
- Se conserva el formato histórico de hashes opacos de evidencia hasta definir su contrato versionado y compatibilidad. No se confunde el digest de proyección con el original.
- No se inventa una audiencia OAuth o scope nuevo; su binding exacto sigue dependencia de aceptación MCP. Tampoco se cambia el transporte de membresías canónicas sin verificarlo.
- Cambios de acceso endurecen guards existentes; no crean grants, roles, schemas, tablas ni permisos. La recuperación personal requiere Auth verificado y no concede acceso organizacional.
- Invalidación entre pestañas usa solo señal sin contenido; no almacena identidades, tokens o mensajes ni acredita revocación en otro dispositivo.
- Sin contraseñas reales en artefactos, cambios de proveedores, reservas, tarifas, precios, pagos, asientos, mensajes ni producción. API Kross pagada pausada. No se reconstruye el adapter original de Lightsail por conjetura.

## Compatibilidad de callers y superficies

- Las claves históricas Writer v3/v4 y el payload aprobado se conservan. Un recibo contradictorio no autoriza repetir POST. Si la persistencia falla se comunica incertidumbre; no se promete un recibo durable inexistente. El plazo nativo de 20 s acota la espera y solicita cancelación de red/cuerpo, sin demostrar que un POST no produjo efecto. La custodia comprueba bindings lógicos estables; no demuestra por sí sola independencia física del proveedor.
- El helper de evidencia del proveedor Kross exige `nowIso` confiable; acepta un paquete desconocido para validarlo y conserva `observedAt`. Cadencia de exportación es un claim opcional documentado; no hay TTL nuevo. El handoff puede pedir corrección de niños explícitamente inválidos; omisión conserva el valor por defecto previo.
- `formatAlertDelivery` exige presupuesto UTF-8 de campo/mensaje; `AlertDeliveryContext.messageBudget` lo propaga. Salud/proyección de buzones exige `{nowMs,maxSyncAgeMs}` suministrado por el caller; autorización de lectura histórica permanece independiente. Estos callers preparados deben adaptarse antes de activarse.
- El catálogo completo conserva 244 registros estrictos más los seis accesos manuales cuando se solicitan; conteos distinguen sus fuentes. Contexto de directorio se revalida con la misma sesión tras esperas. Lookup de empleado usa límite 2 para detectar ambigüedad; no cambia la autoridad de membresía. Se corrigieron también el ancho desktop y la altura vacía móvil de sus filtros, conservando controles de 44 px.
- Invalidación local entre pestañas requiere JavaScript y almacenamiento disponible. Un navegador que impide almacenamiento conserva el POST nativo de logout, pero no puede emitir ese aviso a otras pestañas. `pagehide` retira el subárbol antes del cache del navegador y `pageshow.persisted` fuerza nuevo documento; no es revocación remota.
- Transporte de lectura Supabase tiene presupuesto de 8 s por petición, con cuerpo y controlador independiente. Solo el health probe opta al transporte acotado del worker; sus mutaciones existentes conservan semántica. Canary mantiene su key histórica y devuelve409 ante binding inconsistente, sin crear un run alternativo.
- Prioridades usa Owner Attention autorizado sin cargar fuentes/layout Brain ajenos. Conserva contexto, rol, dos flags exactos, filtros de organización, revalidación y cobertura parcial; no promueve evidencias ni inventa métricas. Su contexto opcional ya no incluye una referencia organizacional procedente de la proyección que no se leyó.

## Verificación y reversión

Candidato congelado verificado el 22/10/2026 UTC:

- `npm test` completo PASS; bloque principal 66 archivos/1036 pruebas y Writer 305, además de las suites encadenadas. No se suman ejecuciones repetidas como tests únicos.
- `tsc --noEmit --incremental false` PASS.
- `npm run lint` PASS: cero errores y una advertencia preexistente de `request` sin usar en `.well-known/oauth-protected-resource/route.ts`, fuera del delta.
- Build Next.js con Webpack PASS localmente. Se usa por el symlink local de dependencias entre worktrees; CI conserva su comando estándar de compilación.
- Revisiones independientes de los cinco frentes PASS. Tres contraejemplos financieros (binding mutable con `this`, autoridad ausente en replay y colecciones opcionales malformadas) fueron corregidos y revalidados dentro de sus IDs originales. El orden P0 se comprobó en el DOM agrupado, no solo en el array.
- Chromium dedicado con componentes reales y datos sintéticos a 320/390/1280: dos pestañas, retirada del subárbol antes de navegación, BFCache real observado, salida nativa con almacenamiento bloqueado, búsqueda y prioridad. CSS real y geometría final sin desbordamiento, 44 px de alto y 8 px entre selects móviles. Es un harness aislado con shim de Next Image; no acredita una sesión real ni la página Next publicada.
- La primera integración detectó 13 expectativas antiguas que dependían de cargar Brain para prioridades. Se adaptaron conservando negativas de flags/contexto y usando despliegue demo real como gate; también se probaron fallos propios de Attention y revocación durante espera. No se debilitó Auth/RLS para superar pruebas.
- Nuevas suites MCP incluidas explícitamente en `npm test`; el test de lifecycle privado entra por la suite Auth existente. Hashes de fuentes congeladas contrastados con recibos de autor/revisor; manifest con 50 IDs únicos y números 1–50. Diff check PASS.

La evidencia remota CI/preview, commit integrado y readback de publicación constan en la PR. Reproducciones, RED/GREEN y capturas sintéticas quedan fuera del repositorio. No se certifica login real, custodia en backend, salud del VPS, posteo, reservas o mensajes. Reversión: revert selectivo de la PR; sin cambios de datos que revertir.
