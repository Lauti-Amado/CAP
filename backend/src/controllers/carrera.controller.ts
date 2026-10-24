import { Request, Response } from "express";
import * as carreraService from "../services/carrera.services";

export async function getAll(
    req: Request<unknown, unknown, unknown, { anio?: string }>, 
    res: Response
) {
    const { anio } = req.query;
    const anioFiltrar = anio === undefined ? undefined : Number(anio);
    
    const carreras = await carreraService.findAll(anioFiltrar);
    return res.json(carreras);
}

export async function getById(
    req: Request<{ id: string }>, 
    res: Response
) {
    const carrera = await carreraService.findById(req.params.id);
    if (!carrera) return res.status(404).json({ error: "Carrera no encontrada" });
    return res.json(carrera);
}