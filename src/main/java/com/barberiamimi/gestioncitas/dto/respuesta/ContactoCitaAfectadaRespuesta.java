package com.barberiamimi.gestioncitas.dto.respuesta;
import java.time.LocalDateTime;
public record ContactoCitaAfectadaRespuesta(Long citaId,String nombreCliente,String telefonoCliente,LocalDateTime fechaInicio,LocalDateTime fechaFin) {}
