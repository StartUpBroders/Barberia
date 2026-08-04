package com.barberiamimi.gestioncitas.dto.solicitud;

import jakarta.validation.constraints.*;

public record SolicitudCrearProfesional(
 @NotBlank @Size(max=100) String nombre,
 @Size(max=80) String alias,
 @NotBlank @Size(min=3,max=40) @Pattern(regexp="^[A-Za-z0-9._-]+$", message="Solo puede contener letras, números, puntos, guiones y guiones bajos.") String nombreUsuario,
 @NotBlank @Size(min=10,max=200) String contrasena) {}
