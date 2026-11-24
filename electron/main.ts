//electron/main.ts
import { app } from 'electron';
import { crearVentanaPrincipal, crearPantallaCarga, restaurarVentana, tieneVentana } from './window.js';
import { iniciarLogs } from './logger.js';
import { inicializarBackend, apagarBackend } from './server.js';

iniciarLogs();

let cerrando = false;
app.on('before-quit', (evento) => {
  if (cerrando) return;
  evento.preventDefault();
  cerrando = true;
  apagarBackend().catch(console.error).finally(() => app.exit(0));
});

//Previene que el usuario abra la app más de una vez y ejecute más de un server y BD
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  restaurarVentana();
});

app.whenReady().then(async () => {
  crearPantallaCarga();
  await inicializarBackend();
  crearVentanaPrincipal();

  app.on('activate', () => {
    if (!tieneVentana()) crearVentanaPrincipal();
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});