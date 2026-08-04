import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usarAutenticacion } from '../hooks/usarAutenticacion';
import { EstadoCarga } from '../componentes/comunes/EstadoCarga';
export function RutaProtegida() { const { autenticado, comprobando } = usarAutenticacion(); const ubicacion = useLocation(); if (comprobando) return <main className="pagina-centrada"><EstadoCarga texto="Comprobando la sesión…" /></main>; return autenticado ? <Outlet /> : <Navigate to="/barber-login" replace state={{ desde: ubicacion.pathname }} />; }
