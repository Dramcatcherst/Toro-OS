# Dreamcatcher — mantenimiento preventivo, Calendar y OpenClaw

Estado: **CURRENT parcial / TARGET con dependencias externas**. Corte: 21/10/2026, Costa Rica.
Subordinado al único Plan General TORO. Operations/RICO coordina ejecución física; Systems/SOBRESITO coordina integración.

## Control y continuidad

La directiva del propietario autoriza envío programado al grupo de mantenimiento, calendario accesible a empleados, 50 mejoras e integración con mantenimiento Kross. No autoriza inventar destinatarios o cierres, activar API paga ni modificar disponibilidad.

Reutilizar las tareas existentes `maintenance_preventive_schedule_2026_09`, `maintenance_daily_p0_p1_round`, `maintenance_asset_identity_enrichment_2026_09`, `maintenance_closure_verification_20260918`, `google_calendar_architecture_20260918` y la auditoría OpenClaw. Sin backlog, scheduler, identidad o escritor paralelo.

| Fuente | Autoridad / observación | Estado |
| --- | --- | --- |
| Supabase facilities | Eventos y cierre físico gobernado | Lectura comprobada; cierres sin modificar |
| Airtable | Inventario y referencia transicional | Ronda técnica pendiente; identidades por conciliar |
| Kross | PMS, operación y ventanas comerciales | Kross Maintenance transicional: 0 registros; transporte vivo no comprobado |
| OpenClaw | Transporte y ejecución sobre TORO | Un binding interno de teléfono; grupo de mantenimiento sin binding verificado; 0 sesiones y 0 receipts |
| Google Calendar | Proyección temporal de trabajo humano | Calendario Dreamcatcher · Mantenimiento creado y leído; lectura de dominio, no público |
| Empleados | Misma identidad TORO y acceso individual | No hay direcciones externas entregables comprobadas para los dos integrantes de mantenimiento |

Los IDs de calendarios y grupos, direcciones y datos de empleados quedan en configuración privada, fuera de este repositorio público. La lectura de dominio no acredita que cada empleado tenga cuenta ni haya aceptado el acceso.

## 50 mejoras

**CÓDIGO**: implementación candidata y pruebas locales, sin despliegue ni conexión al worker.
**CONFIGURACIÓN**: regla del seguimiento mensual o ajuste de Calendar observado, sin ejecución física.
**BLOQUEADO**: prueba externa pendiente. No son cincuenta mejoras productivas.

Distribución de esta revisión: 33 controles en código candidato, 15 reglas/ajustes de configuración y 2 pruebas externas bloqueadas.

| ID | Mejora | Estado |
| --- | --- | --- |
| M01 | Ámbito de organización y propiedad | CÓDIGO |
| M02 | Reutilizar activos y tareas canónicas | CONFIGURACIÓN |
| M03 | Cubrir dos piscinas y dos jacuzzis sin doble conteo | CONFIGURACIÓN |
| M04 | Contar A/C físicos, incluidos equipos múltiples por habitación | CONFIGURACIÓN |
| M05 | No inventar modelos, series, manuales ni frecuencias | CONFIGURACIÓN |
| M06 | Exigir fuente y fecha válida sin datos futuros | CÓDIGO |
| M07 | Distinguir desconocido de vencido | CONFIGURACIÓN |
| M08 | Exigir fecha, evidencia y prueba funcional para cierre físico | CÓDIGO |
| M09 | Excluir instrucciones históricas de la cola actual | CÓDIGO |
| M10 | Conciliar activos Toro legados sin excluirlos automáticamente | CONFIGURACIÓN |
| M11 | Calcular siguiente servicio desde fecha verificada e intervalo aprobado | CÓDIGO |
| M12 | Rechazar fechas imposibles e intervalos inválidos | CÓDIGO |
| M13 | Presentar revisiones próximas a 30 y 60 días | CONFIGURACIÓN |
| M14 | Ordenar P0–P3 de forma estable | CÓDIGO |
| M15 | Comprobar ventanas de habitación con Kross vigente | CÓDIGO |
| M16 | Identificar intervención técnica especializada | CÓDIGO |
| M17 | Confirmar técnico antes de programar su visita | CÓDIGO |
| M18 | Confirmar responsable y coordinación con recepción | CÓDIGO |
| M19 | No modificar disponibilidad ni reservas automáticamente | CÓDIGO |
| M20 | Verificar cierre reportado antes de repetir reparación | CÓDIGO |
| M21 | Deduplicar por activo, intervención y período | CÓDIGO |
| M22 | Conservar contradicciones para conciliación | CÓDIGO |
| M23 | Excluir cierres probados conservando nuevas revisiones legítimas | CÓDIGO |
| M24 | Mantener resultado independiente del orden de entradas | CÓDIGO |
| M25 | No sumar bombas individuales y placeholder completo | CONFIGURACIÓN |
| M26 | Usar solo la ruta room:maintenance de OpenClaw | CÓDIGO |
| M27 | Comprobar ámbito del grupo destino | CÓDIGO |
| M28 | No sustituir grupo faltante por teléfono u otro chat | CÓDIGO |
| M29 | Exigir binding verificado, conectado, saludable y reciente | CÓDIGO |
| M30 | Exigir runtime y retorno de recibos verificados y actuales | CÓDIGO |
| M31 | Vincular envío con autorización expresa del dueño | CÓDIGO |
| M32 | Reutilizar la programación mensual existente | CONFIGURACIÓN |
| M33 | Generar clave de envío por ámbito, caso, período y delta | CÓDIGO |
| M34 | Conciliar proveedor incierto antes de reintentar | CÓDIGO |
| M35 | Suprimir entregas ya enviadas sin cambio material | CÓDIGO |
| M36 | Resumen de hasta ocho casos y referencia al resto | CÓDIGO |
| M37 | Reservar escrituras al worker y lease existentes | CONFIGURACIÓN |
| M38 | Separar preparado, enviado y recibido con evidencia | CONFIGURACIÓN |
| M39 | Probar reinicio y ejecución sin PC | BLOQUEADO |
| M40 | Resolver acuses de empleados con identidad TORO verificada | CONFIGURACIÓN |
| M41 | Calendario de mantenimiento bajo la cuenta del hotel | CONFIGURACIÓN |
| M42 | Calendario no público con lectura organizacional | CONFIGURACIÓN |
| M43 | Rechazar alias internos y empleados no vigentes para invitaciones | CÓDIGO |
| M44 | Proyectar solo ventanas futuras confirmadas | CÓDIGO |
| M45 | Conservar ID del evento al reprogramar | CÓDIGO |
| M46 | Eventos transparentes sin bloquear inventario comercial | CÓDIGO |
| M47 | Exigir evidencia de lectura de mantenimiento Kross | CÓDIGO |
| M48 | Rechazar mapeo de otra habitación, propiedad o fuente expirada | CÓDIGO |
| M49 | Obtener muestra real y conciliar primer caso Kross Maintenance | BLOQUEADO |
| M50 | Continuidad manual y rollback sin perder historial | CONFIGURACIÓN |

