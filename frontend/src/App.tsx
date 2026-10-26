import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';

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
import Administracion from './pages/administracion/Administracion';
import RolesPermisos from './pages/administracion/RolesPermisos';
import ConfiguracionClasificaciones from './pages/administracion/categorias/ConfiguracionClasificaciones';
import NuevaCategoria from './pages/administracion/categorias/NuevaCategoria';
import ClasificacionManualDetalle from './pages/clasificacion/ClasificacionManualDetalle';

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        <Route path='/' element={<Login />} />

        <Route element={<MainLayout />}>

          {/*HOME*/}
          <Route path='home' element={<Dashboard />} />

          {/*CLASIFICADOR*/}
          <Route path='clasificador'>
            <Route index element={<SeleccionarCarrera />} />

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
            <Route path='administracion'>
              <Route index element={<Administracion />} />
              <Route path="categorias" element={<ConfiguracionClasificaciones />} />
              <Route path="categorias/nueva" element={<NuevaCategoria />} />
              <Route path="categorias/:id/editar" element={<NuevaCategoria />} />
              <Route path="certificados" element={<Certificates onEditorChange={() => { }} />} />
              <Route path="usuarios/:id/rol" element={<RolesPermisos />} />
            </Route>

          </Route>



          {/*CLASI*/}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/seleccionar-carrera" element={<SeleccionarCarrera />} />

          <Route path="/entrega-kits" element={<BuscarCorredor />} />
          <Route path="/entrega-kits/corredor/:dni" element={<DetalleCorredor />} />
          <Route path="/entrega-kits/inscripciones" element={<Inscripciones />} />
          <Route path="/entrega-kits/inscripciones/nueva" element={<NuevaInscripcion />} />
          <Route path="/entrega-kits/inscripciones/:id" element={<DetalleInscripcion />} />

          <Route path="/dashboard-clasificacion" element={<DashboardClasificacion />} />
          <Route path="/modificar-clasificacion/:id" element={<ModClasifCorredor />} />
          <Route path="/clasificacion-tiempo-real" element={<ClasificacionTiempoReal />} />
          <Route path="/clasificacion-manual/corredor/:dni" element={<ClasificacionManualDetalle />} />

          <Route path="/resultados" element={<Resultados />} />

          <Route path="/grand-prix" element={<GrandPrix />} />


          {/*ADMIN*/}
          <Route path="/carreras" element={<Carreras />} />
          <Route path="/carreras/:id" element={<DetalleCarrera />} />

          <Route path="/administracion" element={<Administracion />} />
          <Route path="/administracion/usuarios/:id/rol" element={<RolesPermisos />} />
          <Route path="/administracion/categorias" element={<ConfiguracionClasificaciones />} />
          <Route path="/administracion/categorias/nueva" element={<NuevaCategoria />} />
          <Route path="/administracion/categorias/:id/editar" element={<NuevaCategoria />} />
          <Route path="/certificados" element={<Certificates onEditorChange={() => { }} />} />

        </Route>

      </Routes>
    </AuthProvider>
  );
}