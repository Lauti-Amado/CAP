//backend/src/controllers/dorsal.controller.ts
import type { Request, Response } from "express";
import * as dorsalService from "../services/dorsal.service";
import { busquedaQuerySchema, dniQuerySchema, limiteQuerySchema, numeroParamSchema } from "../validations/dorsal.validations";

export async function buscarInscripcion(req: Request, res: Response) {
    const { dni } = dniQuerySchema.parse(req.query);
    const resultado = await dorsalService.buscarInscripcionParaEntrega(req.params.id as string, dni);
    return res.json(resultado);
}

export async function asignar(req: Request, res: Response) {
    const resultado = await dorsalService.asignarDorsal(req.params.id as string, req.body);
    return res.status(201).json(resultado);
}

export async function desasignar(req: Request, res: Response) {
    await dorsalService.desasignarDorsal(req.params.id as string);
    return res.status(204).end();
}

export async function vincularChip(req: Request, res: Response) {
    const resultado = await dorsalService.vincularChip(req.params.id as string, req.body.chipNumero);
    return res.json(resultado);
}

export async function listar(req: Request, res: Response) {
    const { busqueda } = busquedaQuerySchema.parse(req.query);
    const resultado = await dorsalService.listarDorsalesDeCarrera(req.params.id as string, busqueda);
    return res.json(resultado);
}

export async function carreraActual(_req: Request, res: Response) {
    return res.json(await dorsalService.carreraParaEntrega());
}

export async function entregasRecientes(req: Request, res: Response) {
    const { limite } = limiteQuerySchema.parse(req.query);
    return res.json(await dorsalService.entregasRecientes(req.params.id as string, limite));
}

export async function consultar(req: Request, res: Response) {
    const { numero } = numeroParamSchema.parse({ numero: req.params.numero });
    return res.json(await dorsalService.consultarDorsal(req.params.id as string, numero));
}

export async function cargarInventario(req: Request, res: Response) {
    return res.status(201).json(await dorsalService.cargarInventario(req.body.dorsales));
}