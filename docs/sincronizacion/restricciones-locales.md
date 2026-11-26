# Restricciones locales: `@unique`, claves foráneas y cascadas

Con las vistas de PowerSync, la base local deja de hacer cumplir `UNIQUE`, claves foráneas y cascadas (ver decisión [03]). Este documento inventaría lo que dependía de la base y define cómo se reemplaza.

Aplica a la opción A de la decisión [03] (Prisma solo lee; las escrituras pasan por el SDK de PowerSync).

## Estrategias

| Código | Estrategia |
|---|---|
| **L** | Solo lectura local: las filas llegan de la web y ya cumplen la restricción. No hay nada que hacer. |
| **T** | Chequeo dentro de la transacción del service antes de escribir. |
| **S** | Arbitra el servidor: entre dos equipos sin conexión ningún chequeo local alcanza. Hace falta política de conflicto (ver `docs/integracion/fusion-persona-dni-web.md`). |
| **D** | Candidato a id determinístico (UUIDv5 de la clave natural): dos equipos generan la misma fila en vez de un conflicto. A evaluar tras el spike. |

## Restricciones de unicidad (24)

| # | Tabla | Restricción | ¿Se crea en local? | Estrategia |
|---|---|---|---|---|
| 1 | `Persona` | `dni` | Sí | T + S (ver política de fusión) |
| 2 | `Corredor` | `personaId` | Sí | T + S |
| 3 | `Usuario` | `email` | No | L |
| 4 | `Usuario` | `personaId` | No | L |
| 5 | `UsuarioRol` | `usuarioId + rolAdministrativoId` | Sí | T + D |
| 6 | `ClaveRespaldo` | `claveHash` | Sí (reposición) | S |
| 7 | `Comprobante` | `compraId` | Sí (escritura anidada en `compra.create`, inscripción presencial) | T |
| 8 | `Producto` | `nombreProducto` | No | L |
| 9 | `Afiliacion` | `numeroSocio` | No (confirmar) | L |
| 10 | `Afiliacion` | `afiliadoId` | No (confirmar) | L |
| 11 | `Carrera` | `fechaHoraCarrera` | No | L |
| 12 | `Carrera` | `fechaHoraEntregaKits` | No | L |
| 13 | `EjecucionCarrera` | `carreraId` | Sí (escritura anidada en `carrera.update`, `carreraEstado.service.ts`) | T + S |
| 14 | `Distancia` | `kilometraje + tipoDistancia` | No | L |
| 15 | `DistanciaCarrera` | `idCarrera + idDistancia` | No | L |
| 16 | `Localidad` | `nombre` | No | L |
| 17 | `Lugar` | `nombre` | No | L |
| 18 | `Inscripcion` | `idDetalleCompra` | Sí | T |
| 19 | `Inscripcion` | `idCorredor + idCarrera` | Sí | T + S |
| 20 | `CertificadoCarrera` | `inscripcionId` | Sí (estado de envío) | T |
| 21 | `EntregaKit` | `inscripcionId` | Sí | T + S |
| 22 | `Chip` | `dorsalId` | Sí | T |
| 23 | `Clasificacion` | `inscripcionId` | Sí | T + S |
| 24 | `Resultado` | `clasificacionId` | Sí | T |
| 25 | `Chip` | `numero` | Sí (código EPC del chip, decisión [06]) | T + S |

La columna "¿Se crea en local?" indica si algún service de `backend/src` crea filas de esa tabla: con `create`, `createMany`, `upsert` o escrituras anidadas (`comprobante: { create }`, `ejecucion: { upsert }`). Solo esas filas necesitan control de unicidad en local; el resto llega ya validado desde la web.

### Unicidad que ya se controla solo en el service
- `Dorsal.numero`: sin `UNIQUE` en el schema; `dorsal.service.ts` busca antes de crear. Candidato a D (id = UUIDv5 del número).
- `Chip.numero`: desde la decisión [06] es `@unique` en el schema (fila 25). `asociarChip` mantiene su chequeo, que con las vistas de PowerSync pasa a ser la única garantía local.

