import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './frontend/pantallas/login/login'; 
import SeleccionarCarrera from './frontend/pantallas/seleccionarCarrera/seleccionarCarrera';
import DashboardClasificacion from './frontend/pantallas/clasificacion/DashboardClasificacion';
import BuscarCorredor from './frontend/pantallas/entregaKits/BuscarCorredor';
import Carreras from './frontend/pantallas/carreras/Carreras';
import DetalleCarrera from './frontend/pantallas/carreras/DetalleCarrera';

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
        {/* Rutas Base */}
        <Route path="/" element={<PantallaInicio />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de Funcionalidades */}
        <Route path="/seleccionar-carrera" element={<SeleccionarCarrera />} />
        <Route path="/dashboard-clasificacion" element={<DashboardClasificacion />} />
        <Route path="/carreras" element={<Carreras />} />
        <Route path="/carreras/:id" element={<DetalleCarrera />} />
        <Route path="/entrega-kits" element={<BuscarCorredor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;