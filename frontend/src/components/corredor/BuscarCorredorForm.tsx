//frontend/src/components/corredor/BuscarCorredorForm.tsx
import { useState, type ReactNode } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { PackageCheck, Search } from 'lucide-react'
import './BuscarCorredorForm.css'

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
    <div className="buscar-form">
      <span className="buscar-form__icono">{icono}</span>

      <h2 className="buscar-form__titulo" id="buscar-corredor-titulo">
        {titulo}
      </h2>
      <p className="buscar-form__descripcion">{descripcion}</p>

      <Form className="buscar-form__form" onSubmit={enviar} noValidate>
        <InputGroup>
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
          <p className="buscar-form__error" role="alert">
            {mensaje}
          </p>
        )}
      </Form>
    </div>
  )
}

export default BuscarCorredorForm