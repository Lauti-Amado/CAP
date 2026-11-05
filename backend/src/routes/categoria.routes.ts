import { Router } from "express";

import * as categoriaController from "../controllers/categoria.controller";

import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";

import { idParamSchema } from "../validations/id.validations";
import {
    crearCategoriaSchema,
    actualizarCategoriaSchema,
} from "../validations/categoria.validations";

const router = Router();

// Solo el administrador puede configurar las categorías.
const protegido = [authenticate, authorize("Administrador")];

// GET: listar todas las categorías.
router.get(
    "/",
    ...protegido,
    categoriaController.getAll
);

// GET: obtener una categoría por ID.
router.get(
    "/:id",
    ...protegido,
    validateParams(idParamSchema),
    categoriaController.getById
);

// POST: crear una categoría.
router.post(
    "/",
    ...protegido,
    validate(crearCategoriaSchema),
    categoriaController.post
);

// PUT: actualizar una categoría.
router.put(
    "/:id",
    ...protegido,
    validateParams(idParamSchema),
    validate(actualizarCategoriaSchema),
    categoriaController.put
);

// DELETE: eliminar una categoría.
router.delete(
    "/:id",
    ...protegido,
    validateParams(idParamSchema),
    categoriaController.remove
);

export default router;