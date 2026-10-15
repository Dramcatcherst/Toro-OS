# TORO — Continuidad operativa y almacenamiento

**Estado:** NEXT / procedimiento preparado; no acredita activación ni ejecución.
**Fecha:** 2026-10-15.
**Autoridad:** [Plan General único](../product/TORO_BRAIN_GENERAL_PLAN.md), [ampliación operativa](../product/TORO_OPERATING_MODEL_AMENDMENT_2026-10-15.md), Constitución y contratos de dominio existentes.
**Ámbito:** TORO Tools, Comms, People, Data/Assets y operación de referencia. No crea otro módulo, plan maestro, cola, agente o base.
**Distribución:** documento público sanitizado. Fechas de ausencia, destinos de viaje, identificadores privados, estado de seguridad de cuentas y mediciones del negocio se conservan exclusivamente en evidencia privada.

## 1. Resultado mínimo antes de aumentar autonomía

El objetivo es continuidad del negocio con menos interrupciones al propietario; no declarar terminado todo el producto ni apresurar su venta.

| Flujo | Evidencia de aceptación | Contingencia mientras falta la integración |
|---|---|---|
| Desayunos | Fuente comercial vigente, incluidos/extras/casa separados, recepción resuelve excepciones, cocina acusa y registra entregas/no consumidos | Reporte nativo del PMS o exportación autorizada, validado por el responsable de apertura |
| Mantenimiento | Incidencia vigente, responsable que acepta, prueba funcional segura, evidencia fechada y verificación | Procedimiento humano existente; no atribuir entrega o reparación al agente |
| Inventario/bodega | Un conteo compartido por SKU y ubicación, unidad, cantidad usable, fecha, responsable y excepciones | Captura guiada por las particiones existentes; no otro inventario paralelo |
| Accesos | Identidad nominativa, alcance mínimo, autorización por acción, recuperación probada y revocación | Responsable autorizado; no contraseña de administrador compartida |
| Operación cloud | Evento real permitido, resultado y recibo con el ordenador del propietario apagado; repetición y recuperación comprobadas | Proceso humano explícito, sin retirar el sistema actual |
| Almacenamiento | Medición antes/después por dispositivo y nube, respaldo confirmado y lectura de muestra | Preservar originales; no borrar para lograr una cifra |

La fecha objetivo y el responsable humano confirmado pertenecen a cada tarea privada existente. Un nombre de agente en una tabla no acredita aceptación de trabajo físico.

## 2. Auditoría que termina, conserva avance y se reanuda

1. Leer fuentes actuales y el último corte recuperable; declarar alcance y lo no accesible.
2. Priorizar seguridad/huéspedes de hoy, desayuno, llegadas y mantenimiento antes de mejoras visuales.
3. Buscar la tarea existente por ámbito y causa; no volver a crear el mismo problema.
4. Procesar un lote finito. Límite inicial: 12 minutos de ejecución observados o 40 llamadas, y hasta dos reintentos transitorios seguros. No es una garantía técnica del proveedor.
5. Conservar punto de continuación y huecos en el registro privado autorizado. Si no existe escritura permitida, informar bloqueo y no fingir checkpoint persistido.
6. Cerrar solo comprobaciones realizadas; toda corrección requiere lectura posterior. Un fallo de escritura debe comprobarse antes de repetirla.
7. Continuar con frentes independientes cuando uno se bloquee. Un escritor por objeto; no convertir paralelismo en múltiples agentes cambiando la misma reserva o archivo.
8. Elevar al propietario solo la intervención indispensable. No pedir otra autorización genérica cuando ya existe; sí respetar controles de herramienta, identidad, MFA y cambios de riesgo.
9. A una denegación de seguridad no se responde usando otra ruta para realizar la misma operación. Registrar la denegación y avanzar únicamente trabajo independiente permitido.
10. Una tarea marcada resuelta conserva prueba funcional, fuente, fecha, actor y posibilidad de revisión; el texto del agente no es un recibo operacional.

**Autonomía por flujo:** observar -> preparar -> operación reversible autorizada -> verificar -> ampliar con evidencia. PUMBA conserva los gates del [runbook de activación](TORO_MCP_PUMBA_ACTIVATION_V1.md). Este documento no los levanta.

## 3. Separar cuatro significados de almacenamiento

- **Bodega física:** consumibles, blancos, repuestos y movimientos reales.
- **Bóveda de credenciales:** servicio especializado para contraseñas y secretos; no memoria narrativa ni tabla de texto.
- **Archivo documental:** originales, comprobantes, fotos y versiones con permisos y conservación.
- **Disco de dispositivos:** copias locales y caché; liberar disco local no equivale a liberar cuota cloud.

### 3.1 Bodega física

Reutilizar el catálogo, niveles, movimientos y checklist existentes de Assets, y las tareas de Procurement/Housekeeping. Un número sin fecha y confirmación de conteo es información no verificada, no stock utilizable. Un registro vacío no significa existencia cero.

Realizar una única ruta compartida: SKU -> ubicación -> unidad/presentación -> cantidad usable -> fecha -> responsable -> observación/evidencia. Reutilizar la misma evidencia en las vistas de Compras, Aseo, Lavandería y Cocina. No cerrar el conjunto como verificado si quedan excepciones sin resolver.

Separar movimientos documentados de saldos calculados: una factura prueba una compra, no necesariamente la recepción física; un pedido no prueba salida, y una conversación de retiro exige identificación y cantidad antes de afectar existencias.

