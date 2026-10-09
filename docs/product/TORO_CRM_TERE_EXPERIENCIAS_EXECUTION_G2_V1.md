# TORO CRM–TERE–Experiencias: plan y método de ejecución G2
Marcador: CRM-TERE-EXPERIENCIAS-20261008-V1
Fecha: 09/10/2026, America/Costa_Rica.
Estado: PROPUESTO PARA APROBACIÓN G2. No ejecución técnica autorizada por este documento.

## Aprobación recibida
Mauricio respondió «Si apruebo» el 09/10/2026 a las 00:54, hora Costa Rica, a la solicitud de aprobación G1 de la especificación presentada en PR #258. Se registra G1 APROBADO, limitado a esa especificación. No concede G2, QA real, piloto, producción, permisos ni acciones comerciales.
Especificación aprobada: docs/product/TORO_CRM_TERE_EXPERIENCIAS_SPEC_V1.md, versión revisada del PR en bf5e1be37a3fc033ba38c3d36294b25b9a8c52af. El PR seguía abierto y draft en la lectura actual; no se fusionó.

## 1. Método recomendado y límite de la aprobación solicitada
Ejecución secuencial por paquetes pequeños en checkout/rama de desarrollo, con revisión de instrucciones del repositorio antes de editar. Reutilizar evaluador TERE, intake de evidencia, contratos Core, Control Plane y tareas existentes. Un único editor por objeto; SHA/version guard, diff acotado, pruebas pertinentes, readback y receipt.
Sin nueva base/inbox/cola/scheduler. No depender de contactos/chats reales para desarrollo. Sin exportar PII. No agentes paralelos.

La aprobación G2 solicitada habilitará exclusivamente el Paquete A: preparación técnica local, fixtures sintéticos, cambios de código y borradores SQL revisables en una rama, pruebas unitarias/de contratos locales sin red externa y documentación de rollback. No habilitará aplicar SQL, crear tablas en ningún servidor, cambiar permisos, activar conexiones ni probar WeSpeak con efectos externos. No merge/deploy, campañas, publicaciones o envíos.
Los Paquetes B y C quedan planificados con gates propios. Si un hallazgo requiere ampliar A, presentar delta y obtener aprobación antes del cambio. La rama documental actual puede generar previews automáticos existentes; no son piloto ni prueba de uso y no se solicita ningún nuevo deployment.

## 2. Preparación y verificación de autoridad
Antes de A: leer AGENTS.md y políticas del checkout, identificar commit actual y diferencias frente a lo aprobado; revisar catálogo/columnas y contratos con SELECT mínimos solo si cambiaron. Identificar DC2-040 mediante metadatos/índice existente y resolver su mapping sin crear otra tarea; si no aparece, mantener BLOCKED.
Inventariar consumidores de evaluadores y mappings antes de cambiar interfaces. Revalidar versión/hash/fecha canónicos de TERE; las tareas históricas mencionan V4 y el runbook leído menciona V5. Ninguna es prueba de consumo actual. No sobrescribir el target a V5 por inferencia.
Estos son checkpoints de preparación, no nueva auditoría histórica ni nueva automatización.

