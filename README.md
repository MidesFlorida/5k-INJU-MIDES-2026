# Mapa público y editor · 5K INJU–MIDES Florida 2026

Este repositorio contiene la vista pública, el editor cartográfico y la API independiente del evento. **No comparte backend ni planilla con el Centro de Prensa MIDES Florida.**

## Accesos

- [Mapa público](https://midesflorida.github.io/5k-INJU-MIDES-2026/)
- [Editor de diseño](https://midesflorida.github.io/5k-INJU-MIDES-2026/editor.html)
- [Planilla exclusiva de la 5K](https://docs.google.com/spreadsheets/d/1I77KCptylJ6GX9KnlshDEZSRfK4BGasUOT93fXjBzTo/edit)
- La URL de Apps Script que usan las páginas se configura en `api-config.js`.

## Funciones

- Dibujo y edición de rutas, áreas y puntos; guardado acumulativo en la pestaña `Mapa5K`.
- Flechas que indican el sentido de los recorridos en el editor y en el mapa público; al seleccionar una ruta, zona, punto o corredor el mapa acerca la vista al objeto.
- Interfaz adaptable a computadoras, tabletas y teléfonos.
- Icono cuadrado basado en el logo oficial 5K para el favicon, el manifiesto de instalación y los accesos directos de la aplicación web.
- Cronómetro individual: cada corredor ingresa un dorsal o alias, pulsa **Iniciar mi cronómetro** y al llegar pulsa **Detener y registrar tiempo**. El inicio y el final se registran con hora del servidor, y los últimos diez tiempos aparecen en el mapa público.
- Seguimiento GPS **voluntario**: cada participante ingresa un dorsal o alias y activa explícitamente el uso de su ubicación. El alias y la posición actual se ven en el mapa público mientras comparte. Debe dejar la página abierta y permitir el acceso al GPS. El popup del marcador muestra distancia recorrida y restante estimadas a lo largo de la ruta publicada si el GPS está a menos de 350 metros del trazado; son estimaciones y no sustituyen un chip de cronometraje.
- Las últimas posiciones se muestran solo si tienen menos de 45 segundos. El backend elimina registros GPS de más de 24 horas durante una actualización posterior.

## Hojas de Google Sheets

La API crea/verifica estas pestañas cuando ejecutás `prepararMapa5K`:

- `Mapa5K`: geometrías y detalles de los elementos cartográficos.
- `CorredoresGPS`: última posición, alias, precisión, consentimiento activo y hora de actualización.
- `TiemposCorredores`: registro independiente por cada intento, con alias, hora de inicio, hora de llegada y duración calculada por el servidor.
- `CronometroCarrera`: compatibilidad con el cronómetro común de la versión anterior; los nuevos tiempos individuales usan `TiemposCorredores`.

El identificador de la planilla está definido en `apps-script/Code.gs` como `MAPA5K_SPREADSHEET_ID`. Si cambiás de planilla, cambiá ese valor solo en la API independiente de la 5K.

## Activar el cambio de backend

Guardar cambios en GitHub no actualiza automáticamente la implementación de Google Apps Script. Para que funcionen el GPS y el cronómetro:

1. Abrí el proyecto de Apps Script independiente que corresponde a la URL actualmente configurada en `api-config.js`.
2. Hacé una copia de seguridad del código actual y reemplazá su `Code.gs` por el contenido actualizado de `apps-script/Code.gs`. **No modifiques el proyecto del Centro de Prensa.**
3. En Propiedades del script, verificá que `ADMIN_KEY` coincida con la clave que usás en el editor. No la guardes en GitHub.
4. Ejecutá `prepararMapa5K` una vez y autorizá el acceso a la planilla exclusiva de la 5K. La función crea/verifica las pestañas indicadas arriba.
5. En **Implementar → Gestionar implementaciones → Editar → Nueva versión → Implementar**, actualizá la aplicación web existente para conservar la URL `/exec` actual. Si esa implementación o proyecto ya no está disponible, creá una nueva implementación y actualizá `api-config.js` con su URL.

## Privacidad y límites del GPS

Compartir la ubicación es opcional. El participante debe usar un dorsal o alias y confirmar que entiende que su posición se verá públicamente. Puede detener la transmisión en cualquier momento. El mapa deja de mostrar ubicaciones que no se actualizan durante 45 segundos y el navegador puede suspender el GPS si la página pasa a segundo plano, el teléfono bloquea el navegador o se pierde la conexión. Por tanto, el seguimiento es casi en tiempo real, no un sistema de cronometraje deportivo certificado.

Los tiempos individuales se registran de forma separada. Este es un cronómetro autogestionado, no un sistema oficial de chip o fotocélula; las llegadas se deben detener manualmente y los resultados deben revisarse si se usan para clasificación.

## Verificación

El código y las páginas deben estar actualizados en GitHub y el backend debe volver a implementarse antes de validar la experiencia completa en producción.
