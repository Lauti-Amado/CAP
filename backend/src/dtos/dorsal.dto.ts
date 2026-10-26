//backend/src/dtos/dorsal.dto.ts
import type { EstadoCarrera, EstadoInscripcion, MetodoPago, Sexo, TipoDistancia } from "../generated/prisma/client";

export type DorsalAsignado = {
    id: string;
    numero: string;
    chipNumero: number | null;
};

export type InscripcionEntregaKit = {
    inscripcionId: string;
    estadoInscripcion: EstadoInscripcion;
    corredor: {
        nombre: string;
        apellido: string;
        dni: string;
        sexo: Sexo;
        fechaNacimiento: Date;
    };
    carrera: { id: string; nombre: string; estado: EstadoCarrera };
    distancia: { kilometraje: number; tipoDistancia: TipoDistancia };
    clubTeam: string | null;
    categoria: string;
    talleRemera: string | null;
    pagado: boolean;
    metodoPago: MetodoPago;
    aptoMedico: { requerido: boolean; vigente: boolean; fechaVencimiento: Date | null };
    productos: { nombre: string; variante: string; cantidad: number }[];
    dorsal: DorsalAsignado | null;
    fechaHoraEntrega: Date | null;
    habilitado: boolean; // true si se le puede asignar dorsal ahora
    motivos: string[];   // por qué no está habilitado
};

export type CarreraEntregaKits = {
    id: string;
    nombre: string;
    edicion: number;
    estado: EstadoCarrera;
    distancias: string[]; // ["10K", "21K"]
};

export type EntregaReciente = {
    id: string;
    nombreCorredor: string;
    numeroKit: number;
    distancia: string;
    minutosDesdeEntrega: number;
};

export type ConsultaDorsal = {
    numero: string;
    enInventario: boolean;
    chipNumero: number | null;
    disponible: boolean; // false si ya se entregó en esa carrera
};