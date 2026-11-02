//backend/src/controllers/clasificacion.controller.ts
import type { Request, Response } from "express";
import * as clasificacionService from "../services/clasificacion.service";
import { clasificacionCarreraQuerySchema, tiempoRealQuerySchema } from "../validations/clasificacion.validations";

export async function getByCarrera(req: Request, res: Response) {
    const filtros = clasificacionCarreraQuerySchema.parse(req.query);
    const clasificaciones = await clasificacionService.listarPorCarrera(req.params.id as string, filtros);
    return res.json(clasificaciones);
}

export async function getTiempoReal(req: Request, res: Response) {
    const { limite } = tiempoRealQuerySchema.parse(req.query);
    const tiempoReal = await clasificacionService.obtenerTiempoReal(req.params.id as string, limite);
    return res.json(tiempoReal);
}

export async function getById(req: Request, res: Response) {
    const clasificacion = await clasificacionService.obtenerPorId(req.params.id as string);
    return res.json(clasificacion);
}

export async function patchEstado(req: Request, res: Response) {
    const clasificacion = await clasificacionService.cambiarEstado(req.params.id as string, req.body.estado);
    return res.json(clasificacion);
}

export async function putResultado(req: Request, res: Response) {
    const clasificacion = await clasificacionService.registrarResultado(req.params.id as string, req.body);
    return res.json(clasificacion);
}
