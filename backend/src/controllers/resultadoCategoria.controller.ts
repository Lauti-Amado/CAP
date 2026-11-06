//backend/src/controllers/resultadoCategoria.controller.ts
import type { Request, Response } from "express";
import * as resultadoCategoriaService from "../services/resultadoCategoria.service";

export async function generar(req: Request, res: Response) {
    return res.json(
        await resultadoCategoriaService.generarParaCategoria(req.params.id as string, req.params.categoriaId as string)
    );
}