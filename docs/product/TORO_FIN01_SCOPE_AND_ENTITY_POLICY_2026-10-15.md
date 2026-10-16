# FIN-01 · política de entidad, alcance y centros de costo 2026

**Corte:** 2026-10-15 · `America/Costa_Rica`  
**Estado:** `CATALOG_SCOPE_CONTRACT_COMPLETE / TRANSACTION_MAPPING_PENDING / ZERO_EXTERNAL_WRITES`  
**Tarea:** `FIN01-P0-SCOPE-01`

## 1. Decisión ejecutiva

El catálogo activo de Alegra queda cubierto **11/11** y cada centro tiene una ruta documental o una cuarentena explícita. Esto cierra `FIN01-P0-SCOPE-01` únicamente como contrato de catálogo y gobierno; no reclasifica movimientos históricos, no certifica el alcance de cada transacción y no cambia Alegra, Supabase ni otro sistema.

Los dos enlaces Alegra actuales devolvieron el mismo catálogo completo y se tratan como alias de la compañía `2087288`, no como dos libros. La compañía `1254496` permanece histórica y aislada. La clave estable es `alegra_company_id + cost_center_id`; los once códigos nativos están vacíos, por lo que nombre o similitud no son claves.

La regla prudente es más estricta que “centro DREAMCATCHER = hotel”: el centro 1 es el único candidato de ruteo hotelero, pero contiene ejemplos observados de otros ámbitos y partes relacionadas. Por eso ningún registro entra automáticamente al reporte del hotel sin evidencia transaccional de entidad, beneficiario, propósito, período, moneda y fuente.

## 2. Identidades que no se pueden fusionar

| Capa | Identidad vigente | Tratamiento |
| --- | --- | --- |
| Compañía Alegra actual | `2087288` | Libro operativo observado; deduplicar sus dos enlaces actuales. |
| Compañía Alegra histórica | `1254496` | `HISTORICAL_ISOLATED`; no consolidar 2026 sin puente, saldos iniciales y paridad aprobados. |
| Entidad jurídica documentada | Atrapasueños de Santa Teresa S.A. · `3-101-354441` | Identidad local documentada; el endpoint vivo de centros no expone razón social/cédula y no la corrobora por sí solo. |
| Organización TORO | `595801ce-2895-4d91-81ae-e8d1d5cc8593` | Tenant operativo; no equivale automáticamente a sociedad, libro o propiedad. |
| Negocio | `dreamcatcher` | Ámbito operativo del hotel; conservar alias y valor fuente. |
| Propiedad | `7ac9e46e-3b56-44d6-96f9-9d0b63bc943b` | Propiedad runtime Dreamcatcher Santa Teresa; no representa proyectos o sociedades relacionadas. |
| Unidad/producto | villas, habitaciones, Makaiza, DreamFull | Subordinados al negocio/propiedad; nunca promoverlos por nombre a entidad jurídica. |
| Persona/parte relacionada | identidad y relación separadas | Una persona no es un centro, negocio, proveedor, empleado o socio por coincidencia nominal. |

Toda relación entre estas capas necesita fuente, vigencia, versión y estado `OBSERVED`, `OWNER_DECISION`, `ACCOUNTANT_VALIDATED` o `PENDING_EVIDENCE`.

## 3. Mapa de los 11 centros activos

| ID nativo | Etiqueta segura | Ruta documental | Inclusión automática hotel |
| ---: | --- | --- | --- |
| 1 | `DREAMCATCHER` | Candidato hotel; validar cada transacción porque el centro está contaminado por otros ámbitos observados. | No |
| 2 | `SANTA TORO` | Negocio/propiedad separada candidata; fuera del hotel hasta identidad aprobada. | No |
| 3 | `VISTA ALEGRE` | Propiedad/portafolio separado candidato; entidad y operador pendientes. | No |
| 4 | `CASA TORO` | Propiedad separada candidata; entidad, negocio y operador pendientes. | No |
| 5 | `GUATAPE` | Alcance desconocido; cuarentena. | No |
| 6 | `CALLE FLORA` | Alcance desconocido; cuarentena. | No |
| 7–10 | `PRIVATE_PERSON_RELATED_*` | Persona o parte relacionada; nombres minimizados en el repositorio y tratamiento pendiente. | No |
| 11 | `RESTAURANTE` | Departamento, establecimiento, negocio separado o costo compartido por decidir. | No |

Cobertura: 11 esperados, 11 observados activos, 11 mapeados o en cuarentena. El centro 11 requiere decisión Mauricio/contador; los centros 7–10 requieren identidad y relación autorizadas. Ninguna de esas decisiones bloquea la cuarentena segura.

## 4. Contrato por transacción

Una partida solo puede promoverse desde cuarentena si conserva, como mínimo:

