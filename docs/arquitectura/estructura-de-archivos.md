# Estructura de archivos del proyecto
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