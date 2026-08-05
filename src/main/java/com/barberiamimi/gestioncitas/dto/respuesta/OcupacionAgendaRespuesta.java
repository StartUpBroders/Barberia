package com.barberiamimi.gestioncitas.dto.respuesta;

import java.time.LocalDateTime;
import com.barberiamimi.gestioncitas.enumeracion.EstadoCita;

public record OcupacionAgendaRespuesta(Long profesionalId,String profesional,String nombreCliente,LocalDateTime fechaInicio,LocalDateTime fechaFin,EstadoCita estado) {}
