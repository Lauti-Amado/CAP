//backend/src/services/certificados.service.ts
import { enviarEmailConPlantilla, leerConfiguracionBrevo } from './email.service'

type Finalista = {
  inscripcionId: string
  nombre: string
  email: string
  esSocio: boolean
  distancia: string
  puesto: number
  tiempo: string
}

async function obtenerFinalistasPendientes(carreraId: number): Promise<Finalista[]> {
  // TODO PRISMA: devolver los corredores de la carrera `carreraId` que:
  //  - terminaron la carrera (estado "Finalizó"),
  //  - son socios (afiliación),
  //  - todavía no recibieron el certificado.
  // Para probar Brevo de verdad, ver la guía de pruebas: devolver datos de prueba TEMPORALMENTE.
  void carreraId
  return []
}

async function marcarCertificadoEnviado(inscripcionId: string): Promise<void> {
  // TODO PRISMA: guardar la fecha de envío (ej. certificadoEnviadoEn) para cumplir
  // la regla "los certificados solo se pueden enviar una vez".
  void inscripcionId
}

export async function enviarCertificadosCarrera(carreraId: number) {
  const { plantillaCertificadoId } = leerConfiguracionBrevo()

  const pendientes = await obtenerFinalistasPendientes(carreraId)

  // Regla de negocio: los certificados se envían solo a socios.
  const destinatarios = pendientes.filter((finalista) => finalista.esSocio)

  let enviados = 0
  let fallidos = 0

  for (const finalista of destinatarios) {
    try {
      await enviarEmailConPlantilla({
        para: { email: finalista.email, nombre: finalista.nombre },
        plantillaId: plantillaCertificadoId,
        parametros: {
          nombre: finalista.nombre,
          distancia: finalista.distancia,
          puesto: finalista.puesto,
          tiempo: finalista.tiempo,
        },
      })
    } catch (error) {
      console.error(`No se pudo enviar el certificado a ${finalista.email}:`, error)
      fallidos++
      continue
    }

    enviados++

    try {
      await marcarCertificadoEnviado(finalista.inscripcionId)
    } catch (error) {
      console.error(`Certificado enviado a ${finalista.email} pero no se pudo registrar el envío:`, error)
    }
  }

  return { enviados, fallidos }
}