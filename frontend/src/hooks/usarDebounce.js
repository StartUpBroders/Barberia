import { useEffect, useState } from 'react';
export function usarDebounce(valor, retraso = 300) { const [estable, setEstable] = useState(valor); useEffect(() => { const temporizador = setTimeout(() => setEstable(valor), retraso); return () => clearTimeout(temporizador); }, [valor, retraso]); return estable; }
