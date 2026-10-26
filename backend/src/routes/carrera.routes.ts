import { Router } from "express";

import * as carreraController from "../controllers/carrera.controller";

import { idParamSchema } from "../validations/id.validations";

import { validateParams } from "../middlewares/validate.middleware";


const router = Router();

//GET carreras
router.get("/", 
    carreraController.getAll
);

//GET carrera por ID
router.get("/:id", 
    validateParams(idParamSchema), 
    carreraController.getById   
);

//NOTA: Ni POST o PUT se incluyen porque eso es el objetivo del sistema web.

export default router;