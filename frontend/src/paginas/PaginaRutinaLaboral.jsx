import { useCallback, useEffect, useState } from "react";
import { consultarConfiguracionReservas } from "../api/configuracionReservasApi";
import { guardarRutinaSemanal, listarHorarios } from "../api/horariosApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";
import { usarAutenticacion } from "../hooks/usarAutenticacion";
import { diasSemana } from "../utilidades/fechas";

const ordenDias = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const inicialLaborables = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const MINUTO_INICIO = 6 * 60;
const MINUTO_FIN = 23 * 60;
const opcionesAntelacion = [7, 10, 15, 20, 30, 45, 60, 90];
const rutinaInicial = { dias: inicialLaborables, mananaInicio: "08:00", mananaFin: "14:00", jornadaPartida: true, tardeInicio: "15:00", tardeFin: "21:00", intervaloMinutos: 30, diasAntelacionReserva: 30 };

function minutos(hora) { const [horas, minutosHora] = hora.split(":").map(Number); return horas * 60 + minutosHora; }
function hora(minutosTotales) { return `${String(Math.floor(minutosTotales / 60)).padStart(2, "0")}:${String(minutosTotales % 60).padStart(2, "0")}`; }
function opcionesInicio(intervalo) { const resultado = []; for (let valor = MINUTO_INICIO; valor <= MINUTO_FIN - intervalo; valor += 15) resultado.push(hora(valor)); return resultado; }
function opcionesFin(inicio, intervalo) { const resultado = []; for (let valor = minutos(inicio) + intervalo; valor <= MINUTO_FIN; valor += intervalo) resultado.push(hora(valor)); return resultado; }
function ajustarFin(inicio, finActual, intervalo) {
  const opciones = opcionesFin(inicio, intervalo);
  return opciones.find((opcion) => minutos(opcion) >= minutos(finActual)) || opciones.at(-1) || finActual;
}

