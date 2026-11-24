# TORO — preparación de WhatsApp integral y recepción cloud

**Fecha de la actualización:** 25/11/2026, Asia/Tokyo. Las fuentes y observaciones conservan sus fechas originales; no se rejuvenecen por esta actualización. **Tipo:** documentación/diseño y cola de ejecución; no aceptación del runtime. **Autoridad:** instrucción del propietario en el chat y único [Plan General](../product/TORO_BRAIN_GENERAL_PLAN.md), dentro de `CLOUD_SOURCE_CONNECTOR_PARITY_20261113` y la directiva cloud del 11/11.

## Cambio solicitado y entregable

El propietario confirmó las dos cuentas personal/recepción de TORO Comms y pidió alcance alto en todos sus ámbitos autorizados, información vigente, continuidad sin PC y conexión con TORO, Plan, ChatGPT, Codex y fuentes. Recepción es la prioridad inicial; la definición fina de otros usuarios se difiere, preservando identidad/aislamiento desde el diseño.

Se prepara una actualización coherente en cinco archivos: subsección del programa existente en Plan General; contrato subordinado Same-Brain §14; extensión declarativa del YAML; actualización del plan Same-Brain con ocho paquetes y original íntegro histórico; y esta evidencia. Constitución, marca, código, dependencias, SQL y runtime no cambian. La cola anterior no queda como plan competidor.

El alcance reusable pertenece a Core/Identity/Tools/Systems/Comms/Agents/Projects y User Vault; Dreamcatcher aporta la cartera de recepción dentro de Operations/Guests/Finance/Assets. Se reutilizan `toro_os_portfolio_master`, `toro_executive_control`, `business_truth_bible` solo para su dominio hotelero, `critical_hotel_operations`, `revenue_booking_stack`, `maintenance_assets`, `finance_controls` y los proyectos privados vigentes. No se crean tareas, proyectos, bases o schedulers nuevos.

## Baseline y dependencias conciliadas

| Fuente | Evidencia y límite |
| --- | --- |
| GitHub main | Base exacta `3e9beb4b58582b6415a8ee155a543c7863c78218`, PR415; incluye PR409. El checkout original del 9/11 no se usó como base del cambio. |
| SSM/PR409 | Fusionada; adaptador inactivo, documento fijo y 68 pruebas sintéticas disponibles. No es caller autorizado ni herramienta instalada; siempre devuelve WhatsApp `not_checked`. |
| Lanes abiertas consultadas | PR391/121 worker/admisión L0/L1; PR206/210 bridge/continuidad; PR291 reportes; PR410 contenido huésped; PR362 extracción histórica. Sus estados/heads son cortes documentales; relectura obligatoria antes de consumir código. No se modifica su responsabilidad ni se fusionan por esta unidad. |
| Supabase | SELECT acotado del maestro devolvió `updated_at=2026-11-24T14:55:57.535499Z`; directiva cloud mantiene `OWNER_APPROVED_TARGET_READONLY_TRANSPORT_PREPARED_NOT_CONNECTED` y siguiente unidad AWS/SSM. Es lectura de coordinación, no prueba del Gateway. |
| Auditoría previa del canal | Evidencia puntual del 7/11 de ambas líneas respondiendo; binding genérico positivo sin última sincronización/evento y cero sesiones/receipts en las tablas consultadas el 24/11. No demuestra ausencia de mensajes en otros sistemas ni salud actual del host. |
| Vercel/Airtable | Se reutiliza la auditoría del 24/11: producción Portal distinta de main; metadata de env Vercel403; perfiles/fuentes Airtable no acreditan adopción. No se repite su inventario ni se cambia configuración. |

La guía antigua del plugin Master Brain todavía llama principal a Airtable. Se conserva la resolución explícita a favor de contratos GitHub y runtime Supabase; corregir la distribución de esa guía pertenece a su carril, sin convertir el YAML de este cambio en prueba de adopción.

## Verificación de la preparación

- `git diff --check`: PASS en el delta documental.
- YAML completo con loader que rechaza claves duplicadas: PASS; se comprobaron referencias, tres prioridades y ausencia de activación/expansión de permisos en el nuevo bloque.
- `npm run test:portfolio-map`: 15/15 PASS.
- `npm run test:openclaw-host`: 68/68 PASS, incluidos SSM y diagnóstico dual; ningún comando AWS o WhatsApp real.
- `npm run lint`: exit0, sin errores; advertencia existente de `request` sin uso en la route de metadata OAuth. Ningún archivo de código cambia.
- `npm run build` local: bloqueado por Turbopack al resolver el symlink compartido de `node_modules` fuera del root del worktree. No se altera configuración para esconderlo.
- `npm run build -- --webpack`: compilación PASS; typecheck falla en `.next/types/app/portal/page.ts:39` por `PortalPage` con props opcionales `undefined`. `src/app/portal/page.tsx` conserva blob `fb11ff4a36a489b4b4a087379e4362d837c35d4b`, idéntico a main. Una revisión independiente reprodujo exactamente TS2344/exit1 en worktree DETACHED limpio de `3e9beb4b58582b6415a8ee155a543c7863c78218`, sin copiar `.env`: compilación PASS en12s y mismo error de props. El fallo es previo a este delta; no se anuncia build aprobado. CI del candidato se consulta en su PR.
- Revisión independiente del diseño: sin preguntas materiales faltantes; las decisiones de host, identidad, proveedor/modelo y presupuesto están tratadas como dependencias verificables.
- Revisión independiente del delta completo: corregida una instrucción ambigua para que rutas reales y comando del bridge se guarden únicamente en el checkpoint privado; el plan público conserva referencia/hash/estado. Sin otros defectos materiales observados en el alcance documental revisado.

La revisión de documentación y los tests sintéticos no acreditan información PMS vigente, emisor, aislamiento efectivo, restauración ni PC-off. El gate técnico de integración sigue abierto por capacidad. La PR conserva revisión y CI; un fallo previo de main no autoriza omitir checks o publicar producción.

## Continuidad, intervención humana y reversión

Siguiente unidad: recuperar acceso seguro AWS al Lightsail existente, conciliar enrolamiento/manifiesto y conectar el caller acotado preparado, con una lectura positiva/negativa y receipt. En paralelo pueden prepararse lectores, fixtures y pruebas de recepción/Builder sin activar sus efectos. El otro chat del propietario no se identificó con certeza en la auditoría anterior; título/ID y acceso son dependencias distintas, no motivo para crear otro chat o escritor.

Intervenciones posibles: autenticación segura AWS/proveedor y MFA/relink; decisión de alcance ambiguo; presupuesto monetario finito para nuevo consumo; aceptación del responsable operativo. No se piden ni copian secretos. No se activan por este documento IAM, grants, Writer Alegra, API Kross pagada, nuevos usuarios/negocios externos, mensajes, reservas, pagos, modelos o workers.

El coordinador debe consumir el nuevo Plan por referencia exacta, versión/hash y ACK; la edición de GitHub no escribe ese ACK. Los receipts rutinarios siguen en objetos privados existentes. Revertir únicamente esta PR documental devuelve la dirección/cola previas sin borrar estado de negocio, tocar cuentas, cambiar producción ni sobrescribir otros carriles.
