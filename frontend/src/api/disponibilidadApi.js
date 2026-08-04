import { peticion } from './clienteHttp';
export const consultarDisponibilidad = (slug, profesionalId, servicioId, fecha, signal) => peticion(`/api/barberias/${slug}/disponibilidad?profesionalId=${encodeURIComponent(profesionalId)}&servicioId=${encodeURIComponent(servicioId)}&fecha=${encodeURIComponent(fecha)}`, { signal });
export const consultarCalendarioDisponibilidad = (slug, profesionalId, servicioId, signal) => {
  const parametros = new URLSearchParams({ profesionalId: String(profesionalId) });
  if (servicioId) parametros.set('servicioId', String(servicioId));
  return peticion(`/api/barberias/${slug}/calendario-disponibilidad?${parametros}`, { signal });
};
