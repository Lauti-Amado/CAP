//electron/server.ts
import { app, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import net from 'net';
import crypto from 'crypto';
import { aplicarMigraciones } from './migraciones.js';

export const IS_DEV = !app.isPackaged;
export let PUERTO = 3000;
let backend: { apagar: () => Promise<void> } | null = null;

function leerSecretos(): { JWT_SECRET: string; CLAVES_RESPALDO_SECRET?: string } {
  const ruta = path.join(app.getPath('userData'), 'secrets.json');
  const s = fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta, 'utf8')) : {};
  if (!s.JWT_SECRET) {
    s.JWT_SECRET = crypto.randomBytes(48).toString('hex'); // único por instalación y persistente
    fs.writeFileSync(ruta, JSON.stringify(s, null, 2), { mode: 0o600 });
  }
  return s;
}

function puertoLibre(preferido: number): Promise<number> {
  return new Promise((resolve) => {
    const probar = net.createServer();
    probar.once('error', () => {
      const alt = net.createServer();
      alt.listen(0, '127.0.0.1', () => {
        const p = (alt.address() as net.AddressInfo).port;
        alt.close(() => resolve(p));
      });
    });
    probar.listen(preferido, '127.0.0.1', () => probar.close(() => resolve(preferido)));
  });
}

export function esperarPuerto(host: string, port: number, timeoutMs = 30000): Promise<void> {
  const limite = Date.now() + timeoutMs;
  return new Promise((ok, fallar) => {
    const intentar = () => {
      const s = net.connect({ host, port });
      s.once('connect', () => { s.destroy(); ok(); });
      s.once('error', () => {
        s.destroy();
        if (Date.now() > limite) fallar(new Error(`No respondió ${host}:${port}`));
        else setTimeout(intentar, 250);
      });
    };
    intentar();
  });
}

export async function inicializarBackend(): Promise<void> {
  if (IS_DEV) {
    console.log('Modo DEVELOP: backend y Vite corren con npm run dev.');
    await Promise.all([esperarPuerto('localhost', 5173), esperarPuerto('127.0.0.1', 3000)]);
    return;
  }

  try {
    const raiz = app.getAppPath();
    const dbPath = path.join(app.getPath('userData'), 'production.db');
    const secretos = leerSecretos();
    if (!secretos.CLAVES_RESPALDO_SECRET) throw new Error('Falta CLAVES_RESPALDO_SECRET en secrets.json');

    PUERTO = await puertoLibre(3000);

    // Tienen que estar ANTES del import: env.ts y app.ts las leen al cargarse
    process.env.IS_PACKAGED = 'true';
    process.env.PORT = String(PUERTO);
    process.env.FRONTEND_URL = `http://127.0.0.1:${PUERTO}`;
    process.env.DATABASE_URL = `file:${dbPath}`;
    process.env.JWT_SECRET = secretos.JWT_SECRET;
    process.env.CLAVES_RESPALDO_SECRET = secretos.CLAVES_RESPALDO_SECRET;
    process.env.BACKUP_DIR = path.join(app.getPath('documents'), 'CAP', 'backups');

    aplicarMigraciones(dbPath, raiz);

    // @ts-ignore - existe recién después de npm run build
    backend = await import('../backend/dist/index.js');
    await esperarPuerto('127.0.0.1', PUERTO);
  } catch (error: any) {
    console.error('Inicialización fallida', error);
    dialog.showErrorBox('Inicialización de servidor fallida', `Error: ${error.message}\n\nLogs: ${app.getPath('userData')}\\logs`);
    app.quit();
  }
}

export async function apagarBackend(): Promise<void> {
  await backend?.apagar();
}