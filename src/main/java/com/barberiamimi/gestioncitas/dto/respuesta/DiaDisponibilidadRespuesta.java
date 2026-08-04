package com.barberiamimi.gestioncitas.dto.respuesta;
import java.time.LocalDate;
import java.util.List;
public record DiaDisponibilidadRespuesta(LocalDate fecha,boolean disponible,int cantidadHorarios,List<TramoDisponibleRespuesta> horariosDisponibles) {}
