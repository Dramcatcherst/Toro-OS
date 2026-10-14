# TORO Linked Identities and People Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a Mauricio una vista única y verificable de personas, relaciones laborales, cuentas externas y actores no humanos, antes de incorporar nuevos usuarios.

**Architecture:** Mantener Auth/app_users, memberships, employees, mappings de reloj y Control Plane como autoridades existentes. Empezar con inventario y proyección de lectura; generar candidatos de enlace, nunca permisos o fusiones implícitas. DreamTeam conserva sus workflows hasta paridad.

**Tech Stack:** TypeScript/Vitest, Next.js existente, Supabase/Postgres/RLS, parser DreamTeam @e965/xlsx, PowerShell local únicamente para diagnóstico futuro. No nuevas dependencias o servicios por este plan.

**Spec:** `docs/product/TORO_IDENTITY_USER_VAULT_V1.md` §§12–13, subordinado al único `docs/product/TORO_BRAIN_GENERAL_PLAN.md`.

**Revision:** 13/10/2026. Reemplaza el orden del plan histórico22/sept: memberships ya existe; no recrear esa tabla ni ejecutar el backfill antiguo. Historia conservada en Git. Estado INVESTIGATED_PLAN / OWNER_ONLY_PROOF; tareas sin ejecutar.

## Global Constraints

- Mauricio único humano usuario actual; admin@dreamcatcherhotel.com solo suyo. Cada persona futura tendrá cuenta propia.
- No invitaciones, grants, fusiones, migraciones productivas, agentes activos o cambios de dispositivo mientras se investiga.
- No production identity auto-link by name.
- No personal User Vault data visible to organization ADMIN/RRHH/GERENCIA by default.
- No DreamTeam retirement before parity and rollback evidence.
- No User Vault ingestion before RLS tests pass.
- Branch-first/PR-first; no merge/release sin evidencia requerida.
- Mantener formatos/restricciones del parser existente; no usar test sintético como prueba de usuario real.
- Cuenta/empresa de proveedor + external_id forman identidad externa; connector link_id es transporte, no persona.
- Planifica cambios de permisos/ciclo de vida por unidad posterior, no como efecto del índice.

## Review Focus

1. Alias reciclado o homónimo en reloj: no fusionar por nombre; mapping temporal inequívoco y mismo ámbito.
2. Misma persona con varias cuentas y contextos: distinguir relación de cuenta, identidad y permiso; no filtrar datos anteriores al cambiar contexto.
3. Agente con actor_ref arbitrario: no convertir etiqueta en autenticación ni heredar rol humano.
4. Fuente ausente, error dentro de isError=false o paginación parcial: cobertura explícita, no cero inventado.
5. Importación parcial, duplicada, reloj desajustado o archivo con fechas futuras: análisis separado de commit, sin pago ni corrección automática.

## Evidence and dependencies

TORO main inspeccionado090bc54227c8f58895920ac5680f878250f12062; DreamTeam árbol fijado en la investigación. Lecturas:6cuentas,12empleados activos/5vinculados,5memberships/18roles,1rol sin membresía;12perfiles Airtable y0Supabase employment_profiles. Reloj:13mappings,11/12activos cubiertos,1642punches,6imports y0ambigüedades temporales de ese lote. Cuenta Dropbox y listados acotados comprobados; originales/ACL no certificados. Alegra muestra1por conexión, Nómina404en3conexiones, POSlista vacía sin estación explícita. No cobertura general de usuariosAlegra.

Mauricio confirmó descarga manual mediante llaveUSB, reloj sin marca conocida y posibilidad de conectarlo alPC; no sabemos si la conexión es USBdatos, red, serial u otro modo. Excel DreamTeam anunciado y pendiente de recibir. Windows screenshots: discoC235GB/0bytes libres. No sesión local ni perfilesChrome inspeccionados. Resolver esos requisitos no autoriza borrados o cambios del reloj.

