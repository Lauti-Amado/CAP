# Arquitectura del sistema
El sistema utiliza la arquitectura clásica cliente servidor de una **Single Page Application (SPA)** web. Esta misma se justifica por la necesidad de tener puertos disponibles para interactuar con el sistema de chips RFID, el cual funciona con conexión Ethernet de red LAN. Además, facilita la comunicación servidor a servidor con el sistema web del CAP.

- **Frontend:** React, TypeScript, Bootstrap, Vite y Electron.

- **Backend:** API desarrollada con Node.js, Express y TypeScript. Para validaciones Zod, JWT y bcrypt.

- **Base de datos:** Prisma ORM con esquema configurado para SQLite, que se utilizara para el funcionamiento offline durante las carreras.