import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './Pantallas/login/login' 
import SeleccionarCarrera from './Pantallas/seleccionarCarrera/seleccionarCarrera'
import BuscarCorredor from './Pantallas/entregaKits/BuscarCorredor'
import Carreras from './Pantallas/carreras/Carreras'
import DetalleCarrera from './Pantallas/carreras/DetalleCarrera'

// Componente temporal que representa la pantalla principal
const PantallaInicio = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
    <h1>Bienvenido al sistema base</h1>
    <p>Elige a dónde quieres ir:</p>

    {/* Enlace que lleva al Login */}
    <Link 
      to="/login" 
      style={{ padding: '10px 20px', backgroundColor: '#006F3D', color: 'white', textDecoration: 'none', borderRadius: '6px' }}
    >
      Ir a Iniciar Sesión
    </Link>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PantallaInicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seleccionar-carrera" element={<SeleccionarCarrera />} />
        <Route path="/carreras" element={<Carreras />} />
        <Route path="/carreras/:id" element={<DetalleCarrera />} />
        <Route path="/entrega-kits" element={<BuscarCorredor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App