import { useEffect, useMemo, useState } from 'react';
import { listarNotificaciones, marcarNotificacionLeida } from '../api/notificacionesApi';
import { EstadoCarga } from '../componentes/comunes/EstadoCarga';
import { EstadoVacio } from '../componentes/comunes/EstadoVacio';
import { MensajeEstado } from '../componentes/comunes/MensajeEstado';
import { fechaHoraEspanola } from '../utilidades/fechas';
export function PaginaNotificaciones() {
  const [lista, setLista] = useState([]); const [soloPendientes, setSoloPendientes] = useState(false); const [cargando, setCargando] = useState(true); const [error, setError] = useState('');
  const cargar = async () => { setCargando(true); try { setLista(await listarNotificaciones()); } catch (fallo) { setError(fallo.mensaje || fallo.message); } finally { setCargando(false); } };
  useEffect(() => { cargar(); }, []);
  const visibles = useMemo(() => lista.filter((item) => !soloPendientes || !item.leida).sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)), [lista, soloPendientes]);
  const marcar = async (id) => { try { const actualizada = await marcarNotificacionLeida(id); setLista((actuales) => actuales.map((item) => item.id === id ? actualizada : item)); } catch (fallo) { setError(fallo.mensaje || fallo.message); } };
  return <section className="contenido-panel"><div className="encabezado-pagina"><div><p className="sobrelinea">Avisos</p><h1>Notificaciones</h1><p>Novedades relacionadas con la agenda y sus citas.</p></div><label className="opcion-linea"><input type="checkbox" checked={soloPendientes} onChange={(e) => setSoloPendientes(e.target.checked)} /> Solo pendientes</label></div><MensajeEstado tipo="error">{error}</MensajeEstado>{cargando ? <EstadoCarga /> : visibles.length === 0 ? <EstadoVacio titulo="Todo al día" texto="No hay notificaciones que mostrar." /> : <div className="lista-notificaciones">{visibles.map((item) => <article className={`tarjeta notificacion ${!item.leida ? 'no-leida' : ''}`} key={item.id}><div className="punto-notificacion" aria-hidden="true" /><div><div className="notificacion-meta"><span>{item.tipo.replaceAll('_', ' ')}</span><time>{fechaHoraEspanola(item.fechaCreacion)}</time></div><h2>{item.titulo}</h2><p>{item.mensaje}</p></div>{!item.leida && <button onClick={() => marcar(item.id)}>Marcar como leída</button>}</article>)}</div>}</section>;
}
