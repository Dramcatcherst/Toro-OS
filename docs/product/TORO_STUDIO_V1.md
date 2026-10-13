# TORO Studio v1

**Status:** DESIGN APPROVED · GENERAL PLAN INTEGRATED · DREAMCATCHER PILOT IN PROGRESS
**Canonical TORO path:** Growth + Assets + Channels > TORO Studio
**Canonical machine contract:** `operations.knowledge_items/toro_studio_v1`
**Human spec:** https://app.notion.com/p/3e6f5169a39a81e9baa8cf1396d66140?pvs=204

## 1. Purpose

TORO Studio is the governed creative/media capability of the single TORO product. It turns real business goals and source-backed context into images, video, design and content while preserving brand truth, permissions, provenance, approvals and measurable learning.

It is not a second brain, brand, project root, database or permission model.

## 2. Tools

- TORO Images
- TORO Video
- TORO Design
- TORO Content
- TORO Media Library
- TORO Brand Guard

Internal specialist roles:
Brand Guardian, Creative Strategist, Prompt Architect, Image Producer, Video Producer, Copy Editor, QA Checker, Asset Librarian, Publisher, Performance Analyst.

## 3. Creative lifecycle

`IDEA -> BRIEF -> DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> MEASURED -> ARCHIVED`

Material outputs require:
brand, goal, audience, channel, format, CTA, source authority, references/assets, approver, privacy/rights and success metric when applicable.

Missing material context => DRAFT, never production-safe.

## 4. Data model — reuse first

TORO Studio MUST reuse current structures before proposing new production tables.

### Canonical structures already present
- `content.media_assets` — canonical asset index
- `content.media_assignments` — asset -> target role/ordering
- `content.brand_content` — governed brand/content truth
- `integrations.media_file_manifest` — file/hash/canonical disposition
- `integrations.media_intake_archive` — intake/recovery evidence
- `integrations.source_asset_registry` — source registry

Observed at integration:
- content.media_assets: 50 before Studio bridge
- Studio bridge candidates added: 9
- content.media_assignments: 10
- content.brand_content: 18
- media_file_manifest: 422
- media_intake_archive: 140
- source_asset_registry: 384

### Transitional Airtable structures
- `media_assets`
- `approvals`
- `asset_entity_links`
- `Content Roadmap`
- `Content Opportunities`
- `Campaign Ideas`

Do not create replacement campaign/prompt/performance/approval tables until the Dreamcatcher pilot proves a missing canonical contract.

## 5. Asset safety contract

Airtable contained 9 assets with:
- rights_status=cleared
- social_candidate=true
- approved_for_web=true
- approved_for_ai=true

These 9 were bridged into `content.media_assets`.

Bridge semantics:
- rights_verified=true
- public_safe=false
- publish_status=review
- requires_human_verification=true

The bridge makes them eligible for TORO Studio QA. It does not authorize publication.

## 6. Dreamcatcher pilot

### Existing campaign reused
Airtable `Campaign Ideas / rec0xG5HM10xV512o`

**Campaign:** Costa Rica También Se Vacaciona
**Segment:** domestic leisure / low-season direct booking
**Message:** Costa Rica también se vacaciona.
**CTA:** Hablar con TERE / ver disponibilidad real
**Strategy:** organic first; paid only on verified Kross need-dates + FIONA margin.

### Pilot workflow

1. Build canonical brief from campaign + Dreamcatcher Brand/Design DNA + verified current facts.
2. Select only governed candidate assets.
3. Produce three hero reel concepts + cutdowns + stories as DRAFT.
4. Produce copy/CTA variants; availability/pricing remain live-source facts.
5. Brand Guard QA: rights, fidelity, room/property identity, claims, dates, privacy and channel rules.
6. Prepare one human approval packet.
7. Publish organic only after approval.
8. Paid media is a separate gate requiring verified need-date and margin.
9. Measure qualified conversations, Kross booking-start, confirmed/net outcome when attributable, rework, production time and owner intervention.
10. Promote only evidence-backed templates/prompts/assets into reusable Studio learning.

### Candidate visual set

Priority candidates:
- Villa Toro pool courtyard hero enhanced — score 92
- Villa Toro private jacuzzi view — score 92
- Villa Toro pool canopy hero enhanced — score 92
- Villa Toro garden patio — score 84
- Room 25 bedroom — score 78
- Dreamcatcher short-logo candidate — final brand reconciliation still required

