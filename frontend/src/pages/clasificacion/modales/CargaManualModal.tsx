//frontend/src/pages/clasificacion/modales/CargaManualModal.tsx
import { useNavigate, useParams } from 'react-router-dom'
import BuscarCorredorModal from '../../../components/corredor/BuscarCorredorModal'
import { corredoresClasificacionMock } from '../corredoresClasificacionMock'
import { llegadasMock } from '../llegadasMock'
import { normalizarDni } from '../../../utils/dni'

type CargaManualModalProps = {
  show: boolean
  onCerrar: () => void
}

function CargaManualModal({ show, onCerrar }: CargaManualModalProps) {
  const navigate = useNavigate()
  const { nombreCarrera } = useParams();

  // Devuelve un mensaje de error, o null si encontró al corredor
  const buscar = (dni: string): string | null => {
    const dniBuscado = normalizarDni(dni)

    // TODO BACKEND: GET /api/corredores?dni={dni} (corredor inscripto en la carrera)
    const corredor = corredoresClasificacionMock.find((c) => normalizarDni(c.dni) === dniBuscado)
    if (!corredor) return 'No se encontró un corredor inscripto con ese DNI.'

    // Regla de negocio: un corredor no puede tener más de una clasificación válida por carrera.
    // TODO BACKEND: consultar si el corredor ya tiene Clasificacion/Resultado.
    if (llegadasMock.some((llegada) => normalizarDni(llegada.dni) === dniBuscado)) {
      return 'Este corredor ya tiene una clasificación. Use "Modificar clasificación".'
    }

    onCerrar()
    navigate(`/clasificador/clasificaciones/${nombreCarrera}/manual/${dniBuscado}`)
    return null
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