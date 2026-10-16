//frontend/src/types/dashboard.ts
import type { EstadoSincronizacion } from './sincronizacion'

export type DashboardActivity = {
  id: string
  kind: 'reading' | 'kit' | 'registration'
  description: string
  occurredAt: string
}

export type DashboardData = {
  nextRace: {
    name: string
    startsAt: string
    location: string
  } | null
  registrations: {
    confirmed: number
    capacity: number
  }
  rfid: {
    connected: boolean
    antennas: { name: string; working: boolean }[]
  }
  activities: DashboardActivity[]
  unreadNotifications: number

  sincronizacion: {                       // NUEVO
    estado: EstadoSincronizacion
    ultimaVez: string
  }
}