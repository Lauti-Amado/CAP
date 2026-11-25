//backend/spike/spike-plantilla.ts
// Spike de convivencia entre Prisma y las vistas de PowerSync (docs/decisiones/03-convivencia-prisma-powersync.md).
// Modo local-only: no llama a connect(), así que no necesita la base web ni sync rules.
//
// Preparación (una sola vez, desde backend/):
//   cd spike && npm init -y && npm pkg set type=module && npm install @powersync/node better-sqlite3 && cd ..
// Ejecución (desde backend/):
//   npx tsx spike/spike-plantilla.ts
//
// Usa bases descartables en spike/.tmp/. No toca la base de la aplicación.
import { randomUUID } from "node:crypto";
import { execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { column, PowerSyncDatabase, Schema, Table } from "@powersync/node";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const DIR = path.resolve(process.cwd(), "spike/.tmp");
const ARCHIVO = "spike.db";
const URL_PRISMA = "file:./spike/.tmp/spike.db"; // relativo a backend/, igual que en la aplicación
const ARCHIVO_INVERSO = "inverso.db";
const URL_INVERSO = "file:./spike/.tmp/inverso.db";

type Estado = "OK" | "FALLA" | "INFO" | "NO VERIFICABLE";
type Resultado = { n: number; verificacion: string; estado: Estado; detalle: string };
const resultados: Resultado[] = [];

const aUnaLinea = (texto: string) => texto.replace(/\s+/g, " ").trim();

function registrar(n: number, verificacion: string, estado: Estado, detalle: string) {
    const completo = aUnaLinea(detalle);
    resultados.push({ n, verificacion, estado, detalle: completo });
    console.log(`[${n}] ${estado}: ${verificacion}\n      ${completo}`);
}

const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e));
const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

const AppSchema = new Schema({
    PlantillaCertificado: new Table({
        nombre: column.text,
        activa: column.integer,
        colorPrimario: column.text,
        colorSecundario: column.text,
        colorFondo: column.text,
        fuente: column.text,
        esquinasRedondeadas: column.integer,
        sombras: column.integer,
        marcaDeAgua: column.integer,
        fechaHoraCreacion: column.text,
        fechaHoraModificacion: column.text,
    }),
});

const COLUMNAS = [
    "id", "nombre", "activa", "colorPrimario", "colorSecundario", "colorFondo", "fuente",
    "esquinasRedondeadas", "sombras", "marcaDeAgua", "fechaHoraCreacion", "fechaHoraModificacion",
];

function filaSDK(id = randomUUID(), conFechas = true) {
    const ahora = new Date().toISOString();
    return [
        id, "Plantilla SDK", 1, "#112233", "#445566", "#ffffff", "Arial",
        1, 0, 0, conFechas ? ahora : null, conFechas ? ahora : null,
    ];
}

const SQL_INSERT = `INSERT INTO PlantillaCertificado (${COLUMNAS.join(", ")}) VALUES (${COLUMNAS.map(() => "?").join(", ")})`;

const datosPrisma = (nombre = "Plantilla Prisma") => ({
    nombre,
    colorPrimario: "#112233",
    colorSecundario: "#445566",
    colorFondo: "#ffffff",
    fuente: "Arial",
});

