import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarCitas } from '../api/citasApi';
import { listarNotificaciones } from '../api/notificacionesApi';
import { EstadoCarga } from '../componentes/comunes/EstadoCarga';
import { MensajeEstado } from '../componentes/comunes/MensajeEstado';
import { InsigniaEstado } from '../componentes/comunes/InsigniaEstado';
import { fechaHoraEspanola } from '../utilidades/fechas';
import { usarAutenticacion } from '../hooks/usarAutenticacion';

export function PaginaPanel() {
  const { sesion } = usarAutenticacion();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let activo = true;
    Promise.all([listarCitas(), listarNotificaciones()])
      .then(([citas, notificaciones]) => activo && setDatos({ citas, notificaciones }))
      .catch((fallo) => activo && setError(fallo.mensaje || fallo.message));
    return () => { activo = false; };
  }, []);
  if (!datos && !error) return <EstadoCarga texto="Preparando el panel…" />;
  const proximas = (datos?.citas || []).filter((cita) => cita.estado === 'CONFIRMADA' && new Date(cita.fechaInicio) >= new Date()).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)).slice(0, 5);
  const pendientes = (datos?.notificaciones || []).filter((notificacion) => !notificacion.leida);
  return <section className="contenido-panel"><div className="encabezado-pagina"><div><p className="sobrelinea">Vista general</p><h1>Panel de gestión</h1><p>La agenda de {sesion?.profesional?.nombre || sesion?.usuario}, de un vistazo.</p></div></div><MensajeEstado tipo="error">{error}</MensajeEstado>{datos && <><div className="rejilla-metricas"><article className="metrica"><span>Próximas citas</span><strong>{proximas.length}</strong><Link to="citas">Abrir agenda</Link></article><article className="metrica"><span>Notificaciones pendientes</span><strong>{pendientes.length}</strong><Link to="notificaciones">Revisar avisos</Link></article><article className="metrica"><span>Total de citas</span><strong>{datos.citas.length}</strong><span>En el historial disponible</span></article></div><div className="tarjeta"><div className="cabecera-seccion"><h2>Próximas citas</h2><Link to="citas">Ver todas</Link></div>{proximas.length ? <div className="lista-agenda">{proximas.map((cita) => <article key={cita.id}><time>{fechaHoraEspanola(cita.fechaInicio)}</time><div><strong>{cita.servicio}</strong><span>con {cita.profesional}</span></div><InsigniaEstado estado={cita.estado} /></article>)}</div> : <p className="texto-secundario">No hay próximas citas registradas.</p>}</div></>}</section>;
}
