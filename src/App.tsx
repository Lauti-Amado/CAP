import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './frontend/layout/MainLayout';
import Login from './frontend/pantallas/login/login'; 
import SeleccionarCarrera from './frontend/pantallas/seleccionarCarrera/seleccionarCarrera';
import DashboardClasificacion from './frontend/pantallas/clasificacion/DashboardClasificacion';
import GrandPrix from './frontend/pantallas/grandPrix/GrandPrix';
import Certificates from './frontend/pantallas/certificados/Certificates';
import BuscarCorredor from './frontend/pantallas/entregaKits/BuscarCorredor';
import Carreras from './frontend/pantallas/carreras/Carreras';
import DetalleCarrera from './frontend/pantallas/carreras/DetalleCarrera';
import Resultados from './frontend/pantallas/resultados/Resultados';
import ClasificacionTiempoReal from './frontend/pantallas/clasificacion/clasificacionTiempoReal/ClasificacionTiempoReal';
import ModClasifCorredor from './frontend/pantallas/clasificacion/modClasifCorredor/modClasifCorredor';
//import { DashboardData, dashboardData } from './dashboardData';

function App() {
  return (
    <HashRouter>
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
          <Route path="/grand-prix" element={<GrandPrix />} />
          <Route path="/clasificacion-tiempo-real" element={<ClasificacionTiempoReal />} />
          <Route path="/certificados" element={<Certificates onEditorChange={() => {}} />} />
          {/* Dashboard de clasificación de una carrera específica */}
          {/* 
          <Route
            path="/dashboard-clasificacion-modificar/:id"
            element={<DashboardClasificacionModificar />}
          />
          */}
          <Route path="/modificar-clasificacion/:id" element={<ModClasifCorredor />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;