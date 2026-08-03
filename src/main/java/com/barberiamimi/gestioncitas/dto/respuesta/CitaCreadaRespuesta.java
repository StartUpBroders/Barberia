package com.barberiamimi.gestioncitas.dto.respuesta;
import com.barberiamimi.gestioncitas.enumeracion.EstadoCita;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record CitaCreadaRespuesta(Long id,String barberia,String profesional,String servicio,BigDecimal precio,int duracionMinutos,
 LocalDateTime fechaInicio,LocalDateTime fechaFin,EstadoCita estado,String codigoCancelacion,String mensaje,boolean repetida) {}
