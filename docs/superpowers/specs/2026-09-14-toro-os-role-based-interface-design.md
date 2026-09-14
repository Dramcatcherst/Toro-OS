# TORO OS — Especificación de producto e interfaz basada en roles

Fecha: 2026-09-14
Estado: Arquitectura vigente aprobada por Mauricio
Repositorio: `Dramcatcherst/Toro-OS`

## 1. Decisión principal

**“Cerebro de Toro” = TORO OS.** No es otra app, otra base, otro agente, otro backend ni otro proyecto.

TORO OS debe sentirse como una sola superficie visual e inteligente que permite ver, buscar, relacionar, decidir y ejecutar sin obligar al usuario a conocer qué sistema vive debajo.

La arquitectura debe simplificar el ecosistema existente, no reemplazarlo por una migración masiva.

## 2. Jerarquía de autoridad vigente

1. **Mauricio** — decisión explícita actual.
2. **Sistemas transaccionales especializados** — autoridad viva de su dominio:
   - Kross: precio, disponibilidad, reserva, asignación, pago y estado PMS.
   - Alegra / bancos / fiscal: autoridad financiera o contable según el dato.
   - WeSpeak / WhatsApp: canal de comunicación; no sustituye la verdad transaccional.
3. **Airtable `TORO OS — Sistema Operativo Central`** — capa gobernada actual de catálogo, relaciones, control, tareas, validaciones, aprobaciones y portafolio ejecutivo.
4. **Supabase** — backend técnico cuando exista una necesidad concreta de runtime, Auth, RLS, alto volumen, relaciones complejas, búsqueda avanzada o aplicación. **No es automáticamente una segunda verdad general ni el destino obligatorio de Airtable.**
5. **Notion** — memoria larga, arquitectura, decisiones y handoffs; no operación viva.
6. **Dropbox / Drive** — archivos, evidencia y media; TORO enlaza y gobierna su uso.
7. **GitHub / Vercel** — código, CI y despliegue.

## 3. Agentes y superficies visibles

- **TORO**: dirección, prioridades, decisiones, riesgos, coordinación y seguimiento.
- **TERE**: huéspedes, recepción, reservas asistidas, concierge, comunicación y conversión.
- **RICO**: operación hotelera, housekeeping, mantenimiento, lavandería, inventario y calidad.
- **FIONA**: administración, finanzas, contabilidad, fiscal y People/HR.
- **SKY**: crecimiento, marca, contenido, reputación, campañas, experiencias y otros ingresos.
- **SOBRESITO**: sistemas, producto, datos, integraciones, web, seguridad y automatización.

TORO es la puerta de entrada; los demás agentes son subdivisiones de la misma experiencia.

## 4. Principios de producto

1. Una sola TORO OS, múltiples experiencias por rol.
2. Mobile-first; escritorio amplía, no cambia el modelo.
3. Usuarios ven conceptos de negocio, no tablas crudas.
4. Navegación visual primero; IA como acelerador complementario.
5. Una sola autoridad por dato; no copiar para “tenerlo también”.
6. Kross/Alegra y demás autoridades mantienen sus dominios.
7. Reutilizar Airtable actual mientras siga siendo la capa gobernada vigente.
8. Supabase entra por problema concreto, no por preferencia arquitectónica.
9. Todo cambio sensible debe ser auditable y permission-gated.
10. Acciones frecuentes y seguras deben requerir pocos toques.
11. Reducir ruido antes de agregar funciones.
12. No crear V2/V3 paralelas para sortear una limitación puntual de herramienta.

## 5. Human Mode — Hoy

La página existente `TORO OS Executive Command Center → Human Mode — Hoy` se conserva como entrada ejecutiva. **No crear Human Mode V2.**

Debe responder en segundos:

1. ¿Necesitan algo de Mauricio?
2. ¿Qué está pasando ahora?
3. ¿Qué puede bloquearlo?
4. ¿Qué está esperando aprobación?

Reglas verificadas a 2026-09-14:

### Decisiones
Fuente: `tasks`

`founder_action_required = true` y `status NOT IN (done, cancelled)`.

Snapshot actual: 0.

### Acciones activas
Fuente: `tasks`

`portfolio_lane = NOW OR status = in_progress`, excluyendo `done/cancelled`.

Snapshot actual: 8 registros; 3 tienen `status=in_progress`.

### Riesgos
Fuente: `validations`

`severity IN (high, critical)` y `status IN (open, in_review)`.

Snapshot actual: 7.

### Aprobaciones
Fuente: `approvals`

`approval_status = pending`.

Snapshot actual: 0.

La edición física de estos filtros debe hacerse sobre la página existente. Si una herramienta no permite editarla, registrar el bloqueo; **no crear una página paralela**.

## 6. Búsqueda universal V1

La búsqueda inicial no necesita una tabla `universal_search_index` ni una migración a Supabase.

Pruebas reales ya verificadas sobre Airtable actual:

- `25` → habitación 25 y relaciones.
- `Oliver` → empleado de mantenimiento.
- `desayuno` → SOPs/políticas relevantes.
- `Santa Toro` → propiedad archivada/histórica y límites de uso.
- `proyector` → amenidad y habitaciones/villa relacionadas.

### Fuentes iniciales

- `rooms`
- `villas`
- `sellable_units`
- `properties`
- `amenities`
- `staff_directory`
- `tasks`
- `validations`
- `experiences`
- `sops`
- `source_objects`

### Ranking obligatorio

1. clave/número exacto;
2. nombre visible exacto;
3. alias exacto;
4. prefijo;
5. fuzzy/full-text.

Un resultado fuzzy nunca debe superar un match exacto.

