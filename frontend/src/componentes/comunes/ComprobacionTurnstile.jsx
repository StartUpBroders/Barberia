import { useEffect, useRef, useState } from 'react';

const URL_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const CLAVE_PRUEBA_ADMINISTRADA = '1x00000000000000000000AA';
const TOKEN_PRUEBA = 'XXXX.DUMMY.TOKEN.XXXX';
let cargaScript;

function cargarTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (cargaScript) return cargaScript;
  cargaScript = new Promise((resolver, rechazar) => {
    const existente = document.querySelector(`script[src="${URL_SCRIPT}"]`);
    const script = existente || document.createElement('script');
    const comprobar = () => window.turnstile ? resolver(window.turnstile) : rechazar(new Error('Turnstile no está disponible.'));
    script.addEventListener('load', comprobar, { once: true });
    script.addEventListener('error', () => rechazar(new Error('No se ha podido cargar Turnstile.')), { once: true });
    if (!existente) {
      script.src = URL_SCRIPT;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  return cargaScript;
}

export function ComprobacionTurnstile({ onCambio, reinicio }) {
  const contenedor = useRef(null);
  const widget = useRef(null);
  const [fallo, setFallo] = useState('');
  const claveSitio = import.meta.env.VITE_TURNSTILE_SITE_KEY || (import.meta.env.DEV ? CLAVE_PRUEBA_ADMINISTRADA : '');

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      onCambio(TOKEN_PRUEBA);
      return undefined;
    }
    if (!claveSitio) {
      setFallo('La verificación de seguridad no está configurada.');
      onCambio('');
      return undefined;
    }
    let cancelado = false;
    cargarTurnstile()
      .then((turnstile) => {
        if (cancelado || !contenedor.current) return;
        widget.current = turnstile.render(contenedor.current, {
          sitekey: claveSitio,
          appearance: 'interaction-only',
          theme: 'auto',
          language: 'es',
          callback: (token) => { setFallo(''); onCambio(token); },
          'expired-callback': () => onCambio(''),
          'error-callback': () => { setFallo('No se ha podido completar la verificación.'); onCambio(''); },
        });
      })
      .catch(() => { if (!cancelado) { setFallo('No se ha podido cargar la verificación de seguridad.'); onCambio(''); } });
    return () => {
      cancelado = true;
      if (widget.current !== null && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [claveSitio, onCambio]);

  useEffect(() => {
    if (widget.current !== null && window.turnstile) {
      onCambio('');
      window.turnstile.reset(widget.current);
    }
  }, [reinicio, onCambio]);

  return <div className="comprobacion-turnstile" aria-live="polite">
    <div ref={contenedor} />
    {fallo && <small className="campo-error">{fallo} Recarga la página para intentarlo de nuevo.</small>}
  </div>;
}
