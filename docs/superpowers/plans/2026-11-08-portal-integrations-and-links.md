# Portal integrado - Implementation Plan

> **For agentic workers:** escritor único del carril existente; usar superpowers:executing-plans para implementación nativa o superpowers:subagent-driven-development solo con delegación elegida y permitida. Pasos verificables; no otro proyecto maestro.

**Goal:** acceso directo a todos los destinos autorizados y procesos Portal-canal-operación-dinero.
**Architecture:** lectores por rol/contexto alimentan vistas compactas; acciones usan writers/recibos de Comms, Control Plane y Finance existentes.
**Tech Stack:** Next16.3.8, React19.2.4, TypeScript, CSS Modules y Vitest del lockfile actual; ninguna dependencia nueva para el lanzador.
**Spec:** docs/superpowers/specs/2026-11-08-portal-integrations-and-links-design.md.

## Global Constraints

- Mismo Portal/Plan, 00-11; Hoy por rol y tres destinos frecuentes + Más.
- America/Costa_Rica; turno estable cruzando medianoche; fuente y consulta separadas.
- Objetivos44px; móvil320/390/412 y escritorio1440; desconocido no es cero.
- entries solo LINK; candidate_entries propuestas; conservar archivo/ámbito.
- Abrir/consultar/actuar distintos; no crear URL, permiso, sesión o writer por apariencia.
- Backend resuelve actor/ámbito; credenciales del proveedor/Gateway fuera del cliente.
- Idempotencia por efecto y conciliación antes de reintento incierto; continuidad en originales.

## Review Focus

1. Mezcla de propuestas no puede invalidar el catálogo: el productor rechaza la mezcla antes de guardar.
2. Marcas iguales no fusionan cuentas ni ámbitos y no envían al destino equivocado.
3. Doble clic/reconnect/timeout no duplican envío, factura o tarea; revisión no es identidad nueva.
4. Poder abrir un enlace no concede lectura/escritura ni justifica botones engañosos.
5. Medianoche, edición/cancelación y cambio de contexto conservan caso/borrador con su ámbito.

---

### Task 1: catálogo y lanzador compacto

**Files:** src/features/tools/directory.ts, portal-tool-catalogue.tsx, portal-tool-catalogue.module.css, portal-tool-links.tsx y pruebas existentes; src/features/portal/portal-workspace.tsx.
**Interfaces:** consumir ToolCatalogueItem[] y ToolCatalogueMode. Proponer buildHotelServiceGroups(items: readonly ToolCatalogueItem[]): ServiceAccessGroup[], con grupo funcional/proveedor y destinos originales id, label, href nullable, scope, lifecycle. El ID, no marca, elige destino.

Tipo de salida acordado: ServiceAccessGroup = { key: string; label: string; destinations: Array<{ id: string; label: string; href: string | null; scope: string; lifecycle: string }> }. Se define junto al selector dentro del dominio tools. Pruebas propuestas: same_provider_distinct_accounts_preserve_href_and_scope, missing_destination_does_not_invent_href, candidates_do_not_enter_contractual_catalogue y show_all_preserves_filters_and_total.

- [x] Reparar fuente con guardia de huella, respaldo y conservación de propuestas; verificar igualdad. Sin DDL ni permisos; recibo privado existente.
- [x] Identificar productor existente y cerrar la causa: no hay writer de aplicación en el repositorio; las ediciones directas del registro canónico quedan protegidas por la guardia invoker de PR400/merge e46f919. Aplicada y releída el 08/11/2026: huellas exactas, RLS/ACL/owner preservados, trigger sobre las cuatro columnas, fuente v2.8 intacta con 244 fichas y 20 propuestas. Regresión SQL 10/10; no se instaló segundo escritor.
- [x] Regresiones: cuentas distintas del mismo proveedor conservan href/scope; URL ausente no crea enlace; ruta cuenta/contraseña no sustituye dashboard; catálogo parcial declara cobertura. Casos dirigidos en directory.test.ts y portal-tool-catalogue.test.tsx; el nuevo SHA debe conservar CI/preview antes del gate autenticado.
- [x] Implementar lanzador sobre destinos autorizados: compacta/detalle, búsqueda del conjunto y Ver todos, conservando filtros/retorno. El estado de filtros, vista y totales queda cubierto por regresión dirigida; abrir destinos HTTPS en pestaña nueva conserva el retorno al Portal.
- [ ] Ejecutar pruebas catálogo/directorio y test:hotel-tools, lint/tipos/build; inspección320/390/412/1440 y teclado en preview del mismo SHA.
- [ ] Commit y recibo autenticado del consumidor; no declarar destinos probados por tener URL.

### Task 2: bandeja, caso y borrador persistente

