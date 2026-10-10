# TORO CRM, TERE, conocimiento y experiencias — especificación para aprobación
Marcador: CRM-TERE-EXPERIENCIAS-20261008-V1
Fecha: 08/10/2026, America/Costa_Rica. Estado: PROPUESTO; diagnóstico documental y agregados, no autorización de implementación.

## 1. Resultado y alcance
Una atención coherente al huésped por TERE y al empleado/propietario por TORO, con contactos y relaciones trazables, conocimiento vigente y experiencias verificables. Reutilizar el Plan General único, Supabase canónico, Kross comercial, Airtable proyección/referencia y Dropbox soporte documental. No nueva base, inbox, motor de tareas, calendario, campaña o automatización. La conversación no concede autoridad.

Este documento define contratos y aceptación. No constituye plan de implementación ni selección de método de ejecución. Gates secuenciales: G1 aprobación de esta especificación; G2 preparación y aprobación separada del plan y método de ejecución; G3 QA aislado autorizado; G4 piloto específico. Campañas, publicación, permisos, contacto externo y transacciones conservan autorización propia.

## 2. Evidencia y límites del diagnóstico
S1: Plan General leído en main d4769e0958e1a1400d57acc2d61355be50030c84, blob c0acb1d19ca17ee233c71f62c57f8f2051976f21.
https://github.com/Dramcatcherst/Toro-OS/blob/d4769e0958e1a1400d57acc2d61355be50030c84/docs/product/TORO_BRAIN_GENERAL_PLAN.md

S2: consultas SELECT de catálogo, columnas, documentación y agregados del proyecto operativo abtyrbqlqbsastmridzp el 08/10/2026. No lectura ni exportación de contactos o chats. Guests 33; reservations 33; mirrors 33; live 0; último snapshot 2026-09-21T09:28:30.675Z; guest_consents 0 registros. Son conteos observados, no ocupación vigente ni opt-in acreditado.

S3: catalog.experiences: 85 activos = 7 ready/verified + 76 review/needs_verification + 2 review/verified. Ningún estado prueba precio, cupo o disponibilidad actual. Catálogo nativo: experience_categories, local_recommendations y dining_services; no crear una tabla categories por usar un nombre conceptual.

S4: cuatro contratos de knowledge_items leídos: toro_core_business_relationship_contract_v1, toro_core_work_object_contract_v1, toro_core_offering_contract_v1, toro_core_commercial_order_contract_v1. Estado registrado DESIGN_CANONICAL_NOT_IMPLEMENTED. Conservan modelos verticales mediante mappings, tenant-local references y gates de activación.
Borrador SQL leído, no ejecutado:
https://github.com/Dramcatcherst/Toro-OS/blob/d4769e0958e1a1400d57acc2d61355be50030c84/supabase/drafts/20260929_toro_core_portability_contracts.sql
Core parties/relationships/external_references ausentes del catálogo operativo y presentes en dreamteam-recovery-sandbox. Presencia en sandbox no acredita producción, permisos seguros, conexión o uso. Los negativos del 29/09 están reportados en los contratos; no se repitieron ni se consideran QA de este delta.

S5: siete tasks leídas por clave exacta, con descripción y bloqueos. Todas ya contienen este marcador; no duplicar anotaciones. DC2-040 no localizado como clave/nombre independiente en búsqueda acotada: vínculo con la tarea CRM pendiente de resolver, no inexistencia global.

| Tarea existente | Estado registrado | Lectura actual |
| --- | --- | --- |
| toro_core_relationship_work_abstraction_20260929 | in_progress | Diseño Core leído; instalación operativa pendiente |
| wespeak_crm_reactivation_attribution_20260826 | blocked | Gate fuente P0 MIGRAR preservado; campaña no autorizada |
| wespeak_apply_compact_tere_context_2026_09 | blocked | Falta evidencia post-V4 y versión/hash consumido |
| wespeak_weekly_conversation_qa | blocked | Configuración documentada accesible; cobertura/runtime/outcomes siguen pendientes |
| knowledge_sweep_tere_2026_09 | planned | Fuentes humanas/físicas y verificación vigente pendientes |
| toro_connector_learning_runtime_20260929 | planned | needs_revalidation=true; sin prueba operativa completa |
| owner_attention_comms_payflow_portal_openclaw_20260928 | planned | Portal/OpenClaw E2E pendiente; needs_revalidation=true |

S6: metadatos de automatizaciones leídos el 08/10. QA semanal lunes ~08:00, mensual día 1 ~09:00, Correos y Pagos diario 08:00, Estado TORO viernes 17:00, hora Costa Rica. Las cuatro figuran is_enabled=true, last_run_time con fechas registradas y next_run_time=null. Esto supersede solo la imposibilidad de consultar configuración: ejecución futura, contenido de runs y entrega no verificados. No se creó ni modificó schedule.

