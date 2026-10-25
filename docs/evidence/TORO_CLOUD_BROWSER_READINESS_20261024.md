# Corte de continuidad cloud y navegador — 24/10/2026

Recibo subordinado a `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, TORO Systems/Tools/Comms. No sustituye el checkpoint general ni acredita una integración completa.

## Objetivo
Conservar el Gateway Lightsail existente y la cuenta WhatsApp actual, con el Gateway local apagado, y determinar qué falta para operar sin la PC.

## Estado verificado
- Fuente: consola SSH autenticada de la instancia existente `toro-openclaw-gateway-01`; lectura remota del 25/10/2026 03:35:13 UTC, equivalente al 24/10/2026 21:35:13 CR.
- Servicio `openclaw-gateway.service`: ActiveState=active, SubState=running, UnitFileState=enabled, User=openclaw, Restart=always, RestartUSec=5s, NRestarts=2. Se leyó el estado; no se reinició ni se probó un reinicio del host.
- CLI instalada OpenClaw 2026.10.1, invocada por rutas absolutas observadas, con el usuario y entorno existentes. Los valores privados del entorno y stdout/stderr bruto se procesaron solo en memoria remota.
- `channels status --json`, SIN `--probe`: exit=0, JSON encontrado, exactamente una coincidencia de `toro-interno`, configOnly=false, cero advertencias. Cuenta enabled/configured/linked/running/connected=true, healthState=healthy, lifecycle=ready, lastError ausente.
- `browser --json status`, pasivo: exit=0, enabled=true, profile=openclaw, running=false, cdpReady=false, cdpHttp=false, headless=true, noSandbox=false, attachOnly=false, chosenBrowser=null y detectedBrowser=null. No se lanzó el navegador.
- No se detectaron ejecutables Chrome/Chromium/Opera/Brave en el PATH del servicio; dpkg-query tampoco devolvió paquetes google-chrome-stable/chromium/chromium-browser instalados.
- Corte de capacidad 21:35:43 CR: x86_64, MemTotal=3.924.244 KiB (aprox. 3,74 GiB), MemAvailable=794.692 KiB (aprox. 776 MiB), swap=0 y disco libre=66,76 GiB. Lectura posterior del cgroup del Gateway: MemoryCurrent=3.005.317.120 bytes (aprox. 2,80 GiB), MemoryHigh/MemoryMax=infinity y TasksCurrent=118. No es un baseline de pico ni una prueba de fuga.
- Se observó un grupo de procesos `codex`; eso no verifica su autenticación, cuenta, permisos ni aceptación de tareas.
- Windows: KeepAlive y Watchdog de OpenClaw continuaban Disabled y había cero listeners en 18789/18799. No se inició ni reactivó el Gateway local. Este corte no prueba por sí solo la ausencia de escritores en todos los hosts.
- El conector específico de Opera devolvió Browser not connected para los dos vínculos disponibles. Se utilizó la sesión institucional de Chrome como alternativa. El control de navegador también había enumerado Opera; no se certificó el enlace específico de GX.

## Decisiones vigentes
- Preferencia explícita del propietario: Opera/GX como acceso humano para TORO. El navegador local no se convierte por ello en ejecutor independiente de Windows.
- Mantener el Gateway cloud existente y el local como respaldo frío apagado. No crear otro Gateway, cola, scheduler o fuente de verdad.
- Un navegador gestionado en el host cloud es TARGET. Chrome headless es candidato compatible; no fue instalado ni configurado en este corte.
- Preservar sandbox, loopback y aislamiento del propietario; no copiar cookies, perfiles, credenciales ni sesiones desde Windows.
- No se efectuaron instalaciones, cambios de configuración/servicios/permisos, ampliaciones pagadas ni mensajes.

## Archivos y fuentes exactas
- Plan único: `docs/product/TORO_BRAIN_GENERAL_PLAN.md`, bloque `TORO_CLOUD_BROWSER_READINESS_20261024`.
- Consola de la instancia existente: AWS Lightsail, región us-east-1.
- Evidencia local visual: `TORO-CLOUD-WHATSAPP-20261024.png`, dentro del directorio de evidencia de autorización existente. No se publican IP, teléfonos, IDs de sesión ni secretos.
- Documentación oficial consultada: [estado pasivo del navegador](https://docs.openclaw.ai/cli/browser), [Chrome en Linux](https://support.google.com/chrome/answer/95346?hl=es). La documentación actual no sustituye la evidencia de la versión instalada.

## Bloqueador
Navegador cloud ausente/detenido y margen de RAM reducido. Instalar y abrir un navegador sin presupuesto de memoria puede afectar al Gateway y a WhatsApp. La magnitud de ese riesgo debe verificarse antes de activar el candidato; no se autoriza ampliar capacidad o debilitar el sandbox por esta nota.

## Siguiente acción única
Resolver el presupuesto de memoria del navegador en el carril existente: identificar el consumo del cgroup ya medido y preparar una opción acotada con límites, impacto y reversión, preservando WhatsApp. No repetir acceso, inventarios ni pruebas de conexión ya cerradas; no activar local, instalar, reiniciar o redimensionar sin autorización concreta del cambio.

## Criterio de terminado
Navegador cloud aislado con recursos suficientes, arranque y lectura inocua comprobados; después una prueba iniciada por el propietario desde el móvil, con PC apagada, demuestra respuesta y recibo del mismo TORO. Autenticación de ChatGPT/Codex, integración Portal/fuentes y entrega/lectura siguen siendo gates separados hasta aportar evidencia. No se apagó la PC ni se ejecutó esa prueba.

Reversión de esta unidad: revertir únicamente la propuesta documental. No hay cambios de runtime que revertir.
