//frontend/src/components/corredor/BuscarCorredorForm.tsx
import type { ReactNode } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { PackageCheck, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { dniBusquedaSchema } from '../../schemas/kitSchema'
import type { DniBusquedaForm } from '../../schemas/kitSchema'

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DniBusquedaForm>({
    resolver: zodResolver(dniBusquedaSchema),
    defaultValues: { dni: '' },
  })

  const dniRegistro = register('dni')
  const mensaje = errors.dni?.message ?? error

  const enviar = ({ dni }: DniBusquedaForm) => onBuscar(dni)

  return (
    <div className="d-flex flex-column align-items-center text-center">
      <span className="d-inline-flex rounded-3 bg-success-subtle text-success p-3 mb-3">
        {icono}
      </span>

      <h2 className="h4 fw-bold mb-2" id="buscar-corredor-titulo">
        {titulo}
      </h2>
      <p className="text-secondary mb-4">{descripcion}</p>

      <Form className="w-100" onSubmit={handleSubmit(enviar)} noValidate>
        <InputGroup size="lg">
          <InputGroup.Text className="bg-white">
            <Search size={14} aria-hidden="true" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            inputMode="numeric"
            autoFocus
            {...dniRegistro}
            placeholder={placeholder}
            aria-label="DNI del corredor"
            isInvalid={Boolean(mensaje)}
            onChange={(evento) => {
              void dniRegistro.onChange(evento)
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