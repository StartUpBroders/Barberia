import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cancelarCitaAdministrativa, listarCitas } from "../api/citasApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { EstadoVacio } from "../componentes/comunes/EstadoVacio";
import { InsigniaEstado } from "../componentes/comunes/InsigniaEstado";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";
import { fechaHoraEspanola } from "../utilidades/fechas";

const ESTADOS_VISIBLES = new Set(["CONFIRMADA", "COMPLETADA"]);
const ESTADOS_AGENDA_COMPLETA = new Set(["CONFIRMADA", "COMPLETADA"]);
const formatoDia = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const DIAS_POR_PERIODO = 7;
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function fechaLocal(fecha = new Date()) { const desplazada = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000); return desplazada.toISOString().slice(0, 10); }
function fechaDesdeIso(valor) { return new Date(`${valor}T12:00:00`); }
function sumarDias(fecha, cantidad) { const nueva = new Date(fecha); nueva.setDate(nueva.getDate() + cantidad); return nueva; }
function tituloFecha(iso) { return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(fechaDesdeIso(iso)); }
function fechaPeriodo(fecha) { return fecha ? `${fecha.getDate()}/${MESES[fecha.getMonth()]}` : ""; }
function hora(fechaHora) { return fechaHora?.slice(11, 16); }

