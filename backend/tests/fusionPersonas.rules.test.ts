//backend/tests/fusionPersonas.rules.test.ts
// Se ejecuta con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { planificarFusion, tieneConflictos, type CorredorResumen, type InscripcionResumen, type PersonaResumen,} from "../src/rules/fusionPersonas.rules";

const persona = (id: string, parcial: Partial<PersonaResumen> = {}): PersonaResumen => ({
    id,
    usuarioId: null,
    corredor: null,
    contactoDeCorredoresIds: [],
    ...parcial,
});

const corredor = (id: string, parcial: Partial<CorredorResumen> = {}): CorredorResumen => ({
    id,
    afiliacionId: null,
    aptosMedicosIds: [],
    inscripciones: [],
    ...parcial,
});

const inscripcion = (
    id: string,
    idCarrera: string,
    parcial: Partial<InscripcionResumen> = {}
): InscripcionResumen => ({ id, idCarrera, estado: "Pagada", tieneEntregaKit: false, ...parcial });

test("persona sin referencias: solo se elimina", () => {
    const plan = planificarFusion(persona("C"), persona("D"));
    assert.deepEqual(plan, [{ tipo: "eliminar", tabla: "Persona", id: "D" }]);
});

test("la duplicada solo es contacto de emergencia: repunta el contacto y se elimina", () => {
    const plan = planificarFusion(persona("C"), persona("D", { contactoDeCorredoresIds: ["X"] }));
    assert.deepEqual(plan, [
        { tipo: "repuntar", tabla: "Corredor", campo: "contactoEmergenciaId", id: "X", hacia: "C" },
        { tipo: "eliminar", tabla: "Persona", id: "D" },
    ]);
});

test("la duplicada tiene corredor y la canónica no: repunta personaId del corredor", () => {
    const plan = planificarFusion(persona("C"), persona("D", { corredor: corredor("kD") }));
    assert.deepEqual(plan, [
        { tipo: "repuntar", tabla: "Corredor", campo: "personaId", id: "kD", hacia: "C" },
        { tipo: "eliminar", tabla: "Persona", id: "D" },
    ]);
});

test("ambas tienen corredor sin carreras en común: fusiona y elimina el corredor duplicado", () => {
    const plan = planificarFusion(
        persona("C", { corredor: corredor("kC", { inscripciones: [inscripcion("i1", "carrera1")] }) }),
        persona("D", {
            corredor: corredor("kD", {
                aptosMedicosIds: ["a1"],
                afiliacionId: "af1",
                inscripciones: [inscripcion("i2", "carrera2")],
            }),
        })
    );
    assert.deepEqual(plan, [
        { tipo: "repuntar", tabla: "AptoMedico", campo: "corredorId", id: "a1", hacia: "kC" },
        { tipo: "repuntar", tabla: "Afiliacion", campo: "afiliadoId", id: "af1", hacia: "kC" },
        { tipo: "repuntar", tabla: "Inscripcion", campo: "idCorredor", id: "i2", hacia: "kC" },
        { tipo: "eliminar", tabla: "Corredor", id: "kD" },
        { tipo: "eliminar", tabla: "Persona", id: "D" },
    ]);
    assert.equal(tieneConflictos(plan), false);
});

test("misma carrera en ambos: conflicto y sugiere la inscripción con kit entregado", () => {
    const plan = planificarFusion(
        persona("C", { corredor: corredor("kC", { inscripciones: [inscripcion("i1", "carrera1")] }) }),
        persona("D", {
            corredor: corredor("kD", { inscripciones: [inscripcion("i2", "carrera1", { tieneEntregaKit: true })] }),
        })
    );
    assert.equal(tieneConflictos(plan), true);
    assert.deepEqual(plan.find((o) => o.tipo === "conflicto"), {
        tipo: "conflicto",
        motivo: "INSCRIPCION_REPETIDA_EN_CARRERA",
        detalle: { idCarrera: "carrera1", inscripcionCanonicaId: "i1", inscripcionDuplicadaId: "i2", sugerida: "duplicada" },
    });
});

