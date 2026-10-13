import { app, dialog } from 'electron';
import path from 'path';

export const IS_DEV = !app.isPackaged;

export async function inicializarBackend(): Promise<void> {
  if (IS_DEV) {
    console.log('Modo DEVELOP: el Backend se está ejecutando con una dev tool (npm run dev).');
    return;
  }

  try {
    console.log('Modo PRODUCCIÓN: Booteando server Express buildeado...');

    const dbPath = path.join(app.getPath('userData'), 'production.db');
    process.env.DATABASE_URL = `file:${dbPath}`;
    
    // @ts-ignore - Este comentario hace que se ignore el error de que aún no se haya corrido un npm run build que genera el archivo buildeado
    await import('../backend/dist/index.js');
  
} catch (error: any) {
    dialog.showErrorBox(
      'Inicialización de servidor fallida',
      `La base de datos local o el server no se han podido inicializar.\n\nError: ${error.message}`
    );
    app.quit();
  }
}