//frontend/src/hooks/useDashboard.ts
import { useEffect, useMemo, useState } from 'react'
import { useCarrera } from '../context/CarreraContext'
import { useDetalleCarrera } from './useDetalleCarrera'
import { obtenerActividadCarrera } from '../services/dashboardService'
import type { Carrera } from '../types/carrera'
import type { DashboardActivity, DashboardData } from '../types/dashboard'
// MOCK TEMPORAL: RFID, notificaciones y sincronización todavía no tienen backend
import { dashboardMock } from '../pages/dashboard/dashboardMock'

const INTERVALO_ACTIVIDAD_MS = 30_000

// La carrera en curso o, si no hay, la próxima que todavía no terminó
function carreraDelDashboard(carreras: Carrera[]): Carrera | null {
  const vigentes = carreras.filter((c) => c.estado !== 'Finalizada' && c.estado !== 'Cancelada')

  const enCurso = vigentes.find((c) => c.estado === 'En_curso')
  if (enCurso) return enCurso

  const hoy = new Date().setHours(0, 0, 0, 0)
  const proximas = vigentes
    .filter((c) => new Date(c.fechaHoraCarrera).getTime() >= hoy)
    .sort((a, b) => new Date(a.fechaHoraCarrera).getTime() - new Date(b.fechaHoraCarrera).getTime())

  return proximas[0] ?? null
}

export function useDashboard() {
  const { carreras, cargando } = useCarrera()
  const carrera = useMemo(() => carreraDelDashboard(carreras), [carreras])
  const carreraId = carrera?.id

  const { carrera: detalle } = useDetalleCarrera(carreraId)
  const [actividad, setActividad] = useState<DashboardActivity[]>([])

  // La actividad se refresca sola mientras el dashboard está abierto
  useEffect(() => {
    if (!carreraId) return undefined
    let activo = true

    const cargar = () =>
      obtenerActividadCarrera(carreraId)
        .then((datos) => { if (activo) setActividad(datos) })
        .catch(() => { /* es secundaria: se deja la última lista cargada */ })

    void cargar()
    const intervalo = setInterval(() => void cargar(), INTERVALO_ACTIVIDAD_MS)

    return () => {
      activo = false
      clearInterval(intervalo)
    }
  }, [carreraId])

  const data: DashboardData = {
    nextRace: carrera
      ? {
          name: carrera.nombre,
          startsAt: carrera.fechaHoraCarrera,
          location: `${carrera.lugar.nombre}, ${carrera.lugar.localidad}`,
        }
      : null,
    registrations: {
      confirmed: detalle?.cantidadInscriptosConfirmados ?? 0,
      capacity: carrera?.participantesMax ?? 0,
    },
    activities: actividad,
    rfid: dashboardMock.rfid,
    unreadNotifications: dashboardMock.unreadNotifications,
    sincronizacion: dashboardMock.sincronizacion,
  }

  return { data, cargando }
}