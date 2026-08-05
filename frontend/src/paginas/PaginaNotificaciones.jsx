import { useEffect, useMemo, useState } from 'react';
import { listarNotificaciones, marcarNotificacionLeida } from '../api/notificacionesApi';
import { EstadoCarga } from '../componentes/comunes/EstadoCarga';
import { EstadoVacio } from '../componentes/comunes/EstadoVacio';
import { MensajeEstado } from '../componentes/comunes/MensajeEstado';
import { fechaHoraNotificacion, formatearMensajeNotificacion, horaEspanola } from '../utilidades/fechas';
const patronClave = /(nueva|nuevo|creada|creado|cancelada|cancelado|confirmada|confirmado|completada|completado|finalizada|finalizado|reprogramada|reprogramado|bloqueada|bloqueado|pendiente|disponible)/gi;
const esClave = /^(nueva|nuevo|creada|creado|cancelada|cancelado|confirmada|confirmado|completada|completado|finalizada|finalizado|reprogramada|reprogramado|bloqueada|bloqueado|pendiente|disponible)$/i;
function TextoDestacado({ texto }) { return String(texto ?? '').split(patronClave).map((parte, indice) => esClave.test(parte) ? <strong className="palabra-clave-notificacion" key={`${parte}-${indice}`}>{parte}</strong> : parte); }
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
function fechaConMes(valor) { const [, mes, dia] = valor.slice(0, 10).split('-'); return `${Number(dia)} de ${meses[Number(mes) - 1]}`; }
function Importante({ children }) { return <strong className="palabra-clave-notificacion">{children}</strong>; }
function contenidoNotificacion(item) {
  const tieneDatosCita = item.tipo === 'CITA_CANCELADA' && item.nombreCliente && item.telefonoCliente && item.fechaInicio && item.fechaFin;
  if (tieneDatosCita && item.canceladaPor === 'BARBERIA') {
    const descansoCompleto = item.mensaje?.includes('marcar ese día como descanso');
    return {
      titulo: descansoCompleto ? `Contactar con ${item.nombreCliente} por día de descanso` : `Contactar con ${item.nombreCliente} por cambio de agenda`,
      mensaje: <>Se canceló la cita de <Importante>{item.nombreCliente}</Importante> con número <Importante>{item.telefonoCliente}</Importante> para el <Importante>{fechaConMes(item.fechaInicio)}</Importante> <Importante>a las</Importante> <Importante>{horaEspanola(item.fechaInicio)}</Importante> {descansoCompleto ? 'al marcar ese día como descanso' : 'al bloquear esa franja'}. Contacta con el cliente para avisarle.</>,
    };
  }
  if (tieneDatosCita) return {
    titulo: `${item.nombreCliente} canceló su cita`,
    mensaje: <>El cliente <Importante>{item.nombreCliente}</Importante> con número <Importante>{item.telefonoCliente}</Importante> canceló su cita para el <Importante>{fechaConMes(item.fechaInicio)}</Importante> <Importante>a las</Importante> <Importante>{horaEspanola(item.fechaInicio)}</Importante>. El tramo de {horaEspanola(item.fechaInicio)} a {horaEspanola(item.fechaFin)} ha quedado <Importante>disponible</Importante>.</>,
  };
  return { titulo: item.titulo, mensaje: <TextoDestacado texto={formatearMensajeNotificacion(item.mensaje)} /> };
}
function presentacionNotificacion(item) {
  if (item.tipo !== 'CITA_CANCELADA') return { clase: '', etiqueta: item.tipo.replaceAll('_', ' ') };
  if (item.canceladaPor === 'BARBERIA') return item.leida
    ? { clase: 'requiere-contacto cliente-avisado', etiqueta: 'CLIENTE AVISADO' }
    : { clase: 'requiere-contacto', etiqueta: 'REQUIERE CONTACTAR AL CLIENTE' };
  return { clase: 'cancelacion-cliente', etiqueta: 'CANCELADA POR EL CLIENTE' };
}
const categorias = [
  { id: 'contacto', titulo: 'Requieren contactar al cliente', descripcion: 'Cambios de agenda que debes comunicar personalmente.' },
  { id: 'cancelaciones', titulo: 'Cancelaciones realizadas por clientes', descripcion: 'Citas que el propio cliente ha cancelado.' },
  { id: 'informativas', titulo: 'Informativas', descripcion: 'Otros avisos relacionados con la agenda.' },
];
const periodos = [
  { id: 'hoy', titulo: 'Hoy' },
  { id: 'ayer', titulo: 'Ayer' },
  { id: 'anteriores', titulo: 'Anteriores' },
];
function fechaIsoLocal(fecha) { return [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'), String(fecha.getDate()).padStart(2, '0')].join('-'); }
function categoriaDe(item) {
  if (item.tipo === 'CITA_CANCELADA' && item.canceladaPor === 'BARBERIA') return 'contacto';
  if (item.tipo === 'CITA_CANCELADA' && item.canceladaPor === 'CLIENTE') return 'cancelaciones';
  return 'informativas';
}
function periodoDe(item) {
  const hoy = new Date(); const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const fecha = item.fechaCreacion?.slice(0, 10);
  if (fecha === fechaIsoLocal(hoy)) return 'hoy';
  if (fecha === fechaIsoLocal(ayer)) return 'ayer';
  return 'anteriores';
}
function TarjetaNotificacion({ item, alMarcar }) {
  const contenido = contenidoNotificacion(item); const presentacion = presentacionNotificacion(item); const requiereContacto = categoriaDe(item) === 'contacto';
  return <article className={`tarjeta notificacion ${presentacion.clase} ${item.leida ? 'leida' : 'no-leida'}`}><div className="punto-notificacion" aria-hidden="true" /><div><div className="notificacion-meta"><span>{presentacion.etiqueta}</span><time>{fechaHoraNotificacion(item.fechaCreacion)}</time></div><h2>{contenido.titulo}</h2><p>{contenido.mensaje}</p></div>{!item.leida && <button onClick={() => alMarcar(item.id)}>{requiereContacto ? 'Marcar cliente como avisado' : 'Marcar como leída'}</button>}</article>;
}
export function PaginaNotificaciones() {
  const [lista, setLista] = useState([]); const [vista, setVista] = useState('pendientes'); const [categoriaActiva, setCategoriaActiva] = useState(null); const [periodosAbiertos, setPeriodosAbiertos] = useState({ hoy: true }); const [limites, setLimites] = useState({}); const [cargando, setCargando] = useState(true); const [error, setError] = useState('');
  const cargar = async () => { setCargando(true); try { setLista(await listarNotificaciones()); } catch (fallo) { setError(fallo.mensaje || fallo.message); } finally { setCargando(false); } };
  useEffect(() => { cargar(); }, []);
  useEffect(() => {
    if (!cargando) window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { detail: { pendientes: lista.filter((item) => !item.leida).length } }));
  }, [lista, cargando]);
  const pendientes = lista.filter((item) => !item.leida).length;
  const resueltas = lista.length - pendientes;
  const visibles = useMemo(() => lista.filter((item) => vista === 'pendientes' ? !item.leida : item.leida).sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)), [lista, vista]);
  const conteosCategorias = useMemo(() => Object.fromEntries(categorias.map((categoria) => [categoria.id, visibles.filter((item) => categoriaDe(item) === categoria.id).length])), [visibles]);
  const categoriaSeleccionada = categoriaActiva || categorias.find((categoria) => conteosCategorias[categoria.id] > 0)?.id || 'contacto';
  const definicionCategoria = categorias.find((categoria) => categoria.id === categoriaSeleccionada);
  const periodosVisibles = useMemo(() => periodos.map((periodo) => ({ ...periodo, elementos: visibles.filter((item) => categoriaDe(item) === categoriaSeleccionada && periodoDe(item) === periodo.id) })).filter((periodo) => periodo.elementos.length), [visibles, categoriaSeleccionada]);
  const marcar = async (id) => { try { const actualizada = await marcarNotificacionLeida(id); setLista((actuales) => actuales.map((item) => item.id === id ? actualizada : item)); } catch (fallo) { setError(fallo.mensaje || fallo.message); } };
  const cambiarVista = (nuevaVista) => { setVista(nuevaVista); setCategoriaActiva(null); setPeriodosAbiertos({ hoy: true }); setLimites({}); };
  const cambiarCategoria = (categoria) => { setCategoriaActiva(categoria); setPeriodosAbiertos({ hoy: true }); setLimites({}); };
  const alternarPeriodo = (periodo) => setPeriodosAbiertos((actuales) => ({ ...actuales, [periodo]: !actuales[periodo] }));
  return <section className="contenido-panel"><div className="encabezado-pagina"><div><p className="sobrelinea">Avisos</p><h1>Notificaciones</h1><p>Novedades relacionadas con la agenda y sus citas.</p></div></div><MensajeEstado tipo="error">{error}</MensajeEstado>{cargando ? <EstadoCarga /> : lista.length === 0 ? <EstadoVacio titulo="Todo al día" texto="No hay notificaciones que mostrar." /> : <><div className="selector-estado-notificaciones" role="tablist" aria-label="Estado de las notificaciones"><button role="tab" aria-selected={vista === 'pendientes'} className={vista === 'pendientes' ? 'activo' : ''} onClick={() => cambiarVista('pendientes')}>Pendientes <span>{pendientes}</span></button><button role="tab" aria-selected={vista === 'resueltas'} className={vista === 'resueltas' ? 'activo' : ''} onClick={() => cambiarVista('resueltas')}>Resueltas <span>{resueltas}</span></button></div><div className="pestanas-tipo-notificacion" role="tablist" aria-label="Tipos de notificación">{categorias.map((categoria) => <button role="tab" aria-selected={categoriaSeleccionada === categoria.id} className={categoriaSeleccionada === categoria.id ? 'activo' : ''} key={categoria.id} onClick={() => cambiarCategoria(categoria.id)}>{categoria.titulo} <span>{conteosCategorias[categoria.id]}</span></button>)}</div>{periodosVisibles.length === 0 ? <EstadoVacio titulo={vista === 'pendientes' ? 'Sin avisos pendientes' : 'Sin avisos resueltos'} texto={`No hay notificaciones en “${definicionCategoria.titulo}”.`} /> : <section className="bandeja-notificaciones" aria-labelledby="titulo-categoria-notificaciones"><header className="cabecera-grupo-notificaciones"><div><h2 id="titulo-categoria-notificaciones">{definicionCategoria.titulo}</h2><p>{definicionCategoria.descripcion}</p></div></header>{periodosVisibles.map((periodo) => { const abierto = Boolean(periodosAbiertos[periodo.id]); const claveLimite = `${vista}-${categoriaSeleccionada}-${periodo.id}`; const limite = limites[claveLimite] || 5; const mostradas = periodo.elementos.slice(0, limite); const restantes = periodo.elementos.length - mostradas.length; return <section className="periodo-notificaciones" key={periodo.id}><button type="button" className="cabecera-periodo-notificaciones" aria-expanded={abierto} onClick={() => alternarPeriodo(periodo.id)}><span aria-hidden="true">{abierto ? '▼' : '▶'}</span><strong>{periodo.titulo}</strong><small>{periodo.elementos.length}</small></button>{abierto && <div className="contenido-periodo-notificaciones"><div className="lista-notificaciones">{mostradas.map((item) => <TarjetaNotificacion item={item} alMarcar={marcar} key={item.id} />)}</div>{restantes > 0 && <button type="button" className="boton boton-secundario boton-ver-mas-notificaciones" onClick={() => setLimites((actuales) => ({ ...actuales, [claveLimite]: limite + 5 }))}>Ver {Math.min(5, restantes)} más</button>}</div>}</section>; })}</section>}</>}</section>;
}
