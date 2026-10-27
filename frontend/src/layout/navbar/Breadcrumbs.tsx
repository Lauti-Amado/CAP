import { useLocation, Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { ChevronRight } from 'lucide-react';
import './Breadcrumbs.css';

const customNames: Record<string, string> = {
  'home': 'HOME',
  'clasificador': 'CLASIFICADOR',
  'administrador': 'ADMINISTRADOR',
};

const formatearNombreRuta = (segment: string) => {
  if (customNames[segment]) {
    return customNames[segment];
  }
  return segment
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
        const isClickable = !isRoot && !isLast;
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;

        return (
          <li 
            key={path} 
            className={`breadcrumb-item d-flex align-items-center lh-1 ${isLast ? 'active' : ''}`}
            aria-current={isLast ? 'page' : undefined}
          >
            {index > 0 && (
              index === 1 ? (
                <span className="cap-separator pipe">|</span>
              ) : (
                <ChevronRight className="cap-separator chevron" size={18} strokeWidth={2.5} />
              )
            )}

            {isClickable ? (
              <Link to={path} className="cap-link d-flex align-items-center lh-1">
                {formatearNombreRuta(segment)}
              </Link>
            ) : (
              <span className={`${isRoot ? 'cap-root' : 'cap-current'} d-flex align-items-center lh-1`}>
                {formatearNombreRuta(segment)}
              </span>
            )}
          </li>
        );
      })}
    </Breadcrumb>
  );
}