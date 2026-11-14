//backend/src/routes/usuarioGestion.routes.ts
import { Router } from "express";
import * as usuarioGestionController from "../controllers/usuarioGestion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";
import { actualizarRolesSchema } from "../validations/usuarioGestion.validation";

const router = Router();

router.use(authenticate, authorize("Administrador"));

//Listar usuarios del personal (paginado)
router.get("/", usuarioGestionController.listar);

//Detalle de un usuario
router.get("/:id",
    validateParams(idParamSchema),
    usuarioGestionController.obtener
);

//Cambiar los roles de un usuario
router.patch("/:id",
    validateParams(idParamSchema),
    validate(actualizarRolesSchema),
    usuarioGestionController.actualizarRoles
);

export default router;