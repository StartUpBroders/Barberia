package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
public record SolicitudProfesional(@NotBlank @Size(max=100) String nombre,@Size(max=80) String alias) {}
