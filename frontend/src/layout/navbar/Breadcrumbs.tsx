import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import './Breadcrumbs.css'

type BreadcrumbItem = { label: string; to?: string };

const inicio = { label: 'Seleccionar carrera', to: '/seleccionar-carrera' };
const clasificacion = { label: 'Clasificación', to: '/dashboard-clasificacion' };

// Jerarquía de las pantallas existentes, independiente del historial de navegación.
const breadcrumbsPorRuta: Record<string, BreadcrumbItem[]> = {
  '/seleccionar-carrera': [{ label: inicio.label }],
  '/carreras': [inicio, { label: 'Carreras' }],
  '/dashboard-clasificacion': [inicio, { label: clasificacion.label }],
  '/clasificacion-tiempo-real': [inicio, clasificacion, { label: 'Tiempo real' }],
  '/resultados': [inicio, { label: 'Resultados' }],
  '/entrega-kits': [inicio, { label: 'Entrega de kits' }],
  '/grand-prix': [inicio, { label: 'Grand Prix' }],
  '/certificados': [inicio, { label: 'Certificados' }],
  '/dashboard': [{ label: 'CAP Gestión' }, { label: 'Dashboard' }],
  '/administracion': [{ label: 'CAP Gestión' }, { label: 'Administración' }, { label: 'Panel Principal' },],
  '/administracion/usuarios/rol': [{ label: 'CAP Gestión' }, { label: 'Administración', to: '/administracion' }, { label: 'Roles y Permisos' },],
  '/administracion/categorias': [{ label: 'CAP Gestión' }, { label: 'Panel de administración', to: '/administracion' }, { label: 'Clasificación carrera' },],
  '/administracion/categorias/nueva': [{ label: 'CAP Gestión' }, { label: 'Clasificación', to: '/administracion/categorias' }, { label: 'Crear Clasificación' },],                                                                  // NUEVO
  '/administracion/categorias/editar': [{ label: 'CAP Gestión' }, { label: 'Clasificación', to: '/administracion/categorias' }, { label: 'Editar Clasificación' },], 
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();

  const ruta = (pathname.replace(/\/+$/, '') || '/')
  .replace(/\/usuarios\/[^/]+\/rol$/, '/usuarios/rol')
  .replace(/\/categorias\/[^/]+\/editar$/, '/categorias/editar');
  
  const items = breadcrumbsPorRuta[ruta] ?? [];

  return (
    <nav className="cap-breadcrumbs" aria-label="Ruta de navegación">
      <ol>
        {items.map((item, index) => (
          <li key={item.label}>
            {index > 0 && <ChevronRight size={16} aria-hidden="true" />}
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
