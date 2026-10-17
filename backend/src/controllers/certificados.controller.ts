//backend/src/controllers/certificados.controller.ts
import type { Request, Response } from 'express'
import { enviarCertificadosCarrera } from '../services/certificados.service'

export async function enviarCertificados(req: Request, res: Response) {
  const carreraId = Number(req.params.id)

  if (!Number.isInteger(carreraId)) {
    return res.status(400).json({ mensaje: 'Identificador de carrera inválido' })
  }

  try {
    const resultado = await enviarCertificadosCarrera(carreraId)
    return res.status(200).json(resultado)
  } catch (error) {
    console.error('Error al enviar certificados:', error)
    return res.status(500).json({ mensaje: 'No se pudieron enviar los certificados' })
  }
}