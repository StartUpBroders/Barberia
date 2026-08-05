export function rutaBasePanel(sesion) {
  const identidad = sesion?.profesional?.alias || sesion?.usuario || 'mimi';
  return `/barberia-mimi-dashboard/${encodeURIComponent(identidad)}`;
}

export function rutaInicioPanel(sesion) {
  const base = rutaBasePanel(sesion);
  return sesion?.rol === 'BARBERO' ? `${base}/horarios` : base;
}
