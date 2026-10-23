# Biblioteca de Economía · UNAJ

Rediseño de la biblioteca original, con portada nocturna de Juliaca, tipografía Inter, azul `#0066FF`, amarillo `#FFF700`, selección horizontal de semestres y cursos en mosaico adaptable.

## Abrir y publicar

- Descomprime el proyecto y abre `index.html` para consultar la biblioteca real. Necesita internet y que la hoja de Google Sheets conserve el acceso de lectura correspondiente.
- Abre `vista-previa.html` para revisar el diseño sin depender de Sheets. Una franja identifica los cursos como ejemplos; no representan el plan de estudios real ni tienen enlaces de materiales.
- Para alojarlo, sube el contenido de esta carpeta a cualquier servidor estático. No necesita instalación, compilación ni claves privadas.
- Inter se solicita a Google Fonts. Si no hay conexión, la interfaz utiliza la tipografía del sistema.

## Datos reales y enlaces

`config.js` conserva la hoja `Secciones` y la carpeta del Banco de trabajos incluidas en el proyecto original.

La hoja se interpreta con las mismas ocho columnas, en este orden:

| Columna | Contenido |
| --- | --- |
| A | Identificador |
| B | Nombre del curso |
| C | Semestre, del 1 al 10 |
| D | Descripción |
| E | Tipo de acceso: público o restringido |
| F | Enlace HTTPS a los materiales |
| G | Activo: Sí / No |
| H | Orden dentro del semestre |

Se conservan solo cursos activos con nombre y semestre válido. Los resultados se ordenan por semestre y orden. Las búsquedas ignoran mayúsculas y tildes y cubren todos los semestres. Escribir filtra sin desplazar la página; el botón Buscar lleva a los resultados.

La biblioteca vuelve a consultar Sheets cada 60 segundos mientras está visible y al regresar a la pestaña. Conserva el semestre y la búsqueda; si falla una actualización, mantiene los cursos ya cargados y reintenta. El intervalo se configura con `refreshIntervalMs` en `config.js` (mínimo 30 segundos). La disponibilidad de los cambios también depende de la respuesta de Google Sheets; no es una conexión instantánea.

Si no aparece un curso nuevo, comprueba que está en la pestaña `Secciones`, que B contiene su nombre, C un número entero entre 1 y 10 y G `Sí`. No agregues columnas intermedias ni cambies el orden de A–H. Elige «Todos» para descartar el filtro de semestre. La vista `?demo=1` utiliza ejemplos locales y no consulta Sheets. Después de publicar esta actualización del código, no es necesario volver a subir los archivos de la web cada vez que agregues una fila válida.

No se incluyen materiales ni se cambian permisos de las carpetas. Google Drive controla el acceso real. Una URL vacía o inválida se muestra como «Materiales próximamente», sin un botón engañoso.

## Canal de aportes pendiente

El proyecto original contenía un correo de ejemplo. Completa `aporteEmail` o `aporteUrl` en `config.js` con el canal confirmado del Centro Federado. Mientras estén vacíos, la página explica cómo coordinar el envío y no presenta un envío inexistente. Los aportes pasan por revisión antes de publicarse.

## Imágenes

- `plaza-juliaca-noche.png`: imagen reconstruida a partir del afiche nocturno aportado, sin textos promocionales; se conserva la inscripción de la plaza.
- `historia-juliaca.png`: ilustración cultural derivada del afiche aportado, sin títulos, fechas ni logotipos del evento. Se utiliza en «Historia e identidad».
- `plaza-juliaca-dia.jpg`: fotografía diurna aportada para «Acerca de la biblioteca».
- `economia-territorio.png`: ilustración económica aportada para el Banco de trabajos.
- `escudo-economia.jpeg`: escudo del proyecto original.

Las dos primeras imágenes fueron editadas con generación de imagen. Son adaptaciones visuales y pueden contener diferencias de detalle respecto de los originales. Las ilustraciones territoriales no se presentan como cartografía oficial.

## Accesibilidad y adaptación

Incluye navegación por teclado, etiquetas de buscador y botones, estados de selección, avisos de resultados, enlace de salto al contenido, menú móvil con cierre mediante Escape y respeto por la preferencia de movimiento reducido. En pantallas pequeñas, los semestres se desplazan horizontalmente y el mosaico usa dos columnas.

## Comprobaciones

Para ejecutar las pruebas del procesamiento de datos y los estados de interacción:

```bash
node --test tests/*.test.cjs
```

Se verifican la estructura de la respuesta de Sheets, filtros, tildes, enlaces HTTPS, estados de carga/error, reintentos, navegación y sincronización automática: filas nuevas, conservación de filtros y datos ante fallos, pausa en segundo plano y aislamiento de la vista de ejemplo. La revisión visual en navegador queda pendiente: el servicio de vista previa del entorno de desarrollo no estaba disponible. El acceso a la hoja en producción depende de su configuración de lectura.
