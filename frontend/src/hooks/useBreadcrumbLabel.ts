import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BreadcrumbContext } from '../context/BreadcrumbContext';

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumb debe usarse dentro de <BreadcrumbProvider>');
  return ctx;
}

/**
 * Registra un título dinámico para el segmento del breadcrumb correspondiente a la ruta actual
 * y lo limpia automáticamente al desmontar o cambiar de ruta.
 */
export function useBreadcrumbLabel(label: string | null | undefined) {
  const { pathname } = useLocation();
  const { setLabel, clearLabel } = useBreadcrumb();

  useEffect(() => {
    if (label) {
      setLabel(pathname, label);
    } else {
      clearLabel(pathname);
    }

    return () => {
      clearLabel(pathname);
    };
  }, [pathname, label, setLabel, clearLabel]);
}
