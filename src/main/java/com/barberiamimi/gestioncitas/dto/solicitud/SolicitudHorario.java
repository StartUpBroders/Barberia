package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
import java.time.*;
public record SolicitudHorario(@NotNull @Positive Long profesionalId,@NotNull DayOfWeek diaSemana,
 @NotNull LocalTime horaInicio,@NotNull LocalTime horaFin) {}
