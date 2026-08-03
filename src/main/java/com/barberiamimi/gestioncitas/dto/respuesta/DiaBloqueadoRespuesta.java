package com.barberiamimi.gestioncitas.dto.respuesta;
import java.time.*;
public record DiaBloqueadoRespuesta(Long id,Long profesionalId,LocalDate fecha,LocalTime horaInicio,LocalTime horaFin,String motivo) {}