## Claves foráneas (36, de las cuales 17 con cascada)

### Con `ON DELETE CASCADE` (16)

| # | Hijo | Padre | ¿El backend borra el padre | # | Hijo | Padre | ¿El backend borra el padre hoy? |
|---|---|---|---|
| 1 | `UsuarioRol` | `Usuario` | No se observa |
| 2 | `UsuarioRol` | `RolAdministrativo` | No se observa |
| 3 | `ClaveRespaldo` | `Usuario` | No se observa |
| 4 | `UsoClaveRespaldo` | `ClaveRespaldo` | No se observa |
| 5 | `Comprobante` | `Compra` | No se observa |
| 6 | `ProductoVariante` | `Producto` | No se observa |
| 7 | `EjecucionCarrera` | `Carrera` | No se observa |
| 8 | `DistanciaCarrera` | `Carrera` | No se observa |
| 9 | `CertificadoCarrera` | `Inscripcion` | No se observa |
| 10 | `EntregaKit` | `Inscripcion` | No se observa |
| 11 | `Chip` | `Dorsal` | No se observa |
| 12 | `LecturaRFID` | `Chip` | **Sí:** `chip.delete` en `dorsal.service.ts` |
| 13 | `LecturaRFID` | `LectorRFID` | No se observa |
| 14 | `Clasificacion` | `Inscripcion` | No se observa |
| 15 | `Resultado` | `Clasificacion` | No se observa |
| 16 | `ResultadoCategoria` | `Resultado` | No se observa |
| 17 | `LecturaHuerfana` | `LectorRFID` | No se observa |

"No se observa" significa que no hay un borrado del padre en `backend/src` según una búsqueda de `.delete(` y `deleteMany(`. Los borrados existentes son: `usuarioRol.deleteMany`, `plantillaCertificado.delete`, `resultadoCategoria.deleteMany`, `entregaKit.delete`, `criterioCategoria.deleteMany`, `categoria.delete` y `chip.delete`. Casi todos borran filas hoja.

**Acción:** al borrar un `Chip`, el service debe borrar antes sus `LecturaRFID` dentro de la misma transacción.

### Sin cascada (19)
Por defecto de Prisma, las relaciones requeridas restringen el borrado del padre y las opcionales (`DetalleCompra.idDetalleProducto`, `Comprobante.entidadEmisoraId`, `Inscripcion.equipoId`) ponen la FK en `NULL`.

`Corredor→Persona` (2), `AptoMedico→Corredor`, `Usuario→Persona`, `Compra→Usuario`, `DetalleCompra→Compra`, `DetalleCompra→ProductoVariante`, `Comprobante→EntidadEmisora`, `Afiliacion→Corredor`, `Carrera→Lugar`, `DistanciaCarrera→Distancia`, `Lugar→Localidad`, `Inscripcion→DetalleCompra`, `Inscripcion→Corredor`, `Inscripcion→DistanciaCarrera`, `Inscripcion→Equipo`, `EntregaKit→Dorsal`, `ResultadoCategoria→Categoria`, `CriterioCategoria→Categoria`.

**Acciones:**
- Al crear: verificar que el padre existe dentro de la transacción (`T`).
- Al borrar un padre: el service lo bloquea si tiene hijos. En particular, `categoria.delete` debe verificar `ResultadoCategoria` y `CriterioCategoria`.
- Al sincronizar: pueden llegar hijos antes que su padre. Las pantallas no deben asumir que la relación siempre está presente.

## Verificado en el spike
- Insertar un `id` repetido en una vista se rechaza (`UNIQUE constraint failed: ps_data__...id`), así que la estrategia D (id determinístico) es viable. Ver decisión [03], verificación 7.