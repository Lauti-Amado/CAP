# Momentos de sincronización de datos

## Objetivo
Especificar, por cada funcionalidad del sistema, qué información se trae de la base central, qué información se envía y en qué momento, para operar con la base local (SQLite) durante la carrera.

## Aclaración
- **Traer datos:** descargar información desde la base de datos central hacia la base local (SQLite).
- **Enviar datos:** transmitir al servidor central los datos generados o modificados localmente.
- **Sincronizar:** actualizar ambas bases para mantenerlas consistentes.

Las pantallas siempre leen y escriben en la base local. La sincronización con la base central ocurre en segundo plano (PowerSync) y no la dispara el usuario desde una pantalla.

## Tabla por funcionalidad

| Funcionalidad | Cuándo traer datos | Qué datos se traen | Cuándo enviar datos | Qué datos se envían |
|---|---|---|---|---|
| Entrega de kits | El día pactado antes de la carrera. Al buscar un DNI o tocar "Dar kit" en la lista, se lee lo ya descargado. | Corredores inscriptos, estado de pago de la inscripción, apto médico, carrera, productos adquiridos. | Al entregar cada kit, apenas haya conexión (*1). | Entrega de kit, dorsal asignado y cambio de estado de la inscripción a Confirmada. |
| Lista de inscripciones | El día pactado antes de la carrera. | Inscripciones y datos de los corredores. | No se envían datos. | Ninguno. |
| Nuevas inscripciones | El día pactado antes de la carrera. | Carrera, distancias con precio, productos, corredores existentes (para no duplicar por DNI). | Al terminar de crear una inscripción correctamente (desde cualquiera de los 3 botones). | Persona, corredor, contacto de emergencia, apto médico (si se requiere), compra presencial y su comprobante y productos (si la persona lo quiere) si no existían y la inscripción. |
| Clasificación manual | El día anterior a la carrera como mínimo. | Entregas de kits actualizadas, dorsales y datos de los corredores. | Apenas se registra cada puesto, si hay conexión. Obligatorio al terminar la carrera. | Puesto general, tiempo y estado de cada corredor. |
| Clasificación en tiempo real | El día anterior a la carrera como mínimo. | Entregas de kits actualizadas, dorsales y chips asociados, datos de los corredores. | Apenas se registra cada llegada, si hay conexión. Obligatorio al terminar la carrera. | Puesto general, tiempo y estado de cada corredor, con los datos de los chips. |
| Inicio y fin de carrera | Automáticamente, previo a la carrera, consulta la carrera y su estado. | Carrera y su estado. | Al iniciar la carrera (el administrador toca "Iniciar carrera") y al finalizarla. | Estado de la carrera y hora real de inicio y de fin. Al finalizar, los corredores sin llegada pasan a "No finalizó". |
| Resultados | No recibe datos: usa todos los datos locales. | Ninguno. | Al terminar la carrera. Si no hay internet, el día posterior apenas haya conexión. Después, cada vez que se modifica la clasificación. | Resultados finales y sus modificaciones posteriores. |
| Grand Prix | Se actualiza en segundo plano cuando hay internet, sin un momento específico. | Datos del campeonato anual, afiliaciones y resultados de las demás carreras. | Solo al usar el botón "Recalcular puntos". | Puntos totales por corredor, acumulados en todas las carreras en las que participó en el período. |
| RFID | De la base web: nada. Del hardware: dorsal asociado al chip y lecturas del chip. | Lecturas del chip. | Al terminar la clasificación de cada persona, si es posible. | Lecturas, tiempos y demás datos registrados. |
| Categorías | Nada. | Ninguno. | Al crear o modificar una categoría, si es posible. | Categoría y sus criterios. |
| Certificados | Una vez finalizada la carrera, se consultan los datos en el momento para verificar su veracidad. | Datos del corredor y la carrera: nombre, carrera, fecha y tiempo. | Al intentar enviar el mail. | Estado de envío del certificado (se pudo enviar o no). |
| Claves de respaldo | Antes del evento, con la sincronización inicial. | Hash y estado de las claves de las cuentas de Clasificador (y su valor cifrado, solo el Administrador) | Apenas se conecte a internet. | Estado de cada clave (disponible, utilizada, invalidada) y quién la usó. |
| Usuarios y roles | Antes del evento, junto con la sincronización inicial. | Usuarios del personal, sus roles y el hash de contraseña (para iniciar sesión sin conexión). | Cuando un administrador cambia los roles de un usuario. | Roles asignados. |

(*1) "De ser posible" significa: si hay conexión se envía en el momento. Si no, queda en la cola local y se envía al recuperarla.

## Qué pasa si falla (por funcionalidad)

En todas las funcionalidades, si el envío falla o no hay conexión, el dato queda guardado en la base local y en la cola de envío, y la operación en pantalla se considera hecha. No se pierde información ni se bloquea el trabajo en la carrera.

Casos particulares:
- **Certificados:** el mail necesita internet. Si no hay conexión, el certificado queda pendiente y se reintenta al recuperarla. Un certificado ya enviado no se vuelve a enviar.
- **Claves de respaldo:** si no se pudo enviar el estado de una clave usada, se envía apenas haya conexión.
- **Grand Prix:** si no hay conexión, se muestran los puntos locales hasta la próxima actualización.

## Sincronización inicial
Información que debe estar disponible localmente antes de comenzar el evento.

| Funcionalidad | Cuándo |
|---|---|
| Entrega de kits, lista de inscripciones y nuevas inscripciones | El día pactado antes de la carrera. |
| Clasificación manual y en tiempo real | El día anterior a la carrera como mínimo. |
| Usuarios y roles | Antes del evento, para poder iniciar sesión sin conexión. |
| Certificados | Una vez finalizada la carrera, se necesitan los datos en el momento. |
| Claves de respaldo | Antes del evento, con la sincronización inicial. |

## Sincronización durante la carrera
Se envía en tiempo real, de ser posible (por intervalos o apenas se recupere la conexión):
- Clasificación, tanto en tiempo real como manual, y en consecuencia RFID y resultados.
- Claves de respaldo.

Durante la entrega de kits, de ser posible, se envía en tiempo real:
- Entrega de kits y nuevas inscripciones.

## Sincronización final
Debe enviarse obligatoriamente al servidor una vez finalizada la carrera:
- Clasificación, tanto en tiempo real como manual.
- RFID, si no se pudo durante la carrera.
- Resultados, si no se pudo durante la carrera.
- Claves de respaldo, si no se pudo durante la carrera.

Debe enviarse obligatoriamente una vez finalizada la entrega de kits:
- Entrega de kits.
- Nuevas inscripciones.

La sincronización se considera completa cuando no quedan operaciones pendientes en la cola de envío.

## Conflictos
#### ¿Qué sucede si un dato fue modificado tanto en la base local como en la central?
---
No puede ser posible: Cuando la carrera entra en un estado específico, el sistema web deja de permitir a los usuarios (corredores) cambiar sus datos e inscribirse. Solo pueden visualizar la información de la organización y las carreras (actual, previas y futuras), sin modificar ningún registro.

## Reintentos
Si se intenta enviar información y no hay conexión o falla la operación, la información queda lista para enviarse y almacenada de forma local hasta recuperar la conectividad.

PowerSync conserva las operaciones en la cola y vuelve a intentar enviarlas cuando puede. Por defecto, los errores temporales se reintentan con un intervalo de aproximadamente 5 segundos (configurable según la implementación), respetando el orden de las operaciones.