package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
public record SolicitudCancelarCita(@NotBlank @Pattern(regexp="^[0-9]{9}$", message="El móvil debe tener exactamente 9 cifras.") String telefonoCliente,
 @NotBlank @Pattern(regexp="^[0-9]{5}$") String codigoCancelacion) {}
