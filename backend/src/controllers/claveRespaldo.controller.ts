//backend/src/controllers/claveRespaldo.controller.ts
import { Request, Response } from "express";
import * as claveService from "../services/claveRespaldo.service";
import { clavesCuentaQuerySchema } from "../validations/claveRespaldo.validations";

export async function listarCuentas(req: Request, res: Response) {
    return res.json(await claveService.listarCuentas());
}

export async function listarPorCuenta(req: Request, res: Response) {
    const { usuarioId } = clavesCuentaQuerySchema.parse(req.query);
    return res.json(await claveService.listarPorCuenta(usuarioId));
}

export async function reemplazar(req: Request, res: Response) {
    const { usuarioId } = clavesCuentaQuerySchema.parse(req.query);
    return res.json(await claveService.reemplazar(usuarioId));
}