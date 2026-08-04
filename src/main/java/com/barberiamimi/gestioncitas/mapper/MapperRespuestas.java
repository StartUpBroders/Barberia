package com.barberiamimi.gestioncitas.mapper;
import com.barberiamimi.gestioncitas.dto.respuesta.*;
import com.barberiamimi.gestioncitas.entidad.*;
import org.springframework.stereotype.Component;

@Component
public class MapperRespuestas {
    public BarberiaRespuesta barberia(Barberia b){return new BarberiaRespuesta(b.getId(),b.getNombre(),b.getSlug(),b.getTelefono(),b.getInstagram(),b.getDireccion(),b.getUrlGoogleMaps(),b.isMostrarUbicacion(),b.isActiva(),b.getIntervaloMinutos(),b.getDiasAntelacionReserva());}
    public ProfesionalRespuesta profesional(Profesional p){return new ProfesionalRespuesta(p.getId(),p.getNombre(),p.getAlias(),p.isActivo());}
    public ServicioRespuesta servicio(Servicio s){return new ServicioRespuesta(s.getId(),s.getNombre(),s.getDescripcion(),s.getPrecio(),s.isActivo());}
    public CitaRespuesta cita(Cita c){return new CitaRespuesta(c.getId(),c.getNombreCliente(),c.getTelefonoCliente(),c.getNotaCliente(),c.getBarberia().getNombre(),c.getProfesional().getNombre(),c.getNombreServicioReservado(),c.getPrecioServicioReservado(),c.getDuracionServicioMinutosReservada(),c.getFechaInicio(),c.getFechaFin(),c.getEstado(),c.getCanceladaPor(),c.getMotivoCancelacion(),c.getFechaCancelacion());}
    public HorarioRespuesta horario(HorarioTrabajo h){return new HorarioRespuesta(h.getId(),h.getProfesional().getId(),h.getDiaSemana(),h.getHoraInicio(),h.getHoraFin(),h.isActivo());}
    public DiaBloqueadoRespuesta diaBloqueado(DiaBloqueado d){return new DiaBloqueadoRespuesta(d.getId(),d.getProfesional().getId(),d.getFecha(),d.getHoraInicio(),d.getHoraFin(),d.getMotivo());}
    public DiaTrabajoEspecialRespuesta diaTrabajoEspecial(DiaTrabajoEspecial d){return new DiaTrabajoEspecialRespuesta(d.getId(),d.getProfesional().getId(),d.getFecha(),d.getHoraInicio(),d.getHoraFin());}
    public NotificacionRespuesta notificacion(Notificacion n){return new NotificacionRespuesta(n.getId(),n.getTipo(),n.getTitulo(),n.getMensaje(),n.isLeida(),n.getCita()==null?null:n.getCita().getId(),n.getFechaCreacion(),n.getFechaLectura());}
}
