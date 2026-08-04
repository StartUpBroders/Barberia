package com.barberiamimi.gestioncitas.dto.respuesta;
import java.time.*;
public record DiaTrabajoEspecialRespuesta(Long id,Long profesionalId,LocalDate fecha,LocalTime horaInicio,LocalTime horaFin) {}
