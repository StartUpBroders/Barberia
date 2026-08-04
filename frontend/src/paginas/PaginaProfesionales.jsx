import { useEffect, useState } from 'react';
import { actualizarProfesional, cambiarEstadoProfesional, crearProfesional, listarProfesionales } from '../api/profesionalesApi';
import { EstadoCarga } from '../componentes/comunes/EstadoCarga';
import { EstadoVacio } from '../componentes/comunes/EstadoVacio';
import { MensajeEstado } from '../componentes/comunes/MensajeEstado';

const inicial = { nombre: '', alias: '', nombreUsuario: '', contrasena: '' };

export function PaginaProfesionales() {
  const [lista, setLista] = useState([]);
  const [formulario, setFormulario] = useState(inicial);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const profesionalEditado = lista.find((persona) => persona.id === editando);
  const necesitaCrearAcceso = Boolean(editando && !profesionalEditado?.nombreUsuario);

  const cargar = async () => {
    setCargando(true);
    try { setLista(await listarProfesionales()); }
    catch (fallo) { setError(fallo.mensaje || fallo.message); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const cambiar = (campo, valor) => setFormulario((actual) => ({ ...actual, [campo]: valor }));
  const cancelarEdicion = () => { setEditando(null); setFormulario(inicial); setError(''); };
  const enviar = async (evento) => {
    evento.preventDefault();
    setError('');
    setMensaje('');
    try {
      const datos = {
        nombre: formulario.nombre.trim(),
        alias: formulario.alias.trim() || null,
        nombreUsuario: formulario.nombreUsuario.trim() || null,
        contrasena: formulario.contrasena || null,
      };
      if (editando) await actualizarProfesional(editando, datos);
      else await crearProfesional(datos);
      setMensaje(editando ? 'Profesional y acceso actualizados.' : 'Profesional creado. Ya puede entrar con sus credenciales.');
      setFormulario(inicial);
      setEditando(null);
      await cargar();
    } catch (fallo) { setError(fallo.mensaje || fallo.message); }
  };
  const editar = (persona) => {
    setEditando(persona.id);
    setFormulario({ nombre: persona.nombre, alias: persona.alias || '', nombreUsuario: persona.nombreUsuario || '', contrasena: '' });
    setError('');
    setMensaje('');
  };
  const alternar = async (persona) => {
    if (!window.confirm(`¿${persona.activo ? 'Desactivar' : 'Activar'} a ${persona.nombre}?`)) return;
    try { await cambiarEstadoProfesional(persona.id, !persona.activo); await cargar(); }
    catch (fallo) { setError(fallo.mensaje || fallo.message); }
  };

  return <section className="contenido-panel">
    <div className="encabezado-pagina"><div><p className="sobrelinea">Equipo</p><h1>Profesionales</h1><p>Crea cada empleado con su propio acceso al panel de la barbería.</p></div></div>
    <MensajeEstado tipo="error">{error}</MensajeEstado><MensajeEstado tipo="exito">{mensaje}</MensajeEstado>
    <form className="tarjeta formulario-rejilla" onSubmit={enviar}>
      <h2>{editando ? 'Editar profesional' : 'Nuevo profesional'}</h2>
      <label><span className="etiqueta-campo">Nombre <span aria-hidden="true">*</span></span><input required maxLength="100" value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} /></label>
      <label><span className="etiqueta-campo">Alias</span><input maxLength="80" value={formulario.alias} onChange={(e) => cambiar('alias', e.target.value)} /></label>
      <label><span className="etiqueta-campo">Usuario <span aria-hidden="true">*</span></span><input required={!editando || necesitaCrearAcceso} minLength="3" maxLength="40" autoComplete="off" value={formulario.nombreUsuario} onChange={(e) => cambiar('nombreUsuario', e.target.value)} /></label>
      <label><span className="etiqueta-campo">{editando && profesionalEditado?.nombreUsuario ? 'Nueva contraseña' : 'Contraseña'} {(!editando || necesitaCrearAcceso) && <span aria-hidden="true">*</span>}</span><input required={!editando || necesitaCrearAcceso} minLength="10" maxLength="200" type="password" autoComplete="new-password" value={formulario.contrasena} onChange={(e) => cambiar('contrasena', e.target.value)} /></label>
      <p className="ayuda-campo campo-ancho">El acceso se crea como empleado de esta barbería. Podrá gestionar su agenda y consultar el calendario del equipo.</p>
      <div className="grupo-botones"><button className="boton">{editando ? 'Guardar cambios' : 'Crear profesional y acceso'}</button>{editando && <button type="button" onClick={cancelarEdicion}>Cancelar</button>}</div>
    </form>
    {cargando ? <EstadoCarga /> : lista.length === 0 ? <EstadoVacio titulo="Sin profesionales" texto="Añade el primer miembro del equipo." /> : <div className="rejilla-tarjetas">{lista.map((persona) => <article className={`tarjeta tarjeta-gestion ${!persona.activo ? 'inactivo' : ''}`} key={persona.id}><span className="avatar" aria-hidden="true">{persona.nombre.charAt(0)}</span><div><span className="etiqueta">{persona.activo ? 'Activo' : 'Inactivo'}</span><h2>{persona.nombre}</h2><p>{persona.alias || 'Sin alias'}</p><small>{persona.nombreUsuario ? `Acceso: ${persona.nombreUsuario} · ${persona.rol === 'PROPIETARIO' ? 'Propietario' : 'Empleado'}` : 'Sin acceso al panel'}</small></div><div className="grupo-botones"><button onClick={() => editar(persona)}>Editar</button><button onClick={() => alternar(persona)}>{persona.activo ? 'Desactivar' : 'Activar'}</button></div></article>)}</div>}
  </section>;
}
