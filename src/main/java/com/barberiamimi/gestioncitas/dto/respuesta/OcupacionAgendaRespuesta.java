package com.barberiamimi.gestioncitas.dto.respuesta;

import java.time.LocalDateTime;

public record OcupacionAgendaRespuesta(Long profesionalId,String profesional,String servicio,LocalDateTime fechaInicio,LocalDateTime fechaFin) {}
