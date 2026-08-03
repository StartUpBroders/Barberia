package com.barberiamimi.gestioncitas.dto.solicitud;
import com.barberiamimi.gestioncitas.enumeracion.EstadoCita;
import jakarta.validation.constraints.NotNull;
public record SolicitudCambiarEstadoCita(@NotNull EstadoCita estado,@jakarta.validation.constraints.Size(max=500) String motivo) {}
