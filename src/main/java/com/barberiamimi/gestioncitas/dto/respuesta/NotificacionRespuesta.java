package com.barberiamimi.gestioncitas.dto.respuesta;
import com.barberiamimi.gestioncitas.enumeracion.TipoNotificacion;
import java.time.LocalDateTime;
public record NotificacionRespuesta(Long id,TipoNotificacion tipo,String titulo,String mensaje,boolean leida,Long citaId,LocalDateTime fechaCreacion,LocalDateTime fechaLectura) {}
