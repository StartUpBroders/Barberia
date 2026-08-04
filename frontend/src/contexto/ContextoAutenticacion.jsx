import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { cerrarSesion as cerrarSesionApi, consultarSesion, iniciarSesion as iniciarSesionApi } from '../api/autenticacionApi';

export const ContextoAutenticacion = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [sesion, setSesion] = useState(null);
  const [comprobando, setComprobando] = useState(true);
  const comprobarSesion = useCallback(async () => { setComprobando(true); try { setSesion(await consultarSesion()); } catch { setSesion(null); } finally { setComprobando(false); } }, []);
  useEffect(() => { comprobarSesion(); }, [comprobarSesion]);
  useEffect(() => { const caducada = () => setSesion(null); window.addEventListener('sesion-caducada', caducada); return () => window.removeEventListener('sesion-caducada', caducada); }, []);
  const iniciarSesion = useCallback(async (credenciales) => { const nuevaSesion = await iniciarSesionApi(credenciales); setSesion(nuevaSesion); return nuevaSesion; }, []);
  const cerrarSesion = useCallback(async () => { try { await cerrarSesionApi(); } finally { setSesion(null); } }, []);
  const valor = useMemo(() => ({ sesion, autenticado: Boolean(sesion?.autenticado), comprobando, iniciarSesion, cerrarSesion, comprobarSesion }), [sesion, comprobando, iniciarSesion, cerrarSesion, comprobarSesion]);
  return <ContextoAutenticacion.Provider value={valor}>{children}</ContextoAutenticacion.Provider>;
}
