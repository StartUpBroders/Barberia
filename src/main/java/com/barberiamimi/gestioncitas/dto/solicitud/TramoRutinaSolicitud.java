package com.barberiamimi.gestioncitas.dto.solicitud;

import jakarta.validation.constraints.NotNull;
import java.time.*;

public record TramoRutinaSolicitud(@NotNull DayOfWeek diaSemana,@NotNull LocalTime horaInicio,@NotNull LocalTime horaFin) {}
