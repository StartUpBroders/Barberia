package com.barberiamimi.gestioncitas.dto.respuesta;
import java.time.LocalDate;
import java.util.List;
public record CalendarioDisponibilidadRespuesta(LocalDate desde,LocalDate hasta,int diasAntelacionReserva,List<DiaDisponibilidadRespuesta> dias) {}
