//backend/src/middlewares/limitarContingencia.middleware.ts
import { Request, Response, NextFunction } from "express";

const MAX_FALLOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const MAX_EMAILS_RASTREADOS = 500;

type Intentos = { fallos: number; ultimoFallo: number; bloqueadoHasta: number };

const porEmail = new Map<string, Intentos>();

const normalizar = (valor: unknown) => String(valor ?? "").trim().toLowerCase();

const vencido = (e: Intentos, ahora: number) =>
    e.bloqueadoHasta <= ahora && ahora - e.ultimoFallo > BLOQUEO_MS;

//Frena la adivinanza de claves: 5 fallos seguidos bloquean ese email 15 minutos
export function limitarContingencia(req: Request, res: Response, next: NextFunction) {
    const ahora = Date.now();
    const email = normalizar(req.body?.email);

    //Se descartan los registros vencidos para que el mapa no crezca sin límite
    for (const [clave, estado] of porEmail) {
        if (vencido(estado, ahora)) porEmail.delete(clave);
    }

    const actual = porEmail.get(email);
    const bloqueado = actual !== undefined && actual.bloqueadoHasta > ahora;
    const saturado = actual === undefined && porEmail.size >= MAX_EMAILS_RASTREADOS;

    if (bloqueado || saturado) {
        const minutos = bloqueado ? Math.ceil((actual.bloqueadoHasta - ahora) / 60000) : 15;
        return res.status(429).json({ error: `Demasiados intentos fallidos. Reintentá en ${minutos} min.` });
    }

    res.on("finish", () => {
        if (res.statusCode === 200) {
            porEmail.delete(email);
            return;
        }
        if (res.statusCode !== 401) return;

        const estado = porEmail.get(email) ?? { fallos: 0, ultimoFallo: 0, bloqueadoHasta: 0 };
        estado.fallos++;
        estado.ultimoFallo = Date.now();
        if (estado.fallos >= MAX_FALLOS) {
            estado.bloqueadoHasta = Date.now() + BLOQUEO_MS;
            estado.fallos = 0;
        }
        porEmail.set(email, estado);
    });

    next();
}