export function PaginaRutinaLaboral() {
  const { sesion } = usarAutenticacion();
  const profesionalId = sesion?.profesional?.id;
  const [rutina, setRutina] = useState(rutinaInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true); setError("");
    try {
      const [horarios, configuracion] = await Promise.all([listarHorarios(), consultarConfiguracionReservas()]);
      const propios = horarios.filter((horario) => horario.profesionalId === Number(profesionalId));
      if (!propios.length) { setRutina({ ...rutinaInicial, intervaloMinutos: configuracion.intervaloMinutos, diasAntelacionReserva: configuracion.diasAntelacionReserva }); }
      else {
        const dias = [...new Set(propios.map((horario) => horario.diaSemana))];
        const primero = propios[0];
        const segundo = propios.find((horario) => horario.diaSemana === primero.diaSemana && horario.id !== primero.id);
        setRutina({ dias, mananaInicio: primero.horaInicio.slice(0, 5), mananaFin: primero.horaFin.slice(0, 5), jornadaPartida: Boolean(segundo), tardeInicio: segundo?.horaInicio.slice(0, 5) || "15:00", tardeFin: segundo?.horaFin.slice(0, 5) || "21:00", intervaloMinutos: configuracion.intervaloMinutos, diasAntelacionReserva: configuracion.diasAntelacionReserva });
      }
    } catch (fallo) { setError(fallo.mensaje || fallo.message); }
    finally { setCargando(false); }
  }, [profesionalId]);
  useEffect(() => { cargar(); }, [cargar]);

  const alternarDia = (dia) => setRutina((actual) => ({ ...actual, dias: actual.dias.includes(dia) ? actual.dias.filter((item) => item !== dia) : [...actual.dias, dia] }));
  const cambiarIntervalo = (valor) => setRutina((actual) => {
    const intervaloMinutos = Number(valor);
    return { ...actual, intervaloMinutos, mananaFin: ajustarFin(actual.mananaInicio, actual.mananaFin, intervaloMinutos), tardeFin: ajustarFin(actual.tardeInicio, actual.tardeFin, intervaloMinutos) };
  });
  const cambiarInicio = (campoInicio, campoFin, valor) => setRutina((actual) => ({ ...actual, [campoInicio]: valor, [campoFin]: ajustarFin(valor, actual[campoFin], Number(actual.intervaloMinutos)) }));
  const horasInicio = opcionesInicio(Number(rutina.intervaloMinutos));
  const horasFinManana = opcionesFin(rutina.mananaInicio, Number(rutina.intervaloMinutos));
  const horasFinTarde = opcionesFin(rutina.tardeInicio, Number(rutina.intervaloMinutos));
  const guardar = async () => {
    if (rutina.mananaFin <= rutina.mananaInicio || (rutina.jornadaPartida && rutina.tardeFin <= rutina.tardeInicio)) { setError("La hora final debe ser posterior a la inicial."); return; }
    setGuardando(true); setError(""); setMensaje("");
    try {
      const tramos = rutina.dias.flatMap((diaSemana) => [{ diaSemana, horaInicio: `${rutina.mananaInicio}:00`, horaFin: `${rutina.mananaFin}:00` }, ...(rutina.jornadaPartida ? [{ diaSemana, horaInicio: `${rutina.tardeInicio}:00`, horaFin: `${rutina.tardeFin}:00` }] : [])]);
      await guardarRutinaSemanal({ profesionalId: Number(profesionalId), tramos, intervaloMinutos: Number(rutina.intervaloMinutos), diasAntelacionReserva: Number(rutina.diasAntelacionReserva) });
      setMensaje("Tu rutina semanal y las reglas de reserva se han actualizado."); await cargar();
    } catch (fallo) { setError(fallo.mensaje || fallo.message); }
    finally { setGuardando(false); }
  };

  if (cargando) return <EstadoCarga texto="Preparando la rutina laboral…" />;
  return <section className="contenido-panel pagina-rutina-laboral">
    <div className="encabezado-pagina"><div><p className="sobrelinea">Organización</p><h1>Rutina laboral</h1><p>Configura los días de trabajo, la jornada habitual y las reglas de reserva.</p></div></div>
    <MensajeEstado tipo="error">{error}</MensajeEstado><MensajeEstado tipo="exito">{mensaje}</MensajeEstado>
    <section className="tarjeta configuracion-rutina">
      <div className="cabecera-seccion"><div><p className="sobrelinea">Rutina laboral</p><h2>Días y jornada habitual</h2></div><button className="boton" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : "Guardar rutina"}</button></div>
      <div className="reglas-reserva configuracion-base-rutina"><label>1. Tiempo por cliente<select value={rutina.intervaloMinutos} onChange={(evento) => cambiarIntervalo(evento.target.value)}>{[15, 30, 45, 60].map((valor) => <option key={valor} value={valor}>{valor} minutos por cliente</option>)}</select><small>Las horas de fin se calculan en bloques de esta duración.</small></label><label>Reserva anticipada<select value={rutina.diasAntelacionReserva} onChange={(evento) => setRutina({ ...rutina, diasAntelacionReserva: Number(evento.target.value) })}>{opcionesAntelacion.map((valor) => <option key={valor} value={valor}>{valor} días</option>)}</select><small>Las citas ya reservadas fuera del nuevo plazo se mantienen.</small></label></div>
      <div className="selector-dias-semana">{ordenDias.map((dia) => <button key={dia} className={rutina.dias.includes(dia) ? "activo" : ""} aria-pressed={rutina.dias.includes(dia)} onClick={() => alternarDia(dia)}><span>{diasSemana[dia].slice(0, 3)}</span><small>{rutina.dias.includes(dia) ? "Trabajo" : "Descanso"}</small></button>)}</div>
      <div className="configuracion-turnos"><div className="turno"><strong>Primer turno</strong><label>Desde<select value={rutina.mananaInicio} onChange={(evento) => cambiarInicio("mananaInicio", "mananaFin", evento.target.value)}>{horasInicio.map((valor) => <option key={valor}>{valor}</option>)}</select></label><span>—</span><label>Hasta<select value={rutina.mananaFin} onChange={(evento) => setRutina({ ...rutina, mananaFin: evento.target.value })}>{horasFinManana.map((valor) => <option key={valor}>{valor}</option>)}</select></label></div>
        <label className="opcion-linea"><input type="checkbox" checked={rutina.jornadaPartida} onChange={(evento) => setRutina({ ...rutina, jornadaPartida: evento.target.checked })} /> Añadir turno de tarde</label>
        {rutina.jornadaPartida && <div className="turno"><strong>Segundo turno</strong><label>Desde<select value={rutina.tardeInicio} onChange={(evento) => cambiarInicio("tardeInicio", "tardeFin", evento.target.value)}>{horasInicio.map((valor) => <option key={valor}>{valor}</option>)}</select></label><span>—</span><label>Hasta<select value={rutina.tardeFin} onChange={(evento) => setRutina({ ...rutina, tardeFin: evento.target.value })}>{horasFinTarde.map((valor) => <option key={valor}>{valor}</option>)}</select></label></div>}
      </div>
    </section>
  </section>;
}
