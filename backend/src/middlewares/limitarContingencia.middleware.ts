//backend/src/middlewares/middlewares/limitarContingencia.middleware.ts
import { Request, Response, NextFunction } from "express";

const MAX_FALLOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

let fallos = 0;
let bloqueadoHasta = 0;

//Frena la adivinanza de claves: 5 fallos seguidos bloquean el acceso 15 minutos
export function limitarContingencia(req: Request, res: Response, next: NextFunction) {
    const ahora = Date.now();
    if (bloqueadoHasta > ahora) {
        const minutos = Math.ceil((bloqueadoHasta - ahora) / 60000);
        return res.status(429).json({ error: `Demasiados intentos fallidos. Reintentá en ${minutos} min.` });
    }

    res.on("finish", () => {
        if (res.statusCode === 401) {
            fallos++;
            if (fallos >= MAX_FALLOS) {
                bloqueadoHasta = Date.now() + BLOQUEO_MS;
                fallos = 0;
            }
        } else if (res.statusCode === 200) {
            fallos = 0;
        }
    });

    next();
}