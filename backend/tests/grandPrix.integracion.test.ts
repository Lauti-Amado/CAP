import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import type { Server } from "node:http";

const carpeta = mkdtempSync(join(tmpdir(), "cap-grand-prix-test-"));
process.env.DATABASE_URL = `file:${join(carpeta, "pruebas.db").replaceAll("\\", "/")}`;
process.env.JWT_SECRET = randomUUID();
process.env.NODE_ENV = "test";
let db: typeof import("../src/config/prisma").prisma;
let service: typeof import("../src/services/grandPrix.service");
let server: Server | undefined;
let url = "";
let usuarioId: string;
let contactoId: string;
const datos = {
    nombre: "GP Integración",
    fechaInicio: new Date("2026-01-01"),
    fechaFin: new Date("2026-12-31"),
    fechaReferenciaEdad: new Date("2026-01-01"),
    minimoCarrerasCalendario: 2,
    minimoParticipacionesCorredor: 2,
    exigeAfiliacion: false,
    admiteResultadosPrevios: true,
};

before(async () => {
    const sqlite = new Database(join(carpeta, "pruebas.db"));
    const migrations = join(__dirname, "../prisma/migrations");
    for (const migration of readdirSync(migrations)
        .filter((n) => /^\d/.test(n))
        .sort()) {
        if (migration.includes("grand_prix"))
            sqlite
                .prepare(
                    'INSERT INTO "Persona" (id,dni,nombre,apellido,telefono,fechaHoraCreacion,fechaHoraModificacion) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)',
                )
                .run("legado", "legado", "Dato", "Previo", "0");
        sqlite.exec(
            readFileSync(join(migrations, migration, "migration.sql"), "utf8"),
        );
    }
    assert.equal(
        sqlite
            .prepare("SELECT count(*) AS total FROM Persona WHERE id = ?")
            .get("legado")!.total,
        1,
    );
    assert.deepEqual(sqlite.pragma("foreign_key_check"), []);
    sqlite.close();
    db = (await import("../src/config/prisma")).prisma;
    service = await import("../src/services/grandPrix.service");
    const usuario = await db.usuario.create({
        data: {
            email: "prueba@example.test",
            passwordHash: "no-se-utiliza",
            persona: {
                create: {
                    dni: "admin",
                    nombre: "Admin",
                    apellido: "Prueba",
                    telefono: "0",
                },
            },
        },
    });
    usuarioId = usuario.id;
    contactoId = (
        await db.persona.create({
            data: {
                dni: "contacto",
                nombre: "Contacto",
                apellido: "Prueba",
                telefono: "0",
            },
        })
    ).id;
    const app = (await import("../src/app")).default;
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server!.once("listening", resolve));
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    url = `http://127.0.0.1:${address.port}/api/grand-prix`;
});
after(async () => {
    if (server)
        await new Promise<void>((resolve, reject) =>
            server!.close((e) => (e ? reject(e) : resolve())),
        );
    if (db) await db.$disconnect();
    const absoluto = resolve(carpeta);
    if (
        !absoluto.startsWith(resolve(tmpdir()) + sep) ||
        !basename(absoluto).startsWith("cap-grand-prix-test-")
    )
        throw new Error("Ruta de limpieza inválida");
    rmSync(absoluto, { recursive: true, force: true });
});

async function crearCorredor(
    nombre: string,
    sexo: "Masculino" | "Femenino" = "Masculino",
    nacimiento = "2005-06-01",
) {
    return db.corredor.create({
        data: {
            fechaNacimiento: new Date(nacimiento),
            sexo,
            contactoEmergencia: { connect: { id: contactoId } },
            persona: {
                create: {
                    dni: randomUUID(),
                    nombre,
                    apellido: "Prueba",
                    telefono: "0",
                },
            },
        },
    });
}
async function crearCarrera(nombre: string, fecha: string, lugarId: string) {
    return db.carrera.create({
        data: {
            nombre,
            fechaHoraCarrera: new Date(fecha),
            fechaHoraEntregaKits: new Date(
                new Date(fecha).getTime() - 86400000,
            ),
            imagenUrl: "",
            descripcion: "Prueba",
            participantesMax: 100,
            lugarId,
            estado: "Finalizada",
        },
    });
}
async function resultado(
    corredorId: string,
    distanciaCarreraId: string,
    puesto: number,
) {
    const compra = await db.compra.create({
        data: { montoTotal: 0, usuarioId, isPagado: true },
    });
    const inscripcion = await db.inscripcion.create({
        data: {
            idCompra: compra.id,
            idCorredor: corredorId,
            idDistanciaCarrera: distanciaCarreraId,
            estado: "Confirmada",
            entregaKit: {
                create: { dorsal: { create: { numero: randomUUID() } } },
            },
            clasificacion: {
                create: {
                    estado: "Finalizo",
                    resultado: {
                        create: { puestoGeneral: puesto, estado: "Oficial" },
                    },
                },
            },
        },
        include: { clasificacion: { include: { resultado: true } } },
    });
    return inscripcion.clasificacion!.resultado!;
}

