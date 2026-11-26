# [03] - Convivencia entre Prisma y las vistas de PowerSync

- **Afecta:** backend
- **Estado:** propuesto (opción A); falta verificar 8 y 9 con el servicio de sync

## Contexto y problemática
El backend accede a la base local con Prisma (`@prisma/adapter-better-sqlite3`) y sus migraciones crean tablas reales con `@unique` y claves foráneas.

PowerSync, por defecto, no crea tablas reales en el cliente: crea **vistas** sobre los datos JSON que guarda en tablas internas (`ps_data__<tabla>`). Consecuencias para este proyecto:

- Las vistas no hacen cumplir `UNIQUE`, claves foráneas ni borrados en cascada.
- Las columnas del schema de PowerSync solo pueden ser `text`, `integer` o `real`. Los `Boolean` y `DateTime` de Prisma deben representarse con esos tipos.
- No existen defaults de base de datos (`@default(now())`, `@updatedAt`): quien escribe debe proveer esos valores. Los `id` ya son UUID generados por la aplicación.
- Las escrituras hechas con el SDK de PowerSync (`execute`) entran a la cola de subida. La cola es FIFO y bloqueante: una operación rechazada frena las que están detrás.
- Existe una alternativa, las **raw tables**, donde las tablas son reales y se administran a mano (se pueden usar FKs si se declaran `DEFERRABLE INITIALLY DEFERRED` y se activa `pragma foreign_keys`), a costa de definir el mapeo y los triggers de captura de escrituras.
- Los `UPDATE` y `DELETE` sobre una vista pueden devolver `rowsAffected = 0` aunque hayan funcionado. Para confirmar que cambió una fila hay que usar `RETURNING`. Si se elige la opción A, hay que revisar los services que dependan de ese conteo.

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
| 1 | Prisma `findMany` sobre la vista devuelve `Boolean` y `DateTime` con el tipo correcto | **OK:** Prisma lee `boolean` y `Date` correctamente de lo que escribió el SDK |
| 2 | Prisma escribe sobre la vista y la fila entra a la cola de subida | **FALLA:** `create`, `update`, `delete` y SQL crudo fallan con `no such function: powersync_strip_subtype` y `main.powersync_crud does not exist`: los triggers de la vista usan la extensión de PowerSync, que la conexión de Prisma no tiene cargada |
| 3 | Escritura con el SDK de PowerSync y lectura con Prisma: tipos correctos | **OK** |
| 4 | Quién completa `id`, `fechaHoraCreacion` y `fechaHoraModificacion` | **INFO:** las vistas no tienen defaults. Si el SDK inserta sin fechas, Prisma lee `null` sin error: toda escritura por el SDK debe completarlas |
| 5 | Prisma y el SDK sobre el mismo archivo: ¿"database is locked"? | **OK:** 50 escrituras del SDK y 50 lecturas de Prisma en paralelo, sin errores ni bloqueos (las escrituras de Prisma no se pudieron probar, ver 2) |
| 6 | `prisma migrate` sobre una base ya creada por PowerSync | **INFO:** `P3005` (la base no está vacía): Prisma no migra una base que ya tiene objetos de PowerSync |
| 7 | Insertar en la vista un `id` ya existente | **INFO:** se rechaza (`UNIQUE constraint failed: ps_data__PlantillaCertificado.id`): la estrategia de ids determinísticos es viable |
| 8 | Columna excluida del stream (`claveCifrada` en el equipo del Clasificador): al volver a descargar la fila que ese equipo subió, ¿queda vacía en local? | _pendiente (requiere el servicio de sync)_ |
| 9 | Fila escrita en local en una tabla sin stream de descarga para ese rol (`UsoClaveRespaldo` en el Clasificador): ¿persiste o se elimina al subirse? | _pendiente (requiere el servicio de sync)_ |
| 10 | Avisos en vivo (SSE): ¿`db.watch()` detecta escrituras del SDK, de Prisma y cambios por sync? | **OK para el SDK.** Prisma no puede escribir (ver 2). Lo que llega por sync: _pendiente (requiere el servicio de sync)_ |
| 11 | Prisma Migrate primero y PowerSync después, sobre el mismo archivo | **FALLA:** `use DROP TABLE to delete table PlantillaCertificado`: PowerSync no puede crear una vista donde ya hay una tabla real |

## Opciones

| Opción | Descripción | Impacto en `@unique` y FKs |
|---|---|---|
| **A** | Prisma solo lee. Las escrituras pasan por el SDK de PowerSync. | Se pierden: hay que reemplazarlas (ver `docs/sincronizacion/restricciones-locales.md`). |
| **B** | Prisma lee y escribe sobre las vistas. Solo si el adapter lo permite sin romper la cola. | Se pierden igual. |
| **C** | Raw tables: tablas reales gestionadas por Prisma Migrate, con mapeo y triggers de PowerSync. | Se conservan (FKs diferidas). Mayor costo de configuración y mantenimiento. |

## Decisión
**Opción A:** Prisma solo lee; todas las escrituras de la base local pasan por el SDK de PowerSync.

La opción B queda descartada: Prisma no puede escribir sobre las vistas (verificación 2). Los resultados 6 y 11 muestran además que Prisma Migrate y PowerSync no pueden compartir el mismo archivo: el esquema local lo crea PowerSync.

La opción C (raw tables) no se evaluó en el spike. Sus triggers de captura de escrituras también dependen de la extensión de PowerSync, por lo que habría que comprobar si Prisma podría escribir sobre esas tablas.

## Consecuencias
- **El esquema de la base local lo define el schema de PowerSync, no Prisma Migrate.** Prisma Migrate se usa solo para la base web. El schema de PowerSync debe derivarse de `schema.prisma` (`String`, enums y `DateTime` como `text`; `Boolean` e `Int` como `integer`; `Float` como `real`).
- **El refactor alcanza a 63 puntos de escritura en 13 services, 22 usos de `$transaction` en 10 services, 8 escrituras anidadas y `seed.ts`.** Todo pasa a `execute` y `writeTransaction` del SDK. Se puede migrar service por service.
- **Toda escritura por el SDK debe proveer `id` (UUID), `fechaHoraCreacion` y `fechaHoraModificacion`**, porque las vistas no tienen defaults ni `@updatedAt`.
- **El `rowsAffected` de un `UPDATE` o `DELETE` sobre una vista puede ser 0 aunque haya funcionado:** hay que usar `RETURNING`.
- **El `id` es único localmente**, así que la estrategia de ids determinísticos (D) de `restricciones-locales.md` es viable. El resto de las restricciones se reemplaza como indica ese documento.
- **Los avisos en vivo (SSE)** pueden apoyarse en `db.watch()`, que detecta las escrituras del SDK. Falta comprobar los cambios que llegan por sync (verificación 10).
- **Hay que rediseñar** la creación de la base local en desarrollo y el seed, porque Prisma Migrate ya no la crea.