import { Navigate, Outlet } from 'react-router-dom';
import { usarAutenticacion } from '../hooks/usarAutenticacion';
import { rutaBasePanel } from '../utilidades/rutasPanel';

export function RutaPropietario() {
  const { sesion } = usarAutenticacion();
  return sesion?.rol === 'PROPIETARIO' ? <Outlet /> : <Navigate to={rutaBasePanel(sesion)} replace />;
}
