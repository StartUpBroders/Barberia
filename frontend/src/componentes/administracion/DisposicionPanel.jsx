import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import fotoPerfilBarberia from "../../assets/perfil-barberia-mimi.jpg";
import { usarAutenticacion } from "../../hooks/usarAutenticacion";
import { BotonTema } from "../comunes/BotonTema";
import { rutaBasePanel } from "../../utilidades/rutasPanel";
import { listarProfesionales } from "../../api/profesionalesApi";
import { listarNotificaciones } from "../../api/notificacionesApi";
export function DisposicionPanel() {
  const { sesion, cerrarSesion } = usarAutenticacion();
  const nombrePerfil = sesion?.profesional?.nombre || sesion?.usuario;
  const esPropietario = sesion?.rol === "PROPIETARIO";
  const rolVisible = esPropietario ? "PROPIETARIO" : "EMPLEADO";
  const base = rutaBasePanel(sesion);
  const enlaces = esPropietario ? [
    [base, "Resumen", "⌂"], [`${base}/citas`, "Citas", "◷"], [`${base}/reserva-cita`, "Reserva Cita", "＋"], [`${base}/horarios`, "Calendario", "▦"],
    [`${base}/rutina-laboral`, "Rutina Laboral", "↻"], [`${base}/notificaciones`, "Notificaciones", "◉"], [`${base}/dias-bloqueados`, "Bloqueos parciales", "⊘"], [`${base}/servicios`, "Servicios", "✂"], [`${base}/profesionales`, "Profesionales", "♙"],
  ] : [[`${base}/horarios`, "Calendario", "▦"]];
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [notificacionesPendientes, setNotificacionesPendientes] = useState(0);
  useEffect(() => {
    if (!esPropietario) return undefined;
    let activo = true;
    const cargarEmpleados = () => listarProfesionales().then((lista) => {
      if (activo) setEmpleados(lista.filter((persona) => persona.rol !== "PROPIETARIO" && persona.id !== sesion?.profesional?.id));
    }).catch(() => { if (activo) setEmpleados([]); });
    cargarEmpleados();
    window.addEventListener("equipo-actualizado", cargarEmpleados);
    return () => { activo = false; window.removeEventListener("equipo-actualizado", cargarEmpleados); };
  }, [esPropietario, sesion?.profesional?.id]);
  useEffect(() => {
    if (!esPropietario) return undefined;
    let activo = true;
    const cargarPendientes = () => listarNotificaciones()
      .then((lista) => { if (activo) setNotificacionesPendientes(lista.filter((item) => !item.leida).length); })
      .catch(() => { /* Se conserva el último contador ante un fallo temporal. */ });
    const actualizarPendientes = (evento) => {
      const cantidad = evento.detail?.pendientes;
      if (activo && Number.isInteger(cantidad)) setNotificacionesPendientes(cantidad);
      else cargarPendientes();
    };
    cargarPendientes();
    const temporizador = window.setInterval(cargarPendientes, 15000);
    const actualizarAlVolver = () => cargarPendientes();
    const actualizarAlMostrar = () => { if (document.visibilityState === "visible") cargarPendientes(); };
    window.addEventListener("notificaciones-actualizadas", actualizarPendientes);
    window.addEventListener("focus", actualizarAlVolver);
    document.addEventListener("visibilitychange", actualizarAlMostrar);
    return () => { activo = false; window.clearInterval(temporizador); window.removeEventListener("notificaciones-actualizadas", actualizarPendientes); window.removeEventListener("focus", actualizarAlVolver); document.removeEventListener("visibilitychange", actualizarAlMostrar); };
  }, [esPropietario]);
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
              aria-label={texto === "Notificaciones" && notificacionesPendientes > 0 ? `Notificaciones, ${notificacionesPendientes} ${notificacionesPendientes === 1 ? "pendiente" : "pendientes"}` : undefined}
              onClick={() => setMenuAbierto(false)}
            >
              <span aria-hidden="true">{icono}</span>
              {texto}
              {texto === "Notificaciones" && notificacionesPendientes > 0 && <strong className="contador-notificaciones" aria-hidden="true">{notificacionesPendientes > 99 ? "99+" : notificacionesPendientes}</strong>}
            </NavLink>
          ))}
          {esPropietario && empleados.length > 0 && <div className="tarjetas-empleados-panel" aria-label="Calendarios de empleados">
            {empleados.map((empleado) => <Link key={empleado.id} className={!empleado.activo ? "inactivo" : ""} to={`${base}/horarios?profesional=${empleado.id}`} onClick={() => setMenuAbierto(false)}>
              <span aria-hidden="true">{empleado.nombre.charAt(0)}</span><strong>{empleado.nombre}</strong>{!empleado.activo && <small>Inactivo</small>}
            </Link>)}
          </div>}
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
              to={esPropietario ? `${base}/perfil` : `${base}/horarios`}
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
