import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import fotoPerfilBarberia from "../assets/perfil-barberia-mimi.jpg";
import { consultarBarberia } from "../api/barberiasApi";
import { EstadoCarga } from "../componentes/comunes/EstadoCarga";
import { MensajeEstado } from "../componentes/comunes/MensajeEstado";
import { mensajeError } from "../utilidades/errores";
const slug = import.meta.env.VITE_SLUG_BARBERIA || "barberia-mimi";
const urlInstagram = (valor) => {
  if (!valor) return null;
  if (/^https?:\/\//i.test(valor)) return valor;
  return `https://www.instagram.com/${valor.replace(/^@/, "")}/`;
};
const urlMapaEmbebido = (direccion) =>
  `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&z=17&output=embed`;
export function PaginaBarberia() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [recarga, setRecarga] = useState(0);
  useEffect(() => {
    let activa = true;
    consultarBarberia(slug)
      .then((barberia) => activa && setDatos({ barberia }))
      .catch((fallo) => activa && setError(fallo));
    return () => {
      activa = false;
    };
  }, [recarga]);
  if (!datos && !error)
    return (
      <div className="pagina-centrada">
        <EstadoCarga texto="Preparando la barbería…" />
      </div>
    );
  if (error)
    return (
      <section className="seccion seccion-estrecha">
        <MensajeEstado tipo="error">{mensajeError(error)}</MensajeEstado>
        <button
          className="boton"
          onClick={() => {
            setError(null);
            setRecarga((v) => v + 1);
          }}
        >
          Reintentar
        </button>
      </section>
    );
  return (
    <>
      <section className="portada-barberia">
        <div className="presentacion-barberia">
          <img
            className="foto-perfil-barberia"
            src={fotoPerfilBarberia}
            alt={`Foto de perfil de ${datos.barberia.nombre}`}
          />
          <div>
            <span className="sobretitulo">Bienvenido</span>
            <h1>{datos.barberia.nombre}</h1>
            <div className="grupo-botones">
              <Link className="boton" to="/barberia-mimi/reservar">
                Reservar ahora
              </Link>
            </div>
          </div>
        </div>
        <div className="tarjeta-contacto">
          <span>Contacto</span>
          {datos.barberia.telefono ? (
            <a href={`tel:${datos.barberia.telefono}`}>
              {datos.barberia.telefono}
            </a>
          ) : (
            <strong>Consulta al reservar</strong>
          )}
          {datos.barberia.instagram ? (
            <a
              href={urlInstagram(datos.barberia.instagram)}
              target="_blank"
              rel="noreferrer"
            >
              {datos.barberia.instagram}
            </a>
          ) : (
            <small>Atención en la barbería</small>
          )}
        </div>
      </section>
      {datos.barberia.mostrarUbicacion && datos.barberia.direccion && (
        <section className="seccion seccion-ubicacion">
          <div>
            <span className="sobretitulo">Dónde estamos</span>
            <p>{datos.barberia.direccion}</p>
            <a
              className="enlace-flecha"
              href={
                datos.barberia.urlGoogleMaps ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(datos.barberia.direccion)}`
              }
              target="_blank"
              rel="noreferrer"
            >
              Abrir en Google Maps →
            </a>
          </div>
          <iframe
            title="Ubicación de Barbería Mimi en Google Maps"
            src={urlMapaEmbebido(datos.barberia.direccion)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      )}
    </>
  );
}
