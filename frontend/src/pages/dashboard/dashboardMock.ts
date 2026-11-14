//frontend/src/pages/dashboard/dashboardMock.ts
import type { DashboardData } from '../../types/dashboard'

// MOCK TEMPORAL
// TODO BACKEND: RFID (CloudBox), notificaciones y sincronización (PowerSync) todavía no están integrados.
export const dashboardMock: Pick<DashboardData, 'rfid' | 'unreadNotifications' | 'sincronizacion'> = {
  rfid: {
    connected: true,
    antennas: [
      { name: 'Antena 1', working: true },
      { name: 'Antena 2', working: true },
    ],
  },
  unreadNotifications: 1,

  sincronizacion: {
    estado: 'sincronizando',  //Para probar los otros estados: 'conectado' o 'sin-conexion'
    ultimaVez: 'Hoy, 14:30 hs',
  },
}