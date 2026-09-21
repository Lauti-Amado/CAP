import { HashRouter, Routes, Route, Link } from 'react-router-dom';
// Asegúrate de que la ruta de importación coincida con la ubicación real de tu archivo
import Login from './Pantallas/login/Login'; 
import SeleccionarCarrera from './Pantallas/seleccionarCarrera/SeleccionarCarrera'
import DashboardClasificacion from './Pantallas/clasificacion/DashboardClasificacion';
// Componente temporal que representa tu pantalla principal
const PantallaInicio = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
    <h1>Bienvenido al sistema base</h1>
    <p>Elige a dónde quieres ir:</p>

    {/* Este es el enlace que te lleva al Login */}
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
    <HashRouter>
      <Routes>
        {/* La ruta "/" es lo primero que carga al abrir la app */}
        <Route path="/" element={<PantallaInicio />} />

        {/* La ruta "/login" carga tu componente Login.jsx */}
        <Route path="/login" element={<Login />} />
        <Route path="/seleccionar-carrera" element={<SeleccionarCarrera />} />
     
        <Route path="/dashboard-clasificacion" element={<DashboardClasificacion />} />
      
      </Routes>
    </HashRouter>
  );
}

export default App;