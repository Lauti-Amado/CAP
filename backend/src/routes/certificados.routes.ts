//backend/src/routes/certificados.routes.ts
import { Router } from "express";
import * as certificadosController from "../controllers/certificados.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";

const router = Router();

// Pantalla de Resultados: la usan ambos roles
const protegido = [authenticate, authorize("Administrador", "Clasificador")];

router.get("/carreras/:id/certificados/candidatos",
    ...protegido, validateParams(idParamSchema), certificadosController.getCandidatos);

router.get("/carreras/:id/certificados/pendientes",
    ...protegido, validateParams(idParamSchema), certificadosController.getPendientes);

router.post("/carreras/:id/certificados/pendientes/reintentar",
    ...protegido, validateParams(idParamSchema), certificadosController.postReintentar);

router.post("/inscripciones/:id/certificado",
    ...protegido, validateParams(idParamSchema), certificadosController.postEnviar);

export default router;