S7: contexto verificado aportado por Mauricio en este prompt: 44 tags, 42 autoasignables, 32 con instrucciones; 23 preguntas de entrenamiento y 61 plantillas; readbacks de GROUPS, TICOS e Información Extra; términos Kross y gates web. No reinspeccionados en esta ronda. Confianza: alta como baseline aportado, verificación independiente actual pendiente. No atribuir coherencia E2E al readback.

Para cualquier afirmación: source_ref, source_authority, observed_at, effective_from/to, evidence_ref, confidence, verification_status y versión/hash cuando aplique. S1–S6: evidencia directa dentro de su alcance; S7: evidencia aportada. Distinguir diseñado, instalado por entorno, conectado, leído, probado y operativo; ninguno implica el siguiente. PR206/210 y CI no acreditan WhatsApp.

## 3. Contrato de identidad y relaciones
| Concepto | Significado y reutilización |
| --- | --- |
| Contacto | Referencia mínima de comunicación; no identidad autenticada |
| Persona | party de tipo person, diseño Core existente; guests sigue siendo especialización hotelera |
| Organización comercial | party organization para agencia/proveedor/cliente; puede tener varios representantes |
| Tenant | Organización de seguridad; no se confunde con empresa contacto |
| Punto de canal | Teléfono/email/cuenta con origen, verificación y vigencia; puede ser compartido o reasignado |
| Relación | Papel con un negocio y alcance temporal; huésped y proveedor pueden coexistir sin unir permisos |
| Actor autenticado | Principal verificado con membresía/capacidad vigente; jamás otorgado por tag o teléfono |
| Grupo | Objeto/contexto de reserva o caso; no party person |

Reutilizar channel_identity/external_reference y work_relation del diseño existente. Una relación vincula persona/organización, reserva, estancia, caso y representación con scope explícito, provenance y effective_from/to. Gap a revisar: el borrador SQL aún no implementa todos los campos conceptuales ni los vínculos con alcance; no inventar cobertura instalada. No forzar grupos dentro de person u organization. Mantener relación, intención, oportunidad, reserva, caso, idioma y consentimiento como ejes distintos.

Deduplicación: clave tenant + sistema + tipo + ID estable, con comprobación explícita. Nombre parecido, email o teléfono coincidente crean candidatos, nunca merge silencioso. Merge/split propuesto con decisión, evidencias, versión previa, redirect reversible, historial de vínculos y auditoría. Preservar fuentes, atribución, revocaciones y supresiones; no copiar grants ni elevar autoridad. Split restaura mappings comprobados y conserva supresión hasta resolver alcance; nunca reactiva marketing. Dos tenants no se fusionan.

## 4. Clasificación, consentimiento y privacidad
Tag controlado o candidato inferido: key, owner, version, evidence_ref, inferred/declared, captured_at, expires_at, review_status y ámbito. Tags sugeridos solo para routing operativo, intención declarada, idioma solicitado, proceso/handoff e interés en dominio; sin etiquetas sensibles, datos de menores, nacionalidad deducida del teléfono o inferencias discriminatorias. Expiración invalida inferencia, no borra opt-out.

Precedencia: permisos/supresión > autoridad/frescura > proceso/handoff > clasificación > estilo. Ningún tag concede identidad, descuento, acceso, consentimiento o envío. LEADS no habilita seguimiento de autoemails, empleo, voluntariado o proveedores. Ganado es candidato hasta evento comercial Kross enlazado; mencionar pago no acredita venta nueva ni cobro conciliado.

Consentimiento: propósito + canal + destinatario + negocio + evidencia + otorgamiento/revocación/vigencia. Reutilizar guest_consents y evaluar gaps frente a ese contrato. Los booleanos en guests son referencia heredada, nunca suficientes sin evidencia acotada. Reserva, contacto conocido, bot activo o relación no equivalen a marketing opt-in. Reimportación, merge, tag y reactivación preservan opt-out; supresión se aplica y prueba inmediatamente antes del envío autorizado. Eliminación de datos usa proceso separado.

Retención propuesta, pendiente de decisión: definir matriz por objeto/propósito con owner, plazo aprobado, base documental y excepciones; no imponer plazo legal ni borrado desde este documento. Candidatos e inferencias expiran por fecha; consentimientos/revocaciones conservan evidencia mínima para evitar reactivación; relaciones conservan historia necesaria; conversaciones completas no se copian indiscriminadamente. Solicitudes de borrado se verifican, identifican obligaciones aplicables y dejan receipt mínimo sin reproducir PII. Plazos numéricos y política aprobada son gap bloqueante para activar nuevos flujos de datos. Acceso mínimo por rol, sin costes/comisiones/contactos internos en vistas huésped.

