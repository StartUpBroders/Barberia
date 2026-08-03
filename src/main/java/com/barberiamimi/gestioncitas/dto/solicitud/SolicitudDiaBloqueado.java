package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
import java.time.*;
public record SolicitudDiaBloqueado(@NotNull @Positive Long profesionalId,@NotNull LocalDate fecha,
 LocalTime horaInicio,LocalTime horaFin,@Size(max=250) String motivo) {}
