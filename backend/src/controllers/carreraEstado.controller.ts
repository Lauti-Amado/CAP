//backend/src/controllers/carreraEstado.controller.ts
import type { Request, Response } from "express";
import * as carreraEstadoService from "../services/carreraEstado.service";

export async function iniciar(req: Request, res: Response) {
    return res.json(await carreraEstadoService.iniciar(req.params.id as string));
}

export async function finalizar(req: Request, res: Response) {
    return res.json(await carreraEstadoService.finalizar(req.params.id as string));
}