//frontend/src/utils/clasificacionUtils.ts
import type { ClasificacionDTO } from '../types/clasificacionApi'
import type { ParticipanteClasificacion, EstadoParticipante } from '../types/clasificacion'

function formatearTiempo(ms: number | null): string | undefined {
  if (ms === null || ms === undefined) return undefined
  const totalSeg = Math.floor(ms / 1000)
  const h = Math.floor(totalSeg / 3600)
  const m = Math.floor((totalSeg % 3600) / 60)
  const s = totalSeg % 60
  return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function estadoApiAParticipante(estado: ClasificacionDTO['estado']): EstadoParticipante {
  if (estado === 'Finalizo') return 'LLEGADO'
  if (estado === 'Pendiente') return 'PENDIENTE'
  return 'PENDIENTE' // No_finalizo, No_largo, Descalificado → Pendiente visualmente
}

export function clasificacionAParticipante(c: ClasificacionDTO): ParticipanteClasificacion {
  const nombre = `${c.corredor.apellido}, ${c.corredor.nombre}`
  const estadoParticipante = estadoApiAParticipante(c.estado)
  const tiempo = c.resultado ? formatearTiempo(c.resultado.tiempoLlegada) : undefined
  const categoria = c.resultado?.categorias[0]?.nombre ?? '-'

  return {
    id: c.id,
    dorsal: c.dorsal ?? '-',
    atleta: nombre,
    dni: c.corredor.dni,
    categoria,
    estado: estadoParticipante,
    tiempo,
  }
}