DreamTeam vive en `Dramcatcherst/dream-team` y comparte datos canónicos con Supabase. Parser `src/lib/hr/time-clock.ts`: TXT/CSV/TSV/XLS/XLSX/ODS; UTF8 con fallbackWindows1252, default duplicateWindow90s y50000filas/hoja, ambos configurables por env. `src/lib/hr/staff.ts` tiene lista local y fallbackalias. Analyze route usa ese parser; commit route invocaRPCv6->v5->v4->v3->v2. v2 resuelve empleado por mappingorg/reloj/fecha con un único empleado; no elegir personal por alias al guardar. RPC readback no equivale a ejecución del import.

Una importación tiene punchdates posteriores a imported_at local. Causa pendiente: metadata/original/reloj. No «fraude», no refecha ni recálculo automático. OriginalmásnuevoAGL_001.TXT consta en time_imports para16–30/sept, pero bytes/archivo fuente todavía no recuperados.

## Task 1: Inventario reproducible y métricas correctas

**Files**
- Modify TORO: `docs/sql/TORO_IDENTITY_RECONCILIATION_READONLY.sql`.
- Create test: `tests/sql/identity_reconciliation_assertions.sql`.
- Modify spec: `docs/product/TORO_IDENTITY_USER_VAULT_V1.md`.

**Interfaces**
- Input: tablas existentes de identidad/empleados/roles/memberships/mappings, SELECT-only.
- Output: agregado `app_users`, `users_with_active_org_role`, `active_user_org_pairs`, `user_org_pairs_with_multiple_roles`, `roles_without_active_membership`, `active_employees_without_temporal_clock_mapping`; fuente/corte/cobertura.

- [ ] En QA aislada crear fixture:3usuarios; uno sin roles, uno con dos roles enorgA y uno enorgA+orgB. Assert usuariosconrol=2, paresactivos=3, paresmultirrol=1. El SQL actual agrupa porusuario y falla esa semántica.
- [ ] Ejecutar fixture+assertions con psql autorizado aislado, `ON_ERROR_STOP=1`; exigir fallo previo del conteo, no conectar fixture a producción.
- [ ] Corregir SELECT agregando primero pororg+usuario y luego usuarios únicos; incluirmembership y fecha de mapping. No SELECT de nombres/salarios/contactos.
- [ ] Ejecutar assertions:PASS; ejecutar diagnóstico read-only remoto y comprobar totales contra corte, sin afirmar invariantes futuros.
- [ ] Commit de consulta, assertions y evidencia; rollback por revert documental/consulta, ningún dato persistente.

## Task 2: Índice tipado y candidatos de enlace

**Files**
- Create TORO: `src/features/identity-directory/model.ts`, `matching.ts`, `model.test.ts`, `matching.test.ts`.
- Use existing context: `src/features/context/types.ts`, `resolver.ts`.
- Later reader: `src/features/identity-directory/server.ts`, `server.test.ts`.

**Interfaces**
- `IdentityRecord`: subjectKey:string; kind:human|external_party|agent|machine; orgId:string|null; userId:string|null; sourceRef:string; providerAccountKey:string|null; externalKey:string|null; verification:candidate|verified|disputed|revoked; validFrom:string|null; validTo:string|null.
- `matchExternalIdentity(left:IdentityRecord,right:IdentityRecord): "same_verified_binding"|"candidate"|"distinct"`: same_verified_binding solo mismo vínculo ya verificado y cuenta/scope/tipo concordantes; nombre no participa.
- `buildIdentityIndex(records:IdentityRecord[]): {subjects:IdentityRecord[];conflicts:string[]}`: función pura, entradas ya autorizadas; no otorga acceso.
- `loadIdentityDirectory(context:ToroResolvedContext): Promise<{index:ReturnType<typeof buildIdentityIndex>;coverage:{source:string;state:"complete_within_query"|"partial"|"unavailable";retrievedAt:string}[]}>`: usar el tipo ToroResolvedContext ya exportado por src/features/context/types.ts, comprobado en este corte; no duplicar su modelo.
- Reader session/RLS y whitelist de columnas. Si falta transporte autorizado: unavailable; no exponer schema completo ni usar service_role.

