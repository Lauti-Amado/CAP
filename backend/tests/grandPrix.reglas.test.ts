import { test } from "node:test";
import assert from "node:assert/strict";
import {
    asignarPosiciones,
    calcularAportes,
    categoriasSeSuperponen,
    cumpleCategoria,
    type CategoriaGP,
    type PruebaGP,
    type ParticipanteGP,
} from "../src/services/grandPrix.reglas";

const joven: CategoriaGP = {
    id: "joven",
    nombre: "M18-22",
    sexo: "Masculino",
    edadMinima: 18,
    edadMaxima: 22,
    discapacidad: null,
};
const mayor: CategoriaGP = {
    ...joven,
    id: "mayor",
    nombre: "M23-26",
    edadMinima: 23,
    edadMaxima: 26,
};
const corredor = (id: string, nacimiento = "2005-06-01") => ({
    id,
    fechaNacimiento: new Date(nacimiento),
    sexo: "Masculino" as const,
    discapacidad: null,
});
const participante = (id: string, categoriaId = joven.id): ParticipanteGP => ({
    id,
    corredorId: id,
    categoriaId,
    estado: "Activa",
    fechaInscripcion: new Date("2026-01-01"),
    afiliacionVerificada: true,
});
const prueba = (id: string, carreraId = id): PruebaGP => ({
    id,
    carreraId,
    fechaCarrera: new Date("2026-07-01"),
    estadoCarrera: "Finalizada",
    incluida: true,
    reglamentoId: "v1",
    basePuesto: "ParticipantesGrandPrix",
    reglas: [{ puesto: 1, puntos: 5 }],
    resultados: [],
});
const calcular = (pruebas: PruebaGP[], participantes = [participante("ana")]) =>
    calcularAportes({
        fechaReferenciaEdad: new Date("2026-01-01"),
        exigeAfiliacion: true,
        admiteResultadosPrevios: false,
        categorias: [joven, mayor],
        participantes,
        pruebas,
    });

test("el primer puesto puntúa independientemente en cada categoría y los otros reciben cero", () => {
    const p = prueba("5k");
    p.resultados = [
        { id: "r1", puestoGeneral: 1, corredor: corredor("ana") },
        {
            id: "r2",
            puestoGeneral: 2,
            corredor: corredor("beto", "2001-01-01"),
        },
        { id: "r3", puestoGeneral: 3, corredor: corredor("cero") },
    ];
    const aportes = calcular(
        [p],
        [
            participante("ana"),
            participante("beto", mayor.id),
            participante("cero"),
        ],
    );
    assert.deepEqual(
        aportes.map((a) => [a.participacionId, a.puestoCategoria, a.puntos]),
        [
            ["ana", 1, 5],
            ["beto", 1, 5],
            ["cero", 2, 0],
        ],
    );
});
test("se diferencia el puesto entre todos los corredores del puesto entre participantes del GP", () => {
    const p = prueba("5k");
    p.resultados = [
        { id: "externo", puestoGeneral: 1, corredor: corredor("externo") },
        { id: "r1", puestoGeneral: 2, corredor: corredor("ana") },
    ];
    assert.equal(calcular([p])[0].puntos, 5);
    p.basePuesto = "TodosCarrera";
    assert.deepEqual(
        [calcular([p])[0].puestoCategoria, calcular([p])[0].puntos],
        [2, 0],
    );
});
test("cada prueba tiene su propia escala y ejecutar dos veces no altera el cálculo", () => {
    const cinco = prueba("5k"),
        diez = prueba("10k");
    cinco.resultados = [
        { id: "r1", puestoGeneral: 1, corredor: corredor("ana") },
    ];
    diez.resultados = [
        { id: "r2", puestoGeneral: 1, corredor: corredor("ana") },
    ];
    diez.reglas = [{ puesto: 1, puntos: 10 }];
    const resultado = calcular([cinco, diez]);
    assert.deepEqual(
        resultado.map((a) => a.puntos),
        [5, 10],
    );
    assert.deepEqual(calcular([cinco, diez]), resultado);
});
test("la fecha de edad es fija y los rangos adyacentes no se superponen", () => {
    const c = corredor("ana", "2003-06-01");
    assert.equal(cumpleCategoria(joven, c, new Date("2026-01-01")), true);
    assert.equal(cumpleCategoria(mayor, c, new Date("2026-01-01")), false);
    assert.equal(categoriasSeSuperponen(joven, mayor), false);
    assert.equal(
        categoriasSeSuperponen(joven, { ...mayor, edadMinima: 22 }),
        true,
    );
});
test("se excluyen resultados previos a la inscripción y participaciones sin afiliación verificada", () => {
    const p = prueba("5k");
    p.resultados = [{ id: "r1", puestoGeneral: 1, corredor: corredor("ana") }];
    assert.equal(
        calcular(
            [p],
            [
                {
                    ...participante("ana"),
                    fechaInscripcion: new Date("2026-08-01"),
                },
            ],
        ).length,
        0,
    );
    assert.equal(
        calcular([p], [{ ...participante("ana"), afiliacionVerificada: false }])
            .length,
        0,
    );
});
test("no se suman dos distancias de la misma carrera ni puestos ambiguos", () => {
    const p = prueba("5k", "evento"),
        q = prueba("10k", "evento");
    p.resultados = [{ id: "r1", puestoGeneral: 1, corredor: corredor("ana") }];
    q.resultados = [{ id: "r2", puestoGeneral: 1, corredor: corredor("ana") }];
    assert.throws(() => calcular([p, q]), /dos distancias/);
    p.resultados.push({
        id: "r3",
        puestoGeneral: 1,
        corredor: corredor("otro"),
    });
    assert.throws(() => calcular([p]), /duplicados/);
});
test("pruebas excluidas o no finalizadas no aportan y los empates comparten puesto", () => {
    const p = prueba("5k");
    p.incluida = false;
    assert.deepEqual(calcular([p]), []);
    assert.deepEqual(
        asignarPosiciones([
            { nombre: "B", puntos: 5 },
            { nombre: "A", puntos: 5 },
            { nombre: "C", puntos: 1 },
        ]).map((f) => f.puesto),
        [1, 1, 3],
    );
});
