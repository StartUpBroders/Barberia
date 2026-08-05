import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaginaCitas } from "../paginas/PaginaCitas";
import { PaginaReservaCita } from "../paginas/PaginaReservaCita";
import { PaginaServicios } from "../paginas/PaginaServicios";
import { PaginaNotificaciones } from "../paginas/PaginaNotificaciones";
import { PaginaPanel } from "../paginas/PaginaPanel";
import * as citasApi from "../api/citasApi";
import * as serviciosApi from "../api/serviciosApi";
import * as profesionalesApi from "../api/profesionalesApi";
import * as notificacionesApi from "../api/notificacionesApi";
import * as disponibilidadApi from "../api/disponibilidadApi";

vi.mock('../hooks/usarAutenticacion', () => ({ usarAutenticacion: () => ({ sesion: { rol: 'PROPIETARIO', profesional: { id: 2, nombre: 'Mimi', alias: 'mimi' } } }) }));
vi.mock("../api/citasApi");
vi.mock("../api/serviciosApi");
vi.mock("../api/profesionalesApi");
vi.mock("../api/notificacionesApi");
vi.mock("../api/disponibilidadApi");
const cita = {
  id: 1,
  barberia: "Mimi",
  profesional: "Mimi",
  servicio: "Corte",
  precio: 18,
  duracionMinutos: 30,
  fechaInicio: "2030-09-10T10:00:00",
  fechaFin: "2030-09-10T10:30:00",
  estado: "CONFIRMADA",
  nombreCliente: "Ana",
};

