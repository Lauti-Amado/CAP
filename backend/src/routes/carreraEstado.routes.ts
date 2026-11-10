//backend/src/routes/carreraEstado.routes.ts
import { Router } from "express";
import * as carreraEstadoController from "../controllers/carreraEstado.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";

const router = Router();

// Solo el administrador da inicio a la carrera
router.post("/carreras/:id/iniciar",
    authenticate, authorize("Administrador"), validateParams(idParamSchema), carreraEstadoController.iniciar);

router.post("/carreras/:id/finalizar",
    authenticate, authorize("Administrador", "Clasificador"), validateParams(idParamSchema), carreraEstadoController.finalizar);

export default router;