import { useLocation, Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { ChevronRight } from 'lucide-react';
import './Breadcrumbs.css';

const customNames: Record<string, string> = {
  'home': 'HOME',
  'clasificador': 'CLASIFICADOR',
  'administrador': 'ADMINISTRADOR',
  'entrega-kits': 'Entrega de Kits',
};

const formatearNombreRuta = (segment: string) => {
  const decodedSegment = decodeURIComponent(segment);

  if (customNames[decodedSegment]) {
    return customNames[decodedSegment];
  }
  return decodedSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  if (pathSegments.length === 0) {
    return null;
  }

  const rootSections = ['home', 'clasificador', 'administrador'];

  return (
    <Breadcrumb
      className="cap-breadcrumbs"
      listProps={{ className: 'd-flex align-items-center m-0 p-0 fs-5' }}
    >
      {pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;
        const isRoot = rootSections.includes(segment.toLowerCase());
        const isSeccion = index === 1;
        const isCarreraSegment = index === 2 && pathSegments[0] === 'clasificador';
        let isClickable = false;
        let pathToNavigate = `/${pathSegments.slice(0, index + 1).join('/')}`;

        if (isCarreraSegment) {
          isClickable = true;
          pathToNavigate = `/${pathSegments[0]}/${pathSegments[1]}/seleccionar-carrera`;
        } else if (!isRoot && !isSeccion && !isLast) {
          isClickable = true;
        }

        const nombreMostrado = formatearNombreRuta(segment);

        return (
          <li
            key={pathToNavigate + index}
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
                to={pathToNavigate}
                className="cap-link d-flex align-items-center lh-1"
                title={isCarreraSegment ? "Haz clic para cambiar de carrera" : undefined}
              >
                {nombreMostrado}
              </Link>
            ) : (
              <span className={`${isRoot ? 'cap-root' : 'cap-current'} d-flex align-items-center lh-1`}>
                {nombreMostrado}
              </span>
            )}
          </li>
        );
      })}
    </Breadcrumb>
  );
}