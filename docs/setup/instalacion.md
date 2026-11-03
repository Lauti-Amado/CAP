# Instalación y ejecución
`frontend`, `backend` y el root directory tienen dependencias por separado, lo que quiere decir que cada una maneja su propio `package.json`. 

En el `package.json` del directorio root se encuentran varios scripts para instalar e inicializar el sistema cómodamente.

## EJECUCIÓN
Estando adentro del directorio root (`CAP/`), ejecutar:

`npm run install-all`: descarga TODAS las dependencias del sistema (front + back + electron). Es lo primero que debe hacerse.

`npm run dev`: inicializa en la terminal la app de escritorio electron, que abre la app de escritorio como un proceso y que también levanta front + back

`npm run dev:frontend`: inicializa en la terminal el frontend, abriendo la app en un puerto de la PC. A continuación, ingresa a la dirección en un navegador web para visualizar la interfaz gráfica de la app.

`npm run dev:backend`: inicializa en la terminal el server backend, ocupando un puerto de la PC.