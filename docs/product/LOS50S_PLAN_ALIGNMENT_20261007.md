# Los 50s de Caro — alineacion al Plan General de TORO
Fecha: 2026-10-07. Estado: piloto privado. Esta ficha es subordinada al Plan General, no otro plan ni proyecto.

## Fuentes y responsables
- Plan General canonico: docs/product/TORO_BRAIN_GENERAL_PLAN.md.
- Proyecto de seguimiento existente: LOS50K en Airtable TORO OS V2. Conservar tareas existentes: LOS50K-PORTAL-V2, LOS50K-DATA-COMPLETE, LOS50K-ROOMING, LOS50K-OPENCLAW.
- Issue de ejecucion TORO #246. TORO Systems/Comms/Identity gobierna; SOBRESITO/OpenClaw implementa donde este verificado.
- Repositorio de interfaz: Dramcatcherst/dreamcatcher-website-vnext, rama codex/website-progress-20260924. Despliegue del 7-oct READY en Vercel, pero no equivale a autorizacion publica.
- Supabase de evento existente conserva datos de inscripciones, grupos, habitaciones, transporte y pagos. No duplicar datos, roles, memoria ni control plane. Este es un proyecto familiar privado separado de la operacion comercial hotelera.

## Avance y conflictos
- PR web #93, #94 y #95 integrados en rama activa. Portal, registro, invitacion general y comunidad como interfaz.
- PR web #92 abierto contra una rama diferente. Conciliar diferencias antes de fusionar. Referencia de itinerario: llegada oficial 29 nov, Manuel Antonio 30 nov, fiesta 4 dic, San Jose 5 dic, salidas 6 dic. Adultos Directo USD 800 y Manuel Antonio USD 1000; verificar cantidades de alimentos y noches en rutas publicas.
- Preview historico dreamcatcher-los50s-preview-p0 bloqueado; no usar para liberar al publico.
- El backend social y reconocimiento real de identidades no tienen pruebas E2E completas. OpenClaw requiere auditoria del host y recibo de envio antes de uso real.
- Lista historica de 45 no equivale a 45 personas verificadas.

## Siguiente secuencia sobre tareas existentes
1. Portal: comparar PR #92 con codigo activo, probar fechas, precios, seis rutas y registro de extremo a extremo sin datos reales; proteger datos privados.
2. Datos: reconciliar inscritos y grupos; no identificar invitados por nombre, enlace general o nombre de WhatsApp.
3. Identidad: token individual seguro con expiracion, OTP, alcance por grupo, RLS y prueba de tercero denegado.
4. Comunidad: posts/fotos/comentarios persistentes, moderacion y privacidad, solo tras pruebas de rol.
5. OpenClaw: auditoria del host real, canal aislado, remitente verificado, prueba autorizada, ACK y receipt. Nada de invitaciones masivas antes de autorizacion final.
6. Rooming: validacion de capacidad; ningun cambio Kross sin aprobacion.
7. Actualizar evidencias en issue #246 y tareas actuales. Ninguna tarea DONE sin verificacion y recibo.

## Regla de cierre
Ciclo canonico: tarea -> ejecucion con lease -> verificacion -> receipt -> estado actualizado. Un PR integrado o deploy READY no certifica cierre. Mantener NOT RELEASED hasta pruebas de acceso y aprobacion especifica.

Referencias:
- https://github.com/Dramcatcherst/Toro-OS/issues/246
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/92
- https://github.com/Dramcatcherst/dreamcatcher-website-vnext/pull/95
- https://vercel.com/dreamcatcher-s-projects/dreamcatcher-website-vnext-media-p0/3wVE317TiR8Ra5DGQDs4gmveSrEy
