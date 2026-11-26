import type { EstadoCompra } from "../generated/prisma/client";

export const estaPagada = (compra: { estado: EstadoCompra }): boolean => compra.estado === "Pagada";