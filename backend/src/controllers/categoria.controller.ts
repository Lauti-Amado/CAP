import type { Request, Response } from "express";
import * as categoriaService from "../services/categoria.service";

// GET: listar todas las categorías.
export async function getAll(_req: Request, res: Response) {
    const categorias = await categoriaService.listar();
    return res.json(categorias);
}

// GET: obtener una categoría por ID.
export async function getById(req: Request, res: Response) {
    const categoria = await categoriaService.obtenerPorId(
        req.params.id as string
    );

    return res.json(categoria);
}

// POST: crear una categoría.
export async function post(req: Request, res: Response) {
    const categoria = await categoriaService.crear(req.body);
    return res.status(201).json(categoria);
}

// PUT: actualizar una categoría.
export async function put(req: Request, res: Response) {
    const categoria = await categoriaService.actualizar(
        req.params.id as string,
        req.body
    );

    return res.json(categoria);
}

// DELETE: eliminar una categoría.
export async function remove(req: Request, res: Response) {
    await categoriaService.eliminar(req.params.id as string);
    return res.status(204).send();
}