test("misma carrera con igual prioridad: sugiere la canónica", () => {
    const plan = planificarFusion(
        persona("C", { corredor: corredor("kC", { inscripciones: [inscripcion("i1", "carrera1")] }) }),
        persona("D", { corredor: corredor("kD", { inscripciones: [inscripcion("i2", "carrera1")] }) })
    );
    const conflicto = plan.find((o) => o.tipo === "conflicto");
    assert.equal(conflicto?.tipo === "conflicto" && conflicto.detalle.sugerida, "canonica");
});

test("ambas tienen usuario: conflicto", () => {
    const plan = planificarFusion(persona("C", { usuarioId: "uC" }), persona("D", { usuarioId: "uD" }));
    assert.equal(tieneConflictos(plan), true);
    assert.equal(plan.some((o) => o.tipo === "conflicto" && o.motivo === "AMBAS_TIENEN_USUARIO"), true);
});

test("solo la duplicada tiene usuario: lo repunta a la canónica", () => {
    const plan = planificarFusion(persona("C"), persona("D", { usuarioId: "uD" }));
    assert.deepEqual(plan[0], { tipo: "repuntar", tabla: "Usuario", campo: "personaId", id: "uD", hacia: "C" });
});

test("ambos corredores son socios: conflicto", () => {
    const plan = planificarFusion(
        persona("C", { corredor: corredor("kC", { afiliacionId: "afC" }) }),
        persona("D", { corredor: corredor("kD", { afiliacionId: "afD" }) })
    );
    assert.equal(plan.some((o) => o.tipo === "conflicto" && o.motivo === "AMBOS_SON_SOCIOS"), true);
});

test("la duplicada es contacto de otro corredor y además corredora: repunta ambas referencias", () => {
    const plan = planificarFusion(
        persona("C"),
        persona("D", { corredor: corredor("kD"), contactoDeCorredoresIds: ["X"] })
    );
    assert.deepEqual(plan, [
        { tipo: "repuntar", tabla: "Corredor", campo: "contactoEmergenciaId", id: "X", hacia: "C" },
        { tipo: "repuntar", tabla: "Corredor", campo: "personaId", id: "kD", hacia: "C" },
        { tipo: "eliminar", tabla: "Persona", id: "D" },
    ]);
});

test("el contacto de un corredor que se elimina no se repunta", () => {
    const plan = planificarFusion(
        persona("C", { corredor: corredor("kC") }),
        persona("D", { corredor: corredor("kD"), contactoDeCorredoresIds: ["kD"] })
    );
    assert.equal(plan.some((o) => o.tipo === "repuntar" && o.campo === "contactoEmergenciaId"), false);
});

test("si el contacto de emergencia de la canónica es la duplicada: conflicto de contacto propio", () => {
    const plan = planificarFusion(
        persona("C", { corredor: corredor("kC") }),
        persona("D", { contactoDeCorredoresIds: ["kC"] })
    );
    assert.equal(plan.some((o) => o.tipo === "conflicto" && o.motivo === "CONTACTO_DE_EMERGENCIA_PROPIO"), true);
});

test("las eliminaciones van al final y la persona siempre al último", () => {
    const plan = planificarFusion(
        persona("C", { corredor: corredor("kC") }),
        persona("D", { usuarioId: "uD", corredor: corredor("kD", { aptosMedicosIds: ["a1"] }), contactoDeCorredoresIds: ["X"] })
    );
    const ultimo = plan[plan.length - 1];
    assert.deepEqual(ultimo, { tipo: "eliminar", tabla: "Persona", id: "D" });
    const posCorredor = plan.findIndex((o) => o.tipo === "eliminar" && o.tabla === "Corredor");
    const ultimoRepunte = plan.map((o) => o.tipo).lastIndexOf("repuntar");
    assert.ok(posCorredor > ultimoRepunte);
});

test("ids iguales lanzan error", () => {
    assert.throws(() => planificarFusion(persona("C"), persona("C")), /no pueden ser la misma/);
});