package com.barberiamimi.gestioncitas.dto.respuesta;
import com.barberiamimi.gestioncitas.enumeracion.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record CitaRespuesta(Long id,String barberia,String profesional,String servicio,BigDecimal precio,int duracionMinutos,
 LocalDateTime fechaInicio,LocalDateTime fechaFin,EstadoCita estado,CanceladaPor canceladaPor,String motivoCancelacion,LocalDateTime fechaCancelacion) {}
