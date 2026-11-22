# [04] - La base web también almacena las tablas propias del sistema de clasificaciones

- **Afecta:** backend y sistema web
- **Estado:** aplicado

## Contexto y problemática
Parte de lo que genera el sistema de clasificaciones (dorsales, chips, lecturas RFID, hora real de la carrera, plantillas de certificado) se produce en local y sin internet durante la carrera. Para que después lo puedan ver todos, esos datos tienen que terminar en un lugar compartido.

## Decisión
La base de datos web se usa también como **almacenamiento de las tablas propias** de este sistema. Estas tablas existen en la web, pero **las escribe este sistema**. La web las aloja y las expone; no las modifica por su cuenta.

Tablas propias alojadas en la web: `Dorsal`, `Chip`, `LecturaRFID`, `LectorRFID`, `EjecucionCarrera`, `PlantillaCertificado`, `ClaveRespaldo` y `UsoClaveRespaldo`.

Las reglas para la web están en `docs/integracion/tablas-propias-en-web.md`. Las columnas están en `backend/prisma/schema.prisma`, que es compartido.

## Consecuencias
- Los `id` los genera el sistema local (UUID), no la web.
- La web no debe borrar ni modificar estas filas por su cuenta.
- Cualquier cambio de columnas de una tabla propia debe coordinarse con el sistema web, ya que el schema debe coincidir.