### Publication gate

No public publish until selected asset(s):
- remain rights-cleared,
- pass fidelity/identity QA,
- are explicitly promoted to public_safe,
- have campaign facts/CTA/expiry verified,
- pass action/approval gate.

## 7. Metrics

Primary:
- qualified conversations
- Kross booking starts
- confirmed bookings/net revenue when attributable
- owner intervention minutes
- time to approved pack
- rework count
- asset/template reuse rate

Do not use asset count, views or AI generation volume alone as success.

## 8. Non-negotiables

- one TORO
- no duplicate media brain
- no fabricated business facts
- no silent public-safe promotion
- no unapproved publication/spend
- no private-data leakage
- no brand drift
- no destructive media cleanup through this pilot
- preserve DF-003 decommission gate separately

## 9. Current execution record

- Canonical Studio contract: `toro_studio_v1`
- Pilot task: `STUDIO-PILOT-01`
- Airtable task id: `recgTe5yOA0PVf6YC`
- Pilot Notion page: https://app.notion.com/p/3e6f5169a39a81759b69cdb164ad8bea?pvs=204
- Existing campaign record: `rec0xG5HM10xV512o`

## 10. Documentos legibles y archivos trazables — propuesta 13/10/2026

**Estado:** PROPUESTO PARA ADOPCIÓN GRADUAL; no es un cambio de ajustes globales de ChatGPT ni una automatización verificada. Encargo de Mauricio: ordenar los documentos nuevos y mejorar selección, clasificación y tratamiento de media dentro de lo existente. La copia concreta del retreat a Dropbox está autorizada; las sustituciones en canales y cambios de registros canónicos conservan sus gates.

### Nombre humano, identidad técnica estable

Plantilla por defecto para entregables nuevos:

`Marca - Documento o tema - Unidad o proyecto - Periodo aplicable - Idioma - vNN.ext`

Omitir campos que no ayuden a distinguir el documento. Usar espacios, palabras completas, un solo separador « - », español natural y versión de dos dígitos. La extensión expresa el formato. No poner hashes, IDs internos, nombres de herramientas, «final-final», sufijos «copia (3)», toda la oración del encargo ni importes volátiles en el nombre.

Ejemplos:
- `Dreamcatcher - Propuesta de retiro privado - Temporada baja 2027 - ES - v01.pdf`
- `Dreamcatcher - Cotizador de retiro privado - Temporada baja 2027 - ES - v01.html`
- `Dreamcatcher - Inventario de habitaciones - Toro Villa - 2026-10-13 - ES - v01.xlsx`
- `TORO - Estado de integraciones - 2026-10-13 - ES - v01.pdf`

Reglas:
1. Un tarifario/propuesta lleva el período de aplicación; un cierre/informe lleva el corte real. La fecha de creación queda en metadatos y no sustituye vigencia.
2. «Borrador», «Aprobado», «Publicado» y «Archivado» son estados del registro y del documento. No escribir «Aprobado» por haber pasado QA técnica ni renombrar el archivo con cada transición.
3. Conservar artifact/family ID, versión, source IDs, alcance, responsable, fecha, sensibilidad, ubicación, hash y relación entre PDF, editable y cotizador. Un formato distinto no crea otro proyecto ni otra verdad.
4. Normalizar Unicode NFC; evitar caracteres incompatibles con rutas, nombres reservados y espacios finales. Objetivo habitual: 60–120 caracteres de nombre y rutas cortas; adaptar al límite verificado del proveedor. Los exportes web usan slugs simples, separados del título humano.
5. No incluir secretos, cuentas completas ni datos personales innecesarios en nombres o enlaces públicos.
6. Antes de guardar, resolver el destino existente, comprobar permisos/colisión y guardar sin sobrescribir por sorpresa. Crear carpetas nuevas solo dentro del alcance autorizado. Verificar status final, ID/path, tamaño y hash cuando sea posible. Un intento de carga no acredita guardado.
7. Los documentos originales fiscales/contractuales y los binarios fuente conservan bytes e identidad. La etiqueta humana puede ser un display title o un alias de exportación; no reescribir originales oficiales ni referencias firmadas para mejorar su nombre.
8. No cambiar masivamente nombres existentes, rutas publicadas, claves, manifests o carpetas internas `*.library/images/*.info` de Eagle. Primero simulación y mapa anterior→nuevo; después lote aprobado mediante la herramienta nativa, readback y rollback.
9. Estilo visual según Brand/Design DNA vigente, texto y tablas legibles en teléfono, totales reales, iconos etiquetados, fotos correctas y CTA con destino comprobado. Un PNG necesita enlace externo o QR; no se promete clic dentro de píxeles.

