import { useEffect, useMemo, useState } from "react";
import {
  cancelarCitaAdministrativa,
  crearCitaAdministrativa,
  listarCitas,
} from "../api/citasApi";
import { listarProfesionales } from "../api/profesionalesApi";
import { listarServicios } from "../api/serviciosApi";
import { consultarCalendarioDisponibilidad } from "../api/disponibilidadApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { EstadoVacio } from "../componentes/comunes/EstadoVacio";
import { InsigniaEstado } from "../componentes/comunes/InsigniaEstado";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";
import {
  fechaEspanola,
  fechaHoraEspanola,
  horaEspanola,
} from "../utilidades/fechas";
import { nuevaClaveIdempotencia } from "../utilidades/idempotencia";
import { usarAutenticacion } from "../hooks/usarAutenticacion";

const ESTADOS_AGENDA = [
  "CONFIRMADA",
  "COMPLETADA",
  "CANCELADA_POR_CLIENTE",
  "CANCELADA_POR_BARBERIA",
];
const ESTADOS_AGENDA_COMPLETA = new Set(ESTADOS_AGENDA);
const ETIQUETAS_ESTADO = {
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Completada",
  CANCELADA_POR_CLIENTE: "Cancelada por cliente",
  CANCELADA_POR_BARBERIA: "Cancelada por barbería",
};
const slug = import.meta.env.VITE_SLUG_BARBERIA || "barberia-mimi";
const formatoDiaReserva = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
});
const DIAS_POR_SEMANA = 7;
const HORAS_POR_PAGINA = 6;
const formularioInicial = {
  nombreCliente: "",
  telefonoCliente: "000000000",
  servicioId: "",
  profesionalId: "",
  fecha: "",
  fechaInicio: "",
  notaCliente: "",
};
const formularioConCatalogo = (catalogo) => {
  const servicios = catalogo.servicios.filter((elemento) => elemento.activo);
  const profesionales = catalogo.profesionales.filter(
    (elemento) => elemento.activo,
  );
  const corte =
    servicios.find(
      (elemento) =>
        elemento.nombre.trim().toLocaleLowerCase("es-ES") === "corte",
    ) || servicios[0];
  const mimi =
    profesionales.find(
      (elemento) =>
        elemento.nombre.trim().toLocaleLowerCase("es-ES") === "mimi",
    ) || profesionales[0];
  return {
    ...formularioInicial,
    servicioId: corte ? String(corte.id) : "",
    profesionalId: mimi ? String(mimi.id) : "",
  };
};
const fechaLocal = (fecha = new Date()) => {
  const desplazada = new Date(
    fecha.getTime() - fecha.getTimezoneOffset() * 60000,
  );
  return desplazada.toISOString().slice(0, 10);
};
const crearFechaLocal = (iso) => new Date(`${iso}T12:00:00`);
const tituloFecha = (iso) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(crearFechaLocal(iso));
const hora = (fechaHora) => fechaHora?.slice(11, 16);