**Files:** reutilizar src/features/openclaw/channel-ledger.ts, src/features/comms/alert-delivery.ts y API/Control Plane existentes; componentes de bandeja/compositor en src/features/comms tras resolver contrato.
**Interfaces:** conservar ChannelActor, authorizeChannelLedger, validateChannelRecord, AlertDeliverySignal y prepareAlertDelivery. Usar objetos/sesiones/recibos canónicos existentes.

- [ ] Recuperar cuenta/remitente/usuario/membresía/propósito/chat/caso del transporte; mapear capacidad y writer por transición antes de código.
- [ ] Definir contrato versionado de borrador/acción: caso canónico, cuenta, destino verificado, versión y adjuntos. Actor/ámbito se resuelven en servidor; el cliente no los concede.
- [ ] Pruebas: otra identidad/ámbito denegados; toma humana evita doble respuesta; recarga/edición concurrente; cambio de contexto; adjunto incompleto; turno cruzando medianoche; fuente histórica.
- [ ] Implementar contra contrato existente o ampliación revisada, conservando ID de proveedor y original. Persistencia no depende del estado React.
- [ ] Un evento autorizado debe aparecer una vez en el mismo caso de Portal/canal. Transporte faltante conserva causa/borrador sin simular recepción.
- [ ] Commit, preview y aceptación de persona real del rol.

### Task 3: transmisión Portal-canal

**Files:** puente OpenClaw existente identificado por worktree/versión; alert-delivery.ts y ruta pertinente del Control Plane; no incrustar consola Gateway.
**Interfaces:** prepareAlertDelivery produce candidato, no envío. El adaptador real devuelve referencia de proveedor y registra communication_channel_receipts/sessions mediante contrato autorizado.

- [ ] Verificar runtime, cuenta/escucha, destino y frontera dueño/equipo/huésped.
- [ ] Pruebas de éxito/rechazo/timeout incierto/reconnect/replay/doble clic: un efecto autorizado único, sin mensaje a otro ámbito.
- [ ] Implementar solo flujo acotado del caso elegido; preparado/enviado/entregado/fallido/desconocido visibles.
- [ ] Conciliar por claves y consultar resultado antes de reintento; recuperar sin nueva tarea/respuesta.
- [ ] Registrar aceptación y recuperación; no extender prueba individual a todos los grupos/cuentas.

### Task 4: ficha financiera

**Files:** src/features/finance/*alegra*, contratos Kross y Dinero de PortalWorkspace existentes; componentes del caso tras inventario de lectores.
**Interfaces:** conservar CanonicalAlegraReaderTarget, prepareAlegraWriteIntent, validateAlegraWriteApproval y verifyAlegraReadback; existencia no activa flags. Vínculos requieren ID, empresa, moneda y fecha del hecho.

- [ ] Recuperar empresa/emisor/lectores y expediente original; localizar extracciones antes de ingerir otra vez.
- [ ] Definir proyección del ámbito: total no es saldo y pago reportado no es banco.
- [ ] Pruebas: anticipo/devolución/contracargo, comisión/retención, divisa, igual monto sin identidad, nota de crédito, cierre reabierto y fuente antigua.
- [ ] Implementar primero lectura/revisión/vínculos; escritura únicamente por contrato autorizado y probado con readback/dedupe.
- [ ] Aceptar caso completo o residual explicado con corte/fuentes; no ajustar saldos para forzar coincidencia.

### Task 5: adopción y release

**Files:** planes/evidencia del carril, pruebas Portal/Comms/Finance afectadas y Plan General único.
**Interfaces:** mismos objetos/estados y evidencia de versión/rol/corte/resultado; diagnóstico sensible privado.

- [ ] Medir base de pasos/tiempo/errores y elegir casos/usuarios disponibles; no inventar compromisos laborales.
- [ ] Probar normal/excepción/cambio de cuenta/continuidad/recuperación del lote.
- [ ] Controles del delta y preview del mismo SHA/configuración; CI no sustituye aceptación autenticada.
- [ ] Publicar solo lote aceptado dentro de autoridad, con reversión selectiva y originales disponibles.
- [ ] Medir adopción, éxito sin ayuda, reabiertos, duplicados y costo neto de revisión; actualizar el mismo caso/Plan.

## Estado

Dirección aceptada; reparación de datos y prevención de recurrencia verificadas. PR400 quedó fusionada en main e46f919 y la guardia de escritura fue aplicada con readback exacto sin modificar la fuente ni permisos. El directorio compacto continúa en #398; su CI/preview de c2f04a fueron exitosos, pero conserva aceptación visual/autenticada pendiente. No se activaron nuevas bandejas, envíos, escrituras contables o permisos.

