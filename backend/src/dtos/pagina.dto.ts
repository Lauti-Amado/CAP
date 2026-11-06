//backend/src/dtos/pagina.dto.ts
export type PaginaDTO<T> = {
    datos: T[];
    total: number;
    pagina: number;
    totalPaginas: number;
};

export function toPaginaDto<T>(datos: T[], total: number, pagina: number, limite: number): PaginaDTO<T> {
    return { datos, total, pagina, totalPaginas: Math.max(1, Math.ceil(total / limite)) };
}