describe("administración", () => {
  const renderizarCitas = (ruta = "/citas?fecha=2030-09-10") => render(<MemoryRouter initialEntries={[ruta]}><PaginaCitas /></MemoryRouter>);
  beforeEach(() => {
    citasApi.listarCitas.mockResolvedValue([cita]);
    notificacionesApi.listarNotificaciones.mockResolvedValue([]);
    serviciosApi.listarServicios.mockResolvedValue([
      {
        id: 3,
        nombre: "Corte",
        descripcion: "Corte clásico",
        precio: 18,
        duracionMinutos: 30,
        activo: true,
      },
    ]);
    profesionalesApi.listarProfesionales.mockResolvedValue([
      { id: 2, nombre: "Mimi", activo: true },
    ]);
    disponibilidadApi.consultarCalendarioDisponibilidad.mockResolvedValue({
      desde: "2030-09-10",
      hasta: "2030-10-10",
      dias: [
        {
          fecha: "2030-09-10",
          disponible: true,
          cantidadHorarios: 1,
          horariosDisponibles: [
            {
              fechaInicio: "2030-09-10T11:00:00",
              fechaFin: "2030-09-10T11:45:00",
            },
          ],
        },
      ],
    });
    citasApi.crearCitaAdministrativa.mockResolvedValue({ id: 9 });
  });

  it("limita el resumen a los tres accesos solicitados", async () => {
    const hoy = new Date();
    const iso = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    citasApi.listarCitas.mockResolvedValue([{ ...cita, fechaInicio: `${iso}T10:00:00` }]);
    notificacionesApi.listarNotificaciones.mockResolvedValue([{ id: 8, leida: false }]);
    render(<MemoryRouter><PaginaPanel /></MemoryRouter>);
    expect(await screen.findByRole("link", { name: /Citas de hoy/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Próximas citas/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Notificaciones pendientes/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.queryByText("Total de citas")).not.toBeInTheDocument();
  });

  it("muestra confirmadas y completadas por día y excluye el pasado de la agenda completa", async () => {
    citasApi.listarCitas.mockResolvedValue([
      cita,
      { ...cita, id: 2, nombreCliente: "Luis", estado: "COMPLETADA" },
      {
        ...cita,
        id: 3,
        nombreCliente: "Pablo",
        estado: "CANCELADA_POR_CLIENTE",
      },
      { ...cita, id: 4, nombreCliente: "Reserva vieja", estado: "RESERVADA" },
    ]);
    renderizarCitas();
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Luis")).toBeInTheDocument();
    expect(screen.queryByText("Reserva vieja")).not.toBeInTheDocument();
    const filaConfirmada = screen.getByText("Ana").closest("article");
    const filaCompletada = screen.getByText("Luis").closest("article");
    expect(filaConfirmada).toHaveClass("confirmada");
    expect(filaCompletada).toHaveClass("completada");
    expect(within(filaConfirmada).getByText("10:00")).toBeInTheDocument();
    expect(within(filaConfirmada).getByText("Confirmada")).toBeInTheDocument();
    expect(within(filaConfirmada).getAllByRole("button")).toHaveLength(1);
    expect(within(filaConfirmada).getByRole("button", { name: "Ver ficha" })).toBeInTheDocument();
    expect(within(filaConfirmada).queryByText("Corte")).not.toBeInTheDocument();
    expect(within(filaConfirmada).queryByText("18,00 €")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Ver agenda completa" }),
    );
    expect(screen.getByText("Luis")).toBeInTheDocument();
    expect(screen.queryByText("Pablo")).not.toBeInTheDocument();
    expect(screen.queryByText("Reserva vieja")).not.toBeInTheDocument();
  });

  it("no permite completar una cita manualmente", async () => {
    renderizarCitas();
    await screen.findByText("Ana");
    expect(
      screen.queryByRole("button", { name: "Marcar completada" }),
    ).not.toBeInTheDocument();
  });

  it("mantiene la agenda limpia, sin resúmenes ni selector de profesional", async () => {
    renderizarCitas();
    await screen.findByText("Ana");
    expect(screen.queryByRole("button", { name: "Crear cita" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Profesional/)).not.toBeInTheDocument();
    expect(screen.queryByText("Próximas citas")).not.toBeInTheDocument();
    expect(screen.getByText("10/Septiembre - 16/Septiembre")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver a hoy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Periodo anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Periodo siguiente" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Días desde hoy" }).querySelectorAll("button")).toHaveLength(7);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("martes, 10 de septiembre");
    expect(screen.getByRole("heading", { level: 2 })).not.toHaveTextContent("2030");
  });

  it("permite a Mimi crear una cita rápida indicando solo nombre, día y tramo", async () => {
    render(<PaginaReservaCita />);
    const usuario = userEvent.setup();
    await waitFor(() => expect(disponibilidadApi.consultarCalendarioDisponibilidad).toHaveBeenCalledWith("barberia-mimi", 2, "3", expect.any(AbortSignal)));
    await usuario.type(screen.getByRole("textbox", { name: /Nombre del cliente/ }), "Cliente habitual");
    await usuario.click(within(screen.getByRole("group", { name: "Días disponibles para la cita rápida" })).getByRole("button", { name: /mar.*10.*1 hueco/i }));
    await usuario.click(within(screen.getByRole("group", { name: "Tramos disponibles" })).getByRole("button", { name: /11:00.*11:45/ }));
    await usuario.click(screen.getByRole("button", { name: "Crear cita" }));
    await waitFor(() => expect(citasApi.crearCitaAdministrativa).toHaveBeenCalledWith({
      nombreCliente: "Cliente habitual",
      telefonoCliente: "999999999",
      servicioId: 3,
      profesionalId: 2,
      fechaInicio: "2030-09-10T11:00:00",
      notaCliente: null,
    }, expect.any(String)));
  });

  it("crea un servicio con números normalizados", async () => {
    serviciosApi.crearServicio.mockResolvedValue({ id: 4 });
    render(<PaginaServicios />);
    await screen.findByText("Corte clásico");
    const usuario = userEvent.setup();
    await usuario.type(screen.getByLabelText(/Nombre/), "Barba");
    await usuario.type(screen.getByLabelText(/Precio/), "12.50");
    await usuario.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() =>
      expect(serviciosApi.crearServicio).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: "Barba",
          precio: 12.5,
        }),
      ),
    );
    expect(serviciosApi.crearServicio.mock.calls[0][0]).not.toHaveProperty(
      "duracionMinutos",
    );
  });

  it("permite eliminar definitivamente un servicio sin citas", async () => {
    serviciosApi.eliminarServicio.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<PaginaServicios />);
    await screen.findByText("Corte clásico");
    await userEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(serviciosApi.eliminarServicio).toHaveBeenCalledWith(3));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("Solo será posible si no tiene citas asociadas"));
  });

  it("filtra y marca notificaciones como leídas", async () => {
    const notificacion = {
      id: 9,
      tipo: "CITA_CANCELADA",
      titulo: "Nueva cita",
      mensaje: "El cliente Álvaro Ruiz Gutiérrez canceló el 2026-08-04T02:34:40.2332252 la cita del 2026-08-07T09:00 con Mimi para Corte. Tramo liberado: 2026-08-07T09:00 - 2026-08-07T09:45.",
      leida: false,
      citaId: 1,
      fechaCreacion: "2030-09-10T09:00:00",
      canceladaPor: "CLIENTE",
      nombreCliente: "Álvaro Ruiz Gutiérrez",
      telefonoCliente: "999999999",
      fechaInicio: "2026-08-07T09:00:00",
      fechaFin: "2026-08-07T09:45:00",
    };
    notificacionesApi.listarNotificaciones.mockResolvedValue([notificacion]);
    notificacionesApi.marcarNotificacionLeida.mockResolvedValue({
      ...notificacion,
      leida: true,
    });
    render(<PaginaNotificaciones />);
    await userEvent.click(await screen.findByRole("button", { name: /Anteriores\s*1/ }));
    const notificacionVisible = (await screen.findByRole("heading", { name: "Álvaro Ruiz Gutiérrez canceló su cita" })).closest("article");
    expect(screen.getByRole("heading", { name: "Cancelaciones realizadas por clientes" })).toBeInTheDocument();
    expect(notificacionVisible).toHaveClass("cancelacion-cliente");
    expect(notificacionVisible).not.toHaveClass("requiere-contacto");
    expect(within(notificacionVisible).getByText("CANCELADA POR EL CLIENTE")).toBeInTheDocument();
    expect(notificacionVisible.querySelector("p")).toHaveTextContent("El cliente Álvaro Ruiz Gutiérrez con número 999999999 canceló su cita para el 7 de Agosto a las 09:00. El tramo de 09:00 a 09:45 ha quedado disponible.");
    expect(within(notificacionVisible).getByText("disponible")).toHaveClass("palabra-clave-notificacion");
    expect(notificacionVisible.querySelector("h2").querySelector(".palabra-clave-notificacion")).toBeNull();
    expect([...notificacionVisible.querySelector("p").querySelectorAll(".palabra-clave-notificacion")].map((elemento) => elemento.textContent)).toEqual(["Álvaro Ruiz Gutiérrez", "999999999", "7 de Agosto", "a las", "09:00", "disponible"]);
    await userEvent.click(
      screen.getByRole("button", { name: "Marcar como leída" }),
    );
    expect(notificacionesApi.marcarNotificacionLeida).toHaveBeenCalledWith(9);
    expect(await screen.findByText("Sin avisos pendientes")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Resueltas 1" }));
    await userEvent.click(screen.getByRole("button", { name: /Anteriores\s*1/ }));
    expect((await screen.findByRole("heading", { name: "Álvaro Ruiz Gutiérrez canceló su cita" })).closest("article")).toHaveClass("leida");
  });

  it("presenta claramente una cancelación causada por un bloqueo parcial", async () => {
    const notificacion = {
      id: 10, tipo: "CITA_CANCELADA", titulo: "Aviso antiguo", mensaje: "Texto antiguo", leida: false,
      fechaCreacion: "2026-08-04T12:00:00", canceladaPor: "BARBERIA", nombreCliente: "Junior",
      telefonoCliente: "999999999", fechaInicio: "2026-08-04T18:15:00", fechaFin: "2026-08-04T19:00:00",
    };
    notificacionesApi.listarNotificaciones.mockResolvedValue([notificacion]);
    notificacionesApi.marcarNotificacionLeida.mockResolvedValue({ ...notificacion, leida: true });
    render(<PaginaNotificaciones />);
    const notificacionVisible = (await screen.findByRole("heading", { name: "Contactar con Junior por cambio de agenda" })).closest("article");
    expect(screen.getByRole("heading", { name: "Requieren contactar al cliente" })).toBeInTheDocument();
    expect(notificacionVisible).toHaveClass("requiere-contacto");
    expect(notificacionVisible).not.toHaveClass("cancelacion-cliente");
    expect(within(notificacionVisible).getByText("REQUIERE CONTACTAR AL CLIENTE")).toBeInTheDocument();
    expect(notificacionVisible.querySelector("h2").querySelector(".palabra-clave-notificacion")).toBeNull();
    expect(notificacionVisible.querySelector("p")).toHaveTextContent("Se canceló la cita de Junior con número 999999999 para el 4 de Agosto a las 18:15 al bloquear esa franja. Contacta con el cliente para avisarle.");
    expect([...notificacionVisible.querySelector("p").querySelectorAll(".palabra-clave-notificacion")].map((elemento) => elemento.textContent)).toEqual(["Junior", "999999999", "4 de Agosto", "a las", "18:15"]);
    await userEvent.click(screen.getByRole("button", { name: "Marcar cliente como avisado" }));
    expect(await screen.findByText("Sin avisos pendientes")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Resueltas 1" }));
    const resuelta = (await screen.findByRole("heading", { name: "Contactar con Junior por cambio de agenda" })).closest("article");
    expect(resuelta).toHaveClass("cliente-avisado", "leida");
    expect(within(resuelta).getByText("CLIENTE AVISADO")).toBeInTheDocument();
  });

  it("limita cada bloque a cinco notificaciones y permite plegarlo", async () => {
    const hoy = new Date();
    const fechaHoy = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, "0"), String(hoy.getDate()).padStart(2, "0")].join("-");
    notificacionesApi.listarNotificaciones.mockResolvedValue(Array.from({ length: 6 }, (_, indice) => ({
      id: 100 + indice, tipo: "AVISO_AGENDA", titulo: `Aviso ${indice + 1}`, mensaje: `Mensaje ${indice + 1}`, leida: false, fechaCreacion: `${fechaHoy}T${String(10 + indice).padStart(2, "0")}:00:00`,
    })));
    render(<PaginaNotificaciones />);
    const periodoHoy = await screen.findByRole("button", { name: /Hoy\s*6/ });
    expect(periodoHoy).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("article")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: "Ver 1 más" }));
    expect(screen.getAllByRole("article")).toHaveLength(6);
    await userEvent.click(periodoHoy);
    expect(periodoHoy).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("distingue una cancelación causada por cerrar el día completo", async () => {
    notificacionesApi.listarNotificaciones.mockResolvedValue([{
      id: 11, tipo: "CITA_CANCELADA", titulo: "Aviso", mensaje: "Se canceló al marcar ese día como descanso", leida: false,
      fechaCreacion: "2026-08-04T12:00:00", canceladaPor: "BARBERIA", nombreCliente: "Lidia",
      telefonoCliente: "605908608", fechaInicio: "2026-08-06T11:15:00", fechaFin: "2026-08-06T12:00:00",
    }]);
    render(<PaginaNotificaciones />);
    const notificacionVisible = (await screen.findByRole("heading", { name: "Contactar con Lidia por día de descanso" })).closest("article");
    expect(notificacionVisible).toHaveClass("requiere-contacto");
    expect(notificacionVisible.querySelector("p")).toHaveTextContent("Se canceló la cita de Lidia con número 605908608 para el 6 de Agosto a las 11:15 al marcar ese día como descanso. Contacta con el cliente para avisarle.");
  });
});
