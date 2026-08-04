import { useEffect, useMemo, useState } from "react";
import {
  guardarRutinaSemanal,
  listarHorarios,
  listarOcupacionesEquipo,
} from "../api/horariosApi";
import {
  crearDiaBloqueado,
  eliminarDiaBloqueado,
  listarDiasBloqueados,
} from "../api/diasBloqueadosApi";
import {
  crearDiaTrabajoEspecial,
  eliminarDiaTrabajoEspecial,
  listarDiasTrabajoEspecial,
} from "../api/diasTrabajoEspecialApi";
import { consultarConfiguracionReservas } from "../api/configuracionReservasApi";
import { listarProfesionales } from "../api/profesionalesApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { InsigniaEstado } from "../componentes/comunes/InsigniaEstado";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";
import { diasSemana, fechaHoraEspanola } from "../utilidades/fechas";
import { usarAutenticacion } from "../hooks/usarAutenticacion";

const ordenDias = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const inicialLaborables = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];
const horas = Array.from({ length: 35 }, (_, indice) => {
  const minutos = 6 * 60 + indice * 30;
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
});
const meses = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

function fechaIso(fecha) {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
}
function fechaDesdeIso(valor) {
  return new Date(`${valor}T12:00:00`);
}
function claveDia(fecha) {
  return ordenDias[(fecha.getDay() + 6) % 7];
}

