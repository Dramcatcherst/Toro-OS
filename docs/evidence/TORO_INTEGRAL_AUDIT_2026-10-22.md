# TORO — Evidencia de auditoría integral, 22 de octubre de 2026

**Estado:** anexo de evidencia; no autoriza ejecución, migración, despliegue ni cambios de permisos. **Autoridad:** el [Plan General canónico][plan] conserva la dirección de TORO; este documento es subordinado. **Corte técnico:** `main` en `ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32`, fechado el 22/10/2026 a las 16:12:18 UTC, 10:12:18 de Costa Rica. Los estados siguientes son observaciones del corte, no garantías permanentes.

## 1. Método, alcance y lenguaje de evidencia

Se inventarió el [árbol completo del repositorio][tree]: **668 entradas, 571 archivos, 276 bajo `src/` y 149 bajo `docs/`**, sin truncación reportada. Se recuperó el Plan General completo: **6.209 líneas y 86.824 palabras**. La revisión técnica leyó selectivamente sus secciones y contratos, código, configuración, pruebas y ramas relacionadas. Inventario completo no equivale a auditoría línea por línea de todos los archivos.

Se consultaron GitHub y el estado de despliegues mediante accesos de lectura. Se revisaron arquitectura, identidad, autonomía, MCP, conectores, Control Plane, OpenClaw, proyecciones del Portal, CI y preparación comercial. No se accedió directamente al host OpenClaw ni se ejecutó QA autenticado del Portal en esta subauditoría. No se modificó ningún sistema operativo.

| Categoría | Qué permite afirmar | Qué no acredita |
|---|---|---|
| Código leído | Existe una implementación en el commit citado | Que esté desplegada o activada |
| Contrato documentado | Existe una decisión o requisito | Que el requisito se haya cumplido |
| Estado de servicio consultado | El servicio informó ese estado al corte | Un flujo hotelero completo |
| CI exitosa | Pasó el pipeline configurado | Aceptación operativa integral |
| Inferencia | Una interpretación respaldada y explícita | Una causa demostrada en runtime |

Las fuentes GitHub de este anexo están fijadas al commit cuando describen el corte. Las páginas de PR y documentación de proveedores pueden cambiar. Las lecturas autenticadas se resumen sin identificadores internos, credenciales ni datos de clientes.

## 2. La arquitectura existente permite integrar TORO

[AGENTS][agents], la [Constitución][constitution] y la [Arquitectura][architecture] ya definen un solo producto y cerebro, con identidad canónica, ámbitos de acceso y responsabilidades por fuente. GitHub conserva contratos y código; Supabase, estado estructurado propio; los sistemas especialistas, sus transacciones; Dropbox, originales y evidencia; Airtable mantiene un papel transitorio.

La conclusión técnica es conservar esta arquitectura y comprobarla mediante circuitos completos. Integrar no exige copiar todos los datos a una base física ni reemplazar las aplicaciones existentes. Portal, WhatsApp, ChatGPT y ejecutores deben consultar tareas, identidad, permisos y recibos coherentes. La revisión no encontró justificación suficiente para introducir otra plataforma, backlog, scheduler empresarial o cerebro paralelo.

Sí existe una brecha entre diseño, código integrado, activación y resultado observado. El riesgo principal de comunicación es presentar esos estados como equivalentes. La arquitectura objetivo ya está ampliamente expresada; falta resolver las dependencias y demostrar su funcionamiento.

## 3. Ramas, producción y aceptación representan estados distintos

La consulta de [PR abiertas][prs] encontró **64, con 43 en borrador**. No todas equivalen a trabajo vigente: algunas pueden conservar alternativas, correcciones recuperables o historia. Antes de integrarlas hace falta clasificar alcance, propietario, dependencia, sustitución y prueba pendiente. Fusionarlas indiscriminadamente puede reincorporar decisiones antiguas.

La producción más reciente observada estaba `READY`, creada el 20/10/2026 a las 17:39 de Costa Rica, con commit `349d15fb93061cba6a285fa3977f03e4d6b6b449`. La [comparación con el corte de `main`][production-compare] mostró **161 commits de diferencia, incluidos merges**. Esta cifra no significa 161 funcionalidades ni demuestra una avería productiva. Impide atribuir automáticamente a producción todas las correcciones presentes en `main`.

