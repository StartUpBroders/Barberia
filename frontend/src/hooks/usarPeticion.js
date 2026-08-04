import { useCallback, useState } from 'react';
export function usarPeticion() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const ejecutar = useCallback(async (operacion) => { setCargando(true); setError(null); try { return await operacion(); } catch (fallo) { setError(fallo); throw fallo; } finally { setCargando(false); } }, []);
  return { cargando, error, setError, ejecutar };
}
