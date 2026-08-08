import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarServiciosPublicos } from '../api/serviciosApi';
import { listarProfesionalesPublicos } from '../api/profesionalesApi';
import { consultarCalendarioDisponibilidad } from '../api/disponibilidadApi';
import { crearCita } from '../api/citasApi';
import { CampoError } from '../componentes/comunes/CampoError';
import { EstadoCarga } from '../componentes/comunes/EstadoCarga';
import { MensajeEstado } from '../componentes/comunes/MensajeEstado';
import { fechaEspanola, horaEspanola } from '../utilidades/fechas';
import { erroresPorCampo, mensajeError } from '../utilidades/errores';
import { hayErrores, validarReserva } from '../utilidades/validaciones';
import { nuevaClaveIdempotencia } from '../utilidades/idempotencia';

const slug = import.meta.env.VITE_SLUG_BARBERIA || 'barberia-mimi';
const inicial = { nombreCliente: '', telefonoCliente: '', servicioId: '', profesionalId: '', fecha: '', fechaInicio: '', notaCliente: '' };
const formatoDia = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });
const DIAS_POR_PAGINA = 7;
const HORAS_POR_PAGINA = 6;

export function PaginaReserva() {
  const [datos, setDatos] = useState(inicial);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [calendario, setCalendario] = useState(null);
  const [semanaVisible, setSemanaVisible] = useState(0);
  const [paginaHoras, setPaginaHoras] = useState(0);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [cargandoCalendario, setCargandoCalendario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const clave = useRef(null);
  const navegar = useNavigate();

  useEffect(() => {
    Promise.all([listarServiciosPublicos(slug), listarProfesionalesPublicos(slug)])
      .then(([listaServicios, listaProfesionales]) => {
        setServicios(listaServicios);
        setProfesionales(listaProfesionales);
        if (listaProfesionales.length === 1) setDatos((actual) => ({ ...actual, profesionalId: String(listaProfesionales[0].id) }));
      })
      .catch(setMensaje)
      .finally(() => setCargandoCatalogo(false));
  }, []);

  useEffect(() => {
    if (!datos.profesionalId) { setCalendario(null); return undefined; }
    const controlador = new AbortController(); setCargandoCalendario(true); setMensaje(null);
    consultarCalendarioDisponibilidad(slug, datos.profesionalId, datos.servicioId || null, controlador.signal)
      .then((respuesta) => {
        setCalendario(respuesta);
        setDatos((actual) => {
          if (!actual.fecha) return actual;
          const diaActual = respuesta.dias.find((dia) => dia.fecha === actual.fecha);
          if (!diaActual?.disponible) return { ...actual, fecha: '', fechaInicio: '' };
          if (actual.fechaInicio && !diaActual.horariosDisponibles.some((tramo) => tramo.fechaInicio === actual.fechaInicio)) return { ...actual, fechaInicio: '' };
          return actual;
        });
      })
      .catch((fallo) => { if (!controlador.signal.aborted) setMensaje(fallo); })
      .finally(() => { if (!controlador.signal.aborted) setCargandoCalendario(false); });
    return () => controlador.abort();
  }, [datos.servicioId, datos.profesionalId]);

  const cambiar = (evento) => {
    const { name, value } = evento.target;
    const valor = name === 'telefonoCliente' ? value.replace(/\D/g, '').slice(0, 9) : value;
    if (name === 'profesionalId') { setSemanaVisible(0); setPaginaHoras(0); setCargandoCalendario(Boolean(value)); }
    if (name === 'servicioId') { setPaginaHoras(0); setCargandoCalendario(Boolean(datos.profesionalId)); }
    setDatos((actual) => ({ ...actual, [name]: valor, ...(name === 'profesionalId' ? { fecha: '', fechaInicio: '' } : {}), ...(name === 'servicioId' ? { fechaInicio: '' } : {}) }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
    clave.current = null;
  };
  const seleccionarDia = (dia) => {
    if (!dia.disponible) return;
    setDatos((actual) => ({ ...actual, fecha: dia.fecha, fechaInicio: '' }));
    setPaginaHoras(0);
    setErrores((actual) => ({ ...actual, fecha: undefined, fechaInicio: undefined }));
    clave.current = null;
  };
  const seleccionarHorario = (fechaInicio) => { setDatos((actual) => ({ ...actual, fechaInicio })); setErrores((actual) => ({ ...actual, fechaInicio: undefined })); clave.current = null; };
  const diaSeleccionado = calendario?.dias.find((dia) => dia.fecha === datos.fecha);
  const totalSemanas = Math.max(1, Math.ceil((calendario?.dias.length || 0) / DIAS_POR_PAGINA));
  const diasVisibles = useMemo(() => calendario?.dias.slice(semanaVisible * DIAS_POR_PAGINA, (semanaVisible + 1) * DIAS_POR_PAGINA) || [], [calendario, semanaVisible]);
  const horarios = datos.servicioId && diaSeleccionado ? diaSeleccionado.horariosDisponibles : [];
  const totalPaginasHoras = Math.max(1, Math.ceil(horarios.length / HORAS_POR_PAGINA));
  const horariosVisibles = horarios.slice(paginaHoras * HORAS_POR_PAGINA, (paginaHoras + 1) * HORAS_POR_PAGINA);
  const etiquetaSemana = diasVisibles.length ? `${fechaEspanola(diasVisibles[0].fecha)} – ${fechaEspanola(diasVisibles.at(-1).fecha)}` : 'Semana sin fechas';

  const enviar = async (evento) => {
    evento.preventDefault(); const validacion = validarReserva(datos); setErrores(validacion); if (hayErrores(validacion)) return;
    if (!clave.current) clave.current = nuevaClaveIdempotencia(); setEnviando(true); setMensaje(null);
    try {
      const respuesta = await crearCita(slug, { nombreCliente: datos.nombreCliente.trim(), telefonoCliente: datos.telefonoCliente.trim(), servicioId: Number(datos.servicioId), profesionalId: Number(datos.profesionalId), fechaInicio: datos.fechaInicio, notaCliente: datos.notaCliente.trim() || null }, clave.current);
      navegar('/barberia-mimi/reserva-confirmada', { replace: true, state: { cita: respuesta } });
    } catch (fallo) {
      setErrores((actual) => ({ ...actual, ...erroresPorCampo(fallo) })); setMensaje(fallo);
      if (fallo.estadoHttp === 409) {
        setDatos((actual) => ({ ...actual, fechaInicio: '' }));
        try { setCalendario(await consultarCalendarioDisponibilidad(slug, datos.profesionalId, datos.servicioId)); } catch { /* Se conserva el conflicto original. */ }
      }
    } finally { setEnviando(false); }
  };

  if (cargandoCatalogo) return <div className="pagina-centrada"><EstadoCarga texto="Cargando servicios y profesionales…" /></div>;
  return <section className="seccion seccion-formulario reserva-moderna">
    <div className="encabezado-pagina"><div><span className="sobretitulo">Reserva online</span><h1>Prepara tu cita</h1></div></div>
    {mensaje && <MensajeEstado tipo="error">{mensajeError(mensaje)}</MensajeEstado>}
    <form className="formulario-reserva-abierto" onSubmit={enviar} noValidate>
      <fieldset className="bloque-eleccion-reserva"><legend>Servicio y profesional</legend><div className="rejilla-formulario"><label><span className="etiqueta-campo">Servicio <span aria-hidden="true">*</span></span><select name="servicioId" value={datos.servicioId} onChange={cambiar} required><option value="">Selecciona un servicio</option>{servicios.map((servicio) => <option key={servicio.id} value={servicio.id}>{servicio.nombre} · {Number(servicio.precio).toFixed(2)} €</option>)}</select><CampoError id="error-servicio" mensaje={errores.servicioId} /></label><label><span className="etiqueta-campo">Profesional <span aria-hidden="true">*</span></span><select name="profesionalId" value={datos.profesionalId} onChange={cambiar} required><option value="">Selecciona un profesional</option>{profesionales.map((profesional) => <option key={profesional.id} value={profesional.id}>{profesional.nombre}</option>)}</select>{profesionales.length === 1 && <small>Mimi se ha seleccionado automáticamente.</small>}<CampoError id="error-profesional" mensaje={errores.profesionalId} /></label></div></fieldset>
      <fieldset className="bloque-ancho-reserva"><legend>Elige el día</legend>{!datos.profesionalId ? <p className="ayuda-campo">Selecciona un profesional para cargar sus fechas.</p> : cargandoCalendario ? <EstadoCarga texto="Consultando el calendario…" /> : <><div className="navegacion-reserva"><button type="button" aria-label="Semana anterior" disabled={semanaVisible === 0} onClick={() => setSemanaVisible((semana) => semana - 1)}>‹</button><strong>{etiquetaSemana}</strong><button type="button" aria-label="Semana siguiente" disabled={semanaVisible >= totalSemanas - 1} onClick={() => setSemanaVisible((semana) => semana + 1)}>›</button></div><div className="dias-reserva semana-reserva" role="group" aria-label="Días disponibles">{diasVisibles.map((dia) => { const fecha = new Date(`${dia.fecha}T12:00:00`); return <button type="button" key={dia.fecha} disabled={!dia.disponible} className={`${datos.fecha === dia.fecha ? 'seleccionado' : ''} ${dia.disponible ? 'disponible' : 'no-disponible'}`} aria-pressed={datos.fecha === dia.fecha} onClick={() => seleccionarDia(dia)}><span>{formatoDia.format(fecha).replace('.', '')}</span><strong>{fecha.getDate()}</strong><small>{dia.disponible ? `${dia.cantidadHorarios} ${dia.cantidadHorarios === 1 ? 'hueco' : 'huecos'}` : 'Completo'}</small></button>; })}</div><p className="leyenda-calendario"><span className="punto disponible" /> Disponible <span className="punto completo" /> Sin huecos · reservas hasta {fechaEspanola(calendario?.hasta)}</p></>}<CampoError id="error-fecha" mensaje={errores.fecha} /></fieldset>
      <fieldset className="bloque-ancho-reserva"><legend>Elige una hora</legend>{!datos.fecha ? <p className="ayuda-campo">Puedes escoger un día en el calendario superior.</p> : !datos.servicioId ? <p className="ayuda-campo">Elige el servicio para calcular la duración exacta de los huecos de este día.</p> : cargandoCalendario ? <EstadoCarga texto="Calculando horas exactas…" /> : <><h2 className="titulo-dia-seleccionado">{fechaEspanola(diaSeleccionado?.fecha)}</h2>{horarios.length ? <><div className="navegacion-reserva navegacion-horas"><button type="button" aria-label="Horas anteriores" disabled={paginaHoras === 0} onClick={() => setPaginaHoras((pagina) => pagina - 1)}>‹</button><strong>Horarios {paginaHoras * HORAS_POR_PAGINA + 1}–{Math.min((paginaHoras + 1) * HORAS_POR_PAGINA, horarios.length)} de {horarios.length}</strong><button type="button" aria-label="Horas siguientes" disabled={paginaHoras >= totalPaginasHoras - 1} onClick={() => setPaginaHoras((pagina) => pagina + 1)}>›</button></div><div className="selector-horarios selector-horarios-tarjetas horas-reserva" role="group" aria-label={`Horarios disponibles para ${fechaEspanola(datos.fecha)}`}>{horariosVisibles.map((horario) => <button type="button" key={horario.fechaInicio} className={datos.fechaInicio === horario.fechaInicio ? 'seleccionado' : ''} aria-pressed={datos.fechaInicio === horario.fechaInicio} onClick={() => seleccionarHorario(horario.fechaInicio)}><strong>{horaEspanola(horario.fechaInicio)}</strong><span>hasta {horaEspanola(horario.fechaFin)}</span></button>)}</div></> : <p className="ayuda-campo">Ya no quedan horas disponibles para esta combinación.</p>}</>}<CampoError id="error-horario" mensaje={errores.fechaInicio} /></fieldset>
      <fieldset className="bloque-datos-reserva"><legend>Datos de contacto</legend><div className="rejilla-formulario"><label><span className="etiqueta-campo">Nombre <span aria-hidden="true">*</span></span><input name="nombreCliente" value={datos.nombreCliente} onChange={cambiar} maxLength="100" autoComplete="name" required aria-describedby="error-nombre" /><CampoError id="error-nombre" mensaje={errores.nombreCliente} /></label><label className="telefono-destacado"><span className="etiqueta-campo">Móvil <span aria-hidden="true">*</span></span><input name="telefonoCliente" value={datos.telefonoCliente} onChange={cambiar} inputMode="numeric" type="tel" autoComplete="tel" pattern="[0-9]{9}" maxLength="9" placeholder="Ej 640664488" required aria-describedby="error-telefono" /><CampoError id="error-telefono" mensaje={errores.telefonoCliente} /></label><label className="campo-ancho">Nota <small>Opcional</small><textarea name="notaCliente" value={datos.notaCliente} onChange={cambiar} maxLength="1000" rows="3" /><CampoError id="error-nota" mensaje={errores.notaCliente} /></label></div></fieldset>
      <button className="boton boton-ancho bloque-ancho-reserva" disabled={enviando}>{enviando ? 'Confirmando reserva…' : 'Confirmar cita'}</button>
    </form>
  </section>;
}