Código candidato: `src/features/maintenance/preventive-plan.ts`; pruebas contiguas. Reutiliza `prepareAlertDelivery`. Genera candidatos; no contiene clientes de red, escribe, envía, instala cron ni altera permisos. Un resultado `ready` solo permite continuar al siguiente gate.

## Calendar y OpenClaw

Se conserva el día 1 por la mañana en Costa Rica. El único destino externo autorizado es el grupo de mantenimiento, pendiente de identificación y prueba. Una salida ChatGPT no cuenta como entrega WhatsApp. Antes de mover el disparador a OpenClaw, inventariar jobs del host, verificar grupo, versión instalada y receipt, cambiar un solo disparador y demostrar ausencia de doble envío.

La serie Calendar es **CONTROL: revisión humana del plan mensual**, no una auditoría del agente, visita técnica confirmada ni reparación realizada. Los eventos de intervención requieren ventana futura confirmada por recepción, responsable y técnico cuando corresponda. El calendario principal con información financiera no se comparte con empleados.

La dirección `*.internal` confirmada en Auth no es un buzón Google entregable. Se requieren direcciones reales de mantenimiento y prueba individual. No invitar alias internos ni usar empleados cesados; mantener mínimo acceso lector al calendario operativo.

## Kross y validación

Kross conserva autoridad. Obtener una muestra real de mantenimiento y mapear sus campos e identidad física antes de implementar el adaptador. La función recibe contexto gobernado, **no** payloads de proveedor inventados desde una tabla vacía. No reactivar API paga.

Para una ventana de habitación exigir lectura Kross viva y de mantenimiento, ámbito coincidente, mapeo vigente, ventana aprobada y evidencia válida hasta el final del trabajo. Cero filas de snapshot no prueban ausencia de averías ni disponibilidad. Fuera de alcance: escrituras PMS, out-of-order, tarifas, reservas, liberaciones y cierres físicos.

La suite usa datos sintéticos y verifica aislamiento, duplicados/conflictos, cierres reportados/futuros, fechas, alias internos, grupo incorrecto, runtime viejo, replay, proveedor incierto, responsable/técnico, ventana y mapeo Kross. No hay datos personales en fixtures.

Gates pendientes: acceso individual de empleados; runtime vivo con grupo y receipt; muestra Kross; consumo del candidato por worker existente; revisión/merge/producción. Configuración, código probado y operación productiva son estados separados.

## Continuidad, recuperación y responsables

Ante fallo de envío, conservar el mensaje preparado y el caso canónico, sin otro grupo o reintento ciego. Ante resultado proveedor desconocido, conciliar primero. Ante falla Calendar, conservar tarea/ID externo y reanudar sin duplicar. Recepción coordina ventanas; mantenimiento aporta prueba funcional; revisor autorizado decide cierre/liberación.

Rollback de código: revertir esta PR; no hay schema ni datos mutados. Agenda: retirar/suspender exclusivamente la serie de control de este encargo, sin borrar eventos ajenos, calendarios o historial. Seguimiento: revertir solo la directiva nueva de la tarea mensual, conservando otros ejecutores.

Mantener Kross, mejorar el flujo vigente y validar este prototipo; no hay evidencia para reemplazar sistemas. Aprendizaje candidato: confirmación Auth de alias interno no acredita entrega; validar con direcciones reales y prueba de acceso. Métrica: empleados con acceso individual probado / empleados incluidos, sin inventar cumplimiento.

Fuentes primarias de capacidad consultadas el 21/10/2026; contrastar con la versión instalada antes de ejecutar:
- https://docs.openclaw.ai/cli/cron
- https://docs.openclaw.ai/automation/cron-jobs/delivery
- https://docs.openclaw.ai/providers/whatsapp
- https://support.google.com/calendar/answer/37082

