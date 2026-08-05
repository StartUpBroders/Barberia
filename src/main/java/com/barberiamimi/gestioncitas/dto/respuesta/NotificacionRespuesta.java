package com.barberiamimi.gestioncitas.dto.respuesta;
import com.barberiamimi.gestioncitas.enumeracion.TipoNotificacion;
import com.barberiamimi.gestioncitas.enumeracion.CanceladaPor;
import java.time.LocalDateTime;
public record NotificacionRespuesta(Long id,TipoNotificacion tipo,String titulo,String mensaje,boolean leida,Long citaId,LocalDateTime fechaCreacion,LocalDateTime fechaLectura,CanceladaPor canceladaPor,String nombreCliente,String telefonoCliente,LocalDateTime fechaInicio,LocalDateTime fechaFin) {}
