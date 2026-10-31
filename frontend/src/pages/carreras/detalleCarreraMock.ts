import type { Carrera, Distancia } from '../../types/carrera'

export type CarreraDetalleMock = Carrera & {
  cantidadInscriptos: number
  cantidadKitsEntregados: number
  cantidadClasificados: number
}

const dist = (kilometraje: number, tipoDistancia: Distancia['tipoDistancia'], precio: number): Distancia => ({
  kilometraje,
  tipoDistancia,
  precio,
})

export const carrerasDetalleMock: CarreraDetalleMock[] = [
  {
    id: '1',
    nombre: 'Maratón de Buenos Aires 2024',
    estado: 'Publicada',
    participantesMax: 1000,
    fechaHoraCarrera: new Date('2024-09-22T08:00:00'),
    fechaHoraEntregaKits: new Date('2024-09-21T10:00:00'),
    imagenUrl: '',
    descripcion:
      'Carrera de larga distancia organizada para corredores de distintos niveles, con recorridos de 42K y 21K.',
    lugar: { nombre: 'Buenos Aires', localidad: 'Buenos Aires' },
    distancias: [dist(42, 'Competitiva', 15000), dist(21, 'Competitiva', 12000)],
    cantidadInscriptos: 742,
    cantidadKitsEntregados: 680,
    cantidadClasificados: 0,
  },
  {
    id: '2',
    nombre: 'Cruce de los Andes Ultra Trail',
    estado: 'Creada',
    participantesMax: 500,
    fechaHoraCarrera: new Date('2026-11-15T07:30:00'),
    fechaHoraEntregaKits: new Date('2026-11-14T10:00:00'),
    imagenUrl: '',
    descripcion: 'Competencia de trail running con diferentes distancias y recorridos de montaña.',
    lugar: { nombre: 'Mendoza', localidad: 'Mendoza' },
    distancias: [dist(100, 'Competitiva', 25000), dist(50, 'Competitiva', 18000), dist(21, 'Participativa', 12000)],
    cantidadInscriptos: 126,
    cantidadKitsEntregados: 0,
    cantidadClasificados: 0,
  },
  {
    id: '3',
    nombre: 'Patagonia Run Mountain 2023',
    estado: 'Finalizada',
    participantesMax: 1500,
    fechaHoraCarrera: new Date('2023-04-14T06:00:00'),
    fechaHoraEntregaKits: new Date('2023-04-13T10:00:00'),
    imagenUrl: '',
    descripcion: 'Carrera de montaña con diferentes distancias adaptadas a distintos niveles de corredores.',
    lugar: { nombre: 'San Martín de los Andes', localidad: 'Neuquén' },
    distancias: [
      dist(160, 'Competitiva', 30000),
      dist(110, 'Competitiva', 25000),
      dist(70, 'Competitiva', 18000),
      dist(42, 'Competitiva', 15000),
      dist(21, 'Competitiva', 10000),
    ],
    cantidadInscriptos: 1248,
    cantidadKitsEntregados: 1201,
    cantidadClasificados: 1178,
  },
]