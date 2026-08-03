package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
public record SolicitudCancelarCita(@NotBlank @Pattern(regexp="^[0-9+ ]{7,20}$") String telefonoCliente,
 @NotBlank @Pattern(regexp="^[0-9]{5}$") String codigoCancelacion) {}