export function PaginaHorarios() {
  const { sesion } = usarAutenticacion();
  const esPropietario = sesion?.rol === "PROPIETARIO";
  const profesionalPropioId = sesion?.profesional?.id;
  const [datos, setDatos] = useState(null);
  const [profesionalId, setProfesionalId] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mesVisible, setMesVisible] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    fechaIso(new Date()),
  );
  const [rutina, setRutina] = useState({
    dias: inicialLaborables,
    mananaInicio: "08:00",
    mananaFin: "14:00",
    jornadaPartida: true,
    tardeInicio: "15:00",
    tardeFin: "21:00",
    intervaloMinutos: 30,
    diasAntelacionReserva: 30,
  });

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [
        profesionales,
        horarios,
        bloqueos,
        especiales,
        ocupaciones,
        configuracion,
      ] = await Promise.all([
        listarProfesionales(),
        listarHorarios(),
        listarDiasBloqueados(),
        listarDiasTrabajoEspecial(),
        listarOcupacionesEquipo(),
        consultarConfiguracionReservas(),
      ]);
      setDatos({
        profesionales,
        horarios,
        bloqueos,
        especiales,
        ocupaciones,
        configuracion,
      });
      setProfesionalId(
        (actual) => actual || String(profesionalPropioId || profesionales[0]?.id || ""),
      );
      setRutina((actual) => ({
        ...actual,
        intervaloMinutos: configuracion.intervaloMinutos,
        diasAntelacionReserva: configuracion.diasAntelacionReserva,
      }));
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    if (!datos || !profesionalId) return;
    const propios = datos.horarios.filter(
      (horario) => horario.profesionalId === Number(profesionalId),
    );
    if (!propios.length) {
      setRutina((actual) => ({
        ...actual,
        dias: inicialLaborables,
        mananaInicio: "08:00",
        mananaFin: "14:00",
        jornadaPartida: true,
        tardeInicio: "15:00",
        tardeFin: "21:00",
      }));
      return;
    }
    const dias = [...new Set(propios.map((horario) => horario.diaSemana))];
    const primero = propios[0];
    const segundo = propios.find(
      (horario) =>
        horario.diaSemana === primero.diaSemana && horario.id !== primero.id,
    );
    setRutina((actual) => ({
      ...actual,
      dias,
      mananaInicio: primero.horaInicio.slice(0, 5),
      mananaFin: primero.horaFin.slice(0, 5),
      jornadaPartida: Boolean(segundo),
      tardeInicio: segundo?.horaInicio.slice(0, 5) || actual.tardeInicio,
      tardeFin: segundo?.horaFin.slice(0, 5) || actual.tardeFin,
    }));
  }, [profesionalId, datos]);

  const diasMes = useMemo(() => {
    const inicio = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    const cantidad = new Date(
      mesVisible.getFullYear(),
      mesVisible.getMonth() + 1,
      0,
    ).getDate();
    const huecos = (inicio.getDay() + 6) % 7;
    return [
      ...Array(huecos).fill(null),
      ...Array.from(
        { length: cantidad },
        (_, indice) =>
          new Date(mesVisible.getFullYear(), mesVisible.getMonth(), indice + 1),
      ),
    ];
  }, [mesVisible]);
  const horariosProfesional =
    datos?.horarios.filter(
      (item) => item.profesionalId === Number(profesionalId),
    ) || [];
  const bloqueosProfesional =
    datos?.bloqueos.filter(
      (item) => item.profesionalId === Number(profesionalId),
    ) || [];
  const especialesProfesional =
    datos?.especiales.filter(
      (item) => item.profesionalId === Number(profesionalId),
    ) || [];
  const citasConfirmadasProfesional = (datos?.ocupaciones || []).filter(
    (cita) => cita.profesionalId === Number(profesionalId),
  );
  const citasDia = citasConfirmadasProfesional
    .filter((cita) => cita.fechaInicio.startsWith(fechaSeleccionada))
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  const puedeEditarSeleccionado = esPropietario || Number(profesionalId) === profesionalPropioId;

  const estadoFecha = (fecha) => {
    const iso = fechaIso(fecha);
    const bloqueoCompleto = bloqueosProfesional.some(
      (item) => item.fecha === iso && !item.horaInicio,
    );
    const especial = especialesProfesional.some((item) => item.fecha === iso);
    const rutinaDia = horariosProfesional.some(
      (item) => item.diaSemana === claveDia(fecha) && item.activo,
    );
    return {
      trabaja: !bloqueoCompleto && (especial || rutinaDia),
      bloqueoCompleto,
      especial,
      rutinaDia,
    };
  };
  const alternarDiaRutina = (dia) =>
    setRutina((actual) => ({
      ...actual,
      dias: actual.dias.includes(dia)
        ? actual.dias.filter((item) => item !== dia)
        : [...actual.dias, dia],
    }));

  const guardarRutina = async () => {
    if (!puedeEditarSeleccionado) {
      setError("Puedes consultar este calendario, pero solo modificar tu propia rutina.");
      return;
    }
    if (
      rutina.mananaFin <= rutina.mananaInicio ||
      (rutina.jornadaPartida && rutina.tardeFin <= rutina.tardeInicio)
    ) {
      setError("La hora final debe ser posterior a la inicial.");
      return;
    }
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const nuevas = rutina.dias.flatMap((diaSemana) => [
        {
          diaSemana,
          horaInicio: `${rutina.mananaInicio}:00`,
          horaFin: `${rutina.mananaFin}:00`,
        },
        ...(rutina.jornadaPartida
          ? [
              {
                diaSemana,
                horaInicio: `${rutina.tardeInicio}:00`,
                horaFin: `${rutina.tardeFin}:00`,
              },
            ]
          : []),
      ]);
      await guardarRutinaSemanal({
        profesionalId: Number(profesionalId),
        tramos: nuevas,
        intervaloMinutos: esPropietario ? Number(rutina.intervaloMinutos) : null,
        diasAntelacionReserva: esPropietario ? Number(rutina.diasAntelacionReserva) : null,
      });
      setMensaje(esPropietario ? "Rutina semanal y reglas de reserva actualizadas." : "Tu rutina semanal se ha actualizado.");
      await cargar();
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
    } finally {
      setGuardando(false);
    }
  };

  const alternarFecha = async () => {
    if (!puedeEditarSeleccionado) {
      setError("El calendario de otro profesional es de solo lectura.");
      return;
    }
    const fecha = fechaDesdeIso(fechaSeleccionada);
    const estado = estadoFecha(fecha);
    setGuardando(true);
    setError("");
    try {
      if (estado.trabaja) {
        if (estado.especial && !estado.rutinaDia)
          await Promise.all(
            especialesProfesional
              .filter((item) => item.fecha === fechaSeleccionada)
              .map((item) => eliminarDiaTrabajoEspecial(item.id)),
          );
        else
          await crearDiaBloqueado({
            profesionalId: Number(profesionalId),
            fecha: fechaSeleccionada,
            horaInicio: null,
            horaFin: null,
            motivo: "Descanso desde el calendario",
          });
        setMensaje("El día se ha marcado como descanso.");
      } else if (estado.bloqueoCompleto && estado.rutinaDia) {
        await Promise.all(
          bloqueosProfesional
            .filter(
              (item) => item.fecha === fechaSeleccionada && !item.horaInicio,
            )
            .map((item) => eliminarDiaBloqueado(item.id)),
        );
        setMensaje("El día vuelve a su rutina de trabajo.");
      } else {
        const tramos = [
          { horaInicio: rutina.mananaInicio, horaFin: rutina.mananaFin },
          ...(rutina.jornadaPartida
            ? [{ horaInicio: rutina.tardeInicio, horaFin: rutina.tardeFin }]
            : []),
        ];
        for (const tramo of tramos)
          await crearDiaTrabajoEspecial({
            profesionalId: Number(profesionalId),
            fecha: fechaSeleccionada,
            horaInicio: `${tramo.horaInicio}:00`,
            horaFin: `${tramo.horaFin}:00`,
          });
        setMensaje(
          "El día se ha abierto excepcionalmente con el horario habitual.",
        );
      }
      await cargar();
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando && !datos)
    return <EstadoCarga texto="Preparando el calendario…" />;
  const estadoSeleccionado = estadoFecha(fechaDesdeIso(fechaSeleccionada));
  return (
    <section className="contenido-panel agenda-profesional">
      <div className="encabezado-pagina">
        <div>
          <p className="sobrelinea">Agenda</p>
          <h1>Calendario de trabajo</h1>
          <p>
            Gestiona tu rutina o consulta el calendario de otro miembro del
            equipo.
          </p>
        </div>
        <label>
          Profesional
          <select
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
          >
            {datos?.profesionales.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <MensajeEstado tipo="exito">{mensaje}</MensajeEstado>
      <section className="tarjeta configuracion-rutina">
        <div className="cabecera-seccion">
          <div>
            <p className="sobrelinea">Rutina semanal</p>
            <h2>Días y jornada habitual</h2>
          </div>
          {puedeEditarSeleccionado ? <button className="boton" disabled={guardando} onClick={guardarRutina}>{guardando ? "Guardando…" : "Guardar rutina"}</button> : <span className="etiqueta">Solo lectura</span>}
        </div>
        <div className="selector-dias-semana">
          {ordenDias.map((dia) => (
            <button
              key={dia}
              className={rutina.dias.includes(dia) ? "activo" : ""}
              aria-pressed={rutina.dias.includes(dia)}
              disabled={!puedeEditarSeleccionado}
              onClick={() => alternarDiaRutina(dia)}
            >
              <span>{diasSemana[dia].slice(0, 3)}</span>
              <small>
                {rutina.dias.includes(dia) ? "Trabajo" : "Descanso"}
              </small>
            </button>
          ))}
        </div>
        <div className="configuracion-turnos">
          <div className="turno">
            <strong>Primer turno</strong>
            <label>
              Desde
              <select
                value={rutina.mananaInicio}
                disabled={!puedeEditarSeleccionado}
                onChange={(e) =>
                  setRutina({ ...rutina, mananaInicio: e.target.value })
                }
              >
                {horas.map((hora) => (
                  <option key={hora}>{hora}</option>
                ))}
              </select>
            </label>
            <span>—</span>
            <label>
              Hasta
              <select
                value={rutina.mananaFin}
                disabled={!puedeEditarSeleccionado}
                onChange={(e) =>
                  setRutina({ ...rutina, mananaFin: e.target.value })
                }
              >
                {horas.map((hora) => (
                  <option key={hora}>{hora}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="opcion-linea">
            <input
              type="checkbox"
              checked={rutina.jornadaPartida}
              disabled={!puedeEditarSeleccionado}
              onChange={(e) =>
                setRutina({ ...rutina, jornadaPartida: e.target.checked })
              }
            />{" "}
            Añadir turno de tarde
          </label>
          {rutina.jornadaPartida && (
            <div className="turno">
              <strong>Segundo turno</strong>
              <label>
                Desde
                <select
                  value={rutina.tardeInicio}
                  disabled={!puedeEditarSeleccionado}
                  onChange={(e) =>
                    setRutina({ ...rutina, tardeInicio: e.target.value })
                  }
                >
                  {horas.map((hora) => (
                    <option key={hora}>{hora}</option>
                  ))}
                </select>
              </label>
              <span>—</span>
              <label>
                Hasta
                <select
                  value={rutina.tardeFin}
                  disabled={!puedeEditarSeleccionado}
                  onChange={(e) =>
                    setRutina({ ...rutina, tardeFin: e.target.value })
                  }
                >
                  {horas.map((hora) => (
                    <option key={hora}>{hora}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="reglas-reserva">
            <label>
              Tiempo por cliente
              <select
                value={rutina.intervaloMinutos}
                disabled={!esPropietario}
                onChange={(e) =>
                  setRutina({ ...rutina, intervaloMinutos: e.target.value })
                }
              >
                {[15, 30, 45, 60].map((valor) => (
                  <option key={valor} value={valor}>
                    {valor} minutos por cliente
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reserva anticipada
              <select
                value={rutina.diasAntelacionReserva}
                disabled={!esPropietario}
                onChange={(e) =>
                  setRutina({
                    ...rutina,
                    diasAntelacionReserva: e.target.value,
                  })
                }
              >
                {[15, 30, 45, 60, 90].map((valor) => (
                  <option key={valor} value={valor}>
                    {valor} días
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>
      <div className="rejilla-calendario-agenda">
        <section className="tarjeta calendario-mensual">
          <div className="navegacion-mes">
            <button
              aria-label="Mes anterior"
              onClick={() =>
                setMesVisible(
                  new Date(
                    mesVisible.getFullYear(),
                    mesVisible.getMonth() - 1,
                    1,
                  ),
                )
              }
            >
              ‹
            </button>
            <h2>{meses.format(mesVisible)}</h2>
            <button
              aria-label="Mes siguiente"
              onClick={() =>
                setMesVisible(
                  new Date(
                    mesVisible.getFullYear(),
                    mesVisible.getMonth() + 1,
                    1,
                  ),
                )
              }
            >
              ›
            </button>
          </div>
          <div className="cabecera-calendario">
            {["L", "M", "X", "J", "V", "S", "D"].map((dia) => (
              <span key={dia}>{dia}</span>
            ))}
          </div>
          <div className="cuadricula-calendario">
            {diasMes.map((fecha, indice) =>
              fecha ? (
                <button
                  key={fechaIso(fecha)}
                  className={`${estadoFecha(fecha).trabaja ? "dia-trabajo" : "dia-descanso"} ${fechaSeleccionada === fechaIso(fecha) ? "seleccionado" : ""}`}
                  aria-label={`${fecha.getDate()} de ${meses.format(fecha)}, ${estadoFecha(fecha).trabaja ? "trabajo" : "descanso"}`}
                  aria-pressed={fechaSeleccionada === fechaIso(fecha)}
                  onClick={() => setFechaSeleccionada(fechaIso(fecha))}
                >
                  <span>{fecha.getDate()}</span>
                  {citasConfirmadasProfesional.some((cita) =>
                    cita.fechaInicio.startsWith(fechaIso(fecha)),
                  ) && <i aria-label="Tiene citas" />}
                </button>
              ) : (
                <span key={`hueco-${indice}`} />
              ),
            )}
          </div>
          <div className="leyenda-calendario">
            <span className="punto disponible" /> Trabajo{" "}
            <span className="punto descanso" /> Descanso{" "}
            <span className="punto citas" /> Con citas
          </div>
        </section>
        <aside className="tarjeta detalle-dia-agenda">
          <p className="sobrelinea">Día seleccionado</p>
          <h2>
            {new Intl.DateTimeFormat("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(fechaDesdeIso(fechaSeleccionada))}
          </h2>
          <span
            className={`estado-dia ${estadoSeleccionado.trabaja ? "abierto" : "cerrado"}`}
          >
            {estadoSeleccionado.trabaja ? "Día de trabajo" : "Día de descanso"}
          </span>
          {puedeEditarSeleccionado ? <button className={`boton ${estadoSeleccionado.trabaja ? "boton-peligro" : ""}`} disabled={guardando} onClick={alternarFecha}>{estadoSeleccionado.trabaja ? "Marcar como descanso" : "Abrir este día"}</button> : <p className="texto-secundario">Calendario de solo lectura. Selecciona tu nombre para hacer cambios.</p>}
          <div className="citas-del-dia">
            <h3>Citas ({citasDia.length})</h3>
            {citasDia.length ? (
              citasDia.map((cita) => (
                <article key={cita.id}>
                  <time>
                    {fechaHoraEspanola(cita.fechaInicio).split("·")[1]}
                  </time>
                  <div>
                    <strong>{cita.servicio}</strong>
                    <span>{cita.profesional}</span>
                  </div>
                  <InsigniaEstado estado="CONFIRMADA" />
                </article>
              ))
            ) : (
              <p className="texto-secundario">No hay citas para este día.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
