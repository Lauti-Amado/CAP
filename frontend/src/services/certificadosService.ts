//frontend/src/services/certificadosService.ts
import type { ResultadoEnvioCertificados } from '../types/certificado'

// MOCK TEMPORAL
// TODO BACKEND: poner en false cuando el endpoint esté implementado.
const USAR_MOCK = true

export async function enviarCertificados(carreraId: number): Promise<ResultadoEnvioCertificados> {
  if (USAR_MOCK) {
    await new Promise((resolver) => setTimeout(resolver, 1200))
    return { enviados: 5, fallidos: 0 }
  }

  // TODO: agregar el token de autenticación igual que en el resto de las llamadas
  const respuesta = await fetch(`/api/carreras/${carreraId}/certificados/envios`, {
    method: 'POST',
  })

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al enviar certificados`)
  }

  return (await respuesta.json()) as ResultadoEnvioCertificados
}