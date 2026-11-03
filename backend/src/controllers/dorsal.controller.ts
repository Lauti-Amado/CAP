//backend/src/controllers/dorsal.controller.ts
import type { Request, Response } from "express";
import * as dorsalService from "../services/dorsal.service";
import { busquedaQuerySchema, chipParamSchema, numeroParamSchema } from "../validations/dorsal.validations";

export async function listar(req: Request, res: Response) {
    const { busqueda } = busquedaQuerySchema.parse(req.query);
    return res.json(await dorsalService.listar(busqueda));
}

export async function obtener(req: Request, res: Response) {
    return res.json(await dorsalService.obtener(req.params.id as string));
}

export async function crear(req: Request, res: Response) {
    return res.status(201).json(await dorsalService.crear(req.body));
}

export async function cargarInventario(req: Request, res: Response) {
    return res.status(201).json(await dorsalService.cargarInventario(req.body.dorsales));
}

export async function vincularChip(req: Request, res: Response) {
    return res.json(await dorsalService.vincularChip(req.params.id as string, req.body.chipNumero));
}

export async function desvincularChip(req: Request, res: Response) {
    return res.json(await dorsalService.desvincularChip(req.params.id as string));
}

export async function consultarEnCarrera(req: Request, res: Response) {
    const { numero } = numeroParamSchema.parse({ numero: req.params.numero });
    return res.json(await dorsalService.consultarEnCarrera(req.params.id as string, numero));
}

export async function listarEnCarrera(req: Request, res: Response) {
    const { busqueda } = busquedaQuerySchema.parse(req.query);
    return res.json(await dorsalService.listarEntregadosEnCarrera(req.params.id as string, busqueda));
}

export async function identificarPorChip(req: Request, res: Response) {
    const { numero } = chipParamSchema.parse({ numero: req.params.numero });
    return res.json(await dorsalService.identificarPorChip(req.params.id as string, numero));
}