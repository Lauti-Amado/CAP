import { useMemo, useState } from 'react'
import { Calculator, ChevronLeft, ChevronRight, Download, Filter, Pencil, Plus, Search, Settings, Trash2, Trophy } from 'lucide-react'
import { grandPrixStandings, initialGrandPrixCircuits, type GrandPrixCircuit } from './grandPrixData'

type View = 'standings' | 'manage'

export default function GrandPrix() {
  const [view, setView] = useState<View>('standings')
  const [category, setCategory] = useState('Todas')
  const [gender, setGender] = useState('Todos')
  const [year, setYear] = useState('2026')
  const [search, setSearch] = useState('')
  const [circuits, setCircuits] = useState(initialGrandPrixCircuits)
  const [formCircuit, setFormCircuit] = useState<GrandPrixCircuit | null>(null)

  const filtered = useMemo(() => grandPrixStandings.filter((runner) =>
    (category === 'Todas' || runner.category === category) &&
    (gender === 'Todos' || runner.gender === gender) &&
    (`${runner.name} ${runner.dni}`.toLowerCase().includes(search.toLowerCase()))
  ), [category, gender, search])

  const startCreate = () => setFormCircuit({ id: `gp-${Date.now()}`, name: '', year: new Date().getFullYear(), status: 'Borrador', races: 0, participants: 0, pointsRule: 'Por posición general' })
  const saveCircuit = () => {
    if (!formCircuit || !formCircuit.name.trim()) return
    setCircuits((current) => current.some((item) => item.id === formCircuit.id) ? current.map((item) => item.id === formCircuit.id ? formCircuit : item) : [...current, formCircuit])
    setFormCircuit(null)
  }

  return (
    <div className="grand-prix-page container-fluid">
      <div className="gp-titlebar d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div><h1>{view === 'standings' ? `Grand Prix ${year}` : 'Gestión de Grand Prix'}</h1><p>{view === 'standings' ? 'Clasificación general acumulada del circuito anual.' : 'Creación y administración de circuitos, reglas y temporadas.'}</p></div>
        <div className="d-flex flex-wrap gap-2">
          {view === 'standings' ? <><button className="btn btn-outline-secondary btn-sm" type="button"><Download size={14} /> Exportar</button><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setView('manage')}><Settings size={14} /> Gestionar</button><button className="btn btn-success btn-sm" type="button"><Calculator size={14} /> Recalcular Puntos</button></> : <><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setView('standings')}><ChevronLeft size={14} /> Clasificación</button><button className="btn btn-success btn-sm" type="button" onClick={startCreate}><Plus size={14} /> Nuevo Grand Prix</button></>}
        </div>
      </div>

      {view === 'standings' ? <>
        <section className="gp-filter-card card">
          <h2><Filter size={15} /> Filtros de Clasificación</h2>
          <div className="row g-3 align-items-end">
            <label className="col-12 col-sm-6 col-xl-3">CATEGORÍA<select className="form-select form-select-sm" value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas</option><option>Mayores</option><option>Máster A</option></select></label>
            <label className="col-12 col-sm-6 col-xl-3">SEXO<select className="form-select form-select-sm" value={gender} onChange={(event) => setGender(event.target.value)}><option>Todos</option><option>Femenino</option><option>Masculino</option></select></label>
            <label className="col-12 col-sm-6 col-xl-3">AÑO<select className="form-select form-select-sm" value={year} onChange={(event) => setYear(event.target.value)}><option>2026</option><option>2025</option></select></label>
            <label className="gp-search col-12 col-sm-6 col-xl-3"><Search size={16} /><input className="form-control form-control-sm" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar por DNI o nombre" placeholder="Buscar DNI o Nombre" /></label>
          </div>
        </section>
        <section className="gp-table-card card">
          <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th scope="col">Puesto</th><th scope="col">Corredor</th><th scope="col">DNI</th><th scope="col">Carreras</th><th scope="col">Puntos Totales</th></tr></thead><tbody>{filtered.map((runner) => <tr key={runner.id} className={runner.position === 1 ? 'gp-winner' : ''}><td><span className={`gp-position gp-position--${runner.position}`}>{runner.position}</span></td><td><span className="runner-cell"><i>{runner.initials}</i><b>{runner.name}</b></span></td><td>{runner.dni}</td><td><span className="races-pill">{runner.racesCompleted} / {runner.totalRaces}</span></td><td><strong>{runner.points.toLocaleString('es-AR')}</strong></td></tr>)}</tbody></table></div>
          <footer><span>Mostrando {filtered.length} de 2.450 corredores</span><div><button className="btn btn-outline-secondary btn-sm" type="button"><ChevronLeft size={12} /></button><button className="btn btn-outline-secondary btn-sm" type="button"><ChevronRight size={12} /></button></div></footer>
        </section>
      </> : <section className="gp-management">
        <div className="d-flex flex-column gap-3">{circuits.map((circuit) => <article className="gp-circuit-card card flex-row flex-wrap align-items-center gap-3" key={circuit.id}><div className="gp-circuit-icon"><Trophy size={20} /></div><div className="gp-circuit-info"><div><h2>{circuit.name}</h2><span className={`gp-status gp-status--${circuit.status.toLowerCase()}`}>{circuit.status}</span></div><p>{circuit.races} carreras · {circuit.participants.toLocaleString('es-AR')} participantes</p><small>{circuit.pointsRule}</small></div><div className="d-flex gap-2"><button className="btn btn-outline-secondary btn-sm" type="button" aria-label={`Editar ${circuit.name}`} onClick={() => setFormCircuit(circuit)}><Pencil size={14} /></button><button className="btn btn-outline-secondary btn-sm" type="button" aria-label={`Eliminar ${circuit.name}`} onClick={() => setCircuits((current) => current.filter((item) => item.id !== circuit.id))}><Trash2 size={14} /></button></div></article>)}</div>
        {formCircuit && <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="gp-form-title"><div className="modal-dialog modal-dialog-centered"><form className="gp-form modal-content" onSubmit={(event) => { event.preventDefault(); saveCircuit() }}><h2 id="gp-form-title">{circuits.some((item) => item.id === formCircuit.id) ? 'Editar Grand Prix' : 'Nuevo Grand Prix'}</h2><label>Nombre<input className="form-control form-control-sm" required value={formCircuit.name} onChange={(event) => setFormCircuit({ ...formCircuit, name: event.target.value })} /></label><label>Año<input className="form-control form-control-sm" type="number" value={formCircuit.year} onChange={(event) => setFormCircuit({ ...formCircuit, year: Number(event.target.value) })} /></label><label>Estado<select className="form-select form-select-sm" value={formCircuit.status} onChange={(event) => setFormCircuit({ ...formCircuit, status: event.target.value as GrandPrixCircuit['status'] })}><option>Activo</option><option>Borrador</option><option>Finalizado</option></select></label><label>Regla de puntaje<select className="form-select form-select-sm" value={formCircuit.pointsRule} onChange={(event) => setFormCircuit({ ...formCircuit, pointsRule: event.target.value })}><option>Por posición general</option><option>Por categoría</option><option>Puntos personalizados</option></select></label><div><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setFormCircuit(null)}>Cancelar</button><button className="btn btn-success btn-sm" type="submit">Guardar</button></div></form></div></div>}
      </section>}
    </div>
  )
}
