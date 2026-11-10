//backend/src/routes/carrera.routes.ts
import { Router } from "express";

import * as carreraController from "../controllers/carrera.controller";
import * as carreraDetalleController from "../controllers/carreraDetalle.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { idParamSchema } from "../validations/id.validations";
import { validateParams } from "../middlewares/validate.middleware";

const router = Router();

//GET carreras
router.get("/", 
    carreraController.getAll
);

//GET carrera por ID
router.get("/:id", 
    validateParams(idParamSchema), 
    carreraController.getById   
);

//NOTA: Ni POST o PUT se incluyen porque eso es el objetivo del sistema web.

//GET detalle de una carrera (con inscriptos, kits entregados y clasificados)
router.get("/:id/detalle",
    authenticate,
    authorize("Administrador", "Clasificador"),
    validateParams(idParamSchema),
    carreraDetalleController.getDetalle
);

export default router;