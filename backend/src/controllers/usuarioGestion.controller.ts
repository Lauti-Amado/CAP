//backend/src/controllers/usuarioGestion.controller.ts
import { Request, Response } from "express";
import * as usuarioGestionService from "../services/usuarioGestion.service";
import { listarUsuariosQuerySchema } from "../validations/usuarioGestion.validation";

export async function listar(req: Request, res: Response) {
    const { pagina } = listarUsuariosQuerySchema.parse(req.query);
    return res.json(await usuarioGestionService.listar(pagina));
}

export async function obtener(req: Request<{ id: string }>, res: Response) {
    return res.json(await usuarioGestionService.obtener(req.params.id));
}

export async function actualizarRoles(req: Request<{ id: string }>, res: Response) {
    const usuario = await usuarioGestionService.actualizarRoles(req.params.id, req.body.roles, req.usuario!.id);
    return res.json(usuario);
}