package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
public record SolicitudCambiarContrasena(@NotBlank @Size(min=10,max=200) String nuevaContrasena) {}
