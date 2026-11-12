//backend/src/routes/usuarioGestion.routes.ts
import { Router } from "express";
import * as usuarioGestionController from "../controllers/usuarioGestion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { actualizarRolesSchema } from "../validations/usuarioGestion.validation";

const router = Router();

router.use(authenticate, authorize("Administrador"));

//Listar usuarios del personal (paginado)
router.get("/", usuarioGestionController.listar);

//Detalle de un usuario
router.get("/:id", usuarioGestionController.obtener);

//Cambiar los roles de un usuario
router.patch("/:id",
    validate(actualizarRolesSchema),
    usuarioGestionController.actualizarRoles
);

export default router;