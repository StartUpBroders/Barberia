package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
public record FranjaBloqueoSolicitud(@NotNull LocalTime horaInicio,@NotNull LocalTime horaFin) {}
