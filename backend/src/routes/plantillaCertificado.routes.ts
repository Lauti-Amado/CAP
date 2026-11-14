//backend/src/routes/plantillaCertificado.routes.ts
import { Router } from "express";
import * as plantillaController from "../controllers/plantillaCertificado.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";
import { plantillaCertificadoSchema } from "../validations/plantillaCertificado.validations";

const router = Router();

// Las plantillas se gestionan desde el panel de administración
const soloAdmin = [authenticate, authorize("Administrador")];

router.get("/", ...soloAdmin, plantillaController.getAll);
router.post("/", ...soloAdmin, validate(plantillaCertificadoSchema), plantillaController.post);
router.put("/:id", ...soloAdmin, validateParams(idParamSchema), validate(plantillaCertificadoSchema), plantillaController.put);
router.patch("/:id/activar", ...soloAdmin, validateParams(idParamSchema), plantillaController.patchActivar);
router.delete("/:id", ...soloAdmin, validateParams(idParamSchema), plantillaController.remove);

export default router;