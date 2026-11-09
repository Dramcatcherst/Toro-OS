# Portal · reconciliación de progreso — 09/11/2026

Estado: actualización documental del candidato; no publicación ni aceptación operativa.
Plan superior: docs/product/TORO_BRAIN_GENERAL_PLAN.md.
Carril: PR398, codex/portal-operation-redesign-20261108.

## Problema y cambio

El checklist del Portal integrado mantenía como trabajo no realizado la proyección financiera y omitía el reconciliador de recibos ya preparados. También agrupaba commit/preview con aceptación real, aunque son evidencias distintas. Esto podía causar reimplementación o una lectura incorrecta del progreso.

Se actualizaron los mismos bloques del plan: preparación de código marcada con su alcance; integración, fuente, transporte, sesión y aceptación conservadas pendientes. La ficha financiera existe como componente/proyección; la página/workspace inspeccionados mantienen conteo manual y accesos, sin acreditar un consumidor de esa ficha.

## Evidencia consultada

- HEAD de código: 180446d94d9dc94c8dd4bc677f00ab582e43aef0.
- PR398: open/draft/mergeable al corte de lectura.
- TORO Brain CI42565591944: completed/success para ese HEAD.
- Workstation42565591495: completed/success para ese HEAD.
- Preview Vercel dpl_6Yr2fangU6AMvQre5g6VxWJZavUU: READY para ese HEAD, según recibo de despliegue consultado.
- src/features/comms/alert-delivery.ts: estados y reconciliación; nunca realiza envío.
- src/features/finance/reconciliation-card.ts y src/features/portal/portal-financial-reconciliation-card.tsx: proyección y presentación preparadas.
- src/app/portal/page.tsx y src/features/portal/portal-workspace.tsx: no acreditan la nueva ficha alimentada en Dinero.
- docs/evidence/TORO_CHANNEL_DRAFT_RELEASE_REVIEW_20261108.md: revisión separada, no instalación del writer.

No se ejecutaron nuevas pruebas de producto locales por un cambio documental. Las comprobaciones locales verifican sustituciones únicas, conservación de contenido no afectado, enlaces relativos y ausencia de activación declarada. La CI del commit documental debe conservarse con su SHA propio; la CI anterior no se atribuye al nuevo commit.

## Continuidad y recuperación

La pauta10+10 fue solicitada por Mauricio y registrada en el único seguimiento horario y checkpoint privado. Es un objetivo de trabajo con recuento real por efecto y etapa; no prueba20 funcionalidades, conexiones o cambios productivos aplicados en esta unidad documental. La creación de nuevos proveedores no es necesaria para cumplir el segundo grupo.

Siguiente: QA visual/autenticada por vía permitida del lote de lectura; si no está disponible, continuar una unidad independiente del lector/interfaz. Persistencia de borradores, transporte y finanzas conservan sus responsables y vías de release.

Recuperación: revertir únicamente este commit documental. No hay cambios de código, base de datos, permisos, mensajes o producción que revertir.
