import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarCitas } from "../api/citasApi";
import { listarNotificaciones } from "../api/notificacionesApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";

function fechaLocal() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function PaginaPanel() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let activo = true;
    Promise.all([listarCitas(), listarNotificaciones()])
      .then(([citas, notificaciones]) => activo && setDatos({ citas, notificaciones }))
      .catch((fallo) => activo && setError(fallo.mensaje || fallo.message));
    return () => { activo = false; };
  }, []);
  if (!datos && !error) return <EstadoCarga texto="Preparando el panel…" />;
  const hoy = fechaLocal();
  const citasHoy = (datos?.citas || []).filter((cita) => cita.fechaInicio.startsWith(hoy) && ["CONFIRMADA", "COMPLETADA"].includes(cita.estado)).length;
  const proximas = (datos?.citas || []).filter((cita) => cita.estado === "CONFIRMADA" && cita.fechaInicio.slice(0, 10) > hoy).length;
  const pendientes = (datos?.notificaciones || []).filter((notificacion) => !notificacion.leida).length;
  return <section className="contenido-panel">
    <div className="encabezado-pagina"><div><p className="sobrelinea">Resumen</p><h1>Panel de gestión</h1></div></div>
    <MensajeEstado tipo="error">{error}</MensajeEstado>
    {datos && <div className="rejilla-metricas resumen-principal">
      <Link className="metrica metrica-enlace" to="citas?fecha=hoy"><span>Citas de hoy</span><strong>{citasHoy}</strong><small>Abrir las citas de hoy</small></Link>
      <Link className="metrica metrica-enlace" to="citas?vista=completa"><span>Próximas citas</span><strong>{proximas}</strong><small>Consultar la agenda futura</small></Link>
      <Link className="metrica metrica-enlace" to="notificaciones"><span>Notificaciones pendientes</span><strong>{pendientes}</strong><small>Revisar notificaciones</small></Link>
    </div>}
  </section>;
}
