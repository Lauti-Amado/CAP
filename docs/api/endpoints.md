# Endpoints - Rutas principales 

#### Autenticación

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/yo` | Obtener el usuario autenticado |

#### Carreras
| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/carreras` | Listar carreras, con filtros por estado y fecha |
| `GET` | `/api/carreras/{id}` | Consultar el detalle de una carrera, su lugar y sus distancias |
| `PATCH` | `/api/carreras/{id}` | Modificar los datos o el estado de una carrera |

#### Corredores e inscripciones

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/corredores?dni={dni}` | Buscar un corredor por DNI |
| `POST` | `/api/corredores` | Registrar un corredor y sus datos personales |
| `GET` | `/api/inscripciones` | Listar inscripciones, con filtros por carrera, estado o DNI |
| `GET` | `/api/inscripciones/{id}` | Consultar una inscripción |
| `POST` | `/api/inscripciones` | Inscribir a un corredor en una distancia de una carrera |
| `PATCH` | `/api/inscripciones/{id}` | Actualizar una inscripción o cambiar su estado |

#### Entrega de kits

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/carreras/{id}/entregas-kit` | Consultar las entregas de kits de una carrera |
| `POST` | `/api/inscripciones/{id}/entrega-kit` | Registrar la entrega de un kit y asignar el dorsal |
| `GET` | `/api/entregas-kit/{id}` | Consultar una entrega de kit |

#### Clasificación

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/carreras/{id}/clasificacion` | Consultar los resultados de una carrera |
| `GET` | `/api/clasificaciones/{id}` | Consultar el estado de clasificación de una inscripción |
| `PATCH` | `/api/clasificaciones/{id}` | Actualizar el estado de una clasificación, por ejemplo, registrar una descalificación |
| `PUT` | `/api/clasificaciones/{id}/resultado` | Registrar o corregir el tiempo, el puesto y el estado de un resultado |
| `GET` | `/api/carreras/{id}/clasificacion/tiempo-real` | Obtener los datos para la vista de clasificación en tiempo real, si el frontend lo necesita |

#### Datos auxiliares

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/categorias` | Consultar las categorías |
| `GET` | `/api/distancias` | Consultar las distancias |
| `GET` | `/api/lugares` | Consultar los lugares |
| `GET` | `/api/equipos` | Consultar los equipos |

## Grand Prix

Base: `/api/grand-prix`. Lectura: Administrador / Clasificador. Modificaciones: solo Administrador, con cookie de sesión.

| Método | Ruta relativa | Acción |
|---|---|---|
| GET / POST | `/` | Listar / crear ediciones |
| GET | `/catalogo-pruebas` | Modalidades competitivas disponibles |
| GET | `/corredores?q=...` | Buscar corredores (administrador) |
| GET / PUT | `/:id` | Detalle / configurar `{ datos, motivo }` |
| POST | `/:id/estado` | Cambiar estado `{ estado, motivo }` |
| GET | `/:id/tabla` | Acumulados; filtros `categoriaId`, `sexo`, `kilometraje`, `busqueda` |
| GET | `/:id/cambios/:recursoId` | Detalle de una revisión; se carga al abrir el historial |
| POST | `/:id/recalcular` | Recalcular `{ motivo }` |
| POST | `/:id/categorias` | Agregar grupo |
| PUT / DELETE | `/:id/categorias/:recursoId` | Editar / quitar grupo sin uso |
| POST | `/:id/pruebas` | Incluir `{ distanciaCarreraId }` |
| PATCH | `/:id/pruebas/:recursoId` | Cambiar inclusión `{ incluida, motivo }` |
| POST | `/:id/participaciones` | Inscribir `{ corredorId, categoriaId }` |
| PATCH | `/:id/participaciones/:recursoId` | Cambiar `{ estado, motivo }` |
| POST | `/:id/reglamentos` | Crear `{ basePuesto, copiarDeId? }` |
| PUT | `/:id/reglamentos/:recursoId` | Guardar `{ basePuesto, reglas: [{ pruebaId, puesto, puntos }] }` |
| POST | `/:id/reglamentos/:recursoId/previsualizar` | Calcular impacto sin escribir |
| POST | `/:id/reglamentos/:recursoId/aplicar` | Publicar y recalcular |

Previsualizar/aplicar recibe `{ pruebaIds, retroactivo, motivo }`. Fechas de edición: `YYYY-MM-DD`. Consultar [el diseño de Grand Prix](../arquitectura/grand-prix.md) para reglas, límites y migración. Errores: 400 datos inválidos, 401 sin sesión, 403 sin rol, 404 recurso inexistente, 409 conflicto de negocio.