## 11. Curación y edición fiel de media — propuesta 13/10/2026

### Reutilizar el archivo y resolver cobertura

Reutilizar Dropbox/Eagle, `content.media_assets`, `content.media_assignments`, `content.brand_content`, `integrations.media_file_manifest`, `media_intake_archive` y `source_asset_registry`. Supabase conserva el índice/control canónico; Airtable conserva la proyección humana transitoria; los canales reciben únicamente las versiones aprobadas. No crear biblioteca, agente, scheduler ni tablas de reemplazo.

**Evidencia observada, no inventario global completado:**
- README de MEDIA OFICIAL, modificado 30/06/2026: declara 9.281 assets y 8.056 fotos. Es un informe histórico.
- `eagle_media_inventory.csv`, modificado 05/07/2026: leído completo; 9.935 filas, 8.596 clasificadas como image, 5.501 low-resolution, 6.916 review-needed y 137 commercial-ready. Todos los registros tienen status=draft; 5.997 tienen area=unknown-area. Estas etiquetas históricas no son aprobación ni conteo actual de originales disponibles.
- El set `weddings-retreats-top-20.json`, 03/07/2026, tiene 20 candidatos. Sus seis primeros incluyen TORTUGA FIESTERA, TORTUGA PUNTILLISMO, PEZ AZUL, TORO AZUL, PULPO FURIOSO y MONKEY PINK, con etiquetas de usos múltiples y prioridad técnica alta. Su pertinencia visual para un retreat no quedó comprobada.
- Dos archivos inspeccionados visualmente son capturas de páginas web: `photo-c834b253dca22816-retreats-lastscan.png` y `website-groups-retreats-hero-dreamcatcher.png`. La primera reside en `01_library/photos`. La existencia en photos o el prefijo photo no acredita fotografía comercial.
- Lectura canónica 13/10/2026, únicamente Dreamcatcher: 60 media_assets, 5 public_safe, 24 rights_verified, 55 requieren revisión humana y 44 carecen de subject_key; 10 assignments activos. Es un índice acotado, no las 9.935 filas del manifest ni todas las fotos de Dropbox.

### Clasificar por contenido y lugar real

Separar fotografía real, derivado fotográfico, arte/diseño/logo, video/audio, screenshot/QA, referencia ajena y conceptual/generado. Los screenshots pueden ser evidencia de QA; no ilustración del alojamiento. El arte puede ilustrar arte/decoración cuando corresponde; megapíxeles o peso no lo hacen evidencia de habitación, piscina o retreat.

Clasificación mínima: marca/propiedad → villa → unidad física → área → sujeto visible → papel comercial/canal → original/derivado → fecha/frescura → derechos/privacidad → verificación/estado. Usar la habitación física canónica y vincular dormitorio/subárea sin duplicar inventario; en Dreamcatcher #11–#12 es una sola unidad de alojamiento.

Reconocimiento asistido:
- Construir referencias verificadas por Gerencia/Operaciones: mural, escalera, forma real de piscina, terraza, cocina, distribución de camas y detalles distintivos.
- Comparar contexto visual y datos del hotel; no identificar por un nombre antiguo, una cama parecida o una puntuación de IA aislada.
- Permitir varias etiquetas por imagen y conservar evidencia/confianza; «desconocido» no es «no existe».
- No asignar una foto a unidad, área o amenidad con conflicto material. Enviar solo la duda concreta a revisión humana y seguir con candidatos independientes.
- Los rasgos visuales y datos privados permanecen en su ámbito. No entrenar servicios externos ni compartir catálogos privados por inferencia.

### Selección antes de edición

Gates obligatorios: identidad real, representación vigente, derechos/privacidad y fidelidad. Una puntuación técnica nunca salva un gate fallido.

