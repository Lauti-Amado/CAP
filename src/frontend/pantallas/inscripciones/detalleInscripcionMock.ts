import type { InscripcionDetalle } from '../../types/inscripcion'

export const inscripcionDetalleMock: InscripcionDetalle[] = [
  {
    id: 1,
    numero: '001',
    estado: 'Confirmada',
    carrera: 'Maratón Internacional',
    fechaInscripcion: '15/10/2023',

    corredor: {
      nombreCompleto: 'Martín Pérez',
      dni: '34.567.890',
      fechaNacimiento: '12/05/1990',
      genero: 'Masculino',
      telefono: '221 555-1234',
      email: 'martin.perez@email.com',
      discapacidad: 'No',
      equipoClub: 'Sin equipo',
    },

    participacion: {
      distancia: '42K',
      tipo: 'Competitiva',
    },

    pago: {
      estado: 'Pagado',
      metodo: 'Mercado Pago',
      total: '$25.000',
      adicionales: 'Remera oficial',
    },

    entrega: {
      estadoKit: 'Pendiente',
      dorsal: '1042',
      chipRfid: 'Pendiente',
      fechaEntrega: 'Pendiente',
      aptoMedico: 'Presentado',
    },
  },

  {
    id: 2,
    numero: '002',
    estado: 'En Proceso',
    carrera: 'Media Maratón de la Ciudad',
    fechaInscripcion: '12/10/2023',

    corredor: {
      nombreCompleto: 'Laura Gómez',
      dni: '28.123.456',
      fechaNacimiento: '08/11/1988',
      genero: 'Femenino',
      telefono: '221 555-5678',
      email: 'laura.gomez@email.com',
      discapacidad: 'No',
      equipoClub: 'Club La Plata',
    },

    participacion: {
      distancia: '21K',
      tipo: 'Competitiva',
    },

    pago: {
      estado: 'Pendiente',
      metodo: 'Pendiente',
      total: '$18.000',
      adicionales: 'Ninguno',
    },

    entrega: {
      estadoKit: 'Pendiente',
      dorsal: '—',
      chipRfid: '—',
      fechaEntrega: '—',
      aptoMedico: 'Pendiente',
    },
  },

  {
    id: 3,
    numero: '003',
    estado: 'Anulada',
    carrera: 'Maratón Internacional',
    fechaInscripcion: '10/10/2023',

    corredor: {
      nombreCompleto: 'Carlos Ruiz',
      dni: '40.987.654',
      fechaNacimiento: '20/03/1995',
      genero: 'Masculino',
      telefono: '221 555-9012',
      email: 'carlos.ruiz@email.com',
      discapacidad: 'No',
      equipoClub: 'Sin equipo',
    },

    participacion: {
      distancia: '10K',
      tipo: 'Participativa',
    },

    pago: {
      estado: 'Pagado',
      metodo: 'Transferencia',
      total: '$12.000',
      adicionales: 'Remera oficial',
    },

    entrega: {
      estadoKit: 'No entregado',
      dorsal: '—',
      chipRfid: '—',
      fechaEntrega: '—',
      aptoMedico: 'No presentado',
    },
  },
]