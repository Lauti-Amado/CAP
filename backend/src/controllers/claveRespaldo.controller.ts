//backend/src/controllers/claveRespaldo.controller.ts
import { Request, Response } from "express";
import * as claveService from "../services/claveRespaldo.service";

export async function listar(req: Request, res: Response) {
    return res.json(await claveService.listar());
}

export async function generar(req: Request, res: Response) {
    return res.status(201).json(await claveService.generar(req.usuario!.id));
}