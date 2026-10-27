# Comprobantes CR4.4 — preparación de referencias de noviembre2026

Estado: **candidato técnico, pruebas locales; cuenta emisora/STAG pendientes**. Fecha de preparación:28/10/2026 (Asia/Seoul). Alcance: TORO Finance > Money > Accounting & Tax > Alegra; validación sin operaciones externas.

## Control y hallazgo de implementación
Se inspeccionó main4b8fd86a957bafdc99dbbee42b844446fe91a349. El transporte nativo existente solo admite purchase_bill y construye /bills; el contrato no habilita emisión de ventas/notas/REP. Registrar una compra no es emitir una Factura Electrónica de Compra. No se amplía este Writer para crear otro emisor. La edición/cuenta emisora efectiva y su catálogo son **NO VERIFICADOS**. Alegra conserva autoridad fiscal; Contabilidad valida el significado y Sistemas la evidencia técnica.

## Autoridad oficial consultada
- [Comunicado Hacienda](https://www.hacienda.go.cr/docs/ActualizacionAnexosyEstructurasVersion4.4CEv2.pdf): implementación1nov2026, uso anticipado y disponibilidadSTAG.
- [Anexos4.4](https://www.hacienda.go.cr/docs/ANEXOS_Y_ESTRUCTURAS_V4.4.pdf), bitácora22abr2026, pp.57–58 y73–74: campos/referencias y efecto contable; p.65 esquemas.
- [Declaración Alegra](https://blog.alegra.com/costa-rica/notas-de-credito-y-debito/), actualizada23oct: declara catálogo actualizado, no prueba de una cuenta concreta.
- [API de notas](https://developer.alegra.com/reference/post_credit-notes): no se extrapola un parámetro fiscal no documentado ni se efectúaPOST.

## Herramienta implementada
`python3 scripts/costa_rica_ce44_preflight.py /ruta/privada/prueba.xml --expected-issuer ID_ESPERADO`

Lee hasta2MiB de XML local UTF8. Comprueba identidad del emisor, espacio de nombres4.4, catálogo de razones/TipoDocIR, formato de campos y algunas restricciones de notas9/10. RechazaDTD/entidades, campos escalares repetidos y fechas inválidas. No resuelve rutas del XML ni usa red. Solo devuelve códigos de resultado y períodos a revisar; no imprime XML, claves, identificaciones, nombres, montos ni rutas. No guardar originales o salidas privadas en el repositorio.

Salida0 = **LOCAL_CHECKS_ONLY**, nunca certificado fiscal. Salida2 = **BLOCKED**. Siempre productionReady=false, aceptaciónHacienda y cuenta no verificadas. No validaXSD completo, firma, antigüedad máxima, clave completa, montos acumulados, moneda, estado del original ni contabilización real. Referencias sin documento original no prueban trazabilidad. Los períodos mostrados son candidatos derivados de fechas del XML, sujetos a contraste contable; no crea asientos ni declaraciones.

## Matriz de aceptación propuesta para Contabilidad y Sistemas
Preparar en el entorno de pruebas del emisor confirmado, con datos sintéticos. Este paquete no accede aSTAG ni genera documentos.

| Caso | Verificación del XML/exportación | Evidencia adicional necesaria |
|---|---|---|
| Código12 | NC y período de la nota | Naturaleza financiera/exoneración posterior y autorización aplicable |
|13/14 | NC/ND, referencia original, período original incluso al cruzar de mes | Documento original + reflejo contable correcto |
|13→15 si se reemite | Nueva emisión enlazada con15 | Cadena de corrección completa, sin duplicar venta |
|16 | Sustitución, TipoDocIR10; no NC para anular rechazado | RechazoHacienda original y aceptación de sustituto |
|17 | ExclusivoREP, tipos de referencia permitidos | Pago/comprobante original y aceptación correspondiente |
|TipoDocIR19/20 | Aceptar catálogo separado de razón | Documento de exportación/REP real del escenario; solo si aplican |
|01/02/06 existentes | Conservación del período de la nota | Regresión contable, sin conversión automática a13/14 |

No cambiar códigos por fecha de forma indiscriminada: la causa determina el tratamiento. No convertir outgoing_payment de TORO enREP. Si un caso no corresponde al negocio, Contabilidad registra no_aplica y motivo; no inventar operaciones para cubrir cuota.

## Cierre y continuidad
Terminado únicamente cuando: cuenta/sociedad/emisor/versionado confirmados, casos aplicables probadosSTAG, XML+respuesta conservados privadamente, período contable contrastado y aceptación del contador. Alegra declara soporte pero falta esta evidencia. No activar Writer ni cambiar flags/permisos, saldos, facturas o impuestos para cerrar esta preparación.

Ante diferencia: bloquear la automatización de ese caso, conservar evidencia privada, continuar mediante el emisor autorizado con revisión contable y corregir el candidato. Rollback del paquete: revertir su commit/PR; no hay migraciones, cron ni cambios de datos. No hay nueva preferencia aprendida, proveedor reemplazado o ahorro medido.

## Prueba reproducible
`python3 -m unittest discover -s tests -p test_costa_rica_ce44_preflight.py -v`

Pruebas sintéticas de período cruzado,12–17,19/20, catálogo antiguo, ámbitos, XML malicioso, formato y privacidad. Se integran a CI; no prueban aceptación fiscal o runtime del hotel.
