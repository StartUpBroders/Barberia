package com.barberiamimi.gestioncitas.dto.respuesta;
import java.time.LocalDate;
import java.util.List;
public record DisponibilidadRespuesta(LocalDate fecha,ProfesionalRespuesta profesional,ServicioRespuesta servicio,List<TramoDisponibleRespuesta> horariosDisponibles) {}
