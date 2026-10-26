# API independiente del mapa 5K INJU–MIDES Florida

Esta carpeta contiene el backend exclusivo del proyecto 5K y la siguiente planilla, sin compartir código ni datos con el Centro de Prensa MIDES Florida:

https://docs.google.com/spreadsheets/d/1I77KCptylJ6GX9KnlshDEZSRfK4BGasUOT93fXjBzTo/edit

## Actualizar la API que ya usa el sitio

La URL de la implementación web actual está definida en `api-config.js`. Para mantener esa URL:

1. Abrí [Google Apps Script](https://script.google.com/) y buscá el proyecto independiente que publicó la URL actualmente configurada en `api-config.js`.
2. Hacé una copia de seguridad del contenido actual de ese proyecto. Confirmá que sea la API exclusiva de la 5K y no el proyecto de Centro de Prensa.
3. Reemplazá el contenido de su archivo `Code.gs` por el archivo actualizado `apps-script/Code.gs` de este repositorio y guardá.
4. En **Configuración del proyecto → Propiedades del script**, confirmá que exista `ADMIN_KEY` y que su valor coincida con la clave que vas a ingresar en el editor. No publiques esa clave.
5. En el selector de funciones, ejecutá `prepararMapa5K` una vez y aceptá los permisos solicitados. Esto crea/verifica `Mapa5K`, `CorredoresGPS`, `CronometroCarrera` y `TiemposCorredores`, protegiendo las hojas con datos cuyos encabezados no coincidan.
6. Elegí **Implementar → Gestionar implementaciones → Editar → Nueva versión → Implementar** para actualizar la aplicación web existente sin cambiar su URL `/exec`.
7. Abrí el editor y pulsá **Verificar Google Sheets**. Después probá el cronómetro individual desde el mapa público: iniciá una prueba, detenela y verificá que se guarde una fila en `TiemposCorredores`. El GPS debe probarse desde un teléfono con ubicación autorizada y el botón de compartir activado voluntariamente.

Si no tenés acceso al proyecto que corresponde a la URL actual, creá un proyecto independiente nuevo, pegá allí este `Code.gs`, ejecutá `prepararMapa5K`, configurá `ADMIN_KEY`, implementá como aplicación web y reemplazá la URL en `api-config.js`.

## Hojas y estructura

- `Mapa5K`: `ID | Nombre | Tipo | Geometria | Descripcion | Horario | Detalles | Color | Visible | PuntosJSON | FechaActualizacion`
- `CorredoresGPS`: `ID | AliasPublico | Latitud | Longitud | PrecisionMetros | Activo | ActualizadoMs`
- `CronometroCarrera` (compatibilidad anterior): `Estado | InicioMs | FinMs | ActualizadoMs`
- `TiemposCorredores`: `ID | CorredorID | AliasPublico | Estado | InicioMs | FinMs | TiempoMs | ActualizadoMs`

El guardado de las capas es acumulativo: actualizar o agregar una capa no borra las demás. Las ubicaciones GPS solo se exponen en la API si están activas y fueron actualizadas en los últimos 45 segundos; los registros GPS antiguos se eliminan al ocurrir una actualización posterior pasadas 24 horas.

## Acciones JSONP de la API

- `mapa5kList`, `mapa5kSave`
- `mapa5kGpsList`, `mapa5kGpsActualizar`, `mapa5kGpsDetener`
- `mapa5kCarreraEstado`, `mapa5kCarreraIniciar`, `mapa5kCarreraFinalizar` (compatibilidad con el cronómetro común anterior)
- `mapa5kTiempoEstado`, `mapa5kTiemposList`, `mapa5kTiempoIniciar`, `mapa5kTiempoFinalizar`
- `mapa5kInicializar`, `mapa5kDiagnostico`, `ping`

El guardado de capas y las acciones del cronómetro común antiguo requieren `ADMIN_KEY`. Los cronómetros individuales son de autoservicio para que cada corredor pueda iniciar y detener su registro; el dorsal/alias y los tiempos finalizados se muestran públicamente. Compartir GPS requiere consentimiento expreso mediante el control del mapa; el alias y la posición se hacen visibles a cualquier visitante.
