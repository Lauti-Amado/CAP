//backend/src/routes/clasificacion.routes.ts
import { Router } from "express";
import * as clasificacionController from "../controllers/clasificacion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";
import { cambiarEstadoClasificacionSchema, registrarResultadoSchema } from "../validations/clasificacion.validations";

const router = Router();

// Ambos roles acceden a la clasificación y pueden descalificar (ver permisos de acceso)
const protegido = [authenticate, authorize("Administrador", "Clasificador")];

//GET clasificaciones de una carrera (con o sin resultado)
router.get("/carreras/:id/clasificacion",
    ...protegido, validateParams(idParamSchema), clasificacionController.getByCarrera);

//GET datos para la vista de clasificación en tiempo real
router.get("/carreras/:id/clasificacion/tiempo-real",
    ...protegido, validateParams(idParamSchema), clasificacionController.getTiempoReal);

//GET clasificación de una inscripción
router.get("/clasificaciones/:id",
    ...protegido, validateParams(idParamSchema), clasificacionController.getById);

//PATCH estado de una clasificación (descalificar, no finalizó)
router.patch("/clasificaciones/:id",
    ...protegido, validateParams(idParamSchema), validate(cambiarEstadoClasificacionSchema), clasificacionController.patchEstado);

//PUT resultado (tiempo, puesto y estado) de una clasificación
router.put("/clasificaciones/:id/resultado",
    ...protegido, validateParams(idParamSchema), validate(registrarResultadoSchema), clasificacionController.putResultado);

export default router;
