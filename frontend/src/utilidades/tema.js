const CLAVE_TEMA = 'barberia-mimi-tema';

export function obtenerTemaInicial() {
  const guardado = window.localStorage.getItem(CLAVE_TEMA);
  if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
}

export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  document.documentElement.style.colorScheme = tema === 'claro' ? 'light' : 'dark';
  window.localStorage.setItem(CLAVE_TEMA, tema);
}
