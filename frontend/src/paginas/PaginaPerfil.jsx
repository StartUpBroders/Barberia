import { useEffect, useState } from 'react';
import { actualizarPerfilBarberia, consultarPerfilBarberia } from '../api/perfilBarberiaApi';
import { EstadoCarga } from '../componentes/comunes/EstadoCarga';
import { MensajeEstado } from '../componentes/comunes/MensajeEstado';

const inicial = { nombre: '', telefono: '', instagram: '', direccion: '', urlGoogleMaps: '', mostrarUbicacion: false };
const urlMapaEmbebido = (direccion) => `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&z=17&output=embed`;

export function PaginaPerfil() {
  const [datos, setDatos] = useState(inicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    consultarPerfilBarberia()
      .then((perfil) => setDatos({
        nombre: perfil.nombre || '',
        telefono: perfil.telefono || '',
        instagram: perfil.instagram || '',
        direccion: perfil.direccion || '',
        urlGoogleMaps: perfil.urlGoogleMaps || '',
        mostrarUbicacion: Boolean(perfil.mostrarUbicacion),
      }))
      .catch((fallo) => setError(fallo.mensaje || fallo.message))
      .finally(() => setCargando(false));
  }, []);

  const cambiar = (evento) => {
    const { name, value, checked, type } = evento.target;
    setDatos((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
  };
  const guardar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    setMensaje('');
    try {
      const actualizado = await actualizarPerfilBarberia(datos);
      setDatos((actual) => ({ ...actual, mostrarUbicacion: actualizado.mostrarUbicacion }));
      setMensaje('El perfil público se ha actualizado.');
    } catch (fallo) {
      setError(fallo.mensaje || fallo.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <EstadoCarga texto="Cargando el perfil…" />;
  return <section className="contenido-panel pagina-perfil">
    <div className="encabezado-pagina"><div><p className="sobrelinea">Perfil público</p><h1>Información de la barbería</h1><p>Controla qué datos aparecen en la página que ven tus clientes.</p></div></div>
    <MensajeEstado tipo="error">{error}</MensajeEstado><MensajeEstado tipo="exito">{mensaje}</MensajeEstado>
    <div className="rejilla-perfil">
      <form className="tarjeta formulario-rejilla" onSubmit={guardar}>
        <h2>Datos básicos</h2>
        <label>Nombre de la barbería *<input required maxLength="120" name="nombre" value={datos.nombre} onChange={cambiar} /></label>
        <label>Teléfono de contacto<input inputMode="tel" maxLength="20" name="telefono" value={datos.telefono} onChange={cambiar} /></label>
        <label className="campo-ancho">Instagram<input maxLength="120" name="instagram" value={datos.instagram} onChange={cambiar} placeholder="@usuario o enlace de Instagram" /></label>
        <label className="campo-ancho">Dirección <small>Opcional</small><input maxLength="250" name="direccion" value={datos.direccion} onChange={cambiar} placeholder="Calle, número, localidad y provincia" /></label>
        <label className="campo-ancho">Enlace de Google Maps <small>Opcional</small><textarea maxLength="1000" rows="3" name="urlGoogleMaps" value={datos.urlGoogleMaps} onChange={cambiar} placeholder="Pega aquí el enlace de Google Maps" /></label>
        <label className="opcion-linea campo-ancho"><input type="checkbox" name="mostrarUbicacion" checked={datos.mostrarUbicacion} disabled={!datos.direccion.trim()} onChange={cambiar} /> Mostrar la dirección y el mapa en la página pública</label>
        <p className="campo-ancho texto-secundario">Puedes guardar la dirección y mantener desactivada su publicación. Si no hay dirección, la página se adapta y no deja ningún espacio vacío.</p>
        <button className="boton" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar perfil'}</button>
      </form>
      <aside className="tarjeta previsualizacion-perfil">
        <p className="sobrelinea">Vista previa de ubicación</p><h2>{datos.nombre || 'Barbería Mimi'}</h2>
        {datos.direccion.trim() ? <><p>{datos.direccion}</p><iframe title="Vista previa de la ubicación en Google Maps" src={urlMapaEmbebido(datos.direccion)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />{datos.urlGoogleMaps && <a className="enlace-flecha" href={datos.urlGoogleMaps} target="_blank" rel="noreferrer">Abrir enlace de Google Maps →</a>}<small>{datos.mostrarUbicacion ? 'Esta ubicación será pública.' : 'Vista privada: la ubicación no se está publicando.'}</small></> : <p className="texto-secundario">Añade una dirección para generar la vista previa del mapa.</p>}
      </aside>
    </div>
  </section>;
}
