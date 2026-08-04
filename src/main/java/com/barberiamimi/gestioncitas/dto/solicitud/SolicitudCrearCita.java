package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
public record SolicitudCrearCita(
 @NotBlank @Size(max=100) String nombreCliente,
 @NotBlank @Pattern(regexp="^[0-9]{9}$", message="El móvil debe tener exactamente 9 cifras.") String telefonoCliente,
 @NotNull @Positive Long servicioId,
 @NotNull @Positive Long profesionalId,
 @NotNull @Future LocalDateTime fechaInicio,
 @Size(max=1000) String notaCliente) {}
