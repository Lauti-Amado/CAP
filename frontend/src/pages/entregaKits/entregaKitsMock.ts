import type {
  CarreraActiva,
  CorredorDetalle,
  UltimaEntrega,
} from '../../types/entregaKits'

export const carreraActivaMock: CarreraActiva = {
  id: 1,
  nombre: 'Gran Maratón Aniversario',
  edicion: 2025,
  estado: 'Activa',
  distancias: ['10K', '21K'],
}

export const corredoresMock: CorredorDetalle[] = [
  {
    id: 1,
    nombre: 'Roberto Perez',
    dni: '38456789',
    categoria: 'M 30-34',
    distancia: '21K Medio Maratón',
    talleRemera: 'M',
    clubTeam: 'Independiente',

    inscripcion: {
      estado: 'pagado',
    },

    aptoMedico: {
      estado: 'verificado',
    },

    habilitadoParaRetirarKit: true,

    kitEntregado: false,
    dorsal: undefined,
    chipRfid: undefined,
    fechaEntregaKit: undefined,
  },

  {
    id: 2,
    nombre: 'Martin Gómez',
    dni: '35123456',
    categoria: 'M 25-29',
    distancia: '10K',
    talleRemera: 'L',
    clubTeam: 'CAP',

    inscripcion: {
      estado: 'pagado',
    },

    aptoMedico: {
      estado: 'verificado',
    },

    habilitadoParaRetirarKit: true,

    kitEntregado: false,
    dorsal: undefined,
    chipRfid: undefined,
    fechaEntregaKit: undefined,
  },

  {
    id: 3,
    nombre: 'Ana López',
    dni: '40123456',
    categoria: 'F 30-34',
    distancia: '21K Medio Maratón',
    talleRemera: 'S',
    clubTeam: 'Independiente',

    inscripcion: {
      estado: 'pendiente',
    },

    aptoMedico: {
      estado: 'verificado',
    },

    habilitadoParaRetirarKit: false,

    kitEntregado: false,
    dorsal: undefined,
    chipRfid: undefined,
    fechaEntregaKit: undefined,
  },
]

export const ultimasEntregasMock: UltimaEntrega[] = [
  {
    id: 1,
    nombreCorredor: 'Martín Gómez',
    numeroKit: 1042,
    distancia: '10K',
    minutosDesdeEntrega: 2,
  },
]