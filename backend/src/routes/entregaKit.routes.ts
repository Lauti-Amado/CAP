//backend/src/routes/entregaKit.routes.ts
import { Router } from "express";
import * as entregaKitController from "../controllers/entregaKit.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";
import { entregarKitSchema } from "../validations/dorsal.validations";

const router = Router();

const protegido = [authenticate, authorize("Administrador", "Clasificador")];

router.post("/inscripciones/:id/entrega-kit",
    ...protegido, validateParams(idParamSchema), validate(entregarKitSchema), entregaKitController.entregar);

router.get("/inscripciones/:id/entrega-kit",
    ...protegido, validateParams(idParamSchema), entregaKitController.obtener);

router.delete("/inscripciones/:id/entrega-kit",
    ...protegido, validateParams(idParamSchema), entregaKitController.deshacer);

router.get("/carreras/:id/entregas-recientes",
    ...protegido, validateParams(idParamSchema), entregaKitController.recientes);

 router.get(
    "/carreras/:id/corredores",
    ...protegido,
    validateParams(idParamSchema),
    entregaKitController.buscarCorredor
); 
export default router;