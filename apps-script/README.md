# Backend propio del mapa 5K INJU–MIDES Florida

Esta carpeta contiene el código de Google Apps Script que utiliza exclusivamente el proyecto 5K y esta planilla:

https://docs.google.com/spreadsheets/d/1I77KCptylJ6GX9KnlshDEZSRfK4BGasUOT93fXjBzTo/edit

## Activación inicial (una sola vez)

1. Abrí https://script.google.com/ y creá un **proyecto nuevo e independiente** para el mapa 5K. No uses el proyecto del Centro de Prensa.
2. Reemplazá el contenido de `Code.gs` por el archivo `apps-script/Code.gs` de este repositorio y guardá.
3. En **Configuración del proyecto → Propiedades del script**, agregá la propiedad `ADMIN_KEY` con una clave de edición que después ingresarás en el editor. No la publiques en el repositorio.
4. En el selector de funciones, elegí `prepararMapa5K` y pulsá **Ejecutar**. Aceptá los permisos solicitados. Esto crea o verifica la pestaña `Mapa5K` y sus encabezados sin borrar registros existentes.
5. Abrí **Implementar → Nueva implementación → Aplicación web**. Seleccioná **Ejecutar como: tú** y el acceso que permita a los usuarios de este sitio consultar el mapa (habitualmente **Cualquier persona**). Implementá y copiá la URL terminada en `/exec`.
6. En este repositorio, abrí `api-config.js` y asigná esa URL a `window.MAPA5K_API_URL`, entre comillas. Guardá el cambio en GitHub.
7. Abrí la página pública y el editor 5K para comprobar la lectura; desde el editor, pulsá **Verificar Google Sheets** y luego guardá una capa de prueba.

## Columnas de la pestaña Mapa5K

`ID`, `Nombre`, `Tipo`, `Geometria`, `Descripcion`, `Horario`, `Detalles`, `Color`, `Visible`, `PuntosJSON`, `FechaActualizacion`.

El guardado es acumulativo: actualiza las capas que recibe y agrega las nuevas sin vaciar el resto de la hoja. La API tiene validación de escritura y una acción de diagnóstico que verifica el ID de planilla de destino.
