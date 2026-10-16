# TORO — reparación controlada del Writer Alegra

Fecha de corte: 2026-10-16, Costa Rica.
Estado: CANDIDATO LOCAL RECONCILIADO Y PROBADO; WRITER PRODUCTIVO OFF.

## Conclusión

El Writer no estaba fallando por un único interruptor. La ruta disponible en ChatGPT es solo lectura; PR #228 estaba detrás de `main`; el Control Plane exigía L3, pero sus claims desplegados aceptan solamente L0-L2; no existe grant efectivo de finanzas/Alegra; y la admisión anterior dejaba una ventana entre autorización, renovación de lease, transición y el futuro POST.

Esta unidad repara el candidato de PR #228 sin aplicar SQL remoto ni crear una transacción contable. La firma humana se separa del futuro runtime Writer: el resolutor canónico autenticado exige `FOUNDER` y rol `ADMIN/GERENCIA`, y un registro inmutable congela actor, decisión, payload y TTL. El punto de despacho L3 queda especializado para una sola compra aprobada y exacta. `running + prepared receipt` es el punto de no retorno auditable; antes de ese punto, una revocación autenticada mediante `auth.uid()` y serializada sobre la misma run cancela y aumenta el fencing token. La migración completa ahora es transaccional, fija por hash y ACL los RPC genéricos vivos antes de reemplazarlos y conserva el ledger inmutable durante rollback/reapply.

## HECHO y verificado

1. La rama existente se reconcilió con `origin/main`; se conservan Next/eslint-config-next `16.3.8`, Vitest `4.1.11` y todas las suites incorporadas en main.
2. El approval del Writer ahora liga obligatoriamente:
   - `approvalId` y receipt inmutable;
   - actor;
   - `decisionId` y revisión;
   - `approvedAt` y vencimiento;
   - hash exacto del payload.
3. La evidencia de aprobación se clona y congela con intent/approval antes de cualquier `await`. La mutación posterior no cambia los argumentos enviados al límite de admisión.
4. El claim, la transición y el cierre genéricos quedan limitados a L0-L2; una run Alegra L3 solo puede usar admisión y finalización especializadas.
5. El nuevo draft `20261016_toro_alegra_l3_dispatch_admission_v1.sql`:
   - acepta solo una run nueva `queued`, intento 0, máximo 1;
   - acepta solo L3, destino `alegra` y acción `alegra_create_purchase_bill`;
   - toma `FOR UPDATE` sobre la run;
   - fija el resolutor canónico vivo por firma y vuelve a comprobar `FOUNDER`, rol organizacional y membresía activa;
   - verifica registro firmado y receipt de aprobación vigentes, actor, decisión/revisión, vencimiento fijo de 15 minutos, payload e idempotencia;
   - permite renovar únicamente una aprobación expirada sobre la misma run fresca y serializada;
   - cambia a `running`, incrementa fencing, asigna lease e inserta el marker `prepared` en la misma transacción;
   - impide que una fila ajena, parcial o con campos `NULL` sea reclasificada por `UPDATE` hacia el scope exacto L3/Alegra, y mantiene inmutables las filas terminales;
   - serializa revocación y admisión sobre el mismo lock;
   - finaliza receipt y run en una sola transacción, recuperable tras timeout sin duplicar ni perder evidencia;
   - incluye una primitiva heartbeat L3 solo para el mismo worker/fence/marker, con TTL de 30–120 segundos y horizonte máximo de 5 minutos;
   - incluye una primitiva de recovery que, una vez invocada tras vencer el lease, bloquea y reconcilia como `PROVIDER_STATE_UNKNOWN` sin volver a llamar al proveedor ni reintentar creación;
   - deriva la identidad de revocación del JWT y revalida al mismo firmante activo `FOUNDER` + `ADMIN/GERENCIA`; no acepta actor aportado por el llamador;
   - se ejecuta entre `BEGIN/COMMIT`, aborta antes del primer DDL si cambian cuerpo, owner, modo de seguridad, `search_path` o la ACL literal de los RPC genéricos: exactamente owner `postgres` y `service_role`, otorgadas por owner, solo `EXECUTE` y sin grant option;
   - conserva en rollback el ledger, RLS, ACL, índice y trigger de inmutabilidad; un reapply valida su contrato antes de reutilizarlo;
   - no concede `EXECUTE` a ningún runtime; `service_role` no es aceptable como principal Writer futuro;
   - incluye rollback pareado.
