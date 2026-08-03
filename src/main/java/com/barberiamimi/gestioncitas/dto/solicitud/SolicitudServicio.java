package com.barberiamimi.gestioncitas.dto.solicitud;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record SolicitudServicio(@NotBlank @Size(max=120) String nombre,@Size(max=600) String descripcion,
 @NotNull @DecimalMin("0.00") BigDecimal precio,@NotNull @Min(1) @Max(1440) Integer duracionMinutos) {}
