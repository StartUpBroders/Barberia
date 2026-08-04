import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import fotoPerfilBarberia from "../../assets/perfil-barberia-mimi.jpg";
import { usarAutenticacion } from "../../hooks/usarAutenticacion";
import { BotonTema } from "../comunes/BotonTema";
import { rutaBasePanel } from "../../utilidades/rutasPanel";
export function DisposicionPanel() {
  const { sesion, cerrarSesion } = usarAutenticacion();
  const nombrePerfil = sesion?.profesional?.nombre || sesion?.usuario;
  const esPropietario = sesion?.rol === "PROPIETARIO";
  const rolVisible = esPropietario ? "PROPIETARIO" : "EMPLEADO";
  const base = rutaBasePanel(sesion);
  const enlaces = [
    [base, "Resumen", "⌂"],
    [`${base}/citas`, "Citas", "◷"],
    [`${base}/horarios`, "Calendario", "▦"],
    [`${base}/notificaciones`, "Notificaciones", "◉"],
    [`${base}/dias-bloqueados`, "Bloqueos parciales", "⊘"],
    ...(esPropietario ? [[`${base}/profesionales`, "Profesionales", "♙"]] : []),
  ];
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const salir = async () => {
    await cerrarSesion();
    navegar("/barber-login", { replace: true });
  };
  return (
    <div className="panel">
      <aside
        id="menu-panel"
        className={`barra-lateral ${menuAbierto ? "abierta" : ""}`}
      >
        <button
          className="cerrar-menu-panel"
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        >
          ×
        </button>
        <div className="marca marca-panel">
          <img
            className="marca-imagen marca-imagen-panel"
            src={fotoPerfilBarberia}
            alt=""
            aria-hidden="true"
          />
          <span>
            Panel {nombrePerfil}<small>{rolVisible}</small>
          </span>
        </div>
        <nav aria-label="Navegación administrativa">
          {enlaces.map(([ruta, texto, icono], indice) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={indice === 0}
              onClick={() => setMenuAbierto(false)}
            >
              <span aria-hidden="true">{icono}</span>
              {texto}
            </NavLink>
          ))}
        </nav>
        <button className="boton boton-secundario boton-salir" onClick={salir}>
          Cerrar sesión
        </button>
      </aside>
      {menuAbierto && (
        <button
          className="fondo-menu-panel"
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}
      <div className="contenido-panel">
        <header className="cabecera-panel">
          <div className="lado-cabecera-panel">
            <button
              className="boton-menu-panel"
              type="button"
              aria-label="Abrir menú"
              aria-controls="menu-panel"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto(true)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <div className="identidad-cabecera-panel">
              <span className="sobretitulo">Barbería</span>
              <strong>{sesion?.barberia?.nombre}</strong>
            </div>
          </div>
          <div className="acciones-cabecera-panel">
            <BotonTema compacto />
            <NavLink
              to={esPropietario ? `${base}/perfil` : base}
              className="usuario-panel boton-perfil-panel"
              aria-label={`Abrir perfil de ${nombrePerfil}`}
            >
              <img
                className="imagen-usuario-panel"
                src={fotoPerfilBarberia}
                alt=""
                aria-hidden="true"
              />
              <div>
                {nombrePerfil}
                <small>{rolVisible}</small>
              </div>
            </NavLink>
          </div>
        </header>
        <main className="pagina-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
