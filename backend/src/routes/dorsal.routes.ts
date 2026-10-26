//backend/src/routes/dorsal.routes.ts
import { Router } from "express";
import * as dorsalController from "../controllers/dorsal.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";
import { asignarDorsalSchema, inventarioSchema, vincularChipSchema } from "../validations/dorsal.validations";

const router = Router();

const protegido = [authenticate, authorize("Administrador", "Clasificador")];
const soloAdmin = [authenticate, authorize("Administrador")];

router.get("/carreras/entrega-kits/actual", ...protegido, dorsalController.carreraActual);

router.get("/carreras/:id/entrega-kits/inscripcion",
    ...protegido, validateParams(idParamSchema), dorsalController.buscarInscripcion);

router.get("/carreras/:id/entregas-recientes",
    ...protegido, validateParams(idParamSchema), dorsalController.entregasRecientes);

router.get("/carreras/:id/dorsales",
    ...protegido, validateParams(idParamSchema), dorsalController.listar);

router.get("/carreras/:id/dorsales/:numero",
    ...protegido, validateParams(idParamSchema), dorsalController.consultar);

router.post("/inscripciones/:id/dorsal",
    ...protegido, validateParams(idParamSchema), validate(asignarDorsalSchema), dorsalController.asignar);

router.delete("/inscripciones/:id/dorsal",
    ...protegido, validateParams(idParamSchema), dorsalController.desasignar);

router.put("/dorsales/:id/chip",
    ...protegido, validateParams(idParamSchema), validate(vincularChipSchema), dorsalController.vincularChip);

// Inventario: dorsales físicos con su chip
router.post("/dorsales/inventario",
    ...soloAdmin, validate(inventarioSchema), dorsalController.cargarInventario);

export default router;