6. El recibo final enlaza marker, aprobación firmada y evidencia congelada. La reconciliación usa una clave distinta, exige estados coherentes y conserva razones no vacías.
7. Pruebas locales sin efectos:
   - Writer y Control Plane: 154/154 PASS en ocho archivos;
   - preflight de evidencia: 36/36 PASS;
   - TypeScript y lint afectado: PASS;
   - build de producción con Webpack: PASS.

## Estado vivo consultado, sin mutación

- Supabase canónico está saludable, pero la regla de autoridad conserva Alegra en solo lectura hasta transporte y acceptance suite.
- Los RPC genéricos vivos quedaron leídos y fijados antes de cualquier DDL: `transition` MD5 `d4a3fa3f97e521af83bf64161f2db473` y `complete` MD5 `7ae24e38863cc14f7efecfe6ebef65cf`; ambos owner `postgres`, `SECURITY INVOKER`, `search_path` vacío y `EXECUTE` solo para `postgres`/`service_role`, no para PUBLIC, `anon` ni `authenticated`.
- El catálogo del conector Alegra accesible en esta conversación es de consulta; no ofrece create/update/delete contable.
- No existen runs ni receipts Alegra productivos, capability/grant efectivo ni una decisión exacta ligada a un payload de compra.
- Octubre 2026 se observó abierto en la cuenta operativa y los centros de costo se pudieron leer. Estas lecturas no prueban permisos de escritura, principal autenticado ni readiness del Writer.
- El checkout OpenClaw contiene otro alcance: borrador de factura de venta y edición de servicios/items. No sustituye el Writer de compras de PR #228 y no se sobreescribió.

## Bloqueos que continúan

1. El draft L3 no está aplicado ni validado en PostgreSQL real con rollback, carreras, espera que atraviesa vencimiento y recuperación tras timeout.
2. No existe el principal runtime separado y mínimo que exige el diseño, ni una composición desplegada del host server-only que entregue transporte autenticado, company binding, permiso nativo, lookup/readback y recepción durable. Heartbeat y recovery están implementados y probados como contratos, pero todavía no tienen caller operativo; por tanto un crash real no se declara reconciliado automáticamente.
3. No hay capability/grant financiero efectivo; esta unidad no lo concede.
4. El expediente Starlink no sirve como primer piloto: el proveedor nativo no coincide con la identidad fiscal del original y el documento incluye un cargo adicional que el body actual no modela. No se inventará su clasificación.
5. Adjuntos, corrección/reverso nativo y recuperación tras timeout no están aceptados en runtime real.
6. Ningún resultado sintético prueba escritura, entrega fiscal, recepción downstream o reversibilidad en Alegra.

## Reversión

- Código: revertir únicamente el commit de esta reparación en la rama de PR #228.
- SQL no aplicado: retirar los dos drafts nuevos.
- Si una futura migración fuera autorizada y aplicada: ejecutar el rollback pareado solo dentro de la ventana aprobada y con todos los productores apagados. El rollback no borra el ledger de aprobaciones firmadas ni su guardia de inmutabilidad.
- El rollback toma locks exclusivos y aborta ante cualquier binding `approved/admitted` o ejecución L3 activa; antes deben revocarse/cancelarse de forma auditable y comprobarse cero bindings activos.
- No resetear `main`, no borrar receipts y no tocar originales de Dropbox.

## Única siguiente acción

Validar el draft exacto en PostgreSQL real dentro de una transacción controlada: compilación, ACL, firma y separación de roles, aprobación expirada→renovada, espera que atraviesa vencimiento, admisión↔revocación, heartbeat, recovery sin segundo POST, marker, finalización/replay tras timeout y ciclo `apply → fila histórica → rollback → reapply`. Criterio de terminado: todas las aserciones pasan, el rollback preserva exactamente la fila histórica, la base vuelve al estado operativo previo y el Writer permanece OFF. Solo después se decide una migración y un comprobante piloto compatibles mediante aprobaciones separadas.

Referencias de proveedor verificadas: [crear compra de proveedor](https://developer.alegra.com/reference/post_bills), [leer compra por ID](https://developer.alegra.com/reference/get_bills-id), [listar compras](https://developer.alegra.com/reference/get_bills).
