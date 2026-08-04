import { Navigate, Route, Routes } from "react-router-dom";
import { DisposicionPublica } from "../componentes/comunes/DisposicionPublica";
import { DisposicionPanel } from "../componentes/administracion/DisposicionPanel";
import { RutaProtegida } from "./RutaProtegida";
import { RutaPropietario } from "./RutaPropietario";
import { PaginaInicio } from "../paginas/PaginaInicio";
import { PaginaBarberia } from "../paginas/PaginaBarberia";
import { PaginaReserva } from "../paginas/PaginaReserva";
import { PaginaCancelarCita } from "../paginas/PaginaCancelarCita";
import { PaginaReservaConfirmada } from "../paginas/PaginaReservaConfirmada";
import { PaginaInicioSesion } from "../paginas/PaginaInicioSesion";
import { PaginaPanel } from "../paginas/PaginaPanel";
import { PaginaCitas } from "../paginas/PaginaCitas";
import { PaginaServicios } from "../paginas/PaginaServicios";
import { PaginaProfesionales } from "../paginas/PaginaProfesionales";
import { PaginaHorarios } from "../paginas/PaginaHorarios";
import { PaginaDiasBloqueados } from "../paginas/PaginaDiasBloqueados";
import { PaginaNotificaciones } from "../paginas/PaginaNotificaciones";
import { PaginaPerfil } from "../paginas/PaginaPerfil";
export function RutasAplicacion() {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicio />} />
      <Route element={<DisposicionPublica />}>
        <Route path="/barberia-mimi" element={<PaginaBarberia />} />
        <Route path="/barberia-mimi/reservar" element={<PaginaReserva />} />
        <Route
          path="/barberia-mimi/informacion"
          element={<Navigate to="/barberia-mimi" replace />}
        />
        <Route
          path="/barberia-mimi/cancelar"
          element={<PaginaCancelarCita />}
        />
        <Route
          path="/barberia-mimi/reserva-confirmada"
          element={<PaginaReservaConfirmada />}
        />
      </Route>
      <Route path="/barber-login" element={<PaginaInicioSesion />} />
      <Route element={<RutaProtegida />}>
        <Route element={<DisposicionPanel />}>
          <Route
            path="/barberia-mimi-dashboard/:identidad"
            element={<PaginaPanel />}
          />
          <Route
            path="/barberia-mimi-dashboard/:identidad/citas"
            element={<PaginaCitas />}
          />
          <Route
            path="/barberia-mimi-dashboard/:identidad/horarios"
            element={<PaginaHorarios />}
          />
          <Route
            path="/barberia-mimi-dashboard/:identidad/dias-bloqueados"
            element={<PaginaDiasBloqueados />}
          />
            <Route
              path="/barberia-mimi-dashboard/:identidad/notificaciones"
              element={<PaginaNotificaciones />}
            />
            <Route element={<RutaPropietario />}>
              <Route path="/barberia-mimi-dashboard/:identidad/servicios" element={<PaginaServicios />} />
              <Route path="/barberia-mimi-dashboard/:identidad/profesionales" element={<PaginaProfesionales />} />
              <Route path="/barberia-mimi-dashboard/:identidad/perfil" element={<PaginaPerfil />} />
            </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
