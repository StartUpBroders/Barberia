package com.barberiamimi.gestioncitas.dto.respuesta;
import java.time.*;
public record HorarioRespuesta(Long id,Long profesionalId,DayOfWeek diaSemana,LocalTime horaInicio,LocalTime horaFin,boolean activo) {}
