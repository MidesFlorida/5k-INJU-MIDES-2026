# Mapa público y editor · 5K INJU–MIDES Florida 2026

Este repositorio contiene una vista pública (index.html), un editor cartográfico (editor.html) y la API de Google Apps Script (apps-script/Code.gs). Permite dibujar recorridos, polígonos/áreas y marcadores; cada elemento admite título, descripción, horario, detalles, color y visibilidad pública.

## 1. Crear la hoja de datos

1. Creá una hoja de cálculo de Google nueva.
2. Copiá el identificador que aparece entre /d/ y /edit en la URL.
3. El script crea la pestaña Mapa5K y sus encabezados automáticamente.

## 2. Preparar Apps Script

1. Abrí https://script.google.com/ y creá un proyecto nuevo.
2. Copiá el contenido de apps-script/Code.gs a Código.gs.
3. En Configuración del proyecto → Propiedades del script, agregá:
   - SPREADSHEET_ID: identificador de la hoja del paso 1.
   - ADMIN_KEY: una clave de edición larga, única y difícil de adivinar. No la publiques en el repositorio.
4. Guardá y ejecutá manualmente prepararHoja5K. Aceptá los permisos de Google Sheets.
5. Elegí Implementar → Nueva implementación → Aplicación web.
6. Ejecutar como: tu cuenta. Acceso: Cualquier persona (la vista pública necesita leer datos sin iniciar sesión). Implementá y copiá la URL que termina en /exec.

Importante: el endpoint permite lectura pública. La escritura exige ADMIN_KEY. No compartas esa clave. El editor la solicita al abrirse y no queda escrita en el código de la página.

## 3. Conectar la web

En ambos archivos, index.html y editor.html, buscá esta línea:

    const API_URL='';

Pegá entre comillas la URL de la aplicación web, por ejemplo:

    const API_URL='https://script.google.com/macros/s/TU_ID_DE_IMPLEMENTACION/exec';

Guardá ambos archivos en GitHub. En el repositorio, abrí Settings → Pages y publicá desde la rama main, carpeta / (root).

## 4. Uso

- Página pública: https://midesflorida.github.io/5k-INJU-MIDES-2026/
- Editor: https://midesflorida.github.io/5k-INJU-MIDES-2026/editor.html
- Al abrir el editor, ingresá la clave configurada en ADMIN_KEY.
- Completá nombre y descripción, elegí categoría y tipo de dibujo, y pulsá Dibujar en el mapa.
- Dibujá la línea, el polígono o el marcador. Luego pulsá Guardar en Google Sheets.
- La página pública consulta la hoja y actualiza los datos periódicamente. Los elementos marcados como Oculto no aparecen en el mapa público.

## Consideraciones

- El mapa comienza centrado en Plaza Artigas, Florida. No incluye un trazado inventado: dibujá y guardá el recorrido oficial.
- El mapa base depende de OpenStreetMap y Leaflet/Leaflet Draw se carga desde CDN.
- La API usa JSONP para permitir la lectura desde GitHub Pages. Evitá descripciones muy largas.
- La clave compartida es una protección sencilla, no autenticación empresarial. Para permisos por usuario o auditoría se necesita autenticación formal.
- Antes del evento, probá crear un elemento, confirmar que aparece en la hoja y en la vista pública; luego eliminá el elemento de prueba.
