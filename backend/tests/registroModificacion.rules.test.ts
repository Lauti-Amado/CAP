//backend/tests/registroModificacion.rules.test.ts
// Se ejecuta con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { cambiosRegistrables, valorComoTexto } from "../src/rules/registroModificacion.rules";

test("valorComoTexto: null y undefined quedan como null", () => {
    assert.equal(valorComoTexto(null), null);
    assert.equal(valorComoTexto(undefined), null);
});

test("valorComoTexto: números y booleanos pasan a texto", () => {
    assert.equal(valorComoTexto(125000), "125000");
    assert.equal(valorComoTexto(0), "0");
    assert.equal(valorComoTexto(false), "false");
});

test("valorComoTexto: las fechas se guardan en ISO", () => {
    assert.equal(valorComoTexto(new Date("2026-11-27T12:00:00.000Z")), "2026-11-27T12:00:00.000Z");
});

test("cambiosRegistrables: descarta los campos que no cambiaron", () => {
    const cambios = cambiosRegistrables([
        { campo: "puestoGeneral", anterior: 3, nuevo: 4 },
        { campo: "estado", anterior: "Oficial", nuevo: "Oficial" },
    ]);
    assert.deepEqual(cambios, [{ campo: "puestoGeneral", valorAnterior: "3", valorNuevo: "4" }]);
});

test("cambiosRegistrables: un número y su texto son el mismo valor", () => {
    assert.deepEqual(cambiosRegistrables([{ campo: "puestoGeneral", anterior: 3, nuevo: "3" }]), []);
});

test("cambiosRegistrables: null y undefined son el mismo valor", () => {
    assert.deepEqual(cambiosRegistrables([{ campo: "tiempoLlegada", anterior: undefined, nuevo: null }]), []);
});

test("cambiosRegistrables: pasar de vacío a un valor es un cambio", () => {
    const cambios = cambiosRegistrables([{ campo: "dorsal", anterior: null, nuevo: "125" }]);
    assert.deepEqual(cambios, [{ campo: "dorsal", valorAnterior: null, valorNuevo: "125" }]);
});

test("cambiosRegistrables: pasar de un valor a vacío (eliminación) es un cambio", () => {
    const cambios = cambiosRegistrables([{ campo: "dorsal", anterior: "125", nuevo: undefined }]);
    assert.deepEqual(cambios, [{ campo: "dorsal", valorAnterior: "125", valorNuevo: null }]);
});

test("cambiosRegistrables: dos fechas iguales no son un cambio", () => {
    const cambios = cambiosRegistrables([
        { campo: "fechaVencimiento", anterior: new Date("2027-01-01T00:00:00.000Z"), nuevo: new Date("2027-01-01T00:00:00.000Z") },
    ]);
    assert.deepEqual(cambios, []);
});

test("cambiosRegistrables: sin cambios devuelve una lista vacía", () => {
    assert.deepEqual(cambiosRegistrables([]), []);
});
