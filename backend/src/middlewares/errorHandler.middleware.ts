import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client";
import { BaseError } from "../errors/base.error";

export const errorHandler = (
    err: unknown, _req: Request, res: Response, _next: NextFunction
) => {
    //Errores propios de la app (se crean en la carpeta /backend/errors)
    if (err instanceof BaseError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    //Errores de request (JSON enviado mal formado)
    if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
        return res.status(400).json({ 
            message: "El formato del JSON enviado es inválido." 
        });
    }

    //Errores de validacion de Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: "Datos inválidos",
            detalles: err.issues.map(i => ({
                campo: i.path.join("."), mensaje: i.message
            })),
        });
    }

    //Errores de Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") return res.status(409).json({ error: "Ya existe un registro con ese valor" });
        if (err.code === "P2025") return res.status(404).json({ error: "No encontrado" });
        if (err.code === "P2003") return res.status(409).json({ error: "Hay registros relacionados" });
    };

    console.error(err);
    return res.status(500).json({ error: "Error interno del servidor" });
};