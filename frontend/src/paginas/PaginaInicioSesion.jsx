import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { usarAutenticacion } from '../hooks/usarAutenticacion';
import { MensajeEstado } from '../componentes/comunes/MensajeEstado';
import { BotonTema } from '../componentes/comunes/BotonTema';
import { mensajeError } from '../utilidades/errores';
import { rutaBasePanel } from '../utilidades/rutasPanel';

export function PaginaInicioSesion() {
  const { autenticado, comprobando, iniciarSesion, sesion } = usarAutenticacion();
  const [datos, setDatos] = useState({ nombreUsuario: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const ubicacion = useLocation();
  const navegar = useNavigate();

  if (!comprobando && autenticado) return <Navigate to={rutaBasePanel(sesion)} replace />;

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!datos.nombreUsuario || !datos.contrasena) {
      setError({ mensaje: 'Escribe el usuario y la contraseña.' });
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const nuevaSesion = await iniciarSesion(datos);
      navegar(ubicacion.state?.desde || rutaBasePanel(nuevaSesion), { replace: true });
    } catch (fallo) {
      setError(fallo);
    } finally {
      setEnviando(false);
    }
  };

  return <main className="pagina-login">
    <section className="tarjeta-login">
      <div className="cabecera-login"><BotonTema /></div>
      <span className="sobretitulo">Bienvenido de nuevo</span>
      <h1>Accede a tu agenda</h1>
      {error && <MensajeEstado tipo="error">{mensajeError(error)}</MensajeEstado>}
      <form onSubmit={enviar}>
        <label>Usuario
          <input name="nombreUsuario" value={datos.nombreUsuario} onChange={(evento) => setDatos((actual) => ({ ...actual, nombreUsuario: evento.target.value }))} autoComplete="username" required />
        </label>
        <label>Contraseña
          <input name="contrasena" type="password" value={datos.contrasena} onChange={(evento) => setDatos((actual) => ({ ...actual, contrasena: evento.target.value }))} autoComplete="current-password" required />
        </label>
        <button className="boton boton-ancho" disabled={enviando || comprobando}>{enviando ? 'Iniciando sesión…' : 'Entrar al panel'}</button>
      </form>
      <Link className="enlace-flecha" to="/">← Volver al listado de barberías</Link>
    </section>
  </main>;
}
