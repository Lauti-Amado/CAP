// Borrar cuando se conecte con el backend
import type { ParticipanteClasificacion } from '../../types/clasificacion'

export const estadisticasMock = { participantes: 1248, llegados: 842 }

export const participantesMock: ParticipanteClasificacion[] = [
  { id: 1, dorsal: '#1042', atleta: 'Juan Pérez', dni: '38.456.789', categoria: 'M 30-34', estado: 'PENDIENTE' },
  { id: 2, dorsal: '#1043', atleta: 'María Gómez', dni: '39.123.456', categoria: 'F 25-29', estado: 'EN CURSO' },
  { id: 3, dorsal: '#1044', atleta: 'Carlos Ruiz', dni: '35.987.654', categoria: 'M 35-39', estado: 'LLEGADO', tiempo: '00:45:12' },
  { id: 4, dorsal: '#1045', atleta: 'Ana Silva', dni: '40.111.222', categoria: 'F 20-24', estado: 'PENDIENTE' },
]