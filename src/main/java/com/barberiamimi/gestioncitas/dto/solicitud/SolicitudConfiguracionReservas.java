package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
public record SolicitudConfiguracionReservas(@NotNull @Min(5) @Max(180) Integer intervaloMinutos,
 @NotNull @Min(1) @Max(365) Integer diasAntelacionReserva) {}
