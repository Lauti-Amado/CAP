//frontend/src/pages/grandPrix/GrandPrix.tsx
import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Row,
  Table,
} from 'react-bootstrap'
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Filter,
  Pencil,
  Plus,
  Search,
  Settings,
  Table as TableIcon,
  Trash2,
  Trophy,
} from 'lucide-react'
import {
  grandPrixStandings,
  initialGrandPrixCircuits,
  type GrandPrixCircuit,
} from './grandPrixData'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type View = 'standings' | 'manage'

export default function GrandPrix() {
  const [view, setView] = useState<View>('standings')
  const [category, setCategory] = useState('Todas')
  const [gender, setGender] = useState('Todos')
  const [year, setYear] = useState('2026')
  const [search, setSearch] = useState('')
  const [circuits, setCircuits] = useState(initialGrandPrixCircuits)
  const [formCircuit, setFormCircuit] = useState<GrandPrixCircuit | null>(null)

  const filtered = useMemo(
    () =>
      grandPrixStandings.filter(
        (runner) =>
          (category === 'Todas' || runner.category === category) &&
          (gender === 'Todos' || runner.gender === gender) &&
          `${runner.name} ${runner.dni}`.toLowerCase().includes(search.toLowerCase())
      ),
    [category, gender, search]
  )

  const startCreate = () =>
    setFormCircuit({
      id: `gp-${Date.now()}`,
      name: '',
      year: new Date().getFullYear(),
      status: 'Borrador',
      races: 0,
      participants: 0,
      pointsRule: 'Por posición general',
    })

  const saveCircuit = () => {
    if (!formCircuit || !formCircuit.name.trim()) return
    setCircuits((current) =>
      current.some((item) => item.id === formCircuit.id)
        ? current.map((item) => (item.id === formCircuit.id ? formCircuit : item))
        : [...current, formCircuit]
    )
    setFormCircuit(null)
  }

  // ==========================
  // FUNCIONES DE EXPORTACIÓN
  // ==========================

  // 1. Exportar a CSV (JavaScript Nativo)
  const handleExportCSV = () => {
    if (filtered.length === 0) return

    const headers = ['PUESTO', 'CORREDOR', 'DNI', 'CARRERAS', 'PUNTOS TOTALES']
    const rows = filtered.map((r) => [
      r.position,
      `"${r.name}"`,
      `"${r.dni}"`,
      `"${r.racesCompleted} / ${r.totalRaces}"`,
      r.points,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `grand_prix_${year}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 2. Exportar a Excel (.xlsx usando SheetJS / xlsx)
  const handleExportExcel = () => {
    if (filtered.length === 0) return

    const datosParaExcel = filtered.map((r) => ({
      Puesto: r.position,
      Corredor: r.name,
      DNI: r.dni,
      'Carreras Completadas': `${r.racesCompleted} / ${r.totalRaces}`,
      'Puntos Totales': r.points,
    }))

    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clasificación Grand Prix')

    XLSX.writeFile(workbook, `grand_prix_${year}.xlsx`)
  }

  // 3. Exportar a PDF (Usando jsPDF y jspdf-autotable)
  const handleExportPDF = () => {
    if (filtered.length === 0) return

    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(`Clasificación General - Grand Prix ${year}`, 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(
      `Filtros: Categoría (${category}) | Sexo (${gender}) | Generado el: ${new Date().toLocaleDateString()}`,
      14,
      28
    )

    const columnas = ['Puesto', 'Corredor', 'DNI', 'Carreras', 'Puntos Totales']
    const filas = filtered.map((r) => [
      r.position,
      r.name,
      r.dni,
      `${r.racesCompleted} / ${r.totalRaces}`,
      r.points.toLocaleString('es-AR'),
    ])

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }, // Color verde institucional (#16a34a)
      styles: { fontSize: 9 },
    })

    doc.save(`grand_prix_${year}.pdf`)
  }

  return (
    <Container
      fluid
      as="main"
      className="px-3 px-md-4 py-3"
      style={{
        minHeight: '100vh',
        color: '#293246',
        boxSizing: 'border-box',
      }}
    >
      {/* Titlebar */}
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 style={{ margin: 0, fontSize: '23px', fontWeight: 700, color: '#293246' }}>
            {view === 'standings' ? `Grand Prix ${year}` : 'Gestión de Grand Prix'}
          </h1>
          <p style={{ margin: '6px 0 0', color: '#68736d', fontSize: '11px' }}>
            {view === 'standings'
              ? 'Clasificación general acumulada del circuito anual.'
              : 'Creación y administración de circuitos, reglas y temporadas.'}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {view === 'standings' ? (
            <>
              {/* Botones de Exportación independientes */}
              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={handleExportPDF}
                title="Exportar a PDF"
                className="d-inline-flex align-items-center gap-1 fw-semibold"
                style={{
                  minHeight: '32px',
                  padding: '0 13px',
                  border: '1px solid #c9d5cd',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#067139',
                  fontSize: '10px',
                }}
              >
                <FileText size={14} className="text-success" /> PDF
              </Button>

              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={handleExportExcel}
                title="Exportar a Excel"
                className="d-inline-flex align-items-center gap-1 fw-semibold"
                style={{
                  minHeight: '32px',
                  padding: '0 13px',
                  border: '1px solid #c9d5cd',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#067139',
                  fontSize: '10px',
                }}
              >
                <FileSpreadsheet size={14} className="text-success" /> Excel
              </Button>

              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={handleExportCSV}
                title="Exportar a CSV"
                className="d-inline-flex align-items-center gap-1 fw-semibold"
                style={{
                  minHeight: '32px',
                  padding: '0 13px',
                  border: '1px solid #c9d5cd',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#067139',
                  fontSize: '10px',
                }}
              >
                <TableIcon size={14} className="text-success" /> CSV
              </Button>

              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={() => setView('manage')}
                className="d-inline-flex align-items-center gap-1 fw-semibold"
                style={{
                  minHeight: '32px',
                  padding: '0 13px',
                  border: '1px solid #c9d5cd',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#354239',
                  fontSize: '10px',
                }}
              >
                <Settings size={14} /> Gestionar
              </Button>

              <Button
                type="button"
                size="sm"
                className="d-inline-flex align-items-center gap-1 fw-semibold text-white border-0"
                style={{
                  minHeight: '32px',
                  padding: '0 13px',
                  borderRadius: '4px',
                  backgroundColor: '#057238',
                  fontSize: '10px',
                }}
              >
                <Calculator size={14} /> Recalcular Puntos
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={() => setView('standings')}
                className="d-inline-flex align-items-center gap-1 fw-semibold"
                style={{
                  minHeight: '32px',
                  padding: '0 13px',
                  border: '1px solid #c9d5cd',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#067139',
                  fontSize: '10px',
                }}
              >
                <ChevronLeft size={14} /> Clasificación
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={startCreate}
                className="d-inline-flex align-items-center gap-1 fw-semibold text-white border-0"
                style={{
                  minHeight: '32px',
                  padding: '0 13px',
                  borderRadius: '4px',
                  backgroundColor: '#057238',
                  fontSize: '10px',
                }}
              >
                <Plus size={14} /> Nuevo Grand Prix
              </Button>
            </>
          )}
        </div>
      </header>

      {view === 'standings' ? (
        <>
          {/* Tarjeta de Filtros */}
          <Card
            as="section"
            className="mb-4 border shadow-none"
            style={{
              borderColor: '#ccd8d0',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 11px rgba(27,43,65,.04)',
            }}
          >
            <Card.Header
              className="bg-transparent px-3 py-3 border-bottom"
              style={{ borderColor: '#e3e8e5' }}
            >
              <h2
                className="d-flex align-items-center gap-2 mb-0"
                style={{ fontSize: '13px', fontWeight: 600, color: '#293246' }}
              >
                <Filter size={15} style={{ color: '#087840' }} />
                Filtros de Clasificación
              </h2>
            </Card.Header>

            <Card.Body className="p-3">
              <Row className="g-3">
                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: '8px',
                        fontWeight: 700,
                        color: '#4f5a53',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      CATEGORÍA
                    </Form.Label>
                    <Form.Select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      style={{
                        height: '36px',
                        border: '1px solid #ced7d2',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        color: '#39443d',
                        fontSize: '10px',
                      }}
                    >
                      <option>Todas</option>
                      <option>Mayores</option>
                      <option>Máster A</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: '8px',
                        fontWeight: 700,
                        color: '#4f5a53',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      SEXO
                    </Form.Label>
                    <Form.Select
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                      style={{
                        height: '36px',
                        border: '1px solid #ced7d2',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        color: '#39443d',
                        fontSize: '10px',
                      }}
                    >
                      <option>Todos</option>
                      <option>Femenino</option>
                      <option>Masculino</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: '8px',
                        fontWeight: 700,
                        color: '#4f5a53',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      AÑO
                    </Form.Label>
                    <Form.Select
                      value={year}
                      onChange={(event) => setYear(event.target.value)}
                      style={{
                        height: '36px',
                        border: '1px solid #ced7d2',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        color: '#39443d',
                        fontSize: '10px',
                      }}
                    >
                      <option>2026</option>
                      <option>2025</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: '8px',
                        fontWeight: 700,
                        color: '#4f5a53',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      BÚSQUEDA
                    </Form.Label>
                    <InputGroup
                      style={{
                        height: '36px',
                        border: '1px solid #ced7d2',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <InputGroup.Text
                        style={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          padding: '0 8px',
                          color: '#4f5a53',
                        }}
                      >
                        <Search size={15} />
                      </InputGroup.Text>
                      <Form.Control
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar DNI o Nombre"
                        style={{
                          height: '100%',
                          border: 'none',
                          boxShadow: 'none',
                          fontSize: '10px',
                          color: '#39443d',
                        }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Tarjeta de Tabla */}
          <Card
            as="section"
            className="border shadow-none"
            style={{
              borderColor: '#ccd8d0',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 11px rgba(27,43,65,.04)',
              overflow: 'hidden',
            }}
          >
            <div className="table-responsive">
              <Table hover className="align-middle mb-0" style={{ fontSize: '10px' }}>
                <thead>
                  <tr style={{ background: '#f2f4ff' }}>
                    <th style={{ height: '34px', padding: '0 15px', background: '#f2f4ff', color: '#526058', fontSize: '8px', letterSpacing: '0.3px', borderTop: 'none' }}>
                      Puesto
                    </th>
                    <th style={{ height: '34px', padding: '0 15px', background: '#f2f4ff', color: '#526058', fontSize: '8px', letterSpacing: '0.3px', borderTop: 'none' }}>
                      Corredor
                    </th>
                    <th style={{ height: '34px', padding: '0 15px', background: '#f2f4ff', color: '#526058', fontSize: '8px', letterSpacing: '0.3px', borderTop: 'none' }}>
                      DNI
                    </th>
                    <th style={{ height: '34px', padding: '0 15px', background: '#f2f4ff', color: '#526058', fontSize: '8px', letterSpacing: '0.3px', borderTop: 'none' }}>
                      Carreras
                    </th>
                    <th className="text-end" style={{ height: '34px', padding: '0 15px', background: '#f2f4ff', color: '#526058', fontSize: '8px', letterSpacing: '0.3px', borderTop: 'none' }}>
                      Puntos Totales
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((runner) => {
                    const isWinner = runner.position === 1
                    let positionStyle: React.CSSProperties = {
                      width: '24px',
                      height: '24px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontWeight: 700,
                    }

                    if (runner.position === 1) {
                      positionStyle = {
                        ...positionStyle,
                        border: '1px solid #eab300',
                        color: '#b88600',
                        backgroundColor: '#fff7d9',
                      }
                    } else if (runner.position === 2) {
                      positionStyle = {
                        ...positionStyle,
                        border: '1px solid #9ba7b3',
                        color: '#333333',
                        backgroundColor: '#f3f6fa',
                      }
                    } else if (runner.position === 3) {
                      positionStyle = {
                        ...positionStyle,
                        border: '1px solid #e18b4c',
                        color: '#b65c1e',
                        backgroundColor: '#fff3eb',
                      }
                    }

                    return (
                      <tr
                        key={runner.id}
                        style={{
                          backgroundColor: isWinner ? '#fffbed' : 'transparent',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <td style={{ height: '44px', padding: '0 15px', borderColor: '#e6ebe7' }}>
                          <span style={positionStyle}>{runner.position}</span>
                        </td>
                        <td style={{ height: '44px', padding: '0 15px', borderColor: '#e6ebe7' }}>
                          <div className="d-flex align-items-center gap-2">
                            <i
                              style={{
                                width: '23px',
                                height: '23px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                backgroundColor: '#dfe7f1',
                                color: '#526173',
                                fontSize: '8px',
                                fontStyle: 'normal',
                                fontWeight: 700,
                              }}
                            >
                              {runner.initials}
                            </i>
                            <b style={{ fontSize: '11px' }}>{runner.name}</b>
                          </div>
                        </td>
                        <td style={{ height: '44px', padding: '0 15px', borderColor: '#e6ebe7', fontSize: '10px' }}>
                          {runner.dni}
                        </td>
                        <td style={{ height: '44px', padding: '0 15px', borderColor: '#e6ebe7' }}>
                          <Badge
                            pill
                            style={{
                              padding: '4px 9px',
                              backgroundColor: '#d8f3e2',
                              color: '#08723c',
                              fontSize: '8px',
                              fontWeight: 600,
                            }}
                          >
                            {runner.racesCompleted} / {runner.totalRaces}
                          </Badge>
                        </td>
                        <td className="text-end" style={{ height: '44px', padding: '0 15px', borderColor: '#e6ebe7' }}>
                          <strong style={{ color: '#06763d', fontSize: '13px' }}>
                            {runner.points.toLocaleString('es-AR')}
                          </strong>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>

            <Card.Footer
              className="bg-white d-flex align-items-center justify-content-between px-3 py-2 border-top"
              style={{
                height: '42px',
                borderColor: '#e6ebe7',
                color: '#626e66',
                fontSize: '9px',
              }}
            >
              <span>Mostrando {filtered.length} de 2.450 corredores</span>
              <div className="d-flex gap-1">
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  style={{
                    minWidth: '24px',
                    height: '24px',
                    padding: 0,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#5c6961',
                    borderColor: '#c9d5cd',
                  }}
                >
                  <ChevronLeft size={12} />
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  style={{
                    minWidth: '24px',
                    height: '24px',
                    padding: 0,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#5c6961',
                    borderColor: '#c9d5cd',
                  }}
                >
                  <ChevronRight size={12} />
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </>
      ) : (
        <section>
          {/* Grid de Circuitos */}
          <div className="d-flex flex-column gap-3">
            {circuits.map((circuit) => {
              const statusStyles: Record<string, React.CSSProperties> = {
                Activo: { backgroundColor: '#d9f4e3', color: '#08743d' },
                Finalizado: { backgroundColor: '#eef1f3', color: '#59655e' },
                Borrador: { backgroundColor: '#fff1ca', color: '#976b10' },
              }

              return (
                <Card
                  key={circuit.id}
                  className="border shadow-none"
                  style={{
                    borderColor: '#d6dfd9',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 3px 10px rgba(30,45,66,.04)',
                  }}
                >
                  <Card.Body className="p-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        flex: '0 0 40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        backgroundColor: '#e7f7ed',
                        color: '#05743b',
                      }}
                    >
                      <Trophy size={20} />
                    </div>

                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center gap-2">
                        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                          {circuit.name}
                        </h2>
                        <Badge
                          pill
                          style={{
                            padding: '3px 8px',
                            fontSize: '8px',
                            fontWeight: 600,
                            ...statusStyles[circuit.status],
                          }}
                        >
                          {circuit.status}
                        </Badge>
                      </div>
                      <p style={{ margin: '5px 0 2px', color: '#647068', fontSize: '10px' }}>
                        {circuit.races} carreras · {circuit.participants.toLocaleString('es-AR')}{' '}
                        participantes
                      </p>
                      <small style={{ color: '#8a938d', fontSize: '9px' }}>
                        {circuit.pointsRule}
                      </small>
                    </div>

                    <div className="d-flex gap-1 ms-auto">
                      <Button
                        type="button"
                        variant="light"
                        size="sm"
                        aria-label={`Editar ${circuit.name}`}
                        onClick={() => setFormCircuit(circuit)}
                        style={{
                          width: '30px',
                          height: '30px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #ccd6d0',
                          borderRadius: '4px',
                          color: '#526058',
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="light"
                        size="sm"
                        aria-label={`Eliminar ${circuit.name}`}
                        onClick={() =>
                          setCircuits((current) =>
                            current.filter((item) => item.id !== circuit.id)
                          )
                        }
                        style={{
                          width: '30px',
                          height: '30px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #ccd6d0',
                          borderRadius: '4px',
                          color: '#c5454c',
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )
            })}
          </div>

          {/* Modal Formulario Grand Prix */}
          <Modal
            show={Boolean(formCircuit)}
            onHide={() => setFormCircuit(null)}
            centered
            backdrop="static"
          >
            <Form
              onSubmit={(event) => {
                event.preventDefault()
                saveCircuit()
              }}
            >
              <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title style={{ fontSize: '17px', fontWeight: 700 }}>
                  {formCircuit && circuits.some((item) => item.id === formCircuit.id)
                    ? 'Editar Grand Prix'
                    : 'Nuevo Grand Prix'}
                </Modal.Title>
              </Modal.Header>

              <Modal.Body className="d-flex flex-column gap-3 py-3">
                {formCircuit && (
                  <>
                    <Form.Group>
                      <Form.Label
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: '#4d5951',
                          textTransform: 'uppercase',
                        }}
                      >
                        Nombre
                      </Form.Label>
                      <Form.Control
                        required
                        value={formCircuit.name}
                        onChange={(event) =>
                          setFormCircuit({ ...formCircuit, name: event.target.value })
                        }
                        style={{
                          height: '36px',
                          fontSize: '11px',
                          borderColor: '#ccd6d0',
                        }}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: '#4d5951',
                          textTransform: 'uppercase',
                        }}
                      >
                        Año
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={formCircuit.year}
                        onChange={(event) =>
                          setFormCircuit({
                            ...formCircuit,
                            year: Number(event.target.value),
                          })
                        }
                        style={{
                          height: '36px',
                          fontSize: '11px',
                          borderColor: '#ccd6d0',
                        }}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: '#4d5951',
                          textTransform: 'uppercase',
                        }}
                      >
                        Estado
                      </Form.Label>
                      <Form.Select
                        value={formCircuit.status}
                        onChange={(event) =>
                          setFormCircuit({
                            ...formCircuit,
                            status: event.target.value as GrandPrixCircuit['status'],
                          })
                        }
                        style={{
                          height: '36px',
                          fontSize: '11px',
                          borderColor: '#ccd6d0',
                        }}
                      >
                        <option>Activo</option>
                        <option>Borrador</option>
                        <option>Finalizado</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: '#4d5951',
                          textTransform: 'uppercase',
                        }}
                      >
                        Regla de puntaje
                      </Form.Label>
                      <Form.Select
                        value={formCircuit.pointsRule}
                        onChange={(event) =>
                          setFormCircuit({
                            ...formCircuit,
                            pointsRule: event.target.value,
                          })
                        }
                        style={{
                          height: '36px',
                          fontSize: '11px',
                          borderColor: '#ccd6d0',
                        }}
                      >
                        <option>Por posición general</option>
                        <option>Por categoría</option>
                        <option>Puntos personalizados</option>
                      </Form.Select>
                    </Form.Group>
                  </>
                )}
              </Modal.Body>

              <Modal.Footer className="border-top-0 pt-0">
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setFormCircuit(null)}
                  style={{
                    minHeight: '31px',
                    padding: '0 14px',
                    fontSize: '10px',
                    borderColor: '#ccd6d0',
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-white border-0"
                  style={{
                    minHeight: '31px',
                    padding: '0 14px',
                    fontSize: '10px',
                    backgroundColor: '#057238',
                  }}
                >
                  Guardar
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </section>
      )}
    </Container>
  )
}
