import { Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';
import Login from './pages/login/login';
import SeleccionarCarrera from './pages/seleccionarCarrera/seleccionarCarrera';
import DashboardClasificacion from './pages/clasificacion/DashboardClasificacion';
import GrandPrix from './pages/grandPrix/GrandPrix';
import Certificates from './pages/certificados/Certificates';
import BuscarCorredor from './pages/entregaKits/BuscarCorredor';
import Carreras from './pages/carreras/Carreras';
import DetalleCarrera from './pages/carreras/DetalleCarrera';
import Resultados from './pages/resultados/Resultados';
import ClasificacionTiempoReal from './pages/clasificacion/clasificacionTiempoReal/ClasificacionTiempoReal';
import DetalleCorredor from './pages/entregaKits/DetalleCorredor';
import Inscripciones from './pages/inscripciones/Inscripciones';
import ModClasifCorredor from './pages/clasificacion/modClasifCorredor/modClasifCorredor';
import DetalleInscripcion from './pages/inscripciones/DetalleInscripcion';
import NuevaInscripcion from './pages/inscripciones/NuevaInscripcion';
import Dashboard from './pages/dashboard/Dashboard';

function App() {
  return (
      <Routes>
        {/* Ruta pública sin Sidebar */}
        <Route path="/" element={<Login />} />

        {/* Rutas principales que comparten el Layout con el Sidebar */}
        <Route element={<MainLayout />}>
          {/*<Route path="/" element={<dashboardData data={dashboardData} />} />*/}
          <Route path="/dashboard-clasificacion" element={<DashboardClasificacion />} />
          <Route path="/seleccionar-carrera" element={<SeleccionarCarrera />} />
          <Route path="/carreras" element={<Carreras />} />
          <Route path="/carreras/:id" element={<DetalleCarrera />} />
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/entrega-kits" element={<BuscarCorredor />} />
          <Route path="/entrega-kits/corredor/:dni" element={<DetalleCorredor />} />
          <Route path="/grand-prix" element={<GrandPrix />} />
          <Route path="/clasificacion-tiempo-real" element={<ClasificacionTiempoReal />} />
          <Route path="/certificados" element={<Certificates onEditorChange={() => { }} />} />
          <Route path="/entrega-kits/inscripciones" element={<Inscripciones />} />
          <Route path="/entrega-kits/inscripciones/nueva" element={<NuevaInscripcion />} />
          <Route path="/entrega-kits/inscripciones/:id" element={<DetalleInscripcion />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modificar-clasificacion/:id" element={<ModClasifCorredor />} />
        </Route>
      </Routes>
  );
}

export default App;