Para candidatos elegibles, ranking editorial inicial sujeto a validación: pertinencia para el objetivo 35%, composición 20%, atractivo y luz 20%, calidad técnica 15%, aporte de variedad/cobertura 10%. Registrar cada criterio; no convertir el total en probabilidad ni public_safe automático.

Elegir la mejor versión ORIGINAL disponible de la familia antes de ampliar o regenerar un thumbnail. Agrupar exactos por hash y parecidos por comparación perceptual/visual; un hash distinto no prueba original diferente, y parecido no autoriza borrado.

Asignar selección/orden por canal en media_assignments:
1. Foto protagonista correcta para el alojamiento o finalidad.
2. Distribución y comodidad real de habitaciones/camas.
3. Baños, cocina y exterior cuando existan en esa unidad.
4. Piscina/áreas comunes con alcance y acceso correctos.
5. Detalles de identidad, ambiente y experiencias realmente disponibles.

No reutilizar siempre la misma foto ni rotar al azar. Cada hero/galería debe cubrir beneficios reales sin repetir el mismo encuadre. Mantener alternates y motivo de elección/retiro. Para Makaiza, la preferencia actual de Mauricio es la terraza abierta del apartamento #11; encontrar su original y confirmar correspondencia antes de usarla.

### Editar una copia, conservar la verdad

| Tratamiento | Regla |
| --- | --- |
| Luz, exposición, balance de blancos, color y reducción moderada de ruido | Permitido en derivado conservador; mantener colores, materiales y aspecto plausible. |
| Encuadre, horizonte y perspectiva | Mantener tamaño/proporción percibidos, arquitectura, circulación y todas las particularidades que cambian la decisión. |
| Cables u objetos temporales que distraen | Revisión caso a caso; se puede limpiar composición sin modificar servicios ni ocultar defecto físico/seguridad. |
| Personas, matrículas o datos privados | Minimizar/anonimizar dentro del alcance y derechos aprobados; nunca divulgar originales privados. |
| Ventanas, puertas, muros, camas, cocina, piscinas, vista y distancias | No añadir, quitar, reubicar, agrandar o simular. No vender un cuarto distinto del real. |
| Defectos permanentes, humedad, peligro o condición material del servicio | Operaciones debe corregir y volver a fotografiar. La edición comercial no oculta el problema. |
| Upscale o restauración | Preferir un original mejor; no reconstruir texturas/detalles como prueba real ni prometer calidad inexistente. |
| Generación conceptual | Identificar como concepto/ilustración. No asignar a una habitación o instalación como evidencia comercial real. |
| Logos/identidad oficial | Bytes maestros exactos, sin redibujar ni recolorear por estandarización. |

Cada variante conserva original/revisión/hash, receta o prompt, herramienta/modelo/fecha, cambios, evaluador, destino y aprobación de esa versión. Comparar antes/después lado a lado y revisar límites arquitectónicos. Si no pasa, conservar original y pedir otra toma. Exportes pueden omitir GPS/datos privados; el original privado conserva evidencia permitida.

El perfil visual aplica Brand/Design DNA verificado por marca: exposición/color consistente, luz natural, verticales cuidadas y nitidez razonable, sin filtro genérico que cambie los lugares. Generar los recortes y tamaños que necesita cada canal desde el maestro aprobado. Para web, variantes responsivas y WebP/AVIF cuando el canal lo soporte; verificar calidad, fallback, peso real, recorte móvil, carga y layout. No subir el master pesado a todos los canales ni reducir todas las fotos a un peso fijo.

No confundir permiso para editar con permiso para publicar. Cada destino conserva su gate; Kross sigue autoridad de oferta comercial y la web no recibe cambios por este documento.

## 12. Adopción gradual y contrato común para asistentes

### Implementación sobre trabajo existente

Reutilizar `initiative_bindings.visual_commerce_dreamcatcher`; no abrir otra iniciativa. TORO Assets y el Asset Librarian existente poseen inventario/identidad/linaje/curación; Brand Guard revisa fidelidad/derechos; TORO Channels integra cada destino; Operaciones confirma lugares/defectos y nueva fotografía. No activar otro agente persistente por nombrar un rol.

