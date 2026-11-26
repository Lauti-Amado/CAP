//backend/src/controllers/carreraDetalle.controller.ts
import type { Request, Response } from "express";
import * as carreraDetalleService from "../services/carreraDetalle.service";

export async function getDetalle(req: Request, res: Response) {
    return res.json(await carreraDetalleService.obtenerDetalle(req.params.id as string));
}