
import { useNavigate, useParams } from 'react-router-dom'
import BuscarCorredorModal from '../../../components/corredor/BuscarCorredorModal'
import { useCarreraActual } from '../../../hooks/useCarreraActual'
import { obtenerClasificaciones } from '../../../services/clasificacionService'
import { normalizarDni } from '../../../utils/dni'

type CargaManualModalProps = {
  show: boolean
  onCerrar: () => void
}

function CargaManualModal({ show, onCerrar }: CargaManualModalProps) {
  const navigate = useNavigate()
  const { nombreCarrera } = useParams()
  const carrera = useCarreraActual()

  const buscar = async (dni: string): Promise<string | null> => {
    if (!carrera) {
      return 'No se pudo identificar la carrera.'
    }

    const dniBuscado = normalizarDni(dni)

    try {
      const clasificaciones = await obtenerClasificaciones(carrera.id)

      const clasificacion = clasificaciones.find(
        (item) => normalizarDni(item.corredor.dni) === dniBuscado,
      )

      if (!clasificacion) {
        return 'No se encontró un corredor habilitado para clasificar con ese DNI.'
      }

      if (clasificacion.estado === 'Descalificado') {
        return 'Este corredor está descalificado.'
      }

      if (clasificacion.resultado) {
        return 'Este corredor ya tiene una clasificación. Use "Modificar clasificación".'
      }

      onCerrar()
      navigate(
        `/clasificador/clasificaciones/${nombreCarrera}/manual/${dniBuscado}`,
      )

      return null
    } catch {
      return 'No se pudo consultar la clasificación. Intente nuevamente.'
    }
  }

  return (
    <BuscarCorredorModal
      show={show}
      descripcion="Ingrese el DNI del participante para cargar su clasificación."
      onBuscar={buscar}
      onCerrar={onCerrar}
    />
  )
}

export default CargaManualModal
