//electron/migraciones.ts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';

// better-sqlite3 vive en backend/node_modules, no en el root
export function aplicarMigraciones(dbPath: string, raizApp: string): void {
  const require = createRequire(path.join(raizApp, 'backend', 'package.json'));
  const Database = require('better-sqlite3');
  const dir = path.join(raizApp, 'backend', 'prisma', 'migrations');

  const db = new Database(dbPath);
  try {
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL, "checksum" TEXT NOT NULL, "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL, "logs" TEXT, "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0)`);

    const hechas = new Set(
      db.prepare('SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL')
        .all().map((r: { migration_name: string }) => r.migration_name),
    );
    const nombres = fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory()).map((d) => d.name).sort();

    for (const nombre of nombres) {
      if (hechas.has(nombre)) continue;
      const sql = fs.readFileSync(path.join(dir, nombre, 'migration.sql'), 'utf8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');
      db.transaction(() => {
        db.exec(sql);
        db.prepare(`INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
                    VALUES (?, ?, datetime('now'), ?, 1)`).run(crypto.randomUUID(), checksum, nombre);
      })();
      console.log(`Migración aplicada: ${nombre}`);
    }
  } finally {
    db.close();
  }
}