## 5. Experiencias y conocimiento
Curación propuesta pequeña por yoga, surf, naturaleza, gastronomía y transporte dentro del catálogo existente; no aprobación de alianzas/promociones. Proveedor/responsable verificado mediante referencias internas de solicitudes/fulfillment, fuera de catalog.experiences: su comentario prohíbe identidades de proveedores, contactos, costes y comisiones. Mantener ficha pública y evidencia operativa separadas según contratos existentes, sin otra base.

Ficha elegible: fuente/fecha/vigencia, responsable interno verificado, duración, horario, idioma, ubicación, cupo, inclusiones/exclusiones, precio/moneda/impuestos, cancelación y condiciones. Cada desconocido queda explícito. La selección no se publica ni promete cupos; ready/verified no habilita compromiso comercial.

Acciones distintas: recomendar información revisada; derivar por enlace público revisado; solicitar disponibilidad; reservar. Derivación con datos, contacto a proveedor, cobro, cancelación o reserva requieren autorización y evidencia correspondiente. Interés declarado + contexto temporal + follow-up permitido se vincula al CRM; sin venta adicional automática ni perfiles sensibles.

Reutilizar knowledge_items: separar hecho, política y estilo; versiones con procedencia/vigencia; manifiesto de central, tags, embudos, Información Extra y controles nativos. Contenido claro ES/EN, enlaces oficiales y cero instrucciones internas al huésped. Deduplicar semánticamente las 23 preguntas en la cola existente, revisar antigüedad, verificar, aprobar y probar antes de enseñar; 61 plantillas no equivalen a 61 aprobadas. No cargar toda la historia. Readback prueba guardado; versión/hash consumido y comportamiento posterior son gates separados. TERE, TORO, SKY, RICO y FIONA heredan idénticos límites de fuente y permisos.

## 6. Atención, vista 360 y ejecución
Vista 360 por rol: referencias mínimas de persona/organización/reserva/estancia/caso, fuente/fecha/conflictos, permiso aplicable y siguiente acción. No agregar PII por conveniencia. Reutilizar communication_followups/tasks para próxima acción; una tarea canónica por acción.

Handoff: motivo, owner emitido, owner aceptante, accepted_at, próxima acción/plazo y devolución explícita al bot. Dos horas no libera caso humano abierto. Agrupación de 10 segundos y dedupe entre canales siguen pendientes de probar. Claves idempotentes por tenant+evento+acción; lease/fencing y verificación de versión antes de editar; readback y receipt con side effects y evidencias. No duplicar Control Plane.

«Solo Recepción» y vigencia corresponden exclusivamente al lote WeSpeak operativo autorizado. No alterar rutas financieras, personales ni urgentes; no históricos ni nuevos destinatarios. Selector cerrado y lote persistente son propuesta. Un único editor por objeto y comparación de versión antes de integrar delta; conflicto implica releer y reconciliar, no sobrescribir.

## 7. Autoridad comercial y gates web
Baseline aportado: TICOS 10%, residencia Costa Rica acreditada sin inferir por teléfono, online y no WhatsApp, mínimo 1 noche, DREAM RATE/DREAM+BREAKFAST, habitaciones numeradas y Mini Room; excluye Dreamcatcher Villa y Villa Toro. Promoción 18/04/2026–31/05/2027; llegadas 18/04/2026–31/12/2027. Revalidar al cotizar y no inventar acumulación.

Kross Baby 0–3, Child 4–10, Adults 11+; WeSpeak 4–11/adulto12 es conflicto pendiente. No afirmar corrección nativa ni contactar proveedor sin permiso. Capturar/confirmar edades antes de cotizar; no almacenarlas como tags. Cotizar hasta 30 noches inclusive; villa no equivale a evento.

Condiciones generales 50/50 y 7 días frente a tarifas 5 días/100%: propietario debe decidir aplicabilidad por producto/tarifa; no elegir desde este documento. Flujo niños hacia motor puede mostrar 0 años; CTA SimpleBooking no disponible y /es/inicio 404 son gates pendientes. No publicar ni declarar links correctos antes de QA.

## 8. Aceptación y QA propuesto, no ejecutado
Cada caso registra fixture sintético, entorno aislado, versión/hash, resultado esperado/observado, evidencia, efectos secundarios y rollback. No huéspedes reales. PASS exige comprobación; FAIL discrepancia observada; BLOCKED dependencia ausente; NOT_RUN no ejecutado; NO MEDIDO ausencia de medida.

