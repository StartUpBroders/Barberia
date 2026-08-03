package com.barberiamimi.gestioncitas.dto.solicitud;
import com.barberiamimi.gestioncitas.enumeracion.RolUsuario;
import jakarta.validation.constraints.*;
public record SolicitudCrearUsuario(@NotBlank @Size(max=80) String nombreUsuario,@NotBlank @Size(min=10,max=200) String contrasena,@NotNull RolUsuario rol,@Positive Long profesionalId) {}
