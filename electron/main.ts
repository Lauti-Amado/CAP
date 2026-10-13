import { app } from 'electron';
import { crearVentanaPrincipal, crearPantallaCarga, restaurarVentana, tieneVentana } from './window.js';
import { inicializarBackend } from './server.js';

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