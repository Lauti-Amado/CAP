# Instalación y ejecución
`frontend`, `backend` y el root directory tienen dependencias por separado, lo que quiere decir que cada una maneja su propio `package.json`. 

En el `package.json` del directorio root se encuentran varios scripts para instalar e inicializar el sistema cómodamente.

## EJECUCIÓN
Estando adentro del directorio root (`CAP/`), ejecutar:

`npm run install-all`: descarga TODAS las dependencias del sistema (front + back + electron). Es lo primero que debe hacerse.

`npm run dev`: inicializa en la terminal la app de escritorio electron, que abre la app de escritorio como un proceso y que también levanta front + back

`npm run dev:frontend`: inicializa en la terminal el frontend, abriendo la app en un puerto de la PC. A continuación, ingresa a la dirección en un navegador web para visualizar la interfaz gráfica de la app.

`npm run dev:backend`: inicializa en la terminal el server backend, ocupando un puerto de la PC.


## GENERAR EL INSTALADOR (.exe)
Estando en el directorio root (`CAP/`), en Windows:

`npm run dist`: compila backend, frontend y Electron, reconstruye `better-sqlite3` para Electron y genera el instalador en `release/` (por ejemplo `CAP Setup 1.0.0.exe`). Al terminar vuelve a dejar `better-sqlite3` listo para el modo desarrollo.

Si `electron-builder` falla, ejecutar `npm run rebuild:node` para que `npm run dev:backend` siga funcionando.

## PROBAR EL INSTALADOR EN UNA MÁQUINA LIMPIA
Antes de entregar un instalador hay que probarlo en un Windows 10 u 11 sin Node, Git ni el proyecto:
1. Instalar y abrir la app: no debe mostrar errores de arranque.
2. Verificar que se crearon `production.db` y `logs/cap.log` en la carpeta de datos de la app (`%APPDATA%`).
3. Iniciar sesión.
4. Cerrar la app y abrirla de nuevo: no se repiten las migraciones y los datos siguen.
5. Abrir la app dos veces: la segunda trae la ventana al frente.
6. Cerrar la ventana: no debe quedar ningún proceso `CAP.exe` en el Administrador de tareas.