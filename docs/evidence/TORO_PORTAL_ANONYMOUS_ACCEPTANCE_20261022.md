# TORO — aceptación anónima del Portal Next

Fecha: 22/10/2026, Costa Rica. Evidencia subordinada al [Plan General](../product/TORO_BRAIN_GENERAL_PLAN.md), dentro del mismo carril de integración/aceptación; no suma mejoras al lote de 40 + 50 ni crea otro plan.

## Fuente y entorno

Fuente probada: `ad9ed7656e0ad8c0ec36de7f5a3e5e462cc23e32`, árbol `56c0b182ecdb22b998a6c2dbc628d5db616d4da5`. Se inspeccionó el delta concurrente: PR #360 endurece dry-run Kross; PR #357 documenta routing financiero y sus gates, sin acreditar cambios en proveedores.

Checkout aislado, dependencias propias instaladas con `npm ci --no-audit --no-fund` desde el lockfile, Next 16.3.8 y React 19.2.4. Las dependencias compartidas anteriores tenían Next 16.3.6; sus ensayos preliminares se sustituyeron por esta ejecución con las versiones fijadas. El checkout original y los lotes anteriores se conservaron.

Modo `portal`, flags de lectura Brain/Owner Attention habilitados para probar que una petición anónima sigue denegada; URL pública canónica y clave pública sintética sin acceso a proveedores. Variables limitadas al comando, sin archivos de secretos. Build y servidor usan un preloader privado que bloquea fetch de red fuera de loopback; Chromium dedicado bloquea destinos fuera del origen local. No se enviaron credenciales al login, se crearon usuarios ni se invocaron operaciones nativas. Este artefacto QA no se puede promover a producción.

Se usó Chromium headless dedicado con Playwright sobre la página Next real, CSS, imágenes y rutas reales, sin shim de Next Image ni mocks de componentes. El control Browser asociado a la sesión no expone su herramienta de ejecución; este ensayo no controla ni representa el Chrome autenticado del usuario.

## Resultado

- `npm run build` estándar, Turbopack: PASS.
- `vitest run src/features/kross src/app/api/auth/logout/route.test.ts`: 11 archivos, 182 pruebas PASS. Son pruebas focales; no sustituyen ni se suman al total de las suites de PR #358/#359.
- Lint: cero errores y una advertencia preexistente fuera del delta. Contratos de portfolio: 15 pruebas PASS; contrato patrimonial: 5 pruebas PASS. Diff check PASS.
- `/login?next=/portal` a 320, 390 y 1280 px: título y encabezado correctos; entrada por teclado de usuario a contraseña; mostrar/ocultar contraseña y ayuda de acceso funcionales; destino DreamTeam conservado. Controles de al menos 44×44 px, sin overflow horizontal, pantalla vacía, overlay de error o errores/advertencias de consola. Campos vaciados antes de capturas; ningún submit con credenciales.
- 14 comprobaciones HTTP PASS, resumidas abajo. Todas las GET examinadas conservan `private, no-store`, CSP `frame-ancestors 'none'` y `X-Frame-Options: DENY`.

| Flujo | Resultado observado |
|---|---|
| GET `/portal`, `/my-toro`, `/my-toro/herramientas` | 200 con recuperación anónima; payload y paneles autorizados ausentes. Estas páginas no prometen redirect HTTP para toda petición anónima. |
| GET `/api/brain/context`, `/api/brain/owner-attention` | 401 sin sesión, incluso con flags de lectura habilitados. |
| GET `/api/approvals`, `/api/system/runtime-health`, `/api/mcp`, `/api/connectors/airtable` | 404 por exclusión del perímetro Portal. |
| GET `/brain` | 200 con documento anónimo seguro. |
| POST `/api/auth/login`, objeto vacío | 403 desde origen ajeno; 400 desde el mismo origen, sin petición Auth. |
| POST `/api/auth/logout` | 403 desde origen ajeno; 303 al login desde el mismo origen. Elimina cookie Auth canónica, chunk y selección organizacional sintéticos; conserva cookie ajena. No prueba revocación upstream. |

Para reproducir localmente, servidor y navegador usan `localhost:4187`: NextURL normaliza las IP de loopback a `localhost`; mezclar ese origen con un servidor iniciado como `127.0.0.1` produjo un 403 en el ensayo preliminar. Se corrigió el origen del harness, sin relajar el guard de la aplicación. También se corrigió la expectativa inicial de redirect para páginas que renderizan recuperación anónima por diseño. Ambos resultados preliminares se conservaron en la evidencia privada.

Logs, script, JSON y capturas sintéticas: `/workspace/scratch/portal-acceptance-20261022/`; fuera del repositorio. Archivo principal `results.json`, resultado PASS. No hubo destinos externos solicitados por el navegador ni errores de consola en la ejecución final.

## Estado integrado y límites operativos

- PR [#358](https://github.com/Dramcatcherst/Toro-OS/pull/358): merge `2f0396d52f3d28c458972247392c92dd62bb4f13`, candidato `bdbdef2942cd3d7e9476353c7156438a9c678b7a`, árbol idéntico probado/integrado `f2fd220c2b5f8e3d8c3f58514aafda8f8261894d`. CI [39721265826](https://github.com/Dramcatcherst/Toro-OS/actions/runs/39721265826) y workstation [39721265846](https://github.com/Dramcatcherst/Toro-OS/actions/runs/39721265846) PASS; preview exacto READY.
- PR [#359](https://github.com/Dramcatcherst/Toro-OS/pull/359): merge `b7d97a59dba1c4ee233a6e8b267f90f9c15dbf63`, candidato `b05768a07cd6fc0151f4cda1437c008482e0c604`, árbol idéntico probado/integrado `72bbd79ccde70d929ead1c1f886cf38463a3a429`. CI [39723806528](https://github.com/Dramcatcherst/Toro-OS/actions/runs/39723806528) y workstation [39723806530](https://github.com/Dramcatcherst/Toro-OS/actions/runs/39723806530) PASS; preview exacto READY. Los previews de estos lotes usan el perfil demo existente, sin aceptación autenticada.
- Readback de `toro.dreamcatcherhotel.com`: deployment `dpl_55PLSKChYZARB1Vd3A6QiNz9nvxv`, READY, producción, fuente `349d15fb93061cba6a285fa3977f03e4d6b6b449`. Integración de código no equivale a publicación.
- Metadata de variables Vercel, solicitada sin descifrar: 403 por permisos. CLI Vercel no disponible. No se reintenta igual ni se modifican variables o protección para eludir el rechazo.
- La ejecución continúa cloud, sin identidad AWS/SSH ni control del Chrome del usuario. La captura histórica de Lightsail no acredita acceso actual. Recuperar fuente original y binding del host existente sigue pendiente; no se crea un sustituto.

NEXT: verificar configuración con acceso autorizado; aceptar login positivo, roles, aislamiento y salida con sesión real; verificar transporte de membresías; recuperar fuente/caller/binding de Lightsail, compatibilidad y piloto acotado del Writer. Audiencia OAuth exacta sigue gate de MCP. Writer OFF, API Kross pagada pausada; sin mensajes WhatsApp, reservas, postings, permisos, migraciones o secretos modificados. Contraseñas reales fuera de artefactos. No se acredita conciliación documental, ahorro o rendimiento productivo.

Reversión de este checkpoint: revertir únicamente la documentación de su PR. No contiene cambios de aplicación, datos ni configuración productiva.