## 3. Paquetes y dependencias
| Orden | Paquete / tarea existente | Cambio concreto propuesto | Criterio de terminado | Gate |
| --- | --- | --- | --- | --- |
| A1 | Core: toro_core_relationship_work_abstraction_20260929 | Mapa de campos existentes/gaps; contrato tipado para contacto/persona/organización/tenant/canal/relación/actor; enlaces scoped; candidatos y merge/split reversible | Fixtures de dos tenants, agencia/grupo/empleado-cliente; ninguna unión de grants ni identidad por teléfono | G2, solo local |
| A2 | CRM: wespeak_crm_reactivation_attribution_20260826 | Validación de intención/oportunidad/reserva/ganado; contrato de consentimiento/supresión y tags con caducidad; preservar opt-out en merge/import | Decisiones deterministas sobre fixtures; cero elegibilidad por tag o pago mencionado | A1 y G2; no campaña |
| A3 | Contexto TERE y knowledge_sweep_tere_2026_09 | Manifiesto de fuentes/versiones/precedencia; preparación ES/EN de respuestas; matriz de 23 preguntas y 61 plantillas solo con metadata autorizada | Contenido sin evidencia bloqueado; no enseñanza ni modificación WeSpeak; cola existente preservada | G2; falta fuente = BLOCKED |
| A4 | QA: wespeak_weekly_conversation_qa | Ampliar pruebas alrededor del evaluador/intake existente con casos CRM, handoff, experiencias y fronteras | Resultado local reproducible, pruebas negativas y de rollback; evidencia real ausente conserva BLOCKED | G2 |
| A5 | Experiencias / knowledge_sweep | Validadores de ficha pública/evidencia operativa y estados interés→solicitud→aceptación→reserva→realizado | Sin cupo/fuente/precio vigente no confirma; sin datos internos en salida pública | G2 |
| A6 | Owner Attention + Connector Learning | Diseño de proyección 360 y receipts/dedupe integrado; clasificación de fuentes y capacidades con versión/alcance | Fixtures por rol; solo Recepción limitado al lote WeSpeak; rutas restantes intactas | G2 |
| B | QA aislado de integraciones/runtime | Aplicar únicamente el diff aprobado en entorno de prueba verificado, demostrar hash/continuidad/supresión | Todas las pruebas pertinentes, side effects=0 y rollback probado; no prueba con huésped real | G3 específico posterior |
| C | Piloto limitado | Entorno/canal, población, fechas, duración, límites y responsable aceptante explícitos; sin invitados inferidos | Resultado E2E y receipt verificables de la cohorte autorizada | G4 específico posterior |

A1–A6 son preparación y desarrollo local, no promesa de instalación ni autonomía. El responsable ejecutor técnico propuesto es esta sesión de ejecución; no se reasignan owners de tasks. Mauricio decide gates y políticas. Recepción/proveedor no tienen obligación nueva sin aceptación.

## 4. Objetos y archivos a reutilizar
Inspeccionados en lectura:
- src/features/tere/runtime-acceptance.ts: evaluateTereRuntimeAcceptance; comprobar versión/hash, aislamiento, escenarios y continuidad.
- src/features/tere/runtime-evidence.ts: validateTereRuntimeEvidencePacket; valida cinco claves exactamente una vez y transforma al input canónico.
- data/tere_v5_runtime_qa_cases_v1.json: cinco casos sintéticos existentes; mantenerlos y añadir regresiones separadas sin falsear datos observados.
- docs/runbooks/TORO_TERE_WESPEAK_V5_RUNTIME_ACCEPTANCE_GATE.md: gate existente; actualizar solo por delta autorizado.
- supabase/drafts/20260929_toro_core_portability_contracts.sql: contrato borrador, no migración ejecutable aprobada.
- docs/product/TORO_BRAIN_GENERAL_PLAN.md: solo cambios materiales por marcador, sin anexos repetidos.

Los paths de CRM/360/tests se seleccionarán después de inspeccionar sus consumidores; no inventar que existen. Todo nuevo archivo de prueba o contrato debe alojarse en el módulo correspondiente, sin crear otro servicio o repositorio. Modelos verticales guests/consents/reservations/stays/followups/tasks/knowledge_items y catálogo conservan autoridad.

Observación de código, no fallo E2E probado: el evaluador directo usa Map de escenarios y no rechaza duplicados por sí solo; el intake sí los rechaza. Revisar callers y exigir intake o validación equivalente. El test a proponer debe cubrir duplicados y entrada directa, sin atribuir explotación ni modificar antes de G2. También separar “evidencia inválida” de “runtime falló”: ausencia no es FAIL operacional.

## 5. Pruebas locales y QA externo separado
Casos mínimos: teléfono compartido/reciclado; agencia/huésped; empleado cliente; grupo; dos tenants; opt-out/reimportación; merge/split; tag vencido; pago sin reserva; conocimiento obsoleto; experiencia sin cupo; villa/evento; TICOS sin residencia; edades 11/12; noches 8/9/30/31; handoff >2h; ráfaga/canales/reintentos.
Cada fixture tiene IDs exclusivamente sintéticos, expected/observed, versión, cohorte, timestamp y resultado. Ejecutar solo suites relevantes y checks obligatorios del repositorio. No pruebas que simplemente repliquen implementación.
Local PASS acredita contrato/lógica local, nunca WhatsApp, Supabase productivo, envío o disponibilidad Kross. Si QA externo no es demostrablemente aislado, no usar simulador; BLOCKED.

