//frontend/src/pages/clasificacion/corredoresClasificacionMock.ts
import type { CorredorClasificacion } from '../../types/clasificacion'

// MOCK TEMPORAL
// TODO BACKEND: reemplazar por la consulta de participantes de la carrera.
export const corredoresClasificacionMock: CorredorClasificacion[] = [
  { id: 1, dorsal: '#125', nombre: 'Roberto Perez', dni: '38.456.789', categoria: 'M 30-34', estado: 'Oficial', distancia: '21K Medio Maratón', talleRemera: 'M', clubTeam: 'Independiente', estadoInscripcion: 'pagado', estadoAptoMedico: 'verificado', chipRfid: '00A25' },
  { id: 2, dorsal: '#1043', nombre: 'María Gómez', dni: '39.123.456', categoria: 'F 25-29', estado: 'Oficial', distancia: '10K', talleRemera: 'S', clubTeam: 'CAP', estadoInscripcion: 'pagado', estadoAptoMedico: 'verificado', chipRfid: '00B31' },
  { id: 3, dorsal: '#1044', nombre: 'Carlos Ruiz', dni: '35.987.654', categoria: 'M 35-39', estado: 'En revisión', distancia: '10K', talleRemera: 'L', clubTeam: 'Independiente', estadoInscripcion: 'pendiente', estadoAptoMedico: 'verificado', chipRfid: '00C07' },
  { id: 4, dorsal: '#1045', nombre: 'Ana Silva', dni: '40.111.222', categoria: 'F 20-24', estado: 'Oficial', distancia: '10K', talleRemera: 'M', clubTeam: '', estadoInscripcion: 'pagado', estadoAptoMedico: 'verificado', chipRfid: '00D44' },
  { id: 5, dorsal: '#2106', nombre: 'Juan Pablo Martínez', dni: '32.456.789', categoria: 'M 30-34', estado: 'Oficial', distancia: '21K Medio Maratón', talleRemera: 'L', clubTeam: 'Running Team Sur', estadoInscripcion: 'pagado', estadoAptoMedico: 'verificado', chipRfid: '00E19' },
]