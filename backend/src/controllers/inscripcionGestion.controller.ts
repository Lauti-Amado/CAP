//backend/src/controllers/inscripcionGestion.controller.ts
import type { Request, Response } from "express";
import * as inscripcionService from "../services/inscripcionGestion.service";
import { contactoQuerySchema, listadoQuerySchema, cargarAptoMedicoSchema } from "../validations/inscripcionGestion.validations";

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
    await inscripcionService.anular(req.params.id as string, req.usuario!.id);
    return res.status(204).end();
}

export async function modificar(req: Request, res: Response) {
    return res.json(await inscripcionService.modificar(req.params.id as string, req.body, req.usuario!.id));
}

export async function cargarAptoMedico(req: Request, res: Response) {
    const datos = cargarAptoMedicoSchema.parse(req.body);

    const resultado = await inscripcionService.cargarAptoMedico(
        req.params.id as string,
        datos,
        req.usuario!.id
    );

    return res.status(201).json(resultado);
}