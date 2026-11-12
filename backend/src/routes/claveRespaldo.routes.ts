//backend/src/routes/claveRespaldo.routes.ts
import { Router } from "express";
import * as claveController from "../controllers/claveRespaldo.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("Administrador"));

//Ver el lote vigente
router.get("/", claveController.listar);

//Invalidar el lote actual y generar uno nuevo
router.post("/", claveController.generar);

export default router;