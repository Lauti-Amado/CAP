//backend/src/controllers/actividad.controller.ts
import type { Request, Response } from "express";
import * as actividadService from "../services/actividad.service";
import { actividadQuerySchema } from "../validations/actividad.validations";

export async function listar(req: Request, res: Response) {
    const { limite } = actividadQuerySchema.parse(req.query);
    return res.json(await actividadService.listarPorCarrera(req.params.id as string, limite));
}