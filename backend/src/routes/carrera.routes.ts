// backend/src/routes/carrera.routes.ts

import { Router } from "express";

import * as carreraController from "../controllers/carrera.controller";
import * as carreraDetalleController from "../controllers/carreraDetalle.controller";

import { authenticate, authorize } from "../middlewares/auth.middleware";
import { idParamSchema } from "../validations/id.validations";
import { validateParams } from "../middlewares/validate.middleware";

const router = Router();

// Ambos roles pueden consultar carreras
const protegido = [
    authenticate,
    authorize("Administrador", "Clasificador")
];

// GET todas las carreras
router.get(
    "/",
    ...protegido,
    carreraController.getAll
);

// GET carrera por ID
router.get(
    "/:id",
    ...protegido,
    validateParams(idParamSchema),
    carreraController.getById
);

// GET detalle de una carrera
// Incluye inscriptos, kits entregados y clasificados
router.get(
    "/:id/detalle",
    ...protegido,
    validateParams(idParamSchema),
    carreraDetalleController.getDetalle
);

export default router;