//backend/src/routes/claveRespaldo.routes.ts
import { Router } from "express";
import * as claveController from "../controllers/claveRespaldo.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("Administrador"));

//Cuentas de clasificadores con su cantidad de claves disponibles
router.get("/cuentas", claveController.listarCuentas);

//Claves de una cuenta (?usuarioId=...)
router.get("/", claveController.listarPorCuenta);

//Anular las claves disponibles de una cuenta y generar un juego nuevo
router.put("/", claveController.reemplazar);

export default router;