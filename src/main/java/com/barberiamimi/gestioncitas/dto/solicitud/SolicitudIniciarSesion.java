package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
public record SolicitudIniciarSesion(@NotBlank @Size(max=80) String nombreUsuario,@NotBlank @Size(max=200) String contrasena) {}
