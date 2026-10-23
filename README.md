# Mapa público y editor · 5K INJU–MIDES Florida 2026

Este repositorio contiene la vista pública del mapa y el editor cartográfico del evento. El backend utiliza el **mismo proyecto de Google Apps Script y la misma hoja de cálculo que el Centro de Prensa MIDES Florida**, por lo que no debe crearse un backend separado ni reemplazarse el script compartido por el antiguo script independiente de este repositorio.

## Archivos y conexión

- Mapa público: https://midesflorida.github.io/5k-INJU-MIDES-2026/
- Editor: https://midesflorida.github.io/5k-INJU-MIDES-2026/editor.html
- Pestaña exclusiva del mapa: `Mapa5K`
- La URL de Apps Script ya está configurada en `index.html` y `editor.html`.

## Reparación de Google Sheets y activación de la API

**La pestaña de datos es `Mapa5K`**, en la hoja [Google Sheets del mapa](https://docs.google.com/spreadsheets/d/1OuIrwtwKQ1mDDTCq-QLuyH-q82Pla2HcKiXqOerDwn4/edit). Los encabezados esperados, en este orden, son:

`ID | Nombre | Tipo | Geometria | Descripcion | Horario | Detalles | Color | Visible | PuntosJSON | FechaActualizacion`

El código ahora crea la pestaña si falta y coloca estos encabezados cuando está vacía o solo contiene una fila de encabezados incorrectos. Si encuentra registros existentes con encabezados incompatibles, se detiene para protegerlos.

**Importante: publicar el backend es un paso independiente de GitHub.**

1. Abrí el mismo proyecto de Apps Script que utiliza el Centro de Prensa MIDES Florida.
2. Hacé una copia de seguridad del código actual antes de integrar cambios.
3. Integrá el archivo actualizado `apps-script/Code.gs` del repositorio `MidesFlorida/CENTRO-PRENSA-MIDES-FLORIDA`, conservando todas las funciones editoriales. Incluye las acciones `mapa5kList` y `mapa5kSave` y funciones auxiliares con prefijo `mapa5k_`.
4. En el selector de funciones, ejecutá `prepararMapa5K` una vez y aceptá los permisos. En el registro de ejecución debe aparecer `ok: true`, la pestaña `Mapa5K` y los encabezados.
5. Guardá el proyecto. Luego elegí **Implementar → Gestionar implementaciones → Editar → Nueva versión → Implementar**. Mantené la URL actual que termina en `/exec`.
6. Abrí el [editor del mapa](https://midesflorida.github.io/5k-INJU-MIDES-2026/editor.html), ingresá una clave editorial válida y probá guardar un punto de prueba. Confirmá que aparezca una fila nueva en `Mapa5K` y que el editor muestre confirmación de la API.

La clave se valida contra las claves editoriales configuradas en el Apps Script compartido; no agregues claves al HTML público.

**No pegues el antiguo archivo independiente `5k-INJU-MIDES-2026/apps-script/Code.gs` encima del script compartido:** contiene sus propios `doGet`, `getSheet_` y encabezados, y podría interferir con el Centro de Prensa.

## Qué protege la integración

- Las acciones del mapa tienen nombres propios (`mapa5kList`, `mapa5kSave`) y no reemplazan las acciones editoriales existentes.
- El mapa lee y escribe únicamente en la pestaña `Mapa5K`.
- Si la pestaña ya existe con encabezados incompatibles, la integración se detiene para proteger sus datos.
- No se inventa un recorrido oficial: el recorrido debe dibujarse y guardarse desde el editor.

## Verificación

El código se guardó en GitHub y se revisó que las páginas usen las acciones específicas del mapa. **La prueba final en producción queda pendiente hasta actualizar y volver a implementar el proyecto de Apps Script compartido.**