Calibrar mínimos y punto de pedido después del conteo y validación de consumo/plazo de reposición; no introducir cifras arbitrarias para aparentar configuración. Repuestos y productos que requieran manejo especial conservan sus controles de seguridad y responsables habilitados.

### 3.2 Bóveda y recuperación

Inventariar primero solo metadatos: servicio, propietario, cuenta de servicio o humana, ámbito, acciones permitidas, referencia opaca del secreto, proveedor y mecanismo de recuperación. Nunca consultar valores para completar el inventario.

Un esquema llamado Vault o un contador de secretos no demuestra una bóveda funcional ni la ausencia de otro gestor. Reutilizar el proveedor aprobado y verificar su conexión mediante una acción de prueba acotada, no devolviendo la contraseña al modelo.

Alta segura: propietario inicia sesión/MFA en la interfaz del proveedor -> permisos mínimos -> executor server-only -> prueba positiva y negativa -> revocación -> recuperación humana. No contratar un plan, rotar credenciales, ampliar permisos, exportar cookies o desactivar MFA por este checklist.

### 3.3 Ordenador y móvil

Secuencia por dispositivo: identificar sistema y propietario -> medir capacidad/libre/uso por categoría -> inventariar los archivos de mayor tamaño -> comprobar sincronización y respaldo -> seleccionar lote -> retirar solo la copia local mediante función oficial cuando proceda -> releer archivos de muestra -> medir espacio real.

Preferir archivos solo en línea a borrar carpetas sincronizadas. Abrir un archivo solo en línea puede volver a descargarlo. La eliminación de un archivo sincronizado puede propagarse a la nube; no es una estrategia de liberación local.

Fotos: confirmar la cuenta, el respaldo completo y la calidad/versión conservada antes de usar la función oficial de liberar espacio del dispositivo. Mantener originales de contenido comercial que requieran calidad completa. No vaciar papeleras ni eliminar copias únicas para conseguir una cifra de ahorro.

Conservar un conjunto offline mínimo: documentos esenciales autorizados, reservas necesarias, contactos de emergencia y recuperación segura. No eliminar autenticadores, llaves de acceso, conversaciones operativas o documentos pendientes de incorporación. El teléfono del propietario no debe convertirse en el único respaldo del negocio.

Registrar espacio antes/después por separado: disco PC, almacenamiento móvil, Gmail, Drive/Fotos, Dropbox u otros proveedores realmente usados. No atribuir ahorro de almacenamiento a archivar o marcar correo leído.

## 4. Reportes sin duplicación

La auditoría de apertura y la de preparación de llegadas son cortes del mismo flujo. El precierre financiero mantiene su propósito y hora. El reporte ejecutivo diario de avance a las 20:00, America/Costa_Rica, consume resultados y evidencias; no repite toda la ingesta ni reemplaza los controles financieros.

Formato de avance: HECHO con evidencia; AVANZÓ con resto pendiente; BLOQUEADO con causa; hasta tres resultados siguientes; NECESITO DE TI solo si existe dependencia indispensable. Entregar incluso si no hay progreso verificable, sin fabricar actividad para llenar el informe.

Distinguir: documento, configuración, código, prueba, puesta en marcha, entrega al equipo, acción física y resultado económico. Una PR abierta no es main ni producción; un scheduler habilitado no prueba que haya ejecutado o notificado; una cola vacía no prueba ausencia de trabajo en otros sistemas.

El canal se declara solo tras configuración y prueba. Programar ChatGPT no equivale a envío WhatsApp. Las preferencias de notificación del dispositivo se verifican por separado. No crear otro scheduler cuando el existente cubra la función.

## 5. Extensión cloud-first y producto

Toda nueva dependencia local requiere motivo, alcance temporal, dueño, sustitución prevista y prueba posterior de continuidad. Work local sirve para migrar o inspeccionar el dispositivo, no como requisito permanente de una operación de nube.

El paso a WhatsApp Business directo o el retiro de WeSpeak/OpenClaw exige paridad de funciones necesarias, identidad, mensajes/grupos realmente soportados, fallos, recuperación, costes y permiso de migración. No retirar el transporte vigente por presión de calendario.

Aislamiento por negocio, incorporación guiada, soporte, exportación, coste por resultado y recuperación permanecen en los gates comerciales existentes. No crear una versión del producto por hotel ni mezclar datos privados de la referencia con futuros clientes.

## 6. Verificación, reversión y fuentes

Este cambio agrega únicamente un procedimiento documental mediante la PR existente. Su integración en main, ejecución física, configuración de sistemas y pruebas cloud tienen recibos separados. Revertir el archivo y su referencia no toca los sistemas operativos.

Antes de aplicar instrucciones específicas, consultar la documentación vigente del proveedor y comprobar el sistema real del usuario. Fuentes oficiales revisadas para este procedimiento:

- OpenAI, Work y Codex: https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex
- OpenAI, navegador cloud: https://help.openai.com/en/articles/20001280-using-cloud-browser-in-chatgpt
- OpenAI, tareas y notificaciones: https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt
- Dropbox, archivos solo en línea: https://help.dropbox.com/sync/make-files-online-only
- Google Fotos, liberar espacio del dispositivo: https://support.google.com/photos/answer/6128843
- OWASP, gestión de secretos: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

La evidencia privada debe contener fecha de observación, consulta o acción, cobertura, resultado, límites y reversión; no se publica junto con este runbook.
