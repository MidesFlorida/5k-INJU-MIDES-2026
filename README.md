# Mapa público y editor · 5K INJU–MIDES Florida 2026

Este repositorio contiene la vista pública del mapa y el editor cartográfico del evento. El backend utiliza el **mismo proyecto de Google Apps Script y la misma hoja de cálculo que el Centro de Prensa MIDES Florida**, por lo que no debe crearse un backend separado ni reemplazarse el script compartido por el antiguo script independiente de este repositorio.

## Archivos y conexión

- Mapa público: https://midesflorida.github.io/5k-INJU-MIDES-2026/
- Editor: https://midesflorida.github.io/5k-INJU-MIDES-2026/editor.html
- Pestaña exclusiva del mapa: `Mapa5K`
- La URL de Apps Script ya está configurada en `index.html` y `editor.html`.

## Paso pendiente: actualizar el proyecto compartido de Apps Script

Los cambios de GitHub no se copian automáticamente al editor de Apps Script. Para activar la integración:

1. Abrí el mismo proyecto de Apps Script que usa el Centro de Prensa MIDES Florida.
2. Antes de modificarlo, conservá una copia de seguridad de su código actual.
3. Integrá en ese proyecto los cambios del archivo `apps-script/Code.gs` del repositorio `MidesFlorida/CENTRO-PRENSA-MIDES-FLORIDA`. Ese archivo mantiene el enrutamiento de Centro de Prensa e incorpora las acciones `mapa5kList` y `mapa5kSave` y los helpers con prefijo `mapa5k_`.
4. Guardá y elegí **Implementar → Gestionar implementaciones → Editar → Nueva versión → Implementar**. Conservá la URL existente que termina en `/exec`.
5. Abrí el editor del mapa, ingresá la clave editorial que ya utiliza el Apps Script compartido y probá guardar un elemento de prueba. Confirmá que se registre en `Mapa5K` y aparezca en el mapa público.

**No pegues el antiguo archivo independiente `5k-INJU-MIDES-2026/apps-script/Code.gs` encima del script compartido:** contiene sus propios `doGet`, `getSheet_` y encabezados, y podría interferir con el Centro de Prensa.

## Qué protege la integración

- Las acciones del mapa tienen nombres propios (`mapa5kList`, `mapa5kSave`) y no reemplazan las acciones editoriales existentes.
- El mapa lee y escribe únicamente en la pestaña `Mapa5K`.
- Si la pestaña ya existe con encabezados incompatibles, la integración se detiene para proteger sus datos.
- No se inventa un recorrido oficial: el recorrido debe dibujarse y guardarse desde el editor.

## Verificación

El código se guardó en GitHub y se revisó que las páginas usen las acciones específicas del mapa. **La prueba final en producción queda pendiente hasta actualizar y volver a implementar el proyecto de Apps Script compartido.**