export function PaginaCitas() {
  const { sesion } = usarAutenticacion();
  const esPropietario = sesion?.rol === "PROPIETARIO";
  const profesionalPropioId = sesion?.profesional?.id;
  const [citas, setCitas] = useState([]);
  const [catalogo, setCatalogo] = useState({
    profesionales: [],
    servicios: [],
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [filtros, setFiltros] = useState({ estado: "", profesional: "" });
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [verTodos, setVerTodos] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [guardando, setGuardando] = useState(false);
  const [calendarioReserva, setCalendarioReserva] = useState(null);
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false);
  const [semanaReserva, setSemanaReserva] = useState(0);
  const [paginaHorasReserva, setPaginaHorasReserva] = useState(0);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [nuevasCitas, profesionales, servicios] = await Promise.all([
        listarCitas(),
        listarProfesionales(),
        listarServicios(),
      ]);
      const hoy = fechaLocal();
      const primeraProxima = [...nuevasCitas]
        .filter(
          (cita) =>
            cita.fechaInicio.slice(0, 10) >= hoy &&
            cita.estado === "CONFIRMADA",
        )
        .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))[0];
      setCitas(nuevasCitas);
      setFechaSeleccionada(
        (actual) => actual || primeraProxima?.fechaInicio.slice(0, 10) || hoy,
      );
      const profesionalesGestionables = esPropietario ? profesionales : profesionales.filter((persona) => persona.id === profesionalPropioId);
      const nuevoCatalogo = { profesionales: profesionalesGestionables, servicios };
      setCatalogo(nuevoCatalogo);
      setFormulario((actual) => ({
        ...formularioConCatalogo(nuevoCatalogo),
        nombreCliente: actual.nombreCliente,
        fecha: actual.fecha,
        fechaInicio: actual.fechaInicio,
        notaCliente: actual.notaCliente,
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
    if (!mostrarFormulario || !formulario.profesionalId) {
      setCalendarioReserva(null);
      return undefined;
    }
    const controlador = new AbortController();
    setCargandoDisponibilidad(true);
    consultarCalendarioDisponibilidad(
      slug,
      formulario.profesionalId,
      formulario.servicioId || null,
      controlador.signal,
    )
      .then((respuesta) => {
        setCalendarioReserva(respuesta);
        setFormulario((actual) => {
          const dia = respuesta.dias.find(
            (elemento) => elemento.fecha === actual.fecha,
          );
          if (!dia?.disponible) {
            return { ...actual, fecha: "", fechaInicio: "" };
          }
          if (
            actual.fechaInicio &&
            !dia.horariosDisponibles.some(
              (tramo) => tramo.fechaInicio === actual.fechaInicio,
            )
          ) {
            return { ...actual, fechaInicio: "" };
          }
          return actual;
        });
      })
      .catch((fallo) => {
        if (!controlador.signal.aborted) {
          setError(fallo.mensaje || fallo.message);
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargandoDisponibilidad(false);
      });
    return () => controlador.abort();
  }, [mostrarFormulario, formulario.profesionalId, formulario.servicioId]);

  const diaReservaSeleccionado = calendarioReserva?.dias.find(
    (dia) => dia.fecha === formulario.fecha,
  );
  const totalSemanasReserva = Math.max(
    1,
    Math.ceil((calendarioReserva?.dias.length || 0) / DIAS_POR_SEMANA),
  );
  const diasReservaVisibles = useMemo(
    () =>
      calendarioReserva?.dias.slice(
        semanaReserva * DIAS_POR_SEMANA,
        (semanaReserva + 1) * DIAS_POR_SEMANA,
      ) || [],
    [calendarioReserva, semanaReserva],
  );
  const horariosReserva = diaReservaSeleccionado?.horariosDisponibles || [];
  const totalPaginasHorasReserva = Math.max(
    1,
    Math.ceil(horariosReserva.length / HORAS_POR_PAGINA),
  );
  const horariosReservaVisibles = horariosReserva.slice(
    paginaHorasReserva * HORAS_POR_PAGINA,
    (paginaHorasReserva + 1) * HORAS_POR_PAGINA,
  );
  const etiquetaSemanaReserva = diasReservaVisibles.length
    ? `${fechaEspanola(diasReservaVisibles[0].fecha)} – ${fechaEspanola(diasReservaVisibles.at(-1).fecha)}`
    : "Semana sin fechas";

  const citasVisibles = useMemo(
    () =>
      citas
        .filter(
          (cita) =>
            (!filtros.profesional ||
              cita.profesional === filtros.profesional) &&
            (verTodos
              ? ESTADOS_AGENDA_COMPLETA.has(cita.estado) &&
                (!filtros.estado || cita.estado === filtros.estado)
              : cita.estado === "CONFIRMADA" &&
                cita.fechaInicio.startsWith(fechaSeleccionada)),
        )
        .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)),
    [citas, filtros, fechaSeleccionada, verTodos],
  );
  const grupos = useMemo(
    () =>
      Object.entries(
        citasVisibles.reduce((resultado, cita) => {
          const fecha = cita.fechaInicio.slice(0, 10);
          resultado[fecha] = [...(resultado[fecha] || []), cita];
          return resultado;
        }, {}),
      ).sort(([a], [b]) => a.localeCompare(b)),
    [citasVisibles],
  );
  const hoy = fechaLocal();
  const dias = useMemo(
    () =>
      Array.from({ length: 14 }, (_, indice) => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + indice);
        const iso = fechaLocal(fecha);
        return {
          iso,
          fecha,
          cantidad: citas.filter(
            (cita) =>
              cita.estado === "CONFIRMADA" &&
              cita.fechaInicio.startsWith(iso) &&
              (!filtros.profesional ||
                cita.profesional === filtros.profesional),
          ).length,
        };
      }),
    [citas, filtros.profesional],
  );
  const metricas = useMemo(
    () => ({
      hoy: citas.filter(
        (cita) =>
          cita.fechaInicio.startsWith(hoy) && cita.estado === "CONFIRMADA",
      ).length,
      proximas: citas.filter(
        (cita) =>
          cita.fechaInicio.slice(0, 10) >= hoy && cita.estado === "CONFIRMADA",
      ).length,
      completadas: citas.filter((cita) => cita.estado === "COMPLETADA").length,
    }),
    [citas, hoy],
  );

  const actuar = async (accion, mensaje) => {
    setError("");
    try {
      await accion();
      setExito(mensaje);
      await cargar();
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
    }
  };
  const cancelar = (cita) => {
    if (
      window.confirm(
        `¿Cancelar la cita de ${cita.nombreCliente || 'este cliente'}? Esta acción no puede deshacerse.`,
      )
    )
      actuar(
        () => cancelarCitaAdministrativa(cita.id),
        "La cita se ha cancelado.",
      );
  };
  const cambiarSeleccionReserva = (campo, valor) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
      fecha: "",
      fechaInicio: "",
    }));
    setSemanaReserva(0);
    setPaginaHorasReserva(0);
  };
  const seleccionarDiaReserva = (dia) => {
    if (!dia.disponible) return;
    setFormulario((actual) => ({
      ...actual,
      fecha: dia.fecha,
      fechaInicio: "",
    }));
    setPaginaHorasReserva(0);
  };
  const enviar = async (evento) => {
    evento.preventDefault();
    if (!formulario.fechaInicio) {
      setError("Selecciona un día y un tramo horario para crear la cita.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await crearCitaAdministrativa(
        {
          ...formulario,
          servicioId: Number(formulario.servicioId),
          profesionalId: Number(formulario.profesionalId),
          notaCliente: formulario.notaCliente || null,
        },
        nuevaClaveIdempotencia(),
      );
      setFormulario(formularioConCatalogo(catalogo));
      setMostrarFormulario(false);
      setExito("La cita manual se ha creado.");
      await cargar();
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
      if (fallo.estadoHttp === 409) {
        setFormulario((actual) => ({ ...actual, fechaInicio: "" }));
        try {
          setCalendarioReserva(
            await consultarCalendarioDisponibilidad(
              slug,
              formulario.profesionalId,
              formulario.servicioId,
            ),
          );
        } catch {
          // Se conserva el mensaje del conflicto original.
        }
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="contenido-panel pagina-citas">
      <div className="encabezado-pagina">
        <div>
          <p className="sobrelinea">Agenda rápida</p>
          <h1>Citas</h1>
          <p>Encuentra cada día y contacta con el cliente sin perder tiempo.</p>
        </div>
        <button
          className="boton"
          onClick={() => setMostrarFormulario((visible) => !visible)}
        >
          {mostrarFormulario ? "Cerrar formulario" : "+ Nueva cita"}
        </button>
      </div>
      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <MensajeEstado tipo="exito">{exito}</MensajeEstado>
      {mostrarFormulario && (
        <form
          className="tarjeta formulario-rejilla formulario-cita"
          onSubmit={enviar}
        >
          <h2>Nueva cita manual</h2>
          <label>
            Nombre del cliente *
            <input
              required
              maxLength="100"
              value={formulario.nombreCliente}
              onChange={(e) =>
                setFormulario({ ...formulario, nombreCliente: e.target.value })
              }
            />
          </label>
          <label>
            Servicio *
            <select
              required
              value={formulario.servicioId}
              onChange={(e) =>
                cambiarSeleccionReserva("servicioId", e.target.value)
              }
            >
              <option value="">Selecciona</option>
              {catalogo.servicios
                .filter((x) => x.activo)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Profesional *
            <select
              required
              value={formulario.profesionalId}
              onChange={(e) =>
                cambiarSeleccionReserva("profesionalId", e.target.value)
              }
            >
              <option value="">Selecciona</option>
              {catalogo.profesionales
                .filter((x) => x.activo)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
            </select>
          </label>
          <fieldset className="campo-ancho selector-fecha-admin">
            <legend>Elige el día</legend>
            {cargandoDisponibilidad ? (
              <EstadoCarga texto="Consultando el calendario…" />
            ) : (
              <>
                <div className="navegacion-reserva">
                  <button
                    type="button"
                    aria-label="Semana anterior"
                    disabled={semanaReserva === 0}
                    onClick={() => setSemanaReserva((semana) => semana - 1)}
                  >
                    ‹
                  </button>
                  <strong>{etiquetaSemanaReserva}</strong>
                  <button
                    type="button"
                    aria-label="Semana siguiente"
                    disabled={semanaReserva >= totalSemanasReserva - 1}
                    onClick={() => setSemanaReserva((semana) => semana + 1)}
                  >
                    ›
                  </button>
                </div>
                <div
                  className="dias-reserva semana-reserva"
                  role="group"
                  aria-label="Días disponibles para la cita manual"
                >
                  {diasReservaVisibles.map((dia) => {
                    const fecha = crearFechaLocal(dia.fecha);
                    return (
                      <button
                        type="button"
                        key={dia.fecha}
                        disabled={!dia.disponible}
                        className={`${formulario.fecha === dia.fecha ? "seleccionado" : ""} ${dia.disponible ? "disponible" : "no-disponible"}`}
                        aria-pressed={formulario.fecha === dia.fecha}
                        onClick={() => seleccionarDiaReserva(dia)}
                      >
                        <span>
                          {formatoDiaReserva.format(fecha).replace(".", "")}
                        </span>
                        <strong>{fecha.getDate()}</strong>
                        <small>
                          {dia.disponible
                            ? `${dia.cantidadHorarios} ${dia.cantidadHorarios === 1 ? "hueco" : "huecos"}`
                            : "Completo"}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </fieldset>
          <fieldset className="campo-ancho selector-fecha-admin">
            <legend>Elige una hora</legend>
            {!formulario.fecha ? (
              <p className="ayuda-campo">Toca primero un día disponible.</p>
            ) : horariosReserva.length ? (
              <>
                <h3 className="titulo-dia-seleccionado">
                  {fechaEspanola(formulario.fecha)}
                </h3>
                <div className="navegacion-reserva navegacion-horas">
                  <button
                    type="button"
                    aria-label="Horas anteriores"
                    disabled={paginaHorasReserva === 0}
                    onClick={() =>
                      setPaginaHorasReserva((pagina) => pagina - 1)
                    }
                  >
                    ‹
                  </button>
                  <strong>
                    Horarios {paginaHorasReserva * HORAS_POR_PAGINA + 1}–
                    {Math.min(
                      (paginaHorasReserva + 1) * HORAS_POR_PAGINA,
                      horariosReserva.length,
                    )}{" "}
                    de {horariosReserva.length}
                  </strong>
                  <button
                    type="button"
                    aria-label="Horas siguientes"
                    disabled={
                      paginaHorasReserva >= totalPaginasHorasReserva - 1
                    }
                    onClick={() =>
                      setPaginaHorasReserva((pagina) => pagina + 1)
                    }
                  >
                    ›
                  </button>
                </div>
                <div
                  className="selector-horarios selector-horarios-tarjetas horas-reserva"
                  role="group"
                  aria-label={`Horarios disponibles para ${fechaEspanola(formulario.fecha)}`}
                >
                  {horariosReservaVisibles.map((tramo) => (
                    <button
                      type="button"
                      key={tramo.fechaInicio}
                      className={
                        formulario.fechaInicio === tramo.fechaInicio
                          ? "seleccionado"
                          : ""
                      }
                      aria-pressed={
                        formulario.fechaInicio === tramo.fechaInicio
                      }
                      onClick={() =>
                        setFormulario((actual) => ({
                          ...actual,
                          fechaInicio: tramo.fechaInicio,
                        }))
                      }
                    >
                      <strong>{horaEspanola(tramo.fechaInicio)}</strong>
                      <span>hasta {horaEspanola(tramo.fechaFin)}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="ayuda-campo">No quedan horas para este día.</p>
            )}
          </fieldset>
          <label className="campo-ancho">
            Nota
            <textarea
              maxLength="1000"
              value={formulario.notaCliente}
              onChange={(e) =>
                setFormulario({ ...formulario, notaCliente: e.target.value })
              }
            />
          </label>
          <button className="boton" disabled={guardando}>
            {guardando ? "Creando…" : "Crear cita"}
          </button>
        </form>
      )}
      <div className="rejilla-metricas metricas-citas">
        <article className="metrica">
          <span>Citas de hoy</span>
          <strong>{metricas.hoy}</strong>
          <small>confirmadas</small>
        </article>
        <article className="metrica">
          <span>Próximas citas</span>
          <strong>{metricas.proximas}</strong>
          <small>desde hoy</small>
        </article>
        <article className="metrica">
          <span>Completadas</span>
          <strong>{metricas.completadas}</strong>
          <small>histórico</small>
        </article>
      </div>
      <div className="tarjeta controles-agenda">
        <div className="filtros-citas">
          {verTodos && (
            <label>
              Estado
              <select
                value={filtros.estado}
                onChange={(e) =>
                  setFiltros({ ...filtros, estado: e.target.value })
                }
              >
                <option value="">Todos los estados</option>
                {ESTADOS_AGENDA.map((estado) => (
                  <option key={estado} value={estado}>
                    {ETIQUETAS_ESTADO[estado]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Profesional
            <select
              value={filtros.profesional}
              onChange={(e) =>
                setFiltros({ ...filtros, profesional: e.target.value })
              }
            >
              <option value="">Todos</option>
              {catalogo.profesionales.map((x) => (
                <option key={x.id}>{x.nombre}</option>
              ))}
            </select>
          </label>
          <button
            className="boton boton-secundario"
            onClick={() => setFiltros({ estado: "", profesional: "" })}
          >
            Limpiar
          </button>
          <button
            className="boton boton-secundario"
            aria-pressed={verTodos}
            onClick={() => setVerTodos((valor) => !valor)}
          >
            {verTodos ? "Volver al día" : "Ver agenda completa"}
          </button>
        </div>
        {!verTodos && (
          <div
            className="dias-reserva dias-agenda"
            aria-label="Seleccionar día de la agenda"
          >
            {dias.map((dia) => (
              <button
                key={dia.iso}
                className={fechaSeleccionada === dia.iso ? "seleccionado" : ""}
                aria-pressed={fechaSeleccionada === dia.iso}
                onClick={() => setFechaSeleccionada(dia.iso)}
              >
                <span>
                  {new Intl.DateTimeFormat("es-ES", {
                    weekday: "short",
                  }).format(dia.fecha)}
                </span>
                <strong>{dia.fecha.getDate()}</strong>
                <small>
                  {dia.cantidad} {dia.cantidad === 1 ? "cita" : "citas"}
                </small>
              </button>
            ))}
          </div>
        )}
      </div>
      {cargando ? (
        <EstadoCarga texto="Cargando citas…" />
      ) : grupos.length === 0 ? (
        <EstadoVacio
          titulo="Sin citas"
          texto={
            verTodos
              ? "No hay resultados para estos filtros."
              : `No hay citas el ${fechaSeleccionada ? tituloFecha(fechaSeleccionada) : "día seleccionado"}.`
          }
        />
      ) : (
        <div className="grupos-citas">
          {grupos.map(([fecha, citasDia]) => (
            <section key={fecha} className="grupo-dia-citas">
              <header>
                <div>
                  <p className="sobrelinea">
                    {fecha === hoy ? "Hoy" : "Agenda del día"}
                  </p>
                  <h2>{tituloFecha(fecha)}</h2>
                </div>
                <span>
                  {citasDia.length} {citasDia.length === 1 ? "cita" : "citas"}
                </span>
              </header>
              <div className="lista-citas-rapida">
                {citasDia.map((cita) => (
                  <article
                    className={`cita-rapida ${cita.estado.toLowerCase()}`}
                    key={cita.id}
                  >
                    <time dateTime={cita.fechaInicio}>
                      {hora(cita.fechaInicio)}
                    </time>
                    <div className="datos-cliente-cita">
                      <strong>{cita.nombreCliente || "Cliente"}</strong>
                      <span>{fechaHoraEspanola(cita.fechaInicio)}</span>
                      {cita.telefonoCliente ? (
                        <a href={`tel:${cita.telefonoCliente}`}>
                          {cita.telefonoCliente}
                        </a>
                      ) : (
                        <span>Teléfono no disponible</span>
                      )}
                    </div>
                    <div className="datos-servicio-cita">
                      <strong>{cita.servicio}</strong>
                      <span>
                        {cita.profesional} · {Number(cita.precio).toFixed(2)} €
                      </span>
                    </div>
                    <InsigniaEstado estado={cita.estado} />
                    <div className="acciones-cita">
                      <button onClick={() => setDetalle(cita)}>
                        Ver ficha
                      </button>
                      {cita.estado === "CONFIRMADA" && (
                        <button
                          className="accion-peligro"
                          onClick={() => cancelar(cita)}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {detalle && (
        <div
          className="modal-fondo"
          role="presentation"
          onMouseDown={() => setDetalle(null)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="cerrar-modal"
              aria-label="Cerrar detalle"
              onClick={() => setDetalle(null)}
            >
              ×
            </button>
            <p className="sobrelinea">Ficha del cliente</p>
            <h2 id="titulo-detalle">Detalle de la cita</h2>
            <dl className="detalle-lista">
              <div>
                <dt>Cliente</dt>
                <dd>{detalle.nombreCliente || "No disponible"}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>
                  {detalle.telefonoCliente ? (
                    <a href={`tel:${detalle.telefonoCliente}`}>
                      {detalle.telefonoCliente}
                    </a>
                  ) : (
                    "No disponible"
                  )}
                </dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>
                  {fechaHoraEspanola(detalle.fechaInicio)} –{" "}
                  {hora(detalle.fechaFin)}
                </dd>
              </div>
              <div>
                <dt>Servicio</dt>
                <dd>
                  {detalle.servicio} · {detalle.precio} €
                </dd>
              </div>
              <div>
                <dt>Profesional</dt>
                <dd>{detalle.profesional}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <InsigniaEstado estado={detalle.estado} />
                </dd>
              </div>
              <div>
                <dt>Nota</dt>
                <dd>{detalle.notaCliente || "Sin notas"}</dd>
              </div>
              {detalle.motivoCancelacion && (
                <div>
                  <dt>Cancelación</dt>
                  <dd>{detalle.motivoCancelacion}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      )}
    </section>
  );
}
