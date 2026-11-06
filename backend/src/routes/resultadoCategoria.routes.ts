//backend/src/routes/resultadoCategoria.routes.ts
import { Router } from "express";
import * as resultadoCategoriaController from "../controllers/resultadoCategoria.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateParams } from "../middlewares/validate.middleware";
import { carreraCategoriaParamsSchema } from "../validations/resultadoCategoria.validations";

const router = Router();

const protegido = [authenticate, authorize("Administrador", "Clasificador")];

// Genera los puestos de una categoría para toda la carrera (post-proceso de la clasificación general)
router.post("/carreras/:id/categorias/:categoriaId/resultados",
    ...protegido, validateParams(carreraCategoriaParamsSchema), resultadoCategoriaController.generar);

export default router;