- [ ] Tests: mismo nombre/diferenteaccount=>distinct; mismoIDexterno/diferenteaccount=>distinct; mismosaliasreloj/diferentevigencia=>candidate, no merge; human yagent nunca iguales.
- [ ] Tests: scopeA/B y cambio de contexto, fuente parcial/errorJSONaunqueisErrorfalse, sinidentidad/rol=>ningún dato; candidatos no amplían acceso.
- [ ] Run `npx vitest run src/features/identity-directory`;FAIL por módulosfaltantes.
- [ ] Implementar funciones puras y reader acotado, usando clave provisional sinAuth para expediente no vinculado; fuente personal solo propietario autorizado. Sin persistence o DDL.
- [ ] Run mismoVitest, lint dirigido y build existente:PASS. Commit; recuperación retirando nuevo lector/índice y preservando dominios.

## Task 3: Identidad del reloj en preview y guardado

**Files**
- DreamTeam modify: `src/lib/hr/staff.ts`, `time-clock.ts`, `types.ts`, `src/app/api/time-imports/analyze/route.ts`, `commit/route.ts`.
- DreamTeam test: `src/lib/hr/time-import-identity.test.ts`; create `src/lib/hr/clock-mapping.test.ts`.
- SQL: conservarRPCsproductivas; draft+tests solo si un defecto concreto exige cambio.

**Interfaces**
- `resolveClockEmployee(input:{orgId:string;clockEmployeeId:string;localDate:string}, mappings:ClockMapping[]): {state:"verified"|"missing"|"ambiguous";employeeId:string|null}`.
- `ClockMapping`: orgId,clockEmployeeId,employeeId,validFrom,validTo,active,confirmed; en lectura autorizada.
- Parser calcula marcas/duplicados; identidad proviene de mapping y estado de source, no lista/alias en código.
- Analyze y commit deben concordar en employeeId/estado; nunca elevar payrollEligible por mera identidad. Política de asistencia/nocturno se conserva.

- [ ] Tests: empleado vigente; IDreciclado; dosmappingsconflictivos; alias distinto con mismoID; alias igual yIDdesconocido; período medianoche/CR; archivo repetido/períodos disjuntos/solapamiento cerrado.
- [ ] Run `npx vitest run src/lib/hr/clock-mapping.test.ts src/lib/hr/time-import-identity.test.ts`:tests nuevosFAIL; conservar actuales sin afirmar que se corrieron hoy.
- [ ] Introducir resolver puro y mapping autorizado en análisis; eliminar fallback de alias como confirmación automática, conservando alias como etiqueta candidata. CompararRPCv2-readback y ampliar fixtures sin invocarcommit remoto.
- [ ] Recuperar originalconhash y comparar Exceladjunto cuando llegue; marcar discrepanciasfuturedate/source en reporte y bloqueo de recomendación, sin modificar asistencia.
- [ ] Run tests+lint/build DreamTeam:PASS. Commit en carrilDreamTeam y enlacePR281. Rollback vista/adapter, sin reemplazar períodos o reabrir nómina.

## Task 4: Metadata local Chrome/Windows y conexión del reloj

**Files**
- Use TORO existing `scripts/pc-health.ps1`, `pc-health-classifier.mjs`.
- Future create `scripts/local-identity-inventory.ps1` y tests con fixtures de metadata sintética.
- Evidence privada en workspace/archivo autorizado, nuncaGitHub concorreos/SIDs/perfiles.

**Interfaces**
- Script emite objetoJSON version1 con sources/windows_profile/chrome_profiles/clock_connection/collectedAt/coverage; claveslocales opacas y correos omitidos en export para revisión.
- Solo metadata de Windows y perfilChrome Local State/info_cache cuando el propietario lo permita en sesiónlocal. No cookies, Login Data, Secretos, Web Data, almacenamiento de extensiones, contraseñas, synctokens o historial.
- PerfilChrome, syncGoogle y cuentas abiertas enapps son relaciones distintas; ownerconfirmed para enlace estable.

