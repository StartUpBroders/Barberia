import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarBarberias } from '../api/barberiasApi';
import { mensajeError } from '../utilidades/errores';
import fotoPerfilBarberia from '../assets/perfil-barberia-mimi.jpg';

export function PaginaInicio() {
  const [barberias, setBarberias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarBarberias().then(setBarberias).catch(setError).finally(() => setCargando(false));
  }, []);

  return <main className="landing-anonima">
    <div className="landing-contenido">
      <section className="directorio-barberias" aria-labelledby="titulo-directorio">
        <p className="sobretitulo">Barberías disponibles</p>
        <h2 id="titulo-directorio">Elige tu barbería</h2>
        {cargando && <p className="texto-secundario">Cargando barberías…</p>}
        {error && <p className="mensaje mensaje-error" role="alert">{mensajeError(error)}</p>}
        {!cargando && !error && barberias.length === 0 && <p className="texto-secundario">Ahora mismo no hay barberías disponibles.</p>}
        {barberias.length > 0 && <nav className="lista-barberias" aria-label="Barberías disponibles">
          {barberias.map((barberia) => <Link className="enlace-barberia" to={`/${barberia.slug}`} key={barberia.id}>
            <img className="inicial-barberia imagen-barberia-directorio" src={fotoPerfilBarberia} alt="" aria-hidden="true" />
            <span><strong>{barberia.nombre}</strong><small>Ver información y reservar</small></span>
            <span className="flecha-barberia" aria-hidden="true">→</span>
          </Link>)}
        </nav>}
      </section>
    </div>
    <footer>Gestión de citas</footer>
  </main>;
}
