import { BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

import { IS_DEV } from './server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let ventanaPrincipal: BrowserWindow | null = null;
let ventanaCarga: BrowserWindow | null = null;

export function crearPantallaCarga(): void {
    ventanaCarga = new BrowserWindow({
        width: 700,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true
    });

    const pathVentanaCarga = IS_DEV
        ? path.join(__dirname, '../electron/ventanaCarga.html')
        : path.join(__dirname, '../electron/ventanaCarga.html');

    ventanaCarga.loadFile(pathVentanaCarga);
}

export function crearVentanaPrincipal(): void {
    ventanaPrincipal = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        show: false,
        autoHideMenuBar: true, //Se puede ver con alt
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    //Cargar la pantalla
    if (IS_DEV) {
        ventanaPrincipal.loadURL('http://localhost:5173');
        //ventanaPrincipal.webContents.openDevTools();      <-- para debuggear
    } else {
        ventanaPrincipal.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    }

    ventanaPrincipal.once('ready-to-show', () => {
        if (IS_DEV) {
            setTimeout(() => {
                if (ventanaCarga) {
                    ventanaCarga.close();
                    ventanaCarga = null;
                }
                ventanaPrincipal?.show();
            }, 0); //Cambiar valor para agregar delay de la pantalla de carga (para ver cómo queda; sino dejar en 0)
        } else {
            if (ventanaCarga) {
                ventanaCarga.close();
                ventanaCarga = null;
            }
            ventanaPrincipal?.show();
        }
    });

    //Cerrar la ventana
    ventanaPrincipal.on('closed', () => {
        ventanaPrincipal = null;
    });
}

export function restaurarVentana(): void {
    if (ventanaPrincipal) {
        if (ventanaPrincipal.isMinimized()) ventanaPrincipal.restore();
        ventanaPrincipal.focus();
    } else {
        crearVentanaPrincipal();
    }
}

export function tieneVentana(): boolean {
    return BrowserWindow.getAllWindows().length > 0;
}