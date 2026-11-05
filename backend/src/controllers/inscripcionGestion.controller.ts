//backend/src/controllers/inscripcionGestion.controller.ts
import type { Request, Response } from "express";
import * as inscripcionService from "../services/inscripcionGestion.service";
import { contactoQuerySchema, listadoQuerySchema } from "../validations/inscripcionGestion.validations";

export async function listar(req: Request, res: Response) {
    const filtros = listadoQuerySchema.parse(req.query);
    return res.json(await inscripcionService.listar(filtros));
}

export async function obtener(req: Request, res: Response) {
    return res.json(await inscripcionService.obtener(req.params.id as string));
}

export async function opciones(req: Request, res: Response) {
    return res.json(await inscripcionService.opciones(req.params.id as string));
}

export async function buscarContacto(req: Request, res: Response) {
    const { dni } = contactoQuerySchema.parse(req.query);
    return res.json(await inscripcionService.buscarContactoEmergencia(dni));
}

export async function crear(req: Request, res: Response) {
    const resultado = await inscripcionService.crear(req.params.id as string, req.body, req.usuario!.id);
    return res.status(201).json(resultado);
}

export async function anular(req: Request, res: Response) {
    await inscripcionService.anular(req.params.id as string);
    return res.status(204).end();
}