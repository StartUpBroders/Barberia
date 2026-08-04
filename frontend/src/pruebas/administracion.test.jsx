import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaginaCitas } from "../paginas/PaginaCitas";
import { PaginaServicios } from "../paginas/PaginaServicios";
import { PaginaNotificaciones } from "../paginas/PaginaNotificaciones";
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
  beforeEach(() => {
    citasApi.listarCitas.mockResolvedValue([cita]);
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
  });

  it("muestra solo confirmadas por día y el histórico en la agenda completa", async () => {
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
    render(<PaginaCitas />);
    expect(await screen.findByText("10/09/2030 · 10:00")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.queryByText("Luis")).not.toBeInTheDocument();
    expect(screen.queryByText("Reserva vieja")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Ver agenda completa" }),
    );
    expect(screen.getByText("Luis")).toBeInTheDocument();
    expect(screen.getByText("Pablo")).toBeInTheDocument();
    expect(screen.queryByText("Reserva vieja")).not.toBeInTheDocument();
  });

  it("no permite completar una cita manualmente", async () => {
    render(<PaginaCitas />);
    await screen.findByText("10/09/2030 · 10:00");
    expect(
      screen.queryByRole("button", { name: "Marcar completada" }),
    ).not.toBeInTheDocument();
  });

  it("crea una cita manual con Corte, Mimi y teléfono interno por defecto", async () => {
    citasApi.crearCitaAdministrativa.mockResolvedValue({ id: 8 });
    render(<PaginaCitas />);
    const usuario = userEvent.setup();
    await screen.findByText("10/09/2030 · 10:00");
    await usuario.click(screen.getByRole("button", { name: "+ Nueva cita" }));

    expect(screen.queryByLabelText(/Teléfono/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Servicio/)).toHaveValue("3");
    expect(screen.getByLabelText(/^Profesional \*$/)).toHaveValue("2");
    await usuario.type(screen.getByLabelText(/Nombre del cliente/), "Mario");
    const diasReserva = await screen.findByRole("group", {
      name: "Días disponibles para la cita manual",
    });
    await usuario.click(
      within(diasReserva).getByRole("button", { name: /10.*1 hueco/i }),
    );
    await usuario.click(
      screen.getByRole("button", { name: /11:00.*hasta 11:45/i }),
    );
    await usuario.click(screen.getByRole("button", { name: "Crear cita" }));

    await waitFor(() =>
      expect(citasApi.crearCitaAdministrativa).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreCliente: "Mario",
          telefonoCliente: "000000000",
          servicioId: 3,
          profesionalId: 2,
          fechaInicio: "2030-09-10T11:00:00",
        }),
        expect.any(String),
      ),
    );
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

  it("filtra y marca notificaciones como leídas", async () => {
    const notificacion = {
      id: 9,
      tipo: "CITA_CREADA",
      titulo: "Nueva cita",
      mensaje: "Se ha creado una cita",
      leida: false,
      citaId: 1,
      fechaCreacion: "2030-09-10T09:00:00",
    };
    notificacionesApi.listarNotificaciones.mockResolvedValue([notificacion]);
    notificacionesApi.marcarNotificacionLeida.mockResolvedValue({
      ...notificacion,
      leida: true,
    });
    render(<PaginaNotificaciones />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Marcar como leída" }),
    );
    expect(notificacionesApi.marcarNotificacionLeida).toHaveBeenCalledWith(9);
    await userEvent.click(screen.getByLabelText("Solo pendientes"));
    expect(screen.getByText("Todo al día")).toBeInTheDocument();
  });
});
