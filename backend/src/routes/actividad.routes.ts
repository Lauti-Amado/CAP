//backend/src/routes/actividad.routes.ts
import { Router } from "express";
import * as actividadController from "../controllers/actividad.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";

const router = Router();

//GET actividad reciente de una carrera
router.get("/carreras/:id/actividad",
    authenticate,
    authorize("Administrador", "Clasificador"),
    validateParams(idParamSchema),
    actividadController.listar
);

export default router;