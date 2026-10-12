import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import type { PayloadToken } from "../dtos/usuario.dto";
import { Rol } from "../generated/prisma/client";

//Error 401: validar si el usuario es quien dice ser
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Falta el token" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as PayloadToken;
        req.usuario = { id: payload.id, roles: payload.roles };
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: "Token expirado" });
        }
        return res.status(401).json({ error: "Token inválido" });
    }
}

//Error 403: validar si el usuario tiene los permisos requeridos
export function authorize(...roles: Rol[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        
        if (!req.usuario) return res.status(401).json({ error: "No autenticado" });

        const tienePermiso = req.usuario.roles.some(rolUsuario => roles.includes(rolUsuario));

        if (!tienePermiso) return res.status(403).json({ error: "No tenés permiso para esta operación" });
        
        next();
    };
}