- compañía/libro de origen y `source_record_id`;
- entidad jurídica emisora/receptora y evidencia;
- negocio, propiedad, unidad/departamento y centro nativo;
- pagador, receptor legal, beneficiario económico y responsable operativo cuando difieran;
- evento financiero: reserva, factura, cargo, cobro, liquidación, pago, deuda, aporte, retiro, renta, reembolso o ajuste;
- fecha, período, moneda original y las tasas separadas por propósito;
- soporte original, estado de evidencia, dueño, revisión requerida, versión y vigencia del mapping.

`UNKNOWN`, nulo o error nunca se convierte en hotel ni en cero. Un centro no cambia la entidad jurídica. Un nombre no prueba identidad o relación. Una vista gerencial consolidada no fusiona libros ni elimina intercompañía.

## 5. Las 50 mejoras aplicadas al contrato

El paquete [`toro_fin01_scope_control_pack_50_v1.json`](../../data/toro_fin01_scope_control_pack_50_v1.json) contiene exactamente 50 controles únicos y trazables. “Aplicado” significa incorporado al contrato versionado y sus pruebas locales; no significa que se haya modificado un proveedor o reclasificado historia.

| Rango | Resultado incorporado |
| --- | --- |
| `SCP-01..05` | Identidad del libro actual, deduplicación de enlaces, aislamiento histórico y separación compañía–entidad–organización. |
| `SCP-06..10` | Dimensiones explícitas de negocio, propiedad, centro, departamento, persona/proyecto/parte relacionada. |
| `SCP-11..21` | Tratamiento individual de los 11 centros, con candidato hotelero y cuarentenas. |
| `SCP-22..25` | Preservación de catálogo, prohibición de matching nominal, vigencia y dueño de excepciones. |
| `SCP-26..30` | Autoridad separada de Alegra, Kross, bancos/procesadores, Dropbox y TORO/Airtable. |
| `SCP-31..35` | Eventos financieros separados, OPEX/no operativo, partes relacionadas, costos compartidos y moneda/FX. |
| `SCP-36..40` | Minimización de PII, procedencia, IDs compuestos, nulos seguros y secretos fuera del repositorio. |
| `SCP-41..45` | Writer apagado, sin DDL/backfill/borrado y heartbeat horario limitado a preparación de solo lectura. |
| `SCP-46..50` | Pruebas 11/11 y 50/50, recibo/reversión, una sola siguiente acción y avance a bancos/caja. |

## 6. Autoridad y límites

- **Alegra:** estado del libro y documento fiscal/contable nativo.
- **Banco o procesador:** movimiento real y liquidación.
- **Kross:** reserva, estancia y cargo vivo cuando la lectura sea actual.
- **Dropbox/proveedor:** custodia del original.
- **Supabase/TORO:** control estructurado, reconciliación, procedencia y recibos; no segundo libro.
- **Airtable/TORO tasks:** revisión humana y dueño de excepciones; no autoridad contable.
- **Mauricio:** prioridades y decisiones de alcance sensibles.
- **Contador/asesor autorizado:** tratamiento fiscal, asiento, declaración, cierre e intercompañía.

Siguen prohibidos sin gate exacto: asientos, facturas, pagos, declaraciones, cierres, reclasificación histórica, DDL/backfill, permisos/RLS, altas/bajas de catálogo, carga de documentos, writer Alegra o eliminación del legado.

## 7. Automatización horaria segura

La automatización existente de FIN-01 se reutiliza; no se crea otro scheduler. Cada hora puede leer el corte canónico y ejecutar una sola unidad documental o de conciliación acotada. Debe permanecer silenciosa si no hay cambio material y notificar solo avance verificable, fallo o decisión requerida. No puede escribir en sistemas financieros, cambiar permisos, enviar mensajes, ejecutar posting o cerrar períodos.

“20 veces más” habilita lotes seguros más grandes cuando comparten fuente, contrato y prueba; no amplía autoridad. “50 mejoras” exige controles materiales verificables y no autoriza rellenar métricas ni inventar cambios.

## 8. Cierre y siguiente unidad

`FIN01-P0-SCOPE-01` queda `DONE` con alcance `DOCUMENTED_CATALOG_SCOPE_CONTRACT_ONLY`. El mapping transaccional continúa `PENDING_EVIDENCE` dentro de los lotes correspondientes.

La única siguiente unidad es `FIN01-P0-BANK-01`: conciliar bancos y caja por cuenta, mes y moneda, empezando por identidad/titularidad de las 18 cuentas, saldos inicial/final y partidas sin correspondencia. CRC y USD permanecen separados. No se repiten las auditorías amplias de moneda o centros.

**Reversión:** revertir exclusivamente esta matriz, paquete de controles, prueba y documentación. No existe estado externo que restaurar.
