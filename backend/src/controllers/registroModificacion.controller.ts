//backend/src/controllers/registroModificacion.controller.ts
import type { Request, Response } from "express";
import * as registroModificacionService from "../services/registroModificacion.service";
import { registroModificacionQuerySchema } from "../validations/registroModificacion.validations";

export async function listar(req: Request, res: Response) {
    const filtros = registroModificacionQuerySchema.parse(req.query);
    return res.json(await registroModificacionService.listarPorCarrera(req.params.id as string, filtros));
}
