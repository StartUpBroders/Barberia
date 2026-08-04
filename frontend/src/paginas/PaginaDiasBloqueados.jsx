import { useEffect, useMemo, useState } from "react";
import {
  crearBloqueosParciales,
  eliminarDiaBloqueado,
  listarDiasBloqueados,
} from "../api/diasBloqueadosApi";
import { listarProfesionales } from "../api/profesionalesApi";
import { listarHorarios } from "../api/horariosApi";
import { listarDiasTrabajoEspecial } from "../api/diasTrabajoEspecialApi";
import { consultarConfiguracionReservas } from "../api/configuracionReservasApi";
import { listarCitas } from "../api/citasApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { EstadoVacio } from "../componentes/comunes/EstadoVacio";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";
import { fechaEspanola, horaEspanola } from "../utilidades/fechas";
import { usarAutenticacion } from "../hooks/usarAutenticacion";

const ordenDias = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const formatoDia = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const estadosActivos = new Set(["CONFIRMADA"]);
const fechaIso = (fecha) =>
  [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
const minutos = (hora) => {
  const [h, m] = hora.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};
const hora = (valor) =>
  `${String(Math.floor(valor / 60)).padStart(2, "0")}:${String(valor % 60).padStart(2, "0")}`;
const solapa = (inicioA, finA, inicioB, finB) =>
  inicioA < finB && finA > inicioB;

export function PaginaDiasBloqueados() {
  const { sesion } = usarAutenticacion();
  const esPropietario = sesion?.rol === "PROPIETARIO";
  const profesionalPropioId = sesion?.profesional?.id;
  const [datos, setDatos] = useState(null);
  const [profesionalId, setProfesionalId] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [tramosSeleccionados, setTramosSeleccionados] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [
        bloqueos,
        profesionales,
        horarios,
        especiales,
        citas,
        configuracion,
      ] = await Promise.all([
        listarDiasBloqueados(),
        listarProfesionales(),
        listarHorarios(),
        listarDiasTrabajoEspecial(),
        listarCitas(),
        consultarConfiguracionReservas(),
      ]);
      const profesionalesGestionables = esPropietario ? profesionales : profesionales.filter((persona) => persona.id === profesionalPropioId);
      setDatos({
        bloqueos,
        profesionales: profesionalesGestionables,
        horarios,
        especiales,
        citas,
        configuracion,
      });
      setProfesionalId(
        (actual) => actual || String(profesionalesGestionables[0]?.id || ""),
      );
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    cargar();
  }, []);

  const calendario = useMemo(() => {
    if (!datos || !profesionalId) return [];
    const persona = datos.profesionales.find(
      (item) => item.id === Number(profesionalId),
    );
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ahora = new Date();
    return Array.from(
      { length: datos.configuracion.diasAntelacionReserva + 1 },
      (_, indice) => {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + indice);
        const iso = fechaIso(fecha);
        const bloqueosDia = datos.bloqueos.filter(
          (item) =>
            item.profesionalId === Number(profesionalId) && item.fecha === iso,
        );
        const descanso = bloqueosDia.some((item) => !item.horaInicio);
        const especiales = datos.especiales.filter(
          (item) =>
            item.profesionalId === Number(profesionalId) && item.fecha === iso,
        );
        const rutina = datos.horarios.filter(
          (item) =>
            item.profesionalId === Number(profesionalId) &&
            item.diaSemana === ordenDias[fecha.getDay()] &&
            item.activo,
        );
        const franjas = especiales.length ? especiales : rutina;
        const citasDia = datos.citas.filter(
          (item) =>
            item.profesional === persona?.nombre &&
            item.fechaInicio.startsWith(iso) &&
            estadosActivos.has(item.estado),
        );
        const tramos = [];
        if (!descanso)
          for (const franja of franjas)
            for (
              let cursor = minutos(franja.horaInicio);
              cursor + datos.configuracion.intervaloMinutos <=
              minutos(franja.horaFin);
              cursor += datos.configuracion.intervaloMinutos
            ) {
              const inicio = hora(cursor);
              const fin = hora(cursor + datos.configuracion.intervaloMinutos);
              const futuro = new Date(`${iso}T${inicio}:00`) > ahora;
              const bloqueo = bloqueosDia.find(
                (item) =>
                  item.horaInicio &&
                  solapa(
                    inicio,
                    fin,
                    item.horaInicio.slice(0, 5),
                    item.horaFin.slice(0, 5),
                  ),
              );
              const cita = citasDia.find((item) =>
                solapa(
                  inicio,
                  fin,
                  item.fechaInicio.slice(11, 16),
                  item.fechaFin.slice(11, 16),
                ),
              );
              tramos.push({ inicio, fin, futuro, bloqueo, cita });
            }
        return {
          fecha: iso,
          fechaObjeto: fecha,
          trabaja: franjas.length > 0 && !descanso,
          tramos,
          seleccionable: tramos.some((item) => item.futuro && !item.bloqueo),
        };
      },
    );
  }, [datos, profesionalId]);

  useEffect(() => {
    if (
      calendario.length &&
      (!fechaSeleccionada ||
        !calendario.some(
          (dia) => dia.fecha === fechaSeleccionada && dia.seleccionable,
        ))
    )
      setFechaSeleccionada(
        calendario.find((dia) => dia.seleccionable)?.fecha ||
          calendario[0].fecha,
      );
  }, [calendario, fechaSeleccionada]);
  const diaSeleccionado = calendario.find(
    (dia) => dia.fecha === fechaSeleccionada,
  );
  const bloqueosParciales = (datos?.bloqueos || [])
    .filter(
      (item) => item.profesionalId === Number(profesionalId) && item.horaInicio,
    )
    .sort((a, b) =>
      `${b.fecha}${b.horaInicio}`.localeCompare(`${a.fecha}${a.horaInicio}`),
    );
  const citasAfectadas = [
    ...new Map(
      tramosSeleccionados
        .filter((tramo) => tramo.cita)
        .map((tramo) => [tramo.cita.id, tramo.cita]),
    ).values(),
  ];
  const alternarTramo = (tramo) =>
    setTramosSeleccionados((actuales) =>
      actuales.some((item) => item.inicio === tramo.inicio)
        ? actuales.filter((item) => item.inicio !== tramo.inicio)
        : [...actuales, tramo].sort((a, b) => a.inicio.localeCompare(b.inicio)),
    );

  const bloquear = async () => {
    if (!tramosSeleccionados.length) return;
    setGuardando(true);
    setError("");
    setMensaje("");
    setResultado(null);
    try {
      const respuesta = await crearBloqueosParciales({
        profesionalId: Number(profesionalId),
        fecha: fechaSeleccionada,
        tramos: tramosSeleccionados.map((tramo) => ({
          horaInicio: `${tramo.inicio}:00`,
          horaFin: `${tramo.fin}:00`,
        })),
        motivo: motivo.trim() || null,
      });
      setResultado(respuesta);
      setMensaje(respuesta.mensaje);
      setTramosSeleccionados([]);
      setMotivo("");
      await cargar();
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
    } finally {
      setGuardando(false);
    }
  };
  const eliminar = async (bloqueo) => {
    if (
      !window.confirm(
        `¿Volver a abrir el tramo ${horaEspanola(bloqueo.horaInicio)}–${horaEspanola(bloqueo.horaFin)} del ${fechaEspanola(bloqueo.fecha)}?`,
      )
    )
      return;
    try {
      await eliminarDiaBloqueado(bloqueo.id);
      setMensaje("El tramo vuelve a estar disponible.");
      await cargar();
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
    }
  };

  if (cargando && !datos) return <EstadoCarga texto="Preparando los tramos…" />;
  return (
    <section className="contenido-panel bloqueos-visuales">
      <div className="encabezado-pagina">
        <div>
          <p className="sobrelinea">Excepciones de agenda</p>
          <h1>Bloqueos parciales</h1>
          <p>
            Selecciona todos los tramos que necesites. Las citas afectadas se
            cancelarán y quedarán registradas para avisar al cliente.
          </p>
        </div>
        <label>
          Profesional
          <select
            value={profesionalId}
            onChange={(e) => {
              setProfesionalId(e.target.value);
              setFechaSeleccionada("");
              setTramosSeleccionados([]);
            }}
          >
            <option value="">Selecciona</option>
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
      {resultado?.citasAfectadas?.length > 0 && (
        <section className="tarjeta aviso-contactos">
          <h2>Clientes a los que debes avisar</h2>
          {resultado.citasAfectadas.map((cita) => (
            <p key={cita.citaId}>
              <strong>{cita.nombreCliente}</strong> ·{" "}
              <a href={`tel:${cita.telefonoCliente}`}>{cita.telefonoCliente}</a>{" "}
              · {horaEspanola(cita.fechaInicio)}
            </p>
          ))}
        </section>
      )}
      <section className="tarjeta selector-bloqueo">
        <div>
          <p className="sobrelinea">1. Día</p>
          <h2>¿Cuándo necesitas ausentarte?</h2>
        </div>
        <div className="dias-reserva" role="group" aria-label="Días de trabajo">
          {calendario.map((dia) => (
            <button
              type="button"
              key={dia.fecha}
              disabled={!dia.seleccionable}
              className={`${fechaSeleccionada === dia.fecha ? "seleccionado" : ""} ${dia.seleccionable ? "disponible" : "no-disponible"}`}
              aria-pressed={fechaSeleccionada === dia.fecha}
              onClick={() => {
                setFechaSeleccionada(dia.fecha);
                setTramosSeleccionados([]);
              }}
            >
              <span>{formatoDia.format(dia.fechaObjeto).replace(".", "")}</span>
              <strong>{dia.fechaObjeto.getDate()}</strong>
              <small>
                {dia.trabaja
                  ? `${dia.tramos.filter((item) => item.futuro && !item.bloqueo).length} tramos`
                  : "Descanso"}
              </small>
            </button>
          ))}
        </div>
        <div>
          <p className="sobrelinea">2. Tramos</p>
          <h2>
            {diaSeleccionado
              ? fechaEspanola(diaSeleccionado.fecha)
              : "Selecciona un día"}
          </h2>
          <p className="texto-secundario">
            Puedes marcar varios horarios antes de confirmar.
          </p>
        </div>
        {diaSeleccionado?.tramos.length ? (
          <div
            className="selector-horarios selector-horarios-tarjetas tramos-bloqueo"
            role="group"
            aria-label="Tramos que se pueden bloquear"
          >
            {diaSeleccionado.tramos.map((tramo) => {
              const seleccionado = tramosSeleccionados.some(
                (item) => item.inicio === tramo.inicio,
              );
              return (
                <button
                  type="button"
                  key={tramo.inicio}
                  disabled={!tramo.futuro || Boolean(tramo.bloqueo)}
                  className={`${seleccionado ? "seleccionado" : ""} ${tramo.cita ? "con-cita" : ""} ${tramo.bloqueo ? "ya-bloqueado" : ""}`}
                  aria-pressed={seleccionado}
                  onClick={() => alternarTramo(tramo)}
                >
                  <strong>{tramo.inicio}</strong>
                  <span>
                    {tramo.bloqueo
                      ? "Ya bloqueado"
                      : tramo.cita
                        ? "Cita existente"
                        : seleccionado
                          ? "Seleccionado"
                          : "Libre"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="texto-secundario">
            No hay tramos de trabajo para este día.
          </p>
        )}
        {tramosSeleccionados.length > 0 && (
          <div
            className={`confirmar-bloqueo ${citasAfectadas.length ? "afecta-cita" : ""}`}
          >
            <div>
              <strong>
                {tramosSeleccionados.length}{" "}
                {tramosSeleccionados.length === 1
                  ? "tramo seleccionado"
                  : "tramos seleccionados"}
              </strong>
              <p>
                {citasAfectadas.length
                  ? `${citasAfectadas.length} ${citasAfectadas.length === 1 ? "cita activa se cancelará" : "citas activas se cancelarán"} y se generarán avisos de contacto.`
                  : "Todos están libres y dejarán de aparecer en la reserva pública."}
              </p>
            </div>
            <label>
              Motivo{" "}
              <input
                value={motivo}
                maxLength="250"
                placeholder="Por ejemplo: gestión personal"
                onChange={(e) => setMotivo(e.target.value)}
              />
            </label>
            <button
              className={`boton ${citasAfectadas.length ? "boton-peligro" : ""}`}
              disabled={guardando}
              onClick={bloquear}
            >
              {guardando
                ? "Bloqueando…"
                : citasAfectadas.length
                  ? `Bloquear y cancelar ${citasAfectadas.length} ${citasAfectadas.length === 1 ? "cita" : "citas"}`
                  : `Bloquear ${tramosSeleccionados.length} ${tramosSeleccionados.length === 1 ? "tramo" : "tramos"}`}
            </button>
          </div>
        )}
      </section>
      <section>
        <div className="cabecera-seccion">
          <div>
            <p className="sobrelinea">Tramos cerrados</p>
            <h2>Bloqueos existentes</h2>
          </div>
        </div>
        {bloqueosParciales.length === 0 ? (
          <EstadoVacio
            titulo="Sin bloqueos parciales"
            texto="Todos los tramos de trabajo están disponibles."
          />
        ) : (
          <div className="rejilla-tarjetas">
            {bloqueosParciales.map((bloqueo) => (
              <article className="tarjeta tarjeta-gestion" key={bloqueo.id}>
                <span className="etiqueta">Franja bloqueada</span>
                <h2>{fechaEspanola(bloqueo.fecha)}</h2>
                <strong>
                  {horaEspanola(bloqueo.horaInicio)} –{" "}
                  {horaEspanola(bloqueo.horaFin)}
                </strong>
                <p>{bloqueo.motivo || "Sin motivo indicado"}</p>
                <button
                  className="accion-peligro"
                  onClick={() => eliminar(bloqueo)}
                >
                  Volver a abrir
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
