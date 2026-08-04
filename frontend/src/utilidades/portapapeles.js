function copiarConSeleccion(texto) {
  const campoTemporal = document.createElement('textarea');
  campoTemporal.value = texto;
  campoTemporal.setAttribute('readonly', '');
  campoTemporal.style.position = 'fixed';
  campoTemporal.style.inset = '0 auto auto 0';
  campoTemporal.style.opacity = '0';
  document.body.appendChild(campoTemporal);
  campoTemporal.focus();
  campoTemporal.select();
  campoTemporal.setSelectionRange(0, texto.length);

  try {
    if (typeof document.execCommand !== 'function' || !document.execCommand('copy')) {
      throw new Error('El navegador no ha permitido copiar el texto.');
    }
  } finally {
    campoTemporal.remove();
  }
}

export async function copiarAlPortapapeles(texto) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto);
      return;
    } catch {
      // Algunos navegadores bloquean esta API al acceder desde una IP local por HTTP.
    }
  }

  copiarConSeleccion(texto);
}
