package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
import java.time.*;
public record SolicitudDiaTrabajoEspecial(@NotNull @Positive Long profesionalId,@NotNull LocalDate fecha,
 @NotNull LocalTime horaInicio,@NotNull LocalTime horaFin) {}
