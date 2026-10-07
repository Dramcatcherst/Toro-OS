# SUPERPROMPT SIGUIENTE — TORO / OpenClaw / Los 50s de Caro
**Versión:** V3 · 2026-10-07
**Ámbito:** TORO identidad + TORO Comms + TORO Builder + Dreamcatcher Event Ops
**Fuente de trabajo:** https://github.com/Dramcatcherst/Toro-OS/issues/246

Actúa como director técnico de ejecución de TORO y operador de OpenClaw, sujeto a la Constitución, Plan General y normas de seguridad vigentes de TORO. Continúa el proyecto Los 50s de Caro desde su estado REAL. No repitas el diagnóstico inicial ni dupliques módulos. No declare "hecho" ningún flujo sin pruebas y recibos.

## Contexto confirmado
- Sitio publicado: `https://dreamcatcherhotel.com/los50sdecaro`.
- Invitación general: `/los50sdecaro/invitacion` (informativa, no identifica al humano).
- Inscripción: `/los50sdecaro/inscripcion`.
- Comunidad: `/los50sdecaro/comunidad` con pestañas General/Mi grupo, prototipo local de posts, fotos y likes, **sin publicación compartida ni permisos admin**.
- GitHub: `Dramcatcherst/dreamcatcher-website-vnext`, producción `codex/website-progress-20260924`; TORO canónico `Dramcatcherst/Toro-OS`, main.
- TORO issue #246: piloto privado OpenClaw/WhatsApp, invitaciones vinculadas y contenido compartido seguro.
- Supabase existente `abtyrbqlqbsastmridzp`, `los50s-caro-2026`, `org_id=595801ce-2895-4d91-81ae-e8d1d5cc8593`: `los50s_registrations`, `los50s_participant_ops`, `los50s_room_assignments`, `los50s_transport_manifest`, `los50s_payment_ledger`.
- A fecha de revisión: 45 en lista preliminar (35 marcados confirmados, 10 preinscritos); 4 formularios recibidos; 3 perfiles materializados, 3 registros de habitación, 12 traslados, 0 pagos. Son métricas diferentes: **NO** presentarlas como 45 identidades verificadas.
- OpenClaw se conserva en estado `CONFIGURED_UNVERIFIED` hasta auditoría real de host, prueba de WhatsApp y receipts.
- Rama TORO ya creada: `feat/los50s-invite-identity-gates-20261007`. Incluye `src/features/event-ops/los50s-invitation-security.ts`, tests y draft SQL en `supabase/drafts/20261007_los50s_invitation_identity_review_only.sql`. No hay migración aplicada ni tokens enviados.

## Resultado final requerido
Cada invitado recibe **su enlace individual y verificable**, queda vinculado a su `participant_ref` existente, se identifica tras un segundo factor/OTP y puede participar en comunidad General, Mi grupo y WhatsApp sin suplantación ni filtración de datos. TORO coordina vuelos, alojamientos, transporte, agenda y novedades con permisos por rol. OpenClaw actúa como canal/worker, no como segunda base de datos o identidad.

## Ejecuta en este orden, sin saltarte gates

1. **Verifica el runtime de OpenClaw en el host autorizado.** Usa `docs/runbooks/TORO_OPENCLAW_RUNTIME_AUDIT.md` y `node scripts/openclaw-host-diagnostics.mjs`; captura únicamente evidencia sanitizada. Comprobar estado real del gateway, WhatsApp live probe, sesión aislada por remitente, ACL de grupos, bindings, tool policy, replay, backups, human handoff y restauración. Si no hay acceso al host, marca BLOQUEADO sin fingir conexiones.
2. **Revisa y prueba la rama de invitación.** Haz `npx vitest run src/features/event-ops/los50s-invitation-security.test.ts`, lint, typecheck y análisis de seguridad. Corrige fallos. Revisa borrador SQL; aplica migración solo con respaldo y autorización, sin publicar privilegios `anon`/`authenticated`.
3. **Identidad única TORO.** Reutiliza identidad y scope graph. Implementa JWT/OTP con control de propietario y asociar `participant_ref` existente de forma transaccional: `issued → claimed_pending_verification → verified`. Enlace único de 256 bits, 24h de vigencia inicial, solo hash HMAC en la base, revocable y limitado; no aceptes `?name=`, `?id=p035`, WhatsApp display name o número escrito como prueba. Protege menores con tutor. Un enlace robado no puede editar nada.
4. **Fuente de verdad.** Reconciliar 45 invitados históricos con 4 formularios registrados; mostrar estados separados: invitado, preinscrito, formulario recibido, identidad verificada, confirmado y pago confirmado. No convertir estados históricos en cuentas reales ni crear duplicados.
5. **Comunidad General real.** Posts, comentarios, likes, apodos moderados y fotos con privacidad, RLS, controles de almacenamiento/virus/MIME/tamaño/EXIF, rate limiting, denuncias, moderación y borrado reversible. Nada de fotos de menores sin consentimiento. Publicaciones atribuibles solo a miembros verificados.
6. **Mi grupo.** Cada líder verificado gestiona únicamente familiares asociados; habitaciones solo confirmadas, sin datos médicos, financieros o vuelos expuestos globalmente. Admin real por TORO, jamás por elegir nombre.
7. **WhatsApp/OpenClaw.** Conectar primero prueba propietario → TORO canonical task → Builder/Codex → PR/preview → prueba → receipt → respuesta WhatsApp. No enviar masivamente. No publicar información de hotel interna ni darle a bots invitados privilegios del founder.
8. **QA extremo a extremo.** Probar owner y un segundo invitado voluntario en dispositivos distintos. Enlace válido, expirado, robado, reutilizado, revocado y vinculado al participante equivocado; mensajes/fotos compartidos y privacidad del tercero. Verificar móviles 390/412 y desktop 1440; portada/reservas de hotel sin regresiones. Documentar logs sanitizados, resultados y rollback.
9. **Preparar mensaje piloto (NO ENVIAR):** “Familia, serán de los primeros usuarios de TORO, que nos ayudará a coordinar Los 50s de Caro. Está en pruebas: agradecemos paciencia y que reporten los errores. Compartiremos enlaces personales cuando todo esté verificado.”
10. **Publicación:** abrir a invitados únicamente después de pruebas, moderación y aprobación final explícita del dueño. Usar despliegue por rutas del paseo sin cambios no relacionados a Dreamcatcher.

## Formato de entrega obligatorio
Reporta en una sola respuesta:
- HECHO con enlaces a PR/commits/deploy y evidencia,
- BLOQUEADO (dependencia exacta, responsable, solución),
- DESCONOCIDO si falta prueba,
- anomalías y riesgo de seguridad,
- **3 próximas acciones** con prioridad, responsable y criterio terminado.
- Finalmente: entrega **SUPERPROMPT SIGUIENTE V4**, listo para copiar, actualizado con los hechos reales de esta corrida. Debe continuar el mismo plan sin reiniciarlo.

Nunca comuniques el piloto a familiares reales ni emitas tokens o mensajes WhatsApp sin la aprobación correspondiente. Nunca expongas claves, teléfonos privados, hashes o identificadores internos en un portal público.
