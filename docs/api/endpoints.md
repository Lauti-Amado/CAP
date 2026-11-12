# Endpoints - Rutas principales 

#### Autenticación

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/contingencia` | Iniciar sesión con email y clave de respaldo de uso único |   <!-- NUEVA -->
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/yo` | Obtener el usuario autenticado |

#### Usuarios (solo Administrador)

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/usuarios?pagina={n}` | Listar los usuarios del personal, paginados de a 10 |
| `GET` | `/api/usuarios/{id}` | Consultar un usuario |
| `PATCH` | `/api/usuarios/{id}` | Reemplazar sus roles. Body: `{ "roles": ["Administrador", "Clasificador"] }` |

#### Claves de respaldo (solo Administrador)

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/claves-respaldo` | Consultar el lote vigente de claves |
| `POST` | `/api/claves-respaldo/generar` | Anular las claves disponibles y generar un lote nuevo de 8 |

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