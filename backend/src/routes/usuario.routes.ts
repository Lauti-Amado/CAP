import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";

import { registroCorredorSchema, loginSchema } from "../validations/usuario.validations";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

//Loggearse en el sistema
router.post("/login",    
    validate(loginSchema),           
    authController.login
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