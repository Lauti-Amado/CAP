import type { Request, Response } from "express";
import { z } from "zod";
import * as service from "../services/grandPrix.service";
import { tablaGrandPrixQuery } from "../validations/grandPrix.validations";

const id = (req: Request) => req.params.id as string;
const recurso = (req: Request) => req.params.recursoId as string;
const actor = (req: Request) => req.usuario!.id;
export async function cambio(req: Request, res: Response) {
    res.json(await service.obtenerCambio(id(req), recurso(req)));
}
export async function listar(_req: Request, res: Response) {
    res.json(await service.listar());
}
export async function obtener(req: Request, res: Response) {
    res.json(await service.obtener(id(req)));
}
export async function crear(req: Request, res: Response) {
    res.status(201).json(await service.crear(req.body, actor(req)));
}
export async function actualizar(req: Request, res: Response) {
    await service.actualizar(
        id(req),
        req.body.datos,
        req.body.motivo,
        actor(req),
    );
    res.status(204).send();
}
export async function estado(req: Request, res: Response) {
    await service.cambiarEstado(
        id(req),
        req.body.estado,
        req.body.motivo,
        actor(req),
    );
    res.status(204).send();
}
export async function catalogo(_req: Request, res: Response) {
    res.json(await service.listarCatalogoPruebas());
}
export async function buscarCorredores(req: Request, res: Response) {
    const q = z
        .string()
        .trim()
        .max(100)
        .parse(req.query.q ?? "");
    res.json(await service.buscarCorredores(q));
}
export async function categoria(req: Request, res: Response) {
    res.status(req.params.recursoId ? 200 : 201).json(
        await service.guardarCategoria(
            id(req),
            (req.params.recursoId as string) ?? null,
            req.body,
            actor(req),
        ),
    );
}
export async function eliminarCategoria(req: Request, res: Response) {
    await service.eliminarCategoria(id(req), recurso(req), actor(req));
    res.status(204).send();
}
export async function prueba(req: Request, res: Response) {
    res.status(201).json(
        await service.agregarPrueba(
            id(req),
            req.body.distanciaCarreraId,
            actor(req),
        ),
    );
}
export async function incluirPrueba(req: Request, res: Response) {
    await service.incluirPrueba(
        id(req),
        recurso(req),
        req.body.incluida,
        req.body.motivo,
        actor(req),
    );
    res.status(204).send();
}
export async function participacion(req: Request, res: Response) {
    res.status(201).json(
        await service.inscribir(
            id(req),
            req.body.corredorId,
            req.body.categoriaId,
            actor(req),
        ),
    );
}
export async function estadoParticipacion(req: Request, res: Response) {
    await service.cambiarParticipacion(
        id(req),
        recurso(req),
        req.body.estado,
        req.body.motivo,
        actor(req),
    );
    res.status(204).send();
}
export async function reglamento(req: Request, res: Response) {
    res.status(201).json(
        await service.crearReglamento(
            id(req),
            req.body.basePuesto,
            req.body.copiarDeId,
            actor(req),
        ),
    );
}
export async function reglas(req: Request, res: Response) {
    await service.guardarReglas(id(req), recurso(req), req.body, actor(req));
    res.status(204).send();
}
export async function preview(req: Request, res: Response) {
    res.json(await service.previsualizar(id(req), recurso(req), req.body));
}
export async function aplicar(req: Request, res: Response) {
    res.json(
        await service.aplicarReglamento(
            id(req),
            recurso(req),
            req.body,
            actor(req),
        ),
    );
}
export async function recalcular(req: Request, res: Response) {
    res.json(await service.recalcular(id(req), req.body.motivo, actor(req)));
}
export async function tabla(req: Request, res: Response) {
    res.json(
        await service.tabla(id(req), tablaGrandPrixQuery.parse(req.query)),
    );
}
