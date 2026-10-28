import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import type { Rol } from '../types/usuario';
import Spinner from 'react-bootstrap/Spinner';

export function PrivateRoute({ roles }: { roles?: Rol[] }) {
  const { usuario, cargando, tieneRol } = useAuth();

  // 1. ¿Ya sé quién sos?
  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  // 2. ¿Sos alguien? (401)
  if (!usuario) return <Navigate to="/" replace />;

  // 3. ¿Podés? (403)
  if (roles && roles.length > 0) {
    const tienePermiso = roles.some(rolRequerido => tieneRol(rolRequerido));
    
    if (!tienePermiso) return <Navigate to="/" replace />;
  }

  // Sí: pasá
  return <Outlet />;
}