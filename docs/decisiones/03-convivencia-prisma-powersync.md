# [03] - Convivencia entre Prisma y las vistas de PowerSync

- **Afecta:** backend
- **Estado:** pendiente (se completa al terminar el spike)

## Contexto y problemática
El backend accede a la base local con Prisma (`@prisma/adapter-better-sqlite3`) y sus migraciones crean tablas reales con `@unique` y claves foráneas.

PowerSync, por defecto, no crea tablas reales en el cliente: crea **vistas** sobre los datos JSON que guarda en tablas internas (`ps_data__<tabla>`). Consecuencias para este proyecto:

- Las vistas no hacen cumplir `UNIQUE`, claves foráneas ni borrados en cascada.
- Las columnas del schema de PowerSync solo pueden ser `text`, `integer` o `real`. Los `Boolean` y `DateTime` de Prisma deben representarse con esos tipos.
- No existen defaults de base de datos (`@default(now())`, `@updatedAt`): quien escribe debe proveer esos valores. Los `id` ya son UUID generados por la aplicación.
- Las escrituras hechas con el SDK de PowerSync (`execute`) entran a la cola de subida. La cola es FIFO y bloqueante: una operación rechazada frena las que están detrás.
- Existe una alternativa, las **raw tables**, donde las tablas son reales y se administran a mano (se pueden usar FKs si se declaran `DEFERRABLE INITIALLY DEFERRED` y se activa `pragma foreign_keys`), a costa de definir el mapeo y los triggers de captura de escrituras.

Fuentes (documentación oficial de PowerSync):
- https://docs.powersync.com/architecture/client-architecture
- https://docs.powersync.com/client-sdks/cascading-delete.md
- https://docs.powersync.com/client-sdks/advanced/raw-tables
- https://docs.powersync.com/client-sdks/reference/node

Todavía no se sabe si Prisma puede leer y escribir sobre esas vistas sin romper la cola de subida.

## Spike

**Alcance:** una sola tabla, `PlantillaCertificado` (sin FKs ni `@unique`, exclusiva de este sistema, con `Boolean`, `DateTime`, `@default(now())` y `@updatedAt`).

**Modo:** local-only. Se instancia la base de PowerSync sin llamar a `connect()`: no requiere la base web ni sync rules.

**Dónde:** script aislado en `backend/spike/`, sobre una copia de la base. No toca código productivo.

| # | Verificación | Resultado |
|---|---|---|
| 1 | Prisma `findMany` sobre la vista devuelve `Boolean` y `DateTime` con el tipo correcto | _pendiente_ |
| 2 | Prisma `create` sobre la vista funciona y la fila entra a la cola de subida (hipótesis: no entra) | _pendiente_ |
| 3 | Escritura con el SDK de PowerSync y lectura con Prisma: tipos correctos | _pendiente_ |
| 4 | Quién completa `id`, `fechaHoraCreacion` y `fechaHoraModificacion` (`@updatedAt` no se actualiza solo en la vista) | _pendiente_ |
| 5 | Prisma y el SDK abiertos sobre el mismo archivo: ¿aparece "database is locked" con escrituras seguidas? (PowerSync indica una sola instancia por archivo) | _pendiente_ |
| 6 | `prisma migrate` contra una vista del mismo nombre: ¿choca? ¿cómo se excluye la tabla? | _pendiente_ |
| 7 | Insertar en la vista un `id` ya existente: ¿se rechaza? (sirve para la estrategia de ids determinísticos) | _pendiente_ |
| 8 | Columna excluida del stream (`claveCifrada` en el equipo del Clasificador): al volver a descargar la fila que ese equipo subió, ¿queda vacía en local? | _pendiente_ |
| 9 | Fila escrita en local en una tabla sin stream de descarga para ese rol (`UsoClaveRespaldo` en el Clasificador): ¿persiste o se elimina al subirse? | _pendiente_ |

## Opciones

| Opción | Descripción | Impacto en `@unique` y FKs |
|---|---|---|
| **A** | Prisma solo lee. Las escrituras pasan por el SDK de PowerSync. | Se pierden: hay que reemplazarlas (ver `docs/sincronizacion/restricciones-locales.md`). |
| **B** | Prisma lee y escribe sobre las vistas. Solo si el adapter lo permite sin romper la cola. | Se pierden igual. |
| **C** | Raw tables: tablas reales gestionadas por Prisma Migrate, con mapeo y triggers de PowerSync. | Se conservan (FKs diferidas). Mayor costo de configuración y mantenimiento. |

## Decisión
_A completar con el resultado del spike._

Criterio: si las verificaciones 2 o 5 fallan, se descarta B. Entre A y C se elige según cuánto pesa mantener `@unique` y FKs reales frente al costo de mapeos y triggers manuales.

## Consecuencias
_A completar._ Sea cual sea la opción, esta decisión define cómo se implementan la fusión de personas por DNI y el reemplazo de restricciones.