- [ ] Fixtures: múltiplesperfiles, sinmail, metadatacorrupta, rutaausente y ficheroenuso=>partial/unavailable; cero secretos o correos en output compartible.
- [ ] Read-only diagnóstico en PC del propietario cuando exista acceso local; medirlibreCactualantes de export, no intentar volcarGB.
- [ ] Inventariar cómo Windows detecta conexiónreloj, vendor/product ID si disponible, softwareexistente y tipo deexport. No instalar drivers,resetearhora,leerbiometría,borrarusuarios o actualizarfirmware.
- [ ] CompararoriginalUSB con parserTask3; escoger optimización: import asistido delmismoarchivo primero; conexióndirecta solo con protocolo probado y vía de recuperación. No prometer Ethernet/API por existir puerto.
- [ ] Verificación del propietario y evidencia privada; ninguna fusión/limpieza de perfiles por este task.

## Task 5: Alegra y Dropbox como vínculos externos

**Files**
- Extend TORO `src/features/identity-directory/matching.ts`, `server.ts` y sus tests.
- Modify existing manifest/connector contracts donde corresponda; no nuevos usuarios/proyectos por proveedor.

**Interfaces**
- Account scope `providerAccountKey` debe venir de identidad legal/account comprobada, no posición de conector ni primercontacto.
- Fuenteaccount/contact ID + autoridadporcampo + vínculo confirmado. Dropboxfile_ref/metadata requiere ACLverificada para vista; referencias sinACL quedan restricted/unavailable.

- [ ] Tests: contactIDigual en dos empresas=>distinct; dosconectoresmismaempresa=>no duplicar; contactoempresa no es human; payroll404=>unavailable; página1deN=>partial; carpeta«privada»sinACL=>no documento visible.
- [ ] Consultar metadatacuenta/permisos mediante conexión existente; inventario completo solo cuando paginación/empresa se resuelvan. No pasarPayrollColombia como modelo laboralCR por nombre de módulo.
- [ ] Indexar referencias y candidato, comparar IDsfuertes de fuentes existentes; no copiar datoscontables/expedientes ni moveroriginales.
- [ ] Run tests dir/lint/build:PASS. Commit y evidencia; revert índice deja originales intactos.

## Task 6: Actores no humanos verificables

**Files**
- Modify TORO: `docs/product/TORO_ACTOR_AND_SURFACE_REGISTRY_V1.md`, `src/features/control-plane/worker-runtime.ts` únicamente tras revisar consumidor y autenticación existentes.
- Test: `src/features/control-plane/worker-runtime.test.ts`; new `src/features/identity-directory/actor-binding.test.ts`.
- Reuse `data/toro_agent_capability_ownership_v1.json`.

**Interfaces**
- `ActorBinding`: actorKind:human|agent|machine; actorRef; principalRef; responsibleUserId; orgId; allowedActions:string[]; expiresAt; verified:boolean.
- `canBindActor(binding:ActorBinding,requested:{orgId:string;action:string},now:string): boolean`.
- Binding se resuelve de principal verificado server-side; client actor_ref es dato no confiable. Run/lease/fencing/receipt se conserva, no nuevo scheduler.

- [ ] Tests: nombrePUMBA/ADMINoactor_refmanipulado=>deny; expired/revoked/differentorg/action=>deny; agentelector no writes; usuarioresponsable no suplantaactor.
- [ ] Run testscontrol-plane/actorbinding:FAIL porbindingnuevo.
- [ ] Integrar comprobación conauthbridge existente verificado; si no existe principalmachine usable, conservar NOT_ACTIVATED y candidatoen vista, no fabricar grant.
- [ ] Run tests/build:PASS; evidenciaautenticada enQA y replay; commit. No crear empleados humanos/planilla paraagentes.
- [ ] Rollback deshabilita adapter/binding introducido, no altera recibos append-only.

