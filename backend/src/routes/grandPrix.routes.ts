import { Router } from "express";
import * as controller from "../controllers/grandPrix.controller";
import * as schemas from "../validations/grandPrix.validations";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/id.validations";

const router = Router();
router.use(authenticate, authorize("Administrador", "Clasificador"));
const admin = authorize("Administrador");
const edition = validateParams(idParamSchema);
const resource = validateParams(schemas.grandPrixRecursoParams);
router.get("/", controller.listar);
router.get("/catalogo-pruebas", controller.catalogo);
router.get("/corredores", admin, controller.buscarCorredores);
router.post(
    "/",
    admin,
    validate(schemas.datosGrandPrixSchema),
    controller.crear,
);
router.get("/:id", edition, controller.obtener);
router.put(
    "/:id",
    admin,
    edition,
    validate(schemas.actualizarGrandPrixSchema),
    controller.actualizar,
);
router.post(
    "/:id/estado",
    admin,
    edition,
    validate(schemas.estadoGrandPrixSchema),
    controller.estado,
);
router.get("/:id/tabla", edition, controller.tabla);
router.get("/:id/cambios/:recursoId", resource, controller.cambio);
router.post(
    "/:id/recalcular",
    admin,
    edition,
    validate(schemas.recalcularGrandPrixSchema),
    controller.recalcular,
);
router.post(
    "/:id/categorias",
    admin,
    edition,
    validate(schemas.categoriaGrandPrixSchema),
    controller.categoria,
);
router.put(
    "/:id/categorias/:recursoId",
    admin,
    resource,
    validate(schemas.categoriaGrandPrixSchema),
    controller.categoria,
);
router.delete(
    "/:id/categorias/:recursoId",
    admin,
    resource,
    controller.eliminarCategoria,
);
router.post(
    "/:id/pruebas",
    admin,
    edition,
    validate(schemas.pruebaGrandPrixSchema),
    controller.prueba,
);
router.patch(
    "/:id/pruebas/:recursoId",
    admin,
    resource,
    validate(schemas.incluirPruebaSchema),
    controller.incluirPrueba,
);
router.post(
    "/:id/participaciones",
    admin,
    edition,
    validate(schemas.participacionGrandPrixSchema),
    controller.participacion,
);
router.patch(
    "/:id/participaciones/:recursoId",
    admin,
    resource,
    validate(schemas.estadoParticipacionSchema),
    controller.estadoParticipacion,
);
router.post(
    "/:id/reglamentos",
    admin,
    edition,
    validate(schemas.reglamentoGrandPrixSchema),
    controller.reglamento,
);
router.put(
    "/:id/reglamentos/:recursoId",
    admin,
    resource,
    validate(schemas.reglasGrandPrixSchema),
    controller.reglas,
);
router.post(
    "/:id/reglamentos/:recursoId/previsualizar",
    admin,
    resource,
    validate(schemas.aplicarReglamentoSchema),
    controller.preview,
);
router.post(
    "/:id/reglamentos/:recursoId/aplicar",
    admin,
    resource,
    validate(schemas.aplicarReglamentoSchema),
    controller.aplicar,
);
export default router;