| Caso sintético | Resultado exigido | Estado |
| --- | --- | --- |
| Teléfono compartido/reciclado; agencia frente a huésped | Candidatos separados, sin acceso ni merge implícito | NOT_RUN |
| Empleado también cliente; grupo | Roles con alcance; grupo no persona; grants intactos | NOT_RUN |
| Dos tenants | Lectura, escritura y referencias cruzadas rechazadas | NOT_RUN |
| Opt-out/reimportación/tag/reactivación | Ningún envío; supresión preservada y probada | NOT_RUN |
| Merge/split | Historia/atribución/supresión restaurables; permisos intactos | NOT_RUN |
| Tag vencido; conocimiento obsoleto | Inferencia inválida; hecho no cotizable sin revalidación | NOT_RUN |
| Pago mencionado sin reserva | Ninguna venta nueva acreditada | NOT_RUN |
| Experiencia sin cupo | No confirmación ni cobro; solicitar disponibilidad con autorización | NOT_RUN |
| Villa frente a evento | Villa cotizable verificada; evento conserva handoff | NOT_RUN |
| TICOS sin residencia acreditada | No conceder elegibilidad por teléfono/tag | NOT_RUN |
| Edades 11/12 | Aplicar autoridad Kross actual tras capturar edades; conflicto visible | NOT_RUN |
| Noches 8/9/30/31 | 8,9,30 cotizables; 31 detiene/escalada según política | NOT_RUN |
| Caso humano >2h; ráfaga/canales/reintento | Sin liberación automática ni pregunta/envío duplicado | NOT_RUN |
| Web ES/EN, edades, condiciones y CTA | Contexto íntegro y política/enlaces aprobados | BLOCKED |

Aceptación global: cero filtraciones cross-tenant, cero permisos por tags, cero pérdida de opt-out, cero transacciones/envíos/publicaciones no autorizadas; comportamiento esperado de casos y receipts; misma cohorte y fuente suficiente. Son umbrales propuestos, no resultados medidos.

## 9. Medición y revisión existente
Medir clasificación correcta/casos revisados; consentimientos vigentes/destinatarios propuestos; handoffs aceptados/emitidos; duplicados/eventos recibidos; reservas verificadas/oportunidades elegibles. Experiencias: interés, solicitud, aceptación, reserva y realizado separados. Misma cohorte, intervalo, reglas, versión y denominador; numerador o denominador faltante = NO MEDIDO, nunca cero. No causalidad por tags, autonomía por cierre humano o rentabilidad sin costes/resultados.

Reutilizar QA semanal/mensual, Connector Learning y disparadores de correo. Comparación incremental Kross/web ES-EN/WeSpeak capas/TORO/Airtable/Dropbox por objeto, autoridad, fecha y versión. Cambio material → tarea existente → QA/aprobación → readback → checkpoint. No reprocesar baseline ni crear revisión diaria/eventos paralela; controles faltantes son propuesta.

## 10. Impacto, dependencias, rollback y decisión
Impacto esperado no medido: menos seguimiento incorrecto, cotizaciones más fiables y mejor selección de experiencias sin multiplicar sistemas. Prioridad propuesta: identidad/supresión/autoridad; handoff y consumo de conocimiento; experiencias curadas. Responsable ejecutor sigue el asignado en cada tarea; aprobación de gates corresponde a Mauricio. No se cambian estados, owners o fechas.

Gaps: mapear DC2-040, instalación/mappings Core operativos, retención aprobada, runtime/hash TERE, aislamiento del simulador, supresión técnica, fuente Kross vigente, política por tarifa y web, autorización piloto y OpenClaw E2E. Independencia documental no habilita ejecución.

Rollback documental: retirar únicamente este delta por marcador y su referencia, preservando modificaciones concurrentes. No duplicar anexos ya presentes en tasks. Rollback futuro a diseñar tras G1: snapshot/versiones previas, reversión por objeto y tenant, cancelar cola del piloto sin reactivar opt-out, restaurar mappings y mantener auditoría; aceptación requiere comparación antes/después y cero efectos residuales. Ningún rollback técnico ejecutado aquí.

Resultado de esta revisión: PASS lectura de siete tareas y contratos, agregados y catálogo operativo/sandbox; PASS prevención de duplicación del marcador; BLOCKED identificación independiente DC2-040 y gates operativos; NOT_RUN QA/piloto; NO MEDIDO métricas de comportamiento/negocio. No FAIL técnico atribuible al runtime actual sin prueba.

Decisiones nuevas requeridas: aprobar esta especificación (G1); luego aprobar plan/método (G2); definir retención y política comercial conflictiva antes de flujos dependientes; autorizar separadamente piloto y acciones externas. Aprobar G1 no concede los gates siguientes.
