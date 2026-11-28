//backend/src/routes/registroModificacion.routes.ts
import { Router } from "express";
import * as registroModificacionController from "../controllers/registroModificacion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";

const router = Router();

//GET historial de modificaciones manuales de una carrera (trazabilidad)
router.get("/carreras/:id/modificaciones",
    authenticate,
    authorize("Administrador"),
    validateParams(idParamSchema),
    registroModificacionController.listar
);

export default router;
