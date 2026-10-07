# TORO — SUPERPROMPT DE CONTINUACIÓN V4
**Proyecto:** Los 50s de Caro
**Fecha de estado:** 2026-10-07
**Responsable técnico:** TORO / OpenClaw / SOBRESITO / Builder-Codex
**Issue canónico:** #246

Continúa desde este estado REAL. No reinicies análisis, no dupliques identidad, comunidad, Event Ops ni OpenClaw. Ejecuta primero lo que desbloquea pruebas E2E; no contactes familiares reales hasta aprobación final.

## HECHO y fusionado a TORO main
1. PR #247 → commit `4233b51`: invitaciones criptográficas individuales, HMAC SHA-256, token aleatorio de 256 bits, expiración, scope, replay/revocación y transición `issued → claimed_pending_verification → verified`. CI/Workstation/Vercel pasaron. SQL de invitaciones quedó REVIEW-ONLY y NO aplicado.
2. PR #248 → commit `94ade867`: identidad de miembros del evento reutilizando `auth.users/public.app_users`; autorización por usuario + org + evento + rol; self-only; denegación cross-user/cross-org/cross-event; líder familiar limitado a menores bajo su tutela; participante sin admin. CI tests/lint/build + Workstation Health + Vercel pasaron. SQL de membresía REVIEW-ONLY y NO aplicado.
3. Website producción: `dreamcatcherhotel.com/los50sdecaro`, `/invitacion`, `/inscripcion`, `/comunidad`. General/Mi grupo existen; posts/fotos/likes compartidos permanecen bloqueados.
4. Supabase existente `abtyrbqlqbsastmridzp`; evento `los50s-caro-2026`, org Dreamcatcher. Reutilizar estructuras; no crear segunda base.
5. TORO ya tiene patrón probado de canal para empleados: `employee_channel_enrollments` + `employee_channel_identities` con HMAC, consumo atómico, RLS, service-only. Generalizar el patrón a event members en vez de copiar identidad de empleados.
6. OpenClaw continúa `CONFIGURED_UNVERIFIED`: documentación/CI no demuestra Gateway WhatsApp real.

## Estado de datos observado
- Lista histórica del website: 45 personas, 35 marcadas "Confirmado" y 10 "Preinscrito".
- `los50s_registrations`: 4 formularios.
- `los50s_participant_ops`: 3 perfiles materializados.
- `los50s_room_assignments`: 3 filas/placeholders.
- `los50s_transport_manifest`: 12 legs observados previamente.
- `los50s_payment_ledger`: 0.
- `auth.users/app_users`: 5 usuarios generales TORO, no equivalen a 5 invitados del paseo.
Nunca mezclar estas métricas ni presentar la lista histórica como identidad verificada.

## Próximo resultado requerido
Demostrar con datos sintéticos/reversibles el flujo completo:
`invite emitida por admin → token válido → auth OTP → identidad TORO verificada → claim atómico → event membership → community permission`
y luego demostrar:
`WhatsApp owner → OpenClaw → TORO identity → canonical action → receipt → respuesta owner`.

## Orden obligatorio

### P0.1 — Contrato transaccional de claim
- Revisar drafts `20261007_los50s_invitation_identity_review_only.sql` y `20261007_los50s_event_members_review_only.sql`.
- Crear función/route server-only para consumir invite atómicamente.
- Debe comprobar: token hash, status issued, expires_at, org/event/participant, auth.uid/app_user, identidad TORO verificada, receipt; un único ganador ante doble submit.
- Fallar sin revelar si otro participant_ref existe.
- No SECURITY DEFINER público; permisos explícitos y mínimo privilegio.
- Probar token correcto, incorrecto, expirado, revocado, replay, dos usuarios, dos eventos, dos organizaciones, adulto ajeno y menor/tutor.
- Ensayar SQL dentro de transacción revertida antes de aplicar.

### P0.2 — Auditoría OpenClaw real
- En host autorizado ejecutar runbook `docs/runbooks/TORO_OPENCLAW_RUNTIME_AUDIT.md` y `node scripts/openclaw-host-diagnostics.mjs`.
- Evidencia sanitizada: runtime/version, live WhatsApp probe, dmScope per-account-channel-peer cuando aplique, ACL/grupos, bindings, least privilege, security audit, replay/idempotency, recovery.
- No pegar QR/tokens/logs privados.
- Si no hay acceso host: BLOQUEADO y no simular.

### P0.3 — Auth/OTP
- Usar Supabase Auth actual; no crear login paralelo.
- Magic Link/OTP solo con redirect allowlist correcta, rate limits y sesión segura.
- Link de invitación nunca basta para autenticar.
- No vincular por nombre, teléfono escrito o WhatsApp display name.
- Para WhatsApp, subject hash verificado se vincula al user/member solo después del flujo aprobado.

### P1 — Comunidad persistente
Después de P0:
- posts, comentarios/hilos, likes idempotentes, apodos moderados;
- fotos privadas en Storage con MIME/contenido/tamaño, EXIF, consentimiento menores, report/takedown, signed URLs;
- RLS/event membership; anon no lee comunidad;
- General separado de Mi grupo;
- no teléfonos/vuelos/alergias/pagos globales.

### P1 — Admin
- owner/admin y coordinador con rol TORO; MFA recomendado;
- cada mutación con actor, timestamp, before/after, motivo y receipt;
- habitación/pago/transporte siguen privados;
- no admin por nombre, invite token o frontend flag.

### QA obligatorio antes de familiares
- owner + segundo usuario controlado, dos navegadores/dispositivos;
- IDOR/BOLA, token robado/replay/expiry/revoke;
- publicación y foto visibles entre miembros, invisibles a anónimo;
- rollback probado;
- 390/412/1440;
- website hotel /es, /es/stays y booking sin regresión;
- WhatsApp owner-only E2E con receipt.

## Mensaje futuro — BORRADOR, NO ENVIAR
“Familia, serán de los primeros usuarios de TORO, que nos ayudará a coordinar Los 50s de Caro. Está en pruebas: agradecemos paciencia y que reporten los errores. Compartiremos enlaces personales cuando todo esté verificado.”

## Salida obligatoria
1. HECHO con PR/commit/test/deploy/evidencia.
2. BLOQUEADO con dependencia y responsable.
3. DESCONOCIDO cuando falte observación.
4. Riesgos/anomalías encontrados y correcciones.
5. Tres siguientes acciones P0/P1 con responsable y criterio terminado.
6. Termina con **SUPERPROMPT SIGUIENTE V5**, actualizado con hechos reales de esa corrida.

Nunca emitas invitaciones reales, migres permisos, envíes WhatsApp a familiares, expongas secretos o declares OpenClaw activo sin evidencia verificable.
