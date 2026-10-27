import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

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
import Administracion from './pages/administracion/Administracion';
import RolesPermisos from './pages/administracion/RolesPermisos';
import ConfiguracionClasificaciones from './pages/administracion/categorias/ConfiguracionClasificaciones';
import NuevaCategoria from './pages/administracion/categorias/NuevaCategoria';
import ClasificacionManualDetalle from './pages/clasificacion/ClasificacionManualDetalle';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>

        <Route path='/' element={<Login />} />

        <Route element={<MainLayout />}>

          {/*HOME*/}
          <Route path='home' element={<Dashboard />} />

          {/*CLASIFICADOR*/}
          <Route path='clasificador'>
            <Route path='seleccionar-carrera' element={<SeleccionarCarrera />} />

            {/*Entrega kits*/}
            <Route path='entrega-kits'>
              <Route index element={<BuscarCorredor />} />
              <Route path="corredor/:dni" element={<DetalleCorredor />} />
              <Route path="inscripciones" element={<Inscripciones />} />
              <Route path="inscripciones/nueva" element={<NuevaInscripcion />} />
              <Route path="inscripciones/:id" element={<DetalleInscripcion />} />
            </Route>

            {/*Dashboard clasificacion*/}
            <Route path="clasificaciones">
              <Route index element={<DashboardClasificacion />} />
              <Route path="modificar/:id" element={<ModClasifCorredor />} />
              <Route path='tiempo-real' element={<ClasificacionTiempoReal />} />
              <Route path="manual/corredor/:dni" element={<ClasificacionManualDetalle />} />
            </Route>

            {/*Resultados*/}
            <Route path="resultados" element={<Resultados />} />

            {/*Grand prix*/}
            <Route path="grand-prix" element={<GrandPrix />} />
          </Route>

          {/*ADMINISTRADOR*/}
          <Route path='administrador'>
            {/*Carreras*/}
            <Route path="carreras" element={<Carreras />} />
            <Route path="carreras/:id" element={<DetalleCarrera />} />

            {/*Administracion*/}
            <Route path='configuraciones'>
              <Route index element={<Administracion />} />
              <Route path="categorias" element={<ConfiguracionClasificaciones />} />
              <Route path="categorias/nueva" element={<NuevaCategoria />} />
              <Route path="categorias/:id/editar" element={<NuevaCategoria />} />
              <Route path="certificados" element={<Certificates onEditorChange={() => { }} />} />
              <Route path="usuarios/:id/rol" element={<RolesPermisos />} />
            </Route>
          </Route>
          
        </Route>

      </Routes>
    </AuthProvider>
  );
}