//electron/logger.ts
import { app } from 'electron';
import path from 'path';
import log from 'electron-log/main';

export function iniciarLogs(): void {
  log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs', 'cap.log');
  log.transports.file.maxSize = 5 * 1024 * 1024;
  log.initialize();
  Object.assign(console, log.functions); // el backend corre en este mismo proceso: queda todo en el archivo
  process.on('uncaughtException', (e) => log.error('uncaughtException', e));
  process.on('unhandledRejection', (e) => log.error('unhandledRejection', e));
}