export function PaginaCitas() {
  const [parametros] = useSearchParams();
  const hoy = fechaLocal();
  const fechaInicial = parametros.get("fecha") && parametros.get("fecha") !== "hoy" ? parametros.get("fecha") : hoy;
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaInicial);
  const [inicioPeriodo, setInicioPeriodo] = useState(() => fechaDesdeIso(fechaInicial));
  const [verAgendaCompleta, setVerAgendaCompleta] = useState(parametros.get("vista") === "completa");
  const [detalle, setDetalle] = useState(null);

  const cargar = async () => {
    setCargando(true); setError("");
    try { setCitas(await listarCitas()); }
    catch (fallo) { setError(fallo.mensaje || fallo.message); }
    finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);

  const diasPeriodo = useMemo(() => Array.from({ length: DIAS_POR_PERIODO }, (_, indice) => {
    const fecha = sumarDias(inicioPeriodo, indice); const iso = fechaLocal(fecha);
    return { iso, fecha, cantidad: citas.filter((cita) => ESTADOS_VISIBLES.has(cita.estado) && cita.fechaInicio.startsWith(iso)).length };
  }), [inicioPeriodo, citas]);
  const citasVisibles = useMemo(() => citas.filter((cita) => verAgendaCompleta
    ? cita.fechaInicio.slice(0, 10) >= hoy && ESTADOS_AGENDA_COMPLETA.has(cita.estado)
    : cita.fechaInicio.startsWith(fechaSeleccionada) && ESTADOS_VISIBLES.has(cita.estado))
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)), [citas, fechaSeleccionada, hoy, verAgendaCompleta]);
  const grupos = useMemo(() => Object.entries(citasVisibles.reduce((resultado, cita) => {
    const fecha = cita.fechaInicio.slice(0, 10); resultado[fecha] = [...(resultado[fecha] || []), cita]; return resultado;
  }, {})).sort(([a], [b]) => a.localeCompare(b)), [citasVisibles]);

  const cambiarPeriodo = (periodos) => { const nueva = sumarDias(inicioPeriodo, periodos * DIAS_POR_PERIODO); setInicioPeriodo(nueva); setFechaSeleccionada(fechaLocal(nueva)); };
  const volverAHoy = () => { setInicioPeriodo(fechaDesdeIso(hoy)); setFechaSeleccionada(hoy); setVerAgendaCompleta(false); };
  const cancelar = async (cita) => {
    if (!window.confirm(`¿Cancelar la cita de ${cita.nombreCliente || "este cliente"}? Esta acción no puede deshacerse.`)) return;
    setError("");
    try { await cancelarCitaAdministrativa(cita.id); setDetalle(null); setExito("La cita se ha cancelado."); await cargar(); }
    catch (fallo) { setError(fallo.mensaje || fallo.message); }
  };

  return <section className="contenido-panel pagina-citas">
    <div className="encabezado-pagina"><div><p className="sobrelinea">Agenda</p><h1>Citas</h1></div></div>
    <MensajeEstado tipo="error">{error}</MensajeEstado><MensajeEstado tipo="exito">{exito}</MensajeEstado>
    <div className="tarjeta controles-agenda"><div className="acciones-agenda-fechas">
      {!verAgendaCompleta && <div className="navegacion-reserva navegacion-semana-agenda"><button type="button" aria-label="Periodo anterior" onClick={() => cambiarPeriodo(-1)}>‹</button><strong>{fechaPeriodo(diasPeriodo[0]?.fecha)} - {fechaPeriodo(diasPeriodo[DIAS_POR_PERIODO - 1]?.fecha)}</strong><button type="button" aria-label="Periodo siguiente" onClick={() => cambiarPeriodo(1)}>›</button></div>}
      <button className="boton boton-secundario" aria-pressed={verAgendaCompleta} onClick={() => setVerAgendaCompleta((valor) => !valor)}>{verAgendaCompleta ? "Volver al periodo" : "Ver agenda completa"}</button>
      <button className="boton boton-secundario" type="button" onClick={volverAHoy}>Volver a hoy</button>
    </div>{!verAgendaCompleta && <div className="dias-reserva dias-agenda" role="group" aria-label="Días desde hoy">{diasPeriodo.map((dia) => <button key={dia.iso} className={fechaSeleccionada === dia.iso ? "seleccionado" : ""} aria-pressed={fechaSeleccionada === dia.iso} onClick={() => setFechaSeleccionada(dia.iso)}><span>{formatoDia.format(dia.fecha).replace(".", "")}</span><strong>{dia.fecha.getDate()}</strong><small>{dia.cantidad} {dia.cantidad === 1 ? "cita" : "citas"}</small></button>)}</div>}
    </div>
    {cargando ? <EstadoCarga texto="Cargando citas…" /> : grupos.length === 0 ? <EstadoVacio titulo="Sin citas" texto={verAgendaCompleta ? "No hay citas desde hoy en adelante." : `No hay citas el ${tituloFecha(fechaSeleccionada)}.`} /> : <div className="grupos-citas">{grupos.map(([fecha, citasDia]) => <section key={fecha} className="grupo-dia-citas"><header><div><p className="sobrelinea">{fecha === hoy ? "Hoy" : "Agenda del día"}</p><h2>{tituloFecha(fecha)}</h2></div><span>{citasDia.length} {citasDia.length === 1 ? "cita" : "citas"}</span></header><div className="lista-citas-rapida">{citasDia.map((cita) => <article className={`cita-rapida ${cita.estado.toLowerCase()}`} key={cita.id}><time dateTime={cita.fechaInicio}>{hora(cita.fechaInicio)}</time><strong className="nombre-cliente-cita">{cita.nombreCliente || "Cliente"}</strong><InsigniaEstado estado={cita.estado} /><div className="acciones-cita"><button onClick={() => setDetalle(cita)}>Ver ficha</button></div></article>)}</div></section>)}</div>}
    {detalle && <div className="modal-fondo" role="presentation" onMouseDown={() => setDetalle(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-detalle" onMouseDown={(evento) => evento.stopPropagation()}><button className="cerrar-modal" aria-label="Cerrar detalle" onClick={() => setDetalle(null)}>×</button><p className="sobrelinea">Ficha del cliente</p><h2 id="titulo-detalle">Detalle de la cita</h2><dl className="detalle-lista"><div><dt>Cliente</dt><dd>{detalle.nombreCliente || "No disponible"}</dd></div><div><dt>Teléfono</dt><dd>{detalle.telefonoCliente ? <a href={`tel:${detalle.telefonoCliente}`}>{detalle.telefonoCliente}</a> : "No disponible"}</dd></div><div><dt>Fecha</dt><dd>{fechaHoraEspanola(detalle.fechaInicio)} – {hora(detalle.fechaFin)}</dd></div><div><dt>Servicio</dt><dd>{detalle.servicio} · {detalle.precio} €</dd></div><div><dt>Estado</dt><dd><InsigniaEstado estado={detalle.estado} /></dd></div><div><dt>Nota</dt><dd>{detalle.notaCliente || "Sin notas"}</dd></div>{detalle.motivoCancelacion && <div><dt>Cancelación</dt><dd>{detalle.motivoCancelacion}</dd></div>}</dl>{detalle.estado === "CONFIRMADA" && <button className="boton boton-peligro" onClick={() => cancelar(detalle)}>Cancelar cita</button>}</section></div>}
  </section>;
}
