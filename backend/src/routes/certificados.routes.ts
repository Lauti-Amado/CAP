//backend/src/routes/certificados.routes.ts
import { Router } from 'express'
import { enviarCertificados } from '../controllers/certificados.controller'

const router = Router()

// TODO: proteger con los middlewares de autenticación y rol de administrador
// antes de usarlo en serio: este endpoint dispara emails masivos.
router.post('/carreras/:id/certificados/envios', enviarCertificados)

export default router