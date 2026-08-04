package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public record SolicitudBloqueosParciales(@NotNull @Positive Long profesionalId,@NotNull @FutureOrPresent LocalDate fecha,
 @NotEmpty @Size(max=48) List<@Valid FranjaBloqueoSolicitud> tramos,@Size(max=250) String motivo) {}
