package com.barberiamimi.gestioncitas.dto.solicitud;

import jakarta.validation.constraints.*;

public record SolicitudPerfilBarberia(
 @NotBlank @Size(max=120) String nombre,
 @Pattern(regexp="^$|^[0-9+ ]{7,20}$") String telefono,
 @Size(max=120) String instagram,
 @Size(max=250) String direccion,
 @Size(max=1000) String urlGoogleMaps,
 boolean mostrarUbicacion) {}
