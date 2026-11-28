# Tablas propias del sistema de clasificaciones alojadas en la web

Complementa la decisión [04]. El schema de Prisma es **compartido** entre la web y este sistema: todas las tablas existen en ambas bases con las mismas columnas y restricciones. La definición está en `backend/prisma/schema.prisma` y no se repite acá.

## Tablas que escribe este sistema y la web solo aloja

| Tabla | Qué guarda |
|---|---|
| `Dorsal`, `Chip`, `LecturaRFID`, `LectorRFID`, `LecturaHuerfana` | Dorsales, chips y lecturas RFID generados durante la carrera. `Chip.numero` es el código EPC (decisión [06]) y `LecturaHuerfana` guarda las lecturas sin chip asociado |
| `EjecucionCarrera` | Hora real de inicio y fin de la carrera (decisión [02]) |
| `PlantillaCertificado` | Plantillas de certificado |
| `ClaveRespaldo`, `UsoClaveRespaldo` | Claves de ingreso de contingencia (decisión [05]) |
| `RegistroModificacion` | Trazabilidad de las modificaciones manuales: una fila por campo cambiado, con usuario, fecha y hora, valor anterior y valor nuevo (decisión [07]) |

La web **no usa** `EjecucionCarrera` en su lógica: la aloja para que quede el registro de la hora real y para que todos los equipos puedan descargarla. `clasificacion.service.ts` la lee para calcular tiempos.

## Reglas para la web
- Los `id` (UUID) y las fechas (`fechaHora*`) los envía el sistema local: no depender de defaults de la base.
- Una operación recibida con un `id` ya existente debe tratarse como actualización, sin error: la cola de subida es bloqueante y un rechazo frena todo lo posterior.
- La web no borra ni modifica estas filas por su cuenta.
- Las restricciones (`UNIQUE`, FKs, cascadas) se hacen cumplir en la base web: es la única que las garantiza entre varios equipos.
- Cualquier cambio de columnas se hace en el schema compartido y debe coordinarse entre ambos sistemas.
- `ClaveRespaldo`: ver `claves-respaldo-web.md`. La web debe aceptar y conservar `claveCifrada` cuando la sube un equipo local.