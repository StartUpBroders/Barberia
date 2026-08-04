const OPCIONES_FECHA = { day: '2-digit', month: '2-digit', year: 'numeric' };
const OPCIONES_HORA = { hour: '2-digit', minute: '2-digit', hour12: false };
export function fechaEspanola(valor) { return valor ? new Intl.DateTimeFormat('es-ES', OPCIONES_FECHA).format(new Date(`${valor.slice(0, 10)}T12:00:00`)) : '—'; }
export function fechaHoraEspanola(valor) { if (!valor) return '—'; const fecha = new Date(valor); return `${new Intl.DateTimeFormat('es-ES', OPCIONES_FECHA).format(fecha)} · ${new Intl.DateTimeFormat('es-ES', OPCIONES_HORA).format(fecha)}`; }
export function horaEspanola(valor) { if (!valor) return '—'; return valor.includes('T') ? valor.split('T')[1].slice(0, 5) : valor.slice(0, 5); }
export function fechaMinimaReserva() { const fecha = new Date(); fecha.setDate(fecha.getDate() + 1); return [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'), String(fecha.getDate()).padStart(2, '0')].join('-'); }
export const diasSemana = { MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles', THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo' };
