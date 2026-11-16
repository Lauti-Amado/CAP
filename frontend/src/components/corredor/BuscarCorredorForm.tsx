//frontend/src/components/corredor/BuscarCorredorForm.tsx
import { useState, type ReactNode } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { PackageCheck, Search } from 'lucide-react'

type BuscarCorredorFormProps = {
  titulo: string
  descripcion: string
  icono?: ReactNode
  placeholder?: string
  textoBoton?: string
  /** Error que informa el contenedor (por ejemplo, "no se encontró"). */
  error?: string | null
  /** Se llama con el DNI ya recortado (nunca vacío). */
  onBuscar: (dni: string) => void
  /** Se llama cuando el usuario edita el campo, para limpiar errores del contenedor. */
  onCambio?: () => void
}

function BuscarCorredorForm({
  titulo,
  descripcion,
  icono = <PackageCheck size={22} aria-hidden="true" />,
  placeholder = 'Ej. 35123456',
  textoBoton = 'Buscar',
  error = null,
  onBuscar,
  onCambio,
}: BuscarCorredorFormProps) {
  const [dni, setDni] = useState('')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  const mensaje = errorLocal ?? error

  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const valor = dni.trim()

    if (valor === '') {
      setErrorLocal('Por favor, ingrese un DNI válido.')
      return
    }

    setErrorLocal(null)
    onBuscar(valor)
  }

  return (
    <div className="d-flex flex-column align-items-center text-center">
      <span className="d-inline-flex rounded-3 bg-success-subtle text-success p-3 mb-3">
        {icono}
      </span>

      <h2 className="h4 fw-bold mb-2" id="buscar-corredor-titulo">
        {titulo}
      </h2>
      <p className="text-secondary mb-4">{descripcion}</p>

      <Form className="w-100" onSubmit={enviar} noValidate>
        <InputGroup size="lg">
          <InputGroup.Text className="bg-white">
            <Search size={14} aria-hidden="true" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            inputMode="numeric"
            autoFocus
            value={dni}
            placeholder={placeholder}
            aria-label="DNI del corredor"
            isInvalid={Boolean(mensaje)}
            onChange={(evento) => {
              setDni(evento.target.value)
              setErrorLocal(null)
              onCambio?.()
            }}
          />
          <Button type="submit" variant="success">
            {textoBoton}
          </Button>
        </InputGroup>

        {mensaje && (
          <Form.Control.Feedback type="invalid" className="d-block text-start" role="alert">
            {mensaje}
          </Form.Control.Feedback>
        )}
      </Form>
    </div>
  )
}

export default BuscarCorredorForm