//backend/src/routes/inscripcionGestion.routes.ts
import { Router } from "express";
import * as inscripcionController from "../controllers/inscripcionGestion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";

const router = Router();

const protegido = [authenticate, authorize("Administrador", "Clasificador")];

router.get("/inscripciones", ...protegido, inscripcionController.listar);

router.get("/inscripciones/:id",
    ...protegido, validateParams(idParamSchema), inscripcionController.obtener);

// Formulario de nueva inscripción
router.get("/carreras/:id/inscripciones/opciones",
    ...protegido, validateParams(idParamSchema), inscripcionController.opciones);

router.get("/contactos-emergencia", ...protegido, inscripcionController.buscarContacto);

export default router;