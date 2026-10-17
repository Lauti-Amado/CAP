//backend/src/services/email.service.ts
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

type ConfiguracionBrevo = {
  apiKey: string
  plantillaCertificadoId: number
}

// Falla rápido si falta configuración, antes de intentar enviar nada
export function leerConfiguracionBrevo(): ConfiguracionBrevo {
  const apiKey = process.env.BREVO_API_KEY
  const plantillaCertificadoId = Number(process.env.BREVO_TEMPLATE_CERTIFICADO_ID)

  if (!apiKey) {
    throw new Error('Falta configurar BREVO_API_KEY')
  }
  if (!Number.isInteger(plantillaCertificadoId) || plantillaCertificadoId <= 0) {
    throw new Error('Falta configurar BREVO_TEMPLATE_CERTIFICADO_ID')
  }

  return { apiKey, plantillaCertificadoId }
}

type EnviarConPlantillaParams = {
  para: { email: string; nombre?: string }
  plantillaId: number
  parametros: Record<string, string | number>
}

export async function enviarEmailConPlantilla({
  para,
  plantillaId,
  parametros,
}: EnviarConPlantillaParams): Promise<string | undefined> {
  const { apiKey } = leerConfiguracionBrevo()

  const respuesta = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      to: [{ email: para.email, name: para.nombre }],
      templateId: plantillaId,
      params: parametros,
    }),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(`Brevo respondió ${respuesta.status}: ${detalle}`)
  }

  const datos = (await respuesta.json()) as { messageId?: string }
  return datos.messageId
}