import { useCallback, useEffect, useState } from "react";
import { crearCitaAdministrativa } from "../api/citasApi";
import { consultarCalendarioDisponibilidad } from "../api/disponibilidadApi";
import { listarServicios } from "../api/serviciosApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";
import { usarAutenticacion } from "../hooks/usarAutenticacion";
import { horaEspanola } from "../utilidades/fechas";
import { nuevaClaveIdempotencia } from "../utilidades/idempotencia";

const DIAS_POR_PAGINA = 7;
const HORAS_POR_PAGINA = 6;
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const formatoDia = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const slug = import.meta.env.VITE_SLUG_BARBERIA || "barberia-mimi";
const formularioInicial = { nombreCliente: "", fecha: "", fechaInicio: "" };

function fechaDesdeIso(valor) { return new Date(`${valor}T12:00:00`); }
function fechaPeriodo(fecha) { return fecha ? `${fecha.getDate()}/${MESES[fecha.getMonth()]}` : ""; }
function tituloFecha(iso) { return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(fechaDesdeIso(iso)); }

export function PaginaReservaCita() {
  const { sesion } = usarAutenticacion();
  const profesionalId = sesion?.profesional?.id;
  const [servicioId, setServicioId] = useState("");
  const [nombreServicio, setNombreServicio] = useState("");
  const [formulario, setFormulario] = useState(formularioInicial);
  const [calendario, setCalendario] = useState(null);
  const [paginaDias, setPaginaDias] = useState(0);
  const [paginaHoras, setPaginaHoras] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    listarServicios().then((servicios) => {
      const activos = servicios.filter((servicio) => servicio.activo);
      const predeterminado = activos.find((servicio) => servicio.nombre.trim().toLocaleLowerCase("es-ES") === "corte") || activos[0];
      setServicioId(predeterminado ? String(predeterminado.id) : "");
      setNombreServicio(predeterminado?.nombre || "");
      if (!predeterminado) { setError("Necesitas al menos un servicio activo para crear una cita."); setCargando(false); }
    }).catch((fallo) => { setError(fallo.mensaje || fallo.message); setCargando(false); });
  }, []);

  const cargarDisponibilidad = useCallback(async (signal) => {
    if (!profesionalId || !servicioId) return;
    setCargando(true);
    try { setCalendario(await consultarCalendarioDisponibilidad(slug, profesionalId, servicioId, signal)); }
    catch (fallo) { if (!signal?.aborted) setError(fallo.mensaje || fallo.message); }
    finally { if (!signal?.aborted) setCargando(false); }
  }, [profesionalId, servicioId]);
  useEffect(() => {
    if (!profesionalId || !servicioId) return undefined;
    const controlador = new AbortController(); cargarDisponibilidad(controlador.signal);
    return () => controlador.abort();
  }, [cargarDisponibilidad, profesionalId, servicioId]);

  const totalPaginasDias = Math.max(1, Math.ceil((calendario?.dias.length || 0) / DIAS_POR_PAGINA));
  const diasVisibles = calendario?.dias.slice(paginaDias * DIAS_POR_PAGINA, (paginaDias + 1) * DIAS_POR_PAGINA) || [];
  const diaSeleccionado = calendario?.dias.find((dia) => dia.fecha === formulario.fecha);
  const horarios = diaSeleccionado?.horariosDisponibles || [];
  const totalPaginasHoras = Math.max(1, Math.ceil(horarios.length / HORAS_POR_PAGINA));
  const horasVisibles = horarios.slice(paginaHoras * HORAS_POR_PAGINA, (paginaHoras + 1) * HORAS_POR_PAGINA);

  const seleccionarDia = (dia) => {
    if (!dia.disponible) return;
    setFormulario((actual) => ({ ...actual, fecha: dia.fecha, fechaInicio: "" })); setPaginaHoras(0);
  };
  const enviar = async (evento) => {
    evento.preventDefault();
    if (!formulario.nombreCliente.trim() || !formulario.fechaInicio) { setError("Indica el nombre, el día y el tramo horario."); return; }
    setGuardando(true); setError(""); setMensaje("");
    try {
      await crearCitaAdministrativa({ nombreCliente: formulario.nombreCliente.trim(), telefonoCliente: "999999999", servicioId: Number(servicioId), profesionalId: Number(profesionalId), fechaInicio: formulario.fechaInicio, notaCliente: null }, nuevaClaveIdempotencia());
      setFormulario(formularioInicial); setPaginaDias(0); setPaginaHoras(0); setMensaje("La cita rápida se ha creado.");
      await cargarDisponibilidad();
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
      if (fallo.estadoHttp === 409) { setFormulario((actual) => ({ ...actual, fechaInicio: "" })); await cargarDisponibilidad(); }
    } finally { setGuardando(false); }
  };

  return <section className="contenido-panel pagina-reserva-cita">
    <div className="encabezado-pagina"><div><p className="sobrelinea">Agenda rápida</p><h1>Reserva Cita</h1><p>Crea una cita indicando únicamente el nombre, el día y el tramo horario.</p></div></div>
    <MensajeEstado tipo="error">{error}</MensajeEstado><MensajeEstado tipo="exito">{mensaje}</MensajeEstado>
    <form className="tarjeta formulario-rejilla formulario-cita" onSubmit={enviar}>
      <h2>Nueva cita</h2>
      <label className="campo-ancho">Nombre del cliente *<input required maxLength="100" value={formulario.nombreCliente} onChange={(evento) => setFormulario((actual) => ({ ...actual, nombreCliente: evento.target.value }))} /></label>
      <p className="ayuda-campo campo-ancho">Se añadirá al calendario de {sesion?.profesional?.nombre || "Mimi"} con el servicio {nombreServicio || "predeterminado"}. No es necesario indicar teléfono.</p>
      <fieldset className="campo-ancho selector-fecha-admin"><legend>Elige el día</legend>
        {cargando ? <EstadoCarga texto="Consultando el calendario…" /> : <><div className="navegacion-reserva"><button type="button" aria-label="Días anteriores" disabled={paginaDias === 0} onClick={() => setPaginaDias((pagina) => pagina - 1)}>‹</button><strong>{diasVisibles.length ? `${fechaPeriodo(fechaDesdeIso(diasVisibles[0].fecha))} - ${fechaPeriodo(fechaDesdeIso(diasVisibles.at(-1).fecha))}` : "Sin fechas"}</strong><button type="button" aria-label="Días siguientes" disabled={paginaDias >= totalPaginasDias - 1} onClick={() => setPaginaDias((pagina) => pagina + 1)}>›</button></div><div className="dias-reserva semana-reserva" role="group" aria-label="Días disponibles para la cita rápida">{diasVisibles.map((dia) => { const fecha = fechaDesdeIso(dia.fecha); return <button type="button" key={dia.fecha} disabled={!dia.disponible} className={`${formulario.fecha === dia.fecha ? "seleccionado" : ""} ${dia.disponible ? "disponible" : "no-disponible"}`} aria-pressed={formulario.fecha === dia.fecha} onClick={() => seleccionarDia(dia)}><span>{formatoDia.format(fecha).replace(".", "")}</span><strong>{fecha.getDate()}</strong><small>{dia.disponible ? `${dia.cantidadHorarios} ${dia.cantidadHorarios === 1 ? "hueco" : "huecos"}` : "Completo"}</small></button>; })}</div></>}
      </fieldset>
      <fieldset className="campo-ancho selector-fecha-admin"><legend>Elige el tramo horario</legend>
        {!formulario.fecha ? <p className="ayuda-campo">Selecciona primero un día disponible.</p> : horarios.length ? <><div className="navegacion-reserva navegacion-horas"><button type="button" aria-label="Horas anteriores" disabled={paginaHoras === 0} onClick={() => setPaginaHoras((pagina) => pagina - 1)}>‹</button><strong>{tituloFecha(formulario.fecha)}</strong><button type="button" aria-label="Horas siguientes" disabled={paginaHoras >= totalPaginasHoras - 1} onClick={() => setPaginaHoras((pagina) => pagina + 1)}>›</button></div><div className="selector-horarios selector-horarios-tarjetas horas-reserva" role="group" aria-label="Tramos disponibles">{horasVisibles.map((tramo) => <button type="button" key={tramo.fechaInicio} className={formulario.fechaInicio === tramo.fechaInicio ? "seleccionado" : ""} aria-pressed={formulario.fechaInicio === tramo.fechaInicio} onClick={() => setFormulario((actual) => ({ ...actual, fechaInicio: tramo.fechaInicio }))}><strong>{horaEspanola(tramo.fechaInicio)}</strong><span>hasta {horaEspanola(tramo.fechaFin)}</span></button>)}</div></> : <p className="ayuda-campo">No quedan tramos para este día.</p>}
      </fieldset>
      <button className="boton" disabled={guardando || cargando}>{guardando ? "Creando…" : "Crear cita"}</button>
    </form>
  </section>;
}