La salida debe proyectar solo campos seguros: nombre, tipo, resumen corto, estado relevante, key y acción `Ver`. No mostrar payloads privados, notas gigantes ni campos financieros/personales por defecto.

## 7. Ficha 360° piloto — Habitación 25

La ficha usa relaciones actuales; no crear relaciones nuevas si no son necesarias.

Verdad ya verificada para `DC-ROOM-25`:

- habitación #25;
- capacidad 5;
- 1 King + 1 Queen + 1 individual/rollaway;
- cocina privada;
- proyector;
- 22 amenidades relacionadas;
- propiedad Dreamcatcher Hotel;
- referencia/enlace Kross;
- media relacionada;
- se vende como habitación individual;
- forma parte de Villa Toro;
- forma parte del Full Property Buyout.

### Secciones

**Resumen** — estado, capacidad, camas, cocina, piso/características verificadas.

**Venta** — unidad individual, Villa Toro y Full Buyout.

**Kross** — referencia/enlace y estado de sincronización. Nunca copiar precio/disponibilidad como verdad TORO.

**Media** — hero, galería gobernada, Kross y pendientes. No listar cientos de assets crudos.

**Operación** — tareas/validaciones unidas por `linked_entity_key`, claves de validación o links estructurados. No usar el número `25` en full-text como relación primaria porque genera falsos positivos.

**Conocimiento** — SOPs/reglas relacionadas y gobernadas.

## 8. Roles y experiencias

### Mauricio — TORO / Mi Día

Prioridades, decisiones, excepciones, proyectos y acciones rápidas.

### Gerencia

Control diario, incidencias, habitaciones, personal, aprobaciones y compras.

### TERE / Recepción

Llegadas/salidas, Room Fit, cotizador, mensajes, experiencias, upsells y acceso Kross.

### RICO / Operación

Habitaciones listas, housekeeping, mantenimiento, lavandería, inventario, tickets e inspecciones.

### FIONA

Cierres, conciliaciones, impuestos, pagos, turnos, asistencia, vacaciones, planilla y excepciones.

### SKY

Contenido, campañas, SEO, reputación, media utilizable, experiencias y resultados atribuibles.

### SOBRESITO

Fuentes/autoridades, integraciones, releases, seguridad, permisos, sync, backups, observabilidad y costo técnico.

## 9. Seguridad y privacidad

- Menor privilegio por defecto.
- No exponer PII/finanzas a roles no autorizados.
- No usar secretos en cliente, logs o evidencia.
- Las acciones financieras, legales, de reservas, permisos o destrucción requieren gates explícitos.
- Lecturas agregadas o de catálogo deben proyectar solo campos necesarios.
- Supabase Auth/RLS se usa cuando una superficie/app lo requiera; no obliga a migrar las fuentes actuales.

## 10. Estados de carga y confiabilidad

Toda superficie nueva debe distinguir:

- loading;
- vacío real;
- stale;
- permiso denegado;
- error parcial;
- sistema externo caído;
- recuperación/reintento.

Nunca presentar datos stale como actuales sin aviso.

## 11. Criterios de uso de Supabase

Antes de agregar una tabla, índice o migración a Supabase responder:

> ¿Qué problema concreto no puede resolver razonablemente la arquitectura actual?

Justificaciones válidas pueden incluir:

- Auth/RLS real para una app;
- alto volumen o costo de Airtable;
- latencia demostrada;
- búsqueda semántica/vectorial necesaria;
- relaciones/consultas que Airtable no resuelve razonablemente;
- runtime transaccional propio;
- almacenamiento histórico/warehouse aprobado.

Si no existe un problema concreto medido, no migrar.

## 12. Primera ola de implementación

1. Cerrar filtros de `Human Mode — Hoy` en la página existente.
2. Implementar router de Búsqueda Universal V1 sobre fuentes actuales.
3. Implementar view-model de Ficha 360° de #25 reutilizando relaciones existentes.
4. Integrar ambos en la UI de TORO OS cuando exista entorno capaz de cumplir las reglas del repo/Next.js y ejecutar QA.
5. Medir latencia, éxito de búsqueda, pasos móviles y ruido antes de decidir cualquier infraestructura adicional.

## 13. Métricas de éxito

- tiempo para entender “qué necesita atención”;
- pasos/taps para llegar al dato útil;
- éxito de búsqueda en primer resultado;
- porcentaje de búsquedas sin resultado;
- falsos positivos de búsqueda;
- tiempo para abrir una ficha 360°;
- decisiones reales visibles vs backlog histórico;
- cantidad de nuevas fuentes de verdad creadas: objetivo 0 salvo necesidad demostrada;
- reducción de cambio de contexto entre sistemas.

## 14. Definition of Done de esta ola

Esta ola queda terminada cuando:

- `Human Mode — Hoy` usa los filtros ejecutivos vigentes y pasó QA móvil;
- la búsqueda resuelve casos comunes con exacto > alias > fuzzy y no expone payloads privados;
- `25` abre una ficha 360° útil basada en relaciones actuales;
- no se creó una segunda verdad ni una migración masiva;
- Supabase solo se usó si apareció una necesidad demostrable;
- lint/build/tests/QA de la superficie de código están verdes;
- los cambios se documentan en la tarea/portafolio/handoff ya existentes.

## 15. No objetivos

- reemplazar Kross;
- reemplazar Alegra;
- migrar todo Airtable a Supabase;
- crear un “Master Brain” nuevo;
- duplicar Human Mode;
- crear apps separadas por agente;
- exponer tablas crudas como experiencia;
- ejecutar cambios de alto riesgo sin aprobación;
- construir un índice universal antes de demostrar que hace falta.
