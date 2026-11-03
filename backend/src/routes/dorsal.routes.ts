//backend/src/routes/dorsal.routes.ts
import { Router } from "express";
import * as dorsalController from "../controllers/dorsal.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";
import { crearDorsalSchema, inventarioSchema, vincularChipSchema } from "../validations/dorsal.validations";

const router = Router();

const protegido = [authenticate, authorize("Administrador", "Clasificador")];
const soloAdmin = [authenticate, authorize("Administrador")];

// Inventario de dorsales (cada uno con su chip opcional)
router.get("/dorsales", ...protegido, dorsalController.listar);
router.post("/dorsales", ...soloAdmin, validate(crearDorsalSchema), dorsalController.crear);
router.post("/dorsales/inventario", ...soloAdmin, validate(inventarioSchema), dorsalController.cargarInventario);
router.get("/dorsales/:id", ...protegido, validateParams(idParamSchema), dorsalController.obtener);

// Chip del dorsal
router.put("/dorsales/:id/chip",
    ...protegido, validateParams(idParamSchema), validate(vincularChipSchema), dorsalController.vincularChip);
router.delete("/dorsales/:id/chip",
    ...protegido, validateParams(idParamSchema), dorsalController.desvincularChip);

// El dorsal dentro de una carrera
router.get("/carreras/:id/dorsales",
    ...protegido, validateParams(idParamSchema), dorsalController.listarEnCarrera);
router.get("/carreras/:id/dorsales/:numero",
    ...protegido, validateParams(idParamSchema), dorsalController.consultarEnCarrera);

// Lectura RFID: del chip al dorsal y su entrega en la carrera
router.get("/carreras/:id/chips/:numero",
    ...protegido, validateParams(idParamSchema), dorsalController.identificarPorChip);

export default router;