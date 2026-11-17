import { useLocation, Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { ChevronRight } from 'lucide-react';
import { useCarreraSeleccion, type SeccionClasificador } from '../../context/SeleccionarCarreraContext';
import { useCarrera } from '../../context/CarreraContext';
import { slugCarrera } from '../../utils/carrera';
import './Breadcrumbs.css';

const customNames: Record<string, string> = {
  'home': 'HOME',
  'clasificador': 'CLASIFICADOR',
  'administrador': 'ADMINISTRADOR',
  'entrega-kits': 'Entrega de Kits',
  'clasificaciones': 'Clasificaciones',
  'resultados': 'Resultados',
  'grand-prix': 'Grand Prix',
  'seleccionar-carrera': 'Seleccionar carrera',
  'buscar-corredor': 'Buscar corredor',
  'dashboard-clasificaciones': 'Dashboard de clasificaciones',
  'tiempo-real': 'Tiempo real',
  'inscripciones': 'Inscripciones',
  'nueva': 'Nueva inscripción',
};

const rutasFijasClasificacion = ['dashboard-clasificaciones', 'tiempo-real', 'manual'];

const defaultSubrutas: Record<string, string> = {
  'entrega-kits': 'buscar-corredor',
  'clasificaciones': 'dashboard-clasificaciones',
  'resultados': 'resultado',
};

const formatearNombreRuta = (segment: string) => {
  const decodedSegment = decodeURIComponent(segment);

  if (customNames[decodedSegment]) {
    return customNames[decodedSegment];
  }
  return decodedSegment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface BreadcrumbCrumb {
  key: string;
  label: string;
  pathToNavigate?: string;
  isClickable?: boolean;
  isRoot?: boolean;
  onClick?: () => void;
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { limpiarCarrera } = useCarreraSeleccion();
  const { carreras } = useCarrera();

  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  if (pathSegments.length === 0) {
    return null;
  }

  const rootSection = pathSegments[0]?.toLowerCase();
  const esClasificador = rootSection === 'clasificador';
  const seccion = pathSegments[1] as SeccionClasificador | undefined;
  const esSeccionConCarrera =
    esClasificador &&
    seccion &&
    ['entrega-kits', 'clasificaciones', 'resultados'].includes(seccion);

  const crumbs: BreadcrumbCrumb[] = [];

  // 1. Root (HOME, CLASIFICADOR, ADMINISTRADOR)
  crumbs.push({
    key: 'root',
    label: formatearNombreRuta(pathSegments[0]),
    isRoot: true,
    isClickable: false,
  });

  if (pathSegments.length > 1) {
    // 2. Sección (ej: Entrega de Kits, Clasificaciones, etc.)
    crumbs.push({
      key: 'seccion',
      label: formatearNombreRuta(pathSegments[1]),
      isClickable: false,
    });

    if (esSeccionConCarrera && pathSegments.length > 2) {
      const carreraSegment = pathSegments[2];

      if (carreraSegment === 'seleccionar-carrera') {
        // En la pantalla de selección de carrera
        crumbs.push({
          key: 'seleccionar-carrera-activa',
          label: 'Seleccionar carrera',
          isClickable: false,
        });
      } else {
        // Adentro de una carrera (ej: /clasificador/entrega-kits/las-tres-ciudades/...)
        // Paso previo: "Seleccionar carrera" como enlace para cambiarla
        crumbs.push({
          key: 'seleccionar-carrera-link',
          label: 'Seleccionar carrera',
          isClickable: true,
          pathToNavigate: `/clasificador/${seccion}/seleccionar-carrera`,
          onClick: () => limpiarCarrera(seccion),
        });

        // Obtener el nombre real de la carrera
        const carreraEncontrada = carreras.find(
          (c) => slugCarrera(c.nombre).toLowerCase() === decodeURIComponent(carreraSegment).toLowerCase()
        );
        const nombreCarrera = carreraEncontrada ? carreraEncontrada.nombre : formatearNombreRuta(carreraSegment);

        const rutaDefecto = defaultSubrutas[seccion];
        const subrutaActual = pathSegments[3];
        const estaEnRutaDefecto = pathSegments.length === 4 && subrutaActual === rutaDefecto;

        if (estaEnRutaDefecto || pathSegments.length === 3) {
          // El componente principal (ej: buscar-corredor) es la vista actual
          crumbs.push({
            key: 'carrera-activa',
            label: nombreCarrera,
            isClickable: false,
          });
        } else {
          // Hay subpáginas adentro de la carrera (ej: /35123456 o /inscripciones)
          // El nombre de la carrera lleva a su vista principal (ej: buscar-corredor)
          crumbs.push({
            key: 'carrera-link',
            label: nombreCarrera,
            isClickable: true,
            pathToNavigate: `/clasificador/${seccion}/${carreraSegment}/${rutaDefecto}`,
          });

          // Subpáginas restantes
          for (let i = 3; i < pathSegments.length; i++) {
            const seg = pathSegments[i];
            const isLast = i === pathSegments.length - 1;

            let label = formatearNombreRuta(seg);
            if (seccion === 'clasificaciones' && i === 3 && !rutasFijasClasificacion.includes(seg)) {
              label = 'Modificar clasificación';
            }

            crumbs.push({
              key: `sub-${i}-${seg}`,
              label,
              isClickable: !isLast,
              pathToNavigate: `/${pathSegments.slice(0, i + 1).join('/')}`,
            });
          }
        }
      }
    } else {
      // Rutas estándar (Administrador, Home, Grand Prix, etc.)
      for (let i = 2; i < pathSegments.length; i++) {
        const seg = pathSegments[i];
        const isLast = i === pathSegments.length - 1;

        let label = formatearNombreRuta(seg);
        const esModificarCorredorAdmin =
          pathSegments[0] === 'administrador' &&
          pathSegments[1] === 'carreras' &&
          pathSegments[3] === 'clasificacion' &&
          i === 4 &&
          seg !== 'completa';

        if (esModificarCorredorAdmin) {
          label = 'Modificar clasificación';
        }

        crumbs.push({
          key: `std-${i}-${seg}`,
          label,
          isClickable: !isLast,
          pathToNavigate: `/${pathSegments.slice(0, i + 1).join('/')}`,
        });
      }
    }
  }

  return (
    <Breadcrumb
      className="cap-breadcrumbs"
      listProps={{ className: 'd-flex align-items-center m-0 p-0 fs-5' }}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isClickable = Boolean(crumb.isClickable && crumb.pathToNavigate);

        return (
          <li
            key={crumb.key}
            className={`breadcrumb-item d-flex align-items-center lh-1 ${!isClickable ? 'active' : ''}`}
            aria-current={isLast && !isClickable ? 'page' : undefined}
          >
            {index > 0 && (
              index === 1 ? (
                <span className="cap-separator pipe">|</span>
              ) : (
                <ChevronRight className="cap-separator chevron" size={18} strokeWidth={2.5} />
              )
            )}

            {isClickable ? (
              <Link
                to={crumb.pathToNavigate!}
                className="cap-link d-flex align-items-center lh-1"
                onClick={crumb.onClick}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={`${crumb.isRoot ? 'cap-root' : 'cap-current'} d-flex align-items-center lh-1`}>
                {crumb.label}
              </span>
            )}
          </li>
        );
      })}
    </Breadcrumb>
  );
}
