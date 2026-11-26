//backend/src/controllers/plantillaCertificado.controller.ts
import type { Request, Response } from "express";
import * as plantillaService from "../services/plantillaCertificado.service";

export async function getAll(_req: Request, res: Response) {
    return res.json(await plantillaService.listar());
}

export async function post(req: Request, res: Response) {
    return res.status(201).json(await plantillaService.crear(req.body));
}

export async function put(req: Request, res: Response) {
    return res.json(await plantillaService.actualizar(req.params.id as string, req.body));
}

export async function patchActivar(req: Request, res: Response) {
    return res.json(await plantillaService.activar(req.params.id as string));
}

export async function remove(req: Request, res: Response) {
    await plantillaService.eliminar(req.params.id as string);
    return res.status(204).send();
}