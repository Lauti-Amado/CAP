//backend/src/routes/usuario.routes.ts
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";

import { registroCorredorSchema, loginSchema, loginContingenciaSchema } from "../validations/usuario.validations";
import { limitarContingencia } from "../middlewares/limitarContingencia.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

//Loggearse en el sistema
router.post("/login",    
    validate(loginSchema),           
    authController.login
);

//Acceso de contingencia con clave de respaldo
router.post("/contingencia",
    limitarContingencia,
    validate(loginContingenciaSchema),
    authController.loginContingencia
);

//Logout
router.post("/logout", 
    authController.logout
);

//Recuperar datos de usuario propios
router.get("/yo",       
    authenticate,                    
    authController.yo
);

export default router;