## 6. Privacidad, retención y decisiones pendientes
Datos sintéticos locales sin nombres/teléfonos/emails reales; no incluir secretos. No copiar chats históricos o listas de contactos. Consentimiento por propósito/canal/destinatario/negocio, revocaciones preservadas y tags sin autoridad. Supresión técnica externa sigue pendiente de G3.
La matriz de retención numérica debe prepararse con evidencia de obligaciones y aprobarse antes de nuevos flujos reales; aprobación G2 no aprueba borrado ni retención indefinida. Costes/comisiones/contactos internos solo en ámbito interno autorizado.
La contradicción Kross 50/50-7 días vs tarifas 100%-5 días requiere decisión comercial separada de Mauricio. Edades nativas 4–11/adulto12 frente a Kross 4–10/adulto11 quedan pendientes del proveedor/autoridad; no contactar soporte por inferencia.
TICOS se revalida al cotizar. Web niños/edad, SimpleBooking y /es/inicio conservan gates; arreglo propuesto en diff no equivale a publicación autorizada.

## 7. Rollback y condiciones de parada
A: registrar commit base y diff por módulo; revertir solo commits propios sin reset destructivo del trabajo concurrente. Descartar fixtures del lote sintético después de conservar resultados mínimos. Contratos nuevos quedan sin consumidor productivo hasta aprobación posterior.
B: antes de ejecutar, demostrar snapshot/restore de cada objeto, entorno y tenant, métricas pre/post y mecanismo de detener efectos. No tocar sandbox existente sin autorización y baseline de su trabajo. SQL draft deberá tener reverse/compensación revisados; nunca revertir revocaciones, suprimir audit trail o reactivar opt-out.
C: parar únicamente el lote autorizado, conservar rutas ajenas y receipts; restaurar versión por objeto. Ningún piloto sin responsable aceptante y rollback practicado.
Parar ante drift de SHA/hash, side effect inesperado, cruce tenant, exposición interna, activación de campaña, destinatario fuera de alcance, divergencia comercial o falta de aislamiento. Releer/reconciliar; no resolver ampliando permisos.

## 8. Entregables del Paquete A tras G2
1. Diff técnico revisable por módulo en rama, sin merge/deploy.
2. Mapa de reutilización/gaps y decisiones pendientes, enlazado a tasks existentes sin nuevos estados/owners/fechas.
3. Fixtures y resultados locales con PASS/FAIL/BLOCKED/NOT_RUN; consumo E2E separado.
4. Procedimiento de rollback local probado y propuesta concreta G3 con alcance/entorno.
5. Siguiente superprompt de ejecución condicionado a G2, mostrado a continuación.
No calendario nuevo; aprovechar cadencias y checkpoints existentes solo tras sus gates.

## 9. Estado comprobado de esta preparación
PASS: lectura actual PR #258 (open/draft), especificación, Plan General de su rama y cuatro archivos de runtime/evidencia/QA. G1 recibido explícitamente.
NOT_RUN: cambios técnicos, pruebas locales, QA WeSpeak, piloto y rollback técnico.
BLOCKED: G2 aún no aprobado; versión consumida/runtime y fuentes externas pendientes en su alcance.
NO MEDIDO: conversión, autonomía, calidad global, rentabilidad y efecto económico.
Los agregados del 08/10 permanecen como corte histórico, no se presentan como conteos reconsultados hoy.

## 10. Próximo superprompt — usar únicamente tras G2
“Ejecuta solo el Paquete A del plan TORO CRM–TERE–Experiencias G2 aprobado, con marcador CRM-TERE-EXPERIENCIAS-20261008-V1. Lee AGENTS.md y código actual antes de editar; conserva las tareas, contratos y Control Plane existentes. Trabaja en rama aislada, secuencialmente, con fixtures sintéticos y sin datos personales reales. Reutiliza runtime-acceptance/runtime-evidence y sus pruebas; revisa callers antes de endurecer validación. Implementa contratos/mappings propuestos solo como código local y borradores revisables; no apliques SQL ni cambies permisos/conexiones/configuración externa. Prueba tenant isolation, consentimiento/opt-out, merge/split, tags, atribución, handoff, conocimiento y experiencias con los casos G1; no confundir PASS local con E2E. No merge/deploy, publicación, cron, campañas, mensajes, reservas ni cobros. Preserva versiones/hash y trabajo concurrente; registra evidencia/rollback y detente ante ampliación de alcance. Entrega diff, pruebas, bloqueos, receipt y propuesta G3 específica para aprobación.”
