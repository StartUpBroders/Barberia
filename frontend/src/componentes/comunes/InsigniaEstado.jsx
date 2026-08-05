const etiquetas = {
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Finalizado",
  CANCELADA_POR_CLIENTE: "Cancelada por cliente",
  CANCELADA_POR_BARBERIA: "Cancelada por barbería",
  RESERVADA: "Reserva antigua",
  NO_PRESENTADO: "No presentado",
};

export function InsigniaEstado({ estado }) {
  return (
    <span className={`insignia estado-${String(estado).toLowerCase()}`}>
      {etiquetas[estado] || String(estado).replaceAll("_", " ")}
    </span>
  );
}
