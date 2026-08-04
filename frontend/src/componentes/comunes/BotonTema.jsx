import { useEffect, useState } from 'react';
import { aplicarTema, obtenerTemaInicial } from '../../utilidades/tema';

export function BotonTema({ compacto = false }) {
  const [tema, setTema] = useState(obtenerTemaInicial);
  useEffect(() => aplicarTema(tema), [tema]);
  const siguiente = tema === 'oscuro' ? 'claro' : 'oscuro';
  return <button type="button" className={`boton-tema ${compacto ? 'compacto' : ''}`} aria-label={`Activar modo ${siguiente}`} onClick={() => setTema(siguiente)}><span aria-hidden="true">{tema === 'oscuro' ? '☀' : '☾'}</span>{!compacto && <span>Modo {siguiente}</span>}</button>;
}