async function main() {
    rmSync(DIR, { recursive: true, force: true });
    mkdirSync(DIR, { recursive: true });

    const db = new PowerSyncDatabase({ schema: AppSchema, database: { dbFilename: ARCHIVO, dbLocation: DIR } });
    await db.init();
    const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: URL_PRISMA }) });
    let prismaEscribeConSQL = false;

    try {
        const objeto = await db.getAll<{ type: string; name: string }>(
            "SELECT type, name FROM sqlite_master WHERE name = 'PlantillaCertificado'"
        );
        console.log("sqlite_master:", JSON.stringify(objeto));

        // 3 y 1. El SDK escribe y Prisma lee
        const idSDK = randomUUID();
        try {
            await db.execute(SQL_INSERT, filaSDK(idSDK));
            const leida = await prisma.plantillaCertificado.findUnique({ where: { id: idSDK } });
            if (!leida) {
                registrar(3, "SDK escribe, Prisma lee: tipos correctos", "FALLA", "Prisma no encontró la fila escrita por el SDK");
            } else {
                const tiposOk =
                    typeof leida.activa === "boolean" &&
                    leida.fechaHoraCreacion instanceof Date &&
                    !Number.isNaN(leida.fechaHoraCreacion.getTime());
                registrar(
                    3,
                    "SDK escribe, Prisma lee: tipos correctos",
                    tiposOk ? "OK" : "FALLA",
                    `activa=${typeof leida.activa}(${leida.activa}), fechaHoraCreacion=${leida.fechaHoraCreacion?.constructor?.name}(${String(leida.fechaHoraCreacion)})`
                );
            }
        } catch (e) {
            registrar(3, "SDK escribe, Prisma lee: tipos correctos", "FALLA", mensaje(e));
        }

        try {
            const todas = await prisma.plantillaCertificado.findMany();
            registrar(1, "Prisma findMany sobre la vista", "OK", `devolvió ${todas.length} fila(s) sin error`);
        } catch (e) {
            registrar(1, "Prisma findMany sobre la vista", "FALLA", mensaje(e));
        }

        // 2. ¿Prisma puede escribir sobre la vista? Se prueba de cuatro formas para saber qué falla exactamente
        try {
            const idCrudo = randomUUID();
            const filas = await prisma.$executeRawUnsafe(SQL_INSERT, ...filaSDK(idCrudo));
            const visible = await db.getAll("SELECT id FROM PlantillaCertificado WHERE id = ?", [idCrudo]);
            const cola = await db.getCrudBatch(1000);
            const enCola = (cola?.crud ?? []).some((operacion) => operacion.id === idCrudo);
            prismaEscribeConSQL = visible.length === 1;
            registrar(
                2,
                "Prisma escribe con SQL crudo (sin RETURNING)",
                enCola ? "OK" : "INFO",
                `filas afectadas: ${filas}; el SDK ve la fila: ${visible.length === 1}; entró a la cola de subida: ${enCola}`
            );
        } catch (e) {
            registrar(2, "Prisma escribe con SQL crudo (sin RETURNING)", "FALLA", mensaje(e));
        }

        try {
            const creada = await prisma.plantillaCertificado.create({ data: datosPrisma() });
            registrar(2, "Prisma create (API de modelos) sobre la vista", "OK", `creó ${creada.id}`);
        } catch (e) {
            registrar(2, "Prisma create (API de modelos) sobre la vista", "FALLA", mensaje(e));
        }

        try {
            const actualizada = await prisma.plantillaCertificado.update({ where: { id: idSDK }, data: { nombre: "Actualizada con Prisma" } });
            registrar(2, "Prisma update (API de modelos) sobre la vista", "OK", `nombre=${actualizada.nombre}, fechaHoraModificacion=${String(actualizada.fechaHoraModificacion)}`);
        } catch (e) {
            registrar(2, "Prisma update (API de modelos) sobre la vista", "FALLA", mensaje(e));
        }

        try {
            await prisma.plantillaCertificado.delete({ where: { id: idSDK } });
            registrar(2, "Prisma delete (API de modelos) sobre la vista", "OK", "borró la fila");
        } catch (e) {
            registrar(2, "Prisma delete (API de modelos) sobre la vista", "FALLA", mensaje(e));
        }

        // 4. El SDK inserta sin fechas: ¿qué lee Prisma?
        try {
            const idSinFechas = randomUUID();
            await db.execute(SQL_INSERT, filaSDK(idSinFechas, false));
            const leida = await prisma.plantillaCertificado.findUnique({ where: { id: idSinFechas } });
            registrar(4, "SDK inserta sin fechas y Prisma lee", "INFO", `Prisma leyó la fila sin error: fechaHoraCreacion=${String(leida?.fechaHoraCreacion)}`);
        } catch (e) {
            registrar(4, "SDK inserta sin fechas y Prisma lee", "INFO", `falló: ${mensaje(e)}`);
        }

        // 7. id repetido
        try {
            const idRepetido = randomUUID();
            await db.execute(SQL_INSERT, filaSDK(idRepetido));
            let segundo = "aceptado";
            try {
                await db.execute(SQL_INSERT, filaSDK(idRepetido));
            } catch (e) {
                segundo = `rechazado: ${mensaje(e)}`;
            }
            const cantidad = await db.get<{ n: number }>("SELECT COUNT(*) AS n FROM PlantillaCertificado WHERE id = ?", [idRepetido]);
            registrar(7, "Insertar en la vista un id ya existente", "INFO", `segundo insert ${segundo}; filas con ese id: ${cantidad.n}`);
        } catch (e) {
            registrar(7, "Insertar en la vista un id ya existente", "FALLA", mensaje(e));
        }

        // 10. db.watch: escrituras del SDK y (si funciona) de Prisma
        try {
            let avisos = 0;
            const cortar = new AbortController();
            db.watch(
                "SELECT id FROM PlantillaCertificado",
                [],
                { onResult: () => { avisos++; }, onError: () => {} },
                { signal: cortar.signal }
            );
            await esperar(500);
            const base = avisos;
            await db.execute(SQL_INSERT, filaSDK());
            await esperar(800);
            const trasSDK = avisos;
            registrar(10, "db.watch avisa de escrituras hechas con el SDK", trasSDK > base ? "OK" : "FALLA", `avisos antes: ${base}, después: ${trasSDK}`);

            if (prismaEscribeConSQL) {
                await prisma.$executeRawUnsafe(SQL_INSERT, ...filaSDK());
                await esperar(1200);
                registrar(10, "db.watch avisa de escrituras hechas con Prisma (SQL crudo)", avisos > trasSDK ? "OK" : "INFO", `avisos tras la escritura de Prisma: ${avisos > trasSDK}`);
            } else {
                registrar(10, "db.watch avisa de escrituras hechas con Prisma", "NO VERIFICABLE", "Prisma no pudo escribir sobre la vista");
            }
            cortar.abort();
        } catch (e) {
            registrar(10, "db.watch", "FALLA", mensaje(e));
        }

        // 5. Lecturas de Prisma mientras el SDK escribe sobre el mismo archivo (lo que importa si el SDK es el único que escribe)
        try {
            const errores: string[] = [];
            const tareas = Array.from({ length: 100 }, (_, i) =>
                (i % 2 === 0
                    ? db.execute(SQL_INSERT, filaSDK())
                    : prisma.plantillaCertificado.findMany({ take: 5 })
                ).catch((e: unknown) => { errores.push(mensaje(e)); })
            );
            await Promise.all(tareas);
            const bloqueos = errores.filter((texto) => /locked|busy/i.test(texto)).length;
            registrar(
                5,
                "50 escrituras del SDK y 50 lecturas de Prisma simultáneas",
                errores.length === 0 ? "OK" : "FALLA",
                errores.length === 0 ? "sin errores" : `${errores.length} errores (${bloqueos} de bloqueo). Primero: ${errores[0]}`
            );
        } catch (e) {
            registrar(5, "50 escrituras del SDK y 50 lecturas de Prisma simultáneas", "FALLA", mensaje(e));
        }

        registrar(8, "Columna excluida del stream (claveCifrada)", "NO VERIFICABLE", "requiere el servicio de sync con streams; no se puede en modo local-only");
        registrar(9, "Fila local en una tabla sin stream de descarga", "NO VERIFICABLE", "requiere el servicio de sync con streams; no se puede en modo local-only");
    } finally {
        await prisma.$disconnect();
        await db.close();
    }

    // 6. PowerSync primero, Prisma Migrate después (con todo cerrado para no confundir con un bloqueo)
    try {
        execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: URL_PRISMA }, stdio: "pipe" });
        registrar(6, "PowerSync primero y después prisma migrate deploy", "OK", "no chocó");
    } catch (e) {
        const salida = e as { stdout?: Buffer; stderr?: Buffer };
        registrar(6, "PowerSync primero y después prisma migrate deploy", "INFO", `chocó: ${(salida.stderr ?? salida.stdout ?? Buffer.from(mensaje(e))).toString()}`);
    }

    // 11. El orden real del proyecto: Prisma Migrate crea las tablas y después arranca PowerSync sobre el mismo archivo
    try {
        execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: URL_INVERSO }, stdio: "pipe" });
    } catch (e) {
        const salida = e as { stdout?: Buffer; stderr?: Buffer };
        registrar(11, "Prisma Migrate primero (preparación)", "FALLA", (salida.stderr ?? salida.stdout ?? Buffer.from(mensaje(e))).toString());
    }
    const dbInverso = new PowerSyncDatabase({ schema: AppSchema, database: { dbFilename: ARCHIVO_INVERSO, dbLocation: DIR } });
    try {
        await dbInverso.init();
        const objeto = await dbInverso.getAll<{ type: string; name: string }>(
            "SELECT type, name FROM sqlite_master WHERE name = 'PlantillaCertificado'"
        );
        let insercion = "no probada";
        try {
            await dbInverso.execute(SQL_INSERT, filaSDK());
            insercion = "el SDK pudo insertar";
        } catch (e) {
            insercion = `el SDK no pudo insertar: ${mensaje(e)}`;
        }
        registrar(11, "Prisma Migrate primero y después PowerSync sobre el mismo archivo", "INFO", `PlantillaCertificado es: ${JSON.stringify(objeto)}; ${insercion}`);
    } catch (e) {
        registrar(11, "Prisma Migrate primero y después PowerSync sobre el mismo archivo", "FALLA", mensaje(e));
    } finally {
        await dbInverso.close().catch(() => {});
    }

    resultados.sort((a, b) => a.n - b.n);
    writeFileSync(path.join(DIR, "resultado.json"), JSON.stringify(resultados, null, 2));
    console.log("\n--- Resultado completo guardado en spike/.tmp/resultado.json ---");
    console.log("--- Filas para la tabla de la decisión [03] ---");
    for (const r of resultados) console.log(`| ${r.n} | ${r.verificacion} | **${r.estado}:** ${r.detalle.slice(0, 200)} |`);
    process.exit(0);
}

main().catch((e) => {
    console.error("El spike terminó con un error inesperado:", e);
    process.exit(1);
});