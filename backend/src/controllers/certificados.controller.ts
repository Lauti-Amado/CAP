//backend/src/controllers/certificados.controller.ts
import type { Request, Response } from "express";
import * as certificadosService from "../services/certificados.service";
import { candidatosQuerySchema } from "../validations/certificado.validations";

export async function getCandidatos(req: Request, res: Response) {
    const { busqueda } = candidatosQuerySchema.parse(req.query);
    return res.json(await certificadosService.listarCandidatos(req.params.id as string, busqueda));
}

export async function getPendientes(req: Request, res: Response) {
    return res.json(await certificadosService.listarPendientes(req.params.id as string));
}

export async function postEnviar(req: Request, res: Response) {
    const resultado = await certificadosService.enviarCertificado(req.params.id as string);
    return res.status(resultado.estado === "Enviado" ? 200 : 202).json(resultado);
}

export async function postReintentar(req: Request, res: Response) {
    return res.json(await certificadosService.reintentarPendientes(req.params.id as string));
}