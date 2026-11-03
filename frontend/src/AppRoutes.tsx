import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CarreraProvider } from './context/CarreraContext';
import { SeleccionarCarreraProvider } from './context/SeleccionarCarreraContext';

import MainLayout from './layout/MainLayout';
import { PrivateRoute } from './layout/PrivateRoute';

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
import ModificarClasificacionCarrera from './pages/clasificacion/ModificarClasificacionCarrera';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>

        <Route path='/' element={<Login />} />

        <Route element={<PrivateRoute roles={["Administrador", "Clasificador"]} />}>
          <Route element={<CarreraProvider />}>
            <Route element={<MainLayout />}>

              {/*HOME------------------------------------*/}
              <Route path='home' element={<Dashboard />} />

              {/*CLASIFICADOR----------------------------*/}
              <Route path='clasificador'>

                {/*Entrega de kits*/}
                <Route path="entrega-kits" element={<SeleccionarCarreraProvider />}>
                  <Route path='seleccionar-carrera' element={<SeleccionarCarrera />} />
                  <Route path=':nombreCarrera'>
                    <Route index element={<Navigate to="buscar-corredor" replace />} />

                    <Route path="buscar-corredor" element={<BuscarCorredor />} />
                    <Route path=":dni" element={<DetalleCorredor />} />
                    <Route path="inscripciones" element={<Inscripciones />} />
                    <Route path="inscripciones/nueva" element={<NuevaInscripcion />} />
                    <Route path="inscripciones/:id" element={<DetalleInscripcion />} />
                  </Route>
                </Route>

                {/*Clasificaciones*/}
                <Route path="clasificaciones" element={<SeleccionarCarreraProvider />}>
                  <Route path='seleccionar-carrera' element={<SeleccionarCarrera />} />
                  <Route path=':nombreCarrera'>
                    <Route index element={<Navigate to="dashboard-clasificaciones" replace />} />

                    <Route path="dashboard-clasificaciones" element={<DashboardClasificacion />} />
                    <Route path=":id" element={<ModClasifCorredor />} />
                    <Route path='tiempo-real' element={<ClasificacionTiempoReal />} />
                    <Route path="manual/:dni" element={<ClasificacionManualDetalle />} />
                  </Route>
                </Route>

                {/*Resultados*/}
                <Route path="resultados" element={<SeleccionarCarreraProvider />}>
                  <Route path='seleccionar-carrera' element={<SeleccionarCarrera />} />
                  <Route path=':nombreCarrera'>
                    <Route index element={<Navigate to="resultado" replace />} />

                    <Route path="resultado" element={<Resultados />} />
                  </Route>
                </Route>

                {/*Grand prix*/}
                <Route path="grand-prix" element={<GrandPrix />} />
              </Route>

              {/*ADMINISTRADOR-----------------------------*/}
              <Route path='administrador'>
                {/*Carreras*/}
                <Route path="carreras" element={<Carreras />} />
                <Route path="carreras/:id" element={<DetalleCarrera />} />
                <Route path="carreras/:id/clasificacion" element={<ModificarClasificacionCarrera />} />
                <Route path="carreras/:id/clasificacion/completa" element={<ClasificacionTiempoReal />} />
                <Route path="carreras/:id/clasificacion/:corredorId" element={<ModClasifCorredor />} />

                {/*Administracion*/}
                <Route path='configuraciones'>
                  <Route index element={<Administracion />} />
                  <Route path="categorias" element={<ConfiguracionClasificaciones />} />
                  <Route path="categorias/nueva" element={<NuevaCategoria />} />
                  <Route path="categorias/:id" element={<NuevaCategoria />} />
                  <Route path="certificados" element={<Certificates onEditorChange={() => { }} />} />
                  <Route path=":id" element={<RolesPermisos />} />
                </Route>
              </Route>

            </Route>
          </Route>
        </Route>

      </Routes>
    </AuthProvider>
  );
}