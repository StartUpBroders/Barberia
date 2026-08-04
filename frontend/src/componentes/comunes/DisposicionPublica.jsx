import { Link, NavLink, Outlet } from 'react-router-dom';
import fotoPerfilBarberia from '../../assets/perfil-barberia-mimi.jpg';
import { BotonTema } from './BotonTema';
export function DisposicionPublica() { return <div className="aplicacion"><header className="cabecera-publica"><Link className="marca" to="/barberia-mimi"><img className="marca-imagen" src={fotoPerfilBarberia} alt="" aria-hidden="true" /><span>Mimis Barber</span></Link><nav aria-label="Navegación pública"><NavLink to="/barberia-mimi/reservar">Reservar cita</NavLink><NavLink to="/barberia-mimi/cancelar">Cancelar cita</NavLink><BotonTema compacto /></nav></header><main><Outlet /></main><footer className="pie pie-publico"><Link to="/barber-login">Acceso profesional</Link></footer></div>; }
