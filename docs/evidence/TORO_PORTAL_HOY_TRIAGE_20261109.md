# Portal Hoy — prioridades diarias — 09/11/2026

Estado: candidato implementado; producción y aceptación autenticada/visual pendientes.
Plan superior: docs/product/TORO_BRAIN_GENERAL_PLAN.md.
Carril: PR398. Base del lote:55871063407a247742a79cbf40498133890e0f51.

## Cambio de comportamiento

La entrada Hoy recibe un resumen renderizado en servidor desde la misma lectura autorizada de Operación. Presenta fecha del corte en Costa Rica, pendientes del lote, prioridad crítica registrada, fecha vencida, vencimiento para hoy y falta de responsable. Añade hasta tres tareas para revisar, con área/responsable/fecha y marca de revalidación. Fuente/cobertura y calidad del registro permanecen desplegables.

No realiza otra consulta al proveedor ni serializa nuevamente el lote completo hacia PortalWorkspace. Se retira de esta página el cálculo hotelOverview que ya no consume; el fallback opcional se conserva para consumidores existentes del workspace.

## Controles funcionales de la nueva proyección

1. Día de consulta en America/Costa_Rica, sin depender del reloj del navegador.
2. Fecha vencida distinta de hoy, futuro y ausencia de fecha.
3. Vencimiento para hoy recalculado al cruzar medianoche local.
4. Prioridad crítica registrada distinta de prioridad alta/desconocida.
5. Responsable ausente o vacío sin asignación inventada.
6. Revalidación separada de prioridad y vencimiento.
7. Ausencia de fecha explícita, sin inferir un plazo.
8. Hasta tres recomendaciones de revisión: crítica, vencida, hoy y resto; empates conservan orden de fuente y no mutan el lote.
9. Reloj desconocido o cambio futuro no se presenta como última modificación comprobada.
10. Fuente fallida permanece desconocida y se distingue de un lote leído correctamente sin tareas.

Tres mejoras de presentación/simplificación agrupadas: portada centrada en revisión con métricas semánticas y detalle progresivo; slot server sobre la misma lectura con retirada de cálculo duplicado y compatibilidad; estados de fallo con hora del intento validada, sin cifras cero ficticias. Son controles de una misma mejora de Hoy; no20 integraciones externas ni20 funcionalidades independientes desplegadas.

## Evidencia de desarrollo

- Modelo: primeras15 pruebas pasaron por RED (13 fallos,2 éxitos) y GREEN15/15; las3 regresiones de revisión fallaron antes de corregir y quedaron GREEN18/18.
- UI test-first:987dde314f1a801e470ef97f81e01676f39437bd, CI42568388522 falló exactamente6 asserts del renderer vacío; otros332 tests de hotel-tools pasaron.
- Primer renderer:3be18e404e9256ac17e3c5326743971239bc6d82; CI42568658743 encontró una expectativa de fixture errónea, con339 otros tests de hotel-tools aprobados. La fixture se corrigió conforme al orden especificado, sin cambiar el modelo para satisfacer un resultado falso.
- Se registraron8 pruebas SSR del componente y2 de integración en workspace, además de18 pruebas Node del modelo incorporadas al script test:hotel-tools existente.
- La revisión fresca de código encontró2 puntos importantes y3 menores. Los puntos importantes fueron fixture y última modificación sin reloj. También se fortaleció el assert de presencia, se conservó hora de intento y se retiró cálculo/payload redundante.
- El runner Node de este módulo declara ESM explícitamente mediante --experimental-default-type=module; no cambia el modo del repositorio ni oculta advertencias globalmente.
- La CI y el preview del commit final se registran con SHA exacto en el checkpoint privado; no se atribuye al SHA final una ejecución anterior.

## Decisiones y límites

Se empleó una instantánea local aislada y Git tree/ref CAS del conector. Node24 verifica el modelo localmente; el repositorio completo, lint y build se verifican en CI. No existe una instalación local completa del producto que permita afirmar QA integral.

El día pertenece al readAt del servidor; el corte de datos y los timestamps originales no se rejuvenecen. La proyección es lectura de trabajo registrado, no certificación física, disponibilidad actual o ejecución de la tarea.

Se adoptó ReactNode server y se retiró el cálculo de compatibilidad de la página por la petición de simplificar; si un consumidor alterno necesita ese fallback, PortalWorkspace lo sigue admitiendo. Se corrigió la fixture de prioridad en lugar de modificar la regla crítica-vencida-hoy.

Los roles, el contexto y el lector/RLS son los existentes. Pruebas estáticas no acreditan aislamiento real con cuentas, teclado/lector de pantalla, contraste/desborde móvil, sesión autenticada o aceptación física. No se modificaron fuentes, permisos, BD, writers, mensajes, Kross/Alegra ni producción.

Siguiente unidad: validar visualmente y con sesión legítima el lote pequeño de lectura por una vía permitida, y extraerlo de forma compatible desde la base productiva vigente. Si el acceso sigue bloqueado, continuar una unidad independiente dentro del alcance aceptado y registrar el resultado real del objetivo10+10.

Recuperación: revertir únicamente los commits de este lote sobre la rama actual, preservando los posteriores; no hay migración ni efecto transaccional que revertir.