## Task 7: Recorrido del propietario y gate

**Files**
- Existing TORO Portal/MiTORO y contratoPeople, solo tras confirmar direcciónactualmain.
- Tests de directory/context/worker y harness autenticado existente.

- [ ] Mauricio puede ver ficha autorizada, trabajo/proyecto y fuentes externas con coverage; no «activar todos» ni datosdemo.
- [ ] Employee lookup inelegible/duplicado, membershipsuspendida, role revoked y contexto ambiguo fallan cerrado. Segundoactor elegibleQA demuestra negativas.
- [ ] Logout/reset/suspensión/expiración no revive acceso porrefresh; revalidación despuésI/O.
- [ ] Recorrido y recovery pasan antes de proponer una persona piloto con cuenta propia. Margotadministrada porMauricio conserva ámbito/titularidad.
- [ ] Publicar/migrar/alta permanece unidad aparte con evidencia y autorizaciónvigente, no efecto delplan.

## Self-review and handoff

Cobertura: tasks1–7 cubren fuentes, tipos, matching, dispositivo, autoridad y pruebaowner; ausenciaChrome/device/APIusuariosgeneralesAlegra permanece explícita. Índice lectura y actorbinding tienen contratos separados; no compartirAuthcomo empleado, noDDLforzada. FiveReviewFocus cubiertos en tests tasks2/3/5/6/7.

Antes de codificar, fijar commits vigentes y preservar el tipo exportado de contexto, resolverExcel/device pendiente y revisar rutas/transporte; cualquier cambioespecífico delalcance actualiza spec/plan. La variante actual queda para revisión técnica del propietario y próximos datos. No ejecución elegida, fixture creado, prueba corrida, worker activado o merge/release por este documento. La guía writing-plans consultada es la publicaciónupstream; no se certifica que coincida con versiónbundled delplugin instalado.


## Addendum: Export recibido, lector pendiente y código publicado

- Archivo dream-team-empleados.xlsx recibido; lectura de bytes/hojas no disponible en este entorno. No ejecutar diagnóstico contra filas imaginadas ni transferirlo a otra cuenta para sortear el bloqueo. Completar con lectura local autorizada o tabla minimizada del propietario.
- URL del propietario y Vercelreadback fijan código servido b9cf10606f410a0e6a6cdb5162dac1b735230a27, doscommits adelante delmain observado. Preservar manualattendance y demásdeltas al preparar cualquierPR DreamTeam.
- Exportador contiene16campos de expediente, incluida banca/salario; no proyectar esa hoja completa en el índiceIdentity. «Con cuenta registrada»=banca, noAuth. Directorioactual hasAccess=user_id; precisar vínculo vsaccesoefectivo.
- Task1: prueba de usuario vinculado sinmembresía exige linked_account=true y effective_access=false; cuenta bancaria nunca afecta acceso. ResumenBANK cuenta filasbankactivas según contrato, separado delconteoAuth.
- Task2: prueba de directorio excluir salario/banco/contactoprivado de lector general; vínculo no concede permisos. No clockIdhistórico como actual: mappingvigente único y falta/ambigüedad explícita.
- Task3: matrizpreview/directorio/commit por identidadorgrelojfecha, conservando RPCcanónica.
- Conciliación delExcel: detectar portada/filatítulo/headers, compararsemántica de columnas y fecha de generación; mínimosCódigo/Colaborador/Sector/Función/Estado/Ingreso/Salida; formatos/hojas exactas delarchivo se fijan tras leerlo. Códigoexportador no certifica bytes deladjunto. Salarios/banca se revisan en carrilRRHHrestringido si necesario, no por matchingdeidentidad.
- Evidencia y reporte privados porfila; GitHub conserva solo schema, agregados y decisión. No nuevas cuentas ni ingesta de expediente hasta readiness.
