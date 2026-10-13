# CAP - Sistema de Gestión y Clasificación de Carreras
## Descripción

Sistema de gestión de clasificación del Círculo de Atletas Platenses (CAP), orientado a administrar la información de las carreras, los corredores participantes y su clasificación.

El sistema contempla funcionalidades relacionadas con la gestión de clasificación de carreras, la participación de corredores y la consulta de resultados.

## Estructura del proyecto

### Backend

API desarrollada con Node.js, Express y TypeScript.

- `src/`: código de la API.
- `app.ts`: configuración de Express y registro de rutas.
- `routes/`: definición de endpoints. Actualmente incluye `usuario.routes.ts`.
- `controllers/`: recepción de solicitudes y generación de respuestas HTTP.
- `services/`: lógica de negocio y acceso a datos.
- `dtos/` y `validations/`: definición de tipos de datos y validaciones.
- `middlewares/`: autenticación, validación y manejo de errores.
- `config/`: configuración de Prisma y variables de entorno.
- `prisma/`: modelo y migraciones de la base de datos, incluido `schema.prisma`.

### Frontend

Interfaz desarrollada con React, TypeScript y Vite.

- `src/`: aplicación y pantallas.
- `pages/`: vistas de carreras, inscripciones, entrega de kits, clasificación, resultados, entre otras.
- `components/`: componentes reutilizables.
- `layout/`: estructura general y navegación.
- `types/`: definición de tipos de TypeScript.

Varias pantallas utilizan archivos de datos de prueba `*Mock.ts` mientras se realiza la integración con la API.

## Estado actual de la API

Actualmente, el backend tiene conectadas las rutas de autenticación bajo el prefijo `/api/auth`, definidas en `usuario.routes.ts`.

Los endpoints de carreras, corredores, inscripciones, entrega de kits, clasificación y datos auxiliares documentados en este README representan las rutas previstas para el desarrollo. Para implementarlas, será necesario incorporar las rutas, los controladores y los servicios correspondientes.

Por lo tanto, los endpoints propuestos no deben considerarse implementados hasta que se encuentren integrados en el backend.

## Tecnologías
- **Frontend:** React, TypeScript, Vite y Electron

- **Backend:** Node.js, Express, TypeScript. Para validaciones Zod y JWT y bcrypt para validaciones

- **Base de datos:** Prisma ORM con esquema configurado para SQLite, que se utilizara para el funcionamiento offline durante las carreras.

## Convención de endpoints de la API

Todas las rutas de la API deberán comenzar con el prefijo /api/ y utilizar nombres de entidades en plural, escritos en minúsculas.

### Formato general

`/api/entidades`

## Métodos HTTP

| Método | Uso | Ejemplo |
|---|---|---|
| `GET` | Consultar o listar inscripciones | `/api/inscripciones` |
| `POST` | Registrar una inscripción | `/api/inscripciones` |
| `PUT` | Reemplazar o actualizar una inscripción | `/api/inscripciones/{id}` |
| `PATCH` | Actualizar parcialmente una inscripción | `/api/inscripciones/{id}` |
| `DELETE` | Eliminar una inscripción | `/api/inscripciones/{id}` |

Para consultar un recurso específico, se utilizará su identificador en la ruta. Por ejemplo:

`GET /api/carreras/{id}`

### Rutas principales 

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

### Criterios de nomenclatura

- Utilizar siempre el prefijo /api/.

- Nombrar las rutas con sustantivos en plural y en minúsculas.

- Utilizar el método HTTP correspondiente a cada operación.

- Evitar incluir verbos de acción en las rutas cuando el método HTTP ya indique la operación.

- Mantener una nomenclatura uniforme en todos los módulos.

- Documentar los parámetros, las respuestas y los permisos correspondientes a cada endpoint a medida que se implementen.

Importante: las rutas de esta sección son propuestas de diseño y no implican que los endpoints ya estén implementados.

## Instalación y ejecución

### Requisitos previos

- Node.js.

- npm.

### Instalación

Consultar los archivos `package.json` de cada aplicación para identificar dónde instalar las dependencias y qué comandos utilizar.

### Ejecución

Agregar los comandos necesarios para ejecutar el frontend y el backend de acuerdo con la configuración actual del proyecto.

## Estado de la documentación

Este README constituye una documentación inicial del proyecto. La información sobre tecnologías, estructura, instalación y ejecución deberá mantenerse alineada con la implementación real.