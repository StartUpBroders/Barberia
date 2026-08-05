import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listarHorarios, listarOcupacionesEquipo } from "../api/horariosApi";
import { crearDiaBloqueado, eliminarDiaBloqueado, listarDiasBloqueados } from "../api/diasBloqueadosApi";
import { crearDiaTrabajoEspecial, eliminarDiaTrabajoEspecial, listarDiasTrabajoEspecial } from "../api/diasTrabajoEspecialApi";
import { listarEquipo } from "../api/profesionalesApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { InsigniaEstado } from "../componentes/comunes/InsigniaEstado";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";
import { horaEspanola } from "../utilidades/fechas";
import { usarAutenticacion } from "../hooks/usarAutenticacion";

const ordenDias = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const meses = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
function fechaIso(fecha) { return [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, "0"), String(fecha.getDate()).padStart(2, "0")].join("-"); }
function fechaDesdeIso(valor) { return new Date(`${valor}T12:00:00`); }
function claveDia(fecha) { return ordenDias[(fecha.getDay() + 6) % 7]; }

export function PaginaHorarios() {
  const { sesion } = usarAutenticacion();
  const [parametros, setParametros] = useSearchParams();
  const esPropietario = sesion?.rol === "PROPIETARIO";
  const profesionalPropioId = sesion?.profesional?.id;
  const [datos, setDatos] = useState(null);
  const [profesionalId, setProfesionalId] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mesVisible, setMesVisible] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaIso(new Date()));

  const cargar = useCallback(async () => {
    setCargando(true); setError("");
    try {
      const [profesionales, horarios, bloqueos, especiales, ocupaciones] = await Promise.all([
        listarEquipo(), listarHorarios(), listarDiasBloqueados(), listarDiasTrabajoEspecial(), listarOcupacionesEquipo(),
      ]);
      setDatos({ profesionales, horarios, bloqueos, especiales, ocupaciones });
      const solicitado = Number(parametros.get("profesional"));
      const existeSolicitado = profesionales.some((persona) => persona.id === solicitado);
      setProfesionalId(String(existeSolicitado ? solicitado : profesionalPropioId || profesionales[0]?.id || ""));
    } catch (fallo) { setError(fallo.mensaje || fallo.message); }
    finally { setCargando(false); }
  }, [parametros, profesionalPropioId]);
  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    if (!datos) return;
    const solicitado = Number(parametros.get("profesional"));
    if (solicitado && datos.profesionales.some((persona) => persona.id === solicitado)) setProfesionalId(String(solicitado));
  }, [parametros, datos]);

  const diasMes = useMemo(() => {
    const inicio = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    const cantidad = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();
    const huecos = (inicio.getDay() + 6) % 7;
    return [...Array(huecos).fill(null), ...Array.from({ length: cantidad }, (_, indice) => new Date(mesVisible.getFullYear(), mesVisible.getMonth(), indice + 1))];
  }, [mesVisible]);
  const horariosProfesional = datos?.horarios.filter((item) => item.profesionalId === Number(profesionalId)) || [];
  const diaReferencia = horariosProfesional.find((item) => item.activo)?.diaSemana;
  const tramosHabituales = horariosProfesional.filter((item) => item.activo && item.diaSemana === diaReferencia).map((item) => ({ horaInicio: item.horaInicio.slice(0, 5), horaFin: item.horaFin.slice(0, 5) }));
  const bloqueosProfesional = datos?.bloqueos.filter((item) => item.profesionalId === Number(profesionalId)) || [];
  const especialesProfesional = datos?.especiales.filter((item) => item.profesionalId === Number(profesionalId)) || [];
  const citasProfesional = (datos?.ocupaciones || []).filter((cita) => cita.profesionalId === Number(profesionalId));
  const citasDia = citasProfesional.filter((cita) => cita.fechaInicio.startsWith(fechaSeleccionada)).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  const profesionalSeleccionado = datos?.profesionales.find((persona) => persona.id === Number(profesionalId));
  const puedeEditarSeleccionado = esPropietario && Number(profesionalId) === profesionalPropioId;

  const estadoFecha = (fecha) => {
    const iso = fechaIso(fecha);
    const bloqueoCompleto = bloqueosProfesional.some((item) => item.fecha === iso && !item.horaInicio);
    const especial = especialesProfesional.some((item) => item.fecha === iso);
    const rutinaDia = horariosProfesional.some((item) => item.diaSemana === claveDia(fecha) && item.activo);
    return { trabaja: !bloqueoCompleto && (especial || rutinaDia), bloqueoCompleto, especial, rutinaDia };
  };
  const volverAHoy = () => {
    const hoy = new Date();
    setMesVisible(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    setFechaSeleccionada(fechaIso(hoy));
  };
  const alternarFecha = async () => {
    if (!puedeEditarSeleccionado) return;
    const estado = estadoFecha(fechaDesdeIso(fechaSeleccionada));
    const citasActivasDia = citasDia.filter((cita) => cita.estado === "CONFIRMADA" || cita.estado === "RESERVADA");
    if (estado.trabaja && citasActivasDia.length > 0) {
      const cantidad = citasActivasDia.length;
      const confirmado = window.confirm(`Este día tiene ${cantidad} ${cantidad === 1 ? "cita confirmada" : "citas confirmadas"}. Al marcarlo como descanso se cancelarán y se crearán notificaciones para contactar con ${cantidad === 1 ? "el cliente" : "todos los clientes"}. ¿Continuar?`);
      if (!confirmado) return;
    }
    setGuardando(true); setError("");
    try {
      if (estado.trabaja) {
        if (estado.especial && !estado.rutinaDia) await Promise.all(especialesProfesional.filter((item) => item.fecha === fechaSeleccionada).map((item) => eliminarDiaTrabajoEspecial(item.id)));
        await crearDiaBloqueado({ profesionalId: Number(profesionalId), fecha: fechaSeleccionada, horaInicio: null, horaFin: null, motivo: "Descanso desde el calendario" });
        if (citasActivasDia.length > 0) window.dispatchEvent(new CustomEvent("notificaciones-actualizadas"));
        setMensaje(citasActivasDia.length > 0 ? `El día se ha marcado como descanso y se han cancelado ${citasActivasDia.length} ${citasActivasDia.length === 1 ? "cita" : "citas"}. Revisa Notificaciones para contactar con los clientes.` : "El día se ha marcado como descanso.");
      } else if (estado.bloqueoCompleto) {
        await Promise.all(bloqueosProfesional.filter((item) => item.fecha === fechaSeleccionada && !item.horaInicio).map((item) => eliminarDiaBloqueado(item.id)));
        if (estado.rutinaDia) setMensaje("El día vuelve a su rutina de trabajo.");
        else {
          const tramos = tramosHabituales.length ? tramosHabituales : [{ horaInicio: "08:00", horaFin: "14:00" }, { horaInicio: "15:00", horaFin: "21:00" }];
          for (const tramo of tramos) await crearDiaTrabajoEspecial({ profesionalId: Number(profesionalId), fecha: fechaSeleccionada, horaInicio: `${tramo.horaInicio}:00`, horaFin: `${tramo.horaFin}:00` });
          setMensaje("El día se ha abierto excepcionalmente con el horario habitual.");
        }
      } else {
        const tramos = tramosHabituales.length ? tramosHabituales : [{ horaInicio: "08:00", horaFin: "14:00" }, { horaInicio: "15:00", horaFin: "21:00" }];
        for (const tramo of tramos) await crearDiaTrabajoEspecial({ profesionalId: Number(profesionalId), fecha: fechaSeleccionada, horaInicio: `${tramo.horaInicio}:00`, horaFin: `${tramo.horaFin}:00` });
        setMensaje("El día se ha abierto excepcionalmente con el horario habitual.");
      }
      await cargar();
    } catch (fallo) { setError(fallo.mensaje || fallo.message); }
    finally { setGuardando(false); }
  };

  if (cargando && !datos) return <EstadoCarga texto="Preparando el calendario…" />;
  const estadoSeleccionado = estadoFecha(fechaDesdeIso(fechaSeleccionada));
  return <section className="contenido-panel agenda-profesional">
    <div className="encabezado-pagina"><div><p className="sobrelinea">Agenda</p><h1>{profesionalSeleccionado && Number(profesionalId) !== profesionalPropioId ? `Calendario de ${profesionalSeleccionado.nombre}` : "Calendario de trabajo"}</h1></div>
      {!esPropietario && <label>Profesional<select value={profesionalId} onChange={(evento) => { setProfesionalId(evento.target.value); setParametros({ profesional: evento.target.value }); }}>{datos?.profesionales.map((persona) => <option key={persona.id} value={persona.id}>{persona.nombre}</option>)}</select></label>}
    </div>
    <MensajeEstado tipo="error">{error}</MensajeEstado><MensajeEstado tipo="exito">{mensaje}</MensajeEstado>
    <div className="rejilla-calendario-agenda">
      <section className="tarjeta calendario-mensual">
        <div className="navegacion-mes"><button aria-label="Mes anterior" onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}>‹</button><h2>{meses.format(mesVisible)}</h2><button aria-label="Mes siguiente" onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))}>›</button></div>
        <button type="button" className="boton boton-secundario boton-hoy-calendario" onClick={volverAHoy}>Volver a hoy</button>
        <div className="cabecera-calendario">{["L", "M", "X", "J", "V", "S", "D"].map((dia) => <span key={dia}>{dia}</span>)}</div>
        <div className="cuadricula-calendario">{diasMes.map((fecha, indice) => fecha ? <button key={fechaIso(fecha)} className={`${estadoFecha(fecha).trabaja ? "dia-trabajo" : "dia-descanso"} ${fechaSeleccionada === fechaIso(fecha) ? "seleccionado" : ""}`} aria-label={`${fecha.getDate()} de ${meses.format(fecha)}, ${estadoFecha(fecha).trabaja ? "trabajo" : "descanso"}`} aria-pressed={fechaSeleccionada === fechaIso(fecha)} onClick={() => setFechaSeleccionada(fechaIso(fecha))}><span>{fecha.getDate()}</span>{citasProfesional.some((cita) => cita.fechaInicio.startsWith(fechaIso(fecha))) && <i aria-label="Tiene citas" />}</button> : <span key={`hueco-${indice}`} />)}</div>
        <div className="leyenda-calendario"><span className="punto disponible" /> Trabajo <span className="punto descanso" /> Descanso <span className="punto citas" /> Con citas</div>
      </section>
      <aside className="tarjeta detalle-dia-agenda"><p className="sobrelinea">Día seleccionado</p><h2>{new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(fechaDesdeIso(fechaSeleccionada))}</h2>
        <span className={`estado-dia ${estadoSeleccionado.trabaja ? "abierto" : "cerrado"}`}>{estadoSeleccionado.trabaja ? "Día de trabajo" : "Día de descanso"}</span>
        {puedeEditarSeleccionado && <button className={`boton ${estadoSeleccionado.trabaja ? "boton-peligro" : ""}`} disabled={guardando} onClick={alternarFecha}>{estadoSeleccionado.trabaja ? "Marcar como descanso" : "Abrir este día"}</button>}
        <div className="citas-del-dia"><h3>Citas ({citasDia.length})</h3>{citasDia.length ? citasDia.map((cita) => <article key={`${cita.profesionalId}-${cita.fechaInicio}`}><time>{horaEspanola(cita.fechaInicio)}</time><div><strong>{cita.nombreCliente}</strong></div><InsigniaEstado estado={cita.estado} /></article>) : <p className="texto-secundario">No hay citas para este día.</p>}</div>
      </aside>
    </div>
  </section>;
}