El [archivo de despliegue][vercel-config] desactiva el despliegue Git automático de `main`; es una frontera configurada. La lectura autenticada confirmó un proyecto existente con destino productivo. El [contrato Vercel][vercel-contract], fechado anteriormente, todavía describe crear o reconectar ese proyecto: corresponde reconciliar su estado documental, no inferir que se necesita otro alojamiento.

La [PR #347][pr347] tenía preview `READY`, seguía abierta y en borrador, y declaraba QA autenticado pendiente. Preview, CI y aceptación visual no prueban una release productiva completa. Un registro de release debe relacionar commit, esquema aplicado, capacidades activadas, despliegue, pruebas de roles, recibos y reversión.

Como muestra de divergencia, #347 estaba a cero commits detrás de `main`; #280, a 195; #206, a 368; y #192, a 377. Son medidas del corte, no prioridades automáticas. Deben recuperarse cambios útiles contra contratos actuales, preservando la procedencia.

## 4. Una etiqueta de verificación se infiere sin evidencia individual

En [canonical-projection.ts][projection], la proyección de un proyecto utiliza:

```ts
verification: project.needsRevalidation ? "unverified" : "verified"
```

La ausencia de una necesidad de revalidación no acredita por sí misma evidencia individual del proyecto. La [corrección candidata de #280][projection-candidate] conserva `unverified` cuando esa lectura acotada no dispone de evidencia. Es un hallazgo verificable en código; no se ha demostrado aquí su incidencia en una sesión productiva concreta.

La corrección requiere un delta pequeño revisado contra `main`, sin incorporar toda una rama antigua. El criterio de aceptación debe separar registro válido, dato vigente, acción ejecutada y resultado aceptado. Ninguna etiqueta visual debe ampliar permisos ni sustituir un recibo verificable.

## 5. Los vocabularios de autonomía necesitan una reconciliación explícita

El [contrato de autonomía][autonomy] define A0–A6 como autonomía de workflow y coincide con el contexto y referencias recientes del Plan General. Sin embargo, coexisten etiquetas numéricas con semánticas diferentes:

| Vocabulario | Significado y alcance observado |
|---|---|
| Workflow A0–A6 | Observar, explicar, recomendar, preparar, ejecutar con aprobación, autonomía acotada, bucle cerrado |
| Bloque PUMBA A0–A4 | A1 preparar; A2 escritura interna reversible; A3 efecto externo gobernado; A4 crítico prohibido por defecto |
| Skills hoteleras A0–A4 | Lectura, recomendación, borrador, ejecución controlada, aprobación crítica |
| TORO Tools L0–L5 | Metadatos heredados reconocidos por el contrato de autonomía |
| Control Plane L0–L4 | Autoridad de ejecución tipada, separada del riesgo |

El [contrato de ejecución][execution] y la [migración semántica existente][migration] deben formar parte de la reconciliación. No existe conversión segura por coincidencia numérica. Conviene calificar cada etiqueta por su vocabulario y documentar la precedencia vigente, preservando las restricciones semánticas hasta resolver cada acción.

Esta aclaración documental no modifica grants, políticas ni autorizaciones. La colisión podría contribuir a bloqueos o confirmaciones repetidas; esa relación es una hipótesis, no una causa demostrada.

## 6. Conectores, OpenClaw y salud del sistema

El [contexto canónico][context] mantiene OpenClaw como `configured_unverified` y exige evidencia independiente. El puente `/api/brain/openclaw` no estaba en el árbol de `main` del corte; su implementación candidata se encontraba en [#206][pr206]. La persistencia y replay de comunicaciones tienen trabajo candidato en [#210][pr210]. La existencia de estas ramas no demuestra su activación.

La documentación oficial de [operación remota][oc-remote] permite un Gateway persistente, con acceso privado. La de [WhatsApp][oc-whatsapp] describe WhatsApp Web/Baileys y distingue respuesta generada de entrega del transporte. El [modelo de confianza][oc-trust] delimita un Gateway como un dominio de confianza: perfiles y prompts no acreditan aislamiento entre actores mutuamente no confiables. La [migración][oc-migration] requiere tratar el estado persistente y las sesiones con cuidado; restaurar un respaldo no autoriza reenviar acciones antiguas.

Queda pendiente demostrar identidad → lectura autorizada → tarea durable → recibo → respuesta entregada, junto con reconexión y recuperación. Una prueba de continuidad debe distinguir independencia del ordenador personal de dependencia de la red o del host elegido.

También debe distinguirse un conector disponible en ChatGPT, un adaptador implementado, una credencial configurada en TORO y una capacidad probada en producción. Los [adaptadores de lectura][connectors] dependen de configuración y flags; su presencia no prueba conexión efectiva. El [contrato MCP][mcp] no convierte automáticamente las sesiones de este chat en permisos del runtime.

El [Control Plane][worker] contiene operaciones de claim, renovación, transición y finalización con mecanismos de idempotencia. Sin embargo, [`runtime-health`][health] comprueba configuración y lectura de tablas de ejecuciones y recibos. `ready` no acredita frescura de reservas, entrega de mensajes ni conciliación. La salud debe expresarse por capacidad: identidad, transporte, lectura, vigencia, ejecución autorizada, verificación y recuperación.

## 7. Calidad y seguridad: evidencia positiva con límites concretos

La [CI del commit exacto][ci-run] finalizó satisfactoriamente. `main` figuraba protegida; el detalle de protección no era accesible mediante la integración. La lista vacía de rulesets no permite concluir que no haya protección clásica. Debe verificarse su configuración por una vía autorizada, conforme a la [documentación de GitHub][gh-protection].

La expansión de scripts del [package.json][package] cubría por ruta 109 de 115 archivos de pruebas inventariados. Seis no aparecían en `npm test`: `src/app/page.test.tsx`, `src/features/event-ops/los50s-server.test.ts`, `src/features/menu/portal-projects.test.ts`, `src/lib/server/portal-read-rpc.test.ts`, `tests/portal-narrow-read-sql.test.mjs` y `tests/portal-session-preflight.test.mjs`.

Esto identifica una brecha en el comando habitual, no pruebas fallidas ni ausencia histórica de ejecución manual. Las pruebas especiales requieren dependencias y condiciones explícitas. La solución debe asegurar descubrimiento o inventario y una condición de aceptación para QA especial, sin confundir cantidad de pruebas con resultados de negocio.

La lectura de fuentes no constituye un pentest ni certifica aislamiento productivo. Quedan pendientes pruebas autenticadas y negativas de usuario, organización, revocación, ámbito, reintentos y recuperación sobre la release elegida.

## 8. Condiciones de avance y actualización de la evidencia

El [gate de nuevos negocios][readiness] documenta estado de prueba interna y falta de preparación para empresas externas. Exige al menos **12 workflows representativos de extremo a extremo**, además de aislamiento, recuperación, retorno medido y portabilidad mediante un segundo tenant sintético. Los doce son un requisito: contar documentos, agentes, pruebas unitarias o demos no acredita cumplimiento.

Debe preservarse también la evidencia histórica: el [Plan General][plan], en su checkpoint R2 del 29/09/2026, declara **Gate D PASS: 12/12** y mantiene abiertos otros gates críticos. Esta auditoría no reejecutó ni invalida ese checkpoint. Su catálogo R2 —W09 Kross, W10 seguridad de habitaciones, W12 asistencia/nómina— no coincide numéricamente con el [tablero Product Proof del 23/09][proof-board]. Es necesario mapear ambos catálogos, sus recibos y vigencia sin renumerarlos, inferir equivalencias ni convertir el PASS de Gate D en preparación comercial integral.

| Condición | Evidencia necesaria antes de declararla cumplida |
|---|---|
| Verdad y versión coherentes | Fuente, fecha, commit, esquema y despliegue relacionados |
| Circuito operativo aceptado | Actor autorizado, resultado comprobado y recibo consultable |
| Continuidad | Reinicio, reconexión y restauración probados sin duplicación |
| Autonomía delegada | Política por acción, límites, excepciones y revocación verificadas |
| Preparación externa | Todos los requisitos del gate vigente, con evidencia trazable |

“100 veces mejor” debe tratarse como hipótesis de mejora, no como resultado demostrado ni multiplicador agregado de métricas distintas. Hace falta una línea base por flujo: tiempo humano, errores, excepciones, latencia, coste completo y resultado útil. Los umbrales deben acordarse a partir de esas mediciones.

La siguiente actualización debe conservar este corte como historia y añadir evidencia fechada, sin reemplazar incertidumbre por afirmaciones. El tamaño del Plan General justifica estudiar una consolidación documental con trazabilidad de reglas, decisiones y referencias; no autoriza eliminar contenido sin correspondencia verificable. Los planes de dominio y la guía de evolución permanecen subordinados al mismo Plan General.

Los conteos y estados pueden variar por trabajo concurrente. No se ejecutó la suite local completa ni se verificaron directamente todos los conectores, hosts, datos y permisos productivos. Los hallazgos justifican prioridades de revisión y condiciones de aceptación; no autorizan por sí mismos despliegues, migraciones, ampliación de autoridad o comercialización.

[plan]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/docs/product/TORO_BRAIN_GENERAL_PLAN.md
[tree]: https://github.com/Dramcatcherst/Toro-OS/tree/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32
[prs]: https://github.com/Dramcatcherst/Toro-OS/pulls
[production-compare]: https://github.com/Dramcatcherst/Toro-OS/compare/349d15fb93061cba6a285fa3977f03e4d6b6b449...ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32
[agents]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/AGENTS.md
[constitution]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/docs/product/TORO_BRAIN_CONSTITUTION.md
[architecture]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/docs/product/TORO_BRAIN_MASTER_ARCHITECTURE.md
[vercel-config]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/vercel.json
[vercel-contract]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/docs/product/TORO_VERCEL_CANONICAL_DEPLOYMENT_V1.md
[pr347]: https://github.com/Dramcatcherst/Toro-OS/pull/347
[projection]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/src/features/brain/canonical-projection.ts
[projection-candidate]: https://github.com/Dramcatcherst/Toro-OS/blob/5588a4a079cabdf742bc3aa0c555c08261ec472e/src/features/brain/canonical-projection.ts
[autonomy]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/docs/product/TORO_AUTONOMY_AND_ACTION_MODEL_V1.md
[execution]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/src/lib/control-plane-contracts.ts
[migration]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/data/toro_autonomy_policy_migration_v1.json
[context]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/toro-context.yaml
[pr206]: https://github.com/Dramcatcherst/Toro-OS/pull/206
[pr210]: https://github.com/Dramcatcherst/Toro-OS/pull/210
[oc-remote]: https://docs.openclaw.ai/gateway/remote
[oc-whatsapp]: https://docs.openclaw.ai/channels/whatsapp
[oc-trust]: https://docs.openclaw.ai/gateway/security/trust-model
[oc-migration]: https://docs.openclaw.ai/install/migrating
[connectors]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/src/lib/server/read-only-connectors.ts
[mcp]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/docs/product/TORO_CHATGPT_MCP_CONTRACT_V1.md
[worker]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/src/features/control-plane/worker-runtime.ts
[health]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/src/app/api/system/runtime-health/route.ts
[ci-run]: https://github.com/Dramcatcherst/Toro-OS/actions/runs/39811979931
[gh-protection]: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
[package]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/package.json
[readiness]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/docs/product/NEW_BUSINESS_READINESS_GATE.md
[proof-board]: https://github.com/Dramcatcherst/Toro-OS/blob/ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32/docs/product/TORO_PRODUCT_PROOF_WORKFLOW_BOARD_V1.md

## 9. Auditoría del Portal y reconciliación — 2026-10-24

**Corte:** 24/10/2026, America/Costa_Rica; las relecturas de coordinación realizadas el 25/10 UTC siguen fechadas dentro de este corte local. **Main observado:** [`3fe9fd1ceae14be7fba49e72a71ac84f280e18e3`][main-20261024], commit del 24/10 a las 20:07:51 de Costa Rica. Las secciones 1–8 conservan sus conteos, pruebas y límites del 22/10; este añadido no los convierte en resultados nuevos ni establece otro Plan General.

### Alcance y límites de la comparación

Se compararon el Plan, contratos, código productivo y main, metadatos GitHub/Vercel, inventario autorizado de Sites y accesos públicos relacionados. «Todos los demás» significa las superficies localizadas en esas cuentas y en los enlaces del Plan; no un censo de todas las cuentas o proveedores posibles. La inspección del Portal canónico llegó al inicio de sesión y no dispuso de una sesión autenticada. No se verificaron sus recorridos internos, móvil real, roles/RLS, reservas, cobros o envíos. Las pruebas de otros cortes o fixtures conservan su entorno y SHA.

La propuesta del Portal, el Centro de Reportes y el informe de desempeño localizado exigían acceso ChatGPT. La propuesta recuperada no incluyó su HTML real: no se calificó su diseño interior. DreamTeam mostró ingreso y recuperación propios; compartir identidad con TORO no acredita SSO. La ficha de Rumbo era pública, pero su aplicación de viajes privados exigía acceso OpenAI. Los 50 de Caro, BETORO, RicoSky y la web hotelera tienen audiencias o propósitos específicos; sus vistas públicas o de demostración no autorizan fusionar datos privados ni retirar productos. Los proyectos Vercel y repositorios legacy siguen como referencias hasta comprobar consumidores, paridad y recuperación.

### Evidencia observada y su consecuencia

| Área | Evidencia de este corte | Límite y acción dentro del carril existente |
| --- | --- | --- |
| Dirección solicitada | `https://toro.jpghotel.co/` falló en los intentos de navegador y su consulta como alias devolvió 404 en el equipo Vercel autorizado | Relación sin resolver; no prueba inexistencia global ni autoriza cambiar DNS o crear otro proyecto |
| Entrada canónica | `https://toro.dreamcatcherhotel.com/` redirigió al Portal y exigió cuenta de trabajo; proyecto `toro-pr11-preview` | Corregir la orientación del README; aceptación interior pendiente |
| Versión publicada | Deployment `dpl_55PLSKChYZARB1Vd3A6QiNz9nvxv`, READY/production, fuente `Dramcatcherst/Toro-OS`, SHA `349d15fb93061cba6a285fa3977f03e4d6b6b449` | Comparar el candidato exacto con esta versión y preservar recuperación; un preview no la sustituye |
| Integración y entrega | Main `3fe9fd1` con [CI exitosa][main-ci-20261024]; [`vercel.json`][vercel-config-20261024] mantiene `deploymentEnabled.main=false` | La diferencia main/producción no demuestra fallo de automatización; promoción y aceptación conservan gates propios |
| Lectura informativa Kross | La [política del 24/10][context-20261024] admite fuente de hasta 60 minutos; [menú de main][menu-20261024] aún usa seis horas y `live_required` en los consumidores revisados | Reconciliar por propósito con el candidato PR206. No alterar revalidación comercial ni confundir lector probado con adquisición horaria |
| Owner Attention | La [implementación productiva][attention-production] clasifica por vencimiento con menos estados resueltos que [main][attention-main-20261024] | Riesgo condicionado a lector habilitado y filas afectadas. No se observó una deuda falsa; la UI ya suprime prioridad para el estado exacto `unknown`. Probar saldo/estado antes de aceptar la vista |
| Catálogo | El Plan conserva el cierre documental de 244 fichas, con cinco destinos pendientes y veinte referencias de archivo | Son fichas documentadas, no 244 integraciones activas ni cobertura funcional autenticada |

La marca vigente de **limpieza terminada en Kross** es suficiente para esa dimensión según la decisión del propietario del 24/10; no añadir una confirmación humana duplicada. Inspección, mantenimiento y preparación integral siguen separados. La tolerancia informativa de 60 minutos tampoco convierte una copia parcial en totales completos, un dato desconocido en cero ni una fecha de importación en un nuevo corte de fuente.

### Coordinación de candidatos y evidencia posterior

Las referencias siguientes identifican responsables y unidades ya existentes. Sus estados son lecturas fechadas, sujetos a relectura antes de integrar o publicar; esta tabla no crea una segunda cola.

| Frente existente | Disposición y gate pendiente al corte |
| --- | --- |
| [PR363][pr363-20261024] — auditoría y evolución | Reutilizar esta PR para README, vigencia y referencias; mantener el Plan único, guía subordinada y evidencia histórica |
| [PR206][pr206] — lector/puente OpenClaw | Candidato con política informativa de 60 minutos y pruebas; reconciliar en su rama con main. No acredita adquisición horaria, consumo del host ni publicación |
| [PR210][pr210] — sesiones y recibos | Conservar su contrato de continuidad y replay; esquema, persistencia y aceptación mantienen sus gates específicos |
| [PR384][pr384-20261024] — Portal | Head leído `f178c45274890b3abac0e0b0e21600170840f5f3`, abierto y fuera de borrador; [CI1499][pr384-ci-20261024] completed/success y [preview del mismo SHA][pr384-preview-20261024] READY. La aceptación autenticada y del widget oficial seguían pendientes. La QA sintética anterior pertenece a su SHA original; accesos personales en navegador no son persistencia de servidor ni SSO |
| [PR347][pr347] — diseño previo | Reconciliar decisiones y deltas únicos con PR384; no fusionar en bloque navegación y estilos solapados |
| [PR361][pr361-20261024] — comunicaciones históricas | Conservar fuente y antigüedad del histórico; su política no reemplaza el contrato informativo PMS |
| [PR379][pr379-20261024] — extracción | Preflight de extracción dentro del ejecutor existente; no demuestra ingestión o publicación de datos privados |
| [PR387][pr387-20261024] — host existente | Registra evidencia posterior por SSH en otro carril. Supera el antiguo límite de acceso de aquel turno, pero no prueba por sí sola mensajes entregados, reinicio sin duplicados u operación sin PC |
| [PR80 de la web][web-pr80-20261024] — DC2-022 | El SHA `4f626a1` del checkpoint del 23/10 es histórico. Releer head, CI, aceptación y autorización vigentes en el carril web; esta alineación del Portal no lo absorbe |

La consulta de rulesets devolvió una lista vacía; la de protección de rama devolvió 403 para la integración. Son resultados distintos: no permiten afirmar ausencia de protección. La [CI configurada][ci-config-20261024] ejecuta instalación, pruebas, lint y build sin excluir cambios solo documentales. La validación de una revisión anterior no reemplaza la del head final.

### Prioridad y secuencia de cierre

**No se comprobó un incidente P0** de privacidad, acceso indebido o verdad comercial en funcionamiento. Si aparece evidencia de uno, interrumpe la secuencia. Las brechas comprobadas de dirección/versión y de política/consumidor, junto con el riesgo financiero condicionado, justifican prioridad P1 sin presentar hipótesis como daño observado.

1. Alinear orientación y evidencia en PR363; conservar baselines, historia, decisiones del propietario y permisos vigentes. El YAML no se promueve a un estado runtime nuevo.
2. Reconciliar el lector en PR206, con edad inclusiva de 60 minutos, fecha futura/ausente/invalidada, cobertura parcial y valores desconocidos. El transporte y la adquisición mantienen prueba independiente.
3. Releer el candidato del Portal y su CI/preview exactos; aceptar ingreso, contexto/rol, datos, Owner Attention y widget en el entorno autorizado, con aislamiento y recuperación. Publicar solo cuando los gates del contrato vigente estén cumplidos.
4. Probar una unidad operativa de extremo a extremo sobre los objetos existentes antes de ampliar capacidades. Mantener DreamTeam hasta paridad y recuperación verificadas; preservar las fronteras público/privado y las de productos independientes.

Este añadido registra diagnóstico y coordinación. No cambia datos de operación, grants, Writer, API Kross pagada, scheduler, dominio ni configuración de despliegue; tampoco acredita servicio continuo o beneficio medido.

[main-20261024]: https://github.com/Dramcatcherst/Toro-OS/commit/3fe9fd1ceae14be7fba49e72a71ac84f280e18e3
[main-ci-20261024]: https://github.com/Dramcatcherst/Toro-OS/actions/runs/40153275599
[vercel-config-20261024]: https://github.com/Dramcatcherst/Toro-OS/blob/3fe9fd1ceae14be7fba49e72a71ac84f280e18e3/vercel.json
[context-20261024]: https://github.com/Dramcatcherst/Toro-OS/blob/3fe9fd1ceae14be7fba49e72a71ac84f280e18e3/toro-context.yaml
[menu-20261024]: https://github.com/Dramcatcherst/Toro-OS/blob/3fe9fd1ceae14be7fba49e72a71ac84f280e18e3/src/features/menu/server.ts
[attention-production]: https://github.com/Dramcatcherst/Toro-OS/blob/349d15fb93061cba6a285fa3977f03e4d6b6b449/src/features/attention/owner-attention.ts
[attention-main-20261024]: https://github.com/Dramcatcherst/Toro-OS/blob/3fe9fd1ceae14be7fba49e72a71ac84f280e18e3/src/features/attention/owner-attention.ts
[pr363-20261024]: https://github.com/Dramcatcherst/Toro-OS/pull/363
[pr384-20261024]: https://github.com/Dramcatcherst/Toro-OS/pull/384
[pr384-ci-20261024]: https://github.com/Dramcatcherst/Toro-OS/actions/runs/40165508020
[pr384-preview-20261024]: https://toro-pr11-preview-lkrty2a9x-dreamcatcher-s-projects.vercel.app
[pr361-20261024]: https://github.com/Dramcatcherst/Toro-OS/pull/361
[pr379-20261024]: https://github.com/Dramcatcherst/Toro-OS/pull/379
[pr387-20261024]: https://github.com/Dramcatcherst/Toro-OS/pull/387
[web-pr80-20261024]: https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/80
[ci-config-20261024]: https://github.com/Dramcatcherst/Toro-OS/blob/3fe9fd1ceae14be7fba49e72a71ac84f280e18e3/.github/workflows/ci.yml
