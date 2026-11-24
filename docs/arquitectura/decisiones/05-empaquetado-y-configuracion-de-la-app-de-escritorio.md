# [05] - Empaquetado y configuración de la app de escritorio

- **Afecta:** electron y backend
- **Estado:** aplicado (con puntos abiertos, ver "Pendiente de definir")

## Contexto y problemática
La decisión `02-usar-electron` establece que Electron levanta backend y frontend juntos. Al generar el instalador `.exe` hubo que resolver cómo se comporta esa app fuera del entorno de desarrollo: dónde vive la base de datos, de dónde salen los secretos, cómo se aplican las migraciones, cómo se sirve el frontend, qué red expone el servidor y cómo se distribuyen los módulos nativos (`better-sqlite3`, `bcrypt`).

## Decisión

### Modo desarrollo vs. empaquetado
- `IS_DEV = !app.isPackaged`. En desarrollo, backend y Vite corren con `npm run dev` y Electron solo espera a que respondan los puertos `3000` y `5173` antes de cargar la ventana.
- Empaquetada, Electron importa el backend compilado (`backend/dist/index.js`) **en el mismo proceso**. Las variables de entorno (`IS_PACKAGED`, `PORT`, `FRONTEND_URL`, `DATABASE_URL`, `JWT_SECRET`, `CLAVES_RESPALDO_SECRET`, `BACKUP_DIR`) se definen en `electron/server.ts` **antes** del import, porque `env.ts` y `app.ts` las leen al cargarse.
- No se define `NODE_ENV` desde Electron: las cookies de auth son `secure` solo si `NODE_ENV=production`, y el servidor local sirve por HTTP.

### Servidor local: host y puerto
- El backend escucha **solo en `127.0.0.1`**. Ningún otro equipo de la red puede llegar a él.
- Puerto preferido `3000`. Si está ocupado se usa uno libre, y `FRONTEND_URL` se arma con el puerto efectivo.
- La ventana no se carga hasta que el puerto responde.
- Si más adelante el lector RFID u otro dispositivo de la red necesita llegar al backend, esta decisión se reabre.

### Frontend en producción: mismo origen
- En el build de producción `VITE_API_URL=/api` (`frontend/.env.production`). El backend sirve el frontend compilado y la API en el mismo origen, así que no hay CORS ni URLs absolutas.
- El router es `HashRouter`, por lo que las rutas del frontend no dependen del servidor.
- La ruta raíz `GET /` que responde el mensaje de estado solo existe fuera del modo empaquetado: empaquetado, cede el paso al frontend. El comodín del frontend es `"/{*splat}"` (Express 5) y devuelve `404` JSON para rutas que empiezan con `/api`.

### Datos y secretos por instalación
Todo vive en la carpeta de datos del usuario, `%APPDATA%\sistema-clasificacion-cap`:

| Archivo | Contenido |
|---|---|
| `production.db` | Base SQLite de la instalación |
| `secrets.json` | `JWT_SECRET` y `CLAVES_RESPALDO_SECRET` |
| `logs\cap.log` | Logs (`electron-log`, máximo 5 MB) |

- Los respaldos se guardan en `Documentos\CAP\backups`.
- `JWT_SECRET` se genera aleatorio en el primer arranque y persiste. Debe coincidir con el del sistema web, según `04-usar-auth-cookies`.
- `CLAVES_RESPALDO_SECRET` **no se genera**: debe ser idéntico al de la web y al de todas las estaciones (ver `integracion/claves-respaldo-web.md`). Si falta, la app no arranca y muestra el error con la ruta de los logs.

### Migraciones
- En cada arranque empaquetado se aplican las migraciones pendientes de `backend/prisma/migrations/*/migration.sql`, en orden, dentro de una transacción.
- Se registran en `_prisma_migrations` con checksum sha256, con el mismo formato que Prisma, así que la base queda compatible con `prisma migrate`.
- No se usa el CLI de Prisma en producción: no se instala en la máquina del usuario.

### Usuarios
- No hay pantalla de alta del primer administrador. Los usuarios llegan por la sincronización inicial desde el sistema web, según `04-usar-auth-cookies` y `0X-usuarios-y-contrasenas-en-sistema-web`.
- Para pruebas locales se copia `backend/dev.db` como `production.db`.

### Módulos nativos
- `better-sqlite3` y `bcrypt` se reconstruyen para la ABI de Electron (`@electron/rebuild -f -m backend`) antes de empaquetar.
- `backend/node_modules` se copia como recurso externo (`extraResources` → `resources/node_modules`), porque `electron-builder` omite el `node_modules` anidado del subproyecto `backend` dentro del `asar`. Se usa esto en lugar de `asarUnpack`.
- Después de empaquetar se restaura la ABI de Node (`npm run rebuild:node`) para que el modo desarrollo siga funcionando.

### Ciclo de vida
- Una sola instancia: abrir la app por segunda vez trae la ventana existente al frente.
- Al cerrar, se detiene el servidor y se desconecta Prisma antes de terminar el proceso, para no dejar procesos `CAP.exe` ni la base bloqueada.
- Los errores no capturados y los `console.*` se escriben en `cap.log`.

## Consecuencias
- Cada instalación es independiente: secretos y base propios.
- El instalador incluye también dependencias de desarrollo del backend (peso innecesario); se puede optimizar filtrando `typescript`, `tsx` y `prisma` de `extraResources`.
- El instalador no está firmado ni tiene icono propio (`description`, `author` e icono pendientes en `package.json`).
- Generar el instalador exige Windows con Developer Mode o terminal de administrador (`winCodeSign`), Visual Studio Build Tools (C++) y Python. Los pasos están en `setup/instalacion.md`.

## Pendiente de definir
- **Entrega de `CLAVES_RESPALDO_SECRET` a cada estación.** Hoy se copia a mano a `secrets.json`. Falta decidir el mecanismo definitivo (por ejemplo, un asistente de primera configuración).
- **Prueba en máquina limpia** (Windows 10/11 sin Node ni el proyecto): checklist en `setup/instalacion.md`.
- **Host `127.0.0.1` vs. red**, si el lector RFID lo requiere.