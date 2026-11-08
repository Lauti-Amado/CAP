//backend/src/routes/inscripcionGestion.routes.ts
import { Router } from "express";
import * as inscripcionController from "../controllers/inscripcionGestion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";
import { crearInscripcionSchema, modificarInscripcionSchema } from "../validations/inscripcionGestion.validations";

const router = Router();

const protegido = [authenticate, authorize("Administrador", "Clasificador")];

router.get("/inscripciones", ...protegido, inscripcionController.listar);

router.get("/inscripciones/:id",
    ...protegido, validateParams(idParamSchema), inscripcionController.obtener);

// Formulario de nueva inscripción
router.get("/carreras/:id/inscripciones/opciones",
    ...protegido, validateParams(idParamSchema), inscripcionController.opciones);

router.get("/contactos-emergencia", ...protegido, inscripcionController.buscarContacto);

router.post("/carreras/:id/inscripciones",
    ...protegido, validateParams(idParamSchema), validate(crearInscripcionSchema), inscripcionController.crear);

router.delete("/inscripciones/:id",
    ...protegido, validateParams(idParamSchema), inscripcionController.anular);

router.put("/inscripciones/:id",
    ...protegido, validateParams(idParamSchema), validate(modificarInscripcionSchema), inscripcionController.modificar);

export default router;