# CAP - Sistema de clasificaciones
Bienvenid@ al repositorio del Sistema de clasificaciones del Circulo de Atletas Platense (CAP).

En el presente proyecto se encuentran los archivos / código de la aplicación que compone al sistema.

## Descripción

El sistema está orientado a la gestión de clasificaciones y resultados de carreras atléticas llevadas a cabo por el CAP.
Se articulan diversas entidades como corredores, carreras y resultados de las mismas (clasificaciones).

Este sistema está sincronizado con el ***sistema web*** de CAP; trayendo la información del mismo para vincular datos de corredores y sus participaciones.

El proyecto cuenta con un **sistema integrado de chips RFID**, mediante el cual se realiza la clasificación por ondas de radio electromagnéticas.

## Tecnologías del sistema
El sistema utiliza la arquitectura clásica cliente servidor de una Single Page Application (SPA) web. Esta misma se justifica por la necesidad de tener puertos disponibles para interactuar con el sistema de chips RFID, el cual funciona con conexión Ethernet de red LAN. Además, facilita la comunicación servidor a servidor con el sistema web del CAP.

- **Frontend:** React, TypeScript, Bootstrap, Vite y Electron.

- **Backend:** API desarrollada con Node.js, Express y TypeScript. Para validaciones Zod, JWT y bcrypt.

- **Base de datos:** Prisma ORM con esquema configurado para SQLite, que se utilizara para el funcionamiento offline durante las carreras.

## Estructura de archivos del proyecto
La estructura de archivos sigue la arquitectura clásica cliente-servidor para el backend/frontend, mientras que la carpeta Electron contiene al empaquetador (wrapper) que levanta front y back en una sola aplicación. 

Debe notarse que Electron tan sólo cumple la función de ser un empaquetador, quedando sin uso sus funcionalidades típicas de piping mediante las cuales se realizan llamadas constantes a funciones nativas de la aplicación de escritorio.

### Electron
Define al wrapper que levanta el front y back en una aplicación de escritorio.

- `main.ts`: entrada principal donde se levanta el server backend y la interfaz gráfica frontend.
- `window.ts`: funciones para levantar la interfaz gráfica frontend y gestionar las ventanas de la app de escritorio.
- `server.ts`: funciones para levantar el servidor backend.
- `ventanaCarga.html`: pantalla de carga para inicialización de la app.

### Backend
Define la API del sistema, con los endpoints que se utilizan.

- `.env.example`: archivo de ejemplo con declaración de las variables de entorno (debe ser copiado y rellenado como `.env`).
- `prisma/`: migraciones, semilla con datos iniciales y esquema de la base de datos con `schema.prisma`.
- `src/`: código de la API.
    - `app.ts`: build de la API con Express; con registro de rutas.
    - `index.ts`: pone la API a escuchar en un puerto.
    - `config/`: configuraciones globales del backend.
    - `routes/`: definición válida de las requests para cada endpoint (verbo + path) de cada entidad. Por ejemplo, `GET api/auth/yo` se define en `auth.routes`. A cada endpoint se le puede sumar uno o más *middlewares*.
    - `middlewares/`: capa de software intermedia que intercepta la request de un endpoint, con funcionalidades varias. Por ejemplo, `authenticate()` de `auth.middleware` valida que el usuario haya enviado un token auténtico.
    - `controllers/`: definición de los controllers de cada entidad llamados luego de realizar una request a un endpoint, que coordina los *services* a ejecutar y entreg finalmente una response HTTP en el formato correcto.
    - `services/`: definición de funciones con lógica de negocio y acceso a datos, ejecutados por los controllers.
    - `dtos/`: definición de tipos de datos devueltos en una response HTTP, junto con una opcional función que convierte el payload de Prisma a un payload de response válido. Por ejemplo, `UsuarioDTOMap` transforma `UsuarioPrismaPayload` en `UsuarioPayload` a como se lo devuelve en una response.
    - `validations/`: validaciones de formato de Zod de las entidades a partir de esquemas, para comprobar que una request ha llegado con el formato correcto.
    - `types/`: tipos de datos + tipos de datos globales (`express.d`). No confundir con DTOs.
    - `errors/`: errores custom que heredan de `base.error`, arrojados en un service e interceptados por `errorHandler.middleware` cuando se incumple una regla de negocio. Por ejemplo, `throw new ErrorDniDuplicado()` en un service.