| Orden | Entrega acotada | Criterio de terminado |
| --- | --- | --- |
| Ahora | Nombres humanos para documentos nuevos; propuesta y cotizador del retreat en el destino elegido | Dos cargas completed y lectura de IDs/rutas/tamaños, sin alterar versiones fuente. |
| Después | Reconciliar manifest e índice; inspección visual de 30 originales representativos bajo issues existentes #6/#28/#30 | Cobertura fechada, clases correctas, identidad/estado/duplicados registrados; ningún screenshot como fotografía comercial. |
| Después | Selección por tres villas, unidades/áreas y retreat, con faltantes | Contact sheets de alternativas y explicación, aprobación de cada selección y orden; no conteos físicos inventados. |
| Piloto | Una foto: original → mejora conservadora → antes/después → exportes → destino autorizado | Identidad, fidelidad y derechos PASS, referencia y rollback verificables; implementación preparatoria PR #43 se revisa en su estado actual. |
| Gradual | Sustituir por lotes aprobados en web, fichas, propuestas, Kross y otros canales | Readback de asset/orden/crop, vista móvil/escritorio y cero unidades mal atribuidas; preservar versión anterior y URL estable cuando proceda. |

El binding de proyecto vivo, los originales autorizados, el adapter server-side y la publicación E2E siguen por verificar en su lane. No inventar nuevas columnas: usar title/original_filename/subject_key/verified_status y assignments actuales cuando aplican; mapear linaje/receta/hashes en los contratos existentes antes de ampliar esquema. Las bases se reconcilian con IDs y proyecciones por campo, no copiando catálogos completos de ida y vuelta.

Medir solo lo útil: cobertura verificada por unidad/área, errores de identidad, tiempo de selección, porcentaje de imágenes aprobadas con original y QA, peso/carga por canal, reproceso y conversión cuando exista atribución válida. Sin baseline, no declarar mejora de ventas ni ahorro.

Cada lote termina con entrega, límite de tiempo/intentos, checkpoint autorizado y alerta única ante bloqueo nuevo. No mantener búsquedas o workers indefinidamente ni generar contenido para llenar capacidad. Respetar las reglas de parada y el Control Plane existentes.

### Texto común para ChatGPT, Codex y TORO

> Antes de crear un documento o usar media, consulta el Plan General y TORO Studio actuales. Reutiliza el proyecto, identidad, registros y archivos existentes. Nombra el entregable para humanos, con marca/tema/unidad o proyecto/período/idioma/versión cuando aporte valor; conserva IDs, procedencia y original. Selecciona media por contenido, lugar real, derechos y pertinencia, no por nombre, peso, score aislado o primer resultado. Nunca uses screenshots como fotos de instalaciones. Mejora solo una copia con fidelidad arquitectónica y compara antes/después. No ocultes defectos materiales ni inventes vistas, espacios, servicios o logos. Registra variante, aprobación, canal y orden antes de publicar. Guarda/verifica en el destino autorizado y actualiza el registro existente por lotes, sin bases, planes o agentes duplicados. Configurado/documentado, probado, aprobado y publicado son estados distintos.

Este texto es una propuesta común versionada. Registrar la referencia en toro-context no modifica ajustes personales/globales de ChatGPT, skills instaladas, agentes vivos ni derechos de publicación; su adopción por cada superficie requiere un adapter/configuración verificable.

### Fuentes del método

- IPTC Photo Metadata Standard: https://iptc.org/standards/photo-metadata/iptc-standard/ (identidad, descripción, lugar mostrado, autor/derechos y procedencia).
- Adobe Lightroom, edición no destructiva: https://helpx.adobe.com/es/lightroom-classic/desktop/help/applying-adjustments-develop-module-basic.html (original intacto y ajustes separados).
- web.dev, formatos de imagen AVIF: https://web.dev/learn/images/avif (calidad/peso y necesidad de variantes/fallback según uso).
- Inventario/sets Dropbox leídos 13/10/2026; fechas de manifests preservadas. Su clasificación histórica permanece candidata.
- Registro content.media_assets/media_assignments leído 13/10/2026; tenant/propiedad Dreamcatcher únicamente.
- Brief comercial Dreamcatcher del 13/10/2026: contexto y excepciones por unidad, no disponibilidad live ni autoridad para alterar fotos.
