package com.barberiamimi.gestioncitas.dto.solicitud;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record SolicitudRutinaSemanal(
 @NotNull @Positive Long profesionalId,
 @NotNull @Size(max=14) List<@Valid TramoRutinaSolicitud> tramos,
 @Min(5) @Max(180) Integer intervaloMinutos,
 @Min(1) @Max(365) Integer diasAntelacionReserva) {}
