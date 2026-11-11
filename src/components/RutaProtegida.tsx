import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../state/auth.store.js';
import { Loading } from './Loading.js';

/** Envuelve las rutas privadas: sin token redirige a login. */
export function RutaProtegida() {
  const token = useAuth((estado) => estado.token);
  const cargando = useAuth((estado) => estado.cargando);

  if (cargando) {
    return (
      <div className="auth">
        <Loading texto="Verificando sesión…" />
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
}
