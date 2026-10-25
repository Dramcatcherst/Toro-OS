# Continuidad cloud y presupuesto de memoria — corte 25/10/2026

Recibo subordinado a `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, bloque `TORO_CLOUD_BROWSER_READINESS_20261024`. Sustituye el NEXT de memoria del corte24/10; no crea otro plan ni acredita la integración completa.

## Objetivo y límites
Dejar el navegador del Lightsail existente preparado con memoria suficiente para una prueba acotada, preservando WhatsApp y el Gateway local apagado. No ampliar capacidad ni costos contratados. Opera/GX permanece como preferencia del acceso humano, sin convertir Windows en runtime cloud.

## Diagnóstico de memoria
- Corte remoto25/10 05:55:06UTC: MemAvailable1490908KiB (aprox.1456MiB), swap0. El cgroup reportaba3041427456B, de los cuales anon1742MiB, file1039MiB y kernel119MiB. PSS del Gateway1540MiB, anon1516MiB. Los118 tasks incluyen hilos; no equivalen a118 agentes.
- MemoryCurrent incluye caché recuperable; no se demostró una fuga ni3GB de heap irreclamable. Memory.events oom/oom_kill eran0 y PSI promedio era0 en ese corte; eso no garantiza ausencia de futuros picos.
- El PID240503/NRestarts3 ya estaba presente antes de la instalación. El corte24/10 había registrado207852/2; el cambio anterior no fue causado por esta unidad.
- No se vació la caché, mataron tareas, añadió swap, cambió heap/cgroup ni redimensionó la instancia. El margen observado permitió ensayar un único navegador, conservando WhatsApp.
- Guardia inicial: al menos1280MiB disponibles antes de instalar/arrancar; cierre solo del navegador si menos512MiB o canal no saludable. Prueba final de una pestaña: mínimo1200MiB, ajustado al arranque ya medido. Estas fueron comprobaciones manuales del ensayo; no existe un controlador persistente de memoria añadido.

## Cambio ejecutado
- Fuente oficial Google: metadatos HTTPS de `dl.google.com/linux/chrome/deb/dists/stable/main/binary-amd64/Packages`; paquete amd64 verificado contra SHA256 del proveedor.
- `google-chrome-stable` versión156.0.8078.47-1, binario Google Chrome156.0.8078.47; paquete138,1MiB. SHA256 `6c92cd22e90c6e3e255d782991543fa2091db8614e8536a971a7433a5c4d7ac8`.
- Simulación y aplicación con `--no-install-recommends`, `--no-upgrade`, `--no-remove`:76 paquetes nuevos, cero upgrades/removals. Sin reinicio del Gateway durante la instalación ni nuevas instancias/servicios pagados.
- Perfil existente `openclaw`: arranque exit0, running/cdpReady=true, headless=true, noSandbox=false, CDP18800 en loopback; autodetección Chrome. No cambió la configuración ni se copiaron perfiles/cookies/credenciales.
- Servicio OpenClaw2026.10.1: `/opt/openclaw/node-v24.19.0/bin/node` + `/opt/openclaw/app-2026.10.1/node_modules/openclaw/dist/index.js`, usuario y entorno de systemd. Los secretos y stdout bruto del canal se procesaron solo en memoria remota.

## Aceptación y estado final
- Corte final25/10/2026 06:14:40UTC (00:14:40CR): Gateway active, MainPID240503 y NRestarts3 sin cambios durante la unidad. Cuenta exacta `toro-interno` configured/running/connected=true, healthState=healthy, lifecycle=ready y sin lastError.
- Navegador detenido: último stop exit0/running=false; comprobación final cero procesos Chrome bajo openclaw. MemAvailable1247MiB (aprox.1,22GiB), PSI some/full promedio10/60/300=0. No prueba estabilidad de carga web futura.
- Arranque aceptado; navegación web NO aceptada. Las aperturas de dreamcatcherhotel.com y github.com devolvieron exit1. En GitHub el error exacto fue `Navigation blocked: strict browser SSRF policy requires Playwright-backed redirect-hop inspection`.
- Causa confirmada en el código instalado: `dist/registry-DBlT5cMO.mjs:20-45` calcula isRemote mediante cdpIsLoopback y fija `usesPersistentPlaywright: usesExtension || isRemote`. El perfil gestionado por loopback no toma esa ruta. `dist/server-context-DkOCbd2h.mjs:952-976` rechaza la navegación estricta cuando no se dispone de la inspección. La presencia de playwright-core no corrige por sí sola esta selección del modo; no se instaló Playwright ni se parcheó el proveedor.
- `example.com` devolvió: “strict browser SSRF policy requires an IP-literal URL because browser DNS rebinding protections are unavailable for hostname-based navigation”. No se usaron IP literales como atajo ni se cambió la política.
- La configuración en disco sí contiene allowedHostnames previos para el hotel, Kross, Airtable, GitHub y Vercel, con dangerouslyAllowPrivateNetwork=false. El dominio del hotel también falló por la ruta de navegación sin inspección; una lista permitida no basta para satisfacer esa guardia. No se añadieron excepciones.
- La lectura exitosa de about:blank acredita control básico únicamente, no navegación ni autenticación. ChatGPT/Codex, Portal/fuentes, envío/entrega/lectura WhatsApp y la prueba desde móvil con PC apagada siguen sin aceptación.
- Windows/Gateway local no se modificó ni activó; este corte no repitió su inventario ni prueba ausencia de otros escritores. El conector Opera había seguido desconectado; la consola institucional de Chrome fue la vía alternativa.

## Fuentes y evidencia
- Consola SSH autenticada de `toro-openclaw-gateway-01`, Lightsail us-east-1. Estado del servicio y CLI con el entorno real; `channels status --json` SIN `--probe`, cuenta exacta `toro-interno`.
- Evidencia visual local: `TORO-CLOUD-BROWSER-20261025.png`, en el directorio existente de autorización. No se publican secretos, teléfonos ni sesiones.
- Código instalado: `dist/chrome-BxQrWo_3.mjs:264`, guardia de navegación estricta.
- [Configuración oficial del navegador](https://docs.openclaw.ai/tools/browser/configuration): distingue permisos de hosts y reemplazo del control Browser por hot reload. Su comportamiento debe comprobarse en la versión instalada antes de cualquier cambio; no se infiere que el Gateway activo lo soporte.
- [Incidencia oficial67966](https://github.com/openclaw/openclaw/issues/67966), relacionada con la falta de inspección en el modo local gestionado; no es evidencia de una reparación disponible para esta instalación.
- [PR oficial66386](https://github.com/openclaw/openclaw/pull/66386) conserva el bloqueo estricto de hostnames; no acredita una reparación DNS para este runtime.

## Reversión
Cierre del navegador comprobado; Chrome queda instalado e inactivo, sin su RAM ociosa. No hay política ni estado WhatsApp que revertir. Si después se autoriza retirarlo, quitar solo el paquete google-chrome-stable sin auto-remover dependencias ni borrar perfiles; esa retirada no se ejecutó.

## Siguiente acción única y criterio de terminado
Preparar en el mismo carril una reparación soportada del modo Browser para inspeccionar redirecciones bajo SSRF estricto, validada fuera del Gateway activo antes de aplicar. No ampliar allowlists, fingir CDP remoto, parchear guardias ni instalar Playwright como arreglo supuesto. Si la reparación exige reiniciar el Gateway cloud, presentar candidato, impacto y reversión y obtener una ventana autorizada antes de interrumpir WhatsApp. Cero ampliaciones pagadas y Gateway local apagado.
Terminado solo cuando una página pública autorizada se abra y su contenido se lea con sandbox, política efectiva comprobada y margen de memoria, preservando Gateway/WhatsApp. La prueba posterior del propietario con PC apagada será una aceptación distinta.

Registro revisable: [PR387](https://github.com/Dramcatcherst/Toro-OS/pull/387), borrador no fusionado. No se actualizó main.

## Apéndice — candidato de navegación headless, 25/10/2026

### Hechos comprobados en fuentes oficiales

- Esta revisión compara dos versiones concretas; no declara cuál es la última versión global ni reaudita el host. Los tags anotados oficiales resuelven a `v2026.10.1` → `e178c39e9aae3fa440735217f9aef9574f286677` y `v2026.10.7` → `157d8c2bc3ea2fa183afdc11088e69690bf8e64e`. La [release 2026.10.7](https://github.com/openclaw/openclaw/releases/tag/v2026.10.7), publicada el 24/10/2026, identifica ese commit y el paquete oficial.
- En [tab-ops de 2026.10.1](https://github.com/openclaw/openclaw/blob/e178c39e9aae3fa440735217f9aef9574f286677/extensions/browser/src/browser/server-context.tab-ops.ts), la creación con Playwright exige `capabilities.usesPersistentPlaywright`. En [2026.10.7](https://github.com/openclaw/openclaw/blob/157d8c2bc3ea2fa183afdc11088e69690bf8e64e/extensions/browser/src/browser/server-context.tab-ops.ts), admite `capabilities.usesPersistentPlaywright || headless` antes de la guardia de redirecciones. Chromium headless observado usa `createPageViaPlaywright`, conservando la política de navegación.
- El cambio está descrito en la [PR oficial170857](https://github.com/openclaw/openclaw/pull/170857), integrada como `9650b2c4bb5f6c557de4ba4633bb746e783fa5b9`, para evitar bloqueos de interacción por solicitudes de passkey. El [test de selección headless](https://github.com/openclaw/openclaw/blob/157d8c2bc3ea2fa183afdc11088e69690bf8e64e/extensions/browser/src/browser/server-context.headless-passkey-guard.test.ts) usa mocks; acredita una intención de diseño, no navegación real del hotel. También se revisaron las [guardias de navegación de esa versión](https://github.com/openclaw/openclaw/blob/157d8c2bc3ea2fa183afdc11088e69690bf8e64e/extensions/browser/src/browser/navigation-guard.ts). No se ejecutaron pruebas ni se verificaron los bytes del paquete publicado en esta revisión.
- La [issue67966](https://github.com/openclaw/openclaw/issues/67966) cerró por inactividad; su cierre no demuestra una reparación. El recibo del host arriba conserva su propio corte y sigue registrando navegación bloqueada.

### Inferencia — NO_VALIDADA_EN_HOST

2026.10.7 es un candidato para superar la selección de ruta que bloqueó el Chromium headless gestionado por loopback. La comparación de código no demuestra compatibilidad del paquete instalado, carga de Playwright, navegación completa, autenticación ni frescura Kross. No se modificó el Gateway y no se atribuye al host este cambio de versión.

### NEXT — ensayo aislado antes de cualquier adopción

1. Verificar el paquete oficial fijado a 2026.10.7 contra la integridad publicada y contrastar sus bytes con el código revisado, fuera del Gateway activo y sin copiar perfiles, cookies o secretos.
2. Ejecutar las regresiones existentes de selección headless y guardias de navegación. En un entorno aislado, comprobar una página pública autorizada y su lectura, junto con negativas de redirección a destinos prohibidos mediante fixtures que fallen antes de contactar esos destinos. Mantener `dangerouslyAllowPrivateNetwork=false`, sandbox, CDP en loopback y la política de hosts; no ampliar excepciones ni disfrazar un endpoint local como remoto.
3. Registrar versión/artefacto, política efectiva, resultados, consumo de memoria y cierre limpio. Si pasa, preparar impacto, respaldo y reversión de una eventual adopción en el carril existente; cualquier reinicio del Gateway mantiene el requisito previo de ventana autorizada definido arriba.

**Criterio de terminado de este candidato:** evidencia aislada de navegación y lectura permitidas, redirecciones prohibidas bloqueadas y sandbox/política intactos. No equivale a aceptación de WhatsApp, sesión del Portal, lectura Kross o trabajo con el PC apagado. Este apéndice conserva las autoridades del Plan General y del recibo; no amplía permisos, autoriza una actualización ni crea otro runtime, adaptador o scheduler.
