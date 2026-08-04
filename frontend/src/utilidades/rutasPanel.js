export function rutaBasePanel(sesion) {
  const identidad = sesion?.profesional?.alias || sesion?.usuario || 'mimi';
  return `/barberia-mimi-dashboard/${encodeURIComponent(identidad)}`;
}
