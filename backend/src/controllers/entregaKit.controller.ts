//backend/src/controllers/entregaKit.controller.ts
import type { Request, Response } from "express";
import * as entregaKitService from "../services/entregaKit.service";
import { limiteQuerySchema } from "../validations/dorsal.validations";

export async function entregar(req: Request, res: Response) {
    return res.status(201).json(await entregaKitService.entregarKit(req.params.id as string, req.body));
}

export async function obtener(req: Request, res: Response) {
    return res.json(await entregaKitService.obtenerEntrega(req.params.id as string));
}

export async function deshacer(req: Request, res: Response) {
    await entregaKitService.deshacerEntrega(req.params.id as string);
    return res.status(204).end();
}

export async function recientes(req: Request, res: Response) {
    const { limite } = limiteQuerySchema.parse(req.query);
    return res.json(await entregaKitService.entregasRecientes(req.params.id as string, limite));
}