test("módulo Grand Prix: API, persistencia, versiones y correcciones", async (t) => {
    const gpId = (await service.crear(datos, usuarioId)).id;
    const joven = (
        await service.guardarCategoria(
            gpId,
            null,
            {
                nombre: "M18-22",
                sexo: "Masculino",
                edadMinima: 18,
                edadMaxima: 22,
                discapacidad: null,
            },
            usuarioId,
        )
    ).id;
    const mayor = (
        await service.guardarCategoria(
            gpId,
            null,
            {
                nombre: "M23-26",
                sexo: "Masculino",
                edadMinima: 23,
                edadMaxima: 26,
                discapacidad: null,
            },
            usuarioId,
        )
    ).id;
    const femenino = (
        await service.guardarCategoria(
            gpId,
            null,
            {
                nombre: "F18-22",
                sexo: "Femenino",
                edadMinima: 18,
                edadMaxima: 22,
                discapacidad: null,
            },
            usuarioId,
        )
    ).id;
    const localidad = await db.localidad.create({
        data: { nombre: "Prueba", codigoPostal: "0" },
    });
    const lugar = await db.lugar.create({
        data: { nombre: "Circuito", localidadId: localidad.id },
    });
    const carrera1 = await crearCarrera(
        "Etapa 1",
        "2026-04-01T10:00:00Z",
        lugar.id,
    );
    const carrera2 = await crearCarrera(
        "Etapa 2",
        "2026-05-01T10:00:00Z",
        lugar.id,
    );
    const d5 = await db.distancia.create({
        data: { kilometraje: 5, tipoDistancia: "Competitiva" },
    });
    const d10 = await db.distancia.create({
        data: { kilometraje: 10, tipoDistancia: "Competitiva" },
    });
    const dc5 = await db.distanciaCarrera.create({
        data: {
            idCarrera: carrera1.id,
            idDistancia: d5.id,
            precioDistancia: 0,
        },
    });
    const dc10 = await db.distanciaCarrera.create({
        data: {
            idCarrera: carrera1.id,
            idDistancia: d10.id,
            precioDistancia: 0,
        },
    });
    const dcSegunda = await db.distanciaCarrera.create({
        data: {
            idCarrera: carrera2.id,
            idDistancia: d5.id,
            precioDistancia: 0,
        },
    });
    const p5 = (await service.agregarPrueba(gpId, dc5.id, usuarioId)).id;
    const p10 = (await service.agregarPrueba(gpId, dc10.id, usuarioId)).id;
    const pSegunda = (
        await service.agregarPrueba(gpId, dcSegunda.id, usuarioId)
    ).id;
    const ana = await crearCorredor("Ana");
    const beto = await crearCorredor("Beto", "Masculino", "2001-01-01");
    const mujer = await crearCorredor("Mujer", "Femenino");
    const cero = await crearCorredor("Cero");
    const externo = await crearCorredor("Externo");
    const largo = await crearCorredor("Largo", "Masculino", "2001-01-01");
    const insAna = (await service.inscribir(gpId, ana.id, joven, usuarioId)).id;
    await service.inscribir(gpId, beto.id, mayor, usuarioId);
    await service.inscribir(gpId, mujer.id, femenino, usuarioId);
    await service.inscribir(gpId, cero.id, joven, usuarioId);
    await service.inscribir(gpId, largo.id, mayor, usuarioId);
    await resultado(externo.id, dc5.id, 1);
    const rAna = await resultado(ana.id, dc5.id, 2);
    await resultado(beto.id, dc5.id, 3);
    await resultado(mujer.id, dc5.id, 4);
    await resultado(cero.id, dc5.id, 5);
    await resultado(largo.id, dc10.id, 1);
    await resultado(ana.id, dcSegunda.id, 1);
    await resultado(mujer.id, dcSegunda.id, 2);
    await resultado(cero.id, dcSegunda.id, 3);
    const version1 = (
        await service.crearReglamento(
            gpId,
            "ParticipantesGrandPrix",
            undefined,
            usuarioId,
        )
    ).id;
    const reglas = [
        { pruebaId: p5, puesto: 1, puntos: 5 },
        { pruebaId: pSegunda, puesto: 1, puntos: 7 },
        ...[10, 8, 6, 4, 2].map((puntos, i) => ({
            pruebaId: p10,
            puesto: i + 1,
            puntos,
        })),
    ];
    await service.guardarReglas(
        gpId,
        version1,
        { basePuesto: "ParticipantesGrandPrix", reglas },
        usuarioId,
    );
    const aplicacion = {
        pruebaIds: [p5, p10, pSegunda],
        retroactivo: true,
        motivo: "Publicación inicial de la prueba",
    };

    await t.test("autenticación, permisos y datos inválidos", async () => {
        assert.equal((await fetch(url)).status, 401);
        const clasificador = jwt.sign(
            { id: usuarioId, roles: ["Clasificador"] },
            process.env.JWT_SECRET!,
        );
        assert.equal(
            (await fetch(url, { headers: { Cookie: `token=${clasificador}` } }))
                .status,
            200,
        );
        assert.equal(
            (
                await fetch(url, {
                    method: "POST",
                    headers: {
                        Cookie: `token=${clasificador}`,
                        "Content-Type": "application/json",
                    },
                    body: "{}",
                })
            ).status,
            403,
        );
        const admin = jwt.sign(
            { id: usuarioId, roles: ["Administrador"] },
            process.env.JWT_SECRET!,
        );
        const invalidos = await fetch(url, {
            method: "POST",
            headers: {
                Cookie: `token=${admin}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...datos, fechaInicio: "2026-02-31" }),
        });
        assert.equal(invalidos.status, 400);
        const historial = (await service.obtener(gpId)).cambios;
        assert.ok(historial.length > 0);
        assert.equal("datosAntes" in historial[0], false);
        const revision = await fetch(
            `${url}/${gpId}/cambios/${historial[0].id}`,
            { headers: { Cookie: `token=${clasificador}` } },
        );
        assert.equal(revision.status, 200);
        assert.ok("datosDespues" in (await revision.json()));
        assert.equal(
            (
                await fetch(
                    `${url}/${randomUUID()}/cambios/${historial[0].id}`,
                    { headers: { Cookie: `token=${clasificador}` } },
                )
            ).status,
            404,
        );
    });
    await t.test(
        "los DTO conservan los contratos HTTP y separan los datos internos de Prisma",
        async () => {
            const token = jwt.sign(
                { id: usuarioId, roles: ["Administrador"] },
                process.env.JWT_SECRET!,
            );
            const headers = { Cookie: `token=${token}` };
            const lista = await (await fetch(url, { headers })).json();
            assert.deepEqual(
                lista.find((gp: { id: string }) => gp.id === gpId),
                {
                    id: gpId,
                    nombre: datos.nombre,
                    fechaInicio: datos.fechaInicio.toISOString(),
                    fechaFin: datos.fechaFin.toISOString(),
                    estado: "Borrador",
                    necesitaRecalculo: true,
                    participantes: 5,
                    categorias: 3,
                    carreras: 2,
                },
            );
            const detalle = await (
                await fetch(`${url}/${gpId}`, { headers })
            ).json();
            assert.equal(
                detalle.fechaReferenciaEdad,
                datos.fechaReferenciaEdad.toISOString(),
            );
            assert.deepEqual(
                detalle.pruebas.map((p: { id: string }) => p.id),
                [p5, p10, pSegunda],
            );
            assert.equal(detalle.pruebas[0].reglamentoId, null);
            assert.deepEqual(
                detalle.categorias.find((c: { id: string }) => c.id === joven),
                {
                    id: joven,
                    grandPrixId: gpId,
                    nombre: "M18-22",
                    sexo: "Masculino",
                    edadMinima: 18,
                    edadMaxima: 22,
                    discapacidad: null,
                },
            );
            assert.equal("_count" in detalle, false);
            assert.equal("corredor" in detalle.participaciones[0], false);
            assert.equal(
                "reglamentoId" in detalle.reglamentos[0].reglas[0],
                false,
            );
            const catalogo = await (
                await fetch(`${url}/catalogo-pruebas`, { headers })
            ).json();
            assert.deepEqual(
                catalogo.find(
                    (p: { distanciaCarreraId: string }) =>
                        p.distanciaCarreraId === dc5.id,
                ),
                {
                    distanciaCarreraId: dc5.id,
                    carreraId: carrera1.id,
                    carrera: carrera1.nombre,
                    fecha: carrera1.fechaHoraCarrera.toISOString(),
                    estadoCarrera: "Finalizada",
                    kilometraje: 5,
                },
            );
            const corredores = await (
                await fetch(`${url}/corredores?q=Ana`, { headers })
            ).json();
            assert.deepEqual(corredores, [
                {
                    id: ana.id,
                    nombre: "Prueba, Ana",
                    dni: (
                        await db.persona.findUniqueOrThrow({
                            where: { id: ana.personaId },
                        })
                    ).dni,
                    sexo: "Masculino",
                    fechaNacimiento: "2005-06-01T00:00:00.000Z",
                    discapacidad: null,
                    afiliado: false,
                },
            ]);
            const tabla = await (
                await fetch(`${url}/${gpId}/tabla`, { headers })
            ).json();
            assert.deepEqual(
                tabla.filas.find((f: { id: string }) => f.id === insAna),
                {
                    id: insAna,
                    corredorId: ana.id,
                    nombre: "Prueba, Ana",
                    dni: corredores[0].dni,
                    sexo: "Masculino",
                    categoriaId: joven,
                    categoria: "M18-22",
                    puntos: 0,
                    carrerasCompletadas: 0,
                    elegible: false,
                    detalles: [],
                    puesto: 1,
                    puestoCategoria: 1,
                },
            );
            const respuesta = await fetch(
                `${url}/${gpId}/reglamentos/${version1}/previsualizar`,
                {
                    method: "POST",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify(aplicacion),
                },
            );
            assert.equal(respuesta.status, 200);
            const previo = await respuesta.json();
            assert.deepEqual(
                previo.cambios.find(
                    (c: { participacionId: string }) =>
                        c.participacionId === insAna,
                ),
                {
                    participacionId: insAna,
                    nombre: "Prueba, Ana",
                    antes: 0,
                    despues: 12,
                },
            );
            assert.equal(await db.puntajeGrandPrix.count(), 0);
        },
    );
    await t.test(
        "la vista previa no modifica puntajes; la publicación asigna escalas por categoría",
        async () => {
            const previo = await service.previsualizar(
                gpId,
                version1,
                aplicacion,
            );
            assert.equal(
                previo.cambios.find((c) => c.participacionId === insAna)!
                    .despues,
                12,
            );
            assert.equal(await db.puntajeGrandPrix.count(), 0);
            await service.aplicarReglamento(
                gpId,
                version1,
                aplicacion,
                usuarioId,
            );
            const tabla = await service.tabla(gpId, {});
            assert.equal(
                tabla.filas.find((f) => f.corredorId === ana.id)!.puntos,
                12,
            );
            assert.equal(
                tabla.filas.find((f) => f.corredorId === mujer.id)!.puntos,
                12,
            );
            assert.equal(
                tabla.filas.find((f) => f.corredorId === largo.id)!.puntos,
                10,
            );
            assert.equal(
                tabla.filas.find((f) => f.corredorId === cero.id)!.puntos,
                0,
            );
            assert.equal(
                tabla.filas.find((f) => f.corredorId === cero.id)!.elegible,
                true,
            );
            assert.equal(tabla.carreras, 2);
        },
    );
    await t.test(
        "recalcular es idempotente y los filtros recalculan los totales",
        async () => {
            const cantidad = await db.puntajeGrandPrix.count();
            await service.recalcular(gpId, "Segunda ejecución", usuarioId);
            await service.recalcular(gpId, "Tercera ejecución", usuarioId);
            assert.equal(await db.puntajeGrandPrix.count(), cantidad);
            const tabla = await service.tabla(gpId, { kilometraje: 10 });
            assert.equal(
                tabla.filas.find((f) => f.corredorId === ana.id)!.puntos,
                0,
            );
            assert.equal(
                tabla.filas.find((f) => f.corredorId === ana.id)!
                    .carrerasCompletadas,
                2,
            );
            assert.equal(
                tabla.filas.find((f) => f.corredorId === largo.id)!.puntos,
                10,
            );
            await service.cambiarEstado(
                gpId,
                "Activo",
                "Activación de prueba",
                usuarioId,
            );
        },
    );
    await t.test(
        "se rechazan duplicados, cambios históricos y referencias entre ediciones",
        async () => {
            await assert.rejects(
                service.inscribir(gpId, ana.id, joven, usuarioId),
                /ya está inscripto/,
            );
            await assert.rejects(
                service.guardarReglas(
                    gpId,
                    version1,
                    { basePuesto: "TodosCarrera", reglas },
                    usuarioId,
                ),
                /inmutables/,
            );
            await assert.rejects(
                service.guardarCategoria(
                    gpId,
                    joven,
                    {
                        nombre: "Otro",
                        sexo: "Masculino",
                        edadMinima: 18,
                        edadMaxima: 22,
                        discapacidad: null,
                    },
                    usuarioId,
                ),
                /fijas/,
            );
            const otra = (
                await service.crear({ ...datos, nombre: "Otro GP" }, usuarioId)
            ).id;
            const categoriaAjena = (
                await service.guardarCategoria(
                    otra,
                    null,
                    {
                        nombre: "Ajena",
                        sexo: null,
                        edadMinima: null,
                        edadMaxima: null,
                        discapacidad: null,
                    },
                    usuarioId,
                )
            ).id;
            await assert.rejects(
                service.inscribir(gpId, externo.id, categoriaAjena, usuarioId),
                /no encontrados/,
            );
            const reglamentoAjeno = (
                await service.crearReglamento(
                    otra,
                    "TodosCarrera",
                    undefined,
                    usuarioId,
                )
            ).id;
            await assert.rejects(
                service.guardarReglas(
                    otra,
                    reglamentoAjeno,
                    { basePuesto: "TodosCarrera", reglas },
                    usuarioId,
                ),
                /esta edición/,
            );
        },
    );
    await t.test(
        "se pueden configurar pruebas por etapas sin ocultar que faltan reglamentos",
        async () => {
            const otra = (
                await service.crear(
                    {
                        ...datos,
                        nombre: "Configuración gradual",
                        minimoCarrerasCalendario: 0,
                    },
                    usuarioId,
                )
            ).id;
            await service.guardarCategoria(
                otra,
                null,
                {
                    nombre: "Todos",
                    sexo: null,
                    edadMinima: null,
                    edadMaxima: null,
                    discapacidad: null,
                },
                usuarioId,
            );
            const primera = (
                await service.agregarPrueba(otra, dc5.id, usuarioId)
            ).id;
            const segunda = (
                await service.agregarPrueba(otra, dcSegunda.id, usuarioId)
            ).id;
            const version = (
                await service.crearReglamento(
                    otra,
                    "TodosCarrera",
                    undefined,
                    usuarioId,
                )
            ).id;
            await service.guardarReglas(
                otra,
                version,
                {
                    basePuesto: "TodosCarrera",
                    reglas: [{ pruebaId: primera, puesto: 1, puntos: 3 }],
                },
                usuarioId,
            );
            await service.aplicarReglamento(
                otra,
                version,
                {
                    pruebaIds: [primera],
                    retroactivo: true,
                    motivo: "Primera prueba configurada",
                },
                usuarioId,
            );
            assert.equal((await service.obtener(otra)).necesitaRecalculo, true);
            await assert.rejects(
                service.cambiarEstado(
                    otra,
                    "Activo",
                    "Configuración incompleta",
                    usuarioId,
                ),
                /Todas las pruebas/,
            );
            assert.equal(
                (await service.obtener(otra)).pruebas.find(
                    (p) => p.id === segunda,
                )!.reglamentoId,
                null,
            );
        },
    );
    await t.test(
        "una corrección afecta a todo el podio y conserva aportes únicos",
        async () => {
            await db.resultado.update({
                where: { id: rAna.id },
                data: { puestoGeneral: 6 },
            });
            await service.actualizarPorCarrera(carrera1.id);
            const tabla = await service.tabla(gpId, {});
            assert.equal(
                tabla.filas.find((f) => f.corredorId === ana.id)!.puntos,
                7,
            );
            assert.equal(
                tabla.filas.find((f) => f.corredorId === cero.id)!.puntos,
                5,
            );
            await db.resultado.update({
                where: { id: rAna.id },
                data: { puestoGeneral: 2 },
            });
            await service.recalcular(gpId, "Restituir resultado", usuarioId);
        },
    );
    await t.test(
        "una escala retroactiva usa la versión nueva y no suma sobre la anterior",
        async () => {
            const v2 = (
                await service.crearReglamento(
                    gpId,
                    "ParticipantesGrandPrix",
                    version1,
                    usuarioId,
                )
            ).id;
            await service.guardarReglas(
                gpId,
                v2,
                {
                    basePuesto: "ParticipantesGrandPrix",
                    reglas: reglas.map((r) =>
                        r.pruebaId === p5 ? { ...r, puntos: 9 } : r,
                    ),
                },
                usuarioId,
            );
            await assert.rejects(
                service.aplicarReglamento(
                    gpId,
                    v2,
                    { ...aplicacion, pruebaIds: [p5], retroactivo: false },
                    usuarioId,
                ),
                /retroactiva/,
            );
            await service.aplicarReglamento(
                gpId,
                v2,
                { ...aplicacion, pruebaIds: [p5] },
                usuarioId,
            );
            assert.equal(
                (await service.tabla(gpId, {})).filas.find(
                    (f) => f.corredorId === ana.id,
                )!.puntos,
                16,
            );
            assert.equal(
                (await db.puntajeGrandPrix.findUnique({
                    where: {
                        participacionId_pruebaId: {
                            participacionId: insAna,
                            pruebaId: p5,
                        },
                    },
                }))!.reglamentoId,
                v2,
            );
        },
    );
    await t.test(
        "excluir una carrera invalida sus aportes y el cierre verifica eventos distintos",
        async () => {
            await service.incluirPrueba(
                gpId,
                pSegunda,
                false,
                "Prueba retirada",
                usuarioId,
            );
            assert.equal(
                (await service.tabla(gpId, {})).filas.find(
                    (f) => f.corredorId === ana.id,
                )!.puntos,
                9,
            );
            await assert.rejects(
                service.cambiarEstado(
                    gpId,
                    "Cerrado",
                    "Intentar cierre",
                    usuarioId,
                ),
                /2 carreras/,
            );
            await service.incluirPrueba(
                gpId,
                pSegunda,
                true,
                "Prueba restituida",
                usuarioId,
            );
            await service.recalcular(gpId, "Restituir calendario", usuarioId);
        },
    );
    await t.test(
        "una edición cerrada detecta correcciones sin reescribir su tabla",
        async () => {
            await service.cambiarEstado(
                gpId,
                "Cerrado",
                "Cierre de temporada",
                usuarioId,
            );
            assert.equal(
                (await service.tabla(gpId, {})).filas.find(
                    (f) => f.corredorId === largo.id,
                )!.puesto,
                null,
            );
            await db.resultado.update({
                where: { id: rAna.id },
                data: { puestoGeneral: 6 },
            });
            await service.actualizarPorCarrera(carrera1.id);
            const tabla = await service.tabla(gpId, {});
            assert.equal(tabla.grandPrix.necesitaRecalculo, true);
            assert.equal(
                tabla.filas.find((f) => f.corredorId === ana.id)!.puntos,
                16,
            );
            await assert.rejects(
                service.recalcular(gpId, "Intento directo", usuarioId),
                /Reabrí/,
            );
            await service.cambiarEstado(
                gpId,
                "Activo",
                "Reapertura por corrección",
                usuarioId,
            );
            assert.equal(
                (await service.tabla(gpId, {})).filas.find(
                    (f) => f.corredorId === ana.id,
                )!.puntos,
                7,
            );
            assert.ok(
                (await service.obtener(gpId)).cambios.some(
                    (c) => c.accion === "Recalculo",
                ),
            );
        },
    );
    await t.test(
        "asignar una versión futura conserva la regla de las pruebas anteriores",
        async () => {
            const reglaAnterior = (await db.grandPrixPrueba.findUnique({
                where: { id: p5 },
            }))!.reglamentoId;
            await db.carrera.update({
                where: { id: carrera2.id },
                data: { estado: "Activa" },
            });
            const futura = (
                await service.crearReglamento(
                    gpId,
                    "ParticipantesGrandPrix",
                    undefined,
                    usuarioId,
                )
            ).id;
            await service.guardarReglas(
                gpId,
                futura,
                {
                    basePuesto: "ParticipantesGrandPrix",
                    reglas: [{ pruebaId: pSegunda, puesto: 1, puntos: 15 }],
                },
                usuarioId,
            );
            await service.aplicarReglamento(
                gpId,
                futura,
                {
                    pruebaIds: [pSegunda],
                    retroactivo: false,
                    motivo: "Nueva escala para la próxima etapa",
                },
                usuarioId,
            );
            assert.equal(
                (await db.grandPrixPrueba.findUnique({ where: { id: p5 } }))!
                    .reglamentoId,
                reglaAnterior,
            );
            await db.carrera.update({
                where: { id: carrera2.id },
                data: { estado: "Finalizada" },
            });
            await service.actualizarPorCarrera(carrera2.id);
            assert.equal(
                (await service.tabla(gpId, {})).filas.find(
                    (f) => f.corredorId === ana.id,
                )!.puntos,
                15,
            );
        },
    );
    await t.test(
        "vincula carreras existentes de 21 y 30 km y acumula puntos sin administrarlas",
        async () => {
            const carrerasAntes = await db.carrera.count();
            const edicion = (
                await service.crear(
                    { ...datos, nombre: "GP de distancias existentes" },
                    usuarioId,
                )
            ).id;
            const categoria = (
                await service.guardarCategoria(
                    edicion,
                    null,
                    {
                        nombre: "Masculino 18–22",
                        sexo: "Masculino",
                        edadMinima: 18,
                        edadMaxima: 22,
                        discapacidad: null,
                    },
                    usuarioId,
                )
            ).id;
            await service.inscribir(edicion, ana.id, categoria, usuarioId);
            const reglasLargas = [];
            const pruebasLargas = [];
            // Estas modalidades las aporta otro módulo; aquí son solo datos de prueba.
            for (const item of [
                { carreraId: carrera1.id, kilometraje: 21, puntos: 11 },
                { carreraId: carrera2.id, kilometraje: 30, puntos: 17 },
            ]) {
                const distancia = await db.distancia.create({
                    data: {
                        kilometraje: item.kilometraje,
                        tipoDistancia: "Competitiva",
                    },
                });
                const dc = await db.distanciaCarrera.create({
                    data: {
                        idCarrera: item.carreraId,
                        idDistancia: distancia.id,
                        precioDistancia: 0,
                    },
                });
                const prueba = (
                    await service.agregarPrueba(edicion, dc.id, usuarioId)
                ).id;
                pruebasLargas.push(prueba);
                reglasLargas.push({
                    pruebaId: prueba,
                    puesto: 1,
                    puntos: item.puntos,
                });
                await resultado(ana.id, dc.id, 1);
            }
            const version = (
                await service.crearReglamento(
                    edicion,
                    "ParticipantesGrandPrix",
                    undefined,
                    usuarioId,
                )
            ).id;
            await service.guardarReglas(
                edicion,
                version,
                { basePuesto: "ParticipantesGrandPrix", reglas: reglasLargas },
                usuarioId,
            );
            await service.aplicarReglamento(
                edicion,
                version,
                {
                    pruebaIds: pruebasLargas,
                    retroactivo: true,
                    motivo: "Consumir resultados de carreras existentes",
                },
                usuarioId,
            );
            const tabla = await service.tabla(edicion, {});
            assert.equal(
                tabla.filas.find((f) => f.corredorId === ana.id)!.puntos,
                28,
            );
            assert.equal(tabla.carreras, 2);
            assert.equal(await db.carrera.count(), carrerasAntes);
            assert.equal(
                (await service.tabla(gpId, {})).filas.find(
                    (f) => f.corredorId === ana.id,
                )!.puntos,
                15,
            );
            const token = jwt.sign(
                { id: usuarioId, roles: ["Clasificador"] },
                process.env.JWT_SECRET!,
            );
            const catalogo = (await (
                await fetch(`${url}/catalogo-pruebas`, {
                    headers: { Cookie: `token=${token}` },
                })
            ).json()) as { kilometraje: number }[];
            assert.ok(
                catalogo.some((p) => p.kilometraje === 21) &&
                    catalogo.some((p) => p.kilometraje === 30),
            );
        },
    );
});
