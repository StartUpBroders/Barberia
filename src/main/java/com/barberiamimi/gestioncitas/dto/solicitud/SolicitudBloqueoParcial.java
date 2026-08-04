package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
import java.time.*;
public record SolicitudBloqueoParcial(@NotNull @Positive Long profesionalId,@NotNull @FutureOrPresent LocalDate fecha,
 @NotNull LocalTime horaInicio,@NotNull LocalTime horaFin,@Size(max=250) String motivo) {}