### Frontend
Define la interfaz gráfica con la que el usuario interactúa y llama a los endpoints de la API.

- `.env.example`: archivo de ejemplo con declaración de las variables de entorno (debe ser copiado y rellenado como `.env`).
- `public/`: recursos (como imágenes, videos u otros) que suelen estar públicos en internet (se ven, por ejemplo, en google imágenes)
- `src/`: código fuente del frontend.
    - `App.tsx`: ejecuta el programa frontend. Contiene el layout de la interfaz y las rutas.
    - `layout/`: componentes react de la estructura que está por "encima" de la interfaz, donde se define `asidebar` y `navbar`.
    - `pages/`: componentes react de las vistas del contenido principal de cada tab de la asidebar (carreras, entrega de kits...).
    - `components/`: componentes react con elementos reutilizables por varias pages o layout.
    - `assets/`: recursos (como imágenes, videos u otros) que se descargan al renderizar la app y son nativos a cada componente react (es decir, están "pegados" al código).
    - `context`: contextos react de los cuales se pueden extraer datos entre componentes, que envuelven vistas de la app para proveerles dichos datos.
    - `services`: funciones para hacer requests a los endpoints de una API, entre las que se encuentra la de este sistema.
    - `types/`: definición de tipos de TypeScript utilizados en los componentes. Para nuestra API, es un calco de lo que esta devuelve en el DTO.
    - `schemas`: esquemas de validación de zod, para registrar formularios en la app.

Varias pantallas utilizan archivos de datos de prueba `*Mock.ts` mientras se realiza la integración con la API.

## API

Actualmente, el backend tiene conectadas las rutas de autenticación bajo el prefijo `/api/auth`, definidas en `usuario.routes.ts`. Los endpoints de carreras, corredores, inscripciones, entrega de kits, clasificación y datos auxiliares documentados en este README representan las rutas previstas para el desarrollo. Para implementarlas, será necesario incorporar las rutas, los controladores y los servicios correspondientes. Por lo tanto, los endpoints propuestos no deben considerarse implementados hasta que se encuentren integrados en el backend.

### Convención de endpoints de la API

Todas las rutas de la API deberán comenzar con el prefijo /api/ y utilizar nombres de entidades en plural, escritos en minúsculas.

### Formato general

`/api/entidades`

### Métodos HTTP

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
`frontend`, `backend` y el root directory tienen dependencias por separado, lo que quiere decir que cada una maneja su propio `package.json`. 

En el `package.json` del directorio root se encuentran varios scripts para instalar e inicializar el sistema cómodamente.

### EJECUCIÓN
Estando adentro del directorio root (`CAP/`), ejecutar:

`npm run install-all`: descarga TODAS las dependencias del sistema (front + back + electron). Es lo primero que debe hacerse.

`npm run dev`: inicializa en la terminal la app de escritorio electron, que abre la app de escritorio como un proceso y que también levanta front + back

`npm run dev:frontend`: inicializa en la terminal el frontend, abriendo la app en un puerto de la PC. A continuación, ingresa a la dirección en un navegador web para visualizar la interfaz gráfica de la app.

`npm run dev:backend`: inicializa en la terminal el server backend, ocupando un puerto de la PC.

## Estado de la documentación

Este README constituye una documentación inicial del proyecto. La información sobre tecnologías, estructura, instalación y ejecución deberá mantenerse alineada con la implementación real.